let scrapeJobsLoader;

const JOBSPY_TIMEOUT_MS = Number(process.env.JOBS_JOBSPY_TIMEOUT_MS || 45000);
const JOBSPY_HOURS_OLD = Number(process.env.JOBS_JOBSPY_HOURS_OLD || 168);

const DEFAULT_SITES = ["linkedin", "indeed", "glassdoor", "zip_recruiter"];
const INDIA_SITES = ["linkedin", "indeed", "glassdoor", "naukri"];

export async function fetchJobs(query, location, jobLimit) {
  const scrapeJobs = await getScrapeJobs();
  const requiredJobs = Math.max(1, Number(jobLimit) || 1);
  const normalizedQuery = String(query || "").trim();
  const normalizedLocation = String(location || "").trim() || "India";
  const siteList = resolveSites(normalizedLocation);

  const attempts = buildAttempts(normalizedQuery, normalizedLocation);
  let collectedJobs = [];
  let lastError = null;

  for (const attempt of attempts) {
    try {
      const result = await withTimeout(
        scrapeJobs({
          site_name: siteList,
          search_term: attempt.query,
          location: attempt.location,
          results_wanted: requiredJobs >= 30 ? 120 : 50,
          hours_old: JOBSPY_HOURS_OLD,
          description_format: "plain",
          use_creds: true,
          verbose: 0,
        }),
        JOBSPY_TIMEOUT_MS
      );

      const jobs = normalizeJobSpyResults(result?.jobs);
      if (jobs.length > 0) {
        collectedJobs = deduplicateJobs([...collectedJobs, ...jobs]);
      }

      if (collectedJobs.length >= requiredJobs) {
        return collectedJobs.slice(0, requiredJobs);
      }
    } catch (err) {
      lastError = err;
      console.error("[jobs] jobspy-js attempt failed", {
        query: attempt.query,
        location: attempt.location,
        error: err?.message || String(err),
      });
    }
  }

  if (collectedJobs.length > 0) {
    const error = new Error("JOB_FETCH_INSUFFICIENT");
    error.code = "JOB_FETCH_INSUFFICIENT";
    error.required = requiredJobs;
    error.found = collectedJobs.length;
    error.jobs = collectedJobs.slice(0, requiredJobs);
    throw error;
  }

  if (lastError) {
    const error = new Error("JOB_FETCH_FAILED");
    error.cause = lastError;
    throw error;
  }

  throw new Error("JOB_FETCH_EMPTY");
}

function normalizeJobSpyResults(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const mapped = items
    .map((item) => ({
      jobTitle: String(item?.title || "").trim(),
      companyName: String(item?.company_name || item?.company || "").trim(),
      jobDescription: String(item?.description || "").trim(),
      skillsRequired: Array.isArray(item?.skills)
        ? item.skills.map((skill) => String(skill || "").trim()).filter(Boolean)
        : [],
      experienceRequired: String(item?.experience_range || "").trim() || null,
      location: normalizeLocation(item?.location),
      salary: normalizeSalary(item?.compensation),
      jobLink: String(item?.job_url_direct || item?.job_url || "").trim(),
      postedDate: String(item?.date_posted || "").trim() || null,
      source: String(item?.site || "jobspy").trim() || "jobspy",
    }))
    .filter((job) => Boolean(job.jobTitle) && Boolean(job.jobLink));

  return deduplicateJobs(mapped);
}

function normalizeLocation(location) {
  if (!location) {
    return null;
  }

  if (typeof location === "string") {
    return location.trim() || null;
  }

  if (typeof location === "object") {
    const parts = [location.city, location.state, location.country]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  return null;
}

function normalizeSalary(compensation) {
  if (!compensation || typeof compensation !== "object") {
    return null;
  }

  const currency = String(compensation.currency || "").trim();
  const min = Number(compensation.min_amount);
  const max = Number(compensation.max_amount);
  const interval = String(compensation.interval || "").trim();

  if (!Number.isFinite(min) && !Number.isFinite(max)) {
    return null;
  }

  const minPart = Number.isFinite(min) ? Math.round(min).toLocaleString("en-IN") : "";
  const maxPart = Number.isFinite(max) ? Math.round(max).toLocaleString("en-IN") : "";
  const range = minPart && maxPart ? `${minPart}-${maxPart}` : minPart || maxPart;

  if (!range) {
    return null;
  }

  const prefix = currency || "";
  const suffix = interval ? `/${interval}` : "";
  return `${prefix}${range}${suffix}`.trim();
}

function deduplicateJobs(jobs) {
  const seen = new Set();

  return jobs.filter((job) => {
    const key = `${String(job.jobLink || "").trim()}::${String(job.jobTitle || "")
      .trim()
      .toLowerCase()}::${String(job.companyName || "").trim().toLowerCase()}`;

    if (!key || key === "::::") {
      return false;
    }

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildAttempts(query, location) {
  const queryVariants = buildQueryVariants(query);
  const locationVariants = [location, "India", "Remote"].filter(Boolean);
  const attempts = [];

  for (const variantQuery of queryVariants) {
    for (const variantLocation of [...new Set(locationVariants)]) {
      attempts.push({ query: variantQuery, location: variantLocation });
    }
  }

  return attempts.slice(0, 8);
}

function buildQueryVariants(query) {
  const clean = String(query || "").trim();
  const variants = [clean];
  const lower = clean.toLowerCase();

  if (lower.includes("developer") && !lower.includes("engineer")) {
    variants.push(clean.replace(/developer/gi, "engineer"));
  }

  if (lower.includes("engineer") && !lower.includes("developer")) {
    variants.push(clean.replace(/engineer/gi, "developer"));
  }

  if (!lower.includes("software")) {
    variants.push(`Software ${clean}`);
  }

  variants.push("Software Engineer");
  return [...new Set(variants.filter(Boolean))].slice(0, 4);
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("JOBSPY_TIMEOUT")), timeoutMs);
    }),
  ]);
}

function resolveSites(location) {
  const loc = String(location || "").toLowerCase();
  if (loc.includes("india")) {
    return INDIA_SITES;
  }

  return DEFAULT_SITES;
}

async function getScrapeJobs() {
  if (scrapeJobsLoader) {
    return scrapeJobsLoader;
  }

  try {
    const mod = await import("jobspy-js");
    const fn = mod?.scrapeJobs || mod?.default?.scrapeJobs || mod?.default;

    if (typeof fn !== "function") {
      throw new Error("JOBSPY_EXPORT_MISSING");
    }

    scrapeJobsLoader = fn;
    return scrapeJobsLoader;
  } catch (err) {
    const error = new Error("JOB_FETCH_FAILED");
    error.code = "JOB_FETCH_FAILED";
    error.cause = err;
    throw error;
  }
}