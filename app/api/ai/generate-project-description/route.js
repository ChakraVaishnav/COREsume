// app/api/ai/generate-project-description/route.js

import { generateGeminiResponse } from "../../../utils/gemini";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/session";

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectTitle, jobRole, experienceLevel } = body;

    if (!projectTitle) {
      return new Response(JSON.stringify({ error: "Project title is required" }), {
        status: 400,
      });
    }

    const prompt = `Write 3-4 professional ATS bullet points for this project:
Project: "${projectTitle}" (Role: ${jobRole || 'Dev'}, Level: ${experienceLevel || 'Entry'})

Example:
• Built React/Node e-commerce site with Auth and Payments
• Optimized MongoDB queries for 40% faster product catalog loading

Rules:
- Professional/Technical tone
- Start with strong, unique action verbs
- One line per bullet
- Focus on tech stack, implementation, and results
- Return only bullets with the • symbol.`;

    const projectDescription = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ projectDescription }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate project description" }), {
      status: 500,
    });
  }
} 