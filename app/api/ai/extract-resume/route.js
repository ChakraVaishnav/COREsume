import { NextResponse } from 'next/server';
import { generateGeminiResponse } from "../../../utils/gemini";

const EXTRACTION_PROMPT = `Extract resume data into JSON.
JSON Template:
{
  "personalInfo": {"name":"","email":"","phone":"","linkedin":"","github":"","portfolio":""},
  "appliedJob": "", "summary": "", "skills": "list\\n", "education": "desc",
  "experience": [{"role":"","company":"","duration":"","description":"bullets\\n"}],
  "projects": [{"name":"","description":"bullets\\n","link":""}],
  "achievements": "", "interests": "", "codingProfiles": [], "customSections": []
}
Rules:
- Identify URLs in parentheses for social/links.
- Use \\n for multi-line fields.
- Return ONLY minified JSON. No markdown.`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // --- Advanced PDF Extraction (Text + Embedded Links) ---
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = ""; // Disable worker for server-side

    const doc = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      disableWorker: true,
      disableFontFace: true,
      standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
    }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const annotations = await page.getAnnotations();
      
      const links = annotations
        .filter(ann => ann.subtype === "Link" && ann.url)
        .map(ann => ({ url: ann.url, rect: ann.rect }));

      // Process items and check for link collisions
      for (const item of content.items) {
        if (!item.str || item.str.trim() === "") continue;
        
        let linkUrl = "";
        const [x, y] = [item.transform[4], item.transform[5]];
        
        for (const link of links) {
          if (x >= link.rect[0] - 5 && x <= link.rect[2] + 5 && 
              y >= link.rect[1] - 5 && y <= link.rect[3] + 5) {
            linkUrl = link.url;
            break;
          }
        }
        
        resumeText += item.str + (linkUrl ? ` (${linkUrl}) ` : " ");
      }
      resumeText += "\n";
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json({ error: "Failed to read PDF content" }, { status: 400 });
    }

    // Call Gemini using shared utility
    const responseText = await generateGeminiResponse(`${EXTRACTION_PROMPT}\n\nResume Text:\n${resumeText}`);
    
    // Clean JSON response (remove markdown if model included it)
    let jsonStr = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3).trim();
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3).trim();

    const finalData = JSON.parse(jsonStr);

    return NextResponse.json(finalData);

  } catch (err) {
    console.error("AI Extraction error:", err);
    return NextResponse.json({ error: "Failed to process resume with AI: " + err.message }, { status: 500 });
  }
}
