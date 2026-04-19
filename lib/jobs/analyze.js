import { batchAnalyzeJobs } from "@/lib/jobs/llm";

const ALLOWED_FIT_LABELS = new Set(["High Fit", "Moderate Fit", "Low Fit"]);

function normalizeFitLabel(matchScore) {
  if (matchScore >= 70) return "High Fit";
  if (matchScore >= 40) return "Moderate Fit";
  return "Low Fit";
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function analyzeJobs(resumeText, jobs) {
  let analysisResults = [];
  try {
    analysisResults = await batchAnalyzeJobs(resumeText, jobs);
  } catch (err) {
    console.error("Job analysis failed:", err?.message || err);
  }

  if (!Array.isArray(analysisResults)) {
    analysisResults = analysisResults?.jobs || analysisResults?.results || [];
  }

  const resultMap = new Map();
  for (const item of analysisResults) {
    if (!item || typeof item.jobIndex !== "number") {
      continue;
    }

    resultMap.set(item.jobIndex, item);
  }

  return jobs.map((job, index) => {
    const analysis = resultMap.get(index) || {};
    const matchScore = clampScore(analysis.matchScore);
    const keywordsToAdd = sanitizeList(analysis.keywordsToAdd, 5);

    return {
      ...job,
      matchScore,
      fitLabel: normalizeAiFitLabel(analysis.fitLabel, matchScore),
      missingSkills: sanitizeList(analysis.missingSkills, 5),
      strengths: sanitizeList(analysis.strengths, 5),
      reasoning: sanitizeReasoning(analysis.reasoning),
      keywordsToAdd,
      aiSummary: null,
      whyItMatches: null,
      resumeImprovements: keywordsToAdd,
    };
  });
}

function normalizeAiFitLabel(value, matchScore) {
  if (ALLOWED_FIT_LABELS.has(value)) {
    return value;
  }

  return normalizeFitLabel(matchScore);
}

function sanitizeList(items, max) {
  if (!Array.isArray(items)) {
    return [];
  }

  const cleaned = items
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .map((value) => value.replace(/\s+/g, " "));

  return [...new Set(cleaned)].slice(0, max);
}

function sanitizeReasoning(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  const lines = text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (lines.length > 0) {
    return lines.join("\n");
  }

  const sentenceParts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  return sentenceParts.join(" ");
}
