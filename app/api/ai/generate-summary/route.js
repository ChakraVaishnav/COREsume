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
    const prompt = `Write a professional resume summary for a ${jobRole}${experienceContext}. 
    
    Format the response exactly like this example:
    Motivated and detail-oriented Computer Science undergraduate with a strong foundation in software development and problem-solving.
    Demonstrates leadership, adaptability, and a commitment to continuous learning. Experienced in academic projects and team collaboration,
    with a passion for building meaningful solutions and growing in a dynamic work environment.
    
    Make it:
    - Professional and formal
    - Optimized for Applicant Tracking Systems (ATS)
    - 3-4 sentences maximum
    - Highlight key strengths and qualities relevant to the job role
    - Include soft skills like leadership, adaptability, problem-solving
    - Mention experience level and passion for growth
    
    Return only the summary text, no other text or explanations, it should be in 3-4 lines no extras.`;
    const summary = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ summary }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
      status: 500,
    });
  }
}
