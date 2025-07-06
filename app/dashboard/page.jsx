"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?.email) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/user/credits", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userData.email}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const templates = [
    {
      name: "Minimalist",
      slug: "minimalist",
      image: "/Demo1.jpg",
      description: "Clean, single-column layout with a modern look.",
    },
    {
      name: "Sidebar Elegance",
      slug: "sidebar-elegance",
      image: "/Demo2.png",
      description: "Two-column layout with sidebar for key info.",
    },
    {
      name: "Chronical Classic",
      slug: "timeline",
      image: "/Demo3.png",
      description: "Chronological timeline layout that flows through your experience — showing you’ve been legit since day one.",
    },
  ];

  const tips = [
    {
      title: "✅ Add Your LinkedIn, GitHub, and Portfolio",
      desc: "Our templates neatly format them and it boosts recruiter trust. Don’t leave them empty!",
    },
    {
      title: "🔹 Use Bullet Points in Experience/Projects/Skills",
      desc: "Use bullet points where they are needed to show case your Experience, Projects, and Skills in a better way",
    },
    {
      title: "🔍 Avoid Spelling & Grammar Mistakes",
      desc: "Always double-check your input before generating the resume. Typos in your name, job title, or experience can make a bad first impression — even if the template looks great.",
    },
    {
      title: "📊 Quantify Your Impact in Experience Section",
      desc: "Instead of saying 'Handled social media marketing', say 'Increased Instagram engagement by 40% in 2 months'. Numbers show results — and recruiters love that.",
    },    
    {
      title: "🎯 Keep Objective Short and Focused",
      desc: "Use 2-3 lines. Avoid generic buzzwords. Tailor it to your goals.",
    },
    {
      title: "💡 Choose Template Before You Start",
      desc: "Each template presents data differently. Select your style first, then enter your info accordingly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Monsoon Offer Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 py-4 px-4 sm:px-8 text-center shadow-md border-b border-yellow-600 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
            🌧️ Monsoon Offer: <span className="text-white drop-shadow">Extra 50% Credits</span> on Every Purchase!
          </h3>
          <p className="mt-1 text-sm sm:text-base text-black font-medium">
            Buy any plan now and instantly get 50% more credits for free.
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-3 bg-black text-yellow-400 px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-gray-900 transition duration-200"
          >
            🎁 Grab This Limited-Time Deal
          </Link>
          <div className="absolute top-2 right-4 animate-pulse bg-black text-white text-xs px-3 py-1 rounded-full font-semibold">
            Limited Time!
          </div>
        </div>
      </section>

      {/* Hero */}
      <main className="flex-grow py">
      <section className="text-center px-4 sm:px-6 pt-12 pb-8">
  <h1 className="text-4xl sm:text-5xl font-extrabold text-black leading-tight mb-4">
    Build Your Job-Winning Resume with <span className="text-black">CORE</span>
    <span className="text-yellow-400">sume</span>
  </h1>
  <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
    Your resume is your first impression. Free builders blur it. <span className="font-semibold text-black">COREsume sharpens it.</span>
  </p>
</section>

        <section className="text-center py-8">
          <h2 className="text-4xl font-bold text-black mb-4">
            Choose Your Template
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pick from professional, ATS‑friendly designs to create your resume.
          </p>
        </section>

        {/* Templates Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
              >
                <img
                  src={template.image}
                  alt={`${template.name} Resume`}
                  className="w-full object-contain bg-gray-50"
                  style={{ maxHeight: "400px" }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Link
                    href={`/resume-form?template=${template.slug}`}
                    className="block w-full text-center py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-medium"
                  >
                    Use This Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-black mb-10">
            Best Tips to Use COREsume Efficiently ⚡
          </h2>

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
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 space-y-12">
  <h3 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8">
    How <span className="text-black">CORE</span><span className="text-yellow-400">sume</span> Works 🚀
  </h3>

  <div className="max-w-4xl mx-auto px-4">
    <video
      src="/COREsume%20DEMO.mp4"
      controls
      className="rounded-xl shadow-lg w-full"
    />
  </div>
</section>
<section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 space-y-12">
  <h3 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900">
    Frequently Asked Questions
  </h3>

  <div className="space-y-6 sm:space-y-8">
    {/* FAQ 1 */}

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

      <Footer />
    </div>
  );
}
