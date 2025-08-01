// app/api/ai/quantify-experience/route.js

import { generateGeminiResponse } from "../../../utils/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { description, jobRole, experienceLevel } = body;

    if (!description) {
      return new Response(JSON.stringify({ error: "Experience description is required" }), {
        status: 400,
      });
    }

    const prompt = `Transform this work experience description into 3-4 quantified, professional resume bullet points:

    Original description: "${description}"
    Job role: ${jobRole || 'Software Developer'}
    Experience level: ${experienceLevel || 'Entry level'}

    Format the response exactly like this example:
    • Built and maintained 5+ web applications with React.js, resulting in 30% improvement in user engagement
    • Managed a team of 3 developers to deliver a mobile app that increased customer satisfaction by 25%
    • Enhanced database queries reducing page load time by 40% and improving overall system performance
    • Coordinated with cross-functional teams to launch new features and resolve technical issues

    Make each bullet point:
    - Quantified with specific numbers, percentages, or metrics
    - Professional and action-oriented
    - Relevant to the job role
    - Optimized for Applicant Tracking Systems (ATS)
    - Use diverse strong action verbs at the beginning (avoid repeating "developed", "implemented", "created")
    - Exactly ONE line per bullet point (no line breaks within bullet points)
    - Avoid repetitive words or phrases across different bullet points (no word should appear more than 2 times total)
    - Ensure perfect spelling and grammar
    - Keep each bullet point concise and impactful

    Return only the bullet points with the • symbol, no other text or explanations.`;

    const quantifiedDescription = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ quantifiedDescription }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error quantifying experience:", error);
    return new Response(JSON.stringify({ error: "Failed to quantify experience" }), {
      status: 500,
    });
  }
} 