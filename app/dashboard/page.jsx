"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        "• Built with Next.js, TypeScript, and Tailwind CSS\n• 2,400+ GitHub stars; used by developers in 40+ countries\n• Automated deployment via GitHub Actions CI/CD pipeline",
      link: "https://github.com/alexmorgan/devportfolio",
    },
  ],
  achievements:
    "• AWS Certified Solutions Architect (2022)\n• Engineering Excellence Award, TechCorp 2023\n• Speaker at ReactConf 2022",
  interests: "Open source contribution, technical writing, rock climbing",
};

function TemplatePreview({ Component }) {
  const SCALE = 0.42;
  return (
    <div
      className="w-full overflow-hidden bg-white border-b border-gray-100"
      style={{ height: "300px", position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: `translateX(-50%) scale(${SCALE})`,
          transformOrigin: "top center",
          width: "900px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <Component />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const originalDataRef = useRef(null);
  const previewSetupRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  // Restore original localStorage data when leaving dashboard
  useEffect(() => {
    return () => {
      if (previewSetupRef.current) {
        if (originalDataRef.current !== null) {
          localStorage.setItem("resumeFormData", originalDataRef.current);
        } else {
          localStorage.removeItem("resumeFormData");
        }
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/credits", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setCredits(data.credits);
      if (!res.ok) {
        router.push("/login");
        return;
      }
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) return null;

  // Store sample data in ResumePreviewData (dedicated preview key, never touches real user data)
  // Then temporarily copy it into resumeFormData so templates can render — restored on unmount
  if (!previewSetupRef.current) {
    localStorage.setItem("ResumePreviewData", JSON.stringify(SAMPLE_DATA));
    originalDataRef.current = localStorage.getItem("resumeFormData");
    localStorage.setItem("resumeFormData", localStorage.getItem("ResumePreviewData"));
    previewSetupRef.current = true;
  }

  // Templates
  const allTemplates = [
    { name: "Classic Professional", slug: "minimalist", Component: MinimalistTemplate, description: "Clean, single-column layout with a timeless professional presentation." },
    { name: "Executive Sidebar", slug: "sidebar-elegance", Component: SidebarEleganceTemplate, description: "Structured two-column design with a polished side panel for key details." },
    { name: "Career Timeline", slug: "timeline", Component: TimelineProTemplate, description: "Chronological timeline layout designed to present career progression with clarity and authority." },
    { name: "Professional Elite", slug: "premium-single-column", Component: PremiumSingleColumnResume, description: "Refined single-column format with disciplined spacing and strong ATS performance." },
    { name: "Apex One", slug: "premium-two-column", Component: PremiumTwoColumnTemplate, description: "Balanced two-column layout with an executive tone and clean readability." },
    { name: "ATS Classic", slug: "ats-classic", Component: AtsClassicTemplate, description: "Bold single-column structure with crisp section headers designed for excellent ATS parsing." },
    { name: "Executive Edge", slug: "executive-edge", Component: ExecutiveEdgeTemplate, description: "Executive style with a focused side panel for skills, education, and key achievements." },
    { name: "Impact Grid", slug: "impact-grid", Component: ImpactGridTemplate, description: "Balanced grid layout that surfaces summary, skills, and impact sections without sacrificing ATS compatibility." },
    { name: "Compact Pro", slug: "compact-pro", Component: CompactProTemplate, description: "High-density one-page resume layout optimized for experienced candidates and recruiter quick scans." },
  ];

  // Tips
  const tips = [
    { title: "✅ Add Your LinkedIn, GitHub, and Portfolio", desc: "Our templates neatly format them and it boosts recruiter trust. Don’t leave them empty!" },
    { title: "🔹 Use Bullet Points in Experience/Projects/Skills", desc: "Use bullet points where they are needed to show case your Experience, Projects, and Skills in a better way" },
    { title: "🔍 Avoid Spelling & Grammar Mistakes", desc: "Always double-check your input before generating the resume. Typos in your name, job title, or experience can make a bad first impression — even if the template looks great." },
    { title: "📊 Quantify Your Impact in Experience Section", desc: "Instead of saying 'Handled social media marketing', say 'Increased Instagram engagement by 40% in 2 months'. Numbers show results — and recruiters love that." },
    { title: "🎯 Keep Objective Short and Focused", desc: "Use 2-3 lines. Avoid generic buzzwords. Tailor it to your goals." },
    { title: "💡 Choose Template Before You Start", desc: "Each template presents data differently. Select your style first, then enter your info accordingly." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />

      {/* Hero Section */}
      <main className="grow pt-16">
        <section className="text-center px-4 sm:px-6 pt-4 sm:pt-8 pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black leading-tight mb-4">
            Build Your Job-Winning Resume with <span className="text-black">CORE</span><span className="text-yellow-400">sume</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Your resume is your first impression. Free builders blur it. <span className="font-semibold text-black">COREsume sharpens it.</span>
          </p>
        </section>

        {/* Templates Section */}
        <section className="text-center py-6">
          <h2 className="text-3xl font-bold text-black mb-4">Choose Your Resume Template ✨</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Start free or unlock premium polished designs — all ATS friendly.</p>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allTemplates.map((template, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col h-full">
                <TemplatePreview Component={template.Component} />
                <div className="p-6 flex flex-col grow">
                  <h3 className="text-xl font-semibold mb-2 text-black">{template.name}</h3>
                  <p className="text-gray-600 mb-4 grow">{template.description}</p>
                  <Link href={`/resume-form?template=${template.slug}`} className="block w-full text-center py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-medium mt-auto">
                    Use This Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-black mb-10">Best Tips to Use COREsume Efficiently ⚡</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h4 className="text-lg font-semibold text-black mb-2">{tip.title}</h4>
                <p className="text-gray-600 text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
