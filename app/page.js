"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const WHY_CHOOSE = [
  {
    title: "Create Your Account",
    desc: "Sign up in seconds and start your resume-building journey with a clean interface.",
    icon: "account",
  },
  {
    title: "Pick a Template You Like",
    desc: "Choose from modern, professional resume templates designed for ATS and recruiters.",
    icon: "template",
  },
  {
    title: "Fill In Your Details",
    desc: "Add education, experience, and skills. Formatting is handled automatically.",
    icon: "edit",
  },
  {
    title: "Download Your Resume",
    desc: "Preview and export a polished ATS-friendly PDF quickly.",
    icon: "download",
  },
];

const REVIEWS = [
  { username: "akkaris", rating: 5, comment: "Easy to use platform" },
  { username: "neeraj", rating: 5, comment: "Good the resume templates are professional" },
  {
    username: "Sidhu",
    rating: 5,
    comment: "Excellent Website for resume building. very useful and time saving",
  },
];

const FAQS = [
  {
    question: "Does it work on mobile devices?",
    answer:
      "Yes. COREsume is supported on mobile and desktop. For best editing comfort, desktop is recommended.",
  },
  {
    question: "How many templates can I choose from?",
    answer: "You can explore all available templates before purchase and choose what fits your profile.",
  },
  {
    question: "Will I get an editable version of the resume?",
    answer: "You will get a polished PDF output from the builder flow.",
  },
  {
    question: "Is my data safe and secure?",
    answer: "Yes. COREsume uses secure auth flow and protected APIs.",
  },
];

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="3.5" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </svg>
  );
}

function IconTemplate() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 10v10" />
    </svg>
  );
}

function IconEditDocument() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 14h8" />
      <path d="M8 18h5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function WhyCardIcon({ type }) {
  if (type === "account") return <IconUserPlus />;
  if (type === "template") return <IconTemplate />;
  if (type === "edit") return <IconEditDocument />;
  if (type === "download") return <IconDownload />;
  return <IconCheckCircle />;
}

function IconFeature() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
    </svg>
  );
}

function StarRow({ count }) {
  return (
    <div className="flex items-center gap-1 text-yellow-500" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${i < count ? "opacity-100" : "opacity-25"}`}
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
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showHeroResume, setShowHeroResume] = useState(true);
  const featuresRef = useRef(null);
  const resumeCardRef = useRef(null);
  const [resumeCardStyle, setResumeCardStyle] = useState({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0) scale(1)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.08), inset 0 0 0 rgba(0,0,0,0)",
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Show loading spinner while we check auth (cookies are HttpOnly, can't detect them in JS)
      setIsValidating(true);
      try {
        const res = await fetch("/api/user/info", { credentials: "include" });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const updateHeroResumeVisibility = () => {
      setShowHeroResume(window.innerWidth >= 850);
    };

    updateHeroResumeVisibility();
    window.addEventListener("resize", updateHeroResumeVisibility);
    return () => window.removeEventListener("resize", updateHeroResumeVisibility);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleResumeCardMove = (event) => {
    const cardEl = resumeCardRef.current;
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const nx = Math.max(-1, Math.min(1, (px - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, (py - 0.5) * 2));

    const rotateY = -(nx * 7);
    const rotateX = ny * 6;
    const translateX = nx * 6;
    const translateY = ny * 4;
    const insetX = -nx * 18;
    const insetY = -ny * 12;

    setResumeCardStyle({
      transform: `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) scale(0.996)`,
      boxShadow: `0 16px 40px rgba(0,0,0,0.08), inset ${insetX.toFixed(1)}px ${insetY.toFixed(1)}px 24px rgba(0,0,0,0.08)`,
    });
  };

  const resetResumeCard = () => {
    setResumeCardStyle({
      transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0) scale(1)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.08), inset 0 0 0 rgba(0,0,0,0)",
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight [font-family:var(--font-heading)]">
            <span className="text-black">CORE</span>
            <span className="text-yellow-500">sume</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {isValidating && (
              <div className="flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2">
                <LoadingSpinner />
                <span className="text-xs font-medium text-zinc-600 sm:text-sm">Verifying...</span>
              </div>
            )}
            {authChecked && !isValidating &&
              (isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-yellow-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-300 sm:text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-yellow-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-300 sm:text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="order-2 flex flex-col items-start text-left lg:order-1"
            >

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="max-w-xl text-4xl font-extrabold leading-tight text-[#111827] sm:text-5xl [font-family:var(--font-heading)]"
              >
                Build a <span className="inline-block text-[1.4em] leading-none text-yellow-500 align-[-0.08em]">ATS</span> Friendly Job-Winning Resume in Minutes
              </motion.h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
                Your resume is your first impression. COREsume helps you create clear, modern resumes with strong ATS readability.
              </p>

              <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                Built for students, freshers, and experienced professionals aiming for better responses.
              </p>
              <p className="max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                Make every section recruiter-ready with clean structure, strong impact, and clear relevance.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToFeatures}
                  className="rounded-md bg-yellow-400 px-7 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                  Learn More
                </button>
                {isValidating && (
                  <div className="flex items-center gap-2 rounded-md border border-zinc-300 px-7 py-3">
                    <LoadingSpinner />
                    <span className="text-sm font-medium text-zinc-600">Verifying...</span>
                  </div>
                )}
                {authChecked && !isValidating &&
                  (isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="rounded-md border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/signup"
                      className="rounded-md border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                    >
                      Start Building
                    </Link>
                  ))}
              </div>
            </motion.div>

            {showHeroResume && (
              <motion.div
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.48, delay: 0.1 }}
                className="order-1 flex justify-center lg:order-2 lg:justify-end"
              >
                <div className="relative w-full max-w-md">
                  <div
                    ref={resumeCardRef}
                    onMouseMove={handleResumeCardMove}
                    onMouseLeave={resetResumeCard}
                    style={{
                      transform: resumeCardStyle.transform,
                      boxShadow: resumeCardStyle.boxShadow,
                      transition: "transform 120ms ease-out, box-shadow 120ms ease-out",
                      transformStyle: "preserve-3d",
                    }}
                    className="relative h-133 overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-lg"
                  >
                    <div className="flex h-14 items-center justify-between border-b border-zinc-300 bg-[#ececef] px-6">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                      </div>
                      <p className="text-[10px] font-medium text-zinc-500">my_resume.pdf</p>
                      <p className="text-[10px] font-medium text-zinc-500">Saved</p>
                    </div>

                    <div className="px-9 pt-8">
                      <div className="h-4 w-44 rounded-md bg-zinc-900" />
                      <div className="mt-4 h-3 w-28 rounded-md bg-zinc-400" />

                      <div className="mt-6 h-0.5 w-full bg-zinc-300" />
                      <div className="mt-5 h-3 w-24 rounded-md bg-yellow-400" />

                      <div className="mt-5 space-y-3">
                        <div className="h-2.5 w-11/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-10/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-9/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-full rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-11/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-3/4 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-11/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-10/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-full rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-11/12 rounded-full bg-zinc-300" />
                        <div className="h-2.5 w-10/12 rounded-full bg-zinc-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section ref={featuresRef} id="features" className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-10 sm:px-8">
            <h2 className="text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]">
              Why Choose CORE<span className="text-yellow-500">sume</span>?
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {WHY_CHOOSE.map((item) => (
                <article key={item.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                    <WhyCardIcon type={item.icon} />
                  </div>
                  <h3 className="text-2xl font-semibold text-zinc-900 [font-family:var(--font-heading)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]">
            How CORE<span className="text-yellow-500">sume</span> Works
          </h2>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
            <video src="/COREsume%20DEMO.mp4" controls className="w-full rounded-lg" />
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]">
            Real User Reviews
          </h2>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
            {REVIEWS.map((item) => (
              <article key={item.username} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <StarRow count={item.rating} />
                <p className="mt-3 text-sm leading-6 text-zinc-700">{item.comment}</p>
                <p className="mt-3 text-sm font-bold text-zinc-900">@{item.username}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto max-w-5xl space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.question} className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-yellow-50 text-yellow-600">
                        <IconCheckCircle />
                      </span>
                      <h3 className="text-base font-semibold text-zinc-900">{faq.question}</h3>
                    </div>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm transition ${
                        isOpen ? "border-yellow-400 bg-yellow-400 text-black" : "border-zinc-200 text-zinc-500"
                      }`}
                    >
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>
                  {isOpen && <p className="pt-3 text-sm leading-6 text-zinc-600">{faq.answer}</p>}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
