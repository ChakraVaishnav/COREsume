"use client";

import Link from "next/link";
import { FiArrowLeft, FiBriefcase, FiFileText, FiLogOut, FiUser } from "react-icons/fi";

const PROFILE_TABS = [
  { key: "profile", label: "Profile", icon: FiUser },
  { key: "resume", label: "Your Resume", icon: FiFileText },
  { key: "jobs", label: "Your Jobs", icon: FiBriefcase },
];

export default function ProfileSidebar({ userData, activeTab, onTabChange, onLogout, loggingOut }) {
  return (
    <aside className="w-72 min-h-0 h-full shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
      >
        <FiArrowLeft className="inline-block" />
        <span>Back</span>
      </Link>

      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Signed in as</p>
        <p className="mt-1 text-sm font-bold text-black">{userData?.username || "User"}</p>
        <p className="truncate text-xs text-gray-600">{userData?.email || ""}</p>
      </div>

      <nav className="space-y-2">
        {PROFILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-black text-white"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-gray-200 pt-4 lg:mt-auto">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiLogOut className="h-4 w-4" />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
