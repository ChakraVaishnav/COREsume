"use client";

import { useState, useEffect } from "react";

export default function AddApplicationModal({ open, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    if (open) {
      setCompanyName("");
      setRole("");
      setSalary("");
      setLocation("");
      setJobType("");
      setJobLink("");
      setNotes("");
      setPriority("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!role.trim()) {
      setError("Job role is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({
        companyName: companyName.trim(),
        role: role.trim(),
        salary: salary.trim() || undefined,
        location: location.trim() || undefined,
        jobType: jobType || undefined,
        jobLink: jobLink.trim() || undefined,
        notes: notes.trim() || undefined,
        priority: priority || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="pipeline-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pipeline-modal">
        <div className="pipeline-modal-header">
          <h2>Add Application</h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ background: "none", border: "none", fontSize: "1.25rem", color: "#9ca3af", cursor: "pointer" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="pipeline-modal-body">
          <div className="pipeline-form-grid">
            <div className="pipeline-field">
              <label htmlFor="pipeline-company">Company Name *</label>
              <input
                id="pipeline-company"
                type="text"
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setError(""); }}
                placeholder="e.g. Google"
                autoFocus
              />
            </div>
            <div className="pipeline-field">
              <label htmlFor="pipeline-role">Job Role *</label>
              <input
                id="pipeline-role"
                type="text"
                value={role}
                onChange={(e) => { setRole(e.target.value); setError(""); }}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="pipeline-field">
              <label htmlFor="pipeline-salary">Salary / CTC</label>
              <input
                id="pipeline-salary"
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 12 LPA"
              />
            </div>
            <div className="pipeline-field">
              <label htmlFor="pipeline-location">Location</label>
              <input
                id="pipeline-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
              />
            </div>
            <div className="pipeline-field">
              <label htmlFor="pipeline-jobtype">Job Type</label>
              <select
                id="pipeline-jobtype"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="pipeline-field">
              <label htmlFor="pipeline-priority">Priority</label>
              <select
                id="pipeline-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">None</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="pipeline-field pipeline-form-full">
              <label htmlFor="pipeline-joblink">Job Link</label>
              <input
                id="pipeline-joblink"
                type="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="pipeline-field pipeline-form-full">
              <label htmlFor="pipeline-notes">Notes</label>
              <textarea
                id="pipeline-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this application..."
                rows={2}
              />
            </div>
          </div>

          {error && (
            <p style={{
              fontSize: "0.8125rem",
              color: "#000",
              background: "#fff",
              border: "1px solid #000",
              borderRadius: "0.5rem",
              padding: "0.5rem 0.75rem",
              marginTop: "1rem",
            }}>
              {error}
            </p>
          )}
        </div>

        <div className="pipeline-modal-footer">
          <button
            className="pipeline-btn pipeline-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`pipeline-btn pipeline-btn-primary ${loading ? "pipeline-btn-loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading || !companyName.trim() || !role.trim()}
          >
            {loading ? <><span className="pipeline-spinner pipeline-spinner-sm" /> Creating...</> : "Create Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
