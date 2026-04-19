import { NextResponse } from 'next/server';
import { generateGeminiJsonResponse } from "../../../utils/gemini";
import { authenticateRequest } from "@/lib/auth/session";

export const runtime = "nodejs";

const EXTRACTION_PROMPT = `Extract resume data into JSON.
JSON Template:
{
  "personalInfo": {"name":"","email":"","phone":"","linkedin":"","github":"","portfolio":""},
  "appliedJob": "", "summary": "", "skills": "list\\n", "education": "desc",
  "experience": [{"role":"","company":"","duration":"","description":"bullets\\n"}],
  "projects": [{"name":"","description":"bullets\\n","link":""}],
  "achievements": "", "interests": "", "codingProfiles": [], "customSections": []
}
Rules:
- Identify URLs in parentheses for social/links.
- Use \\n for multi-line fields.
- Return ONLY minified JSON. No markdown.`;

const EXTRACTION_REPAIR_PROMPT = `Convert the following model output into strict valid minified JSON only.
Do not add commentary. Do not wrap in markdown fences.
If a field is missing, keep it with empty string/empty array as appropriate.
Schema:
{
  "personalInfo": {"name":"","email":"","phone":"","linkedin":"","github":"","portfolio":""},
  "appliedJob": "", "summary": "", "skills": "", "education": "",
  "experience": [{"role":"","company":"","duration":"","description":""}],
  "projects": [{"name":"","description":"","link":""}],
  "achievements": "", "interests": "", "codingProfiles": [], "customSections": []
}`;

function stripCodeFences(raw) {
  let text = String(raw || "").trim();
  text = text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
  return text;
}

function extractFirstJsonObject(raw) {
  const text = String(raw || "");
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (start === -1) {
      if (ch === "{") {
        start = i;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      depth += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return "";
}

function parseExtractionJson(raw) {
  const cleaned = stripCodeFences(raw);
  const candidates = [cleaned, extractFirstJsonObject(cleaned)].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error("INVALID_JSON_RESPONSE");
}

function preprocessResumeText(text) {
  let cleaned = String(text || "").replace(/\u0000/g, "").trim();
  if (cleaned.length > 18000) {
    cleaned = cleaned.slice(0, 18000);
  }
  return cleaned;
}

function extractFirstMatch(text, regex) {
  const match = String(text || "").match(regex);
  return match?.[1] ? String(match[1]).trim() : "";
}

function isLikelyHeading(line) {
  const normalized = String(line || "").trim().toLowerCase();
  return /^(summary|profile|objective|experience|work experience|education|skills|projects|achievements|interests|certifications|languages)\b/.test(normalized);
}

function extractSectionText(text, sectionRegex, maxLines = 12) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const startIndex = lines.findIndex((line) => sectionRegex.test(line.toLowerCase()));
  if (startIndex < 0) return "";

  const collected = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isLikelyHeading(line)) break;
    collected.push(line);
    if (collected.length >= maxLines) break;
  }

  return collected.join("\n").trim();
}

function guessNameFromText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  for (const line of lines) {
    if (line.length < 3 || line.length > 60) continue;
    if (/[@\d]/.test(line)) continue;
    if (isLikelyHeading(line)) continue;
    if (/resume|curriculum|vitae/i.test(line)) continue;
    return line;
  }

  return "";
}

function guessAppliedJob(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);

  for (const line of lines) {
    if (/\b(engineer|developer|analyst|manager|architect|intern|specialist|consultant|designer)\b/i.test(line)) {
      return line;
    }
  }

  return "";
}

function buildPartialResumeData(resumeText, reason = "") {
  const text = String(resumeText || "");

  const email = extractFirstMatch(text, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  const phone = extractFirstMatch(text, /(\+?\d[\d\s\-()]{7,}\d)/i);
  const linkedin = extractFirstMatch(text, /(https?:\/\/[^\s)\]]*linkedin\.com[^\s)\]]*)/i);
  const github = extractFirstMatch(text, /(https?:\/\/[^\s)\]]*github\.com[^\s)\]]*)/i);

  const allUrls = Array.from(text.matchAll(/(https?:\/\/[^\s)\]]+)/gi)).map((m) => m[1]);
  const portfolio = allUrls.find((url) => !/linkedin\.com|github\.com/i.test(url)) || "";

  const summary = extractSectionText(text, /^(summary|profile|objective)/i, 5);
  const skills = extractSectionText(text, /^skills?\b|^technical skills?\b/i, 10);
  const education = extractSectionText(text, /^education\b/i, 8);
  const experienceText = extractSectionText(text, /^(experience|work experience|employment)\b/i, 14);
  const projectsText = extractSectionText(text, /^projects?\b/i, 10);
  const achievements = extractSectionText(text, /^achievements?\b|^certifications?\b/i, 8);
  const interests = extractSectionText(text, /^interests?\b|^hobbies\b/i, 5);

  const codingProfiles = [];
  for (const url of allUrls) {
    if (/leetcode\.com|hackerrank\.com|codeforces\.com|codechef\.com|atcoder\.jp|kaggle\.com/i.test(url)) {
      codingProfiles.push({ platform: "", username: "", link: url });
    }
  }

  return {
    personalInfo: {
      name: guessNameFromText(text),
      email,
      phone,
      linkedin,
      github,
      portfolio,
    },
    appliedJob: guessAppliedJob(text),
    summary,
    skills,
    education,
    experience: [
      {
        role: "",
        company: "",
        duration: "",
        description: experienceText,
      },
    ],
    projects: [
      {
        name: "",
        description: projectsText,
        link: "",
      },
    ],
    achievements,
    interests,
    codingProfiles,
    customSections: [],
    _extractionMeta: {
      partial: true,
      reason: reason || "AI extraction fallback used",
    },
  };
}

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const { default: pdfParse } = await import("pdf-parse");
    const parsed = await pdfParse(Buffer.from(arrayBuffer));
    const resumeText = preprocessResumeText(String(parsed?.text || "").replace(/\s+\n/g, "\n"));

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json({ error: "Failed to read PDF content" }, { status: 400 });
    }

    try {
      // Call Gemini using shared utility
      const responseText = await generateGeminiJsonResponse(`${EXTRACTION_PROMPT}\n\nResume Text:\n${resumeText}`);

      let finalData;
      try {
        finalData = parseExtractionJson(responseText);
      } catch {
        const repairedText = await generateGeminiJsonResponse(
          `${EXTRACTION_REPAIR_PROMPT}\n\nModel Output:\n${responseText}`
        );
        finalData = parseExtractionJson(repairedText);
      }

      return NextResponse.json(finalData);
    } catch (aiError) {
      console.warn("AI extraction fallback to partial data:", aiError?.message || String(aiError));
      const partialData = buildPartialResumeData(resumeText, aiError?.message || "AI extraction failed");
      return NextResponse.json(partialData);
    }

  } catch (err) {
    console.error("AI Extraction error:", err);
    const message =
      err?.message === "INVALID_JSON_RESPONSE"
        ? "Failed to process resume with AI: Could not format extracted data. Please try again."
        : "Failed to process resume with AI: " + err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
