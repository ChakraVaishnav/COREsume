import fs from "fs";
import path from "path";

const SERPER_API_URL = "https://google.serper.dev/search";
const SERPER_TIMEOUT_MS = Number(process.env.JOBS_SERPER_TIMEOUT_MS || 8000);

export async function fetchJobsFromSerper(query, location, jobLimit) {
  const apiKey = getSerperApiKey();
  if (!apiKey) {
    throw new Error("SERPER_KEY_MISSING");
  }

  const normalizedQuery = String(query || "").trim();
  const normalizedLocation = String(location || "").trim() || "India";
  const queryVariants = [
    `${normalizedQuery} ${normalizedLocation} site:linkedin.com/jobs/view`,
    `${normalizedQuery} ${normalizedLocation} site:in.indeed.com/viewjob`,
    `${normalizedQuery} ${normalizedLocation} site:naukri.com/job-listings`,
    `${normalizedQuery} ${normalizedLocation} hiring`,
  ];

  const settled = await Promise.allSettled(
    queryVariants.map((q) =>
      runSerperSearch(apiKey, q, Math.min(30, Math.max(10, jobLimit * 3)))
    )
  );

  const candidates = [];

  for (const result of settled) {
    if (result.status !== "fulfilled") {
      continue;
    }

    const payload = result.value;
    if (Array.isArray(payload?.jobs) && payload.jobs.length > 0) {
      candidates.push(...payload.jobs);
    }

    if (Array.isArray(payload?.organic) && payload.organic.length > 0) {
      candidates.push(...payload.organic);
    }
  }

  const strictJobs = deduplicateByLinkOrTitle(
    candidates
      .map((item) => normalizeSerperItem(item, normalizedLocation))
      .filter((job) => isUsefulJobResult(job, normalizedQuery, normalizedLocation, true))
  );

  if (strictJobs.length >= jobLimit) {
    return strictJobs.slice(0, jobLimit);
  }

  const relaxedJobs = deduplicateByLinkOrTitle(
    candidates
      .map((item) => normalizeSerperItem(item, normalizedLocation))
      .filter((job) => isUsefulJobResult(job, normalizedQuery, normalizedLocation, false))
  );

  const merged = deduplicateByLinkOrTitle([...strictJobs, ...relaxedJobs]);

  return merged.slice(0, jobLimit);
}

function normalizeSerperItem(item, fallbackLocation) {
  const rawTitle = String(item?.title || item?.jobTitle || "").trim();
  const title = cleanJobTitle(rawTitle);

  return {
    jobTitle: title,
    companyName: cleanCompanyName(
      item?.companyName || item?.company || extractCompanyFromSnippet(item?.snippet) || ""
    ),
    jobDescription: String(item?.description || item?.snippet || "").trim(),
    skillsRequired: [],
    experienceRequired: null,
    location: String(item?.location || fallbackLocation || "").trim() || null,
    salary: String(item?.salary || "").trim() || null,
    jobLink: String(item?.link || item?.url || "").trim(),
    postedDate: String(item?.date || item?.postedAt || "").trim() || null,
    source: "serper",
  };
}

function cleanJobTitle(rawTitle) {
  let title = String(rawTitle || "").replace(/\s+/g, " ").trim();

  title = title.replace(/^\d[\d,]*\+?\s+/i, "").trim();
  title = title.replace(/\bjob vacancies?\b.*$/i, "").trim();
  title = title.replace(/\bjobs?\b$/i, "").trim();
  title = title.replace(/\bjobs? in [^-|]+(?:\s*[-|].*)?$/i, "").trim();
  title = title.replace(/\s*[-|]\s*20\d{2}\b.*$/i, "").trim();

  return title;
}

function extractCompanyFromSnippet(snippet) {
  const text = String(snippet || "").replace(/\s+/g, " ");
  const match = text.match(/\bat\s+([A-Za-z0-9&.,\- ]{2,50})\b/i);
  if (!match?.[1]) {
    return "";
  }

  return match[1].trim();
}

function cleanCompanyName(company) {
  const value = String(company || "").replace(/\s+/g, " ").trim();
  if (!value) {
    return "";
  }

  if (/^20\d{2}$/.test(value)) {
    return "";
  }

  return value;
}

function isUsefulJobResult(job, query, location, strict = true) {
  if (!job || !job.jobTitle || !job.jobLink) {
    return false;
  }

  const title = String(job.jobTitle || "").toLowerCase();
  const description = String(job.jobDescription || "").toLowerCase();
  const company = String(job.companyName || "").trim();
  const link = String(job.jobLink || "");
  const queryLower = String(query || "").toLowerCase();
  const locationLower = String(location || "").toLowerCase();

  if (strict && !isLikelyDirectJobLink(link)) {
    return false;
  }

  const noisyPatterns = [
    /\bjob vacancies?\b/i,
    /\bjobs?\s+and\s+vacancies?\b/i,
    /\bjobs?\s+vacancies?\b/i,
    /^jobs?\b/i,
    /\bjobs? in\b/i,
    /^\d[\d,]*\+?\s+/i,
    /\bwork from home job\b/i,
  ];

  const isNoisyTitle = noisyPatterns.some((pattern) => pattern.test(title));
  const hasRoleSignal = /(developer|engineer|analyst|manager|architect|intern|consultant|specialist|lead)/i.test(
    title
  );
  const queryMatch = title.includes(queryLower);
  const hasGenericJobsWord = /\bjobs?\b|\bvacancies?\b/i.test(title);

  if (hasGenericJobsWord && !hasRoleSignal) {
    return false;
  }

  if (isNoisyTitle && !hasRoleSignal) {
    return false;
  }

  const words = title.split(/\s+/).filter(Boolean);
  if (words.length <= 2 && !hasRoleSignal) {
    return false;
  }

  if (words.length <= 2 && !company) {
    return false;
  }

  if (!hasRoleSignal && !queryMatch && description.length < 50) {
    return false;
  }

  if (locationLower && !String(job.location || "").toLowerCase().includes(locationLower)) {
    if (description.length > 0 && !description.includes(locationLower)) {
      return false;
    }
  }

  return true;
}

function isLikelyDirectJobLink(link) {
  const value = String(link || "").toLowerCase();
  if (!value.startsWith("http")) {
    return false;
  }

  const directPatterns = [
    /linkedin\.com\/jobs\/view\//,
    /indeed\.com\/viewjob/,
    /naukri\.com\/job-listings-/,
    /\/careers\//,
    /\/job\//,
    /\/jobs\/view\//,
    /\/vacancy\//,
    /\/opportunities?\//,
  ];

  if (directPatterns.some((pattern) => pattern.test(value))) {
    return true;
  }

  const noisyPatterns = [
    /\/search\//,
    /\/jobs?$/,
    /-jobs$/,
    /\/q-[^/]*-jobs\.html/,
    /\/srch_/,
  ];

  return !noisyPatterns.some((pattern) => pattern.test(value));
}

async function runSerperSearch(apiKey, q, num) {
  const response = await fetch(SERPER_API_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(SERPER_TIMEOUT_MS),
    body: JSON.stringify({
      q,
      gl: "in",
      hl: "en",
      num,
      autocorrect: false,
    }),
  });

  if (!response.ok) {
    const bodyText = await safeReadText(response);
    throw new Error(`SERPER_REQUEST_FAILED_${response.status}: ${bodyText}`);
  }

  return response.json();
}

function deduplicateByLinkOrTitle(jobs) {
  const seen = new Set();

  return jobs.filter((job) => {
    const key = `${job.jobLink}::${job.jobTitle.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getSerperApiKey() {
  const fromEnv = process.env.SERPER_API_KEY;
  if (fromEnv) {
    return fromEnv;
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/^SERPER_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "Unable to read Serper error payload";
  }
}
