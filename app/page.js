"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

import Lenis from "lenis";

const HOW_IT_WORKS = [
  {
    title: "Create acc, select template",
    desc: "Sign up in seconds and choose a template.",
    icon: "account",
  },
  {
    title: "Fill Your Details",
    desc: "Auto-fill from existing PDF or type manually.",
    icon: "edit",
  },
  {
    title: "ATS Check",
    desc: "Get score and AI improvements instantly.",
    icon: "ai",
  },
  {
    title: "Download & Apply",
    desc: "PDF, DOCX, or custom print. One click.",
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
  {
    username: "Chaitu",
    rating: 5,
    comment: "Excellent website for resume building. Very useful and time saving.",
  },
];

const FAQS = [
  {
    question: "Is COREsume really free?",
    answer: "Yes. Building and downloading resumes is completely free. Credits are only needed for AI features beyond the daily free limit.",
  },
  {
    question: "What are credits used for?",
    answer: "1 credit = 1 AI action (summary, skills, quantification). ATS checks and PDF uploads cost 3 credits beyond the 2 free/day limit.",
  },
  {
    question: "Will my resume pass ATS filters?",
    answer: "Our AI-powered ATS analyzer uses advanced Gemini models to scan your resume for formatting, keyword density, and structure—providing real-time feedback to help you bypass modern hiring filters.",
  },
  {
    question: "Can I upload my existing resume?",
    answer: "Yes. Use Resume from PDF to auto-fill the entire form from your existing PDF no manual typing needed.",
  },
  {
    question: "What download formats are supported?",
    answer: "Quick PDF (instant), DOCX (Word-editable), and Custom PDF (adjust scale, margins, layout).",
  },
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  },
  viewport: { once: true }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

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

function IconAI() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
  const howRef = useRef(null);
  const resumeCardRef = useRef(null);
  const [resumeCardStyle, setResumeCardStyle] = useState({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0) scale(1)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.08), inset 0 0 0 rgba(0,0,0,0)",
  });

  useEffect(() => {
    const checkAuth = async () => {
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

    // Initialize Lenis
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const updateHeroResumeVisibility = () => {
      setShowHeroResume(window.innerWidth >= 850);
    };

    updateHeroResumeVisibility();
    window.addEventListener("resize", updateHeroResumeVisibility);
    return () => window.removeEventListener("resize", updateHeroResumeVisibility);
  }, []);

  const scrollToHowItWorks = () => {
    const element = howRef.current;
    if (element) {
      const offset = 80; // Adjust for sticky header
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
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
    <div className="min-h-screen bg-[#f7f7f8] text-[#111827] w-full overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur w-full">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 md:px-8">
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
                  className="rounded-md bg-yellow-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-300 sm:text-sm shadow-sm"
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
                    className="rounded-md bg-yellow-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-yellow-300 sm:text-sm shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              ))}
          </nav>
        </div>
      </header>

      <main className="w-full">
        <section className="w-full pb-12 pt-8 lg:pt-12 px-4 sm:px-6 md:px-8">
          <div className="w-full grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center xl:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="order-2 flex flex-col items-start text-left lg:order-1 lg:pl-4 xl:pl-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="max-w-2xl text-4xl font-extrabold leading-tight text-[#111827] sm:text-5xl lg:text-6xl [font-family:var(--font-heading)]"
              >
                The Resume Builder Built for <span className="text-yellow-500">Placements</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg"
              >
                ATS scoring, AI suggestions, job matching — built for students targeting top companies.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="mt-3 font-semibold max-w-xl text-sm leading-6 text-zinc-900"
              >
                Trusted by students from universities across India
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                {isValidating && (
                  <div className="flex items-center gap-2 rounded-md bg-yellow-400 px-8 py-4">
                    <LoadingSpinner />
                    <span className="text-sm font-bold text-black border-l border-yellow-500 pl-2">Verifying...</span>
                  </div>
                )}
                {authChecked && !isValidating &&
                  (isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="rounded-md bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300 shadow-sm"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/signup"
                      className="rounded-md bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300 shadow-sm"
                    >
                      Build My Free Resume
                    </Link>
                  ))}
                  
                <button
                  onClick={scrollToHowItWorks}
                  className="rounded-md border-2 border-zinc-300 px-8 py-4 text-base font-bold text-zinc-900 transition hover:bg-zinc-50"
                >
                  See How It Works
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="mt-10 flex gap-12 border-t border-zinc-200 pt-8 w-full max-w-xl"
              >
                <div>
                  <p className="text-3xl font-extrabold text-zinc-900">250+</p>
                  <p className="text-sm font-medium text-zinc-500 mt-1">Resumes Created</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-zinc-900">9</p>
                  <p className="text-sm font-medium text-zinc-500 mt-1">Templates Exactly</p>
                </div>
              </motion.div>
            </motion.div>

            {showHeroResume && (
              <motion.div
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.48, delay: 0.1 }}
                className="order-1 flex justify-center lg:order-2 lg:justify-start lg:ml-4 xl:ml-8 lg:-mt-4 w-full"
              >
                <div className="relative w-full max-w-[500px]">
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
                    className="relative h-[570px] overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-xl flex flex-col"
                  >
                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-300 bg-[#ececef] px-6">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-500">my_resume.pdf</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded">Saved</p>
                    </div>

                     <div className="px-10 pt-4 pb-10 flex-1 overflow-hidden relative pointer-events-none select-none">
                      <div className="text-center mb-6 border-b border-zinc-300 pb-5">
                        <h3 className="text-3xl font-extrabold text-zinc-900 uppercase tracking-tight [font-family:var(--font-heading)]">Alexandra Smith</h3>
                        <div className="text-[11px] font-medium text-zinc-600 mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 w-full px-2">
                          <span>alexandra@example.com</span>
                          <span className="text-zinc-400 hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">+1 234 567 8900</span>
                          <span className="text-zinc-400 hidden sm:inline">•</span>
                          <span>linkedin.com/in/alexandra</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-[11px] font-extrabold text-zinc-900 mb-3 tracking-widest uppercase border-b border-zinc-200 pb-1">Experience</h4>
                        <div className="mb-4">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="text-sm font-bold text-zinc-900">Software Engineer</p>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">2023 - Present</span>
                          </div>
                          <p className="text-xs font-medium text-zinc-700 mb-1.5 italic">Tech Solutions Inc. • Bangalore</p>
                          <ul className="text-[11px] text-zinc-700 list-disc ml-4 space-y-1.5 leading-relaxed">
                            <li>Developed scalable web applications focusing on frontend architectures and user experience.</li>
                            <li>Optimized database queries decreasing load time by 30% across major dashboard routes.</li>
                          </ul>
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="text-sm font-bold text-zinc-900">Frontend Developer Intern</p>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">2022 - 2023</span>
                          </div>
                          <p className="text-xs font-medium text-zinc-700 mb-1.5 italic">Creative Agency • Hyderabad</p>
                          <ul className="text-[11px] text-zinc-700 list-disc ml-4 space-y-1.5 leading-relaxed">
                            <li>Collaborated with design team to implement responsive UI components using React and Tailwind.</li>
                            <li>Integrated REST APIs ensuring seamless data binding.</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-[11px] font-extrabold text-zinc-900 mb-3 tracking-widest uppercase border-b border-zinc-200 pb-1">Education</h4>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-[13px] font-bold text-zinc-900">B.Tech, Computer Science</p>
                          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">2019 - 2023</span>
                        </div>
                        <p className="text-[11px] font-medium text-zinc-700 italic">Jawaharlal Nehru Technological University • CGPA: 8.5/10</p>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-[11px] font-extrabold text-zinc-900 mb-3 tracking-widest uppercase border-b border-zinc-200 pb-1">Skills</h4>
                        <p className="text-[11px] font-medium text-zinc-700 leading-relaxed">
                          <span className="font-bold text-zinc-900">Languages:</span> JavaScript, TypeScript, Python, Java, SQL<br/>
                          <span className="font-bold text-zinc-900">Frameworks:</span> React.js, Next.js, Node.js, Express, Tailwind CSS<br/>
                          <span className="font-bold text-zinc-900">Tools:</span> Git, Docker, AWS, Vercel, MongoDB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <motion.section 
          ref={howRef} 
          id="how" 
          className="w-full pb-20 pt-16 px-4 sm:px-6 md:px-8 bg-white"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="w-full max-w-6xl mx-auto">
            <motion.h2 
              variants={fadeInUp}
              className="mb-16 text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]"
            >
              How It Works
            </motion.h2>

            <motion.div 
              variants={staggerContainer}
              className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 w-full mt-10"
            >
              {/* Horizontal line for desktop connecting the numbers */}
              <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-zinc-200 z-0"></div>
              
              {HOW_IT_WORKS.map((item, i) => (
                <motion.article 
                  key={item.title} 
                  variants={staggerItem}
                  className="relative z-10 flex flex-col items-center text-center flex-1 group"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-black font-extrabold text-xl shadow-sm z-10 mx-auto group-hover:scale-110 transition-transform duration-300">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 [font-family:var(--font-heading)] mb-2 px-2">{item.title}</h3>
                  <p className="text-sm leading-6 text-zinc-600 px-4 max-w-xs">{item.desc}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="w-full py-16 px-4 sm:px-6 md:px-8 bg-zinc-50 border-t border-zinc-200"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="w-full">
            <motion.h2 
              variants={fadeInUp}
              className="mb-8 text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]"
            >
              What Students Say
            </motion.h2>
            <motion.div 
              variants={staggerContainer}
              className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
            >
              {REVIEWS.map((item) => (
                <motion.article 
                  key={item.username} 
                  variants={staggerItem}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                  className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm flex flex-col h-full transition-all duration-300"
                >
                  <StarRow count={item.rating} />
                  <p className="mt-5 text-base leading-relaxed text-zinc-700 flex-1">&quot;{item.comment}&quot;</p>
                  <p className="mt-4 text-sm font-bold text-zinc-900 border-t border-zinc-100 pt-4">@{item.username}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="w-full px-4 py-16 sm:px-6 md:px-8 border-t border-zinc-200 bg-white"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="mb-10 text-center text-3xl font-extrabold text-[#111827] sm:text-4xl [font-family:var(--font-heading)]"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div 
            variants={staggerContainer}
            className="mx-auto max-w-4xl space-y-4"
          >
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.article 
                  key={faq.question} 
                  variants={staggerItem}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-5 shadow-sm transition-all hover:bg-zinc-100/50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-zinc-900 [font-family:var(--font-heading)]">{faq.question}</h3>
                    </div>
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-base font-bold transition-all ${
                        isOpen ? "border-yellow-400 bg-yellow-400 text-black shadow-sm" : "border-zinc-300 text-zinc-500 bg-white"
                      }`}
                    >
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-4 text-base leading-relaxed text-zinc-600"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}