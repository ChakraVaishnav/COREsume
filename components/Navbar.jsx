"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiRefreshCw } from "react-icons/fi"; // Refresh icon

export default function Navbar({ fixed = false }) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCredits = async () => {
    try {
      setRefreshing(true);
      // Fetch credits using HttpOnly cookie for auth. Do not rely on localStorage for auth state
      const response = await fetch("/api/user/credits", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        // If server responds 401, redirect to login
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <header
      className={`w-full bg-white border-b border-gray-200 ${
        fixed ? "fixed inset-x-0 top-0 z-50" : ""
      }`}
    >
      <div className="w-full px-4 sm:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center">
            <span className="text-black">CORE </span>
            <span className="text-yellow-400">sume</span>
          </h1>
        </Link>

        {/* Right Side Items */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Credits + Refresh */}
          <div className="text-sm font-medium text-gray-700 flex items-center whitespace-nowrap">
            Credits: {loading ? "Loading..." : credits ?? 0}
            <button
              onClick={fetchCredits}
              disabled={refreshing}
              className="ml-1 text-yellow-500 hover:text-yellow-600 transition"
              title="Refresh credits"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/pricing"
              className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-white hover:text-yellow-500 border-2 border-yellow-500 transition-colors font-semibold"
            >
              Pricing
            </Link>

            <Link
              href="/profile"
              className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition"
              title="Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="black"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 20.25a8.25 8.25 0 0115 0M12 12.75a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-black hover:bg-gray-100 transition"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-[60] min-w-40">
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-semibold text-black rounded-lg hover:bg-yellow-50"
          >
            Pricing
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-semibold text-black rounded-lg hover:bg-yellow-50"
          >
            Profile
          </Link>
        </div>
      )}
    </header>
  );
}
