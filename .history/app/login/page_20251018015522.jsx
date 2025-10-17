"use client";

import { useState } from "react";
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
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-white border border-yellow-400 rounded-full shadow-sm hover:bg-yellow-50 hover:text-yellow-600 transition font-semibold text-black z-10"
      >
        <FiArrowLeft className="inline-block" />
        <span className="text-sm">Back to Home</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 relative border border-black/5">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold mb-2 text-black select-none">Welcome Back</h1>
          <p className="text-sm text-gray-600">Log in to access your resume builder and downloads</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-xl shadow-md transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
        )}

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-gray-600 hover:text-yellow-500 transition">
            Forgot Password?
          </Link>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don&apos;t have an account? {" "}
          <Link href="/signup" className="text-yellow-500 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
      </div>
    </main>
  );
}
