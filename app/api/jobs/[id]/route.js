import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    });

    if (!job) {
      const notFoundResponse = NextResponse.json(
        { error: "NOT_FOUND", message: "Job not found" },
        { status: 404 }
      );
      return appendSetCookieHeaders(notFoundResponse, auth.cookieHeaders);
    }

    const response = NextResponse.json({ job });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("Jobs detail error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobId = String(params?.id || "");
    if (!jobId) {
      const badRequest = NextResponse.json(
        { error: "BAD_REQUEST", message: "Job id is required." },
        { status: 400 }
      );
      return appendSetCookieHeaders(badRequest, auth.cookieHeaders);
    }

    const existing = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: auth.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      const notFoundResponse = NextResponse.json(
        { error: "NOT_FOUND", message: "Job not found" },
        { status: 404 }
      );
      return appendSetCookieHeaders(notFoundResponse, auth.cookieHeaders);
    }

    await prisma.job.delete({ where: { id: jobId } });

    const jobsInDb = await prisma.job.count({ where: { userId: auth.userId } });
    await prisma.user.update({
      where: { id: auth.userId },
      data: { jobsInDb },
    });

    const response = NextResponse.json({ message: "Deleted", id: jobId });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("Jobs delete error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
