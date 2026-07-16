"use client";

import { useState, useEffect } from "react";

export default function ApplicationDetailModal({ application, open, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (open && application) {
      setEditing(false);
      setShowDeleteConfirm(false);
      setError("");
      setEditData({
        companyName: application.companyName || "",
        role: application.role || "",
        salary: application.salary || "",
        location: application.location || "",
        jobType: application.jobType || "",
        jobLink: application.jobLink || "",
        notes: application.notes || "",
        priority: application.priority || "",
        status: application.status || "Applied",
      });
    }
  }, [open, application]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !application) return null;

  const handleSave = async () => {
    if (!editData.companyName.trim() || !editData.role.trim()) {
      setError("Company name and role are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onUpdate(application.id, editData);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await onDelete(application.id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete application");
      setDeleting(false);
    }
  };

  const initial = application.companyName.charAt(0).toUpperCase();

  return (
    <div className="pipeline-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pipeline-modal" style={{ maxWidth: "600px", width: "95%" }}>
        <div className="pipeline-modal-header" style={{ alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div className="pipeline-detail-logo" style={{ width: "48px", height: "48px", fontSize: "1.5rem", borderRadius: "0.5rem", background: "#facc15", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
              {initial}
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{application.companyName}</h2>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{application.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || deleting}
            style={{ background: "none", border: "none", fontSize: "1.25rem", color: "#9ca3af", cursor: "pointer" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="pipeline-modal-body">
          {error && (
            <p style={{ fontSize: "0.8125rem", color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", marginBottom: "1rem" }}>
              {error}
            </p>
          )}

          {!editing ? (
            <div>
              {/* View Mode */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "9999px", background: "#000", color: "#fff" }}>
                  {application.status}
                </span>
                {application.priority && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "9999px", background: "#facc15", color: "#000" }}>
                    Priority: {application.priority}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Salary / CTC</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0 }}>{application.salary || "—"}</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Location</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0 }}>{application.location || "—"}</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Job Type</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0 }}>{application.jobType || "—"}</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Applied On</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0 }}>{new Date(application.applicationDate).toLocaleDateString()}</p>
                </div>
              </div>

              {application.jobLink && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", marginBottom: "0.25rem" }}>Job Link</p>
                  <a href={application.jobLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem", color: "#111827", textDecoration: "underline", wordBreak: "break-all" }}>
                    {application.jobLink}
                  </a>
                </div>
              )}

              {application.notes && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", marginBottom: "0.25rem" }}>Notes</p>
                  <div style={{ background: "#fff", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", color: "#374151", whiteSpace: "pre-wrap" }}>
                    {application.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pipeline-form-grid">
              {/* Edit Mode */}
              <div className="pipeline-field">
                <label>Company Name *</label>
                <input type="text" value={editData.companyName} onChange={(e) => setEditData({ ...editData, companyName: e.target.value })} autoFocus />
              </div>
              <div className="pipeline-field">
                <label>Role *</label>
                <input type="text" value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} />
              </div>
              <div className="pipeline-field">
                <label>Salary / CTC</label>
                <input type="text" value={editData.salary} onChange={(e) => setEditData({ ...editData, salary: e.target.value })} />
              </div>
              <div className="pipeline-field">
                <label>Location</label>
                <input type="text" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
              </div>
              <div className="pipeline-field">
                <label>Job Type</label>
                <select value={editData.jobType} onChange={(e) => setEditData({ ...editData, jobType: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="pipeline-field">
                <label>Status</label>
                <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Offer">Offer</option>
                  <option value="Joined">Joined</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Ghosted">Ghosted</option>
                </select>
              </div>
              <div className="pipeline-field pipeline-form-full">
                <label>Job Link</label>
                <input type="url" value={editData.jobLink} onChange={(e) => setEditData({ ...editData, jobLink: e.target.value })} />
              </div>
              <div className="pipeline-field pipeline-form-full">
                <label>Notes</label>
                <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={4} />
              </div>
            </div>
          )}
        </div>

        <div className="pipeline-modal-footer" style={{ justifyContent: "space-between" }}>
          <div>
            {!editing && !showDeleteConfirm && (
              <button className="pipeline-btn pipeline-btn-secondary" onClick={() => setShowDeleteConfirm(true)}>Delete</button>
            )}
            {showDeleteConfirm && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 700 }}>Are you sure?</span>
                <button className={`pipeline-btn pipeline-btn-danger ${deleting ? "pipeline-btn-loading" : ""}`} onClick={handleDelete} disabled={deleting} style={{background: "#000", color: "#fff", borderColor: "#000"}}>
                  {deleting ? <><span className="pipeline-spinner pipeline-spinner-sm" style={{ borderColor: "#fff", borderTopColor: "transparent" }}/> Deleting...</> : "Yes, Delete"}
                </button>
                <button className="pipeline-btn pipeline-btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancel</button>
              </div>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!editing ? (
              <>
                <button className="pipeline-btn pipeline-btn-secondary" onClick={onClose} disabled={deleting}>Close</button>
                <button className="pipeline-btn pipeline-btn-primary" onClick={() => setEditing(true)} disabled={deleting}>Edit Application</button>
              </>
            ) : (
              <>
                <button className="pipeline-btn pipeline-btn-secondary" onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
                <button className={`pipeline-btn pipeline-btn-primary ${loading ? "pipeline-btn-loading" : ""}`} onClick={handleSave} disabled={loading}>
                  {loading ? <><span className="pipeline-spinner pipeline-spinner-sm" /> Saving...</> : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
