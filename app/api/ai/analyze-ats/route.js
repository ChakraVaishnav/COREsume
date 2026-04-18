// app/api/ai/analyze-ats/route.js
import { generateGeminiResponse } from "../../../utils/gemini";

// ─── Configuration ────────────────────────────────────────────────────────────

const isDebugLogsEnabled =
  process.env.ATS_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

// ─── LLM Prompt (DO NOT MODIFY STRUCTURE) ────────────────────────────────────

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
  "bulletsWithoutNumbers": number,
  "totalBullets": number,
  "spellingErrors": number,
  "strengths": string[],
  "improvements": string[],
  "formattingTips": string[]
}

Rules:
- strengths: only real positives present
- improvements: ONLY include:
  1. bullet points lacking numbers → suggest quantification
  2. missing sections (summary, experience, skills, education, projects)
  3. missing contacts (name, email, phone, linkedin, github)
- no keyword analysis
- no skill suggestions
- formattingTips only if quantification is weak
- max:
  strengths: 4
  improvements: 4
  formattingTips: 2
- no explanation, no markdown, JSON only`;

// ─── Logging ──────────────────────────────────────────────────────────────────

function debugLog(event, payload) {
  if (!isDebugLogsEnabled) return;
  console.info(event, payload);
}

function errorLog(event, payload) {
  console.error(event, payload);
}

// ─── PDF Parsing ──────────────────────────────────────────────────────────────

async function parsePdfTextFromBuffer(pdfBuffer) {
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const parsed = await pdfParse(pdfBuffer);
  return (parsed?.text || "").trim();
}

// ─── Preprocessing ───────────────────────────────────────────────────────────

function preprocessResumeText(text) {
  if (!text) return "";
  let cleaned = text.replace(/\n+/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/[^\w\s.@\-:/()&]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 5000).trim();
  }
  return cleaned;
}

// ─── Bullet Counting ──────────────────────────────────────────────────────────

function countBullets(rawText) {
  const lines = rawText.split(/\n/);
  const bulletLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length < 10) return false;
    if (/^[\-\•\●\◦\▪\▸\*\–\—\→\✓\➤\►\·]/.test(trimmed)) return true;
    if (/^\d+\./.test(trimmed)) return true;
    if (/^(Developed|Built|Created|Designed|Implemented|Led|Managed|Improved|Reduced|Increased|Optimized|Deployed|Integrated|Collaborated|Worked|Supported|Identified|Enhanced|Launched|Delivered|Maintained|Automated|Analyzed|Achieved|Established|Spearheaded)/i.test(trimmed)) return true;
    return false;
  });
  const bulletsWithoutNumbers = bulletLines.filter((line) => !/\d/.test(line)).length;
  return { totalBullets: bulletLines.length, bulletsWithoutNumbers };
}

// ─── Scoring Tier Logic ──────────────────────────────────────────────────────

function assignTier({ sectionCount, contactCount, ratio, spellingErrors, totalBullets }) {
  if (sectionCount === 5 && contactCount === 5 && ratio > 0.85 && spellingErrors === 0 && totalBullets >= 8) return 5;
  if (sectionCount >= 4 && contactCount >= 4 && ratio > 0.6 && spellingErrors <= 1) return 4;
  if (sectionCount >= 3 && contactCount >= 3 && ratio > 0.4) return 3;
  if (sectionCount >= 2) return 2;
  return 1;
}

const TIER_RANGES = {
  5: { min: 96, max: 100, label: "Elite" },
  4: { min: 86, max: 95,  label: "Strong" },
  3: { min: 71, max: 85,  label: "Good" },
  2: { min: 51, max: 70,  label: "Basic" },
  1: { min: 30, max: 50,  label: "Weak" },
};

function calculateATSScore(analysisData, totalBullets, llmUnquantified) {
  const sections = analysisData.sections || {};
  const contacts = analysisData.contacts || {};
  const spellingErrors = Number(analysisData.spellingErrors) || 0;
  const sectionCount = Object.values(sections).filter(Boolean).length;
  const contactCount = Object.values(contacts).filter(Boolean).length;
  const bulletsWithoutNumbers = Math.max(0, Number(llmUnquantified) || 0);
  const ratio = totalBullets === 0 ? 0 : Math.min(1, (totalBullets - bulletsWithoutNumbers) / totalBullets);

  const tier = assignTier({ sectionCount, contactCount, ratio, spellingErrors, totalBullets });
  const { min: tierMin, max: tierMax, label: tierLabel } = TIER_RANGES[tier];

  const quantBonus = Math.round(ratio * 5);
  const spellingBonus = spellingErrors === 0 ? 2 : 0;
  let score = tierMin + quantBonus + spellingBonus;
  score = Math.max(tierMin, Math.min(tierMax, score));

  if (totalBullets < 4) score -= 10;
  if (!sections.experience) score -= 15;
  if (bulletsWithoutNumbers > 0) score -= 5;
  if (score > 95 && totalBullets < 10) score = 96;
  score = Math.max(0, Math.min(92, Math.round(score)));

  return { score, tier, tierLabel, bulletsWithoutNumbers };
}

// ─── Response Builder ─────────────────────────────────────────────────────────

function buildFinalResponse({ analysisData, score, tierLabel }) {
  const spellingErrors = Number(analysisData.spellingErrors) || 0;
  return {
    atsScore: score,
    tier: tierLabel,
    summary: "",
    strengths: Array.isArray(analysisData.strengths) ? analysisData.strengths : [],
    improvements: Array.isArray(analysisData.improvements) ? analysisData.improvements : [],
    spellingMistakes: spellingErrors > 0 ? Array(spellingErrors).fill("Spelling/grammar error detected") : [],
    formattingTips: Array.isArray(analysisData.formattingTips) ? analysisData.formattingTips : [],
  };
}

// ─── Main Route Handler ──────────────────────────────────────────────────────

export async function POST(req) {
  const requestId = `ats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const formData = await req.formData();
    const file = formData.get("resume");
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const resumeText = await parsePdfTextFromBuffer(Buffer.from(arrayBuffer));
    if (!resumeText) return Response.json({ error: "Failed to extract resume text." }, { status: 400 });

    const { totalBullets, bulletsWithoutNumbers } = countBullets(resumeText);
    const preprocessedText = preprocessResumeText(resumeText);

    // Call Gemini using shared utility
    const prompt = `${ANALYSIS_PROMPT}\n\nResume text:\n${preprocessedText}`;
    const responseText = await generateGeminiResponse(prompt);

    let cleaning = responseText.trim();
    cleaning = cleaning.replace(/^```json/, '').replace(/```$/, '').trim();
    if (cleaning.startsWith('```')) cleaning = cleaning.substring(3).trim();
    if (cleaning.endsWith('```')) cleaning = cleaning.substring(0, cleaning.length - 3).trim();

    const analysisResult = JSON.parse(cleaning);
    const llmUnquantified = Number(analysisResult.bulletsWithoutNumbers) || 0;

    const { score, tierLabel } = calculateATSScore(analysisResult, totalBullets, llmUnquantified);
    const finalResponse = buildFinalResponse({ analysisData: analysisResult, score, tierLabel });

    debugLog("[ATS_ANALYZE_SUCCESS]", { requestId, atsScore: score, tier: tierLabel });
    return Response.json(finalResponse);

  } catch (err) {
    errorLog("[ATS_ANALYZE_FATAL]", { requestId, message: err?.message });
    return Response.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
