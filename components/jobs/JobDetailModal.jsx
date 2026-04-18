"use client";

export default function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-black">{job.jobTitle}</h2>
            <p className="mt-1 text-sm text-gray-600">{job.companyName}</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  job.fitLabel === "High Fit"
                    ? "bg-green-100 text-green-700"
                    : job.fitLabel === "Moderate Fit"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {job.fitLabel}
              </span>
              <span className="text-sm font-semibold text-gray-800">{job.matchScore}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
          <Section title="Why this matches you">
            <p className="text-sm text-gray-700">{job.whyItMatches || "-"}</p>
          </Section>

          <Section title="AI Summary">
            <p className="text-sm text-gray-700">{job.aiSummary || "-"}</p>
          </Section>

          <Section title="Your Strengths">
            <PillList items={job.strengths} className="bg-green-100 text-green-800" />
          </Section>

          <Section title="Missing Skills">
            <PillList items={job.missingSkills} className="bg-red-100 text-red-700" />
          </Section>

          <Section title="How to improve your resume">
            {Array.isArray(job.resumeImprovements) && job.resumeImprovements.length > 0 ? (
              <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                {job.resumeImprovements.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-700">-</p>
            )}
          </Section>

          <Section title="Full Job Description">
            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {job.jobDescription || "No description available."}
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => window.open(job.jobLink, "_blank")}
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-500"
          >
            Apply →
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </section>
  );
}

function PillList({ items, className }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-gray-700">-</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span key={`${item}-${idx}`} className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
          {item}
        </span>
      ))}
    </div>
  );
}
