"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Hospital = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  description?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt?: string;
  updatedAt?: string;
};

type PendingHospital = {
  _id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  description?: string;
  adminUser?: { _id: string; name: string; email: string } | null;
  createdAt: string;
};

export default function HospitalsAdminPage() {
  return (
    <Protected>
      <RoleGuard roles={["superAdmin"]}>
        <HospitalsInner />
      </RoleGuard>
    </Protected>
  );
}

function HospitalsInner() {
  const { token } = useAuth();
  const [list, setList] = useState<Hospital[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [pending, setPending] = useState<PendingHospital[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [resetPwdId, setResetPwdId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  // form state
  const [editing, setEditing] = useState<Hospital | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditing(null);
    setName("");
    setAddress("");
    setCity("");
    setPhone("");
    setDescription("");
    setLat("");
    setLng("");
  }

  function fillForm(h: Hospital) {
    setEditing(h);
    setName(h.name || "");
    setAddress(h.address || "");
    setCity(h.city || "");
    setPhone(h.phone || "");
    setDescription(h.description || "");
    if (h.location?.coordinates?.length === 2) {
      setLng(String(h.location.coordinates[0] ?? ""));
      setLat(String(h.location.coordinates[1] ?? ""));
    } else {
      setLng("");
      setLat("");
    }
  }

  async function load() {
    setErr("");
    setMsg("");
    setLoadingList(true);
    try {
      const [res, pendingRes] = await Promise.all([
        api("api/public/hospitals", { headers: authHeader(token || undefined) as HeadersInit }),
        api("api/hospital/pending", { headers: authHeader(token || undefined) as HeadersInit }).catch(() => ({ hospitals: [] })),
      ]);
      setList(Array.isArray(res) ? res : res?.hospitals || []);
      setPending((pendingRes as any)?.hospitals || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load hospitals.");
    } finally {
      setLoadingList(false);
    }
  }

  async function approveHospital(id: string) {
    setApproving(id);
    try {
      await api(`api/hospital/${id}/approve`, {
        method: "PATCH",
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setPending(prev => prev.filter(h => h._id !== id));
      setMsg("Hospital approved successfully.");
      load();
    } catch (e: any) {
      setErr(e.message || "Approval failed.");
    } finally {
      setApproving(null);
    }
  }

  async function resetPassword() {
    if (!resetPwdId) return;
    if (newPassword.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setResetting(true);
    setErr("");
    try {
      await api(`api/hospital/${resetPwdId}/reset-password`, {
        method: "PATCH",
        headers: { ...(authHeader(token || undefined) as HeadersInit), "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      setMsg("Password reset successfully. The hospital admin can now log in with the new password.");
    } catch (e: any) {
      setErr(e.message || "Reset failed.");
    } finally {
      setResetting(false);
      setResetPwdId(null);
      setNewPassword("");
    }
  }

  async function rejectHospital() {
    if (!rejectId) return;
    setApproving(rejectId);
    try {
      await api(`api/hospital/${rejectId}/reject`, {
        method: "PATCH",
        headers: { ...(authHeader(token || undefined) as HeadersInit), "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setPending(prev => prev.filter(h => h._id !== rejectId));
      setMsg("Hospital application rejected.");
    } catch (e: any) {
      setErr(e.message || "Rejection failed.");
    } finally {
      setApproving(null);
      setRejectId(null);
      setRejectReason("");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((h) =>
      [h.name, h.address, h.city, h.phone]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(term))
    );
  }, [q, list]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);
    try {
      const body: any = {
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
        description: description.trim() || undefined,
      };
      // optional geo
      const hasLat = lat.trim() !== "";
      const hasLng = lng.trim() !== "";
      if (hasLat && hasLng) {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          body.location = { type: "Point", coordinates: [lngNum, latNum] };
        }
      }

      if (!body.name) {
        throw new Error("Hospital name is required.");
      }

      if (editing) {
        const updated = await api(`api/hospitals/${editing._id}`, {
          method: "PATCH",
          headers: {
            ...authHeader(token || undefined),
            "Content-Type": "application/json",
          } as HeadersInit,
          body: JSON.stringify(body),
        });
        // reflect changes in list
        setList((prev) =>
          prev.map((h) => (h._id === editing._id ? { ...h, ...updated } : h))
        );
        setMsg("Hospital updated.");
      } else {
        const created = await api("api/admin/hospitals", {
          method: "POST",
          headers: {
            ...(authHeader(token || undefined) as HeadersInit),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        setList((prev) => [created, ...prev]);
        setMsg("Hospital created.");
      }
      resetForm();
    } catch (e: any) {
      setErr(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setErr("");
    setMsg("");
    if (!confirm("Delete this hospital? This cannot be undone.")) return;
    try {
      await api(`api/hospitals/${id}`, {
        method: "DELETE",
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setList((prev) => prev.filter((h) => h._id !== id));
      if (editing?._id === id) resetForm();
      setMsg("Hospital deleted.");
    } catch (e: any) {
      setErr(e.message || "Delete failed.");
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">

      {/* ── Reset password modal ── */}
      {resetPwdId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-gray-900">Reset Admin Password</h3>
            <p className="text-sm text-gray-600">Set a new password for this hospital&apos;s admin account.</p>
            <input
              type="password"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setResetPwdId(null); setNewPassword(""); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={resetPassword} disabled={resetting} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                {resetting ? "Resetting…" : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject modal ── */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-gray-900">Reject Application</h3>
            <p className="text-sm text-gray-600">Optionally provide a reason for rejection.</p>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none focus:border-red-400 focus:outline-none"
              rows={3}
              placeholder="Reason (optional)…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={rejectHospital} disabled={!!approving} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {approving ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending applications ── */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{pending.length}</span>
              <p className="text-sm font-semibold text-amber-800">Pending Hospital Applications</p>
            </div>
          </div>
          <div className="divide-y divide-amber-100">
            {pending.map(h => (
              <div key={h._id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900">{h.name}
                    <span className="ml-2 text-xs font-normal text-gray-500 capitalize">{h.type || "hospital"}</span>
                  </p>
                  <p className="text-xs text-gray-600">{h.city}{h.address ? ` · ${h.address}` : ""}</p>
                  {h.email && <p className="text-xs text-gray-500">{h.email}{h.phone ? ` · ${h.phone}` : ""}</p>}
                  {h.adminUser && (
                    <p className="mt-1 text-xs text-gray-500">
                      Admin: <span className="font-medium text-gray-700">{h.adminUser.name}</span> ({h.adminUser.email})
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Applied {new Date(h.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  {h.description && <p className="mt-1 text-xs text-gray-500 max-w-sm">{h.description}</p>}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => approveHospital(h._id)}
                    disabled={approving === h._id}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {approving === h._id ? "Approving…" : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectId(h._id)}
                    disabled={!!approving}
                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  {h.adminUser && (
                    <button
                      onClick={() => setResetPwdId(h._id)}
                      className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Reset Password
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
            Admin
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">Hospitals & Clinics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add and manage hospitals/clinics available for in-person appointments.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name, city, address…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Alerts */}
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium">
            {editing ? "Edit hospital" : "Add a hospital"}
          </p>
          {editing && (
            <button
              onClick={resetForm}
              className="text-xs text-gray-600 hover:underline"
              title="Clear form"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., City Care Hospital"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-700">Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street & area"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">City</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Lahore"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 …"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-700">
              Description (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff]"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short info (parking, hours, entrance notes, etc.)"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Latitude (optional)
            </label>
            <Input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g., 31.5204"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Longitude (optional)
            </label>
            <Input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g., 74.3587"
            />
          </div>

          <div className="sm:col-span-2">
            <Button disabled={saving}>
              {saving
                ? "Saving…"
                : editing
                ? "Save changes"
                : "Create hospital"}
            </Button>
          </div>
        </form>
      </div>

      {/* List Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">All hospitals</p>
          <p className="text-xs text-gray-500">
            {filtered.length ? `${filtered.length} total` : "None yet"}
          </p>
        </div>

        {loadingList ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-4 h-20"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-600">No hospitals found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((h) => (
              <div
                key={h._id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{h.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {[h.address, h.city].filter(Boolean).join(", ") || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {h.phone || "—"}
                      {h.location?.coordinates?.length === 2
                        ? ` • (${h.location.coordinates[1]}, ${h.location.coordinates[0]})`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fillForm(h)}
                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setResetPwdId(h._id)}
                      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      Reset Pwd
                    </button>
                    <button
                      onClick={() => remove(h._id)}
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {h.description && (
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {h.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
