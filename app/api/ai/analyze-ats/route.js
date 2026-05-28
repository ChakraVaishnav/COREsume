// app/api/ai/analyze-ats/route.js
import { generateGeminiResponse } from "../../../utils/gemini";
import { authenticateRequest } from "@/lib/auth/session";
import { checkAtsLimit, incrementAts } from "@/lib/featureUsage";
import { parsePdfText } from "@/lib/pdfParser";
import {
  preprocessResumeText,
  countBullets,
  detectSpellingMistakes,
  buildFallbackAnalysis,
  calculateATSScore,
  buildFinalResponse
} from "@/lib/atsScorer";

export const runtime = "nodejs";

const isDebugLogsEnabled =
  process.env.ATS_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

const ANALYSIS_PROMPT = `You are an ATS analysis engine. Extract structured information from the resume.

Return ONLY valid JSON:

{
  "sections": {
    "summary": boolean,
    "experience": boolean,
    "skills": boolean,
    "education": boolean,
    "projects": boolean
  },
  "contacts": {
    "name": boolean,
    "email": boolean,
    "phone": boolean,
    "linkedin": boolean,
    "github": boolean
  },
  "totalBullets": number,
  "spellingErrors": number,
  "strengths": string[],
  "improvements": string[],
  "formattingTips": string[]
}

Rules:
- strengths: only real positives present
- improvements: ONLY include:
  1. missing sections (summary, experience, skills, education, projects)
  2. missing contacts (name, email, phone, linkedin, github)
- no keyword analysis
- no skill suggestions
- formattingTips only for clarity/readability/consistency issues
- max:
  strengths: 4
  improvements: 4
  formattingTips: 2
- no explanation, no markdown, JSON only`;

function debugLog(event, payload) {
  if (!isDebugLogsEnabled) return;
  console.info(event, payload);
}

function errorLog(event, payload) {
  console.error(event, payload);
}

export async function POST(req) {
  const requestId = `ats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return Response.json({ error: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const useCredit = formData.get("useCredit") === "true";

    const usageCheck = await checkAtsLimit(auth.userId);
    
    if (useCredit) {
      if (usageCheck.creditsRemaining < 3) {
        return Response.json({ 
          error: "INSUFFICIENT_CREDITS", 
          message: "You need at least 3 credits to analyze your resume." 
        }, { status: 403 });
      }
    } else {
      if (usageCheck.freeUsed >= usageCheck.freeLimit) {
        return Response.json({
          error: "Daily limit reached",
          creditsRequired: usageCheck.creditsRequired,
          resetTime: usageCheck.freeResetsAt,
          freeUsed: usageCheck.freeUsed,
          freeLimit: usageCheck.freeLimit
        }, { status: 403 });
      }
    }
    const file = formData.get("resume");
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    let resumeText = "";
    try {
      resumeText = await parsePdfText(file);
    } catch (pdfError) {
      errorLog("[ATS_ANALYZE_PDF_PARSE_FAILED]", { requestId, message: pdfError?.message });
      return Response.json({ error: "Failed to parse PDF file." }, { status: 400 });
    }

    if (!resumeText) return Response.json({ error: "Failed to extract resume text." }, { status: 400 });

    const { totalBullets, bulletsWithoutNumbers } = countBullets(resumeText);
    const detectedSpellingMistakes = await detectSpellingMistakes(resumeText);
    const preprocessedText = preprocessResumeText(resumeText);

    // Call Gemini using shared utility
    const prompt = `${ANALYSIS_PROMPT}\n\nResume text:\n${preprocessedText}`;
    let responseText = "";
    try {
      responseText = await generateGeminiResponse(prompt);
    } catch (llmError) {
      errorLog("[ATS_ANALYZE_LLM_FAILED]", { requestId, message: llmError?.message });
      const fallbackAnalysis = buildFallbackAnalysis(
        resumeText,
        totalBullets,
        bulletsWithoutNumbers,
        "AI analysis temporarily unavailable; showing estimated ATS score from resume structure."
      );

      const { score, tierLabel } = calculateATSScore(
        fallbackAnalysis,
        resumeText,
        totalBullets
      );
      await incrementAts(auth.userId, useCredit);
      return Response.json(
        buildFinalResponse({
          analysisData: fallbackAnalysis,
          score,
          tierLabel,
          detectedSpellingMistakes,
          isPremium: useCredit
        })
      );
    }

    let cleaning = responseText.trim();
    cleaning = cleaning.replace(/^```json/, '').replace(/```$/, '').trim();
    if (cleaning.startsWith('```')) cleaning = cleaning.substring(3).trim();
    if (cleaning.endsWith('```')) cleaning = cleaning.substring(0, cleaning.length - 3).trim();

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleaning);
    } catch (parseError) {
      errorLog("[ATS_ANALYZE_JSON_PARSE_FAILED]", { requestId, message: parseError?.message });
      const fallbackAnalysis = buildFallbackAnalysis(
        resumeText,
        totalBullets,
        bulletsWithoutNumbers,
        "AI response format was invalid; showing estimated ATS score from resume structure."
      );
      const { score, tierLabel } = calculateATSScore(
        fallbackAnalysis,
        resumeText,
        totalBullets
      );
      await incrementAts(auth.userId, useCredit);
      return Response.json(
        buildFinalResponse({
          analysisData: fallbackAnalysis,
          score,
          tierLabel,
          detectedSpellingMistakes,
          isPremium: useCredit
        })
      );
    }

    const {
      score,
      tierLabel,
      sectionCount,
      contactCount,
      totalBullets: effectiveBullets,
    } = calculateATSScore(analysisResult, resumeText, totalBullets);
    const finalResponse = buildFinalResponse({
      analysisData: analysisResult,
      score,
      tierLabel,
      detectedSpellingMistakes,
      isPremium: useCredit
    });

    debugLog("[ATS_ANALYZE_SUCCESS]", {
      requestId,
      atsScore: score,
      tier: tierLabel,
      sectionCount,
      contactCount,
      totalBullets: effectiveBullets,
    });
    await incrementAts(auth.userId, useCredit);
    return Response.json(finalResponse);

  } catch (err) {
    errorLog("[ATS_ANALYZE_FATAL]", { requestId, message: err?.message });
    return Response.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
