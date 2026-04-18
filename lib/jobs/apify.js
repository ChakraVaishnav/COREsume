import fs from "fs";
import path from "path";
import { fetchJobsFromSerper } from "./serper.js";

const ACTORS = [
  "curious_coder/indeed-scraper",
  "curious_coder/linkedin-jobs-scraper",
];
const APIFY_API_BASE = "https://api.apify.com/v2";
const FETCH_TIME_BUDGET_MS = Number(process.env.JOBS_FETCH_TIME_BUDGET_MS || 25000);
const APIFY_WAIT_FOR_FINISH_SECONDS = Number(
  process.env.JOBS_APIFY_WAIT_FOR_FINISH_SECONDS || 15
);
const APIFY_HTTP_TIMEOUT_MS = Number(process.env.JOBS_APIFY_HTTP_TIMEOUT_MS || 15000);
const MAX_PROVIDER_ATTEMPTS = Number(process.env.JOBS_MAX_PROVIDER_ATTEMPTS || 2);

function getApifyToken() {
  const fromEnv = process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN;
  if (fromEnv) {
    return fromEnv;
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const matchApiToken = envContent.match(
      /^APIFY_API_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/m
    );
    if (matchApiToken?.[1]) {
      return matchApiToken[1];
    }

    const matchLegacyToken = envContent.match(
      /^APIFY_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/m
    );
    return matchLegacyToken?.[1] || null;
  } catch {
    return null;
  }
}

function buildActorInput(actorId, query, location, jobLimit) {
  if (actorId.includes("linkedin")) {
    return {
      urls: [
        `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
      ],
      maxItems: jobLimit,
    };
  }

  return {
    position: query,
    location,
    maxItems: jobLimit,
    country: "IN",
  };
}

export async function fetchJobs(query, location, jobLimit) {
  const token = getApifyToken();
  if (!token) {
    throw new Error("APIFY_TOKEN_MISSING");
  }

  const normalizedQuery = String(query || "").trim();
  const normalizedLocation = String(location || "").trim() || "India";

  const fallbackQueries = buildFallbackQueries(normalizedQuery);
  const attempts = [];

  for (const fallbackQuery of fallbackQueries) {
    attempts.push({ query: fallbackQuery, location: normalizedLocation });
    if (normalizedLocation.toLowerCase() !== "india") {
      attempts.push({ query: fallbackQuery, location: "India" });
    }
  }

  let lastError = null;
  let hadSuccessfulRun = false;
  let budgetExceeded = false;
  let providerAttempts = 0;
  const startedAt = Date.now();

  outerLoop:
  for (const attempt of attempts) {
    for (const actorId of ACTORS) {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= FETCH_TIME_BUDGET_MS || providerAttempts >= MAX_PROVIDER_ATTEMPTS) {
        budgetExceeded = true;
        break outerLoop;
      }

      try {
        providerAttempts += 1;
        const run = await runActor(
          actorId,
          buildActorInput(actorId, attempt.query, attempt.location, jobLimit),
          token
        );

        hadSuccessfulRun = true;

        const items = await getDatasetItems(run.defaultDatasetId, token, jobLimit);
        if (!items || items.length === 0) {
          continue;
        }

        let jobs = items.map((item) => normalizeJob(item, actorId));
        jobs = deduplicateJobs(jobs);
        jobs = jobs.filter((job) => Boolean(job.jobLink) && Boolean(job.jobTitle));

        if (jobs.length > 0) {
          return jobs.slice(0, jobLimit);
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }
  }

  if (budgetExceeded && !hadSuccessfulRun && !lastError) {
    const fallbackJobs = await trySerperFallback(normalizedQuery, normalizedLocation, jobLimit, {
      reason: "APIFY_BUDGET_EXCEEDED",
      hadSuccessfulRun,
    });
    if (fallbackJobs.length > 0) {
      return fallbackJobs;
    }

    throw new Error("JOB_FETCH_EMPTY");
  }

  if (!hadSuccessfulRun && lastError) {
    const message = lastError?.message || String(lastError);
    console.error("[jobs] Apify fetch failed", {
      query: normalizedQuery,
      location: normalizedLocation,
      attempts: attempts.length,
      providerAttempts,
      budgetExceeded,
      lastError: message,
    });

    const fallbackJobs = await trySerperFallback(normalizedQuery, normalizedLocation, jobLimit, {
      reason: "APIFY_FAILED",
      hadSuccessfulRun,
      apifyError: message,
    });
    if (fallbackJobs.length > 0) {
      return fallbackJobs;
    }

    if (
      message.includes("PAYMENT-SIGNATURE") ||
      message.includes("APIFY_TOKEN_MISSING") ||
      message.includes("free trial has expired") ||
      message.includes("actor-is-not-rented")
    ) {
      throw new Error("APIFY_AUTH_FAILED");
    }
    throw new Error("JOB_FETCH_FAILED");
  }

  const fallbackJobs = await trySerperFallback(normalizedQuery, normalizedLocation, jobLimit, {
    reason: "APIFY_EMPTY",
    hadSuccessfulRun,
    budgetExceeded,
  });
  if (fallbackJobs.length > 0) {
    return fallbackJobs;
  }

  throw new Error("JOB_FETCH_EMPTY");
}

async function trySerperFallback(query, location, jobLimit, context = {}) {
  try {
    const jobs = await fetchJobsFromSerper(query, location, jobLimit);
    if (jobs.length > 0) {
      console.info("[jobs] Serper fallback succeeded", {
        query,
        location,
        count: jobs.length,
        ...context,
      });
    }

    return jobs;
  } catch (err) {
    console.error("[jobs] Serper fallback failed", {
      query,
      location,
      error: err?.message || String(err),
      ...context,
    });
    return [];
  }
}

async function runActor(actorId, input, token) {
  const apiActorId = actorId.replace("/", "~");
  const url = `${APIFY_API_BASE}/acts/${encodeURIComponent(apiActorId)}/runs?token=${encodeURIComponent(token)}&waitForFinish=${encodeURIComponent(APIFY_WAIT_FOR_FINISH_SECONDS)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(APIFY_HTTP_TIMEOUT_MS),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const bodyText = await safeReadText(response);
    throw new Error(`APIFY_RUN_FAILED_${response.status}: ${bodyText}`);
  }

  const payload = await response.json();
  const run = payload?.data;
  if (!run?.defaultDatasetId) {
    throw new Error("APIFY_RUN_FAILED_NO_DATASET");
  }

  return run;
}

async function getDatasetItems(datasetId, token, limit) {
  const url = `${APIFY_API_BASE}/datasets/${encodeURIComponent(datasetId)}/items?token=${encodeURIComponent(token)}&clean=true&format=json&limit=${encodeURIComponent(limit)}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(APIFY_HTTP_TIMEOUT_MS),
  });

  if (!response.ok) {
    const bodyText = await safeReadText(response);
    throw new Error(`APIFY_DATASET_FAILED_${response.status}: ${bodyText}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "Unable to read provider error payload";
  }
}

function buildFallbackQueries(query) {
  const clean = String(query || "").trim();
  const result = [];

  if (clean) {
    result.push(clean);
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 3) {
    result.push(words.slice(0, 3).join(" "));
  }

  if (!result.includes("Software Engineer")) {
    result.push("Software Engineer");
  }

  return [...new Set(result)];
}

function normalizeJob(item, actorId) {
  const source = actorId.includes("linkedin") ? "linkedin" : "indeed";

  return {
    jobTitle: item.title || item.jobTitle || item.position || "",
    companyName: item.company || item.companyName || item.employer || "",
    jobDescription: item.description || item.jobDescription || item.details || "",
    skillsRequired: item.skills || item.skillsRequired || [],
    experienceRequired: item.experience || item.experienceRequired || null,
    location: item.location || item.city || null,
    salary: item.salary || item.salaryRange || null,
    jobLink: item.url || item.jobUrl || item.link || "",
    postedDate: item.postedAt || item.postedDate || item.date || null,
    source,
  };
}

function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter((job) => {
    if (seen.has(job.jobLink)) {
      return false;
    }

    seen.add(job.jobLink);
    return true;
  });
}
