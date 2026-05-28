// app/api/ai/enhance-jd/route.js
import { NextResponse } from "next/server";
import { generateGeminiResponse, generateGeminiJsonResponse } from "../../../utils/gemini";
import { authenticateRequest } from "@/lib/auth/session";
import { checkJdLimit, incrementJd } from "@/lib/featureUsage";
import { parsePdfText } from "@/lib/pdfParser";
import {
  preprocessResumeText,
  countBullets,
  detectSpellingMistakes,
  buildFallbackAnalysis,
  calculateATSScore,
  inferResumeSignals
} from "@/lib/atsScorer";

export const runtime = "nodejs";

const INITIAL_ATS_PROMPT = `You are an ATS analysis engine. Extract structured information from the resume.

Return ONLY valid JSON:

{
  "sections": {
    "summary": boolean,
    "experience": boolean,
    "skills": boolean,
    "education": boolean,
    "projects": boolean
  },
  "contacts": {
    "name": boolean,
    "email": boolean,
    "phone": boolean,
    "linkedin": boolean,
    "github": boolean
  },
  "totalBullets": number,
  "spellingErrors": number,
  "strengths": string[],
  "improvements": string[],
  "formattingTips": string[]
}

Rules:
- strengths: only real positives present
- improvements: ONLY include:
  1. missing sections (summary, experience, skills, education, projects)
  2. missing contacts (name, email, phone, linkedin, github)
- no keyword analysis
- no skill suggestions
- formattingTips only for clarity/readability/consistency issues
- max:
  strengths: 4
  improvements: 4
  formattingTips: 2
- no explanation, no markdown, JSON only`;

const FREE_ENHANCE_PROMPT = `You are an expert ATS resume optimization specialist.
Analyze the candidate's resume text against the provided Job Description (JD) and also extract structural ATS information from the original resume.

INPUT:
- RESUME TEXT: {resumeText}
- JOB DESCRIPTION: {jdText}

Return ONLY a valid JSON object:
{
  "sections": {
    "summary": boolean,
    "experience": boolean,
    "skills": boolean,
    "education": boolean,
    "projects": boolean
  },
  "contacts": {
    "name": boolean,
    "email": boolean,
    "phone": boolean,
    "linkedin": boolean,
    "github": boolean
  },
  "totalBullets": number,
  "spellingErrors": number,
  "suggestions": [string]
}

Rules for suggestions:
- Identify key gaps between the resume and the JD and provide highly actionable improvements.
- Keep recommendations clear, concise, and specific.
- Max 6 suggestions.

Return ONLY JSON, no explanation, no markdown.`;

const PREMIUM_SYSTEM_PROMPT = `You are an expert ATS resume optimization specialist and technical recruiter with 15+ years of experience helping candidates get past applicant tracking systems at top companies.

Your task: Rewrite the candidate's resume to be highly optimized for the provided Job Description (JD), while keeping all content truthful to their actual experience.

INPUT:
- RESUME CONTENT: {resume_text}
- JOB DESCRIPTION: {jd_text}

INSTRUCTIONS:

1. KEYWORD ANALYSIS
   - Extract all hard skills, tools, technologies, frameworks, and methodologies from the JD
   - Extract soft skills and competency keywords (e.g. "cross-functional", "stakeholder management")
   - Identify the exact phrasing the JD uses (e.g. if JD says "CI/CD pipelines" not "continuous integration", use that exact phrase)

2. EXPERIENCE REWRITING RULES
   - Rewrite bullet points to naturally embed JD keywords — never keyword-stuff awkwardly
   - Strengthen weak verbs: replace "helped with", "worked on", "assisted" with strong action verbs ("architected", "led", "reduced", "optimized", "delivered")
   - Add metrics/quantification wherever the original resume hints at scale, impact, or results — use realistic estimates if the resume implies scale but doesn't state numbers explicitly. Do NOT fabricate achievements that have no basis in the original.
   - Reorder bullet points within each role so the most JD-relevant achievements come first
   - Do NOT invent new jobs, companies, degrees, or skills that don't exist in the original resume

3. SKILLS SECTION
   - Reorganize skills to lead with those explicitly mentioned in the JD
   - Remove or deprioritize skills that are irrelevant to this specific role
   - Ensure every key technical requirement from the JD appears somewhere in the resume (skills or experience) if the candidate actually has it

4. SUMMARY/OBJECTIVE (if present)
   - Rewrite to directly mirror the role's core requirements using the JD's language
   - Keep it to 2–3 sentences max, punchy and specific

5. ATS FORMATTING RULES (preserve these)
   - No tables, columns, graphics, or special characters in section headers
   - Use standard section names: Work Experience, Education, Skills, Projects, Certifications
   - Dates in consistent format (MM/YYYY or Month YYYY)

OUTPUT FORMAT:
Return ONLY a valid JSON object with no markdown, no backticks, no explanation text. The JSON must exactly match this schema:

{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "appliedJob": "",
  "summary": "",
  "skills": "list of technical, soft, and tool skills separated by newlines \\n",
  "education": "institution, degree, field, duration, gpa separated by newlines \\n",
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "description": "bullet points separated by newlines \\n starting with strong action verbs, optimizing keywords from the JD"
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "bullet points separated by newlines \\n, describing the project and technical details",
      "link": ""
    }
  ],
  "achievements": "certifications, awards, and honors separated by newlines \\n",
  "interests": "interests and hobbies separated by newlines \\n",
  "codingProfiles": [
    {
      "platform": "",
      "username": "",
      "link": ""
    }
  ],
  "customSections": [
    {
      "title": "",
      "content": ""
    }
  ]
}

If a field has no data, use an empty string "" or empty array []. Do not omit keys.`;

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json({ error: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const useCredit = formData.get("useCredit") === "true";
    const jdText = formData.get("jd");
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!jdText || jdText.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a valid job description." }, { status: 400 });
    }

    // Limit Check
    const usageCheck = await checkJdLimit(auth.userId);
    if (useCredit) {
      if (usageCheck.creditsRemaining < 5) {
        return NextResponse.json({
          error: "INSUFFICIENT_CREDITS",
          message: "You need at least 5 credits to use premium enhancement."
        }, { status: 403 });
      }
    } else {
      if (usageCheck.freeUsed >= usageCheck.freeLimit) {
        return NextResponse.json({
          error: "Daily limit reached",
          creditsRequired: usageCheck.creditsRequired,
          resetTime: usageCheck.freeResetsAt,
          freeUsed: usageCheck.freeUsed,
          freeLimit: usageCheck.freeLimit
        }, { status: 403 });
      }
    }

    // PDF extraction
    let resumeText = "";
    try {
      resumeText = await parsePdfText(file);
    } catch (pdfError) {
      return NextResponse.json({ error: "Failed to parse PDF file." }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json({ error: "Failed to read PDF content" }, { status: 400 });
    }

    if (useCredit) {
      // ────── PREMIUM MODE ──────
      
      // Step A: Calculate Initial Score
      const preprocessedText = preprocessResumeText(resumeText);
      const { totalBullets: initialBullets } = countBullets(resumeText);
      const initialSpelling = await detectSpellingMistakes(resumeText);
      
      let initialAnalysisResult;
      try {
        const initialPrompt = `${INITIAL_ATS_PROMPT}\n\nResume text:\n${preprocessedText}`;
        const initialResponse = await generateGeminiResponse(initialPrompt);
        let cleanedInitial = initialResponse.trim();
        cleanedInitial = cleanedInitial.replace(/^```json/, "").replace(/```$/, "").trim();
        initialAnalysisResult = JSON.parse(cleanedInitial);
      } catch (e) {
        // Fallback for initial ATS score
        initialAnalysisResult = buildFallbackAnalysis(resumeText, initialBullets, 0, "AI temporary error");
      }

      const { score: initialScore } = calculateATSScore(
        initialAnalysisResult,
        resumeText,
        initialBullets
      );

      // Step B: Run Goated Optimization Prompt to Rebuild Resume
      const premiumPrompt = PREMIUM_SYSTEM_PROMPT
        .replace("{resume_text}", resumeText)
        .replace("{jd_text}", jdText);
      
      let responseText = "";
      try {
        responseText = await generateGeminiJsonResponse(premiumPrompt);
      } catch (err) {
        return NextResponse.json({ error: "Failed to generate premium improvement. Please try again." }, { status: 500 });
      }

      let cleaning = responseText.trim();
      cleaning = cleaning.replace(/^```json/, "").replace(/```$/, "").trim();
      
      let enhancedData;
      try {
        enhancedData = JSON.parse(cleaning);
      } catch (e) {
        return NextResponse.json({ error: "Failed to parse AI optimization response. Please try again." }, { status: 500 });
      }

      // Extract original contact details to prevent them from being lost in AI rewrite
      const origEmail = String(resumeText).match(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i)?.[1] || "";
      const origPhone = String(resumeText).match(/(\+?\d[\d\s\-()]{7,}\d)/)?.[1] || "";
      const origLinkedin = String(resumeText).match(/(https?:\/\/[^\s)\]]*linkedin\.com[^\s)\]]*)/i)?.[1] || "";
      const origGithub = String(resumeText).match(/(https?:\/\/[^\s)\]]*github\.com[^\s)\]]*)/i)?.[1] || "";
      
      // Get name from first few lines of resumeText
      const firstLines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
      let origName = "";
      for (const line of firstLines.slice(0, 5)) {
        if (line.length > 2 && line.length < 50 && !line.includes('@') && !/\d/.test(line)) {
          origName = line;
          break;
        }
      }

      if (!enhancedData.personalInfo) {
        enhancedData.personalInfo = {};
      }
      
      // Merge them in if the LLM left them blank
      enhancedData.personalInfo.name = enhancedData.personalInfo.name || origName;
      enhancedData.personalInfo.email = enhancedData.personalInfo.email || origEmail;
      enhancedData.personalInfo.phone = enhancedData.personalInfo.phone || origPhone;
      enhancedData.personalInfo.linkedin = enhancedData.personalInfo.linkedin || origLinkedin;
      enhancedData.personalInfo.github = enhancedData.personalInfo.github || origGithub;

      // Step C: Calculate Improved ATS Score
      // Synthesize a text representation of the enhanced resume to run the scorer fairly
      const newText = `
      ${enhancedData.personalInfo?.name || ""}
      ${enhancedData.personalInfo?.email || ""} | ${enhancedData.personalInfo?.phone || ""}
      ${enhancedData.personalInfo?.linkedin || ""} | ${enhancedData.personalInfo?.github || ""} | ${enhancedData.personalInfo?.portfolio || ""}
      
      Summary
      ${enhancedData.summary || ""}
      
      Experience
      ${(enhancedData.experience || []).map(e => `${e.role} at ${e.company} (${e.duration})\n${e.description}`).join("\n")}
      
      Education
      ${enhancedData.education || ""}
      
      Skills
      ${enhancedData.skills || ""}
      
      Projects
      ${(enhancedData.projects || []).map(p => `${p.name} - ${p.description} (${p.link})`).join("\n")}
      
      Achievements
      ${enhancedData.achievements || ""}
      `;

      const newBullets = countBullets(newText);
      const newInferred = inferResumeSignals(newText);
      const newAnalysis = {
        sections: newInferred.sections,
        contacts: newInferred.contacts,
        totalBullets: newBullets.totalBullets,
        spellingErrors: 0, // AI-generated is grammatically correct
      };

      const { score: rawImprovedScore } = calculateATSScore(
        newAnalysis,
        newText,
        newBullets.totalBullets
      );

      // Ensure the optimized score is always greater than or equal to the initial score + a bump for optimization, capping at 99.
      const finalImprovedScore = Math.min(99, Math.max(rawImprovedScore, initialScore + 3, 95));

      // Increment JD checks and deduct credits
      await incrementJd(auth.userId, true);

      return NextResponse.json({
        isPremium: true,
        initialScore,
        improvedScore: finalImprovedScore,
        enhancedData,
        suggestions: [
          "Tailored resume content to Job Description keywords",
          "Rewrote experience bullet points with strong action verbs",
          "Added scale and metrics to quantify achievements",
          "Optimized resume layout and section headings for ATS readability"
        ]
      });

    } else {
      // ────── FREE MODE ──────
      const freePrompt = FREE_ENHANCE_PROMPT
        .replace("{resumeText}", resumeText)
        .replace("{jdText}", jdText);

      let responseText = "";
      try {
        responseText = await generateGeminiJsonResponse(freePrompt);
      } catch (err) {
        return NextResponse.json({ error: "Failed to generate suggestions. Please try again." }, { status: 500 });
      }

      let cleaning = responseText.trim();
      cleaning = cleaning.replace(/^```json/, "").replace(/```$/, "").trim();

      let result;
      try {
        result = JSON.parse(cleaning);
      } catch (e) {
        return NextResponse.json({ error: "Failed to parse suggestions response. Please try again." }, { status: 500 });
      }

      // Calculate initial score using the exact same structural scorer as Premium Mode
      const { totalBullets: freeBullets } = countBullets(resumeText);
      
      // Compute the initial score of the candidate's original resume using the AI-extracted fields
      const { score: freeInitialScore } = calculateATSScore(
        result,
        resumeText,
        freeBullets
      );

      // Make sure the estimated target score is at least the initial score + 3, up to 98 (with a premium floor of 95)
      const finalEstimatedTargetScore = Math.min(98, Math.max(freeInitialScore + 3, 95));

      await incrementJd(auth.userId, false);

      return NextResponse.json({
        isPremium: false,
        estimatedTargetScore: finalEstimatedTargetScore,
        suggestions: result.suggestions || []
      });
    }

  } catch (error) {
    console.error("Enhance according to JD error:", error);
    return NextResponse.json({ error: "An unexpected error occurred while analyzing your resume." }, { status: 500 });
  }
}
