// app/api/ai/analyze-ats/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume in the provided PDF and return a JSON object with exactly this structure (do not include markdown, code fences, or extra text — only valid JSON):

{
  "atsScore": <number 0-100>,
  "summary": "<brief 1-2 sentence overall assessment>",
  "strengths": ["<genuine strength found in the resume — only what is actually present and good>", ...],
  "improvements": ["<see rules below>", ...],
  "spellingMistakes": ["<exact spelling/grammar mistake found>", ...],
  "formattingTips": ["<see rules below>", ...]
}

Rules you MUST follow:
- strengths: Only list things that are genuinely well done in the resume. Do NOT fabricate positives.
- improvements: ONLY flag these — nothing else:
    1. If any experience/achievement bullet points lack numbers or measurable impact, say which ones and suggest how to quantify them.
    2. If any of these ESSENTIAL SECTIONS are completely absent: Professional Summary, Work Experience, Skills, Education, Projects. List which ones are missing.
    3. If any of these CONTACT DETAILS are missing: Name, Email, Phone Number, LinkedIn profile, GitHub profile. List which ones are missing.
    Do NOT suggest adding new skills. Do NOT comment on whether links are working or clickable.
- spellingMistakes: List only actual spelling or grammar errors found in the resume text. If none, return [].
- formattingTips: ONLY include this if the impact quantification in experience/projects is poor or absent. If quantification is already good, return [].
- Do NOT include keyword analysis. Do NOT suggest removing or adding skills.
- ATS score should be calculated based on: presence of essential sections, contact detail completeness, quantified achievements, and spelling/grammar quality.`;

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let result = null;

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
        // Strip markdown code fences if present
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        result = JSON.parse(cleaned);
        break;
      } catch (err) {
        console.error(`Model ${modelName} failed:`, err.message);
      }
    }

    if (!result) {
      return Response.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
    }

    return Response.json(result);
  } catch (err) {
    console.error("ATS analyze error:", err);
    return Response.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
