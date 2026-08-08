import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rateLimit";
export async function GET(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "RESUME_GET",
      identifier: String(auth.userId),
      cookieHeaders: auth.cookieHeaders,
    });

    if (rateLimitResponse) return rateLimitResponse;

    const resume = await prisma.resume.findUnique({
      where: { userId: auth.userId },
      select: { data: true },
    });

    const response = NextResponse.json(
      { data: resume?.data ?? null },
      { status: 200 }
    );
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[resume/get] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
