import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/security/rateLimit";

// GET /api/pipeline/applications — list all applications for the user
export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = { userId: auth.userId };
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = {};
    if (sortBy === "applicationDate" || sortBy === "updatedAt" || sortBy === "createdAt") {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.updatedAt = "desc";
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy,
    });

    const response = NextResponse.json({ applications }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/applications GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/pipeline/applications — create a new application with stages
export async function POST(req) {
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

    const body = await req.json();
    const {
      companyName,
      role,
      salary,
      location,
      jobType,
      jobLink,
      notes,
      priority,
    } = body;

    if (!companyName || !role) {
      return NextResponse.json(
        { error: "Company name and role are required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: auth.userId,
        companyName,
        role,
        salary: salary || null,
        location: location || null,
        jobType: jobType || null,
        jobLink: jobLink || null,
        notes: notes || null,
        priority: priority || null,
        status: "Applied",
      },
    });

    const response = NextResponse.json({ application }, { status: 201 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    logApiError("[pipeline/applications POST] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
