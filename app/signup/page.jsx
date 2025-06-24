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
    otp: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const sendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.email) return setError("Please enter a valid email");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setMessage("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.otp) return setError("Please enter the OTP");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

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

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 sm:p-14 animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10 tracking-tight select-none">
          Create your COREsume Account
        </h1>

        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-6">
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
            <SubmitButton loading={loading} text="Send OTP" />
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Verify Your Email
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-medium text-yellow-600">{form.email}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <input
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                pattern="\d{6}"
                maxLength={6}
                required
                className="w-2/3 sm:w-1/2 px-6 py-3 text-lg tracking-widest text-center rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-gray-400 text-gray-900 font-bold shadow-sm"
              />
            </div>

            <SubmitButton loading={loading} text="Verify & Sign Up" />
          </form>
        )}

        {error && (
          <p className="mt-5 text-red-600 font-medium text-center">{error}</p>
        )}
        {message && (
          <p className="mt-5 text-green-600 font-medium text-center">{message}</p>
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

function SubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="animate-pulse">Please wait...</span>
      ) : (
        text
      )}
    </button>
  );
}
