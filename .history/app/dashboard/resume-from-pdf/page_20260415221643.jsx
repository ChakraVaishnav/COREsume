"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MinimalistTemplate from "@/app/templates/single-column";
import SidebarEleganceTemplate from "@/app/templates/two-column";
import TimelineProTemplate from "@/app/templates/timeline";
import PremiumSingleColumnResume from "@/app/templates/premium-single-column";
import PremiumTwoColumnTemplate from "@/app/templates/premium-two-column";
import AtsClassicTemplate from "@/app/templates/ats-classic";
import ExecutiveEdgeTemplate from "@/app/templates/executive-edge";
import ImpactGridTemplate from "@/app/templates/impact-grid";
import CompactProTemplate from "@/app/templates/compact-pro";

const SAMPLE_DATA = {
  personalInfo: {
    name: "Alexandra Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 234-5678",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    portfolio: "https://alexmorgan.dev",
  },
  appliedJob: "Senior Software Engineer",
  summary:
    "Results-driven software engineer with 6+ years building scalable web applications. Specialized in React, Node.js, and cloud infrastructure. Led teams delivering products used by 500K+ users.",
  skills:
    "Programming: JavaScript, TypeScript, Python\nFrameworks: React, Next.js, Node.js\nDatabases: PostgreSQL, MongoDB, Redis\nCloud: AWS, Docker, Kubernetes",
  education: "B.S. Computer Science\nState University, 2018\nGPA: 3.8/4.0",
  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "TechCorp Inc.",
      duration: "2021 – Present",
      description:
        "• Led development of React dashboard serving 200K daily active users\n• Reduced page load time by 45% through code splitting and lazy loading\n• Mentored 4 junior engineers and established frontend coding standards",
    },
    {
      role: "Software Engineer",
      company: "StartupXYZ",
      duration: "2019 – 2021",
      description:
        "• Built RESTful APIs handling 10M+ requests/day using Node.js\n• Migrated legacy codebase to TypeScript, reducing runtime errors by 60%",
    },
  ],
  projects: [
    {
      name: "DevPortfolio — Open Source Portfolio Builder",
      description:
        "• Built with Next.js, TypeScript, and Tailwind CSS\n• 2,400+ GitHub stars; used by developers in 40+ countries",
      link: "https://github.com/alexmorgan/devportfolio",
    },
  ],
  achievements:
    "• AWS Certified Solutions Architect (2022)\n• Engineering Excellence Award, TechCorp 2023",
  interests: "Open source contribution, technical writing, rock climbing",
  codingProfiles: [],
  customSections: [],
};

const ALL_TEMPLATES = [
  { name: "Classic Professional", slug: "minimalist", Component: MinimalistTemplate, desc: "Clean single-column layout." },
  { name: "Executive Sidebar", slug: "sidebar-elegance", Component: SidebarEleganceTemplate, desc: "Two-column with side panel." },
  { name: "Career Timeline", slug: "timeline", Component: TimelineProTemplate, desc: "Chronological timeline design." },
  { name: "Professional Elite", slug: "premium-single-column", Component: PremiumSingleColumnResume, desc: "Refined serif single column." },
  { name: "Apex One", slug: "premium-two-column", Component: PremiumTwoColumnTemplate, desc: "Balanced two-column executive." },
  { name: "ATS Classic", slug: "ats-classic", Component: AtsClassicTemplate, desc: "Maximum ATS compatibility." },
  { name: "Executive Edge", slug: "executive-edge", Component: ExecutiveEdgeTemplate, desc: "Dark header, structured grid." },
  { name: "Impact Grid", slug: "impact-grid", Component: ImpactGridTemplate, desc: "Modern card grid layout." },
  { name: "Compact Pro", slug: "compact-pro", Component: CompactProTemplate, desc: "High-density one-pager." },
];

function normalizeExtractedResumeData(raw) {
  const safe = raw && typeof raw === "object" ? raw : {};
  const personalInfo = safe.personalInfo && typeof safe.personalInfo === "object" ? safe.personalInfo : {};

  return {
    personalInfo: {
      name: personalInfo.name || "",
      email: personalInfo.email || "",
      phone: personalInfo.phone || "",
      linkedin: personalInfo.linkedin || "",
      github: personalInfo.github || "",
      portfolio: personalInfo.portfolio || "",
    },
    appliedJob: safe.appliedJob || safe.jobrole || "",
    jobrole: safe.appliedJob || safe.jobrole || "",
    experienceLevel: safe.experienceLevel || "",
    summary: safe.summary || "",
    skills: safe.skills || "",
    education: safe.education || "",
    experience: Array.isArray(safe.experience) && safe.experience.length
      ? safe.experience
      : [{ role: "", company: "", duration: "", description: "" }],
    projects: Array.isArray(safe.projects) && safe.projects.length
      ? safe.projects
      : [{ name: "", description: "", link: "" }],
    achievements: safe.achievements || "",
    interests: safe.interests || "",
    codingProfiles: Array.isArray(safe.codingProfiles) ? safe.codingProfiles : [{ platform: "", username: "", link: "" }],
    customSections: Array.isArray(safe.customSections) ? safe.customSections : [],
  };
}

function TemplatePreview({ Component }) {
  const SCALE = 0.38;
  return (
    <div className="w-full overflow-hidden bg-white border-b border-gray-100" style={{ height: "260px", position: "relative" }}>
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: `translateX(-50%) scale(${SCALE})`,
        transformOrigin: "top center",
        width: "900px",
        pointerEvents: "none",
        userSelect: "none",
      }}>
        <Component />
      </div>
    </div>
  );
}

const STEPS = ["Upload PDF", "Choose Template", "Processing…"];

export default function ResumeFromPdfPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const originalDataRef = useRef(null);
  const previewSetupRef = useRef(false);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set up sample data for template previews when moving to step 1
  useEffect(() => {
    if (step === 1 && !previewSetupRef.current) {
      originalDataRef.current = localStorage.getItem("resumeFormData");
      localStorage.setItem("resumeFormData", JSON.stringify(SAMPLE_DATA));
      previewSetupRef.current = true;
    }
    if (step !== 1 && previewSetupRef.current) {
      if (originalDataRef.current !== null) {
        localStorage.setItem("resumeFormData", originalDataRef.current);
      } else {
        localStorage.removeItem("resumeFormData");
      }
      previewSetupRef.current = false;
    }
  }, [step]);

  useEffect(() => {
    return () => {
      if (previewSetupRef.current) {
        if (originalDataRef.current !== null) {
          localStorage.setItem("resumeFormData", originalDataRef.current);
        } else {
          localStorage.removeItem("resumeFormData");
        }
        previewSetupRef.current = false;
      }
    };
  }, []);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError("");
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleTemplateSelect = async (slug) => {
    // Restore real user data before extraction
    if (originalDataRef.current !== null) {
      localStorage.setItem("resumeFormData", originalDataRef.current);
    } else {
      localStorage.removeItem("resumeFormData");
    }

    setExtracting(true);
    setError("");
    setStep(2);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await fetch("/api/ai/extract-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Extraction failed");
      const normalized = normalizeExtractedResumeData(data);
      localStorage.removeItem("ResumePreviewData");
      localStorage.setItem("resumeFormData", JSON.stringify(normalized));
      router.push(`/resume-form?template=${slug}`);
    } catch (e) {
      setError(e.message || "Failed to extract resume data. Please try again.");
      setStep(1);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />

      <main className="grow pt-20 pb-16">
        <div className="w-full px-4 sm:px-8">
          {/* Back */}
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mt-6 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── LEFT PANEL ── */}
            <div className="w-full lg:w-[380px] lg:shrink-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Resume from Existing PDF</h1>
              <p className="text-gray-500 text-sm mb-6">
                Upload your resume PDF — AI extracts all your data and fills the form. No typing needed.
              </p>

              {/* Step pills */}
              <div className="flex items-center gap-1.5 mb-7">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > i ? "bg-yellow-500 text-white"
                      : step === i ? "bg-yellow-300 text-gray-900"
                      : "bg-gray-200 text-gray-400"
                    }`}>
                      {step > i ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (i + 1)}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${step === i ? "text-gray-900 font-bold" : "text-gray-400"}`}>{s}</span>
                    {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-300 mx-1" />}
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 mb-5 ${
                  dragOver ? "border-yellow-400 bg-yellow-50"
                  : file ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-300 bg-white hover:border-yellow-400 hover:bg-yellow-50"
                }`}
              >
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])} />
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-bold text-gray-900 text-sm text-center break-all">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-700 text-sm">Drop your resume PDF here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  </>
                )}
              </div>

              <button
                onClick={() => file && setStep(1)}
                disabled={!file || step > 0}
                className="w-full py-3.5 rounded-xl font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Continue — Choose Template
              </button>

              {/* How it works */}
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">How it works</p>
                {[
                  "Upload your existing resume PDF",
                  "Pick a resume template from the preview",
                  "AI extracts all your data automatically",
                  "Resume form opens pre-filled — just review & generate",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="w-6 h-6 rounded-full bg-yellow-400 text-gray-900 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 min-w-0">
              {step === 0 && (
                <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-100 flex items-center justify-center mb-5">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-gray-300 font-bold text-lg">Upload a PDF to see templates</p>
                  <p className="text-gray-200 text-sm mt-1">Template previews will appear here</p>
                </div>
              )}

              {step === 1 && mounted && (
                <div>
                  <div className="mb-5">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">Choose Your Template</h2>
                    <p className="text-gray-500 text-sm">Click a template to extract your data and open the form.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {ALL_TEMPLATES.map((t) => (
                      <div
                        key={t.slug}
                        onClick={() => handleTemplateSelect(t.slug)}
                        className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col"
                      >
                        <div className="relative">
                          <TemplatePreview Component={t.Component} />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-all duration-300 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              Use This Template
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col grow">
                          <h3 className="font-bold text-gray-900 text-sm mb-1">{t.name}</h3>
                          <p className="text-gray-400 text-xs grow">{t.desc}</p>
                          <button className="mt-3 w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-bold transition-colors">
                            Select Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center min-h-64 lg:py-32">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Extracting Your Data…</h2>
                  <p className="text-gray-500 text-sm max-w-xs">
                    AI is reading your resume and filling in your information. This usually takes 5–15 seconds.
                  </p>
                  <div className="mt-8 flex gap-2 items-center justify-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
