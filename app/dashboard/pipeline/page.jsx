"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import PipelineFilters from "@/components/pipeline/PipelineFilters";
import AddApplicationModal from "@/components/pipeline/AddApplicationModal";
import ApplicationDetailModal from "@/components/pipeline/ApplicationDetailModal";
import "./pipeline.css";

export default function PipelinePage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt-desc");

  const fetchApplications = useCallback(async () => {
    try {
      const [field, order] = sortBy.split("-");
      const params = new URLSearchParams({
        sortBy: field,
        sortOrder: order,
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/pipeline/applications?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch applications");
      }
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      const res = await fetch(`/api/pipeline/applications/${applicationId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        fetchApplications();
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleCreateApplication = async (data) => {
    const res = await fetch("/api/pipeline/applications", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to create application");
    }

    await fetchApplications();
  };

  const handleUpdateApplication = async (id, data) => {
    const res = await fetch(`/api/pipeline/applications/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to update application");
    }

    const { application } = await res.json();
    setApplications((prev) => prev.map((app) => (app.id === id ? application : app)));
    setSelectedApplication(application);
  };

  const handleDeleteApplication = async (id) => {
    const res = await fetch(`/api/pipeline/applications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to delete application");
    }

    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar fixed />
      <main className="grow pt-20 pb-16">
        {/* Header */}
        <section className="px-4 sm:px-8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black">
                Career Pipeline
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your job applications from applied to joined
              </p>
            </div>
            <button
              className="pipeline-btn pipeline-btn-primary"
              onClick={() => setModalOpen(true)}
              style={{ gap: "0.5rem" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Application
            </button>
          </div>

          {/* Stats bar */}
          {!loading && applications.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2 mt-3">
              {[
                { label: "Total", count: applications.length },
                { label: "Applied", count: applications.filter((a) => a.status === "Applied").length },
                { label: "Interviewing", count: applications.filter((a) => a.status === "Interviewing").length },
                { label: "On Hold", count: applications.filter((a) => a.status === "On Hold").length },
                { label: "Offers", count: applications.filter((a) => a.status === "Offer").length },
                { label: "Joined", count: applications.filter((a) => a.status === "Joined").length },
                { label: "Rejected", count: applications.filter((a) => a.status === "Rejected").length },
                { label: "Withdrawn", count: applications.filter((a) => a.status === "Withdrawn").length },
                { label: "Ghosted", count: applications.filter((a) => a.status === "Ghosted").length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {stat.label}: {stat.count}
                </div>
              ))}
            </div>
          )}

          <PipelineFilters
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </section>

        {/* Content */}
        <section className="px-4 sm:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <div className="pipeline-spinner pipeline-spinner-xl" />
                <p style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>Loading applications...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-sm">{error}</p>
              <button className="pipeline-btn pipeline-btn-secondary mt-4" onClick={fetchApplications}>
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="pipeline-empty">
              <div className="pipeline-empty-icon" style={{ background: "#facc15" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h3 style={{ color: "#000" }}>No applications yet</h3>
              <p>Start tracking your job applications by adding your first one. Organize them with a Kanban board.</p>
              <button
                className="pipeline-btn pipeline-btn-primary"
                onClick={() => setModalOpen(true)}
              >
                + Add Your First Application
              </button>
            </div>
          ) : (
            <KanbanBoard
              applications={applications}
              onStatusChange={handleStatusChange}
              onClickApplication={setSelectedApplication}
            />
          )}
        </section>
      </main>
      <Footer />

      <AddApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateApplication}
      />
      <ApplicationDetailModal
        application={selectedApplication}
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdate={handleUpdateApplication}
        onDelete={handleDeleteApplication}
      />
    </div>
  );
}
