import { prisma } from "@/lib/prisma";

function getTodayUTC() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowMidnightUTC() {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

export function resolveTier(user, usage) {
  if (usage?.tier === "premium") {
    return "premium";
  }

  if ((user?.creds || 0) > 0) {
    return "premium";
  }

  return "free";
}

export async function checkLimit(userId, tier, creditsBalance = 0) {
  if (tier === "free") {
    const todayUTC = getTodayUTC();
    const usage = await prisma.jobUsage.findUnique({ where: { userId } });

    if (usage && usage.date === todayUTC && usage.searchCount >= 1) {
      return {
        allowed: false,
        reason: "Daily limit reached. You get 1 free search per day.",
        resetsAt: getTomorrowMidnightUTC().toISOString(),
      };
    }

    return { allowed: true };
  }

  if (tier === "premium") {
    const credits = Number(creditsBalance) || 0;

    if (credits < 5) {
      return {
        allowed: false,
        reason: "Insufficient credits. You need 5 credits per search.",
        creditsRemaining: credits,
      };
    }

    return { allowed: true, creditsRemaining: credits };
  }

  return {
    allowed: false,
    reason: "Invalid user tier.",
  };
}

export async function recordUsage(userId, tier, jobCount, creditsRemaining = 0) {
  const todayUTC = getTodayUTC();

  if (tier === "free") {
    await prisma.jobUsage.upsert({
      where: { userId },
      update: {
        date: todayUTC,
        searchCount: { increment: 1 },
        jobsFetched: { increment: jobCount },
        tier: "free",
        lastSearchAt: new Date(),
      },
      create: {
        userId,
        date: todayUTC,
        searchCount: 1,
        jobsFetched: jobCount,
        tier: "free",
        lastSearchAt: new Date(),
      },
    });
  }

  if (tier === "premium") {
    await prisma.jobUsage.upsert({
      where: { userId },
      update: {
        date: todayUTC,
        jobsFetched: { increment: jobCount },
        tier: "premium",
        credits: creditsRemaining,
        creditsUsed: { increment: 5 },
        lastSearchAt: new Date(),
      },
      create: {
        userId,
        date: todayUTC,
        searchCount: 0,
        jobsFetched: jobCount,
        tier: "premium",
        credits: creditsRemaining,
        creditsUsed: 5,
        lastSearchAt: new Date(),
      },
    });
  }
}
