"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const OAUTH_ERROR_MESSAGES = {
  google_not_configured:
    "Google sign in is not configured yet. Please contact support.",
  google_access_denied: "Google sign in was canceled.",
  google_invalid_state: "Google sign in could not be verified. Please try again.",
  google_missing_code: "Google sign in was interrupted. Please try again.",
  google_signup_failed: "Google sign in failed. Please try again.",
};

function LoginPageContent() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) return;

    setError(
      OAUTH_ERROR_MESSAGES[oauthError] ||
        "Something went wrong with Google sign in. Please try again."
    );
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      // Persist minimal user info so client-side checks know the user is logged in

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError(null);
    window.location.href = "/api/auth/google/start?mode=login";
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <Link
  href="/"
  className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white border border-yellow-400 rounded-full shadow hover:bg-yellow-50 hover:text-yellow-600 transition font-semibold text-black"
  style={{
    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.12)",
    fontSize: "1rem",
    zIndex: 10,
  }}
>
  <FiArrowLeft className="inline-block" />
  <span>Back to Home</span>
</Link>
      <div className="w-full max-w-md bg-gray-50 rounded-3xl shadow-xl p-10 relative">

        <h1 className="text-4xl font-extrabold mb-8 text-center text-black select-none">
          Welcome Back 👋
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg cursor-pointer transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            <span>Or</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
        )}

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-gray-600 hover:text-yellow-500 transition"
          >
            Forgot Password?
          </Link>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-yellow-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center text-gray-700">
          Loading...
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.249 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.228 0-9.625-3.33-11.284-7.946l-6.522 5.025C9.504 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.048 12.048 0 0 1-4.084 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
