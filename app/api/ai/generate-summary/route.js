// app/api/ai/generate-summary/route.js

import { generateGeminiResponse } from "../../../utils/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { jobRole, experienceLevel } = body;

    if (!jobRole) {
      return new Response(JSON.stringify({ error: "Job role is required" }), {
        status: 400,
      });
    }

    const experienceContext = experienceLevel ? ` with ${experienceLevel} experience` : '';
    const prompt = `Write a professional 3-4 sentence resume summary for a ${jobRole}${experienceContext}.
Example: Detail-oriented developer with a foundation in software building and problem-solving. Skilled in React and team collaboration.
Rules:
- Professional/ATS-friendly
- Max 4 lines
- Include key strengths and soft skills
- Return ONLY the summary text.`;
    const summary = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ summary }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
      status: 500,
    });
  }
}
