// app/api/ai/analyze-ats/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Configuration ────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const isDebugLogsEnabled =
  process.env.ATS_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

/**
 * Model cascade (primary → fallback → last).
 * Per spec: gemini-2.5-flash-lite → gemini-2.5-flash → gemini-1.5-pro
 */
const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
];

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

// ─── Token Usage Tracker ──────────────────────────────────────────────────────

function createTokenUsageTracker() {
  return {
    totals: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    attempts: [],
  };
}

function addTokenUsage(tracker, usageEntry) {
  if (!tracker || !usageEntry) return;
  const promptTokens = Number(usageEntry.promptTokens) || 0;
  const completionTokens = Number(usageEntry.completionTokens) || 0;
  const totalTokens =
    Number(usageEntry.totalTokens) || promptTokens + completionTokens;
  tracker.totals.promptTokens += promptTokens;
  tracker.totals.completionTokens += completionTokens;
  tracker.totals.totalTokens += totalTokens;
  tracker.attempts.push({
    provider: "gemini",
    model: usageEntry.model,
    promptTokens,
    completionTokens,
    totalTokens,
  });
}

function logTokenUsage({ requestId, tokenUsageTracker }) {
  if (!tokenUsageTracker) return;
  debugLog("[ATS_TOKEN_USAGE]", {
    requestId,
    totals: tokenUsageTracker.totals,
    attempts: tokenUsageTracker.attempts,
  });
}

// ─── PDF Parsing ──────────────────────────────────────────────────────────────

async function parsePdfTextFromBuffer(pdfBuffer) {
  // Use internal parser module directly to avoid pdf-parse index debug side effects in Next bundling.
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const parsed = await pdfParse(pdfBuffer);
  return (parsed?.text || "").trim();
}

// ─── Preprocessing (Token Optimization) ──────────────────────────────────────

/**
 * Compress resume text for LLM consumption.
 * - Collapses whitespace
 * - Removes noisy characters (keeps letters, numbers, ., @, -, :)
 * - Normalises to single-line text
 * - Limits to ~5000 characters
 */
function preprocessResumeText(text) {
  if (!text) return "";
  let cleaned = text.replace(/\n+/g, " ");          // newlines → space
  cleaned = cleaned.replace(/\s+/g, " ");            // collapse whitespace
  cleaned = cleaned.replace(/[^\w\s.@\-:/()&]/g, " "); // remove noisy chars
  cleaned = cleaned.replace(/\s+/g, " ").trim();     // final collapse
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 5000).trim();
  }
  return cleaned;
}

// ─── Bullet Counting (Backend, from raw text) ─────────────────────────────────

/**
 * Count bullet points directly from the raw (pre-compression) resume text.
 * This is more reliable than letting the LLM count them.
 */
function countBullets(rawText) {
  const lines = rawText.split(/\n/);

  const bulletLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length < 10) return false;

    // Common bullet symbols (including unicode variants)
    if (/^[\-\•\●\◦\▪\▸\*\–\—\→\✓\➤\►\·]/.test(trimmed)) return true;

    // Numbered list (e.g. "1.")
    if (/^\d+\./.test(trimmed)) return true;

    // Action-verb sentences (resume bullets without symbols)
    if (
      /^(Developed|Built|Created|Designed|Implemented|Led|Managed|Improved|Reduced|Increased|Optimized|Deployed|Integrated|Collaborated|Worked|Supported|Identified|Enhanced|Launched|Delivered|Maintained|Automated|Analyzed|Achieved|Established|Spearheaded)/i.test(
        trimmed
      )
    )
      return true;

    return false;
  });

  const bulletsWithoutNumbers = bulletLines.filter(
    (line) => !/\d/.test(line)
  ).length;

  return {
    totalBullets: bulletLines.length,
    bulletsWithoutNumbers,
  };
}

// ─── Tier Assignment (Backend Judge) ─────────────────────────────────────────

/**
 * Assign a scoring tier based on section/contact completeness,
 * quantification ratio, and spelling errors.
 *
 * Tier 5 (Elite)  → 96–100
 * Tier 4 (Strong) → 86–95
 * Tier 3 (Good)   → 71–85
 * Tier 2 (Basic)  → 51–70
 * Tier 1 (Weak)   → 30–50
 */
function assignTier({ sectionCount, contactCount, ratio, spellingErrors, totalBullets }) {
  if (
    sectionCount === 5 &&
    contactCount === 5 &&
    ratio > 0.85 &&
    spellingErrors === 0 &&
    totalBullets >= 8
  ) {
    return 5;
  }
  if (
    sectionCount >= 4 &&
    contactCount >= 4 &&
    ratio > 0.6 &&
    spellingErrors <= 1
  ) {
    return 4;
  }
  if (sectionCount >= 3 && contactCount >= 3 && ratio > 0.4) {
    return 3;
  }
  if (sectionCount >= 2) {
    return 2;
  }
  return 1;
}

const TIER_RANGES = {
  5: { min: 96, max: 100, label: "Elite" },
  4: { min: 86, max: 95,  label: "Strong" },
  3: { min: 71, max: 85,  label: "Good" },
  2: { min: 51, max: 70,  label: "Basic" },
  1: { min: 30, max: 50,  label: "Weak" },
};

/**
 * Deterministic ATS score calculation.
 * LLM NEVER influences the score — only structural extraction data is used.
 *
 * Hybrid bullet strategy:
 *   - totalBullets          → backend-computed (reliable count from raw text)
 *   - bulletsWithoutNumbers → LLM-assessed   (semantically understands quantification;
 *                             backend regex can't distinguish "Led a team" from
 *                             "Reduced latency by 30ms" — LLM can)
 *
 * @param {object} analysisData       - LLM-extracted structural data
 * @param {number} totalBullets       - Backend-computed total bullet count
 * @param {number} llmUnquantified    - LLM-assessed count of unquantified bullets
 */
function calculateATSScore(analysisData, totalBullets, llmUnquantified) {
  const sections  = analysisData.sections  || {};
  const contacts  = analysisData.contacts  || {};
  const spellingErrors = Number(analysisData.spellingErrors) || 0;

  const sectionCount = Object.values(sections).filter(Boolean).length;
  const contactCount = Object.values(contacts).filter(Boolean).length;

  // Use LLM's count for quantification quality — it understands context.
  // Backend totalBullets is more reliable for sheer count.
  const bulletsWithoutNumbers = Math.max(0, Number(llmUnquantified) || 0);
  const ratio =
    totalBullets === 0
      ? 0
      : Math.min(1, (totalBullets - bulletsWithoutNumbers) / totalBullets);

  // ── Step 1: Assign tier ────────────────────────────────────────────────────
  const tier = assignTier({ sectionCount, contactCount, ratio, spellingErrors, totalBullets });
  const { min: tierMin, max: tierMax, label: tierLabel } = TIER_RANGES[tier];

  // ── Step 2: Compute score within tier ─────────────────────────────────────
  const quantBonus    = Math.round(ratio * 5);           // 0–5 bonus
  const spellingBonus = spellingErrors === 0 ? 2 : 0;   // +2 if no errors
  let score = tierMin + quantBonus + spellingBonus;

  // Clamp within tier range
  score = Math.max(tierMin, Math.min(tierMax, score));

  // ── Step 3: Apply strict penalties ────────────────────────────────────────
  if (totalBullets < 4)          score -= 10;  // too few bullets
  if (!sections.experience)      score -= 15;  // no experience section
  if (bulletsWithoutNumbers > 0) score -=  5;  // at least one unquantified bullet

  // Cap rule: score > 95 but totalBullets < 10
  if (score > 95 && totalBullets < 10) score = 96;

  // Final clamp 0–92 (no resume should ever be "perfect")
  score = Math.max(0, Math.min(92, Math.round(score)));

  return { score, tier, tierLabel, bulletsWithoutNumbers };
}

// ─── JSON Parsing ─────────────────────────────────────────────────────────────

function parseModelJson(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

// ─── Gemini API ───────────────────────────────────────────────────────────────

function summarizeGeminiError(err) {
  const message = err?.message || "Unknown Gemini error";
  const status =
    err?.status || err?.statusCode || err?.response?.status || null;
  const upperMessage = String(message).toUpperCase();
  const isQuotaOrRateLimit =
    status === 429 ||
    upperMessage.includes("429") ||
    upperMessage.includes("RESOURCE_EXHAUSTED") ||
    upperMessage.includes("RATE_LIMIT") ||
    upperMessage.includes("QUOTA");
  return { status, isQuotaOrRateLimit, message };
}

/**
 * Call a single Gemini model. Retries once on JSON parse failure.
 * If retry also fails, throws to trigger fallback in the model cascade.
 */
async function analyzeWithGemini({
  preprocessedText,
  modelName,
  requestId,
  tokenUsageTracker,
  retryCount = 0,
}) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `${ANALYSIS_PROMPT}\n\nResume text:\n${preprocessedText}`;

  const generationConfig = {
    temperature: 0, // determinism: no randomness
    // Disable thinking budget on flash models to reduce latency/tokens
    ...(modelName.includes("flash")
      ? { thinkingConfig: { thinkingBudget: 0 } }
      : {}),
  };

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
  });

  const usageMetadata = response?.response?.usageMetadata || {};
  addTokenUsage(tokenUsageTracker, {
    model: modelName,
    promptTokens: usageMetadata.promptTokenCount,
    completionTokens: usageMetadata.candidatesTokenCount,
    totalTokens: usageMetadata.totalTokenCount,
  });

  const text = response.response.text().trim();

  try {
    const parsed = parseModelJson(text);
    debugLog("[ATS_MODEL_SUCCESS]", { requestId, modelName, retryCount });
    return parsed;
  } catch (parseErr) {
    errorLog("[ATS_JSON_PARSE_FAILED]", {
      requestId,
      modelName,
      retryCount,
      error: parseErr.message,
    });

    // Retry once on the same model (spec §11: retry once, then fallback)
    if (retryCount === 0) {
      debugLog("[ATS_RETRY_PARSE]", { requestId, modelName });
      return analyzeWithGemini({
        preprocessedText,
        modelName,
        requestId,
        tokenUsageTracker,
        retryCount: 1,
      });
    }

    // Second failure → escalate to trigger next model in cascade
    throw parseErr;
  }
}

// ─── API Response Builder ─────────────────────────────────────────────────────

/**
 * Map the LLM analysis + backend score into the final API response shape.
 *
 * NOTE: atsScore and tier come ONLY from backend calculations.
 */
function buildFinalResponse({ analysisData, score, tierLabel }) {
  const spellingErrors = Number(analysisData.spellingErrors) || 0;
  return {
    atsScore: score,
    tier: tierLabel,
    summary: "", // optional; left empty per spec §12 note
    strengths: Array.isArray(analysisData.strengths)
      ? analysisData.strengths
      : [],
    improvements: Array.isArray(analysisData.improvements)
      ? analysisData.improvements
      : [],
    spellingMistakes: spellingErrors > 0
      ? Array(spellingErrors).fill("Spelling/grammar error detected")
      : [],
    formattingTips: Array.isArray(analysisData.formattingTips)
      ? analysisData.formattingTips
      : [],
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req) {
  const requestId = `ats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const tokenUsageTracker = createTokenUsageTracker();

  try {
    // ── Step 1: Receive & validate file ───────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("resume");
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // ── Step 2: Parse PDF → raw text ──────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer   = Buffer.from(arrayBuffer);
    const resumeText  = await parsePdfTextFromBuffer(pdfBuffer);

    if (!resumeText) {
      errorLog("[ATS_PDF_PARSE_FAILED]", { requestId });
      return Response.json(
        { error: "Failed to extract resume text." },
        { status: 400 }
      );
    }

    // ── Step 3: Count bullets from raw text (before compression) ─────────────
    const { totalBullets, bulletsWithoutNumbers } = countBullets(resumeText);
    debugLog("[ATS_BULLET_COUNT]", { requestId, totalBullets, bulletsWithoutNumbers });

    // ── Step 4: Preprocess & compress text for LLM ───────────────────────────
    const preprocessedText = preprocessResumeText(resumeText);
    if (!preprocessedText) {
      errorLog("[ATS_PREPROCESS_FAILED]", { requestId });
      return Response.json(
        { error: "Failed to preprocess resume." },
        { status: 400 }
      );
    }

    debugLog("[ATS_ANALYZE_START]", {
      requestId,
      size: file.size || null,
      models: GEMINI_MODELS,
      preprocessedLength: preprocessedText.length,
    });

    // ── Step 5: Send to LLM — model cascade (extractor only) ─────────────────
    let analysisResult = null;
    const modelErrors  = [];

    for (const modelName of GEMINI_MODELS) {
      try {
        analysisResult = await analyzeWithGemini({
          preprocessedText,
          modelName,
          requestId,
          tokenUsageTracker,
        });
        break; // success — stop cascade
      } catch (err) {
        const errorSummary = summarizeGeminiError(err);
        modelErrors.push({ modelName, ...errorSummary });
        errorLog("[ATS_MODEL_FAILED]", {
          requestId,
          modelName,
          status: errorSummary.status,
          isQuotaOrRateLimit: errorSummary.isQuotaOrRateLimit,
          message: errorSummary.message,
        });
      }
    }

    if (!analysisResult) {
      const quotaIssueDetected = modelErrors.some((e) => e.isQuotaOrRateLimit);
      errorLog("[ATS_ALL_MODELS_FAILED]", {
        requestId,
        quotaIssueDetected,
        modelErrors: modelErrors.map(({ modelName, status, isQuotaOrRateLimit, message }) => ({
          modelName, status, isQuotaOrRateLimit, message,
        })),
      });
      logTokenUsage({ requestId, tokenUsageTracker });
      return Response.json(
        { error: "AI analysis failed. Please try again." },
        { status: 500 }
      );
    }

    debugLog("[ATS_RAW_ANALYSIS]", { requestId, analysisResult });

    // Hybrid bullet values:
    //   totalBullets       → backend count (reliable)
    //   llmUnquantified    → LLM count (semantically accurate for quantification)
    const llmUnquantified = Number(analysisResult.bulletsWithoutNumbers) || 0;

    debugLog("[ATS_BULLET_HYBRID]", {
      requestId,
      backendTotalBullets: totalBullets,
      backendUnquantified: bulletsWithoutNumbers,
      llmTotalBullets: analysisResult.totalBullets,
      llmUnquantified,
      note: "backendTotalBullets + llmUnquantified used for scoring",
    });

    // ── Step 6: Backend computes tier + score ─────────────────────────────────
    const { score, tierLabel, bulletsWithoutNumbers: effectiveUnquantified } =
      calculateATSScore(analysisResult, totalBullets, llmUnquantified);

    debugLog("[ATS_SCORE_RESULT]", {
      requestId,
      score,
      tierLabel,
      totalBullets,
      effectiveUnquantified,
      ratio: totalBullets === 0 ? 0 : ((totalBullets - effectiveUnquantified) / totalBullets).toFixed(2),
      sectionCount: Object.values(analysisResult.sections || {}).filter(Boolean).length,
      contactCount: Object.values(analysisResult.contacts || {}).filter(Boolean).length,
      spellingErrors: analysisResult.spellingErrors,
    });

    // ── Step 7: Build and return final response ───────────────────────────────
    const finalResponse = buildFinalResponse({ analysisData: analysisResult, score, tierLabel });

    logTokenUsage({ requestId, tokenUsageTracker });
    debugLog("[ATS_ANALYZE_SUCCESS]", { requestId, atsScore: score, tier: tierLabel });
    return Response.json(finalResponse);
  } catch (err) {
    logTokenUsage({ requestId, tokenUsageTracker });
    errorLog("[ATS_ANALYZE_FATAL]", {
      requestId,
      message: err?.message || "Unknown fatal error",
      stack: err?.stack,
    });
    return Response.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
