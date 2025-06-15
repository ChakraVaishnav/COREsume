// app/page.jsx
"use client";

import { useRef } from "react";
import Link from "next/link";

export default function Home() {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans">
      {/* Header */}
      <header className="flex justify-between items-center py-8 px-10 shadow-sm">
        <h1 className="text-7xl font-extrabold text-black select-none cursor-default">
          Resumint
        </h1>
        <nav>
          <Link
            href="/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-lg cursor-pointer mr-6 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-black hover:bg-gray-900 text-yellow-400 font-semibold py-2 px-6 rounded-lg cursor-pointer transition"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-10 py-20 gap-12">
        {/* Text Content */}
        <div className="md:w-1/2 space-y-8">
          <h2 className="text-5xl font-extrabold leading-tight">
            Build your professional resume <br /> in minutes with Resumint
          </h2>
          <p className="text-lg text-gray-700 max-w-md">
            Choose from 3 stunning templates, fill your info, pay securely, and
            download a resume that opens doors.
          </p>
          <button
            onClick={scrollToFeatures}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-lg cursor-pointer transition shadow-lg"
          >
            Learn More
          </button>
        </div>

        {/* Hero Illustration */}
        <div className="md:w-1/2 flex justify-center">
          <div className="w-64 h-64 bg-gradient-to-tr from-yellow-400 to-yellow-300 rounded-3xl flex items-center justify-center text-6xl font-extrabold text-white shadow-lg select-none cursor-default">
            +
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="max-w-5xl mx-auto px-10 py-20 space-y-16 bg-gray-50 rounded-3xl shadow-lg"
      >
        <h3 className="text-4xl font-extrabold text-center mb-12 text-black">
          Why Choose Resumint?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-yellow-400 text-6xl mb-6 select-none">📝</div>
            <h4 className="text-xl font-semibold mb-3">3 Beautiful Templates</h4>
            <p className="text-gray-700">
              Professionally designed, ATS-friendly resume templates that stand
              out and get you hired.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-yellow-400 text-6xl mb-6 select-none">⚡</div>
            <h4 className="text-xl font-semibold mb-3">Fast & Easy</h4>
            <p className="text-gray-700">
              Fill your details in simple forms, pay securely, and instantly
              download your ready-to-go resume.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition">
            <div className="text-yellow-400 text-6xl mb-6 select-none">🔒</div>
            <h4 className="text-xl font-semibold mb-3">Secure Payments</h4>
            <p className="text-gray-700">
              Trusted Razorpay integration ensures your payment info is safe,
              with flexible pricing plans for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm select-none">
        © 2025 Resumint. All rights reserved.
      </footer>
    </main>
  );
}
