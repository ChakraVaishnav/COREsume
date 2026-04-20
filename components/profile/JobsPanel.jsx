"use client";

const MAX_STORED_JOBS = 50;

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
  onDeleteAllJobs,
  deletingJobId,
  deletingAllJobs,
  jobsActionMessage,
}) {
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
          </p>

          <button
            type="button"
            onClick={onDeleteAllJobs}
            disabled={deletingAllJobs || totalJobs === 0 || jobsLoading}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingAllJobs ? "Deleting all..." : "Delete All Jobs"}
          </button>
        </div>

        {jobsActionMessage ? (
          <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
            {jobsActionMessage}
          </div>
        ) : null}
      </div>

      <div className="mt-3 min-h-0 grow overflow-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
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
                    {deletingJobId === job.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}

            {!jobsLoading && jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-400">
                  No jobs found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
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
