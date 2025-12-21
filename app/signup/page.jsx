"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function SignUp() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const router = useRouter();

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
