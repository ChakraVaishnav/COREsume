// app/api/ai/extract-resume/route.js
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

    const prompt = `You are a resume data extractor. Extract all information from the provided resume PDF and return a JSON object with exactly this structure (do not include markdown, code fences, or extra text — only valid JSON):

{
  "personalInfo": {
    "name": "<full name>",
    "email": "<email>",
    "phone": "<phone>",
    "linkedin": "<linkedin URL or empty string>",
    "github": "<github URL or empty string>",
    "portfolio": "<portfolio URL or empty string>"
  },
  "appliedJob": "<job title / target role if mentioned, else empty string>",
  "summary": "<professional summary or objective text, preserve line breaks with \\n>",
  "skills": "<all skills as a text block, use \\n to separate categories, use bullet points if present>",
  "education": "<education details as text, preserve formatting with \\n>",
  "experience": [
    {
      "role": "<job title>",
      "company": "<company name>",
      "duration": "<date range>",
      "description": "<job description, preserve bullet points with \\n• >"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<project description, preserve bullet points with \\n• >",
      "link": "<project URL or empty string>"
    }
  ],
  "achievements": "<achievements/awards text, preserve bullet points with \\n• >",
  "interests": "<interests/hobbies as text>",
  "codingProfiles": [
    {
      "platform": "<platform name e.g. LeetCode>",
      "username": "<username>",
      "link": "<profile URL>"
    }
  ],
  "customSections": []
}

If a field has no data, use an empty string "" or an empty array []. Extract every detail present in the resume accurately.`;

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
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        result = JSON.parse(cleaned);
        break;
      } catch (err) {
        console.error(`Model ${modelName} failed:`, err.message);
      }
    }

    if (!result) {
      return Response.json({ error: "AI extraction failed. Please try again." }, { status: 500 });
    }

    return Response.json(result);
  } catch (err) {
    console.error("Extract resume error:", err);
    return Response.json({ error: "Failed to extract resume data." }, { status: 500 });
  }
}
