"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobSearchPanel from "@/components/jobs/JobSearchPanel";
import JobsTable from "@/components/jobs/JobsTable";
import JobDetailModal from "@/components/jobs/JobDetailModal";
import UsageBadge from "@/components/jobs/UsageBadge";

const PAGE_SIZE = 10;

export default function JobsDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    setMounted(true);
    checkAuthAndLoadJobs();
  }, []);

  const loadJobs = async ({ page = 1, filter = "All" } = {}) => {
    setLoadingJobs(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (filter !== "All") {
        params.set("fitLabel", filter);
      }

      const jobsRes = await fetch(`/api/jobs/results?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!jobsRes.ok) {
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
        setCurrentPage(1);
        return;
      }

      const data = await jobsRes.json();
      const pagination = data?.pagination || {};

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setCurrentPage(Math.max(1, Number(pagination.page) || 1));
      setTotalPages(Math.max(1, Number(pagination.totalPages) || 1));
      setTotalJobs(Math.max(0, Number(pagination.totalJobs) || 0));
    } finally {
      setLoadingJobs(false);
    }
  };

  const checkAuthAndLoadJobs = async () => {
    try {
      const authRes = await fetch("/api/user/credits", {
        method: "GET",
        credentials: "include",
      });

      if (!authRes.ok) {
        router.push("/login");
        return;
      }

      await loadJobs({ page: 1, filter: "All" });
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />

      <main className="grow pt-20 pb-16">
        <div className="w-full px-4 sm:px-8">
          <div className="mt-6 mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-black"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <UsageBadge />
          </div>

          <div className="space-y-5">
            <JobSearchPanel
              onSearchSuccess={async () => {
                await loadJobs({ page: 1, filter: activeFilter });
              }}
            />

            <JobsTable
              jobs={jobs}
              filter={activeFilter}
              loading={loadingJobs}
              currentPage={currentPage}
              totalPages={totalPages}
              totalJobs={totalJobs}
              onFilterChange={async (nextFilter) => {
                setActiveFilter(nextFilter);
                await loadJobs({ page: 1, filter: nextFilter });
              }}
              onPrevPage={async () => {
                if (currentPage <= 1) return;
                await loadJobs({ page: currentPage - 1, filter: activeFilter });
              }}
              onNextPage={async () => {
                if (currentPage >= totalPages) return;
                await loadJobs({ page: currentPage + 1, filter: activeFilter });
              }}
              onViewDetails={(job) => setSelectedJob(job)}
            />
          </div>
        </div>
      </main>

      <Footer />

      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
