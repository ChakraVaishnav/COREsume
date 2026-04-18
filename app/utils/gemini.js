// utils/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

export async function generateGeminiResponse(prompt) {
  let lastError = null;

  // Try Gemini models first
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`❌ Gemini ${modelName} failed:`, error.message);
      lastError = error;
    }
  }

  // Fallback to Groq if all Gemini models failed
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    console.info("🔄 Falling back to Groq...");
    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      });

      if (groqResponse.ok) {
        const data = await groqResponse.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          console.info("✅ Groq extraction successful.");
          return text;
        }
      } else {
        const errData = await groqResponse.json();
        console.error("❌ Groq API error:", errData.error?.message || groqResponse.statusText);
      }
    } catch (groqErr) {
      console.error("❌ Groq fallback failed:", groqErr.message);
    }
  }

  console.error("❌ All AI models (Gemini + Groq) failed.");
  throw lastError;
}
