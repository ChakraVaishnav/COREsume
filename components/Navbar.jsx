"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/dashboard" className="text-5xl font-bold text-black hover:text-yellow-500 transition">
          Resumint
        </Link>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700">
            Credits: {loading ? "Loading..." : credits ?? 0}
          </div>
          <Link 
            href="/pricing" 
            className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-white hover:text-yellow-500 border-2 border-yellow-500 transition-colors font-semibold"
          >
            Pricing
          </Link>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="text-sm bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
} 