// app/api/ai/generate-skills/route.js

import { generateGeminiResponse } from "../../../utils/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { jobRole, experienceLevel } = body;

    if (!jobRole || !experienceLevel) {
      return new Response(JSON.stringify({ error: "Job role and experience level are required" }), {
        status: 400,
      });
    }

    const prompt = `List technical skills for a ${jobRole} (${experienceLevel} level). 
Example:
• Languages: Java, JS
• Web: HTML5, CSS3, React
• Backend: Node, Express

Rules:
- Categorized by bullet points (•)
- Professional/ATS-friendly
- Only include the list, no intro/outro.`;

    const skills = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ skills }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate skills" }), {
      status: 500,
    });
  }
} 