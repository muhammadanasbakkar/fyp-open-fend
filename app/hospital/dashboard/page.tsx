"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";

// ── types ──────────────────────────────────────────────────────────────────
type HospitalProfile = {
  _id: string; name: string; city: string; address: string; phone: string;
  email: string; website?: string; description?: string; type: string;
  status: "pending" | "approved" | "rejected"; logoUrl?: string;
};
type Stats = { therapistsCount: number; appointmentsToday: number; appointmentsMonth: number; totalAppointments: number };
type Therapist = {
  _id: string; name: string; email: string; profilePicture: string | null;
  specializations: string[]; fee?: number; room?: string;
};
type Appointment = {
  _id: string; therapistName: string; patientName: string; patientId?: string;
  start: string; end: string; status: string; mode: string;
};

// ── helpers ────────────────────────────────────────────────────────────────
const CDN = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

const TYPE_LABELS: Record<string, string> = {
  "hospital": "Hospital", "clinic": "Clinic",
  "wellness-center": "Wellness Center", "rehab-center": "Rehab Center", "other": "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${color || ""}`}>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

// ── edit profile modal ─────────────────────────────────────────────────────
function EditProfileModal({
  hospital, token, onClose, onSaved,
}: { hospital: HospitalProfile; token: string | null; onClose: () => void; onSaved: (h: HospitalProfile) => void }) {
  const [form, setForm] = useState({ ...hospital });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true); setErr("");
    try {
      const res: any = await api("api/hospital/admin/profile", {
        method: "PATCH",
        headers: { ...(authHeader(token || undefined) as HeadersInit), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSaved(res.hospital);
      onClose();
    } catch (e: any) { setErr(e.message || "Save failed."); }
    finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-[#4b7eff] focus:bg-white focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#3a5bef] to-[#7c3aed] px-5 py-4 text-white">
          <p className="font-semibold">Edit Hospital Profile</p>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {err && <p className="text-sm text-red-600">{err}</p>}
          {[
            { key: "name", label: "Name" }, { key: "city", label: "City" },
            { key: "address", label: "Address" }, { key: "phone", label: "Phone" },
            { key: "email", label: "Email" }, { key: "website", label: "Website" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
              <input className={inp} value={(form as any)[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <textarea className={`${inp} resize-none`} rows={3} value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="rounded-xl bg-[#4b7eff] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3a6bef] transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function HospitalDashboardPage() {
  return <Protected><HospitalDashboardInner /></Protected>;
}

function HospitalDashboardInner() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [hospital, setHospital]     = useState<HospitalProfile | null>(null);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [activeTab, setActiveTab]   = useState<"overview" | "therapists" | "appointments">("overview");
  const [editOpen, setEditOpen]     = useState(false);
  const [searchT, setSearchT]       = useState("");

  useEffect(() => {
    if (user && user.role !== "hospitalAdmin") router.replace("/");
  }, [user, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api("api/hospital/admin/dashboard", { headers: authHeader(token) as HeadersInit })
      .then((d: any) => {
        setHospital(d.hospital);
        setStats(d.stats);
        setTherapists(d.therapists || []);
        setAppointments(d.recentAppointments || []);
      })
      .catch((e: any) => setErr(e.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredTherapists = therapists.filter(t => {
    const q = searchT.toLowerCase();
    return !q || t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) ||
      t.specializations?.some(s => s.toLowerCase().includes(q));
  });

  if (loading) return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-[#4b7eff] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">

        {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

        {/* ── Hospital profile card ── */}
        {hospital && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {hospital.logoUrl ? (
                  <img src={`${CDN}/uploads/${hospital.logoUrl}`} alt={hospital.name} className="h-16 w-16 rounded-2xl object-cover border border-gray-100" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-3xl text-white shrink-0">
                    🏥
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900">{hospital.name}</h1>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      hospital.status === "approved" ? "bg-emerald-100 text-emerald-700"
                      : hospital.status === "pending" ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                    }`}>
                      {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {TYPE_LABELS[hospital.type] || hospital.type} · {hospital.city}
                  </p>
                  <p className="text-sm text-gray-500">{hospital.address}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    {hospital.phone && <span>📞 {hospital.phone}</span>}
                    {hospital.email && <span>✉ {hospital.email}</span>}
                    {hospital.website && <a href={hospital.website} target="_blank" rel="noreferrer" className="text-[#4b7eff] hover:underline">🌐 Website</a>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/reports"
                  className="rounded-xl border border-[#4b7eff]/30 bg-[#4b7eff]/5 px-4 py-2 text-sm font-medium text-[#4b7eff] hover:bg-[#4b7eff]/10 transition-colors"
                >
                  View Reports
                </Link>
                <button
                  onClick={() => setEditOpen(true)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
            {hospital.description && (
              <p className="mt-3 text-sm text-gray-600 border-t border-gray-50 pt-3">{hospital.description}</p>
            )}
          </div>
        )}

        {/* ── Stats row ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Enrolled Therapists"   value={stats.therapistsCount}    sub="currently active" />
            <StatCard label="Appointments Today"    value={stats.appointmentsToday}  sub="confirmed + completed" />
            <StatCard label="This Month"            value={stats.appointmentsMonth}  sub={new Date().toLocaleString("en-PK", { month: "long" })} />
            <StatCard label="Total Appointments"    value={stats.totalAppointments}  sub="all time" />
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(["overview", "therapists", "appointments"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-[#4b7eff] text-[#4b7eff]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Recent Appointments</p>
              {appointments.length === 0 ? (
                <p className="text-sm text-gray-500">No appointments yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <th className="py-2 text-left">Patient</th>
                        <th className="py-2 text-left">Therapist</th>
                        <th className="py-2 text-left">Date / Time</th>
                        <th className="py-2 text-left">Mode</th>
                        <th className="py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {appointments.map(a => (
                        <tr key={a._id}>
                          <td className="py-2.5">
                            <p className="font-medium text-gray-900">{a.patientName}</p>
                            {a.patientId && <p className="text-xs text-gray-400">{a.patientId}</p>}
                          </td>
                          <td className="py-2.5 text-gray-700">{a.therapistName}</td>
                          <td className="py-2.5 text-gray-700">
                            <p>{fmt(a.start)}</p>
                            <p className="text-xs text-gray-400">{fmtTime(a.start)} – {fmtTime(a.end)}</p>
                          </td>
                          <td className="py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.mode === "online" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                              {a.mode}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Therapists */}
          {activeTab === "therapists" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">
                  {therapists.length} therapist{therapists.length !== 1 ? "s" : ""} at this facility
                </p>
                <input
                  type="search"
                  value={searchT}
                  onChange={e => setSearchT(e.target.value)}
                  placeholder="Search…"
                  className="w-52 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#4b7eff] focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              {filteredTherapists.length === 0 ? (
                <p className="text-sm text-gray-500">{therapists.length === 0 ? "No therapists linked to this hospital yet." : "No results."}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredTherapists.map(t => {
                    const avatarUrl = t.profilePicture ? `${CDN}/uploads/${t.profilePicture}` : null;
                    const initials = t.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
                    return (
                      <div key={t._id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-sm font-bold text-white">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{t.name}</p>
                          <p className="text-xs text-gray-500 truncate">{t.email}</p>
                          {t.room && <p className="text-xs text-gray-400">Room: {t.room}</p>}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(t.specializations || []).slice(0, 2).map(s => (
                              <span key={s} className="rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]">{s}</span>
                            ))}
                            {(t.specializations || []).length > 2 && (
                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-500">+{t.specializations.length - 2}</span>
                            )}
                          </div>
                        </div>
                        {t.fee != null && (
                          <p className="ml-auto text-sm font-semibold text-gray-800 shrink-0">PKR {t.fee.toLocaleString()}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Appointments */}
          {activeTab === "appointments" && (
            <div className="p-5">
              {appointments.length === 0 ? (
                <p className="text-sm text-gray-500">No appointments found.</p>
              ) : (
                <div className="space-y-2">
                  {appointments.map(a => (
                    <div key={a._id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.patientName} → {a.therapistName}</p>
                        <p className="text-xs text-gray-500">{fmt(a.start)} at {fmtTime(a.start)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.mode === "online" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                          {a.mode}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editOpen && hospital && (
        <EditProfileModal
          hospital={hospital}
          token={token}
          onClose={() => setEditOpen(false)}
          onSaved={h => setHospital(h)}
        />
      )}
    </div>
  );
}
