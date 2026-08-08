import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withAdminCookies } from "@/lib/admin/access";
import { logApiError } from "@/lib/logger";

export const runtime = "nodejs";

function logAdminMetaError(action, details = {}) {
  logApiError(`[ADMIN_META:${action}]`, details);
}

export async function GET(req) {
  try {
    const admin = await requireAdmin(req);
    if (admin.response) {
      return withAdminCookies(admin.response, admin.cookieHeaders);
    }

    const user = await prisma.user.findUnique({
      where: { id: admin.userId },
      select: { id: true, username: true, email: true },
    });

    const response = NextResponse.json({
      authorized: true,
      admin: user,
      resources: ["users", "resumes", "otp", "ratings", "order", "jobs", "jobUsage"],
    });

    return withAdminCookies(response, admin.cookieHeaders);
  } catch (err) {
    logAdminMetaError("GET_FAILED", {
      message: err?.message || "Unknown error",
      stack: err?.stack || null,
    });
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
