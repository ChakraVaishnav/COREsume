import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export const runtime = "nodejs";
const MAX_STORED_JOBS = 50;

const ALLOWED_FIT_LABELS = new Set(["High Fit", "Moderate Fit", "Low Fit"]);

async function enforceLatestJobsLimit(userId) {
  const totalJobs = await prisma.job.count({ where: { userId } });
  if (totalJobs <= MAX_STORED_JOBS) {
    return;
  }

  const overflow = totalJobs - MAX_STORED_JOBS;
  const oldestJobs = await prisma.job.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: overflow,
    select: { id: true },
  });

  if (!oldestJobs.length) {
    return;
  }

  await prisma.job.deleteMany({
    where: {
      id: {
        in: oldestJobs.map((job) => job.id),
      },
    },
  });
}

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get("searchId");
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const limitParam = Number.parseInt(searchParams.get("limit") || "10", 10);
    const fitLabelParam = searchParams.get("fitLabel");

    const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;
    const limit = Number.isFinite(limitParam)
      ? Math.min(10, Math.max(1, limitParam))
      : 10;
    const fitLabel = ALLOWED_FIT_LABELS.has(fitLabelParam) ? fitLabelParam : null;

    await enforceLatestJobsLimit(auth.userId);

    const where = {
      userId: auth.userId,
      ...(searchId ? { searchId } : {}),
      ...(fitLabel ? { fitLabel } : {}),
    };

    const totalJobs = await prisma.job.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalJobs / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { matchScore: "desc" }],
      skip,
      take: limit,
    });

    const response = NextResponse.json({
      jobs,
      pagination: {
        page: safePage,
        pageSize: limit,
        totalJobs,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
      },
    });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("Jobs results error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
