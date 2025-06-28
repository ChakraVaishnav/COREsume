"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem(
        "user",
        JSON.stringify({ email: form.email, isAuthenticated: true })
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-gray-50 rounded-3xl shadow-xl p-10 relative">
        <Link
          href="/"
          className="absolute top-4 left-4 text-black hover:text-yellow-500 transition"
        >
          <FiArrowLeft size={24} />
        </Link>

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
