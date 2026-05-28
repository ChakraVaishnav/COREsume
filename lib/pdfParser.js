// lib/pdfParser.js
export async function parsePdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const { default: pdfParse } = await import("pdf-parse");
  const parsed = await pdfParse(Buffer.from(arrayBuffer));
  const rawText = String(parsed?.text || "");
  // Clean line endings
  return rawText.replace(/\s+\n/g, "\n").trim();
}
