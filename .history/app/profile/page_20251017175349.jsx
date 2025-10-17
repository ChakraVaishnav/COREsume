"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import Navbar from "@/components/Navbar";
import { FiArrowLeft } from "react-icons/fi";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/user/info", {
        credentials: "include", // sends cookies
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch user info");
      setUserData(data);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  fetchUserInfo();
}, []);


  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Link
  href="/dashboard"
  className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white border border-yellow-400 rounded-full shadow hover:bg-yellow-50 hover:text-yellow-600 transition font-semibold text-black"
  style={{
    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.12)",
    fontSize: "1rem",
    zIndex: 10,
  }}
>
  <FiArrowLeft className="inline-block" />
  <span>Back</span>
</Link>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
          {/* Profile Icon */}
          <FaUserCircle className="text-6xl text-yellow-400 mx-auto" />

          <h2 className="text-3xl font-extrabold text-gray-900">Your Profile</h2>

          {/* Info Grid */}
          <div className="text-left space-y-4 text-gray-700 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Name:</span>
              <span>{userData?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Email:</span>
              <span>{userData?.email}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Link
              href="/change-password"
              className="w-full block text-center bg-yellow-400 text-black py-2 px-4 rounded-md font-semibold hover:bg-yellow-500 transition"
            >
              Change Password
            </Link>

            <button
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-md font-semibold hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
