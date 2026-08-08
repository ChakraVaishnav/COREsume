import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rateLimit";

// PUT /api/pipeline/applications/[id]/stages/[stageId] — update single stage
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

    const { id, stageId } = await params;

    // Verify ownership via application
    const app = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = {};
    if (body.stageName !== undefined) data.stageName = body.stageName;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "completed" && !body.completedAt) {
        data.completedAt = new Date();
      }
    }
    if (body.completedAt !== undefined) data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
    if (body.feedback !== undefined) data.feedback = body.feedback;

    const stage = await prisma.applicationStage.update({
      where: { id: stageId },
      data,
    });

    // If we marked a stage as current, update the application's currentStageId
    if (body.status === "current") {
      await prisma.application.update({
        where: { id },
        data: { currentStageId: stageId },
      });
    }

    const response = NextResponse.json({ stage }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/stages/[stageId] PUT] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/pipeline/applications/[id]/stages/[stageId] — delete stage and re-order
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

    const { id, stageId } = await params;

    // Verify ownership via application
    const app = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const stageToDelete = await prisma.applicationStage.findUnique({
      where: { id: stageId },
    });
    if (!stageToDelete) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    // Delete the stage
    await prisma.applicationStage.delete({ where: { id: stageId } });

    // Re-order remaining stages
    const remaining = await prisma.applicationStage.findMany({
      where: { applicationId: id },
      orderBy: { stageOrder: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].stageOrder !== i) {
        await prisma.applicationStage.update({
          where: { id: remaining[i].id },
          data: { stageOrder: i },
        });
      }
    }

    // If deleted stage was current, update currentStageId
    if (app.currentStageId === stageId) {
      const currentStage = remaining.find((s) => s.status === "current");
      await prisma.application.update({
        where: { id },
        data: { currentStageId: currentStage?.id || null },
      });
    }

    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: id },
      orderBy: { stageOrder: "asc" },
    });

    const response = NextResponse.json({ success: true, stages }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/stages/[stageId] DELETE] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
