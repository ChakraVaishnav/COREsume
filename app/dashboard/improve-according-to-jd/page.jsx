"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TEMPLATES = [
  { name: "Classic Professional", slug: "classic-professional" },
  { name: "Executive Sidebar", slug: "executive-sidebar" },
  { name: "Career Timeline", slug: "career-timeline" },
  { name: "Professional Elite", slug: "professional-elite" },
  { name: "Apex One", slug: "apex-one" },
  { name: "ATS Classic", slug: "ats-classic" },
  { name: "Executive Edge", slug: "executive-edge" },
  { name: "Impact Grid", slug: "impact-grid" },
  { name: "Compact Pro", slug: "compact-pro" },
];

function formatCountdown(resetsAt) {
  if (!resetsAt) return "";
  const target = new Date(resetsAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, target - now);
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function renderSuggestionText(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ImproveAccordingToJdPage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // Rate Limiting and Credits State
  const [usageData, setUsageData] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Result state (Persisted in localStorage on change)
  const [isPremiumResult, setIsPremiumResult] = useState(false);
  const [initialScore, setInitialScore] = useState(null);
  const [improvedScore, setImprovedScore] = useState(null);
  const [estimatedTargetScore, setEstimatedTargetScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [enhancedData, setEnhancedData] = useState(null);

  // Load state from localStorage on mount to prevent loss on page refresh
  useEffect(() => {
    // Usage limits
    fetch("/api/feature-usage/jd")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUsageData(data);
      })
      .catch((e) => console.error(e));

    // Results state
    const savedIsPremium = localStorage.getItem("jdEnhancedIsPremium") === "true";
    const savedInitialScore = localStorage.getItem("jdEnhancedInitialScore");
    const savedImprovedScore = localStorage.getItem("jdEnhancedImprovedScore");
    const savedEstimated = localStorage.getItem("jdEnhancedEstimatedTarget");
    const savedSuggestions = localStorage.getItem("jdEnhancedSuggestions");
    const savedEnhancedData = localStorage.getItem("jdEnhancedResumeData");

    if (savedSuggestions) {
      setIsPremiumResult(savedIsPremium);
      setSuggestions(JSON.parse(savedSuggestions));

      if (savedIsPremium) {
        if (savedInitialScore) setInitialScore(Number(savedInitialScore));
        if (savedImprovedScore) setImprovedScore(Number(savedImprovedScore));
        if (savedEnhancedData) setEnhancedData(JSON.parse(savedEnhancedData));
      } else {
        if (savedEstimated) setEstimatedTargetScore(Number(savedEstimated));
      }
    }

    // Persisted JD text state
    const savedJd = localStorage.getItem("jdEnhancedJdText");
    if (savedJd) setJdText(savedJd);

    // Persisted PDF File state (reconstruct File object from base64 data)
    const savedFileName = localStorage.getItem("jdEnhancedFileName");
    const savedFileData = localStorage.getItem("jdEnhancedFileData");
    if (savedFileName && savedFileData) {
      try {
        const arr = savedFileData.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const reconstructedFile = new File([u8arr], savedFileName, { type: mime });
        setFile(reconstructedFile);
      } catch (e) {
        console.error("Failed to reconstruct saved PDF file:", e);
      }
    }
  }, []);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError("");

      // Save to localStorage as Base64 Data URL so it persists on refresh
      const reader = new FileReader();
      reader.onload = () => {
        try {
          localStorage.setItem("jdEnhancedFileName", f.name);
          localStorage.setItem("jdEnhancedFileData", reader.result);
        } catch (e) {
          console.warn("PDF too large to persist in localStorage directly:", e);
        }
      };
      reader.readAsDataURL(f);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearResults = () => {
    setInitialScore(null);
    setImprovedScore(null);
    setEstimatedTargetScore(null);
    setSuggestions([]);
    setEnhancedData(null);
    localStorage.removeItem("jdEnhancedIsPremium");
    localStorage.removeItem("jdEnhancedInitialScore");
    localStorage.removeItem("jdEnhancedImprovedScore");
    localStorage.removeItem("jdEnhancedEstimatedTarget");
    localStorage.removeItem("jdEnhancedSuggestions");
    localStorage.removeItem("jdEnhancedResumeData");
  };

  const runEnhancement = async (useCredit = false) => {
    if (!file) {
      setError("Please upload your resume PDF first.");
      return;
    }
    if (!jdText.trim() || jdText.trim().length < 10) {
      setError("Please enter a valid job description (at least 10 characters).");
      return;
    }

    setEnhancing(useCredit ? "premium" : "free");
    setError("");
    clearResults();
    setShowLimitModal(false);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jdText);
    formData.append("useCredit", useCredit);

    try {
      const res = await fetch("/api/ai/enhance-jd", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "INSUFFICIENT_CREDITS") {
          setError("You do not have enough credits (Premium optimization requires 5 credits). Please top up.");
        } else if (res.status === 403) {
          setUsageData(data);
          setError(data.message || data.error || "Daily free limit reached.");
        } else {
          setError(data.error || "Optimization failed. Please try again.");
        }
        return;
      }

      // Refresh limits
      fetch("/api/feature-usage/jd")
        .then((r) => r.json())
        .then((d) => {
          if (!d.error) setUsageData(d);
        });

      // Save to React State & localStorage to persist through refresh
      setIsPremiumResult(useCredit);
      localStorage.setItem("jdEnhancedIsPremium", String(useCredit));

      const parsedSuggestions = data.suggestions || [];
      setSuggestions(parsedSuggestions);
      localStorage.setItem("jdEnhancedSuggestions", JSON.stringify(parsedSuggestions));

      if (useCredit) {
        setInitialScore(data.initialScore);
        setImprovedScore(data.improvedScore);
        setEnhancedData(data.enhancedData);

        localStorage.setItem("jdEnhancedInitialScore", String(data.initialScore));
        localStorage.setItem("jdEnhancedImprovedScore", String(data.improvedScore));
        localStorage.setItem("jdEnhancedResumeData", JSON.stringify(data.enhancedData));
      } else {
        setEstimatedTargetScore(data.estimatedTargetScore);
        localStorage.setItem("jdEnhancedEstimatedTarget", String(data.estimatedTargetScore));
      }

    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const handleRefineTemplate = (slug) => {
    if (!enhancedData) return;
    setShowTemplates(false);

    // Save to resumeFormData to trigger builder loading
    localStorage.setItem("jdEnhancedResumeData", JSON.stringify(enhancedData));
    localStorage.setItem("resumeTemplate", slug);

    // Redirect with extracted source
    router.push(`/resume-form?template=${slug}&extracted=1&source=jd`);
  };

  // Score Aesthetics
  const scoreColor = (s) => (s >= 80 ? "text-emerald-500" : s >= 60 ? "text-yellow-500" : "text-rose-500");
  const scoreRing = (s) => (s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-yellow-400" : "stroke-rose-500");
  const circumference = 2 * Math.PI * 45;

  const isFreeDisabled = usageData ? usageData.freeUsed >= usageData.freeLimit : false;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />

      <main className="grow pt-20 pb-16">
        <div className="w-full px-4 sm:px-8">

          {/* Header area with back button and usage badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 mb-6 gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-black text-sm font-medium transition-colors"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>

            {usageData && (
              <div className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-50 px-3.5 py-1.5 text-xs font-bold text-yellow-800 shadow-sm animate-fade-in">
                {usageData.freeSearchesRemainingToday > 0
                  ? `${usageData.freeSearchesRemainingToday} free optimization left today • resets in ${formatCountdown(usageData.freeResetsAt)}`
                  : `Free resets in ${formatCountdown(usageData.freeResetsAt)}`}
              </div>
            )}
          </div>

          {/* Core Panel Split Grid */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT: Upload & Inputs Panel ── */}
            <div className="w-full lg:w-110 lg:shrink-0 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-2xl font-extrabold text-black mb-1">Tailor Resume to JD</h1>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Upload your resume PDF and enter the company's job description. We will rewrite, optimize, and perfect your content for ATS compatibility.
              </p>

              {/* Upload Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 mb-5 ${dragOver
                    ? "border-yellow-400 bg-yellow-50"
                    : file
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-200 bg-gray-50/30 hover:border-yellow-400 hover:bg-yellow-50"
                  }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600 shadow-xs">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-bold text-emerald-800 text-sm text-center break-all">{file.name}</p>
                    <p className="text-xs text-emerald-600 mt-1">Click to change PDF</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="font-bold text-black text-sm">Drop your resume PDF here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                  </>
                )}
              </div>

              {/* JD Input */}
              <div className="mb-6 space-y-2">
                <label className="text-sm font-bold text-black flex justify-between items-center">
                  <span>Job Description (JD)</span>
                  <span className="text-xs text-gray-400 font-medium">Text input required</span>
                </label>
                <textarea
                  placeholder="Paste the job description or role requirements here..."
                  rows={6}
                  value={jdText}
                  onChange={(e) => {
                    setJdText(e.target.value);
                    localStorage.setItem("jdEnhancedJdText", e.target.value);
                  }}
                  className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300 text-sm font-medium placeholder-gray-400"
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-5 shadow-xs">
                  {error}
                </div>
              )}

              {/* CTA Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => runEnhancement(false)}
                  disabled={!file || !jdText.trim() || !!enhancing || isFreeDisabled}
                  className="w-full py-3.5 rounded-xl font-black text-black bg-yellow-400 hover:bg-yellow-500 border-2 border-yellow-500 transition-all shadow-md hover:shadow-lg disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enhancing === "free" ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Improving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Free Enhance (1 Left Today)
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (usageData && usageData.creditsRemaining < 5) {
                      setError("You don't have enough credits. Please top up.");
                      return;
                    }
                    runEnhancement(true);
                  }}
                  disabled={!file || !jdText.trim() || !!enhancing}
                  className="w-full py-3.5 rounded-xl font-bold text-black border-2 border-yellow-400 bg-white hover:bg-yellow-50 transition-all shadow-sm hover:shadow-md disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enhancing === "premium" ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating Enhanced Resume...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Premium Tailor (Costs 5 Credits)
                    </>
                  )}
                </button>
              </div>

              {/* Informational Guidelines */}
              <div className="mt-6 bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Optimization Levels</h4>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 text-yellow-600 text-xs font-bold">1</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong className="text-black font-semibold">Free Optimization:</strong> Scans gaps and provides detailed action items with an <strong>Estimated potential score</strong>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 text-yellow-600 text-xs font-bold">2</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong className="text-black font-semibold">Premium Optimization:</strong> Does full keyword alignment, rewrite summaries/bullet points, measures exact before & after ATS score, and builds a exportable resume.
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Output & Results Display Panel ── */}
            <div className="flex-1 w-full min-w-0">

              {/* State A: Normal Empty Placeholder */}
              {!suggestions.length && !enhancing && (
                <div className="hidden lg:flex flex-col items-center justify-center min-h-[500px] text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 px-10">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-extrabold text-lg mb-2">Tailored Optimization Dashboard</p>
                  <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6">
                    Upload your PDF and input a Job Description. AI will automatically evaluate alignment and rewrite your descriptions.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs font-bold">
                    Premium optimization calculates precise before/after scoring.
                  </div>
                </div>
              )}

              {/* State B: Loading / Enhancing */}
              {enhancing && (
                <div className="flex flex-col items-center justify-center min-h-[500px] rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                    {enhancing === "premium" ? "Rebuilding & Optimizing..." : "Evaluating Gaps..."}
                  </h2>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                    AI is comparing your skills and experience to the JD. This usually takes 10 to 18 seconds.
                  </p>
                  <div className="mt-8 flex gap-1.5 items-center justify-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* State C: Render Results */}
              {suggestions.length > 0 && !enhancing && (
                <div className="space-y-6 animate-fade-in">

                  {/* Score progression panel */}
                  {isPremiumResult ? (
                    /* Premium Layout: Before vs After Side-by-Side */
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <h2 className="text-lg font-extrabold text-black mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                        ATS Score Improvement
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">

                        {/* Initial Score */}
                        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="relative shrink-0 w-24 h-24">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (initialScore / 100) * circumference}
                                className={`${scoreRing(initialScore)} transition-all duration-1000`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-gray-700">{initialScore}</span>
                              <span className="text-[8px] text-gray-400 font-semibold uppercase">Initial</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-black">Original Resume Score</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-normal">
                              Score of the PDF before tailoring to this specific Job Description.
                            </p>
                          </div>
                        </div>

                        {/* Improved Score */}
                        <div className="flex items-center gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                          <div className="relative shrink-0 w-24 h-24">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (improvedScore / 100) * circumference}
                                className="stroke-emerald-500 transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-emerald-600">{improvedScore}</span>
                              <span className="text-[8px] text-emerald-500 font-semibold uppercase">Improved</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-emerald-800">ATS Optimized Score</h4>
                            <p className="text-xs text-emerald-600/80 mt-1 leading-normal">
                              Calculated score of the tailored model after matching JD keywords.
                            </p>
                          </div>
                        </div>

                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-400 font-medium leading-relaxed">
                        <span className="shrink-0 text-yellow-500 font-bold">NOTE:-</span>
                        <span>No ATS scorer is perfect. Different ATS tools use different algorithms, so use this score as a reference. Our ATS analyzer can also make mistakes.</span>
                      </div>
                    </div>
                  ) : (
                    /* Free Layout: Single Circular Progress */
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative shrink-0 w-24 h-24">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={circumference - (estimatedTargetScore / 100) * circumference}
                              className={`${scoreRing(estimatedTargetScore)} transition-all duration-1000`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-gray-800">{estimatedTargetScore}</span>
                            <span className="text-[7px] text-gray-500 font-semibold uppercase">Target</span>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-black mb-1">Estimated potential score</h2>
                          <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                            By implementing the suggestions below, your resume's match compatibility with this job description can increase to approximately <strong className="text-black">{estimatedTargetScore}/100</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-400 font-medium leading-relaxed">
                        <span className="shrink-0 text-yellow-500 font-bold">NOTE:-</span>
                        <span>No ATS scorer is perfect. Different ATS tools use different algorithms, so use this score as a reference. Our ATS analyzer can also make mistakes.</span>
                      </div>
                    </div>
                  )}

                  {/* Actions CTA Panel */}
                  {isPremiumResult && enhancedData && (
                    <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-md border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-white mb-1">Tailored Resume Ready!</h3>
                        <p className="text-xs text-neutral-400 max-w-md">
                          We've fully rewritten your resume and formatted the data. Pick an template style below to open it in our premium editor.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0 w-full sm:w-auto text-center"
                      >
                        Get your updated resume →
                      </button>
                    </div>
                  )}

                  {/* Recommendations / Gaps Evaluated */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-extrabold text-black mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {isPremiumResult ? "Optimizations Applied" : "Recommended Improvements"}
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {suggestions.map((s, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 mt-2" />
                          <p className="text-sm font-medium text-gray-700 leading-normal">{renderSuggestionText(s)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isPremiumResult && (
                    <div className="bg-yellow-50/50 border border-yellow-200/60 rounded-2xl p-5 text-center">
                      <p className="text-xs font-semibold text-yellow-800 leading-relaxed max-w-lg mx-auto">
                        💡 Want us to write these improvements for you instantly? Spend 5 credits to unlock the Premium Optimization to automatically rewrite and construct your new resume!
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Template selector modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-black">Pick a Resume Template</h3>
              <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => handleRefineTemplate(t.slug)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-400 hover:bg-yellow-50/50 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 group-hover:bg-yellow-400 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-yellow-600 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-bold text-xs text-black">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-black mb-2">Daily Free Limit Reached</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              You've used your <span className="font-bold text-black">{usageData?.freeLimit} free JD optimizations</span> today.
              You can upgrade to premium which will cost <span className="font-bold text-black">{usageData?.creditsRequired} credits</span>.
              <br /><br />
              <span className="text-xs text-gray-500 font-semibold px-3 py-1.5 bg-gray-100 rounded-md">
                Resets at 12:00 AM IST
              </span>
            </p>
            <div className="flex gap-3 justify-end items-center mt-4">
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => runEnhancement(true)}
                className="px-5 py-2.5 rounded-xl font-bold bg-yellow-400 text-black hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Use {usageData?.creditsRequired} Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
