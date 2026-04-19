"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const RESOURCE_OPTIONS = [
  { key: "users", label: "Manage Users" },
  { key: "resumes", label: "Resume Table" },
  { key: "otp", label: "OTP Table" },
  { key: "ratings", label: "Rating Table" },
  { key: "jobs", label: "Job Table" },
  { key: "jobUsage", label: "Job Usage Table" },
];

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

export default function AdminPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [resource, setResource] = useState("users");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingRows, setLoadingRows] = useState(false);

  const [createJson, setCreateJson] = useState("{\n  \n}");
  const [editId, setEditId] = useState("");
  const [editJson, setEditJson] = useState("{\n  \n}");

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

  useEffect(() => {
    if (!authorized) return;

    const fetchRows = async () => {
      setLoadingRows(true);
      try {
        const res = await fetch(`/api/admin/${resource}?take=120`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setToast(data?.message || "Failed to load data");
          setRows([]);
          setTotal(0);
          return;
        }

        setRows(Array.isArray(data.items) ? data.items : []);
        setTotal(Number(data.total) || 0);
      } catch {
        setToast("Failed to load data");
      } finally {
        setLoadingRows(false);
      }
    };

    fetchRows();
  }, [authorized, resource]);

  const refreshRows = async () => {
    setLoadingRows(true);
    try {
      const res = await fetch(`/api/admin/${resource}?take=120`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(data?.message || "Failed to refresh data");
        return;
      }

      setRows(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total) || 0);
    } catch {
      setToast("Failed to refresh data");
    } finally {
      setLoadingRows(false);
    }
  };

  const handleCreate = async () => {
    let payload;
    try {
      payload = JSON.parse(createJson);
    } catch {
      setToast("Invalid JSON for create payload");
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
      setCreateJson("{\n  \n}");
      await refreshRows();
    } catch {
      setToast("Create failed");
    }
  };

  const beginEdit = (row) => {
    setEditId(String(row?.id ?? ""));
    setEditJson(prettyJson(row));
  };

  const handleUpdate = async () => {
    if (!editId) {
      setToast("Select a row to edit first");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(editJson);
    } catch {
      setToast("Invalid JSON for update payload");
      return;
    }

    try {
      const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(editId)}`, {
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
                    setEditId("");
                    setEditJson("{\n  \n}");
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
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Resource: <span className="font-semibold text-gray-700">{resource}</span> · Total records: {total}
          </p>

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
                      <td key={`${String(row.id)}_${col}`} className="max-w-55 truncate px-3 py-2 align-top">
                        {compactCellValue(row[col])}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => beginEdit(row)}
                          className="rounded-md border border-gray-300 px-2 py-1 font-semibold text-gray-700 hover:bg-gray-100"
                        >
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
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-black">Create Record ({resource})</h2>
            <p className="mt-1 text-xs text-gray-500">Paste valid JSON payload for create.</p>
            <textarea
              value={createJson}
              onChange={(e) => setCreateJson(e.target.value)}
              className="mt-3 h-64 w-full rounded-xl border border-gray-300 bg-gray-50 p-3 font-mono text-xs outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="mt-3 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Create
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-black">Update Record ({resource})</h2>
            <p className="mt-1 text-xs text-gray-500">Click Edit in table, then modify JSON and save.</p>
            <input
              value={editId}
              onChange={(e) => setEditId(e.target.value)}
              placeholder="Record ID"
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-black"
            />
            <textarea
              value={editJson}
              onChange={(e) => setEditJson(e.target.value)}
              className="mt-3 h-56 w-full rounded-xl border border-gray-300 bg-gray-50 p-3 font-mono text-xs outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleUpdate}
              className="mt-3 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
            >
              Save Update
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
