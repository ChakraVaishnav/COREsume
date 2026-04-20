import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function DELETE(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const deleted = await prisma.job.deleteMany({
      where: { userId: auth.userId },
    });

    await prisma.user.update({
      where: { id: auth.userId },
      data: { jobsInDb: 0 },
    });

    const response = NextResponse.json({
      message: "All jobs deleted",
      deletedCount: deleted.count,
    });

    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("Jobs bulk delete error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
