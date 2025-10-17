"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const sendOtp = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/password/forgot-password-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to send OTP");
        setStatus("error");
      } else {
        setMessage("OTP sent to your email.");
        setStep(2);
        setStatus("otp-sent");
      }
    } catch {
      setMessage("Something went wrong.");
      setStatus("error");
    }
  };

  const verifyOtp = async () => {
    setStatus("verifying");
    try {
      const res = await fetch("/api/password/forgot-password-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Invalid OTP");
        setStatus("error");
      } else {
        setStep(3);
        setMessage("OTP verified. Set your new password.");
      }
    } catch {
      setMessage("Something went wrong.");
      setStatus("error");
    }
  };

  const resetPassword = async () => {
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("resetting");
    try {
      const res = await fetch("/api/password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Password reset failed");
        setStatus("error");
      } else {
        setMessage("Password reset successful. Redirecting...");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setMessage("Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <Link
  href="/change-password"
  className="absolute top-120 left-165 flex items-center gap-2 px-4 py-2 bg-white border border-yellow-400 rounded-full shadow hover:bg-yellow-50 hover:text-yellow-600 transition font-semibold text-black"
  style={{
    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.12)",
    fontSize: "1rem",
    zIndex: 10,
  }}
>
  <FiArrowLeft className="inline-block" />
  <span>Back</span>
</Link>
        <h2 className="text-2xl font-bold text-center text-gray-900">Forgot Password</h2>
        
        {step === 1 && (
          <>
            <p className="text-sm text-gray-600 text-center">Enter your email to receive an OTP.</p>
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOtp}
              disabled={status === "sending"}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-md font-semibold"
            >
              {status === "sending" ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-600 text-center">Enter the OTP sent to {email}.</p>
            <input
              type="text"
              maxLength={6}
              placeholder="OTP"
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-center tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-md font-semibold"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-gray-600 text-center">Set a new password.</p>
            <input
              type="password"
              placeholder="New Password"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              onClick={resetPassword}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-md font-semibold"
            >
              Reset Password
            </button>
          </>
        )}

        {message && (
          <p
            className={`text-sm text-center ${
              status === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
