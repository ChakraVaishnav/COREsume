"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin(e) {
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

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        email: form.email,
        isAuthenticated: true
      }));

      router.push("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotPasswordMessage(null);
    setForgotPasswordLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setForgotPasswordMessage("OTP has been sent to your email");
      setShowOtpForm(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotPasswordMessage(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setForgotPasswordMessage(null);
    setVerifyOtpLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      setForgotPasswordMessage("Password updated successfully! You can now login.");
      setShowOtpForm(false);
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error('Verify OTP error:', err);
      setForgotPasswordMessage(err.message);
    } finally {
      setVerifyOtpLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-gray-50 rounded-3xl shadow-xl p-10 relative">
        <Link href="/" className="absolute top-4 left-4 text-black hover:text-yellow-500 transition">
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

        {error && <p className="mt-4 text-red-600 font-medium text-center">{error}</p>}

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="text-gray-600 hover:text-yellow-500 transition"
          >
            Forgot Password?
          </button>
        </div>

        {showForgotPassword && (
          <div className="mt-6 space-y-4">
            {!showOtpForm ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email to reset password"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-lg cursor-pointer transition"
                >
                  {forgotPasswordLoading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-yellow-400 focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={verifyOtpLoading}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-lg cursor-pointer transition"
                >
                  {verifyOtpLoading ? "Verifying..." : "Reset Password"}
                </button>
              </form>
            )}
            {forgotPasswordMessage && (
              <p className={`text-center font-medium ${
                forgotPasswordMessage.includes("successfully") ? "text-green-600" : "text-red-600"
              }`}>
                {forgotPasswordMessage}
              </p>
            )}
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-yellow-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
} 