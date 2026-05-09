import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_PUPPETEER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

async function launchBrowser() {
  console.log("[export/resume] Launching browser. VERCEL:", !!process.env.VERCEL);
  const envExecutable = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envExecutable) {
    return puppeteer.launch({
      headless: true,
      executablePath: envExecutable,
      args: BASE_PUPPETEER_ARGS,
    });
  }

  if (process.env.VERCEL) {
    const [{ default: chromium }, { default: puppeteerCore }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);

    return puppeteerCore.launch({
      headless: chromium.headless,
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, ...BASE_PUPPETEER_ARGS],
    });
  }

  return puppeteer.launch({
    headless: true,
    args: BASE_PUPPETEER_ARGS,
  });
}

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

    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });

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

    await page.addStyleTag({
      content: `
        .pdf-export a {
          transition: none !important;
          text-decoration: none !important;
          position: relative;
          z-index: 10;
          display: inline-block; /* Helps PDF engines define the clickable area more reliably */
        }
      `,
    });

    const previewUrl = `${req.nextUrl.origin}/resume-preview?export=1`;
    console.log("[export/resume] Navigating to:", previewUrl);
    await page.goto(previewUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector("#resume-container", { timeout: 30_000 });
    await page.waitForFunction(
      () => {
        const text = document.getElementById("resume-container")?.innerText || "";
        return !text.includes("Loading resume") && text.trim().length > 0;
      },
      { timeout: 30_000 }
    );

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 10_000)),
          ]);
        } catch {
          // Ignore and let the final PDF render proceed.
        }
      }
    });

    await page.waitForFunction(
      () => {
        if (!document.fonts) return true;

        // Some fonts can end in `error` state depending on environment.
        // Treat both loaded and error as settled to avoid hanging exports.
        return Array.from(document.fonts).every(
          (font) => font.status === "loaded" || font.status === "error"
        );
      },
      { timeout: 15_000 }
    ).catch(() => {
      // If fonts are still unresolved after timeout, continue with fallback fonts.
    });

    await page.emulateMediaType("screen");

    // Ensure all links have proper protocols before PDF generation
    await page.evaluate(() => {
      const links = document.querySelectorAll("a");
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("/") && !href.startsWith("#")) {
          link.setAttribute("href", `https://${href}`);
        }
      });
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
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
    return NextResponse.json({ 
      error: "Failed to generate PDF", 
      details: err?.message,
      stack: err?.stack 
    }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
