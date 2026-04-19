import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const GEMINI_TIMEOUT_MS = Number(process.env.JOBS_AI_GEMINI_TIMEOUT_MS || 5000);
const GROQ_TIMEOUT_MS = Number(process.env.JOBS_AI_GROQ_TIMEOUT_MS || 4000);

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_KEY_MISSING");
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_KEY_MISSING");
  }

  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function batchAnalyzeJobs(resumeText, jobs) {
  const truncatedJobs = jobs.map((job, index) => ({
    index,
    jobTitle: job.jobTitle,
    companyName: job.companyName,
    description: job.jobDescription?.slice(0, 1600) || "",
    location: job.location || "",
    skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired : [],
  }));

  const prompt = `You are an ATS job match analyzer. Analyze all jobs
against the complete resume text. Return ONLY a valid JSON array.
No markdown. No explanation. No code blocks.

Resume Text (use as-is):
${resumeText}

Analyze ALL ${truncatedJobs.length} jobs and return a JSON array
with exactly ${truncatedJobs.length} objects in the SAME ORDER as input.

For each job return:
{
  "jobIndex": number,
  "matchScore": number (0-100),
  "fitLabel": "High Fit" OR "Moderate Fit" OR "Low Fit",
  "missingSkills": string[] (max 5),
  "strengths": string[] (max 5),
  "reasoning": "max 2 short lines",
  "keywordsToAdd": string[] (max 5 ATS keywords)
}

fitLabel rules (strictly follow):
  matchScore 70-100 → "High Fit"
  matchScore 40-69  → "Moderate Fit"
  matchScore 0-39   → "Low Fit"

Only include the required fields above. Do not include extra keys.

Jobs to analyze:
${JSON.stringify(truncatedJobs)}`;

  return await callLLM(prompt, "array");
}

async function callLLM(prompt, expectedShape = "object") {
  try {
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("GEMINI_TIMEOUT")), GEMINI_TIMEOUT_MS)
      ),
    ]);

    const text = result.response.text();
    return JSON.parse(cleanJson(text));
  } catch (geminiErr) {
    console.error("Gemini failed, trying Groq:", geminiErr?.message || geminiErr);
  }

  try {
    const groq = getGroqClient();
    const result = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("GROQ_TIMEOUT")), GROQ_TIMEOUT_MS)
      ),
    ]);

    const text = result.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(cleanJson(text));

    if (expectedShape === "array" && !Array.isArray(parsed)) {
      return parsed.jobs || parsed.results || parsed.data || [];
    }

    return parsed;
  } catch (groqErr) {
    console.error("Groq also failed:", groqErr?.message || groqErr);
    throw new Error("LLM_FAILED");
  }
}

function cleanJson(text) {
  if (!text || typeof text !== "string") {
    return "{}";
  }

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  return cleaned;
}
