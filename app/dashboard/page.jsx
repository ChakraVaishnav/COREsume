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
    // Add more here easily later 🔥
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
      <main className="flex-grow py-12">
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
      </main>

      <Footer />
    </div>
  );
}
