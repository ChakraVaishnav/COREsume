"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiRefreshCw, FiTag, FiX } from "react-icons/fi";

export default function Navbar({ fixed = false }) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Coupon state
  const [hasUsedCoupon, setHasUsedCoupon] = useState(true); // default true = hidden until we confirm false
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const couponInputRef = useRef(null);

  useEffect(() => {
    fetchCredits();
    fetchCouponStatus();
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

  // Focus input when modal opens
  useEffect(() => {
    if (couponModalOpen && couponInputRef.current) {
      setTimeout(() => couponInputRef.current?.focus(), 80);
    }
  }, [couponModalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    if (!couponModalOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeCouponModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [couponModalOpen]);

  const fetchCredits = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/user/credits", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
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

  const fetchCouponStatus = async () => {
    try {
      const res = await fetch("/api/coupon/status", { credentials: "include" });
      if (!res.ok) return; // silently fail — button stays hidden on error
      const data = await res.json();
      setHasUsedCoupon(!!data.hasUsedCoupon);
    } catch {
      // silently fail
    }
  };

  const openCouponModal = () => {
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    if (couponLoading) return;
    setCouponModalOpen(false);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  const handleCouponRedeem = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/coupon/redeem", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCouponError(data?.error || "Failed to redeem coupon. Please try again.");
        return;
      }

      // Success!
      setCouponSuccess(`🎉 ${data.creditsAdded} credits added to your account!`);
      setHasUsedCoupon(true); // hide the button permanently
      // Refresh displayed credits
      await fetchCredits();
      // Auto-close modal after 2s
      setTimeout(() => closeCouponModal(), 2200);
    } catch {
      setCouponError("Something went wrong. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      <header
        className={`w-full bg-white border-b border-gray-200 ${
          fixed ? "fixed inset-x-0 top-0 z-50" : ""
        }`}
      >
        <div className="w-full px-4 sm:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center">
              <span className="text-black">CORE</span>
              <span className="text-yellow-500">sume</span>
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
              {/* Coupon Code button — only shown if user hasn't used a coupon yet */}
              {!hasUsedCoupon && (
                <button
                  id="navbar-coupon-btn"
                  type="button"
                  onClick={openCouponModal}
                  className="flex items-center gap-1.5 text-sm bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-white hover:text-emerald-600 border-2 border-emerald-500 transition-colors font-semibold"
                >
                  <FiTag className="h-4 w-4" />
                  Coupon Code
                </button>
              )}

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
          <div className="md:hidden fixed top-16 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-60 min-w-44">
            {/* Coupon option in mobile menu */}
            {!hasUsedCoupon && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCouponModal();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                <FiTag className="h-4 w-4" />
                Coupon Code
              </button>
            )}
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

      {/* Coupon Modal */}
      {couponModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCouponModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative">
            {/* Close button */}
            <button
              type="button"
              onClick={closeCouponModal}
              disabled={couponLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiTag className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Redeem Coupon</h2>
                <p className="text-xs text-gray-500">Enter your code to get free credits</p>
              </div>
            </div>

            {/* Success state */}
            {couponSuccess ? (
              <div className="text-center py-4">
                <p className="text-emerald-600 font-semibold text-base">{couponSuccess}</p>
                <p className="text-sm text-gray-500 mt-1">Closing automatically...</p>
              </div>
            ) : (
              <>
                {/* Input */}
                <div className="mb-4">
                  <label htmlFor="coupon-code-input" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    ref={couponInputRef}
                    id="coupon-code-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponError) setCouponError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCouponRedeem();
                    }}
                    placeholder="e.g. WELCOME50"
                    disabled={couponLoading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition disabled:opacity-60"
                  />
                </div>

                {/* Error */}
                {couponError && (
                  <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {couponError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeCouponModal}
                    disabled={couponLoading}
                    className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    id="coupon-redeem-btn"
                    type="button"
                    onClick={handleCouponRedeem}
                    disabled={couponLoading || !couponCode.trim()}
                    className="flex-1 bg-emerald-500 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? "Redeeming..." : "Redeem"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
