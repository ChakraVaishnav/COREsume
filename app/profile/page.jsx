"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
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
  const [deletingSelectedJobs, setDeletingSelectedJobs] = useState(false);
  const [deletingAllJobs, setDeletingAllJobs] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
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
      setSelectedJobIds([]);

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

  const applyLocalJobRemoval = useCallback((jobIds) => {
    const removalSet = new Set(jobIds);
    if (removalSet.size === 0) return;

    setJobs((prev) => prev.filter((job) => !removalSet.has(job.id)));
    setSelectedJobIds((prev) => prev.filter((id) => !removalSet.has(id)));

    setTotalJobs((prevTotal) => {
      const nextTotal = Math.max(0, prevTotal - removalSet.size);
      const nextPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      setTotalPages(nextPages);
      setCurrentPage((prevPage) => Math.min(prevPage, nextPages));
      return nextTotal;
    });
  }, []);

  const getNextJobsPageAfterRemoval = useCallback(
    (removedCount) => {
      const nextTotal = Math.max(0, totalJobs - removedCount);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      return Math.min(currentPage, nextTotalPages);
    },
    [currentPage, totalJobs]
  );

  const toggleJobSelection = useCallback((jobId) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  }, []);

  const togglePageSelection = useCallback((jobIds, checked) => {
    const pageSet = new Set(jobIds);
    setSelectedJobIds((prev) => {
      if (checked) {
        const next = new Set(prev);
        jobIds.forEach((id) => next.add(id));
        return Array.from(next);
      }
      return prev.filter((id) => !pageSet.has(id));
    });
  }, []);

  const handleDeleteJob = useCallback((jobId) => {
    setDeleteConfirm({ type: "single", jobId });
  }, []);

  const handleDeleteAllJobs = useCallback(() => {
    setDeleteConfirm({ type: "all" });
  }, []);

  const handleDeleteSelectedJobs = useCallback(() => {
    if (!selectedJobIds.length) return;
    setDeleteConfirm({ type: "selected", jobIds: [...selectedJobIds] });
  }, [selectedJobIds]);

  const performDeleteJob = useCallback(
    async (jobId) => {
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

        applyLocalJobRemoval([jobId]);
        setJobsActionMessage("Job deleted successfully.");

        const remainingVisibleJobs = jobs.length - 1;
        const nextPage = getNextJobsPageAfterRemoval(1);
        if (remainingVisibleJobs === 0 && totalJobs > 1) {
          await loadJobs(nextPage);
        }
      } catch {
        setJobsActionMessage("Failed to delete job.");
      } finally {
        setDeletingJobId("");
      }
    },
    [applyLocalJobRemoval, getNextJobsPageAfterRemoval, jobs.length, loadJobs, router, totalJobs]
  );

  const performDeleteSelectedJobs = useCallback(
    async (jobIds) => {
      if (!jobIds.length) return;

      setDeletingSelectedJobs(true);
      try {
        const deletedIds = [];
        for (const jobId of jobIds) {
          const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (res.status === 401) {
            router.replace("/login");
            return;
          }

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setJobsActionMessage(data?.message || "Failed to delete selected jobs.");
            continue;
          }

          deletedIds.push(jobId);
        }

        if (deletedIds.length) {
          applyLocalJobRemoval(deletedIds);
          setJobsActionMessage(
            deletedIds.length === jobIds.length
              ? "Selected jobs deleted successfully."
              : "Some selected jobs were deleted."
          );

          const remainingVisibleJobs = Math.max(0, jobs.length - deletedIds.length);
          const nextPage = getNextJobsPageAfterRemoval(deletedIds.length);
          if (remainingVisibleJobs === 0 && totalJobs > deletedIds.length) {
            await loadJobs(nextPage);
          }
        }
      } catch {
        setJobsActionMessage("Failed to delete selected jobs.");
      } finally {
        setDeletingSelectedJobs(false);
      }
    },
    [applyLocalJobRemoval, getNextJobsPageAfterRemoval, jobs.length, loadJobs, router, totalJobs]
  );

  const performDeleteAllJobs = useCallback(async () => {
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

      setJobs([]);
      setSelectedJobIds([]);
      setTotalJobs(0);
      setTotalPages(1);
      setCurrentPage(1);
      setJobsActionMessage("All jobs deleted successfully.");
    } catch {
      setJobsActionMessage("Failed to delete all jobs.");
    } finally {
      setDeletingAllJobs(false);
    }
  }, [router]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;

    const current = deleteConfirm;
    setDeleteConfirm(null);

    if (current.type === "single" && current.jobId) {
      await performDeleteJob(current.jobId);
      return;
    }

    if (current.type === "selected") {
      await performDeleteSelectedJobs(current.jobIds || selectedJobIds);
      return;
    }

    if (current.type === "all") {
      await performDeleteAllJobs();
    }
  }, [deleteConfirm, performDeleteAllJobs, performDeleteJob, performDeleteSelectedJobs, selectedJobIds]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

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
        <div className="flex w-full min-h-0 flex-col md:h-[calc(100vh-4rem)] md:flex-row">
          <ProfileSidebar
            userData={userData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />

          <section className="flex-1 min-w-0 min-h-0 border-t border-gray-200 bg-white text-black md:border-l md:border-t-0">
            <div className="h-full min-h-0 px-0 py-0">

      {deleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white">
              <FiTrash2 className="h-7 w-7" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-black">
              {deleteConfirm.type === "all"
                ? "Delete all jobs?"
                : deleteConfirm.type === "selected"
                  ? "Delete selected jobs?"
                  : "Delete this job?"}
            </h2>
            <p className="mb-6 leading-relaxed text-gray-700">
              {deleteConfirm.type === "all"
                ? "This will permanently remove every saved job entry from your account. This cannot be undone."
                : deleteConfirm.type === "selected"
                  ? `This will permanently remove ${deleteConfirm.jobIds?.length || selectedJobIds.length} selected job entries from your account. This cannot be undone.`
                  : "This will permanently remove this job entry from your account. This cannot be undone."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingJobId !== "" || deletingAllJobs || deletingSelectedJobs}
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {(deletingJobId !== "" || deletingAllJobs || deletingSelectedJobs) ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <circle cx="12" cy="12" r="10" opacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : null}
                  Delete
                </span>
              </button>
              <button
                onClick={handleDeleteCancel}
                className="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
                  onEditResume={() => router.push("/resume-form")}
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
                  onDeleteSelectedJobs={handleDeleteSelectedJobs}
                  onDeleteAllJobs={handleDeleteAllJobs}
                  selectedJobIds={selectedJobIds}
                  onToggleJobSelection={toggleJobSelection}
                  onToggleSelectAll={togglePageSelection}
                  deletingJobId={deletingJobId}
                  deletingSelectedJobs={deletingSelectedJobs}
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
