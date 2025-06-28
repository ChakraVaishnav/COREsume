"use client";

import { useRef } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function Home() {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 sm:px-10 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
          {/* Left: Brand */}
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center">
            <span className="text-black">CORE </span>
            <span className="text-yellow-400 ">sume</span>
          </h1>

          {/* Right: Auth Buttons (small on mobile, full on desktop) */}
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
        <section className="flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 gap-10 sm:gap-14">
          {/* Left Text */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-gray-900">
              Build a Job-Winning Resume in Minutes
            </h2>
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

          {/* Right Graphic */}
          <div className="w-full lg:w-1/2 flex justify-center">
          <Link
  href="/signup"
  className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-[2rem] shadow-2xl flex items-center justify-center text-white text-9xl font-bold select-none transition hover:scale-105"
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
    How <span className="text-black">CORE</span>
    <span className="text-yellow-400">sume</span> Works
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-8 sm:mt-10">
    {/* Feature 1 */}
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300">
      <div className="text-yellow-400 text-4xl sm:text-5xl mb-4">📝</div>
      <h4 className="text-xl sm:text-2xl font-bold mb-2">Create Your Account</h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Sign up in seconds and start your resume-building journey with a clean,
        user-friendly interface.
      </p>
    </div>

    {/* Feature 2 */}
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300">
      <div className="text-yellow-400 text-4xl sm:text-5xl mb-4">🎨</div>
      <h4 className="text-xl sm:text-2xl font-bold mb-2">Pick a Template You Like</h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Choose from multiple modern, professional resume templates designed to
        pass ATS and impress recruiters.
      </p>
    </div>

    {/* Feature 3 */}
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300">
      <div className="text-yellow-400 text-4xl sm:text-5xl mb-4">🧾</div>
      <h4 className="text-xl sm:text-2xl font-bold mb-2">Fill In Your Details</h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Just enter your resume details like education, experience, and skills.
        Our builder formats everything automatically.
      </p>
    </div>

    {/* Feature 4 */}
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300">
      <div className="text-yellow-400 text-4xl sm:text-5xl mb-4">💸</div>
      <h4 className="text-xl sm:text-2xl font-bold mb-2">Download Your Resume (from ₹19)</h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Click “Generate Resume” and instantly preview. Download the polished
        PDF starting at just ₹19 through secure Razorpay checkout.
      </p>
    </div>
  </div>
</section>
<section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 space-y-12">
  <h3 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900">
    Frequently Asked Questions
  </h3>

  <div className="space-y-6 sm:space-y-8">
    {/* FAQ 1 */}
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
        ❌ Can I get a refund after purchasing?
      </h4>
      <p className="text-gray-600 text-sm sm:text-base">
        No, we currently do not offer refunds. Please review your resume preview carefully before making payment.
      </p>
    </div>

    {/* FAQ 2 */}
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
        📱 Does it work on mobile devices?
      </h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Our builder is optimized for desktop use only. We recommend using a laptop or PC for the best experience.
      </p>
    </div>

    {/* FAQ 3 */}
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
        🧾 How many templates can I choose from?
      </h4>
      <p className="text-gray-600 text-sm sm:text-base">
        You can freely explore all available templates before making a purchase. Choose the one that suits your style best.
      </p>
    </div>

    {/* FAQ 4 */}
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
        📄 Will I get an editable version of the resume?
      </h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Currently, only a polished PDF version is provided after payment. Editable formats like Word or Google Docs are not supported.
      </p>
    </div>

    {/* FAQ 5 */}
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
        🔐 Is my data safe and secure?
      </h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Yes. All payments are processed securely through Razorpay. We do not share or misuse your personal details.
      </p>
    </div>
  </div>
</section>

      </main>
      <Footer />
    </div>
  );
}
