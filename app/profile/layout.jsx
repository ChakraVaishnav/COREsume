"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/profile/ProfileSidebar";

export default function ProfileLayout({ children }) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="grow min-h-0 pt-16 md:pt-0">
        <div className="flex w-full min-h-0 flex-col md:h-[calc(100vh-4rem)] md:flex-row">
          <ProfileSidebar
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />

          <section className="flex-1 min-w-0 min-h-0 border-t border-gray-200 bg-white text-black md:border-l md:border-t-0 flex flex-col">
            <div className="flex-1 overflow-auto flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <div className="mt-auto">
                <Footer />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
