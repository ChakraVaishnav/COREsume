"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TEMPLATES = [
  { name: "Classic Professional", slug: "minimalist" },
  { name: "Executive Sidebar", slug: "sidebar-elegance" },
  { name: "Career Timeline", slug: "timeline" },
  { name: "Professional Elite", slug: "premium-single-column" },
  { name: "Apex One", slug: "premium-two-column" },
  { name: "ATS Classic", slug: "ats-classic" },
  { name: "Executive Edge", slug: "executive-edge" },
  { name: "Impact Grid", slug: "impact-grid" },
  { name: "Compact Pro", slug: "compact-pro" },
];

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

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await fetch("/api/ai/analyze-ats", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
      setResult(data);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />

      <main className="grow pt-20 pb-16">
        <div className="w-full px-4 sm:px-8">
          {/* Back */}
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black text-sm font-medium mt-6 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          {/* Split layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── LEFT: Upload panel ── */}
            <div className="w-full lg:w-[420px] lg:shrink-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-1">ATS Score Checker</h1>
              <p className="text-gray-500 text-sm mb-6">
                Upload your resume PDF — AI will score it and suggest improvements.
              </p>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 mb-4 ${
                  dragOver ? "border-yellow-400 bg-yellow-50"
                  : file ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-300 bg-white hover:border-yellow-400 hover:bg-yellow-50"
                }`}
              >
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])} />
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-bold text-emerald-700 text-sm text-center break-all">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-700 text-sm">Drop your resume PDF here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  </>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={analyze}
                disabled={!file || analyzing}
                className="w-full py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analyze ATS Score
                  </>
                )}
              </button>

              {/* Info box */}
              {!result && !analyzing && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What we check</p>
                  {[
                    "ATS score based on essential sections",
                    "Missing contact details (email, phone, LinkedIn, GitHub)",
                    "Missing sections (summary, skills, projects, etc.)",
                    "Bullet points with no measurable impact",
                    "Spelling & grammar errors",
                    "Formatting quality when impact is weak",
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
                <div className="hidden lg:flex flex-col items-center justify-center min-h-64 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16">
                  <svg className="w-14 h-14 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-300 font-semibold">Your ATS analysis will appear here</p>
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
                  <div className={`rounded-2xl border p-6 bg-gradient-to-br ${scoreBg(result.atsScore)}`}>
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
                      <div className="text-center sm:text-left">
                        <h2 className="text-xl font-extrabold text-black mb-1">ATS Score</h2>
                        <p className={`font-bold ${scoreColor(result.atsScore)} mb-2`}>
                          {result.atsScore >= 80 ? "Excellent ✅" : result.atsScore >= 60 ? "Good — Room to Improve 🔶" : "Needs Work ❌"}
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">{result.summary}</p>
                      </div>
                    </div>
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
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-1">Refine Your Resume</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      We'll extract your resume data and open it in a template of your choice — ready to edit.
                    </p>
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-5 py-2.5 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow"
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
