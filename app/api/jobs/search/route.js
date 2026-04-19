import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { fetchJobs } from "@/lib/jobs/apify";
import { analyzeJobs } from "@/lib/jobs/analyze";
import { checkLimit, recordUsage, resolveTier } from "@/lib/jobs/rateLimit";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { resumeText, jobQuery, location } = await req.json();
    if (!resumeText || !jobQuery) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "resumeText and jobQuery are required",
        },
        { status: 400 }
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

    const existingUsage = await prisma.jobUsage.findUnique({
      where: { userId: auth.userId },
      select: { tier: true },
    });

    const tier = resolveTier(user, existingUsage);
    const jobLimit = tier === "premium" ? 30 : 10;

    const limitCheck = await checkLimit(auth.userId, tier, user.creds || 0);
    if (!limitCheck.allowed) {
      const response = NextResponse.json(
        {
          error: "LIMIT_REACHED",
          message: limitCheck.reason,
          resetsAt: limitCheck.resetsAt || null,
          creditsRemaining:
            typeof limitCheck.creditsRemaining === "number"
              ? limitCheck.creditsRemaining
              : null,
        },
        { status: 429 }
      );
      return appendSetCookieHeaders(response, auth.cookieHeaders);
    }

    let rawJobs;
    let partialJobsMessage = "";
    try {
      rawJobs = await fetchJobs(jobQuery, location || "India", jobLimit);
    } catch (err) {
      const fetchError = err?.message || "JOB_FETCH_FAILED";
      console.error("Job fetch error:", {
        code: fetchError,
        query: jobQuery,
        location: location || "India",
      });

      if (err?.code === "JOB_FETCH_INSUFFICIENT" && Array.isArray(err?.jobs) && err.jobs.length > 0) {
        const found = Number(err.found || err.jobs.length);
        const required = Number(err.required || jobLimit);

        rawJobs = err.jobs;
        partialJobsMessage = `We can only find ${found} jobs for this role openings in the selected country, we can't find others right now.`;
        console.warn("Partial jobs fetched", {
          query: jobQuery,
          location: location || "India",
          found,
          required,
        });
      } else if (fetchError === "JOB_FETCH_EMPTY") {
        const response = NextResponse.json({
          searchId: null,
          jobCount: 0,
          jobs: [],
          message: "No jobs found for this query and location.",
        });
        return appendSetCookieHeaders(response, auth.cookieHeaders);
      } else if (fetchError === "JOB_FETCH_FAILED") {
        const response = NextResponse.json({
          searchId: null,
          jobCount: 0,
          jobs: [],
          message: "Job provider is temporarily unavailable. Please try again in a few minutes.",
        });
        return appendSetCookieHeaders(response, auth.cookieHeaders);
      } else {
        const response = NextResponse.json(
          {
            error: "JOB_FETCH_FAILED",
            message: "Could not fetch jobs. Try again.",
          },
          { status: 503 }
        );
        return appendSetCookieHeaders(response, auth.cookieHeaders);
      }
    }

    let analyzedJobs;
    try {
      analyzedJobs = await analyzeJobs(resumeText, rawJobs);
    } catch {
      const response = NextResponse.json(
        {
          error: "LLM_FAILED",
          message: "AI analysis failed. Please try again.",
        },
        { status: 503 }
      );
      return appendSetCookieHeaders(response, auth.cookieHeaders);
    }

    const searchId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const jobsToStore = analyzedJobs.map((job) => ({
      userId: auth.userId,
      searchId,
      jobTitle: job.jobTitle || "",
      companyName: job.companyName || "",
      jobDescription: job.jobDescription || "",
      skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired : [],
      experienceRequired: job.experienceRequired || null,
      location: job.location || null,
      salary: job.salary || null,
      jobLink: job.jobLink || "",
      postedDate: job.postedDate || null,
      source: job.source || null,
      matchScore: Number.isFinite(job.matchScore) ? job.matchScore : 0,
      fitLabel: job.fitLabel || "Low Fit",
      missingSkills: Array.isArray(job.missingSkills) ? job.missingSkills : [],
      strengths: Array.isArray(job.strengths) ? job.strengths : [],
      reasoning: job.reasoning || "",
      aiSummary: null,
      whyItMatches: null,
      resumeImprovements: Array.isArray(job.keywordsToAdd)
        ? job.keywordsToAdd
        : [],
      tier,
      expiresAt,
    }));

    jobsToStore.sort((a, b) => b.matchScore - a.matchScore);

    const existingJobCount = await prisma.job.count({
      where: { userId: auth.userId },
    });

    const jobsToDeleteCount = Math.max(0, existingJobCount + jobsToStore.length - 50);

    await prisma.$transaction(async (tx) => {
      let deletedCount = 0;

      if (jobsToDeleteCount > 0) {
        const oldestJobs = await tx.job.findMany({
          where: { userId: auth.userId },
          orderBy: { createdAt: "asc" },
          take: jobsToDeleteCount,
          select: { id: true },
        });

        if (oldestJobs.length > 0) {
          const deleted = await tx.job.deleteMany({
            where: {
              id: {
                in: oldestJobs.map((job) => job.id),
              },
            },
          });
          deletedCount = deleted.count;
        }
      }

      await tx.job.createMany({ data: jobsToStore });

      const jobsInDb = Math.min(
        50,
        Math.max(0, existingJobCount - deletedCount) + jobsToStore.length
      );

      const userUpdateData = {
        jobsInDb,
        totalJobsSearched: { increment: jobsToStore.length },
      };

      if (tier === "premium") {
        userUpdateData.creds = { decrement: 5 };
      }

      await tx.user.update({
        where: { id: auth.userId },
        data: userUpdateData,
      });
    });

    const creditsAfterSearch = tier === "premium"
      ? Math.max(0, (user.creds || 0) - 5)
      : user.creds || 0;

    await recordUsage(auth.userId, tier, jobsToStore.length, creditsAfterSearch);

    const responsePayload = {
      searchId,
      jobCount: jobsToStore.length,
      jobs: jobsToStore,
      message: partialJobsMessage || null,
      partialResults: Boolean(partialJobsMessage),
    };

    const response = NextResponse.json(responsePayload);

    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("Job search error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
