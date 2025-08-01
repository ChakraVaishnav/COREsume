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

    const prompt = `Generate a comprehensive list of skills for a ${jobRole} with ${experienceLevel} experience level. 
    
    Format the response exactly like this example:
    • Programming Languages: Java, JavaScript
    • Web Development: HTML5, CSS3, JavaScript, React.js
    • Back-End Frameworks: Spring Boot
    • Databases: PostgreSQL, MySQL
    • Development Concepts: OOPS concepts, DBMS, DSA
    • Tools: Git (basic version control)
    
    Include relevant categories based on the job role. Common categories are:
    - Programming Languages
    - Web Development
    - Back-End Frameworks
    - Front-End Frameworks
    - Databases
    - Cloud Platforms
    - Development Concepts
    - Tools & Technologies
    
    Return only the formatted skills list with bullet points and categories, no other text or explanations.`;

    const skills = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ skills }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error generating skills:", error);
    return new Response(JSON.stringify({ error: "Failed to generate skills" }), {
      status: 500,
    });
  }
} 