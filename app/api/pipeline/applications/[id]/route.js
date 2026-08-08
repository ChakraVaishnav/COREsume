import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rateLimit";
// GET /api/pipeline/applications/[id] — get single application with stages
export async function GET(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "PIPELINE",
      identifier: String(auth.userId),
      cookieHeaders: auth.cookieHeaders,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const application = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const response = NextResponse.json({ application }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/applications/[id] GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/pipeline/applications/[id] — update application fields
export async function PUT(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "PIPELINE",
      identifier: String(auth.userId),
      cookieHeaders: auth.cookieHeaders,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const allowedFields = [
      "companyName", "role", "salary", "location", "jobType",
      "jobLink", "notes", "priority", "status",
    ];

    const data = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data,
    });

    const response = NextResponse.json({ application }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/applications/[id] PUT] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/pipeline/applications/[id] — delete application and all stages
export async function DELETE(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "PIPELINE",
      identifier: String(auth.userId),
      cookieHeaders: auth.cookieHeaders,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const existing = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await prisma.application.delete({ where: { id } });

    const response = NextResponse.json({ success: true }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/applications/[id] DELETE] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
