"use client";

import { useEffect, useMemo, useState } from "react";

const STEPS = [
  "Fetching jobs from job boards...",
  "Analyzing with AI...",
  "Done! Showing results.",
];

function formatResetText(iso) {
  if (!iso) return "";

  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function extractResumeTextFromData(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  if (typeof data.jobsResumeText === "string" && data.jobsResumeText.trim()) {
    return data.jobsResumeText.trim();
  }

  const sections = [];
  const personalInfo = data.personalInfo && typeof data.personalInfo === "object" ? data.personalInfo : {};

  pushLine(sections, "Name", personalInfo.name);
  pushLine(sections, "Email", personalInfo.email);
  pushLine(sections, "Phone", personalInfo.phone);
  pushLine(sections, "LinkedIn", personalInfo.linkedin);
  pushLine(sections, "GitHub", personalInfo.github);
  pushLine(sections, "Portfolio", personalInfo.portfolio);

  pushBlock(sections, "Target Role", data.appliedJob || data.jobrole);
  pushBlock(sections, "Summary", data.summary);
  pushBlock(sections, "Skills", stringifyValue(data.skills));
  pushBlock(sections, "Education", stringifyValue(data.education));

  if (Array.isArray(data.experience) && data.experience.length > 0) {
    const lines = data.experience
      .map((item) => {
        if (!item || typeof item !== "object") {
          return "";
        }

        const parts = [item.role, item.company, item.duration]
          .map((value) => String(value || "").trim())
          .filter(Boolean);
        const heading = parts.join(" | ");
        const desc = String(item.description || "").trim();
        return [heading, desc].filter(Boolean).join("\n");
      })
      .filter(Boolean);

    pushBlock(sections, "Experience", lines.join("\n\n"));
  }

  if (Array.isArray(data.projects) && data.projects.length > 0) {
    const lines = data.projects
      .map((item) => {
        if (!item || typeof item !== "object") {
          return "";
        }

        const name = String(item.name || "").trim();
        const desc = String(item.description || "").trim();
        const link = String(item.link || "").trim();
        return [name, desc, link].filter(Boolean).join("\n");
      })
      .filter(Boolean);

    pushBlock(sections, "Projects", lines.join("\n\n"));
  }

  pushBlock(sections, "Achievements", stringifyValue(data.achievements));
  pushBlock(sections, "Interests", stringifyValue(data.interests));

  if (Array.isArray(data.customSections) && data.customSections.length > 0) {
    const lines = data.customSections
      .map((section) => {
        if (!section || typeof section !== "object") {
          return "";
        }

        const title = String(section.title || "").trim();
        const content = stringifyValue(section.content || section.value || section.items);
        return [title, content].filter(Boolean).join("\n");
      })
      .filter(Boolean);

    pushBlock(sections, "Additional", lines.join("\n\n"));
  }

  return sections.join("\n\n").trim();
}

function stringifyValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map((item) => stringifyValue(item))
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function pushLine(lines, label, value) {
  const text = String(value || "").trim();
  if (!text) {
    return;
  }

  lines.push(`${label}: ${text}`);
}

function pushBlock(lines, title, value) {
  const text = String(value || "").trim();
  if (!text) {
    return;
  }

  lines.push(`${title}\n${text}`);
}

export default function JobSearchPanel({ onSearchSuccess }) {
  const [resumeSource, setResumeSource] = useState("db");
  const [resumeText, setResumeText] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [dbResumeText, setDbResumeText] = useState("");
  const [loadingResumeData, setLoadingResumeData] = useState(true);
  const [savingResumeData, setSavingResumeData] = useState(false);

  const [jobQuery, setJobQuery] = useState("");
  const [location, setLocation] = useState("India");
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [progressStep, setProgressStep] = useState(-1);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const usageText = useMemo(() => {
    if (!usage) return "";

    if (usage.tier === "free") {
      if (usage.searchesRemainingToday > 0) {
        return "1 search remaining today";
      }
      return `Resets in ${formatResetText(usage.resetsAt)}`;
    }

    return `${usage.creditsRemaining || 0} credits remaining`;
  }, [usage]);

  const effectiveResumeText = useMemo(() => {
    if (resumeSource === "db") {
      const fromDb = String(dbResumeText || "").trim();
      if (fromDb) {
        return fromDb;
      }
    }

    return String(resumeText || "").trim();
  }, [resumeSource, dbResumeText, resumeText]);

  const loadUsage = async () => {
    try {
      const res = await fetch("/api/jobs/usage", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUsage(null);
        return;
      }

      const data = await res.json();
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setLoadingUsage(false);
    }
  };

  const loadResumeData = async () => {
    try {
      const res = await fetch("/api/resume/get", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setResumeSource("paste");
        setDbResumeText("");
        setResumeData(null);
        return;
      }

      const payload = await res.json();
      const data = payload?.data && typeof payload.data === "object" ? payload.data : null;
      setResumeData(data);

      const extracted = extractResumeTextFromData(data);
      setDbResumeText(extracted);

      if (extracted) {
        setResumeSource("db");
      } else {
        setResumeSource("paste");
      }
    } catch {
      setResumeSource("paste");
      setDbResumeText("");
      setResumeData(null);
    } finally {
      setLoadingResumeData(false);
    }
  };

  useEffect(() => {
    loadUsage();
    loadResumeData();
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setToastMessage("");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const saveResumeDataToDb = async () => {
    setError("");

    const text = String(resumeText || "").trim();
    if (!text) {
      setError("Enter your resume data before saving.");
      return;
    }

    setSavingResumeData(true);
    try {
      const mergedData = {
        ...(resumeData && typeof resumeData === "object" ? resumeData : {}),
        jobsResumeText: text,
      };

      const res = await fetch("/api/resume/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: mergedData }),
      });

      if (!res.ok) {
        throw new Error("SAVE_FAILED");
      }

      setResumeData(mergedData);
      setDbResumeText(text);
      setResumeSource("db");
      setToastMessage("Resume data saved to your account.");
    } catch {
      setError("Could not save resume data. Please try again.");
    } finally {
      setSavingResumeData(false);
    }
  };

  const handleSearch = async () => {
    setError("");
    setInfo("");
    setProgressStep(0);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProgressStep(1);

      const res = await fetch("/api/jobs/search", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: effectiveResumeText,
          jobQuery,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "LIMIT_REACHED") {
          setError(`Daily limit reached. Resets at ${data.resetsAt || "next day"}`);
        } else if (data?.error === "JOB_FETCH_FAILED") {
          setError("Could not find jobs. Try different keywords.");
        } else if (data?.error === "LLM_FAILED") {
          setError("AI analysis failed. Please try again.");
        } else {
          setError(data?.message || "Something went wrong.");
        }

        setProgressStep(-1);
        await loadUsage();
        return;
      }

      setProgressStep(2);
      if (typeof onSearchSuccess === "function") {
        await onSearchSuccess(data);
      }

      if (data?.partialResults && data?.message) {
        setToastMessage(data.message);
      }

      if (data?.jobCount === 0 && data?.message) {
        setInfo(data.message);
      }

      await loadUsage();
    } catch {
      setError("Something went wrong.");
      setProgressStep(-1);
    }
  };

  const canSearch = Boolean(effectiveResumeText) && Boolean(jobQuery.trim()) && progressStep !== 1;
  const showResumeDataMissing = resumeSource === "db" && !loadingResumeData && !dbResumeText;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-black">Search Jobs Related to Your Resume</h2>
      <p className="mt-1 text-sm text-gray-500">Apply to JOBS related to your resume instantly</p>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setResumeSource("paste")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  resumeSource === "paste"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Paste Resume Text
              </button>
              <button
                type="button"
                onClick={() => setResumeSource("db")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  resumeSource === "db"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Use Current Resume Data
              </button>
            </div>

            <button
              type="button"
              onClick={saveResumeDataToDb}
              disabled={savingResumeData || !resumeText.trim()}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingResumeData ? "Saving..." : "Save Resume Data"}
            </button>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {resumeSource === "db" ? "Current Resume Data" : "Resume Text"}
          </label>

          {resumeSource === "db" && dbResumeText ? (
            <textarea
              value={dbResumeText}
              readOnly
              rows={8}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none"
            />
          ) : (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="Enter your resume data"
            />
          )}

          {showResumeDataMissing && (
            <p className="mt-2 text-xs text-amber-700">
              No resume content found in database. Enter your resume data and click Save Resume Data.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Job Query
            </label>
            <input
              type="text"
              value={jobQuery}
              onChange={(e) => setJobQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              placeholder='e.g. "React Developer"'
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="India"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium text-gray-700">
            {loadingUsage ? "Loading usage..." : usageText}
          </div>
          <button
            onClick={handleSearch}
            disabled={!canSearch || loadingResumeData}
            className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search Jobs
          </button>
        </div>

        {progressStep >= 0 && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            {STEPS[progressStep]}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {info && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {info}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 max-w-md rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
