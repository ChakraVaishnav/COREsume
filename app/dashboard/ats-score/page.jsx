"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toBlob } from "html-to-image";

function renderSuggestionText(text) {
  if (!text) return "";
  let htmlText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-black">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="font-medium italic text-black">$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: htmlText }} />;
}

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

export default function AtsScorePage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [usageData, setUsageData] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetch("/api/feature-usage/ats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUsageData(data);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError("");
      setResult(null);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async (useCredit = false) => {
    if (!file) return;

    setAnalyzing(useCredit ? "credit" : "free");
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("useCredit", useCredit);
    try {
      const res = await fetch("/api/ai/analyze-ats", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "INSUFFICIENT_CREDITS") {
          setError("You don't have enough credits. Please top up.");
        } else if (res.status === 403) {
          setUsageData(data);
          setError(data.message || data.error || "Limit reached");
        } else {
          setError(data.error || "Analysis failed");
        }
        return;
      }
      setResult(data);
      // Refresh usage after success
      fetch("/api/feature-usage/ats")
        .then((r) => r.json())
        .then((d) => { if (!d.error) setUsageData(d); });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefineTemplate = async (slug) => {
    setExtracting(true);
    setShowTemplates(false);
    setError("");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("useCredit", false);
    try {
      const res = await fetch("/api/ai/extract-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Extraction failed");
      localStorage.setItem("resumeFormData", JSON.stringify(data));
      router.push(`/resume-form?template=${slug}`);
    } catch (e) {
      setError(e.message || "Failed to extract resume data.");
    } finally {
      setExtracting(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-yellow-500" : "text-red-500";
  const scoreRing = (s) => s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-yellow-400" : "stroke-red-500";
  const scoreBg = (s) => s >= 80 ? "from-emerald-50 to-teal-50 border-emerald-200" : s >= 60 ? "from-yellow-50 to-amber-50 border-yellow-200" : "from-red-50 to-rose-50 border-red-200";
  const circumference = 2 * Math.PI * 54;

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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>

            {usageData && (
              <div className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800">
                {usageData.freeSearchesRemainingToday > 0
                  ? `${usageData.freeSearchesRemainingToday} free analysis left today • resets in ${formatCountdown(usageData.freeResetsAt)}`
                  : `Free resets in ${formatCountdown(usageData.freeResetsAt)}`}
              </div>
            )}
          </div>

          {/* Split layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── LEFT: Upload panel ── */}
            <div className="w-full lg:w-105 lg:shrink-0 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-2xl font-extrabold text-black mb-1">ATS Score Checker</h1>
              <p className="text-gray-500 text-sm mb-6">
                Upload your resume PDF — AI will score it and suggest improvements.
              </p>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 mb-4 ${dragOver ? "border-yellow-400 bg-yellow-50"
                    : file ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-200 bg-gray-50/30 hover:border-yellow-400 hover:bg-yellow-50"
                  }`}
              >
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])} />
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-bold text-emerald-700 text-sm text-center break-all">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="font-bold text-black text-sm">Drop your resume PDF here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                  </>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => analyze(false)}
                  disabled={!file || !!analyzing || isFreeDisabled}
                  className="w-full py-3.5 rounded-xl font-black text-black bg-yellow-400 hover:bg-yellow-500 border-2 border-yellow-500 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing === "free" ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Use Free Analyzer
                    </>
                  )}
                </button>

                <button
                  onClick={() => analyze(true)}
                  disabled={!file || !!analyzing}
                  className="w-full py-3.5 rounded-xl font-bold text-black border-2 border-yellow-400 bg-white hover:bg-yellow-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing === "credit" ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Analyze your resume with 3 credits
                    </>
                  )}
                </button>
              </div>

              {/* Info box */}
              {!result && !analyzing && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What we check</p>
                  {[
                    "ATS score based on essential sections",
                    "Missing contact details (email, phone, LinkedIn, GitHub)",
                    "Missing sections (summary, skills, projects, etc.)",
                    "Spelling & grammar errors",
                    "Formatting clarity and consistency",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Results panel ── */}
            <div className="flex-1 min-w-0">
              {!result && !analyzing && (
                <div className="hidden lg:flex flex-col items-center justify-center min-h-64 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 px-10">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-extrabold text-lg mb-2">Your ATS analysis will appear here</p>
                  <p className="text-gray-400 text-sm max-w-sm mb-6">
                    The freemium analyzer provides the ATS score only.
                    Upgrade to get detailed feedback on strengths, improvements, and spelling mistakes.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs font-bold animate-pulse">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Analyze your resume with 3 credits for full report
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="flex flex-col items-center justify-center min-h-64 rounded-2xl border border-gray-200 bg-white py-16">
                  <svg className="w-10 h-10 animate-spin text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <p className="font-bold text-gray-800">Analyzing your resume…</p>
                  <p className="text-gray-400 text-sm mt-1">This usually takes 10–20 seconds.</p>
                </div>
              )}

              {result && (
                <div className="space-y-5">
                  {/* Score hero */}
                  <div className={`rounded-2xl border p-6 bg-linear-to-br ${scoreBg(result.atsScore)}`}>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <div className="relative shrink-0">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (result.atsScore / 100) * circumference}
                            className={`${scoreRing(result.atsScore)} transition-all duration-1000`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-black ${scoreColor(result.atsScore)}`}>{result.atsScore}</span>
                          <span className="text-[10px] text-gray-500 font-medium">/ 100</span>
                        </div>
                      </div>
                      <div className="text-center sm:text-left grow w-full">
                        <h2 className="text-xl font-extrabold text-black mb-1">ATS Score</h2>
                        <p className={`font-bold ${scoreColor(result.atsScore)} mb-2`}>
                          {result.atsScore >= 80 ? "Excellent" : result.atsScore >= 60 ? "Good — Room to Improve" : "Needs Work"}
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">{result.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Share CTA Banner — prominent and impossible to miss */}
                  <div className="rounded-2xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 p-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 grow">
                      <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-black text-black text-sm">Proud of your score? Share it!</p>
                        <p className="text-xs text-gray-600 mt-0.5">Click below to generate your scorecard and post it on LinkedIn, WhatsApp, X, and more.</p>
                      </div>
                    </div>
                    <button
                      id="share-score-card-btn"
                      onClick={() => setShowShareModal(true)}
                      className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-yellow-400 hover:bg-yellow-500 border-2 border-yellow-600 rounded-xl text-sm font-black text-black shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share My Score Card
                    </button>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Note</p>
                    <p className="mt-1 text-sm leading-6 text-blue-900">
                      No ATS scorer is perfect. Different ATS tools use different algorithms, so use this score as a reference.
                      Our ATS analyzer can also make mistakes.
                    </p>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.strengths?.length > 0 && (
                      <ResultCard title="Strengths" colorClass="border-emerald-200 bg-emerald-50"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        iconColor="text-emerald-600">
                        <ul className="space-y-1.5">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{renderSuggestionText(s)}
                            </li>
                          ))}
                        </ul>
                      </ResultCard>
                    )}

                    {result.improvements?.length > 0 && (
                      <ResultCard title="Improvements" colorClass="border-yellow-200 bg-yellow-50"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        iconColor="text-yellow-600">
                        <ul className="space-y-1.5">
                          {result.improvements.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-yellow-500 mt-0.5 shrink-0">•</span>{renderSuggestionText(s)}
                            </li>
                          ))}
                        </ul>
                      </ResultCard>
                    )}

                    <ResultCard title="Spelling & Grammar" colorClass="border-red-100 bg-red-50"
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                      iconColor="text-red-500">
                      {result.spellingMistakes?.length > 0 ? (
                        <ul className="space-y-1.5">
                          {result.spellingMistakes.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                              <span className="shrink-0 mt-0.5">&#9888;</span>{renderSuggestionText(s)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-emerald-700 font-medium">No spelling mistakes found!</p>
                      )}
                    </ResultCard>

                    {result.formattingTips?.length > 0 && (
                      <ResultCard title="Formatting Tips" colorClass="border-blue-100 bg-blue-50"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h6" /></svg>}
                        iconColor="text-blue-500">
                        <ul className="space-y-1.5">
                          {result.formattingTips.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-blue-400 mt-0.5 shrink-0">•</span>{renderSuggestionText(s)}
                            </li>
                          ))}
                        </ul>
                      </ResultCard>
                    )}
                  </div>

                  {/* Refine CTA */}
                  <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-1">Refine Your Resume</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      We'll extract your resume data and open it in a template of your choice — ready to edit.
                    </p>
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="bg-linear-to-r from-yellow-400 to-yellow-500 text-black font-bold px-5 py-2.5 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow"
                    >
                      Select Template to Refine →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-black mb-2">Daily Free Limit Reached</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              You've used your <span className="font-bold text-black">{usageData?.freeLimit} free ATS checks</span> today.
              This will cost <span className="font-bold text-black">{usageData?.creditsRequired} credits</span>.
              <br /><br />
              <span className="text-xs text-gray-500 font-medium px-3 py-1.5 bg-gray-100 rounded-md">
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
                onClick={() => analyze(true)}
                className="px-5 py-2.5 rounded-xl font-bold bg-yellow-400 text-black hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Use {usageData?.creditsRequired} Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template selector modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-black">Pick a Template</h3>
              <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button key={t.slug} onClick={() => handleRefineTemplate(t.slug)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-left transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 group-hover:bg-yellow-400 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-yellow-600 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm text-black">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extracting overlay */}
      {extracting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl">
            <svg className="w-10 h-10 animate-spin text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="font-bold text-lg text-black text-center">Extracting your resume data…</p>
            <p className="text-gray-500 text-sm text-center mt-1">This may take a few seconds.</p>
          </div>
        </div>
      )}

      {showShareModal && result && (
        <ShareModal
          score={result.atsScore}
          summary={result.summary}
          strengths={result.strengths}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

function ResultCard({ title, colorClass, icon, iconColor, children }) {
  return (
    <div className={`rounded-2xl border p-5 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={iconColor}>{icon}</span>
        <h3 className="font-bold text-black text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// NOTE: This will be injected into ats-score/page.jsx

function getScoreTier(score) {
  if (score >= 90) return { label: "Elite ATS Score", desc: "Elite ATS Score — Top Tier Resume", ringHex: "#10b981", glowHex: "#10b981" };
  if (score >= 75) return { label: "Strong ATS Score", desc: "Strong ATS Score — Above Average", ringHex: "#3b82f6", glowHex: "#3b82f6" };
  if (score >= 60) return { label: "Decent Score", desc: "Decent Score — Small Fixes Needed", ringHex: "#f59e0b", glowHex: "#f59e0b" };
  return { label: "Needs Work", desc: "Needs Work — COREsume Can Fix This", ringHex: "#ef4444", glowHex: "#ef4444" };
}

function ShareModal({ score, summary, strengths, onClose }) {
  const [generatingFor, setGeneratingFor] = useState(null);
  const [sharedFor, setSharedFor] = useState(null);
  const [isMobileShare, setIsMobileShare] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmPlatform, setConfirmPlatform] = useState(null);

  useEffect(() => {
    setIsMobileShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const tier = getScoreTier(score || 0);

  const buildCardBlob = () =>
    new Promise(async (resolve, reject) => {
      const element = document.getElementById("ats-share-card-preview");
      if (!element) return reject(new Error("Card element not found"));
      try {
        const blob = await toBlob(element, {
          cacheBust: true,
          pixelRatio: 4, // ultra high res output 4x
          style: {
            backgroundColor: "#020617",
          }
        });
        if (blob) resolve(blob);
        else reject(new Error("Blob null"));
      } catch (e) { reject(e); }
    });

  const downloadCard = async (platformName) => {
    setGeneratingFor(platformName);
    try {
      const blob = await buildCardBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "coresume-ats-score-" + score + ".png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setSharedFor(platformName);
      setTimeout(() => setSharedFor(null), 8000);
    } catch (e) { console.error("Download failed:", e); }
    finally { setGeneratingFor(null); }
  };

  const shareMobile = async () => {
    setGeneratingFor("mobile");
    try {
      const blob = await buildCardBlob();
      const imgFile = new File([blob], "coresume-ats-score.png", { type: "image/png" });
      const shareData = {
        files: [imgFile],
        title: "My COREsume ATS Score",
        text: "My resume scored " + score + "/100 on the ATS Resume Checker by COREsume! Check yours free at https://coresume.in",
        url: "https://coresume.in",
      };
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.share({ title: "My COREsume ATS Score", text: "My resume scored " + score + "/100 on COREsume!", url: "https://coresume.in" });
      }
    } catch (e) {
      if (e.name !== "AbortError") console.error("Native share failed:", e);
    } finally { setGeneratingFor(null); }
  };

  const handlePlatformClick = (p) => {
    setConfirmPlatform(p);
  };

  const confirmDownloadAndShare = async () => {
    if (!confirmPlatform) return;
    setGeneratingFor(confirmPlatform.label);
    try {
      const blob = await buildCardBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "coresume-ats-score-" + score + ".png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setSharedFor(confirmPlatform.label);
      setTimeout(() => setSharedFor(null), 10000);
    } catch (e) { console.error("Card generation failed:", e); }
    finally {
      setGeneratingFor(null);
      setTimeout(() => {
        confirmPlatform.openPlatform();
        setConfirmPlatform(null);
      }, 400);
    }
  };

  const openLinkedIn = () => {
    const text = "Just scored " + score + "/100 on the ATS Resume Checker by COREsume!\n\nCOREsume scans your resume against ATS algorithms so you never get filtered out before a recruiter sees it.\n\nhttps://coresume.in\n\n#Resume #ATS #CareerTips #JobSearch";
    window.open("https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(text), "_blank");
  };
  const openX = () => {
    const text = "Just scored " + score + "/100 on the ATS Resume Checker by COREsume. Check yours free: https://coresume.in #Resume #CareerTips #JobSearch";
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
  };
  const openWhatsApp = () => {
    const text = "I just scored " + score + "/100 on the ATS Resume Checker by COREsume! Check yours free at https://coresume.in";
    window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank");
  };
  const openFacebook = () => {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://coresume.in"), "_blank");
  };
  const openReddit = () => {
    const title = "My resume scored " + score + "/100 on the ATS Resume Checker \u2014 COREsume optimizes resumes to pass ATS filters";
    window.open("https://www.reddit.com/submit?title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent("https://coresume.in"), "_blank");
  };
  const copyLink = () => {
    navigator.clipboard.writeText("https://coresume.in");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const platforms = [
    {
      id: "linkedin", label: "LinkedIn", openPlatform: openLinkedIn, hoverBg: "#eff6ff", hoverBorder: "#bfdbfe",
      icon: <svg style={{ width: "20px", height: "20px", color: "#2563eb" }} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
    },
    {
      id: "x", label: "X / Twitter", openPlatform: openX, hoverBg: "#f9fafb", hoverBorder: "#9ca3af",
      icon: <svg style={{ width: "20px", height: "20px", color: "#000" }} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    },
    {
      id: "whatsapp", label: "WhatsApp", openPlatform: openWhatsApp, hoverBg: "#f0fdf4", hoverBorder: "#6ee7b7",
      icon: <svg style={{ width: "20px", height: "20px" }} fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 00-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>,
    },
    {
      id: "reddit", label: "Reddit", openPlatform: openReddit, hoverBg: "#fff7ed", hoverBorder: "#fed7aa",
      icon: <svg style={{ width: "20px", height: "20px", color: "#f97316" }} fill="currentColor" viewBox="0 0 24 24"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.35-4.24 4.37.94c.04 1.13.97 2.03 2.1 2.03 1.15 0 2.08-.93 2.08-2.08s-.93-2.08-2.08-2.08c-1.05 0-1.92.77-2.06 1.77l-4.78-1.02c-.16-.04-.33.03-.4.18l-1.57 4.96c-2.48.06-4.73.7-6.39 1.72-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.05.54 1.97 1.37 2.51-.08.49-.12.99-.12 1.49 0 4.14 4.93 7.5 11 7.5s11-3.36 11-7.5c0-.5-.04-1-.12-1.49.83-.54 1.37-1.46 1.37-2.51zm-18 1c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11.5 5.08c-.88.88-2.53.96-3.5.96s-2.62-.08-3.5-.96c-.19-.19-.19-.51 0-.7.19-.19.51-.19.7 0 .62.62 1.99.76 2.8.76s2.18-.14 2.8-.76c.19-.19.51-.19.7 0 .19.19.19.51 0 .7zm-.62-3.08c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>,
    },
    {
      id: "facebook", label: "Facebook", openPlatform: openFacebook, hoverBg: "#eff6ff", hoverBorder: "#bfdbfe",
      icon: <svg style={{ width: "20px", height: "20px", color: "#1d4ed8" }} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
    },
    {
      id: "copy", label: copiedLink ? "Copied!" : "Copy Link",
      onClick: copyLink,
      hoverBg: "#f9fafb", hoverBorder: "#d1d5db",
      icon: <svg style={{ width: "20px", height: "20px", color: "#6b7280" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    },
  ];

  const isLoading = generatingFor !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row my-4">

        {/* Left: Beautiful Card Preview */}
        <div style={{ backgroundColor: "#020617" }} className="md:w-1/2 p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <p style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "24px", position: "relative", zIndex: 10 }}>
            Card Preview
          </p>

          {/* This is the capture area! Notice the inline styles on this div are perfect for the final image wrapper */}
          <div id="ats-share-card-preview" style={{ position: "relative", width: "320px", height: "320px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: tier.glowHex, filter: "blur(100px)", opacity: 0.15, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
            
            <div style={{ width: "280px", height: "280px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 10, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(20px)" }}>
              
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.15em", color: "#fff" }}>COREsume</div>
                  <div style={{ fontSize: "8px", color: "#9ca3af", fontWeight: 700, marginTop: "2px" }}>ATS OPTIMIZER</div>
                </div>
                <div style={{ padding: "4px 10px", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontSize: "7px", fontWeight: 900, color: "#facc15", letterSpacing: "0.1em" }}>VERIFIED</div>
              </div>
              
              <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 - (score / 100) * (2 * Math.PI * 42)}
                    stroke={tier.ringHex} 
                    style={{ filter: `drop-shadow(0 0 8px ${tier.ringHex}80)` }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>{score}</span>
                  <span style={{ fontSize: "8px", color: "#9ca3af", fontWeight: 800, textTransform: "uppercase", marginTop: "4px", letterSpacing: "0.1em" }}>Score</span>
                </div>
              </div>
              
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", borderRadius: "100px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>{tier.label}</span>
                </div>
              </div>
              
              <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", color: "#6b7280", fontWeight: 600 }}>
                <span>coresume.in</span>
                <span style={{ color: "#facc15" }}>Check yours free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sharing */}
        <div className="md:w-1/2 p-8 flex flex-col gap-6 overflow-y-auto bg-gray-50">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-black text-gray-900">Share Your Score</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Confirm Platform Dialog */}
          {confirmPlatform ? (
            <div className="flex flex-col flex-1 justify-center animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  {confirmPlatform.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Share to {confirmPlatform.label}</h4>
                <p className="text-sm text-gray-500 mb-6 px-4">
                  To post your score, we need to download the image to your device first. You can attach it to your {confirmPlatform.label} post in the next step.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={confirmDownloadAndShare}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-sm flex justify-center items-center gap-2 transition-all disabled:opacity-70"
                    style={{ backgroundColor: confirmPlatform.id === 'whatsapp' ? '#25D366' : confirmPlatform.id === 'linkedin' ? '#2563eb' : confirmPlatform.id === 'x' ? '#000' : '#0f172a' }}
                  >
                    {generatingFor ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    {generatingFor ? "Preparing Image..." : "Download & Continue"}
                  </button>
                  <button 
                    onClick={() => setConfirmPlatform(null)}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Success Banner */}
              {sharedFor && sharedFor !== "download" && sharedFor !== "instagram" && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-emerald-900 mb-0.5">Image Ready!</h5>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Your scorecard was downloaded successfully. Make sure to attach it to your {sharedFor} post!
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile native share */}
              {isMobileShare && (
                <button
                  onClick={shareMobile}
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-[15px] flex items-center justify-between gap-3 cursor-pointer shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: "#0f172a", color: "#fff" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                      {generatingFor === "mobile" ? (
                        <svg className="w-5 h-5 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      )}
                    </div>
                    <span>Share instantly via Phone apps</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}

              {/* Platform list */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Share to Socials</p>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((p) => {
                    if (p.id === 'copy') return null;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handlePlatformClick(p)}
                        disabled={isLoading}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm transition-all text-sm font-bold text-gray-700 cursor-pointer hover:border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="transition-transform group-hover:scale-110">{p.icon}</div>
                        {p.label}
                      </button>
                    )
                  })}
                  <button
                    onClick={copyLink}
                    disabled={isLoading}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm transition-all text-sm font-bold text-gray-700 cursor-pointer hover:border-gray-300 hover:shadow-md disabled:opacity-50"
                  >
                    <div className="transition-transform group-hover:scale-110">
                      <svg style={{ width: "20px", height: "20px", color: "#6b7280" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    {copiedLink ? "Link Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Download Buttons */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => downloadCard("download")}
                    disabled={isLoading}
                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-900 text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
                    style={{ backgroundColor: "#facc15" }}
                  >
                    {generatingFor === "download" ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    Save Image
                  </button>
                  <button
                    onClick={() => setConfirmPlatform({ id: "instagram", label: "Instagram", icon: <svg style={{ width: "24px", height: "24px" }} fill="#e1306c" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>, openPlatform: () => { window.open("https://instagram.com", "_blank"); } })}
                    disabled={isLoading}
                    className="flex-1 py-3.5 rounded-xl border-2 font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:bg-pink-50"
                    style={{ borderColor: "#e1306c", color: "#e1306c" }}
                  >
                    <svg className="w-5 h-5 shrink-0" fill="#e1306c" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                    Post to IG Story
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
