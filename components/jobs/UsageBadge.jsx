"use client";

import { useMemo } from "react";

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

export default function UsageBadge({ usage, loading }) {

  const text = useMemo(() => {
    if (!usage) {
      return "Usage unavailable";
    }

    if (Number(usage.freeSearchesRemainingToday || 0) > 0) {
      return `1 free search left today • ${Number(usage.creditsRemaining || 0)} credits`;
    }

    return `Free resets in ${formatCountdown(usage.freeResetsAt)} • ${Number(usage.creditsRemaining || 0)} credits`;
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
