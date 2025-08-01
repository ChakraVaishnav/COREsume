// app/api/ai/enhance-project-description/route.js

import { generateGeminiResponse } from "../../../utils/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectTitle, description, jobRole, experienceLevel } = body;

    if (!description) {
      return new Response(JSON.stringify({ error: "Project description is required" }), {
        status: 400,
      });
    }

               const prompt = `Enhance this project description to make it more professional, ATS-friendly, and recruiter-friendly:

           Project Title: "${projectTitle || 'Project'}"
           Original Description: "${description}"
           Job role: ${jobRole || 'Software Developer'}
           Experience level: ${experienceLevel || 'Entry level'}

                                               Transform it into 3-4 professional bullet points like this example:
             • Built a full-stack e-commerce platform with React.js and Node.js, incorporating user authentication and payment processing
             • Connected RESTful APIs and MongoDB database to manage product catalog and order management
             • Created responsive design principles ensuring optimal user experience across all devices
             • Launched the application through AWS services and achieved 99.9% uptime with automated CI/CD pipeline

                       Make each bullet point:
            - Professional and technical
            - ATS-friendly with relevant keywords
            - Easy to understand for recruiters
            - Highlight technical skills and technologies used
            - Show problem-solving and implementation details
            - Use diverse strong action verbs at the beginning (avoid repeating "implemented", "developed", "created")
            - Exactly ONE line per bullet point (no line breaks within bullet points)
            - Avoid repetitive words or phrases across different bullet points (no word should appear more than 2 times total)
            - Ensure perfect spelling and grammar
            - Keep each bullet point concise and impactful
            - Quantified where possible (performance improvements, user numbers, etc.)

           Return only the enhanced bullet points with the • symbol, no other text or explanations.`;

    const enhancedDescription = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ enhancedDescription }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error enhancing project description:", error);
    return new Response(JSON.stringify({ error: "Failed to enhance project description" }), {
      status: 500,
    });
  }
} 