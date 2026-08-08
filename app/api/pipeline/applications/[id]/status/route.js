import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rateLimit";
// PUT /api/pipeline/applications/[id]/status — quick status update (Kanban drag)
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
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["Applied", "Interviewing", "On Hold", "Offer", "Joined", "Rejected", "Withdrawn", "Ghosted"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });

    const response = NextResponse.json({ application }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/applications/[id]/status PUT] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
