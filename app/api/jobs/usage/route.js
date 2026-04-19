import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { getISTDateKey, getNextISTMidnightUTCDate } from "@/lib/jobs/rateLimit";

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

    const todayIST = getISTDateKey();
    const usedToday = usage?.date === todayIST ? Number(usage.searchCount || 0) : 0;
    const freeSearchesRemainingToday = Math.max(0, 1 - usedToday);
    const creditsRemaining = Number(user.creds || 0);

    const response = NextResponse.json({
      freeSearchesUsedToday: usedToday,
      freeSearchesRemainingToday,
      freeResetsAt: getNextISTMidnightUTCDate().toISOString(),
      creditsRemaining,
      creditsNeededPerPremiumSearch: 5,
      canUseFreeSearch: freeSearchesRemainingToday > 0,
      canUsePremiumSearch: creditsRemaining >= 5,
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
