"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 13
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/credits", {
        credentials: "include",
      });
      if (!res.ok) {
        router.push("/login"); // redirect if not authenticated
        return;
      }
      const data = await res.json();
      setCredits(data.credits);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">Dashboard content here</main>
      <Footer />
    </div>
  );
}
