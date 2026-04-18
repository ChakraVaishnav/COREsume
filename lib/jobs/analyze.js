import { parseResume, batchAnalyzeJobs } from "@/lib/jobs/llm";

const MAX_LLM_ANALYSIS_JOBS = Number(process.env.JOBS_AI_MAX_LLM_ANALYSIS_JOBS || 12);
const RESUME_PARSE_SOFT_TIMEOUT_MS = Number(
  process.env.JOBS_AI_RESUME_PARSE_TIMEOUT_MS || 1200
);

const SKILL_TERMS = [
  "java",
  "javascript",
  "typescript",
  "html",
  "css",
  "react",
  "react.js",
  "nextjs",
  "next.js",
  "spring",
  "spring boot",
  "rest",
  "restful api",
  "jwt",
  "postgres",
  "postgresql",
  "mysql",
  "docker",
  "postman",
  "git",
  "github",
  "node",
  "nodejs",
  "node.js",
  "data structures",
  "algorithms",
  "oop",
  "dbms",
  "authentication",
  "authorization",
];

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
  const resumeProfile = await getResumeProfile(resumeText);
  const profileSkills = normalizeSkills(resumeProfile);
  const profileSkillSet = new Set(profileSkills);

  const heuristicResults = buildHeuristicResults(resumeProfile, jobs);
  const llmInputJobs = jobs.slice(0, Math.max(1, Math.min(jobs.length, MAX_LLM_ANALYSIS_JOBS)));

  let analysisResults;
  try {
    analysisResults = await batchAnalyzeJobs(resumeProfile, llmInputJobs);
  } catch (err) {
    console.error("Falling back to heuristic job analysis:", err?.message || err);
    analysisResults = null;
  }

  if (!Array.isArray(analysisResults)) {
    analysisResults = analysisResults?.jobs || analysisResults?.results || [];
  }

  if (!Array.isArray(analysisResults) || analysisResults.length === 0) {
    analysisResults = [];
  }

  const mergedResults = mergeResults(heuristicResults, analysisResults);

  return jobs.map((job, index) => {
    const jobText = [job.jobTitle, job.jobDescription, job.companyName, job.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const analysis = mergedResults.find((item) => item.jobIndex === index) || {};
    const matchScore = clampScore(analysis.matchScore);
    const safeMissingSkills = sanitizeMissingSkills(
      analysis.missingSkills,
      jobText,
      profileSkillSet
    );

    return {
      ...job,
      matchScore,
      fitLabel: analysis.fitLabel || normalizeFitLabel(matchScore),
      missingSkills: safeMissingSkills,
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      reasoning: typeof analysis.reasoning === "string" ? analysis.reasoning : "",
      aiSummary: typeof analysis.aiSummary === "string" ? analysis.aiSummary : null,
      whyItMatches: typeof analysis.whyItMatches === "string" ? analysis.whyItMatches : null,
      resumeImprovements: Array.isArray(analysis.resumeImprovements)
        ? analysis.resumeImprovements
        : [],
    };
  });
}

async function getResumeProfile(resumeText) {
  const local = localResumeParse(resumeText);

  try {
    const parsed = await Promise.race([
      parseResume(resumeText),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("RESUME_PARSE_TIMEOUT")), RESUME_PARSE_SOFT_TIMEOUT_MS)
      ),
    ]);

    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (err) {
    console.error("Falling back to local resume parser:", err?.message || err);
  }

  return local;
}

function localResumeParse(resumeText) {
  const text = String(resumeText || "");
  const skills = detectSkillsInText(text);

  return {
    skills,
    techStack: skills,
    yearsOfExperience: "",
    jobTitles: [],
    domains: [],
    education: "",
  };
}

function buildHeuristicResults(resumeProfile, jobs) {
  const profileSkills = normalizeSkills(resumeProfile);
  const profileSkillSet = new Set(profileSkills);

  return jobs.map((job, index) => {
    const text = [job.jobTitle, job.companyName, job.jobDescription, job.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const requiredByJob = detectSkillsInText(text);
    const matched = requiredByJob.filter((skill) => profileSkillSet.has(skill));
    const missing = requiredByJob.filter((skill) => !profileSkillSet.has(skill)).slice(0, 5);

    const lightOverlap = profileSkills.filter((skill) => hasTerm(text, skill));

    const rawScore =
      requiredByJob.length === 0
        ? lightOverlap.length > 0
          ? 65
          : 55
        : Math.round((matched.length / requiredByJob.length) * 100);

    const matchScore = Math.max(20, Math.min(95, rawScore));

    return {
      jobIndex: index,
      matchScore,
      fitLabel: normalizeFitLabel(matchScore),
      missingSkills: missing,
      strengths: matched.slice(0, 4),
      reasoning:
        requiredByJob.length > 0
          ? "Quick fit estimate based on job-required skills detected in the posting text."
          : "Quick fit estimate used because posting text has limited skill detail and AI provider response was slow.",
      aiSummary: `Estimated ${normalizeFitLabel(matchScore)} match for ${job.jobTitle || "this role"}.`,
      whyItMatches:
        matched.length > 0
          ? `Matched skills: ${matched.slice(0, 3).join(", ")}.`
          : "Limited overlap detected with the extracted resume skills.",
      resumeImprovements: [
        "Highlight relevant project outcomes with metrics.",
        "Add role-specific keywords from this job posting.",
        "Strengthen bullet points for tools used in production.",
      ],
    };
  });
}

function normalizeSkills(resumeProfile) {
  const combined = [
    ...(Array.isArray(resumeProfile?.skills) ? resumeProfile.skills : []),
    ...(Array.isArray(resumeProfile?.techStack) ? resumeProfile.techStack : []),
  ];

  const cleaned = detectSkillsInText(combined.join(" "));

  if (cleaned.length > 0) {
    return cleaned.slice(0, 24);
  }

  const fallback = combined
    .map((value) => String(value || "").trim().toLowerCase())
    .filter((value) => value.length >= 2)
    .map((value) => value.replace(/\s+/g, " "));

  return [...new Set(fallback)].slice(0, 24);
}

function sanitizeMissingSkills(missingSkills, jobText, profileSkillSet) {
  const inferredFromJob = detectSkillsInText(jobText);
  const fromModel = Array.isArray(missingSkills)
    ? missingSkills
        .map((value) => canonicalSkill(String(value || "").trim().toLowerCase()))
        .filter(Boolean)
    : [];

  const combined = [...new Set([...fromModel, ...inferredFromJob])];

  return combined
    .filter((skill) => hasTerm(jobText, skill))
    .filter((skill) => !profileSkillSet.has(skill))
    .slice(0, 5);
}

function detectSkillsInText(text) {
  const content = String(text || "").toLowerCase();
  const skills = [];

  for (const term of SKILL_TERMS) {
    if (hasTerm(content, term)) {
      const canonical = canonicalSkill(term);
      if (!skills.includes(canonical)) {
        skills.push(canonical);
      }
    }
  }

  return skills;
}

function canonicalSkill(term) {
  const value = String(term || "").toLowerCase();

  if (value === "react.js") return "react";
  if (value === "nextjs") return "next.js";
  if (value === "nodejs" || value === "node.js") return "node";
  if (value === "postgres") return "postgresql";

  return value;
}

function hasTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(String(text || ""));
}

function mergeResults(baseResults, llmResults) {
  const map = new Map(baseResults.map((item) => [item.jobIndex, item]));

  for (const item of llmResults) {
    if (!item || typeof item.jobIndex !== "number") {
      continue;
    }

    const existing = map.get(item.jobIndex) || {};
    map.set(item.jobIndex, {
      ...existing,
      ...item,
    });
  }

  return [...map.values()].sort((a, b) => a.jobIndex - b.jobIndex);
}
