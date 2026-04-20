"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileDetailsPanel from "@/components/profile/ProfileDetailsPanel";
import ResumeDataPanel from "@/components/profile/ResumeDataPanel";
import JobsPanel from "@/components/profile/JobsPanel";

const PAGE_SIZE = 10;

export default function ProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeLoaded, setResumeLoaded] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobsActionMessage, setJobsActionMessage] = useState("");
  const [deletingJobId, setDeletingJobId] = useState("");
  const [deletingAllJobs, setDeletingAllJobs] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleUsernameUpdated = useCallback((nextUser) => {
    if (!nextUser?.username) return;
    setUserData((prev) => ({
      ...(prev || {}),
      ...nextUser,
      username: nextUser.username,
    }));
  }, []);

  const loadJobs = useCallback(
    async (page = 1) => {
      setJobsLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        const res = await fetch(`/api/jobs/results?${params.toString()}`, {
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
          setJobs([]);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalJobs(0);
          setJobsActionMessage(data?.message || "Failed to load jobs.");
          return;
        }

        const pagination = data?.pagination || {};
        setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        setCurrentPage(Math.max(1, Number(pagination.page) || 1));
        setTotalPages(Math.max(1, Number(pagination.totalPages) || 1));
        setTotalJobs(Math.max(0, Number(pagination.totalJobs) || 0));
        setJobsLoaded(true);
      } finally {
        setJobsLoading(false);
      }
    },
    [router]
  );

  const loadResume = useCallback(async () => {
    setResumeLoading(true);

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

      setResumeLoaded(true);
    } finally {
      setResumeLoading(false);
    }
  }, [router]);

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

  useEffect(() => {
    if (!userData) return;

    if (activeTab === "resume" && !resumeLoaded && !resumeLoading) {
      loadResume();
    }

    if (activeTab === "jobs" && !jobsLoaded && !jobsLoading) {
      loadJobs(1);
    }
  }, [activeTab, jobsLoaded, jobsLoading, loadJobs, loadResume, resumeLoaded, resumeLoading, userData]);

  useEffect(() => {
    if (!jobsActionMessage) return;
    const timer = setTimeout(() => setJobsActionMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [jobsActionMessage]);

  const handleDeleteJob = useCallback(
    async (jobId) => {
      const confirmed = window.confirm("Delete this job entry?");
      if (!confirmed) return;

      setDeletingJobId(jobId);
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setJobsActionMessage(data?.message || "Failed to delete job.");
          return;
        }

        setJobsActionMessage("Job deleted successfully.");
        await loadJobs(currentPage);
      } catch {
        setJobsActionMessage("Failed to delete job.");
      } finally {
        setDeletingJobId("");
      }
    },
    [currentPage, loadJobs, router]
  );

  const handleDeleteAllJobs = useCallback(async () => {
    const confirmed = window.confirm("Delete all your stored jobs? This cannot be undone.");
    if (!confirmed) return;

    setDeletingAllJobs(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setJobsActionMessage(data?.message || "Failed to delete all jobs.");
        return;
      }

      setJobsActionMessage("All jobs deleted successfully.");
      await loadJobs(1);
    } catch {
      setJobsActionMessage("Failed to delete all jobs.");
    } finally {
      setDeletingAllJobs(false);
    }
  }, [loadJobs, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  };

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-gray-700">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="grow min-h-0 pt-16 md:pt-0">
        <div className="mx-auto flex w-full max-w-7xl min-h-0 flex-col md:h-[calc(100vh-4rem)] md:flex-row">
          <ProfileSidebar
            userData={userData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />

          <section className="flex-1 min-w-0 min-h-0 border-t border-gray-200 bg-white text-black md:border-l md:border-t-0">
            <div className="h-full min-h-0 px-4 py-4 sm:px-6 sm:py-5">
              {activeTab === "profile" ? (
                <ProfileDetailsPanel
                  userData={userData}
                  onUsernameUpdated={handleUsernameUpdated}
                />
              ) : null}

              {activeTab === "resume" ? (
                <ResumeDataPanel
                  resumeLoading={resumeLoading}
                  resumeData={resumeData}
                />
              ) : null}

              {activeTab === "jobs" ? (
                <JobsPanel
                  jobs={jobs}
                  jobsLoading={jobsLoading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalJobs={totalJobs}
                  pageNumbers={pageNumbers}
                  onPrevPage={() => {
                    if (currentPage <= 1) return;
                    loadJobs(currentPage - 1);
                  }}
                  onNextPage={() => {
                    if (currentPage >= totalPages) return;
                    loadJobs(currentPage + 1);
                  }}
                  onSelectPage={(pageNo) => {
                    loadJobs(pageNo);
                  }}
                  onDeleteJob={handleDeleteJob}
                  onDeleteAllJobs={handleDeleteAllJobs}
                  deletingJobId={deletingJobId}
                  deletingAllJobs={deletingAllJobs}
                  jobsActionMessage={jobsActionMessage}
                />
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
