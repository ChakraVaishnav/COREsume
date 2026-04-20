"use client";

import Link from "next/link";

function ReadOnlyField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-black/65">{label}</label>
      <input
        readOnly
        value={value || ""}
        className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
      />
    </div>
  );
}

export default function ProfileDetailsPanel({ userData }) {
  return (
    <div className="h-full overflow-y-auto pr-1 text-black">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Your Profile</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your account details and security settings.</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Name" value={userData?.username || ""} />
            <ReadOnlyField label="Email" value={userData?.email || ""} />
          </div>
        </div>

        <div className="pt-1">
          <Link
            href="/change-password"
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-black/90"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
