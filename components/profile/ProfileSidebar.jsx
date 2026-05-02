"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowLeft, FiBriefcase, FiFileText, FiLogOut, FiUser } from "react-icons/fi";

const PROFILE_TABS = [
  { href: "/profile", key: "profile", label: "Profile", icon: FiUser },
  { href: "/profile/resume", key: "resume", label: "Your Resume", icon: FiFileText },
  { href: "/profile/jobs", key: "jobs", label: "Your Jobs", icon: FiBriefcase },
];

export default function ProfileSidebar({ onLogout, loggingOut }) {
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/user/info", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        // ignore errors in sidebar
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white p-3 md:h-full md:w-60 md:border-r md:border-b-0 md:p-4 flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
        >
          <FiArrowLeft className="inline-block" />
          <span>Back</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
        >
          <FiLogOut className="h-4 w-4" />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Signed in as</p>
        <p className="mt-1 text-sm font-bold text-black">{userData?.username || "Loading..."}</p>
        <p className="truncate text-xs text-gray-600">{userData?.email || ""}</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
        {PROFILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex min-w-fit items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition md:w-full ${
                isActive
                  ? "bg-yellow-400 text-black hover:bg-yellow-500"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden md:block">
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
