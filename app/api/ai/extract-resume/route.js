import { NextResponse } from 'next/server';
import { generateGeminiResponse } from "../../../utils/gemini";
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
    const resumeText = String(parsed?.text || "").replace(/\s+\n/g, "\n").trim();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json({ error: "Failed to read PDF content" }, { status: 400 });
    }

    // Call Gemini using shared utility
    const responseText = await generateGeminiResponse(`${EXTRACTION_PROMPT}\n\nResume Text:\n${resumeText}`);
    
    // Clean JSON response (remove markdown if model included it)
    let jsonStr = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3).trim();
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3).trim();

    const finalData = JSON.parse(jsonStr);

    return NextResponse.json(finalData);

  } catch (err) {
    console.error("AI Extraction error:", err);
    return NextResponse.json({ error: "Failed to process resume with AI: " + err.message }, { status: 500 });
  }
}
