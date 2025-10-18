"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const featuresRef = useRef(null);
  const router = useRouter();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior:"smooth" });
  };

  useEffect(() => {
    // Use cookie + JWT (server-side) for auth detection instead of localStorage.
    // Calls `/api/user/info` which returns user info when the HttpOnly cookie is present.
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user/info", { credentials: "include" });
        if (res.ok) {
          // authenticated on the server via cookie
          router.push("/dashboard");
        }
      } catch (err) {
        // network or other error - silently ignore and remain on home
        console.debug("auth check failed", err);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 sm:px-10 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center">
            <span className="text-black">CORE </span>
            <span className="text-yellow-400">sume</span>
          </h1>

          <nav className="flex gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-base bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-1.5 sm:py-2 px-3 sm:px-5 rounded-md transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-xs sm:text-base border border-black hover:bg-black hover:text-white text-black font-medium py-1.5 sm:py-2 px-3 sm:px-5 rounded-md transition"
            >
              Sign Up
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 gap-10 sm:gap-14">
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-gray-900">
              Build a{" "}
              <span className="inline-block text-6xl sm:text-7xl md:text-8xl font-black text-yellow-400 transform hover:scale-105 transition duration-300 drop-shadow-lg">
                ATS
              </span>{" "}
              Friendly Job-Winning Resume in Minutes
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-xl mx-auto lg:mx-0">
              Your resume is your first impression.
              <br className="hidden sm:block" />
              Free builders blur it. <strong>COREsume</strong> sharpens it.
            </p>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              Just fill your info, choose from modern ATS-friendly templates,
              pay securely, and get a polished PDF instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={scrollToFeatures}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-md transition shadow-md"
              >
                Learn More
              </button>
              <Link
                href="/signup"
                className="text-black border border-gray-800 hover:bg-gray-900 hover:text-white py-3 px-6 rounded-md font-semibold transition text-center"
              >
                Start Building
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <Link
              href="/signup"
              className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-[2rem] shadow-2xl flex items-center justify-center text-white text-9xl font-bold select-none transition hover:scale-105"
            >
              +
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={featuresRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 space-y-12 bg-gray-50 rounded-3xl shadow-inner"
        >
          <h3 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900">
            Why Choose <span className="text-black">CORE</span>
            <span className="text-yellow-400">sume</span>?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-8 sm:mt-10">
            {[
              {
                icon: "📝",
                title: "Create Your Account",
                desc: "Sign up in seconds and start your resume-building journey with a clean, user-friendly interface.",
              },
              {
                icon: "🎨",
                title: "Pick a Template You Like",
                desc: "Choose from modern, professional resume templates designed to pass ATS and impress recruiters.",
              },
              {
                icon: "🧾",
                title: "Fill In Your Details",
                desc: "Enter your resume details like education, experience, and skills. Our builder formats everything automatically.",
              },
              {
                icon: "⬇️",
                title: "Download Your Resume for free",
                desc: "Click “Generate Resume” and instantly preview. Download your polished PDF for free.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 sm:p-8 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-yellow-400 text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm sm:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works - Video Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 space-y-12">
          <motion.h3
            className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How <span className="text-black">CORE</span>
            <span className="text-yellow-400">sume</span> Works 🚀
          </motion.h3>
          <motion.div
            className="max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <video
              src="/COREsume%20DEMO.mp4"
              controls
              className="rounded-xl shadow-lg w-full"
            />
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 space-y-12">
          <motion.h3
            className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h3>
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            {[
              {
                q: "📱 Does it work on mobile devices?",
                a: "Yes — now it is also supported on mobile, but we recommend mobile for best exp",
              },
              {
                q: "🧾 How many templates can I choose from?",
                a: "You can freely explore all available templates before making a purchase. Choose the one that suits your style best.",
              },
              {
                q: "📄 Will I get an editable version of the resume?",
                a: "Currently, only a polished PDF version is provided after payment. Editable formats like Word or Google Docs are not supported.",
              },
              {
                q: "🔐 Is my data safe and secure?",
                a: "Yes. All payments are processed securely through Razorpay. We do not share or misuse your personal details.",
              },
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm sm:text-base">{faq.a}</p>
              </div>
            ))}
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
