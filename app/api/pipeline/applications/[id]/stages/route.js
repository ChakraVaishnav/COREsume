import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";

// GET /api/pipeline/applications/[id]/stages — list stages
export async function GET(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const app = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: id },
      orderBy: { stageOrder: "asc" },
    });

    const response = NextResponse.json({ stages }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/stages GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/pipeline/applications/[id]/stages — add a new stage
export async function POST(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { stageName, insertAfterOrder } = body;

    if (!stageName) {
      return NextResponse.json({ error: "Stage name is required" }, { status: 400 });
    }

    // Verify ownership
    const app = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const existingStages = await prisma.applicationStage.findMany({
      where: { applicationId: id },
      orderBy: { stageOrder: "asc" },
    });

    let newOrder;
    if (insertAfterOrder !== undefined && insertAfterOrder !== null) {
      newOrder = insertAfterOrder + 1;
      // Shift all stages after the insertion point
      const stagesToShift = existingStages.filter((s) => s.stageOrder >= newOrder);
      for (const stage of stagesToShift) {
        await prisma.applicationStage.update({
          where: { id: stage.id },
          data: { stageOrder: stage.stageOrder + 1 },
        });
      }
    } else {
      // Add at the end
      newOrder = existingStages.length;
    }

    const stage = await prisma.applicationStage.create({
      data: {
        applicationId: id,
        stageName,
        stageOrder: newOrder,
        status: "pending",
      },
    });

    // Return updated stages list
    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: id },
      orderBy: { stageOrder: "asc" },
    });

    const response = NextResponse.json({ stage, stages }, { status: 201 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/stages POST] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/pipeline/applications/[id]/stages — bulk update stages (reorder)
export async function PUT(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { stages: stageUpdates } = body;

    if (!Array.isArray(stageUpdates)) {
      return NextResponse.json({ error: "stages must be an array" }, { status: 400 });
    }

    // Verify ownership
    const app = await prisma.application.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update each stage
    for (const update of stageUpdates) {
      const data = {};
      if (update.stageName !== undefined) data.stageName = update.stageName;
      if (update.stageOrder !== undefined) data.stageOrder = update.stageOrder;
      if (update.status !== undefined) data.status = update.status;
      if (update.feedback !== undefined) data.feedback = update.feedback;
      if (update.completedAt !== undefined) data.completedAt = update.completedAt ? new Date(update.completedAt) : null;

      if (Object.keys(data).length > 0) {
        await prisma.applicationStage.update({
          where: { id: update.id },
          data,
        });
      }
    }

    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: id },
      orderBy: { stageOrder: "asc" },
    });

    const response = NextResponse.json({ stages }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/stages PUT] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
