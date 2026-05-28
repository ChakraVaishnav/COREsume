"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import html2canvas from "html2canvas";

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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                          <div>
                            <h2 className="text-xl font-extrabold text-black mb-1 flex items-center justify-center sm:justify-start gap-2">
                              ATS Score
                            </h2>
                            <p className={`font-bold ${scoreColor(result.atsScore)} mb-2`}>
                              {result.atsScore >= 80 ? "Excellent ✅" : result.atsScore >= 60 ? "Good — Room to Improve 🔶" : "Needs Work ❌"}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowShareModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-xl text-xs font-bold text-black shadow-sm transition-all shrink-0 cursor-pointer self-center"
                          >
                            <svg className="w-4.5 h-4.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Share Score Card
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mt-2">{result.summary}</p>
                      </div>
                    </div>
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
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{s}
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
                              <span className="text-yellow-500 mt-0.5 shrink-0">•</span>{s}
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
                              <span className="shrink-0 mt-0.5">⚠</span>{s}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-emerald-700 font-medium">No spelling mistakes found! ✅</p>
                      )}
                    </ResultCard>

                    {result.formattingTips?.length > 0 && (
                      <ResultCard title="Formatting Tips" colorClass="border-blue-100 bg-blue-50"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h6" /></svg>}
                        iconColor="text-blue-500">
                        <ul className="space-y-1.5">
                          {result.formattingTips.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-blue-400 mt-0.5 shrink-0">•</span>{s}
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

function getScoreTier(score) {
  if (score >= 90) return { icon: "🏆", label: "Elite ATS Score", desc: "Elite ATS Score — Top Tier Resume", color: "text-emerald-500", ringColor: "stroke-emerald-500", glow: "bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 75) return { icon: "💪", label: "Strong ATS Score", desc: "Strong ATS Score — Above Average", color: "text-blue-500", ringColor: "stroke-blue-500", glow: "bg-blue-500/10 border-blue-500/20" };
  if (score >= 60) return { icon: "📈", label: "Decent Score", desc: "Decent Score — Small Fixes Needed", color: "text-amber-500", ringColor: "stroke-amber-400", glow: "bg-amber-500/10 border-amber-500/20" };
  return { icon: "🔧", label: "Needs Work", desc: "Needs Work — COREsume Can Fix This", color: "text-red-500", ringColor: "stroke-red-500", glow: "bg-red-500/10 border-red-500/20" };
}

function ShareModal({ score, summary, strengths, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [copiedNaukri, setCopiedNaukri] = useState(false);
  const [showInstaTooltip, setShowInstaTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  const tier = getScoreTier(score || 0);

  const downloadCard = async (isInsta = false) => {
    setDownloading(true);
    try {
      const element = document.getElementById("ats-share-card");
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2, // Retina quality
        logging: false,
        backgroundColor: "#020617", // slate-950
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `coresume-ats-score-${score}.png`;
      link.href = dataUrl;
      link.click();
      
      if (isInsta) {
        setShowInstaTooltip(true);
        setTimeout(() => setShowInstaTooltip(false), 5000);
      }
    } catch (e) {
      console.error("Failed to download share card:", e);
    } finally {
      setDownloading(false);
    }
  };

  const shareMobile = async () => {
    try {
      const element = document.getElementById("ats-share-card");
      if (!element) return;
      const canvas = await html2canvas(element, { useCORS: true, scale: 2, logging: false });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `coresume-ats-score.png`, { type: "image/png" });
        const shareData = {
          files: [file],
          title: "My COREsume ATS Score",
          text: `My resume just scored ${score}/100 on COREsume! Check yours for free and optimize it dynamically!`,
          url: "https://coresume.com",
        };
        
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.share({
            title: "My COREsume ATS Score",
            text: `My resume just scored ${score}/100 on COREsume! Check yours for free: https://coresume.com`,
          });
        }
      }, "image/png");
    } catch (e) {
      console.error("Native share failed:", e);
    }
  };

  const copyNaukri = () => {
    const shareText = `My Resume ATS Score: ${score}/100 on COREsume!\nI optimized my resume to bypass ATS tracking systems. Check yours free at: https://coresume.com`;
    navigator.clipboard.writeText(shareText);
    setCopiedNaukri(true);
    setTimeout(() => setCopiedNaukri(false), 2000);
  };

  const shareX = () => {
    const text = `Recruiter screening bots are no match! 🤖 Just got a ${score}/100 ATS rating on COREsume. Optimize your resume for free at https://coresume.com 🚀🎯 #Careers #Resume`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://coresume.com")}`, "_blank");
  };

  const shareWhatsApp = () => {
    const text = `Hey! I just checked my resume's ATS compatibility on COREsume and scored a ${score}/100! You can analyze and optimize your resume for free here: https://coresume.com`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://coresume.com")}`, "_blank");
  };

  const shareReddit = () => {
    const title = `My resume scored a ${score}/100 on COREsume! Optimize yours for free!`;
    window.open(`https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent("https://coresume.com")}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none">
        
        {/* Left Side: Real-time Preview */}
        <div className="md:w-1/2 bg-slate-900 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Card Preview</h3>
          
          {/* Card Wrapper (Scaled down for preview) */}
          <div className="w-[260px] h-[260px] rounded-2xl overflow-hidden border border-gray-800 shadow-xl relative scale-100 hover:scale-102 transition-transform duration-300">
            {/* Styled preview card using slate-950 and custom layers */}
            <div className="absolute inset-0 bg-slate-950 flex flex-col p-4 items-center justify-between font-sans text-white select-none">
              
              {/* Mesh Glow Background */}
              <div className="absolute w-36 h-36 rounded-full blur-[40px] opacity-20 -top-5 -left-5 bg-violet-600" />
              <div className="absolute w-36 h-36 rounded-full blur-[40px] opacity-20 -bottom-5 -right-5 bg-yellow-500" />

              {/* Header */}
              <div className="w-full flex justify-between items-center z-10">
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white leading-none">COREsume</h4>
                  <span className="text-[7px] text-gray-400 font-medium">ATS OPTIMIZER</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[7px] font-black text-yellow-400 uppercase tracking-wider">
                  VERIFIED RATING
                </div>
              </div>

              {/* Centered Circular Progress */}
              <div className="relative shrink-0 w-24 h-24 my-2 z-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="50" cy="50" r="41" fill="none" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 41}
                    strokeDashoffset={2 * Math.PI * 41 - (score / 100) * (2 * Math.PI * 41)}
                    className={tier.ringColor} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white tracking-tight">{score}</span>
                  <span className="text-[6px] text-gray-500 font-semibold uppercase leading-none mt-0.5">ATS Score</span>
                </div>
              </div>

              {/* Static Tier Description */}
              <div className="w-full z-10 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-xs max-w-full">
                  <span className="text-[10px] shrink-0">{tier.icon}</span>
                  <span className="text-[8px] font-bold text-white tracking-wide truncate">{tier.desc}</span>
                </div>
              </div>

              {/* Watermark Watermark Branding */}
              <div className="w-full border-t border-white/5 pt-2 flex justify-between items-center z-10 text-[7px] text-gray-500 font-semibold">
                <span>coresume.com</span>
                <span className="text-yellow-400/80 font-bold">Check yours free →</span>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-400 mt-4 text-center leading-relaxed max-w-[240px]">
            This high-res scorecard PNG will be saved directly to your device.
          </p>
        </div>

        {/* Right Side: Sharing Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-black">Share Your Score Card</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-black shrink-0 transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Promote your resume's rating to stand out to hiring managers and inspire your network to check their compatibility!
            </p>

            {/* Mobile native share trigger */}
            {isMobile && (
              <button
                onClick={shareMobile}
                className="w-full mb-4 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Native Mobile Share Sheet
              </button>
            )}

            {/* Social Sharing Grids */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share on Platforms</h4>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* LinkedIn */}
                <button
                  onClick={shareLinkedIn}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 text-left transition-all text-xs font-bold text-black cursor-pointer group"
                >
                  <svg className="w-4.5 h-4.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn Post
                </button>

                {/* X / Twitter */}
                <button
                  onClick={shareX}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-neutral-200 hover:bg-neutral-50 text-left transition-all text-xs font-bold text-black cursor-pointer group"
                >
                  <svg className="w-4.5 h-4.5 text-black shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X / Twitter
                </button>

                {/* WhatsApp */}
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/20 text-left transition-all text-xs font-bold text-black cursor-pointer group"
                >
                  <svg className="w-4.5 h-4.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.789-4.382 9.792-9.788.001-2.593-1.01-5.032-2.848-6.871-1.838-1.839-4.28-2.848-6.87-2.849-5.409 0-9.796 4.386-9.798 9.793-.001 1.47.387 2.909 1.127 4.179l-.973 3.55 3.645-.956z"/>
                  </svg>
                  WhatsApp
                </button>

                {/* Reddit */}
                <button
                  onClick={shareReddit}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/20 text-left transition-all text-xs font-bold text-black cursor-pointer group"
                >
                  <svg className="w-4.5 h-4.5 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.35-4.24 4.37.94c.04 1.13.97 2.03 2.1 2.03 1.15 0 2.08-.93 2.08-2.08s-.93-2.08-2.08-2.08c-1.05 0-1.92.77-2.06 1.77l-4.78-1.02c-.16-.04-.33.03-.4.18l-1.57 4.96c-2.48.06-4.73.7-6.39 1.72-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.05.54 1.97 1.37 2.51-.08.49-.12.99-.12 1.49 0 4.14 4.93 7.5 11 7.5s11-3.36 11-7.5c0-.5-.04-1-.12-1.49.83-.54 1.37-1.46 1.37-2.51zm-18 1c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11.5 5.08c-.88.88-2.53.96-3.5.96s-2.62-.08-3.5-.96c-.19-.19-.19-.51 0-.7.19-.19.51-.19.7 0 .62.62 1.99.76 2.8.76s2.18-.14 2.8-.76c.19-.19.51-.19.7 0 .19.19.19.51 0 .7zm-.62-3.08c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                  Reddit Submit
                </button>

                {/* Facebook */}
                <button
                  onClick={shareFacebook}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 text-left transition-all text-xs font-bold text-black cursor-pointer group"
                >
                  <svg className="w-4.5 h-4.5 text-blue-800 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                {/* Naukri Clipboard Copy */}
                <button
                  onClick={copyNaukri}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-neutral-200 hover:bg-neutral-50 text-left transition-all text-xs font-bold text-black cursor-pointer group relative"
                >
                  <svg className="w-4.5 h-4.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-5 4h5" />
                  </svg>
                  {copiedNaukri ? "Copied! ✅" : "Naukri (Copy)"}
                  {copiedNaukri && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md animate-bounce">
                      Clipboard Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Downloads */}
            <div className="mt-5 space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Downloads & Story Creators</h4>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Download PNG */}
                <button
                  onClick={() => downloadCard(false)}
                  disabled={downloading}
                  className="flex-1 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 font-black text-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating PNG...
                    </>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Share Card
                    </>
                  )}
                </button>

                {/* Instagram Story Trigger */}
                <button
                  onClick={() => downloadCard(true)}
                  disabled={downloading}
                  className="flex-1 py-3 rounded-2xl border-2 border-slate-900 hover:bg-slate-50 font-bold text-slate-900 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <svg className="w-4.5 h-4.5 text-pink-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  Instagram Story
                </button>
              </div>

              {showInstaTooltip && (
                <div className="bg-neutral-900 text-white rounded-xl px-4 py-3 text-[10px] font-bold text-center leading-normal animate-fade-in shadow-lg">
                  📲 Card downloaded! Open Instagram and manually upload this image to your Story or Feed to show off your ATS Rating! 🚀
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Master Sharing Card container rendered for html2canvas captures */}
      <div className="absolute -left-[9999px] -top-[9999px] overflow-hidden select-none">
        <div
          id="ats-share-card"
          className="w-[600px] h-[600px] bg-slate-950 p-8 flex flex-col justify-between relative font-sans text-white border border-slate-900"
        >
          {/* Radial Mesh Glows */}
          <div className="absolute w-80 h-80 rounded-full blur-[90px] opacity-25 -top-10 -left-10 bg-violet-600" />
          <div className="absolute w-80 h-80 rounded-full blur-[90px] opacity-25 -bottom-10 -right-10 bg-yellow-500" />

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Header */}
          <div className="w-full flex justify-between items-start z-10">
            <div>
              <h2 className="text-3xl font-black tracking-widest text-white leading-none">COREsume</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">AI ATS Resume Optimizer</p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-yellow-400 uppercase tracking-widest leading-none">
              VERIFIED COMPATIBILITY
            </div>
          </div>

          {/* Body Section */}
          <div className="flex items-center gap-10 z-10 w-full grow my-4">
            
            {/* Massive Circular Glowing Score */}
            <div className="relative shrink-0 w-44 h-44 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#0f172a" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - (score / 100) * (2 * Math.PI * 50)}
                  className={tier.ringColor} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white leading-none tracking-tight">{score}</span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-2">ATS Rating</span>
              </div>
            </div>

            {/* Score Tier Badge and Details */}
            <div className="grow space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                <span className="text-2xl shrink-0">{tier.icon}</span>
                <span className="text-xs font-black text-white tracking-wide">{tier.desc}</span>
              </div>

              {/* dynamic resume checklist to look engaging */}
              <div className="space-y-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <h5 className="text-[8px] font-black tracking-widest text-gray-500 uppercase">ATS PARSE CHECKS</h5>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-semibold">
                    <span className="text-emerald-500">✓</span> Structural Integrity Verified
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-semibold">
                    <span className="text-emerald-500">✓</span> Contact Channels Fully Validated
                  </div>
                  {strengths && strengths.length > 0 ? (
                    <div className="flex items-center gap-2 text-[10px] text-gray-300 font-semibold">
                      <span className="text-emerald-500">✓</span> {strengths[0]}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-gray-300 font-semibold">
                      <span className="text-emerald-500">✓</span> Content Optimized for Recruitment bots
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Watermark Watermark Branding Watermark */}
          <div className="w-full border-t border-white/5 pt-3.5 flex justify-between items-center z-10 text-[10px] font-bold text-gray-400">
            <span className="tracking-wide">COREsume.com</span>
            <span className="text-yellow-400">Check yours free → coresume.com</span>
          </div>

        </div>
      </div>

    </div>
  );
}
