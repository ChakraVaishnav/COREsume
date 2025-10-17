"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiRefreshCw } from "react-icons/fi"; // Refresh icon

export default function Navbar() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);
  const fetchCredits = async () => {
    try {
      setRefreshing(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData?.email) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/user/credits", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.email}`,
        },
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
      setRefreshing(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center">
            <span className="text-black">CORE </span>
            <span className="text-yellow-400">sume</span>
          </h1>
        </Link>

        {/* Right Side Items */}
        <div className="flex items-center space-x-4">
          {/* Credits + Refresh */}
          <div className="text-sm font-medium text-gray-700 flex items-center">
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

          {/* Pricing Button */}
          <Link
            href="/pricing"
            className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-white hover:text-yellow-500 border-2 border-yellow-500 transition-colors font-semibold"
          >
            Pricing
          </Link>

          {/* Profile Button */}
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
      </div>
    </header>
  );
}
