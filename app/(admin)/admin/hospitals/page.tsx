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
      const res = await api("api/public/hospitals", {
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setList(Array.isArray(res) ? res : res?.hospitals || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load hospitals.");
    } finally {
      setLoadingList(false);
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Hospitals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add and manage hospitals/clinics available for in-person
            appointments.
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
              className="w-full rounded-md border px-3 py-2 text-sm"
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
  );
}
