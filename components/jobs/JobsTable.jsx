"use client";

const FILTERS = ["All", "High Fit", "Moderate Fit", "Low Fit"];
const PAGE_SIZE = 10;

function fitBadgeClass(label) {
  if (label === "High Fit") return "bg-green-100 text-green-700";
  if (label === "Moderate Fit") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function scoreBarClass(score) {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export default function JobsTable({
  jobs,
  filter,
  loading,
  currentPage,
  totalPages,
  totalJobs,
  onFilterChange,
  onPrevPage,
  onNextPage,
  onViewDetails,
}) {
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeCurrentPage = Math.max(1, currentPage || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);
  const startIndex = totalJobs === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safeCurrentPage * PAGE_SIZE, totalJobs);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => onFilterChange(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === item
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="max-w-xl text-right text-xs text-gray-500">
          <span className="font-semibold text-gray-700">Note:- </span>
          The jobs that are fetching are real openings, but our AI analysis might be mistaken sometimes.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-3 py-3">Job Title</th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Match %</th>
              <th className="px-3 py-3">Fit Label</th>
              <th className="px-3 py-3">Missing Skills</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeJobs.map((job) => {
              const topTwoMissing = (job.missingSkills || []).slice(0, 2);
              const moreCount = Math.max(0, (job.missingSkills || []).length - 2);

              return (
                <tr key={job.id} className="border-b border-gray-100 align-top">
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">{job.jobTitle}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{job.companyName}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{job.location || "-"}</td>
                  <td className="px-3 py-3">
                    <div className="w-32">
                      <div className="mb-1 text-xs font-semibold text-gray-700">{job.matchScore || 0}%</div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${scoreBarClass(job.matchScore || 0)}`}
                          style={{ width: `${Math.max(0, Math.min(100, job.matchScore || 0))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${fitBadgeClass(
                        job.fitLabel
                      )}`}
                    >
                      {job.fitLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {topTwoMissing.map((skill, idx) => (
                        <span
                          key={`${skill}-${idx}`}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {moreCount > 0 && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                          +{moreCount} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onViewDetails(job)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => window.open(job.jobLink, "_blank")}
                        className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-yellow-500"
                      >
                        Apply →
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">
                  Loading jobs...
                </td>
              </tr>
            )}

            {!loading && safeJobs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">
                  No jobs found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalJobs > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="text-xs text-gray-500">
            Showing {startIndex}-{endIndex} of {totalJobs}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={safeCurrentPage === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-xs font-semibold text-gray-700">
              Page {safeCurrentPage} of {safeTotalPages}
            </span>

            <button
              onClick={onNextPage}
              disabled={safeCurrentPage === safeTotalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
