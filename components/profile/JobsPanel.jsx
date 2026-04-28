"use client";

import { FiCheck } from "react-icons/fi";

const MAX_STORED_JOBS = 50;

function SelectCheckbox({ checked, onChange, labelClassName = "" }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${labelClassName}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
          checked
            ? "border-yellow-500 bg-yellow-400 text-black"
            : "border-gray-300 bg-white text-transparent"
        }`}
        aria-hidden="true"
      >
        <FiCheck className="h-3.5 w-3.5" />
      </span>
    </label>
  );
}

function InlineSpinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export default function JobsPanel({
  jobs,
  jobsLoading,
  currentPage,
  totalPages,
  totalJobs,
  pageNumbers,
  onPrevPage,
  onNextPage,
  onSelectPage,
  onDeleteJob,
  onDeleteSelectedJobs,
  onDeleteAllJobs,
  selectedJobIds,
  onToggleJobSelection,
  onToggleSelectAll,
  deletingJobId,
  deletingSelectedJobs,
  deletingAllJobs,
  jobsActionMessage,
}) {
  const visibleJobIds = jobs.map((job) => job.id);
  const allVisibleSelected = visibleJobIds.length > 0 && visibleJobIds.every((id) => selectedJobIds.includes(id));

  return (
    <div className="h-full min-h-0 flex flex-col text-black">
      <div className="shrink-0 space-y-2">
        <h2 className="text-2xl font-extrabold text-black">Your Jobs</h2>
        <p className="text-sm text-gray-600">
          Only the last 50 jobs of yours will be stored and displayed here, older than 50 jobs will be deleted.
        </p>
        <p className="text-xs text-gray-500">
          Pagination is real server pagination: 10 jobs per page, up to 5 pages.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Showing page {currentPage} of {totalPages} - Total jobs: {totalJobs} / {MAX_STORED_JOBS}
            {selectedJobIds.length ? ` - Selected: ${selectedJobIds.length}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onDeleteSelectedJobs}
              disabled={deletingSelectedJobs || selectedJobIds.length === 0 || jobsLoading}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1.5">
                {deletingSelectedJobs ? <InlineSpinner /> : null}
                {deletingSelectedJobs ? "Deleting selected..." : "Delete Selected Jobs"}
              </span>
            </button>

            <button
              type="button"
              onClick={onDeleteAllJobs}
              disabled={deletingAllJobs || totalJobs === 0 || jobsLoading}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1.5">
                {deletingAllJobs ? <InlineSpinner /> : null}
                {deletingAllJobs ? "Deleting all..." : "Delete All Jobs"}
              </span>
            </button>
          </div>
        </div>

        {jobsActionMessage ? (
          <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
            {jobsActionMessage}
          </div>
        ) : null}
      </div>

      <div className="mt-3 min-h-0 grow rounded-xl border border-gray-200 bg-white">
        <div className="space-y-3 p-3 md:hidden">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-black">{job.jobTitle || "-"}</p>
                  <p className="mt-1 text-xs text-gray-700">{job.companyName || "-"}</p>
                </div>
                <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-gray-600">
                  <SelectCheckbox
                    checked={selectedJobIds.includes(job.id)}
                    onChange={() => onToggleJobSelection(job.id)}
                  />
                  Select
                </label>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <p>
                  <span className="font-semibold text-gray-800">Location:</span> {job.location || "-"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Fit:</span> {job.fitLabel || "-"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Score:</span> {job.matchScore ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Posted:</span> {job.postedDate || "-"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {job.jobLink ? (
                  <a
                    href={job.jobLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                  >
                    Open Job
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => onDeleteJob(job.id)}
                  disabled={deletingJobId === job.id || deletingAllJobs}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {deletingJobId === job.id ? <InlineSpinner /> : null}
                    {deletingJobId === job.id ? "Deleting..." : "Delete"}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {!jobsLoading && jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">
              No jobs found.
            </div>
          ) : null}
        </div>

        <div className="hidden h-full overflow-auto md:block">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-600">
                    <SelectCheckbox
                      checked={allVisibleSelected}
                      onChange={(e) => onToggleSelectAll(visibleJobIds, e.target.checked)}
                    />
                    Select
                  </label>
                </th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Fit</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Posted</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-black">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-3 py-2">
                    <SelectCheckbox
                      checked={selectedJobIds.includes(job.id)}
                      onChange={() => onToggleJobSelection(job.id)}
                    />
                  </td>
                  <td className="max-w-56 truncate px-3 py-2">{job.jobTitle || "-"}</td>
                  <td className="max-w-44 truncate px-3 py-2">{job.companyName || "-"}</td>
                  <td className="max-w-40 truncate px-3 py-2">{job.location || "-"}</td>
                  <td className="px-3 py-2">{job.fitLabel || "-"}</td>
                  <td className="px-3 py-2">{job.matchScore ?? "-"}</td>
                  <td className="px-3 py-2">{job.postedDate || "-"}</td>
                  <td className="px-3 py-2">
                    {job.jobLink ? (
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onDeleteJob(job.id)}
                      disabled={deletingJobId === job.id || deletingAllJobs}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {deletingJobId === job.id ? <InlineSpinner /> : null}
                        {deletingJobId === job.id ? "Deleting..." : "Delete"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}

              {!jobsLoading && jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-400">
                    No jobs found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 shrink-0">
        {jobsLoading ? (
          <p className="text-sm text-gray-500">Loading jobs...</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={currentPage <= 1 || jobsLoading}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            {pageNumbers.map((pageNo) => (
              <button
                key={pageNo}
                type="button"
                onClick={() => onSelectPage(pageNo)}
                disabled={jobsLoading}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  pageNo === currentPage
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNo}
              </button>
            ))}

            <button
              type="button"
              onClick={onNextPage}
              disabled={currentPage >= totalPages || jobsLoading}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
