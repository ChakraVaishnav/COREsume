// app/api/ai/quantify-experience/route.js

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
    const { description, jobRole, experienceLevel } = body;

    if (!description) {
      return new Response(JSON.stringify({ error: "Experience description is required" }), {
        status: 400,
      });
    }

    const prompt = `Quantify this work experience into 3-4 professional ATS bullet points:
"${description}" (Role: ${jobRole || 'Dev'}, Level: ${experienceLevel || 'Entry'})

Example:
• Built 5+ React apps, improving engagement by 30%
• Reduced latency by 40% through query optimization

Rules:
- High impact with metrics (%, numbers)
- Start with strong, unique action verbs
- One line per bullet
- Return ONLY bullets with the • symbol.`;

    const quantifiedDescription = await generateGeminiResponse(prompt);

    return new Response(JSON.stringify({ quantifiedDescription }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to quantify experience" }), {
      status: 500,
    });
  }
} 