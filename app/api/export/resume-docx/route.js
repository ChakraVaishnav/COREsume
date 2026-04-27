import { NextResponse } from "next/server";
import HTMLtoDOCX from "html-to-docx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function splitLines(value) {
  return toText(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return toText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildFileName(data) {
  const rawName = toText(data?.personalInfo?.name || "resume").toLowerCase();
  const safeName = rawName.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "resume";
  return `${safeName}.docx`;
}

function textBlock(value) {
  return splitLines(value)
    .map((line) => `<p class="block">${escapeHtml(line)}</p>`)
    .join("");
}

function listBlock(items) {
  const rows = items.filter(Boolean).map((item) => `<li>${escapeHtml(item)}</li>`);
  return rows.length ? `<ul class="list">${rows.join("")}</ul>` : "";
}

function sectionHtml(title, content) {
  return `<section><h2>${escapeHtml(title)}</h2>${content}</section>`;
}

function buildHtml(resumeData) {
  const info = resumeData?.personalInfo || {};
  const fullName = toText(info.name) || "Resume";
  const appliedJob = toText(resumeData?.appliedJob);
  const contactParts = [info.email, info.phone, info.linkedin, info.github, info.portfolio]
    .map(toText)
    .filter(Boolean);

  const sections = [];

  sections.push(`
    <div class="header">
      <h1>${escapeHtml(fullName)}</h1>
      ${appliedJob ? `<p class="role">${escapeHtml(appliedJob)}</p>` : ""}
      ${contactParts.length ? `<p class="contact">${escapeHtml(contactParts.join(" | "))}</p>` : ""}
    </div>
  `);

  const summary = toText(resumeData?.summary);
  if (summary) sections.push(sectionHtml("Professional Summary", textBlock(summary)));

  const skills = toText(resumeData?.skills);
  if (skills) sections.push(sectionHtml("Skills", textBlock(skills)));

  const education = toText(resumeData?.education);
  if (education) sections.push(sectionHtml("Education", textBlock(education)));

  const experience = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
  const experienceHtml = experience
    .filter((item) => [item?.role, item?.company, item?.duration, item?.description].some((part) => toText(part)))
    .map((item) => {
      const titleParts = [toText(item.role), toText(item.company)].filter(Boolean);
      const duration = toText(item.duration);

      return `
        <div class="entry">
          ${titleParts.length ? `<h3>${escapeHtml(titleParts.join(" - "))}</h3>` : ""}
          ${duration ? `<p class="meta">${escapeHtml(duration)}</p>` : ""}
          ${textBlock(item.description)}
        </div>
      `;
    })
    .join("");
  if (experienceHtml) sections.push(sectionHtml("Experience", experienceHtml));

  const projects = Array.isArray(resumeData?.projects) ? resumeData.projects : [];
  const projectsHtml = projects
    .filter((item) => [item?.name, item?.description, item?.link].some((part) => toText(part)))
    .map((item) => {
      const projectName = toText(item.name);
      const link = toText(item.link);

      return `
        <div class="entry">
          ${projectName ? `<h3>${escapeHtml(projectName)}</h3>` : ""}
          ${textBlock(item.description)}
          ${link ? `<p class="meta">${escapeHtml(link)}</p>` : ""}
        </div>
      `;
    })
    .join("");
  if (projectsHtml) sections.push(sectionHtml("Projects", projectsHtml));

  const achievements = toText(resumeData?.achievements);
  if (achievements) sections.push(sectionHtml("Achievements", textBlock(achievements)));

  const interests = toText(resumeData?.interests);
  if (interests) sections.push(sectionHtml("Interests", textBlock(interests)));

  const codingProfiles = Array.isArray(resumeData?.codingProfiles) ? resumeData.codingProfiles : [];
  const codingRows = codingProfiles
    .map((item) => {
      const parts = [toText(item.platform), toText(item.username), toText(item.link)].filter(Boolean);
      return parts.join(" - ");
    })
    .filter(Boolean);
  if (codingRows.length) sections.push(sectionHtml("Coding Profiles", listBlock(codingRows)));

  const customSections = Array.isArray(resumeData?.customSections) ? resumeData.customSections : [];
  customSections.forEach((section) => {
    const title = toText(section?.title) || "Custom Section";
    const content = toText(section?.content);
    if (content) {
      sections.push(sectionHtml(title, textBlock(content)));
    }
  });

  if (!sections.length) {
    sections.push(`<p class="block">Resume data is empty.</p>`);
  }

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.45;
            color: #111827;
          }
          .header {
            text-align: center;
            margin-bottom: 18px;
          }
          h1 {
            font-size: 22pt;
            margin: 0 0 4px;
          }
          .role {
            font-size: 12pt;
            font-weight: 700;
            margin: 0 0 4px;
          }
          .contact {
            margin: 0;
            font-size: 10pt;
          }
          section {
            margin-bottom: 14px;
          }
          h2 {
            font-size: 12pt;
            margin: 0 0 6px;
            padding-bottom: 4px;
            border-bottom: 1px solid #d1d5db;
          }
          h3 {
            font-size: 11pt;
            margin: 0 0 4px;
          }
          .entry {
            margin-bottom: 10px;
          }
          .meta {
            font-style: italic;
            margin: 0 0 4px;
            color: #4b5563;
          }
          .block {
            margin: 0 0 6px;
            white-space: pre-wrap;
          }
          .list {
            margin: 0;
            padding-left: 18px;
          }
          .list li {
            margin: 0 0 4px;
          }
        </style>
      </head>
      <body>
        ${sections.join("")}
      </body>
    </html>
  `;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const resumeData = body?.data;

    if (!resumeData || typeof resumeData !== "object") {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 });
    }

    const resumeJson = JSON.stringify(resumeData);
    if (Buffer.byteLength(resumeJson, "utf8") > 2_000_000) {
      return NextResponse.json({ error: "Resume data too large" }, { status: 413 });
    }

    const docxBuffer = await HTMLtoDOCX(buildHtml(resumeData), null, {
      orientation: "portrait",
      margins: {
        top: 720,
        right: 720,
        bottom: 720,
        left: 720,
      },
      title: `${toText(resumeData?.personalInfo?.name || "Resume")}`,
      creator: "COREsume",
      lastModifiedBy: "COREsume",
    });

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${buildFileName(resumeData)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export/resume-docx] Failed to generate DOCX:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });
    return NextResponse.json({ error: "Failed to generate DOCX" }, { status: 500 });
  }
}
