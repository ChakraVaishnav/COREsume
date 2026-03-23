"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/credits", { method: "GET", credentials: "include" });
      if (!res.ok) { router.push("/login"); return; }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) return null;

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Create Resume Using Templates",
      desc: "Browse ATS-friendly templates, enter your details, and get a job-winning resume in minutes.",
      action: "Browse Templates →",
      href: "/dashboard/templates",
      comingSoon: false,
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Check ATS Score",
      desc: "Upload your resume PDF and get an instant ATS score, spelling check, and improvement suggestions.",
      action: "Analyze My Resume →",
      href: "/dashboard/ats-score",
      badge: "AI Powered",
      comingSoon: false,
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      title: "Resume from PDF",
      desc: "Upload your existing resume PDF and we'll auto-fill our form — no manual typing needed.",
      action: "Import My Resume →",
      href: "/dashboard/resume-from-pdf",
      badge: "AI Powered",
      comingSoon: false,
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Best Resumes by Company",
      desc: "Real resumes that got students shortlisted at top companies — curated and categorised.",
      action: "Coming Soon",
      href: null,
      badge: "Coming Soon",
      comingSoon: true,
    },
  ];

  const tips = [
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>, title: "Add LinkedIn, GitHub & Portfolio", desc: "Templates format them neatly — recruiters notice social proof." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" /></svg>, title: "Use Bullet Points", desc: "Bullets in experience, projects and skills are faster to scan." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Avoid Spelling Mistakes", desc: "Double-check before generating. Typos in name or title cost you." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>, title: "Quantify Your Impact", desc: "'Increased engagement by 40%' beats 'managed social media'." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>, title: "Keep It One Page", desc: "Unless 10+ years experience, one page is the recruiter standard." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, title: "Tailor for Each Job", desc: "Adjust your summary and skills for each specific role." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, title: "Start with Action Verbs", desc: "Begin bullets with 'Led', 'Built', 'Designed' — never with 'I'." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, title: "Include a Professional Summary", desc: "2–3 lines at the top tell recruiters who you are instantly." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, title: "List Relevant Projects", desc: "Academic or personal projects show initiative — add a demo link." },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, title: "Choose Template First", desc: "Each template presents data differently — pick style before typing." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />
      <main className="grow pt-20 pb-16">
        {/* Hero */}
        <section className="text-center px-4 pt-8 pb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black leading-tight mb-3">
            Welcome to <span className="text-black">CORE</span><span className="text-yellow-400">sume</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
            Everything you need to build, analyse, and perfect your resume — powered by AI.
          </p>
        </section>

        {/* Feature cards — 4 in a row */}
        <section className="w-full px-4 sm:px-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white flex flex-col transition-all duration-300 ${f.comingSoon ? "opacity-70" : "hover:shadow-xl hover:-translate-y-1"}`}>
                {/* Yellow top stripe */}
                <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
                <div className="p-5 flex flex-col grow">
                  {f.badge && (
                    <span className={`inline-block self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 ${f.badge === "Coming Soon" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {f.badge}
                    </span>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-yellow-400 text-black shadow">
                      {f.icon}
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-black leading-snug pt-0.5">{f.title}</h2>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed grow">{f.desc}</p>
                  <div className="mt-5">
                    {f.comingSoon ? (
                      <div className="w-full text-center py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed">
                        🔒 Coming Soon
                      </div>
                    ) : (
                      <Link href={f.href} className="block w-full text-center py-2.5 rounded-xl font-bold text-xs transition-all duration-200 shadow hover:shadow-md bg-yellow-400 hover:bg-yellow-500 text-black">
                        {f.action}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips */}
        <section className="w-full px-4 sm:px-8 pt-12 pb-8 border-t border-gray-200 mt-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-black mb-6 sm:mb-8">
            Pro Tips to Build a Standout Resume
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col gap-2">
                <div className="w-9 h-9 rounded-lg bg-yellow-400 text-black flex items-center justify-center shrink-0">
                  {tip.icon}
                </div>
                <h4 className="font-bold text-black text-sm leading-snug">{tip.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
