"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ResumeDataPanel from "@/components/profile/ResumeDataPanel";

export default function ResumePage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);

  const loadResume = useCallback(async () => {
    try {
      const res = await fetch("/api/resume/get", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResumeData(null);
      } else {
        setResumeData(data?.data ?? null);
      }
    } finally {
      setResumeLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  return (
    <div className="h-full min-h-0 px-0 py-0">
      <ResumeDataPanel
        resumeLoading={resumeLoading}
        resumeData={resumeData}
        onEditResume={() => router.push("/resume-form")}
      />
    </div>
  );
}
