import { NextResponse } from "next/server";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

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

function buildFileName(data) {
  const rawName = toText(data?.personalInfo?.name || "resume").toLowerCase();
  const safeName = rawName.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "resume";
  return `${safeName}.docx`;
}

function createHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, bold: true })],
  });
}

function createTextParagraph(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    ...opts,
    children: [new TextRun({ text })],
  });
}

function pushMultiline(paragraphs, value) {
  const lines = splitLines(value);
  if (!lines.length) return;

  lines.forEach((line) => {
    paragraphs.push(createTextParagraph(line));
  });
}

function buildDocParagraphs(resumeData) {
  const paragraphs = [];
  const info = resumeData?.personalInfo || {};
  const fullName = toText(info.name) || "Resume";
  const appliedJob = toText(resumeData?.appliedJob);

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: fullName, bold: true, size: 34 })],
    })
  );

  if (appliedJob) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: appliedJob, italics: true, size: 24 })],
      })
    );
  }

  const contactParts = [info.email, info.phone, info.linkedin, info.github, info.portfolio]
    .map(toText)
    .filter(Boolean);

  if (contactParts.length) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: contactParts.join(" | ") })],
      })
    );
  }

  const summary = toText(resumeData?.summary);
  if (summary) {
    paragraphs.push(createHeading("Professional Summary"));
    pushMultiline(paragraphs, summary);
  }

  const skills = toText(resumeData?.skills);
  if (skills) {
    paragraphs.push(createHeading("Skills"));
    pushMultiline(paragraphs, skills);
  }

  const education = toText(resumeData?.education);
  if (education) {
    paragraphs.push(createHeading("Education"));
    pushMultiline(paragraphs, education);
  }

  const experience = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
  if (experience.length) {
    const rows = experience.filter((item) =>
      [item?.role, item?.company, item?.duration, item?.description].some((part) => toText(part))
    );

    if (rows.length) {
      paragraphs.push(createHeading("Experience"));
      rows.forEach((item) => {
        const titleParts = [toText(item.role), toText(item.company)].filter(Boolean);
        if (titleParts.length) {
          paragraphs.push(
            createTextParagraph(titleParts.join(" - "), {
              children: [new TextRun({ text: titleParts.join(" - "), bold: true })],
            })
          );
        }

        const duration = toText(item.duration);
        if (duration) {
          paragraphs.push(createTextParagraph(duration, { children: [new TextRun({ text: duration, italics: true })] }));
        }

        pushMultiline(paragraphs, item.description);
      });
    }
  }

  const projects = Array.isArray(resumeData?.projects) ? resumeData.projects : [];
  if (projects.length) {
    const rows = projects.filter((item) => [item?.name, item?.description, item?.link].some((part) => toText(part)));

    if (rows.length) {
      paragraphs.push(createHeading("Projects"));
      rows.forEach((item) => {
        const projectName = toText(item.name);
        if (projectName) {
          paragraphs.push(
            createTextParagraph(projectName, {
              children: [new TextRun({ text: projectName, bold: true })],
            })
          );
        }

        pushMultiline(paragraphs, item.description);

        const link = toText(item.link);
        if (link) {
          paragraphs.push(createTextParagraph(link));
        }
      });
    }
  }

  const achievements = toText(resumeData?.achievements);
  if (achievements) {
    paragraphs.push(createHeading("Achievements"));
    pushMultiline(paragraphs, achievements);
  }

  const interests = toText(resumeData?.interests);
  if (interests) {
    paragraphs.push(createHeading("Interests"));
    pushMultiline(paragraphs, interests);
  }

  const codingProfiles = Array.isArray(resumeData?.codingProfiles) ? resumeData.codingProfiles : [];
  if (codingProfiles.length) {
    const rows = codingProfiles
      .map((item) => {
        const parts = [toText(item.platform), toText(item.username), toText(item.link)].filter(Boolean);
        return parts.join(" - ");
      })
      .filter(Boolean);

    if (rows.length) {
      paragraphs.push(createHeading("Coding Profiles"));
      rows.forEach((row) => paragraphs.push(createTextParagraph(row)));
    }
  }

  const customSections = Array.isArray(resumeData?.customSections) ? resumeData.customSections : [];
  if (customSections.length) {
    customSections.forEach((section) => {
      const title = toText(section?.title) || "Custom Section";
      const content = toText(section?.content);
      if (!content) return;

      paragraphs.push(createHeading(title));
      pushMultiline(paragraphs, content);
    });
  }

  if (!paragraphs.length) {
    paragraphs.push(createTextParagraph("Resume data is empty."));
  }

  return paragraphs;
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

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: buildDocParagraphs(resumeData),
        },
      ],
    });

    const docxBuffer = await Packer.toBuffer(doc);

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
