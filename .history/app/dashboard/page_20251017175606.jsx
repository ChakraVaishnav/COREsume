"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Run on client mount
  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  // Check authentication and fetch credits
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/credits", {
        method: "GET",
        credentials: "include", // send HttpOnly cookie
      });

      if (!res.ok) {
        router.push("/login"); // redirect if not logged in
        return;
      }

      const data = await res.json();
      setCredits(data.credits);
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) return null;

  // Templates
  const allTemplates = [
    { name: "Minimalist", slug: "minimalist", image: "/Demo1.jpg", description: "Clean, single-column layout with a modern look." },
    { name: "Sidebar Elegance", slug: "sidebar-elegance", image: "/Demo2.png", description: "Two-column layout with sidebar for key info." },
    { name: "Chronical Classic", slug: "timeline", image: "/Demo3.png", description: "Chronological timeline layout that flows through your experience — showing you’ve been legit since day one." },
    { name: "Professional Pro Template", slug: "premium-single-column", image: "/Demo4.png", description: "Professional single-column layout with clean section dividers, perfect for ATS systems." },
    { name: "Premium Professional", slug: "premium-two-column", image: "/Demo5.png", description: "Premium two-column layout with elegant design and clear sectioning, ideal for showcasing your skills and experience." },
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
      <Navbar />

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="text-center px-4 sm:px-6 pt-12 pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black leading-tight mb-4">
            Build Your Job-Winning Resume with <span className="text-black">CORE</span><span className="text-yellow-400">sume</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Your resume is your first impression. Free builders blur it. <span className="font-semibold text-black">COREsume sharpens it.</span>
          </p>
        </section>

        {/* Templates Section */}
        <section className="text-center py-8">
          <h2 className="text-3xl font-bold text-black mb-4">Choose Your Resume Template ✨</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Start free or unlock premium polished designs — all ATS friendly.</p>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allTemplates.map((template, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-200">
                <img src={template.image} alt={`${template.name} Resume`} className="w-full object-contain bg-gray-50" style={{ maxHeight: "400px" }} />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Link href={`/resume-form?template=${template.slug}`} className="block w-full text-center py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-200 transition font-medium">
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
