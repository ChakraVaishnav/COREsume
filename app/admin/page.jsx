"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const RESOURCE_OPTIONS = [
  { key: "users", label: "Manage Users" },
  { key: "resumes", label: "Resume Table" },
  { key: "otp", label: "OTP Table" },
  { key: "ratings", label: "Rating Table" },
  { key: "jobs", label: "Job Table" },
  { key: "jobUsage", label: "Job Usage Table" },
];

const PAGE_SIZE = 50;
const NON_EDITABLE_FIELDS = new Set(["id", "createdAt", "updatedAt"]);
const CREATE_FIELD_HINTS = {
  users: [
    { key: "username", type: "string" },
    { key: "email", type: "string" },
    { key: "password", type: "string" },
    { key: "creds", type: "number" },
    { key: "jobsInDb", type: "number" },
    { key: "totalJobsSearched", type: "number" },
    { key: "unlimited", type: "boolean" },
  ],
  resumes: [
    { key: "userId", type: "number" },
    { key: "data", type: "json" },
  ],
  otp: [
    { key: "email", type: "string" },
    { key: "code", type: "string" },
    { key: "expiresAt", type: "string" },
  ],
  ratings: [
    { key: "userId", type: "number" },
    { key: "score", type: "number" },
    { key: "comment", type: "string" },
    { key: "template", type: "string" },
  ],
  jobs: [
    { key: "userId", type: "number" },
    { key: "searchId", type: "string" },
    { key: "jobTitle", type: "string" },
    { key: "companyName", type: "string" },
    { key: "jobDescription", type: "string" },
    { key: "skillsRequired", type: "json" },
    { key: "experienceRequired", type: "string" },
    { key: "location", type: "string" },
    { key: "salary", type: "string" },
    { key: "jobLink", type: "string" },
    { key: "postedDate", type: "string" },
    { key: "source", type: "string" },
    { key: "matchScore", type: "number" },
    { key: "fitLabel", type: "string" },
    { key: "missingSkills", type: "json" },
    { key: "strengths", type: "json" },
    { key: "reasoning", type: "string" },
    { key: "aiSummary", type: "string" },
    { key: "whyItMatches", type: "string" },
    { key: "resumeImprovements", type: "json" },
    { key: "tier", type: "string" },
    { key: "expiresAt", type: "string" },
  ],
  jobUsage: [
    { key: "userId", type: "number" },
    { key: "date", type: "string" },
    { key: "searchCount", type: "number" },
    { key: "jobsFetched", type: "number" },
    { key: "tier", type: "string" },
    { key: "credits", type: "number" },
    { key: "creditsUsed", type: "number" },
    { key: "lastSearchAt", type: "string" },
  ],
};

function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function compactCellValue(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return "{...}";
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 67)}...` : text;
}

function getFieldType(value) {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value) || (value && typeof value === "object")) return "json";
  return "string";
}

function toEditInputValue(value, fieldType) {
  if (fieldType === "json") return prettyJson(value ?? null);
  if (fieldType === "boolean") return value ? "true" : "false";
  if (fieldType === "number") return Number.isFinite(value) ? String(value) : "";
  if (value === null || value === undefined) return "";
  return String(value);
}

function parseEditInputValue(rawValue, fieldType) {
  if (fieldType === "json") {
    if (!String(rawValue).trim()) return null;
    return JSON.parse(rawValue);
  }

  if (fieldType === "boolean") {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
    throw new Error("must be true or false");
  }

  if (fieldType === "number") {
    if (!String(rawValue).trim()) return null;
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      throw new Error("must be a valid number");
    }
    return parsed;
  }

  return rawValue;
}

function getCreateFields(resource, rows) {
  const hints = CREATE_FIELD_HINTS[resource] || [];

  const inferred = new Map();
  for (const row of rows) {
    for (const [key, value] of Object.entries(row || {})) {
      if (NON_EDITABLE_FIELDS.has(key)) continue;
      if (!inferred.has(key)) {
        inferred.set(key, getFieldType(value));
      }
    }
  }

  if (!inferred.size) {
    return hints;
  }

  const result = [];
  const pushed = new Set();

  for (const field of hints) {
    if (inferred.has(field.key)) {
      result.push({ key: field.key, type: inferred.get(field.key) });
      pushed.add(field.key);
    } else {
      result.push(field);
      pushed.add(field.key);
    }
  }

  const remaining = [...inferred.entries()]
    .filter(([key]) => !pushed.has(key))
    .sort((a, b) => a[0].localeCompare(b[0]));

  for (const [key, type] of remaining) {
    result.push({ key, type });
  }

  return result;
}

function buildInitialDraft(fields) {
  const draft = {};
  for (const field of fields) {
    draft[field.key] = field.type === "boolean" ? "false" : "";
  }
  return draft;
}

export default function AdminPage() {
  const router = useRouter();
  const loadMoreRef = useRef(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [resource, setResource] = useState("users");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [createDraft, setCreateDraft] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState("");
  const [editFields, setEditFields] = useState([]);
  const [editDraft, setEditDraft] = useState({});

  const [toast, setToast] = useState("");

  const columns = useMemo(() => {
    const allKeys = new Set();
    for (const row of rows) {
      Object.keys(row || {}).forEach((key) => allKeys.add(key));
    }

    const preferredOrder = ["id", "userId", "email", "username", "template", "score", "createdAt", "updatedAt"];
    const keyList = [...allKeys];

    keyList.sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.localeCompare(b);
    });

    return keyList.slice(0, 8);
  }, [rows]);

  const createFields = useMemo(() => getCreateFields(resource, rows), [resource, rows]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingRowId("");
    setEditFields([]);
    setEditDraft({});
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateDraft({});
  }, []);

  const openCreateModal = useCallback(() => {
    const fields = getCreateFields(resource, rows);
    setCreateDraft(buildInitialDraft(fields));
    setIsCreateModalOpen(true);
  }, [resource, rows]);

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      try {
        const res = await fetch("/api/admin/meta", { credentials: "include" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.authorized) {
          if (!active) return;
          setToast("Unauthorized");
          setTimeout(() => router.replace("/"), 1100);
          return;
        }

        if (!active) return;
        setAuthorized(true);
        setAdminUser(data.admin || null);
      } catch {
        if (!active) return;
        setToast("Unauthorized");
        setTimeout(() => router.replace("/"), 1100);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    verifyAdmin();
    return () => {
      active = false;
    };
  }, [router]);

  const fetchRowsPage = useCallback(async ({ offset = 0, reset = false } = {}) => {
    if (reset) {
      setLoadingRows(true);
    }

    try {
      const res = await fetch(`/api/admin/${resource}?take=${PAGE_SIZE}&offset=${offset}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(data?.message || "Failed to load data");
        if (reset) {
          setRows([]);
          setTotal(0);
          setNextOffset(0);
          setHasMore(false);
        }
        return;
      }

      const incoming = Array.isArray(data.items) ? data.items : [];
      const safeTotal = Number(data.total) || 0;
      const reportedNextOffset = Number(data.nextOffset);
      const safeNextOffset = Number.isFinite(reportedNextOffset) ? reportedNextOffset : offset + incoming.length;

      setRows((prev) => {
        if (reset) return incoming;

        const seen = new Set(prev.map((row) => String(row?.id ?? "")));
        const merged = [...prev];
        for (const item of incoming) {
          const key = String(item?.id ?? "");
          if (!seen.has(key)) {
            merged.push(item);
            seen.add(key);
          }
        }
        return merged;
      });

      setTotal(safeTotal);
      setNextOffset(safeNextOffset);
      setHasMore(Boolean(data.hasMore ?? safeNextOffset < safeTotal));
    } catch {
      setToast("Failed to load data");
      if (reset) {
        setRows([]);
        setTotal(0);
        setNextOffset(0);
        setHasMore(false);
      }
    } finally {
      if (reset) {
        setLoadingRows(false);
      }
    }
  }, [resource]);

  useEffect(() => {
    if (!authorized) return;

    setRows([]);
    setTotal(0);
    setNextOffset(0);
    setHasMore(false);
    setLoadingMore(false);
    closeCreateModal();
    closeEditModal();
    fetchRowsPage({ offset: 0, reset: true });
  }, [authorized, resource, closeCreateModal, closeEditModal, fetchRowsPage]);

  const refreshRows = async () => {
    setLoadingMore(false);
    setNextOffset(0);
    setHasMore(false);
    closeEditModal();
    await fetchRowsPage({ offset: 0, reset: true });
  };

  const loadMoreRows = useCallback(async () => {
    if (!authorized || loadingRows || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    await fetchRowsPage({ offset: nextOffset, reset: false });
    setLoadingMore(false);
  }, [authorized, fetchRowsPage, hasMore, loadingMore, loadingRows, nextOffset]);

  useEffect(() => {
    if (!authorized) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreRows();
        }
      },
      { root: null, rootMargin: "220px 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [authorized, loadMoreRows]);

  const handleCreate = async () => {
    const payload = {};
    try {
      for (const field of createFields) {
        const rawValue = createDraft[field.key];
        if (field.type !== "boolean" && !String(rawValue ?? "").trim()) {
          continue;
        }

        const parsed = parseEditInputValue(rawValue, field.type);
        if (parsed === null && field.type !== "boolean") {
          continue;
        }

        payload[field.key] = parsed;
      }
    } catch (error) {
      setToast(`Invalid value in create form: ${error?.message || "Please check your input"}`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/${resource}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(data?.message || "Create failed");
        return;
      }

      setToast("Created successfully");
      setCreateDraft({});
      closeCreateModal();
      await refreshRows();
    } catch {
      setToast("Create failed");
    }
  };

  const beginEdit = (row) => {
    const rowId = row?.id;
    if (rowId === undefined || rowId === null || rowId === "") {
      setToast("Cannot edit a record without an id");
      return;
    }

    const editable = Object.entries(row || {}).filter(([key]) => !NON_EDITABLE_FIELDS.has(key));
    if (!editable.length) {
      setToast("No editable fields found for this record");
      return;
    }

    const fields = editable.map(([key, value]) => ({
      key,
      type: getFieldType(value),
    }));

    const initialDraft = {};
    for (const field of fields) {
      initialDraft[field.key] = toEditInputValue(row[field.key], field.type);
    }

    setEditingRowId(String(rowId));
    setEditFields(fields);
    setEditDraft(initialDraft);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingRowId) {
      setToast("Select a row to edit first");
      return;
    }

    const payload = {};
    try {
      for (const field of editFields) {
        payload[field.key] = parseEditInputValue(editDraft[field.key], field.type);
      }
    } catch (error) {
      setToast(`Invalid value in form: ${error?.message || "Please check your input"}`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(editingRowId)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(data?.message || "Update failed");
        return;
      }

      setToast("Updated successfully");
      closeEditModal();
      await refreshRows();
    } catch {
      setToast("Update failed");
    }
  };

  const handleDelete = async (rowId) => {
    const confirmed = window.confirm(`Delete record ${rowId}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(String(rowId))}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(data?.message || "Delete failed");
        return;
      }

      setToast("Deleted successfully");
      await refreshRows();
    } catch {
      setToast("Delete failed");
    }
  };

  useEffect(() => {
    if (!isEditModalOpen && !isCreateModalOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateModalOpen, isEditModalOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-sm text-gray-600">Checking admin access...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {toast && (
          <div className="fixed right-4 top-4 z-50 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            {toast}
          </div>
        )}
        <p className="text-sm text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-black/10 bg-yellow-300 px-4 py-2 text-sm font-semibold text-black shadow">
          {toast}
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-black">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-500">
                Signed in as admin: {adminUser?.username || "user"} (id: {adminUser?.id ?? "unknown"})
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Go Home
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {RESOURCE_OPTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setResource(item.key);
                    closeEditModal();
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    resource === item.key
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={refreshRows}
              disabled={loadingRows}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
              {loadingRows ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Add Record
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Resource: <span className="font-semibold text-gray-700">{resource}</span> · Total records: {total}
          </p>

          {loadingRows && (
            <p className="mt-2 text-xs text-gray-500">Loading first {PAGE_SIZE} records...</p>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 font-semibold uppercase tracking-wide">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {rows.map((row) => (
                  <tr key={String(row.id)}>
                    {columns.map((col) => (
                      <td key={`${String(row.id)}_${col}`} className="max-w-56 truncate px-3 py-2 align-top">
                        {compactCellValue(row[col])}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(row)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="rounded-md border border-red-300 px-2 py-1 font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-sm text-gray-400">
                      No records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Loaded: {rows.length} / {total}</span>
            <span>
              {loadingMore
                ? "Loading more..."
                : hasMore
                  ? `Scroll for next ${PAGE_SIZE}`
                  : rows.length > 0
                    ? "All records loaded"
                    : "No records"}
            </span>
          </div>
          <div ref={loadMoreRef} className="h-6" />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-black">Create Record ({resource})</h2>
            <p className="mt-1 text-sm text-gray-600">Use the Add Record button to open a field-based form.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-3 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Open Add Form
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-black">Update Records</h2>
            <p className="mt-1 text-sm text-gray-600">Use the Edit button in each row to open a popup form and update fields.</p>
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Non-editable fields: id, createdAt, updatedAt.</p>
            </div>
          </div>
        </section>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-black">Edit {resource} record #{editingRowId}</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
              {editFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{field.key}</label>

                  {field.type === "boolean" ? (
                    <select
                      value={editDraft[field.key] ?? "false"}
                      onChange={(e) => {
                        setEditDraft((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : field.type === "json" ? (
                    <textarea
                      value={editDraft[field.key] ?? ""}
                      onChange={(e) => {
                        setEditDraft((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      className="h-28 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs outline-none focus:border-black"
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={editDraft[field.key] ?? ""}
                      onChange={(e) => {
                        setEditDraft((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-black">Add new {resource} record</h2>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
              {createFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{field.key}</label>

                  {field.type === "boolean" ? (
                    <select
                      value={createDraft[field.key] ?? "false"}
                      onChange={(e) => {
                        setCreateDraft((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : field.type === "json" ? (
                    <textarea
                      value={createDraft[field.key] ?? ""}
                      onChange={(e) => {
                        setCreateDraft((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      placeholder={field.key.toLowerCase().includes("skills") || field.key.toLowerCase().includes("improvements") ? "[]" : "{}"}
                      className="h-28 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs outline-none focus:border-black"
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={createDraft[field.key] ?? ""}
                      onChange={(e) => {
                        setCreateDraft((prev) => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
              >
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
