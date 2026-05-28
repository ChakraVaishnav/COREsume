// lib/atsScorer.js
import { prisma } from './prisma';

let spellCheckerPromise = null;

async function getSpellChecker() {
  if (!spellCheckerPromise) {
    spellCheckerPromise = (async () => {
      const [{ default: nspell }, { default: dictionary }] = await Promise.all([
        import("nspell"),
        import("dictionary-en"),
      ]);

      const dict = await new Promise((resolve, reject) => {
        dictionary((err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });

      return nspell(dict);
    })().catch((err) => {
      spellCheckerPromise = null;
      throw err;
    });
  }

  return spellCheckerPromise;
}

const TECH_WORD_ALLOWLIST = new Set([
  "api",
  "apis",
  "aws",
  "azure",
  "backend",
  "css",
  "docker",
  "frontend",
  "gcp",
  "github",
  "gitlab",
  "graphql",
  "html",
  "javascript",
  "kubernetes",
  "linkedin",
  "mongodb",
  "mysql",
  "nextjs",
  "nodejs",
  "postgresql",
  "react",
  "redis",
  "rest",
  "seo",
  "sql",
  "typescript",
  "ui",
  "ux",
  "allow",
  "star",
]);

export async function detectSpellingMistakes(rawText, maxCount = 8) {
  try {
    const spell = await getSpellChecker();
    const candidates = String(rawText || "").match(/[A-Za-z][A-Za-z'-]{2,}/g) || [];
    const seen = new Set();
    const mistakes = [];

    for (const token of candidates) {
      const word = token.replace(/^'+|'+$/g, "");
      const lower = word.toLowerCase();

      if (lower.length < 3) continue;
      if (seen.has(lower)) continue;
      seen.add(lower);

      if (TECH_WORD_ALLOWLIST.has(lower)) continue;
      if (/\d/.test(lower)) continue;
      if (/^[A-Z]{2,}$/.test(word)) continue;

      if (!spell.correct(lower)) {
        const suggestion = spell.suggest(lower)?.[0];
        mistakes.push(suggestion ? `${word} -> ${suggestion}` : word);
        if (mistakes.length >= maxCount) break;
      }
    }

    return mistakes;
  } catch (err) {
    console.error("[ATS_SPELLCHECK_FAILED]", { message: err?.message || String(err) });
    return [];
  }
}

export function preprocessResumeText(text) {
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

export function countBullets(rawText) {
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

export function buildFallbackAnalysis(resumeText, totalBullets, bulletsWithoutNumbers, reason) {
  return {
    sections: {
      summary: /\b(summary|profile|objective)\b/i.test(resumeText),
      experience: /\b(experience|employment|work history|internship)\b/i.test(resumeText),
      skills: /\bskills|technical skills|technologies\b/i.test(resumeText),
      education: /\beducation|university|college|b\.?tech|bachelor|master\b/i.test(resumeText),
      projects: /\bprojects|personal project|capstone\b/i.test(resumeText),
    },
    contacts: {
      name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(resumeText),
      email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resumeText),
      phone: /(\+?\d[\d\s\-()]{7,}\d)/.test(resumeText),
      linkedin: /linkedin\.com\//i.test(resumeText),
      github: /github\.com\//i.test(resumeText),
    },
    bulletsWithoutNumbers,
    totalBullets,
    spellingErrors: 0,
    strengths: ["Resume text extracted successfully"],
    improvements: [reason],
    formattingTips: [],
  };
}

export function inferResumeSignals(resumeText) {
  const text = String(resumeText || "");
  return {
    sections: {
      summary: /\b(summary|profile|objective|professional summary)\b/i.test(text),
      experience: /\b(experience|employment|work history|internship)\b/i.test(text),
      skills: /\bskills|technical skills|core skills|technologies\b/i.test(text),
      education: /\beducation|university|college|b\.?tech|bachelor|master|degree\b/i.test(text),
      projects: /\bprojects|personal project|capstone|portfolio\b/i.test(text),
    },
    contacts: {
      name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text),
      email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
      phone: /(\+?\d[\d\s\-()]{7,}\d)/.test(text),
      linkedin: /linkedin\.com\//i.test(text),
      github: /github\.com\//i.test(text),
    },
  };
}

export function deriveTierLabel(score) {
  if (score >= 92) return "Elite";
  if (score >= 82) return "Strong";
  if (score >= 68) return "Good";
  if (score >= 52) return "Basic";
  return "Weak";
}

export function calculateATSScore(analysisData, resumeText, localTotalBullets) {
  const llmSections = analysisData.sections || {};
  const llmContacts = analysisData.contacts || {};
  const inferred = inferResumeSignals(resumeText);

  const sections = {
    summary: Boolean(llmSections.summary || inferred.sections.summary),
    experience: Boolean(llmSections.experience || inferred.sections.experience),
    skills: Boolean(llmSections.skills || inferred.sections.skills),
    education: Boolean(llmSections.education || inferred.sections.education),
    projects: Boolean(llmSections.projects || inferred.sections.projects),
  };

  const contacts = {
    name: Boolean(llmContacts.name || inferred.contacts.name),
    email: Boolean(llmContacts.email || inferred.contacts.email),
    phone: Boolean(llmContacts.phone || inferred.contacts.phone),
    linkedin: Boolean(llmContacts.linkedin || inferred.contacts.linkedin),
    github: Boolean(llmContacts.github || inferred.contacts.github),
  };

  const sectionCount = Object.values(sections).filter(Boolean).length;
  const contactCount = Object.values(contacts).filter(Boolean).length;
  const spellingErrors = Math.max(0, Number(analysisData.spellingErrors) || 0);

  const llmTotalBullets = Math.max(0, Number(analysisData.totalBullets) || 0);
  const totalBullets = Math.max(0, Math.max(localTotalBullets || 0, llmTotalBullets));

  const sectionScore = (sectionCount / 5) * 52;
  const contactScore = (contactCount / 5) * 30;
  const bulletDepthScore = totalBullets >= 10 ? 12 : totalBullets >= 6 ? 8 : totalBullets >= 3 ? 4 : 1;

  const spellingPenalty = Math.min(12, spellingErrors * 2);
  const missingExperiencePenalty = sections.experience ? 0 : 8;

  let score = sectionScore + contactScore + bulletDepthScore - spellingPenalty - missingExperiencePenalty;

  // Floors to avoid unfairly low scores when structure is strong.
  if (sectionCount >= 4 && contactCount >= 4) {
    score = Math.max(score, 78);
  }
  if (sectionCount === 5 && contactCount >= 4 && totalBullets >= 6 && spellingErrors <= 1) {
    score = Math.max(score, 85);
  }
  if (sectionCount === 5 && contactCount === 5 && totalBullets >= 8 && spellingErrors === 0) {
    score = Math.max(score, 92);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const tierLabel = deriveTierLabel(score);

  return {
    score,
    tierLabel,
    totalBullets,
    sectionCount,
    contactCount,
  };
}

export function sanitizeImprovements(improvements) {
  if (!Array.isArray(improvements)) return [];

  const quantRegex = /(quantif|metric|measur|numbers?\b|impact\s+with\s+specific\s+numbers)/i;
  return improvements
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => !quantRegex.test(item));
}

export function buildFinalResponse({ analysisData, score, tierLabel, detectedSpellingMistakes = [], isPremium = false }) {
  if (!isPremium) {
    return {
      atsScore: score,
      tier: tierLabel,
      summary: "You are using the free analyzer. Upgrade to premium for detailed feedback on strengths, improvements, and spelling mistakes.",
      strengths: [],
      improvements: [],
      spellingMistakes: [],
      formattingTips: [],
      isFree: true
    };
  }

  const spellingErrors = Number(analysisData.spellingErrors) || 0;
  const llmSpellingMistakes = Array.isArray(analysisData.spellingMistakes)
    ? analysisData.spellingMistakes.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  let spellingMistakes = detectedSpellingMistakes.length > 0
    ? detectedSpellingMistakes
    : llmSpellingMistakes;

  if (spellingErrors > 0 && spellingMistakes.length > spellingErrors) {
    spellingMistakes = spellingMistakes.slice(0, spellingErrors);
  }

  return {
    atsScore: score,
    tier: tierLabel,
    summary: "",
    strengths: Array.isArray(analysisData.strengths) ? analysisData.strengths : [],
    improvements: sanitizeImprovements(analysisData.improvements),
    spellingMistakes,
    formattingTips: Array.isArray(analysisData.formattingTips) ? analysisData.formattingTips : [],
    isFree: false
  };
}
