"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export default function CreditsPage() {
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState("");

  const loadHistory = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        const res = await fetch(`/api/user/credit-history?${params.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load credit history.");
          return;
        }

        setHistory(data.history || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
      } catch (err) {
        setError("Failed to load credit history.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-bold text-black">Credit History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all your credit additions and usages.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-black">
              {loading && history.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-6 w-6 animate-spin text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Loading history...
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-10 text-center text-gray-400">
                    No credit history found.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {row.reason}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-right font-bold ${row.credits > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {row.credits > 0 ? `+${row.credits}` : row.credits}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalRecords} records)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadHistory(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => {
                  const showDots = i > 0 && p !== arr[i-1] + 1;
                  return (
                    <div key={p} className="flex items-center gap-2">
                      {showDots && <span className="text-gray-400">...</span>}
                      <button
                        onClick={() => loadHistory(p)}
                        className={`min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-bold transition ${
                          currentPage === p
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
              <button
                onClick={() => loadHistory(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
