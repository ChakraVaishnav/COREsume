import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withAdminCookies } from "@/lib/admin/access";

export const runtime = "nodejs";

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
      resources: ["users", "resumes", "otp", "ratings", "jobs", "jobUsage"],
    });

    return withAdminCookies(response, admin.cookieHeaders);
  } catch (err) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
