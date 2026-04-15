// app/api/ai/analyze-ats/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groqApiKey = process.env.GROQ_API_KEY || "";
const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const BASE_PROMPT = `You are an ATS (Applicant Tracking System) expert. Analyze the resume and return a JSON object with exactly this structure (do not include markdown, code fences, or extra text - only valid JSON):

{
  "atsScore": <number 0-100>,
  "summary": "<brief 1-2 sentence overall assessment>",
  "strengths": ["<genuine strength found in the resume - only what is actually present and good>", ...],
  "improvements": ["<see rules below>", ...],
  "spellingMistakes": ["<exact spelling/grammar mistake found>", ...],
  "formattingTips": ["<see rules below>", ...]
}

Rules you MUST follow:
- strengths: Only list things that are genuinely well done in the resume. Do NOT fabricate positives.
- improvements: ONLY flag these - nothing else:
    1. If any experience/achievement bullet points lack numbers or measurable impact, say which ones and suggest how to quantify them.
    2. If any of these ESSENTIAL SECTIONS are completely absent: Professional Summary, Work Experience, Skills, Education, Projects. List which ones are missing.
    3. If any of these CONTACT DETAILS are missing: Name, Email, Phone Number, LinkedIn profile, GitHub profile. List which ones are missing.
    Do NOT suggest adding new skills. Do NOT comment on whether links are working or clickable.
- spellingMistakes: List only actual spelling or grammar errors found in the resume text. If none, return [].
- formattingTips: ONLY include this if the impact quantification in experience/projects is poor or absent. If quantification is already good, return [].
- Do NOT include keyword analysis. Do NOT suggest removing or adding skills.
- ATS score should be calculated based on: presence of essential sections, contact detail completeness, quantified achievements, and spelling/grammar quality.`;

function summarizeGeminiError(err) {
  const message = err?.message || "Unknown Gemini error";
  const status = err?.status || err?.statusCode || err?.response?.status || null;
  const upperMessage = String(message).toUpperCase();
  const isQuotaOrRateLimit =
    status === 429 ||
    upperMessage.includes("429") ||
    upperMessage.includes("RESOURCE_EXHAUSTED") ||
    upperMessage.includes("RATE_LIMIT") ||
    upperMessage.includes("QUOTA");

  return {
    status,
    isQuotaOrRateLimit,
    message,
  };
}

function summarizeGroqError(status, message) {
  const upperMessage = String(message || "").toUpperCase();
  const isQuotaOrRateLimit =
    status === 429 ||
    upperMessage.includes("429") ||
    upperMessage.includes("RATE_LIMIT") ||
    upperMessage.includes("QUOTA");

  return {
    status,
    isQuotaOrRateLimit,
    message: message || "Unknown Groq error",
  };
}

function parseModelJson(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function parsePdfTextFromBuffer(pdfBuffer) {
  // Use internal parser module directly to avoid pdf-parse index debug side effects in Next bundling.
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const parsed = await pdfParse(pdfBuffer);
  return (parsed?.text || "").trim();
}

async function analyzeWithGroq({ resumeText, requestId }) {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const groqPrompt = `${BASE_PROMPT}\n\nResume text:\n${resumeText}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [{ role: "user", content: groqPrompt }],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    const errorSummary = summarizeGroqError(res.status, bodyText);
    console.error("[ATS_GROQ_FAILED]", {
      requestId,
      model: groqModel,
      ...errorSummary,
    });
    const groqError = new Error(errorSummary.message);
    groqError.status = res.status;
    throw groqError;
  }

  const payload = await res.json();
  const outputText = payload?.choices?.[0]?.message?.content || "";
  const parsed = parseModelJson(outputText);

  console.info("[ATS_GROQ_SUCCESS]", {
    requestId,
    model: groqModel,
  });

  return parsed;
}

export async function POST(req) {
  const requestId = `ats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    const base64 = pdfBuffer.toString("base64");
    const prompt = `${BASE_PROMPT}\n\nAnalyze the resume in the provided PDF.`;

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let result = null;
    const modelErrors = [];

    console.info("[ATS_ANALYZE_START]", {
      requestId,
      fileName: file.name || "unknown",
      mimeType: file.type || "application/pdf",
      size: file.size || null,
      models,
    });

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent([
          {
            inlineData: {
              mimeType: file.type || "application/pdf",
              data: base64,
            },
          },
          prompt,
        ]);
        const text = response.response.text().trim();
        result = parseModelJson(text);

        console.info("[ATS_MODEL_SUCCESS]", {
          requestId,
          modelName,
        });
        break;
      } catch (err) {
        const errorSummary = summarizeGeminiError(err);
        modelErrors.push({ modelName, ...errorSummary });
        console.error("[ATS_MODEL_FAILED]", {
          requestId,
          modelName,
          ...errorSummary,
        });
      }
    }

    if (!result) {
      const quotaIssueDetected = modelErrors.some((e) => e.isQuotaOrRateLimit);
      console.error("[ATS_ALL_MODELS_FAILED]", {
        requestId,
        quotaIssueDetected,
        modelErrors,
      });

      try {
        const resumeText = await parsePdfTextFromBuffer(pdfBuffer);
        if (!resumeText) {
          console.error("[ATS_GROQ_SKIPPED_NO_TEXT]", { requestId });
          return Response.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
        }
        result = await analyzeWithGroq({ resumeText, requestId });
      } catch (groqErr) {
        console.error("[ATS_GROQ_FATAL]", {
          requestId,
          message: groqErr?.message || "Unknown Groq fallback error",
          status: groqErr?.status || null,
        });
        return Response.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
      }
    }

    console.info("[ATS_ANALYZE_SUCCESS]", { requestId });
    return Response.json(result);
  } catch (err) {
    console.error("[ATS_ANALYZE_FATAL]", {
      requestId,
      message: err?.message || "Unknown fatal error",
      stack: err?.stack,
    });
    return Response.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
