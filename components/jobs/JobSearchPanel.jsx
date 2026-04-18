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

export default function JobSearchPanel({ onSearchSuccess }) {
  const [resumeText, setResumeText] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [location, setLocation] = useState("India");
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [progressStep, setProgressStep] = useState(-1);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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

  useEffect(() => {
    loadUsage();
  }, []);

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
          resumeText,
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

      if (data?.jobCount === 0 && data?.message) {
        setInfo(data.message);
      }

      await loadUsage();
    } catch {
      setError("Something went wrong.");
      setProgressStep(-1);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-black">Search Jobs Related to Your Resume</h2>
      <p className="mt-1 text-sm text-gray-500">Apply to JOBS related to your resume instantly</p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            placeholder="Paste your full resume text here"
          />
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
            disabled={!resumeText.trim() || !jobQuery.trim() || progressStep === 1}
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
    </div>
  );
}
