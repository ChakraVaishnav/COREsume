"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

const STORAGE_KEY = "coresume_signup_draft";

export default function SignUpPage() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const router = useRouter();

  // ── Restore draft from sessionStorage on mount ──────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.form) setForm(saved.form);
      if (saved.agreed !== undefined) setAgreed(saved.agreed);
      if (saved.step) setStep(saved.step);
    } catch {
      /* ignore parse errors */
    }
  }, []);

  // ── Persist draft to sessionStorage on every change ────────────
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ form, agreed, step }));
    } catch {
      /* ignore quota errors */
    }
  }, [form, agreed, step]);

  // ── Countdown for resend button ─────────────────────────────────
  useEffect(() => {
    if (step !== "otp") return;
    if (countdown === 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, step]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Step 1: send OTP ────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.username || !form.email || !form.password)
      return setError("Please fill in all fields.");
    if (!agreed)
      return setError("You must agree to the Terms and Conditions.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP → create account ────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter the full 6-digit code.");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          otp: code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Clear the draft and go to dashboard
      sessionStorage.removeItem(STORAGE_KEY);
      // Full navigation so HttpOnly cookies are picked up by middleware
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resending) return;
    setError(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  // ── OTP input helpers ───────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Google OAuth ────────────────────────────────────────────────
  const handleGoogleSignup = () => {
    setError(null);
    if (!agreed) return setError("You must agree to the Terms and Conditions.");
    window.location.href = "/api/auth/google/start?mode=signup";
  };

  // ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-yellow-500 hover:text-yellow-600 font-medium text-sm transition"
        >
          <FiArrowLeft size={18} /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 sm:p-14 border border-black/5">

        {/* ── STEP 1: FORM ───────────────────────────────────────── */}
        {step === "form" && (
          <>
            <h1 className="text-3xl font-bold text-center text-black mb-6 tracking-tight select-none">
              Create your COREsume Account
            </h1>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <FancyInput
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
              <FancyInput
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <FancyInput
                name="password"
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={() => setAgreed((a) => !a)}
                  className="mt-1"
                />
                <label htmlFor="terms">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-yellow-600 hover:underline font-medium"
                    target="_blank"
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <SubmitButton loading={loading} text="Continue — Verify Email" />

              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                <span>Or</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon /> Continue with Google
              </button>
            </form>

            {error && (
              <p className="mt-5 text-red-600 font-medium text-center text-sm">{error}</p>
            )}

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-500 hover:underline">
                Login
              </Link>
            </p>
          </>
        )}

        {/* ── STEP 2: OTP ────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center text-2xl select-none">
                  📧
                </div>
              </div>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                Check your inbox
              </h1>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-black">{form.email}</span>.
                <br />
                Enter it below to create your account.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP boxes */}
              <div
                className="flex justify-center gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition text-gray-900"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-600 font-medium text-sm text-center">{error}</p>
              )}

              <SubmitButton
                loading={loading}
                text="Verify & Create Account"
                disabled={otp.join("").length < 6}
              />
            </form>

            {/* Resend + back */}
            <div className="mt-5 text-center text-sm text-gray-500 space-y-3">
              <p>
                Didn&apos;t receive it?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-yellow-600 font-semibold hover:underline disabled:opacity-60"
                  >
                    {resending ? "Sending…" : "Resend OTP"}
                  </button>
                ) : (
                  <span className="text-gray-400">
                    Resend in{" "}
                    <span className="font-semibold text-black">{countdown}s</span>
                  </span>
                )}
              </p>
              <button
                onClick={() => { setStep("form"); setError(null); }}
                className="text-gray-400 hover:text-gray-600 transition text-xs"
              >
                ← Edit my details
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ── Shared UI components ─────────────────────────────────────────────────────

function FancyInput({ type = "text", name, value, onChange, placeholder, ...props }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-gray-400 text-gray-900 font-semibold ${props.className || ""}`}
      {...props}
    />
  );
}

function SubmitButton({ loading, text, disabled = false }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <span className="animate-pulse">Please wait…</span> : text}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.249 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.228 0-9.625-3.33-11.284-7.946l-6.522 5.025C9.504 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.048 12.048 0 0 1-4.084 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
