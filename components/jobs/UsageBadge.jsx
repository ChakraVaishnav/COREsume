"use client";

import { useEffect, useMemo, useState } from "react";

function formatCountdown(resetsAt) {
  if (!resetsAt) return "";

  const target = new Date(resetsAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, target - now);

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export default function UsageBadge() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);

  const loadUsage = async () => {
    try {
      const res = await fetch("/api/jobs/usage", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUsage(null);
        return;
      }

      const data = await res.json();
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();

    const interval = setInterval(loadUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  const text = useMemo(() => {
    if (!usage) {
      return "Usage unavailable";
    }

    if (usage.tier === "free") {
      if (usage.searchesRemainingToday > 0) {
        return "1 search left today";
      }

      return `Resets in ${formatCountdown(usage.resetsAt)}`;
    }

    return `${usage.creditsRemaining || 0} credits remaining`;
  }, [usage]);

  if (loading) {
    return (
      <div className="h-8 w-44 animate-pulse rounded-full bg-gray-200" />
    );
  }

  return (
    <div className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800">
      {text}
    </div>
  );
}
