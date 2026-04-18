"use client";

import { useState, useEffect } from "react";
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

const SAMPLE_DATA_STR = JSON.stringify(SAMPLE_DATA);

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

export default function TemplatesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  // Inject SAMPLE_DATA for previews (templates read ResumePreviewData)
  // We do NOT modify resumeFormData here so user data remains safe.
  useEffect(() => {
    localStorage.setItem("ResumePreviewData", SAMPLE_DATA_STR);

    return () => {
      localStorage.removeItem("ResumePreviewData");
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/credits", {
        method: "GET",
        credentials: "include",
      });
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

  const allTemplates = [
    { name: "Classic Professional", slug: "minimalist", Component: MinimalistTemplate, type: "free", description: "Clean, single-column layout with a timeless professional presentation." },
    { name: "Executive Sidebar", slug: "sidebar-elegance", Component: SidebarEleganceTemplate, type: "premium", description: "Structured two-column design with a polished side panel for key details." },
    { name: "Career Timeline", slug: "timeline", Component: TimelineProTemplate, type: "premium", description: "Chronological timeline layout designed to present career progression with clarity." },
    { name: "Professional Elite", slug: "premium-single-column", Component: PremiumSingleColumnResume, type: "premium", description: "Refined single-column format with disciplined spacing and strong ATS performance." },
    { name: "Apex One", slug: "premium-two-column", Component: PremiumTwoColumnTemplate, type: "premium", description: "Balanced two-column layout with an executive tone and clean readability." },
    { name: "ATS Classic", slug: "ats-classic", Component: AtsClassicTemplate, type: "premium", description: "Bold single-column structure with crisp section headers designed for excellent ATS parsing." },
    { name: "Executive Edge", slug: "executive-edge", Component: ExecutiveEdgeTemplate, type: "premium", description: "Executive style with a focused side panel for skills, education, and key achievements." },
    { name: "Impact Grid", slug: "impact-grid", Component: ImpactGridTemplate, type: "premium", description: "Balanced grid layout that surfaces summary, skills, and impact sections." },
    { name: "Compact Pro", slug: "compact-pro", Component: CompactProTemplate, type: "premium", description: "High-density one-page resume layout optimized for experienced candidates." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />
      <main className="grow pt-20 pb-16">
        {/* Header */}
        <section className="px-4 sm:px-8 py-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black text-sm font-medium mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-black mb-2">
            Choose Your Resume Template ✨
          </h1>
          <p className="text-gray-500 text-sm">
            All templates are free and ATS friendly.
          </p>
        </section>

        {/* Template Grid */}
        <section className="w-full px-4 sm:px-8 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {allTemplates.map((template, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col h-full hover:-translate-y-1"
              >
                <TemplatePreview Component={template.Component} />
                <div className="p-4 sm:p-6 flex flex-col grow">
                  <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2 text-black">{template.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-5 grow">{template.description}</p>
                  <Link
                    href={`/resume-form?template=${template.slug}`}
                    className="block w-full text-center py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition font-bold shadow-md hover:shadow-lg mt-auto"
                  >
                    Use This Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
