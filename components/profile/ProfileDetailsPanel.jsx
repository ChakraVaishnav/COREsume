"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function ReadOnlyField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-black/65">{label}</label>
      <input
        readOnly
        value={value ?? ""}
        className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
      />
    </div>
  );
}

export default function ProfileDetailsPanel({ userData, onUsernameUpdated }) {
  const [username, setUsername] = useState(userData?.username || "");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    setUsername(userData?.username || "");
  }, [userData?.username]);

  const handleUpdateUsername = async () => {
    setUsernameMessage("");
    setUsernameError("");

    const nextUsername = username.trim();
    if (!nextUsername) {
      setUsernameError("Username is required.");
      return;
    }

    setSavingUsername(true);
    try {
      const res = await fetch("/api/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: nextUsername }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUsernameError(data?.error || "Failed to update username.");
        return;
      }

      setUsername(data?.user?.username || nextUsername);
      setUsernameMessage("Username updated successfully.");
      if (typeof onUsernameUpdated === "function") {
        onUsernameUpdated(data?.user);
      }
    } catch {
      setUsernameError("Failed to update username.");
    } finally {
      setSavingUsername(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-1 text-black">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Your Profile</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your account details and security settings.</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-black/65">
                Name
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black"
                />
                <button
                  type="button"
                  onClick={handleUpdateUsername}
                  disabled={savingUsername}
                  className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUsername ? "Saving..." : "Save"}
                </button>
              </div>
              {usernameError ? (
                <p className="text-xs font-medium text-red-600">{usernameError}</p>
              ) : null}
              {usernameMessage ? (
                <p className="text-xs font-medium text-green-700">{usernameMessage}</p>
              ) : null}
            </div>
            <ReadOnlyField label="Email" value={userData?.email || ""} />
            <ReadOnlyField label="Credits" value={userData?.creds ?? 0} />
            <ReadOnlyField label="Total Job Searches" value={userData?.totalJobsSearched ?? 0} />
          </div>
        </div>

        <div className="pt-1">
          <Link
            href="/change-password"
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-500"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
