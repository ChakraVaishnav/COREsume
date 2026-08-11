import { NextResponse } from "next/server";

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

/**
 * Validates an uploaded PDF file for MIME type and size.
 * @param {File} file - The file object from formData.get()
 * @returns {{ valid: true } | { valid: false, response: NextResponse }}
 */
export function validatePdfFile(file) {
  if (!file || typeof file !== "object") {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      ),
    };
  }

  const mimeType = file.type || "";
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      ),
    };
  }

  const fileSize = file.size || 0;
  if (fileSize === 0) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "File is empty." },
        { status: 400 }
      ),
    };
  }

  if (fileSize > MAX_PDF_SIZE) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 413 }
      ),
    };
  }

  return { valid: true };
}
