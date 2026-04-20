import { prisma } from "@/lib/prisma";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const FREE_DAILY_SEARCH_LIMIT = 1;

export function getISTDateKey(date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().split("T")[0];
}

export function getNextISTMidnightUTCDate(date = new Date()) {
  const nowIST = new Date(date.getTime() + IST_OFFSET_MS);
  const nextMidnightIST = new Date(
    Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  );

  return new Date(nextMidnightIST.getTime() - IST_OFFSET_MS);
}

export async function checkLimit(userId, searchMode, creditsBalance = 0) {
  if (searchMode === "free") {
    const todayIST = getISTDateKey();
    const usage = await prisma.jobUsage.findUnique({ where: { userId } });

    if (usage && usage.date === todayIST && usage.searchCount >= FREE_DAILY_SEARCH_LIMIT) {
      return {
        allowed: false,
        reason: `Daily free search limit reached (${FREE_DAILY_SEARCH_LIMIT}/day). It resets at 12:00 AM IST.`,
        resetsAt: getNextISTMidnightUTCDate().toISOString(),
      };
    }

    return { allowed: true };
  }

  if (searchMode === "premium") {
    const credits = Number(creditsBalance) || 0;

    if (credits < 5) {
      return {
        allowed: false,
        reason: "Insufficient credits. You need 5 credits to fetch premium job posts.",
        creditsRemaining: credits,
      };
    }

    return { allowed: true, creditsRemaining: credits };
  }

  return {
    allowed: false,
    reason: "Invalid search mode.",
  };
}

export async function recordUsage(userId, searchMode, jobCount, creditsRemaining = 0) {
  const todayIST = getISTDateKey();

  if (searchMode === "free") {
    await prisma.jobUsage.upsert({
      where: { userId },
      update: {
        date: todayIST,
        searchCount: { increment: 1 },
        jobsFetched: { increment: jobCount },
        tier: "free",
        lastSearchAt: new Date(),
      },
      create: {
        userId,
        date: todayIST,
        searchCount: 1,
        jobsFetched: jobCount,
        tier: "free",
        lastSearchAt: new Date(),
      },
    });
  }

  if (searchMode === "premium") {
    await prisma.jobUsage.upsert({
      where: { userId },
      update: {
        date: todayIST,
        jobsFetched: { increment: jobCount },
        tier: "premium",
        credits: creditsRemaining,
        creditsUsed: { increment: 5 },
        lastSearchAt: new Date(),
      },
      create: {
        userId,
        date: todayIST,
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
