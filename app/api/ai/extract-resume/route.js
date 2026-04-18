import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Import pdfjs-dist without the worker mechanism for Node environments
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    // Step 1: Extract Text Items
    const doc = await pdfjsLib.getDocument({ data: uint8Array, useSystemFonts: true }).promise;
    const allItems = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();

      content.items.forEach(item => {
        if (!item.str || item.str.trim() === '') return;
        allItems.push({
          text: item.str.trim(),
          x: item.transform[4],
          // offset y for multi-page to sort desc properly
          y: item.transform[5] + (10000 * (doc.numPages - pageNum)), 
          width: item.width,
          height: item.height,
          isBold: item.fontName ? item.fontName.toLowerCase().includes('bold') : false,
          hasEOL: item.hasEOL
        });
      });
    }

    // Step 2a: Clean and Group Text Items
    let totalChars = 0;
    let totalWidth = 0;
    allItems.forEach(item => {
      if (!item.isBold && !item.hasEOL) {
        totalChars += item.text.length;
        totalWidth += item.width;
      }
    });
    const avgCharWidth = totalChars > 0 ? (totalWidth / totalChars) : 5;

    allItems.forEach(it => { it.y = Math.round(it.y * 10) / 10; }); // round Y
    allItems.sort((a, b) => {
      if (b.y !== a.y) return b.y - a.y;
      return a.x - b.x;
    });

    const mergedItems = [];
    let current = null;
    for (const item of allItems) {
      if (!current) {
        current = { ...item };
        continue;
      }
      if (current.y === item.y) {
        const dist = item.x - (current.x + current.width);
        if (dist >= -4 && dist < avgCharWidth * 1.5) { // merge adjacent
          current.text += (dist > avgCharWidth * 0.4 ? ' ' : '') + item.text;
          current.width = (item.x + item.width) - current.x;
          current.isBold = current.isBold || item.isBold;
          continue;
        }
      }
      mergedItems.push(current);
      current = { ...item };
    }
    if (current) mergedItems.push(current);

    // Step 2b: Group into lines
    const linesMap = new Map();
    mergedItems.forEach(item => {
      if (!linesMap.has(item.y)) linesMap.set(item.y, []);
      linesMap.get(item.y).push(item);
    });

    const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
    const lines = sortedY.map(y => linesMap.get(y));

    // Step 3: Detect Sections
    const sections = { profile: [], education: [], work: [], skills: [], projects: [] };
    const SECTION_KEYWORDS = ["experience", "education", "skills", "projects", "work", "employment", "summary", "objective", "certifications", "awards", "publications", "volunteer", "languages", "interests", "activities", "profile"];
    
    let currentSection = 'profile';

    for (const line of lines) {
      let isHeader = false;
      const fullText = line.map(i => i.text).join(' ').trim();
      const textUpper = fullText.toUpperCase();

      // Primary heuristic
      if (line.length === 1 && line[0].isBold && fullText === textUpper && fullText.length > 3) {
        isHeader = true;
      } else {
        // Fallback heuristic
        if (SECTION_KEYWORDS.some(k => k.toUpperCase() === textUpper)) {
          isHeader = true;
        }
      }

      if (isHeader) {
        if (textUpper.includes('WORK') || textUpper.includes('EXPERIENCE') || textUpper.includes('EMPLOYMENT')) currentSection = 'work';
        else if (textUpper.includes('EDUCATION')) currentSection = 'education';
        else if (textUpper.includes('SKILL') || textUpper.includes('LANGUAGE')) currentSection = 'skills';
        else if (textUpper.includes('PROJECT')) currentSection = 'projects';
        else currentSection = 'profile'; 
        continue;
      }

      sections[currentSection].push(line);
    }

    // Feature scoring utility
    function findBest(lines, featuresFunc) {
      let bestItem = null;
      let maxScore = -Infinity;
      for (const line of lines) {
        for (const item of line) {
          const score = featuresFunc(item);
          if (score > maxScore) {
            maxScore = score;
            bestItem = item.text;
          }
        }
      }
      return maxScore > 0 ? bestItem : "";
    }

    // Spec output layout
    const output = {
      profile: { name: "", email: "", phone: "", location: "", url: "" },
      education: [],
      workExperience: [],
      skills: [],
      projects: []
    };

    // Step 4: PROFILE
    output.profile.name = findBest(sections.profile, (item) => {
      let s = 0;
      if (/^[a-zA-Z\s\.]+$/.test(item.text)) s += 3;
      if (item.isBold) s += 2;
      if (item.text.toUpperCase() === item.text) s += 2;
      if (item.text.includes('@')) s -= 4;
      if (/\d/.test(item.text)) s -= 4;
      if (item.text.includes(',')) s -= 4;
      if (item.text.includes('/')) s -= 4;
      return s;
    });

    output.profile.email = findBest(sections.profile, (item) => /\S+@\S+\.\S+/.test(item.text) ? 4 : 0);
    output.profile.phone = findBest(sections.profile, (item) => /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/.test(item.text) ? 4 : 0);
    output.profile.location = findBest(sections.profile, (item) => /[A-Z][a-zA-Z\s]+, [A-Z]{2}/.test(item.text) ? 4 : 0);
    output.profile.url = findBest(sections.profile, (item) => /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-z]+(\/\S*)?)/i.test(item.text) && !item.text.includes('@') ? 4 : 0);

    // SKILLS
    let allSkillsText = sections.skills.map(l => l.map(i => i.text).join(' ')).join('\n');
    output.skills = allSkillsText.split(/[,\|•\n]+/).map(s => s.trim()).filter(s => s.length > 0);

    // Step 4b Helper
    function splitSubsections(lines) {
      if (lines.length === 0) return [];
      const gaps = [];
      for (let i = 0; i < lines.length - 1; i++) {
        gaps.push(lines[i][0].y - lines[i+1][0].y);
      }
      gaps.sort((a,b) => a-b);
      const medianGap = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 12;

      const sub = [];
      let cur = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i > 0) {
          const gap = lines[i-1][0].y - line[0].y;
          const hasBold = line.some(it => it.isBold);
          if (gap > medianGap * 1.4 || hasBold) {
            sub.push(cur);
            cur = [];
          }
        }
        cur.push(line);
      }
      if (cur.length > 0) sub.push(cur);
      return sub;
    }

    const dateRegexStr = "(?:19|20)\\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Spring|Fall|Present";

    // EDUCATION
    const eduSubs = splitSubsections(sections.education);
    for (const sub of eduSubs) {
      output.education.push({
        school: findBest(sub, (item) => /College|University|School|Institute|Academy/i.test(item.text) ? +5 : 0),
        degree: findBest(sub, (item) => /Associate|Bachelor|Master|PhD|B\.Tech|B\.E|M\.Tech/i.test(item.text) ? +5 : 0),
        gpa: findBest(sub, (item) => /[0-4]\.\d{1,2}/.test(item.text) ? +4 : 0),
        date: findBest(sub, (item) => new RegExp(dateRegexStr, "i").test(item.text) && /\d{4}/.test(item.text) ? +4 : 0)
      });
    }

    // WORK
    const workSubs = splitSubsections(sections.work);
    for (const sub of workSubs) {
      const jobTitle = findBest(sub, (item) => /Engineer|Developer|Analyst|Intern|Manager|Designer|Architect|Lead|Consultant|Scientist/i.test(item.text) ? +5 : 0);
      const date = findBest(sub, (item) => new RegExp(dateRegexStr, "i").test(item.text) && /\d{4}/.test(item.text) ? +4 : 0);
      const company = findBest(sub, (item) => {
        if (item.text === jobTitle || item.text === date) return 0;
        if (item.isBold) return +3;
        return 0;
      });
      
      const descriptions = [];
      const exclude = [jobTitle.toLowerCase(), date.toLowerCase(), company.toLowerCase()];
      sub.forEach(line => {
        const txt = line.map(i=>i.text).join(' ');
        if (txt && !exclude.includes(txt.toLowerCase()) && txt.length > 15) {
          descriptions.push(txt.replace(/^[•\-\*]\s*/, ''));
        }
      });
      output.workExperience.push({ company, jobTitle, date, descriptions });
    }

    // PROJECTS
    const projSubs = splitSubsections(sections.projects);
    for (const sub of projSubs) {
      const date = findBest(sub, (item) => new RegExp(dateRegexStr, "i").test(item.text) && /\d{4}/.test(item.text) ? +4 : 0);
      const project = findBest(sub, (item) => {
        if (item.text === date) return 0;
        if (item.isBold) return +3;
        return +1;
      });
      
      const descriptions = [];
      const exclude = [project.toLowerCase(), date.toLowerCase()];
      sub.forEach(line => {
        const txt = line.map(i=>i.text).join(' ');
        if (txt && !exclude.includes(txt.toLowerCase()) && txt.length > 15) {
          descriptions.push(txt.replace(/^[•\-\*]\s*/, ''));
        }
      });
      output.projects.push({ project, date, descriptions });
    }

    // Standardize to Frontend UI expectations so it maps to the correct fields
    const finalData = {
      personalInfo: {
        name: output.profile.name,
        email: output.profile.email,
        phone: output.profile.phone,
        linkedin: output.profile.url.toLowerCase().includes("linkedin") ? output.profile.url : "",
        github: output.profile.url.toLowerCase().includes("github") ? output.profile.url : "",
        portfolio: !output.profile.url.toLowerCase().includes("linkedin") && !output.profile.url.toLowerCase().includes("github") ? output.profile.url : "",
      },
      appliedJob: "",
      summary: "",
      skills: output.skills.join("\\n"),
      education: output.education.map(e => `${e.degree || ''} at ${e.school || ''} (${e.date || ''}) ${e.gpa ? 'GPA: '+e.gpa : ''}`).join("\\n").trim(),
      experience: output.workExperience.map(w => ({
        role: w.jobTitle,
        company: w.company,
        duration: w.date,
        description: w.descriptions.map(d => "• " + d).join("\\n")
      })),
      projects: output.projects.map(p => ({
        name: p.project,
        description: p.descriptions.map(d => "• " + d).join("\\n"),
        link: ""
      })),
      achievements: "",
      interests: "",
      codingProfiles: [],
      customSections: []
    };

    return NextResponse.json(finalData);

  } catch (err) {
    console.error("Local Rules Extract error:", err);
    return NextResponse.json({ error: "Failed to extract resume data locally." }, { status: 500 });
  }
}
