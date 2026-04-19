"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

const MARQUEE_ITEMS = [
  "ATS Friendly",
  "AI Powered",
  "Instant PDF",
  "Free Templates",
  "Job Matching",
  "Skill Analysis",
  "Get Hired Faster",
];

const STEPS = [
  {
    title: "Create Account",
    description: "Sign up in seconds and start from your dashboard immediately.",
  },
  {
    title: "Pick a Template",
    description: "Choose from ATS-friendly templates built for readability.",
  },
  {
    title: "Fill Your Details",
    description: "Use AI support to improve summary, skills, and experience content.",
  },
  {
    title: "Download PDF",
    description: "Export a clean and recruiter-ready PDF instantly.",
  },
];

const FEATURES = [
  {
    title: "Real ATS Scoring",
    description: "Check ATS compatibility before applying and fix gaps early.",
    tag: "Instant Score",
  },
  {
    title: "AI Writing Assist",
    description: "Generate stronger bullet points, summaries, and skill lines.",
    tag: "Gemini Powered",
  },
  {
    title: "Job Match Analysis",
    description: "Understand missing keywords and improve fit for target roles.",
    tag: "Premium Feature",
  },
  {
    title: "Clean PDF Export",
    description: "Download professional resumes that render consistently.",
    tag: "Instant Download",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "₹29",
    period: "/ one-time",
    credits: "5 Credits",
    featured: false,
    features: [
      "1 Credit = 1 AI action",
      "Summary Auto Generation",
      "Skills Auto Generation",
      "Experience Quantifying",
      "Project Description Quantifying",
    ],
  },
  {
    name: "Value Pack",
    price: "₹49",
    period: "/ one-time",
    credits: "10 Credits",
    featured: true,
    features: [
      "1 Credit = 1 AI action",
      "Summary Auto Generation",
      "Skills Auto Generation",
      "Experience Quantifying",
      "Project Description Quantifying",
    ],
  },
  {
    name: "Ultra Value Pack",
    price: "₹99",
    period: "/ one-time",
    credits: "25 Credits",
    featured: false,
    features: [
      "1 Credit = 1 AI action",
      "Summary Auto Generation",
      "Skills Auto Generation",
      "Experience Quantifying",
      "Project Description Quantifying",
    ],
  },
];

const TESTIMONIALS = [
  {
    username: "akkaris",
    rating: 5,
    comment: "Easy to use platform",
  },
  {
    username: "neeraj",
    rating: 5,
    comment: "Good the resume templates are professional",
  },
  {
    username: "Sidhu",
    rating: 5,
    comment: "Excellent Website for resume building. very useful and time saving",
  },
];

const FAQS = [
  {
    question: "Does COREsume work on mobile?",
    answer: "Yes. COREsume is responsive and works on mobile, tablet, and desktop.",
  },
  {
    question: "Will my resume pass ATS systems?",
    answer: "Templates are ATS-friendly, and scoring helps improve before applying.",
  },
  {
    question: "What format will I download?",
    answer: "You can export a polished, ATS-friendly PDF instantly.",
  },
  {
    question: "Can I edit after downloading?",
    answer: "Yes. Your data stays in your dashboard, so you can re-edit anytime.",
  },
  {
    question: "Is my data secure?",
    answer: "COREsume uses secure auth, protected APIs, and trusted payments.",
  },
];

function CircleCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function StarRow({ count }) {
  return (
    <div className="flex items-center gap-1 text-yellow-500" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${index < count ? "opacity-100" : "opacity-30"}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showHeroResume, setShowHeroResume] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user/info", { credentials: "include" });
        setIsAuthenticated(res.ok);
      } catch (err) {
        console.debug("auth check failed", err);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const updateHeroVisibility = () => {
      const shouldHideResume = window.innerWidth < 850 || window.innerHeight < 640;
      setShowHeroResume(!shouldHideResume);
    };

    updateHeroVisibility();
    window.addEventListener("resize", updateHeroVisibility);
    return () => window.removeEventListener("resize", updateHeroVisibility);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f]">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-[#0f0f0f]">
            <span className="text-black">CORE</span>
            <span className="text-yellow-500">sume</span>
          </Link>

          <nav className="flex items-center gap-2 lg:gap-8">
            <ul className="hidden items-center gap-6 lg:flex">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            {authChecked && isAuthenticated && (
              <Link
                href="/dashboard"
                className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-[#e6bc00] sm:text-sm"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section
          className={`grid w-full gap-8 px-4 pb-10 pt-10 sm:px-6 lg:gap-10 lg:px-8 lg:pt-12 ${
            showHeroResume ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-50 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[#856a00] uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400" />
              ATS-Optimized Resume Builder
            </p>

            <h1 className="font-display mb-4 text-3xl leading-[1.08] tracking-tight text-[#0f0f0f] sm:text-4xl md:text-5xl lg:text-6xl">
              Build a resume
              <br />
              that gets you
              <br />
              <span className="relative inline-block">
                interviews.
                <span className="absolute bottom-1 left-0 right-0 -z-10 h-2.5 rounded-sm bg-yellow-400/60" />
              </span>
            </h1>

            <p className="mb-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
              COREsume builds clean, ATS-friendly resumes in minutes. Pick a template, fill your details, and download a polished PDF.
            </p>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              {authChecked && isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-[#e6bc00]"
                >
                  Dashboard
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              <a
                href="#how"
                className="rounded-xl border border-zinc-200 px-8 py-3.5 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-50"
              >
                See how it works
              </a>
            </div>

            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-emerald-600">✓</span> No credit card required · Free to start · Takes 2 minutes
            </p>
          </motion.div>

          {showHeroResume && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="relative"
            >
              <div
                className="relative mx-auto w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05),0_24px_64px_rgba(0,0,0,0.08)]"
                style={{ aspectRatio: "210 / 297", maxWidth: "clamp(230px, 33vw, 360px)" }}
              >
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF6058]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFBE2E]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2AC84B]" />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400">my_resume.pdf</span>
                  <span className="text-[11px] text-zinc-400">Saved</span>
                </div>

                <div className="space-y-2.5 p-6 sm:p-7">
                  <div className="h-3.5 w-[45%] rounded bg-zinc-900" />
                  <div className="mb-1 h-2 w-[30%] rounded bg-zinc-400" />
                  <div className="my-2 h-px bg-zinc-200" />
                  <div className="mb-2 h-2 w-[25%] rounded bg-yellow-400" />
                  {["92%", "86%", "78%", "95%", "90%", "88%", "73%", "89%", "84%", "97%", "91%", "88%"].map((width, i) => (
                    <div
                      key={`${width}-${i}`}
                      className="h-1.5 rounded bg-zinc-200"
                      style={{ width, animation: `shimmer 2s ${0.1 + i * 0.08}s ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute -right-4 -top-4 flex h-20 w-20 flex-col items-center justify-center rounded-full border-[3px] border-white bg-yellow-400 shadow-[0_4px_24px_rgba(245,200,0,0.4)]">
                <span className="text-[22px] font-extrabold leading-none text-black">98</span>
                <span className="text-[8px] font-bold tracking-[0.12em] text-[#6b5800] uppercase">ATS</span>
              </div>

              <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CircleCheck />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">ATS Ready</p>
                  <p className="text-[10px] text-zinc-400">Passes major filters</p>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        <section className="overflow-hidden border-y border-zinc-200 bg-zinc-50 px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex w-max gap-12" style={{ animation: "marquee 22s linear infinite" }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.08em] text-zinc-400 uppercase">
                <span className="h-1 w-1 rounded-full bg-yellow-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-zinc-200 bg-zinc-50">
          <div className="w-full px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="mb-4 text-[11px] font-bold tracking-[0.18em] text-zinc-400 uppercase"
            >
              How it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              viewport={{ once: true }}
              className="font-display text-3xl leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl"
            >
              Four steps to your <span className="text-zinc-600 italic">perfect resume.</span>
            </motion.h2>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {STEPS.map((step, index) => (
                  <article key={step.title} className="rounded-xl border border-zinc-200 bg-white px-4 py-5">
                    <p className="font-display mb-2 text-xs italic text-zinc-400">{String(index + 1).padStart(2, "0")}</p>
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-zinc-700">
                      <CircleCheck />
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-zinc-900">{step.title}</h3>
                    <p className="text-xs leading-5 text-zinc-600">{step.description}</p>
                  </article>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
              >
                <p className="mb-3 text-sm font-bold text-zinc-800">Product walkthrough</p>
                <video src="/COREsume%20DEMO.mp4" controls className="w-full rounded-lg border border-zinc-200" />
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="mb-4 text-[11px] font-bold tracking-[0.18em] text-zinc-400 uppercase"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            viewport={{ once: true }}
            className="font-display text-3xl leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl"
          >
            Everything you need.
            <br />
            <span className="text-zinc-600 italic">Nothing you do not.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            viewport={{ once: true }}
            className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-zinc-200 bg-white px-5 py-5 transition hover:bg-zinc-50">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-zinc-700">
                  <CircleCheck />
                </div>
                <h3 className="mb-1 text-base font-bold text-zinc-900">{feature.title}</h3>
                <p className="text-sm leading-6 text-zinc-600">{feature.description}</p>
                <span className="mt-3 inline-block rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[#856a00] uppercase">
                  {feature.tag}
                </span>
              </article>
            ))}
          </motion.div>
        </section>

        <section id="pricing" className="border-y border-zinc-200 bg-zinc-50">
          <div className="w-full px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              viewport={{ once: true }}
              className="text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl"
            >
              Choose Your AI Credit Plan
            </motion.h2>
            <p className="mt-2 text-center text-base text-zinc-500">1 Credit = 1 AI action to improve your resume</p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              viewport={{ once: true }}
              className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3"
            >
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative flex flex-col rounded-xl border bg-white px-5 py-6 transition hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] ${
                    plan.featured ? "border-yellow-400" : "border-zinc-200"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                      Most Popular
                    </span>
                  )}

                  <p className="mb-3 text-2xl font-bold text-zinc-900">{plan.name}</p>
                  <p className="text-4xl font-bold text-zinc-900">
                    {plan.price} <span className="text-lg font-medium text-zinc-400">{plan.period}</span>
                  </p>
                  <p className="mt-3 text-2xl font-bold text-yellow-600">{plan.credits}</p>

                  <ul className="mb-6 mt-5 space-y-2 text-base text-zinc-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span className="mt-1 text-yellow-500">
                          <CircleCheck />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/pricing"
                    className={`mt-auto rounded-xl px-6 py-3 text-center text-2xl font-bold transition ${
                      plan.featured
                        ? "bg-yellow-400 text-black hover:bg-[#e6bc00]"
                        : "border border-yellow-400 text-black hover:bg-yellow-50"
                    }`}
                  >
                    Buy Now
                  </Link>
                </article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="w-full px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="mb-4 text-[11px] font-bold tracking-[0.18em] text-zinc-400 uppercase"
          >
            Real user ratings
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            viewport={{ once: true }}
            className="font-display text-4xl leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl"
          >
            Trusted by users.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            viewport={{ once: true }}
            className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3"
          >
            {TESTIMONIALS.map((item) => (
              <article key={item.username} className="rounded-xl border border-zinc-200 bg-zinc-50 px-7 py-7 transition hover:border-yellow-400">
                <StarRow count={item.rating} />
                <p className="mt-4 text-base leading-7 text-zinc-700">{item.comment}</p>
                <p className="mt-4 text-sm font-bold text-zinc-900">@{item.username}</p>
              </article>
            ))}
          </motion.div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-50">
          <div className="w-full px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              viewport={{ once: true }}
              className="mb-4 text-center text-[11px] font-bold tracking-[0.18em] text-zinc-400 uppercase"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              viewport={{ once: true }}
              className="font-display text-center text-4xl leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl"
            >
              Common <span className="text-zinc-600 italic">questions.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              viewport={{ once: true }}
              className="mx-auto mt-10 w-full max-w-4xl"
            >
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={faq.question} className="border-t border-zinc-200 py-5 last:border-b">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <h4 className="text-[15px] font-semibold text-zinc-900">{faq.question}</h4>
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-base font-light transition ${
                          isOpen
                            ? "border-yellow-400 bg-yellow-400 text-black rotate-45"
                            : "border-zinc-200 text-zinc-400"
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.24, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-sm leading-7 text-zinc-600">{faq.answer}</p>
                    </motion.div>
                  </article>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
