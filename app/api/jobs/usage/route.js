import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { resolveTier } from "@/lib/jobs/rateLimit";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, creds: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const usage = await prisma.jobUsage.findUnique({
      where: { userId: auth.userId },
    });

    const tier = resolveTier(user, usage);
    const todayUTC = new Date().toISOString().split("T")[0];

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    if (tier === "free") {
      const usedToday = usage?.date === todayUTC ? usage.searchCount : 0;
      const response = NextResponse.json({
        tier: "free",
        searchesUsedToday: usedToday,
        searchesRemainingToday: Math.max(0, 1 - usedToday),
        resetsAt: tomorrow.toISOString(),
      });

      return appendSetCookieHeaders(response, auth.cookieHeaders);
    }

    const response = NextResponse.json({
      tier: "premium",
      creditsRemaining: user.creds || 0,
      creditsNeededPerSearch: 5,
    });

    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("Jobs usage error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
