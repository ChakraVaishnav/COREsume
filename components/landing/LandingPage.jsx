"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const FEATURE_FLOW = [
  {
    step: "01",
    icon: "🧾",
    title: "Resume Builder + Live Preview",
    desc: "Build section-by-section and instantly preview final output while you edit.",
    chips: ["Personal Info", "Projects", "Skills", "Experience"],
  },
  {
    step: "02",
    icon: "🎨",
    title: "9+ ATS-Friendly Templates",
    desc: "Switch layouts that are modern for recruiters and clean for ATS parsers.",
    chips: ["Classic", "Executive", "Compact", "Professional"],
  },
  {
    step: "03",
    icon: "📄",
    title: "Resume from PDF",
    desc: "Upload an existing PDF and auto-fill your form without manual retyping.",
    chips: ["Fast Extraction", "Structured Fill", "Editable"],
  },
  {
    step: "04",
    icon: "✨",
    title: "AI Resume Assistant",
    desc: "Generate summaries, improve skills, quantify impact, and strengthen project bullets.",
    chips: ["Summary", "Skills", "Quantify", "Project Bullets"],
  },
  {
    step: "05",
    icon: "🎯",
    title: "ATS Score + Suggestions",
    desc: "Get scoring, strengths, and actionable improvement guidance before you apply.",
    chips: ["Rule-Based", "Instant", "Private"],
  },
  {
    step: "06",
    icon: "🔍",
    title: "Smart Job Matching",
    desc: "Find and rank jobs by resume fit with free and premium search modes.",
    chips: ["High Fit", "Moderate Fit", "Low Fit"],
  },
  {
    step: "07",
    icon: "🗂️",
    title: "Kanban Pipeline Tracker",
    desc: "Track each application from Applied to Joined with drag-and-drop stage management.",
    chips: ["Applied", "Interviewing", "Offer", "Joined"],
  },
  {
    step: "08",
    icon: "💾",
    title: "Multiple Export Options",
    desc: "Download quick PDF, editable DOCX, or custom PDF tuned for final submission.",
    chips: ["Quick PDF", "DOCX", "Custom PDF"],
  },
  {
    step: "09",
    icon: "💳",
    title: "Credits + Razorpay Payments",
    desc: "Use daily free limits first, then top up credits securely when you need more AI actions.",
    chips: ["Daily Free", "One-Time Packs", "Verified Credits"],
  },
  {
    step: "10",
    icon: "🔐",
    title: "Secure Sessions + Protected APIs",
    desc: "Cookie-based authenticated sessions keep your resume, jobs, and billing workflows safe.",
    chips: ["JWT", "HttpOnly Cookies", "Protected Routes"],
  },
];

export function LandingPage() {
  const [stats, setStats] = useState({
    resumeCount: "250+",
    templateCount: 9,
    languagesCount: 5,
  });

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] overflow-x-hidden">
      <Navbar fixed />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight font-serif" style={{ fontFamily: "'Instrument Serif', serif" }}>
            The Resume Builder Built for Indian Placements
          </h1>
          <p className="text-xl text-[#555555] mb-8 max-w-2xl mx-auto lg:mx-0">
            ATS scoring, AI suggestions, job matching — built for students targeting top companies.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              href="/signup"
              className="bg-[#FFD600] text-black font-semibold rounded-lg px-8 py-4 hover:brightness-95 transition-all text-lg w-full sm:w-auto text-center"
            >
              Build My Resume Free &rarr;
            </Link>
            <a
              href="#feature-flow"
              className="border border-[#E5E5E5] text-black font-semibold rounded-lg px-8 py-4 hover:bg-[#F9F9F9] transition-all text-lg w-full sm:w-auto text-center"
            >
              Explore Product Flow
            </a>
          </div>
        </div>
        <div className="flex-1 w-full max-w-xl">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-[#E5E5E5] bg-[#F9F9F9]">
            <Image
              src="/editor-preview.png"
              alt="Editor Preview"
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/800x600?text=Editor+Preview";
              }}
            />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-4">Everything you need to get hired</h2>
          <p className="text-lg text-[#555555] max-w-2xl mx-auto">
            Powerful tools designed specifically to help you beat the ATS and impress recruiters.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🎯"
            title="ATS Scorer"
            desc="Know your score before you apply. Instant rule-based scoring — fast, private, accurate."
          />
          <FeatureCard
            icon="✨"
            title="AI Content Suggestions"
            desc="Groq-powered bullet point improvements. Sound like a professional, not a fresher."
          />
          <FeatureCard
            icon="🔍"
            title="Job Search"
            desc="Find relevant openings matched to your resume. Real jobs. High Fit / Moderate Fit / Low Fit ranking."
          />
          <FeatureCard
            icon="📄"
            title="Resume from PDF"
            desc="Upload your existing resume PDF — we auto-fill the form. No manual re-typing. Instant."
          />
          <FeatureCard
            icon="💾"
            title="Multiple Export Options"
            desc="Quick PDF for one-tap download. DOCX for Word editing. Custom PDF to tune scale and margins."
          />
          <FeatureCard
            icon="🎨"
            title="9+ ATS-Friendly Templates"
            desc="Modern, minimal designs built for ATS readability and recruiter approval."
          />
          <FeatureCard
            icon="🗂️"
            title="Kanban Application Pipeline"
            desc="Track every application in one board from Applied to Offer/Joined with easy drag-and-drop status updates."
          />
        </div>
      </section>

      <section id="feature-flow" className="py-20 px-4 sm:px-8 bg-[#0E0E0E] border-y border-black/10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#FFD600] px-4 py-1 text-xs font-extrabold tracking-wide text-black">
              FULL PLATFORM WALKTHROUGH
            </p>
            <h2 className="mt-5 text-4xl lg:text-5xl font-bold text-white font-serif">Everything COREsume Does, In One Flow</h2>
            <p className="mt-4 text-base sm:text-lg text-[#BDBDBD] max-w-3xl mx-auto">
              From drafting your resume to tracking applications and unlocking premium actions, every major feature is connected in one smooth workflow.
            </p>
          </div>

          <div className="flow-track" aria-hidden="true" />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {FEATURE_FLOW.map((item, idx) => (
              <article
                key={item.step}
                className="flow-card"
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flow-step">{item.step}</div>
                  <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm text-[#CECECE] leading-relaxed">{item.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <span key={chip} className="flow-chip">{chip}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-[#FFD600] text-black font-semibold rounded-lg px-7 py-3 hover:brightness-95 transition-all"
            >
              Start With Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-[#F9F9F9] border-y border-[#E5E5E5] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold font-serif text-center mb-16">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-between relative">
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-[#E5E5E5] z-0"></div>
            {[
              { step: 1, title: "Create Account", desc: "Sign up in seconds" },
              { step: 2, title: "Fill Your Details", desc: "Auto-fill from existing PDF or type manually" },
              { step: 3, title: "AI + ATS Check", desc: "Get score and AI improvements instantly" },
              { step: 4, title: "Download & Apply", desc: "PDF, DOCX, or custom print. One click." },
            ].map((item) => (
              <div key={item.step} className="flex-1 text-center relative z-10">
                <div className="flex items-center justify-center w-14 h-14 bg-[#FFD600] text-black font-bold text-xl rounded-full mb-6 mx-auto shadow-md">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-[#555555]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD OPTIONS SECTION */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold font-serif text-center mb-16">Export The Way You Want</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DownloadCard
            title="Quick PDF"
            desc="Generates instantly. Best for one-tap download."
          />
          <DownloadCard
            title="Download as DOCX"
            desc="Edit in Microsoft Word anytime."
          />
          <DownloadCard
            title="Customize & Save PDF"
            desc="Opens print dialog to tune layout."
          />
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-[#F9F9F9] border-y border-[#E5E5E5] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-4">Simple Credit Pricing. No Subscriptions.</h2>
          <p className="text-xl text-[#555555] mb-12">1 Credit = 1 AI action. Buy once, use anytime.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter"
              price="₹29"
              subtitle="one-time"
              credits="5 Credits"
            />
            <PricingCard
              title="Value Pack"
              price="₹49"
              subtitle="one-time"
              credits="10 Credits"
              popular
            />
            <PricingCard
              title="Ultra Value Pack"
              price="₹99"
              subtitle="one-time"
              credits="25 Credits"
            />
          </div>

          <p className="text-[#555555] font-medium">
            ✦ 2 free ATS checks + 2 free PDF uploads every day — credits only needed beyond that.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold font-serif text-center mb-16">What Students Say</h2>
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbars">
          {[
            { name: "@akkaris", review: "Easy to use platform" },
            { name: "@neeraj", review: "Good — the resume templates are professional." },
            { name: "@Sidhu", review: "Excellent website for resume building. Very useful and time saving." },
            { name: "Chaitu", review: "Excellent website for resume building. Very useful and time saving." },
          ].map((t, i) => (
            <div key={i} className="min-w-[300px] md:min-w-[350px] snap-center bg-white border border-[#E5E5E5] p-8 rounded-xl shadow-sm">
              <div className="text-yellow-400 mb-4 text-lg">⭐⭐⭐⭐⭐</div>
              <p className="text-[#111111] mb-6 font-medium leading-relaxed">"{t.review}"</p>
              <p className="text-[#555555] font-semibold">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-[#F9F9F9] border-t border-[#E5E5E5] px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold font-serif text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FaqItem
              q="Is COREsume really free?"
              a="Yes. Building and downloading resumes is completely free. Credits are only needed for AI features beyond the daily free limit."
            />
            <FaqItem
              q="What are credits used for?"
              a="1 credit = 1 AI action (summary, skills, quantification). ATS checks and PDF uploads cost 3 credits beyond the 2 free/day limit."
            />
            <FaqItem
              q="Will my resume pass ATS filters?"
              a="Our rule-based ATS scorer checks formatting, keywords, and structure — the same signals real ATS systems scan."
            />
            <FaqItem
              q="How is the Job Search feature different?"
              a="It matches real job postings to your resume and ranks them High Fit / Moderate Fit / Low Fit so you apply smarter."
            />
            <FaqItem
              q="Can I upload my existing resume?"
              a="Yes. Use Resume from PDF to auto-fill the entire form from your existing PDF — no manual typing needed."
            />
            <FaqItem
              q="What download formats are supported?"
              a="Quick PDF (instant), DOCX (Word-editable), and Custom PDF (adjust scale, margins, layout)."
            />
            <FaqItem
              q="Is my data safe?"
              a="Yes. Your data is stored securely and never shared. You can delete your account anytime."
            />
            <FaqItem
              q="Does it work on mobile?"
              a="Yes. Fully responsive. Desktop recommended for editing comfort."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E5E5E5] py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-extrabold text-xl tracking-tight">COREsume</p>
            <p className="text-[#555555] text-sm mt-1">Made with ❤️ for Indian students</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-[#555555]">
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
            <Link href="/refund-policy" className="hover:text-black">Refund</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#555555]">© 2026 COREsume</p>
            <p className="text-sm text-[#555555] mt-1"><a href="mailto:team@coresume.in" className="hover:text-black">team@coresume.in</a></p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .flow-track {
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, rgba(255, 214, 0, 0.08) 0%, rgba(255, 214, 0, 0.85) 50%, rgba(255, 214, 0, 0.08) 100%);
          position: relative;
          overflow: hidden;
          border-radius: 999px;
        }

        .flow-track::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%);
          animation: flowSweep 3.5s linear infinite;
        }

        .flow-card {
          border: 1px solid #252525;
          border-radius: 1rem;
          padding: 1rem;
          background: linear-gradient(180deg, #171717 0%, #111111 100%);
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          animation: flowReveal 0.6s ease forwards;
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.25);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .flow-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 214, 0, 0.55);
          box-shadow: 0 18px 36px rgba(255, 214, 0, 0.12);
        }

        .flow-step {
          min-width: 56px;
          text-align: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: #121212;
          background: #ffd600;
          border-radius: 999px;
          padding: 0.25rem 0.6rem;
          letter-spacing: 0.08em;
        }

        .flow-chip {
          font-size: 0.7rem;
          line-height: 1;
          color: #f5f5f5;
          border: 1px solid #3a3a3a;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 999px;
          padding: 0.35rem 0.55rem;
        }

        @keyframes flowReveal {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes flowSweep {
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-8 rounded-2xl hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-[#555555] leading-relaxed">{desc}</p>
    </div>
  );
}

function DownloadCard({ title, desc }) {
  return (
    <div className="bg-white border border-[#E5E5E5] p-8 rounded-2xl text-center shadow-sm">
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-[#555555]">{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, subtitle, credits, popular }) {
  return (
    <div className={`bg-white rounded-2xl p-8 relative flex flex-col h-full ${popular ? "border-2 border-[#FFD600] shadow-xl" : "border border-[#E5E5E5] shadow-sm"
      }`}>
      {popular && (
        <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#FFD600] text-black text-xs font-bold px-3 py-1 rounded-full tracking-wide">
          MOST POPULAR
        </div>
      )}
      <h3 className="font-bold text-2xl mb-1">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-extrabold font-serif">{price}</span>
        <span className="text-[#555555] ml-2 text-sm">{subtitle}</span>
      </div>
      <div className="bg-[#F9F9F9] text-center font-bold text-lg py-3 rounded-lg border border-[#E5E5E5] mb-8">
        {credits}
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {[
          "AI Summary Generation",
          "AI Skills Generation",
          "Experience Quantifying",
          "Project Description Quantifying",
          "ATS Score Check (3 credits / extra check after 2 free/day)",
          "Resume from PDF (3 credits / extra use after 2 free/day)",
          "Job Search Access"
        ].map((feat, i) => (
          <li key={i} className="flex gap-3 text-sm text-[#111111] font-medium leading-tight">
            <span className="text-emerald-500 font-bold">✓</span>
            {feat}
          </li>
        ))}
      </ul>
      <Link href="/dashboard/pricing" className={`block text-center py-4 rounded-xl font-bold w-full transition-all ${popular ? "bg-[#FFD600] text-black hover:brightness-95" : "border border-[#E5E5E5] text-black hover:bg-[#F9F9F9]"
        }`}>
        Buy Now
      </Link>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E5E5] bg-white rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 font-bold flex justify-between items-center"
      >
        <span>{q}</span>
        <span className="text-[#555555] ml-4 text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-[#555555] leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}