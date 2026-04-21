import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildFileName(data) {
  const rawName = String(data?.personalInfo?.name || "resume").trim().toLowerCase();
  const safeName = rawName.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "resume";
  return `${safeName}.pdf`;
}

export async function POST(req) {
  let browser;

  try {
    const body = await req.json();
    const resumeData = body?.data;
    const template = body?.template;

    if (!resumeData || !template) {
      return NextResponse.json({ error: "Missing resume data or template" }, { status: 400 });
    }

    const resumeJson = JSON.stringify(resumeData);
    if (Buffer.byteLength(resumeJson, "utf8") > 2_000_000) {
      return NextResponse.json({ error: "Resume data too large" }, { status: 413 });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ...(process.env.PUPPETEER_EXECUTABLE_PATH
        ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
        : {}),
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

    await page.evaluateOnNewDocument(
      ({ dataJson, templateSlug }) => {
        localStorage.setItem("resumeFormData", dataJson);
        localStorage.setItem("ResumePreviewData", dataJson);
        localStorage.setItem("resumeTemplate", templateSlug);
      },
      {
        dataJson: resumeJson,
        templateSlug: template,
      }
    );

    const previewUrl = `${req.nextUrl.origin}/resume-preview?export=1`;
    await page.goto(previewUrl, { waitUntil: "networkidle0", timeout: 60_000 });
    await page.waitForSelector("#resume-container", { timeout: 30_000 });
    await page.waitForFunction(
      () => {
        const text = document.getElementById("resume-container")?.innerText || "";
        return !text.includes("Loading resume") && text.trim().length > 0;
      },
      { timeout: 30_000 }
    );

    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${buildFileName(resumeData)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export/resume] Failed to generate PDF:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
