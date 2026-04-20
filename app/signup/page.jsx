"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

const OAUTH_ERROR_MESSAGES = {
  google_not_configured:
    "Google signup is not configured yet. Please contact support.",
  google_access_denied: "Google signup was canceled.",
  google_invalid_state: "Google signup could not be verified. Please try again.",
  google_missing_code: "Google signup was interrupted. Please try again.",
  google_signup_failed: "Google signup failed. Please try again.",
};

function SignUpContent() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) return;

    setError(
      OAUTH_ERROR_MESSAGES[oauthError] ||
        "Something went wrong with Google signup. Please try again."
    );
  }, [searchParams]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.username || !form.password) {
      return setError("Please fill in all fields");
    }
    if (!agreed) return setError("You must agree to the Terms and Conditions");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Redirect to dashboard on successful signup
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setError(null);

    if (!agreed) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    window.location.href = "/api/auth/google/start?mode=signup";
  };

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
        <h1 className="text-3xl font-bold text-center text-black mb-6 tracking-tight select-none">
          Create your COREsume Account
        </h1>
        <form onSubmit={handleSignup} className="space-y-6">
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
              onChange={() => setAgreed(!agreed)}
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

          <SubmitButton loading={loading} text="Create Account" />

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
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
        {error && (
          <p className="mt-5 text-red-600 font-medium text-center">{error}</p>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignUp() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center text-gray-700">
          Loading...
        </main>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}

function FancyInput({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  ...props
}) {
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

function SubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <span className="animate-pulse">Please wait...</span> : text}
    </button>
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
