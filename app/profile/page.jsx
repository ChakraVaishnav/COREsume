"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileDetailsPanel from "@/components/profile/ProfileDetailsPanel";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleUsernameUpdated = useCallback((nextUser) => {
    if (!nextUser?.username) return;
    setUserData((prev) => ({
      ...(prev || {}),
      ...nextUser,
      username: nextUser.username,
    }));
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/user/info", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error("Failed to fetch user info");
        setUserData(data);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-700 py-20">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 px-0 py-0">
      <ProfileDetailsPanel
        userData={userData}
        onUsernameUpdated={handleUsernameUpdated}
      />
    </div>
  );
}
