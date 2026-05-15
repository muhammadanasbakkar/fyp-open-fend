"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import Image from "next/image";

// ── types ──────────────────────────────────────────────────────────────────
type HospitalProfile = {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  logoUrl?: string;
};
type Stats = {
  therapistsCount: number;
  appointmentsToday: number;
  appointmentsMonth: number;
  totalAppointments: number;
};
type Therapist = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  specializations: string[];
  fee?: number;
  room?: string;
};
type Appointment = {
  _id: string;
  therapistName: string;
  patientName: string;
  patientId?: string;
  start: string;
  end: string;
  status: string;
  mode: string;
};

const CDN = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "") || "";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  "wellness-center": "Wellness Center",
  "rehab-center": "Rehab Center",
  other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-blue-50 text-blue-700 ring-blue-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

/* ── icons ─────────────────────────────────────────────────── */
const IcoUsers = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IcoCalendarToday = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.25h18" />
  </svg>
);
const IcoChart = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const IcoTotal = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
  </svg>
);
const IcoPhone = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
const IcoMail = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const IcoGlobe = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);
const IcoPin = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

/* ── stat card ────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-3xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-500">{sub}</p>}
    </div>
  );
}

/* ── edit profile modal ───────────────────────────────────── */
function EditProfileModal({
  hospital,
  token,
  onClose,
  onSaved,
}: {
  hospital: HospitalProfile;
  token: string | null;
  onClose: () => void;
  onSaved: (h: HospitalProfile) => void;
}) {
  const [form, setForm] = useState({ ...hospital });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res: any = await api("api/hospital/admin/profile", {
        method: "PATCH",
        headers: {
          ...(authHeader(token || undefined) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      onSaved(res.hospital);
      onClose();
    } catch (e: any) {
      setErr(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-[#4b7eff] focus:bg-white focus:outline-none transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#3a5bef] to-[#7c3aed] px-5 py-4 text-white">
          <p className="text-sm font-bold">Edit hospital profile</p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          {err && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {err}
            </p>
          )}
          {[
            { key: "name", label: "Name" },
            { key: "city", label: "City" },
            { key: "address", label: "Address" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "website", label: "Website" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {label}
              </label>
              <input
                className={inp}
                value={(form as any)[key] || ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Description
            </label>
            <textarea
              className={`${inp} resize-none`}
              rows={3}
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-[#4b7eff] px-5 py-2 text-sm font-bold text-white hover:bg-[#3a6bef] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function HospitalDashboardPage() {
  return (
    <Protected>
      <HospitalDashboardInner />
    </Protected>
  );
}

function HospitalDashboardInner() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "therapists" | "appointments">("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [searchT, setSearchT] = useState("");

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

  const filteredTherapists = therapists.filter((t) => {
    const q = searchT.toLowerCase();
    return (
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.specializations?.some((s) => s.toLowerCase().includes(q))
    );
  });

  // Today's appointments — derived from `appointments` since the API returns
  // `recentAppointments`. Used by the Overview tab to surface what matters now.
  const todaysAppts = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return appointments.filter((a) => {
      const t = new Date(a.start);
      return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
    });
  }, [appointments]);

  if (loading)
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4b7eff] border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* ── Hero hospital card ─────────────────────────────── */}
        {hospital && (
          <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {/* Gradient cover */}
            <div className="relative h-28 bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#7c3aed] sm:h-32">
              <div
                aria-hidden
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl" />

              <span
                className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 backdrop-blur ${
                  hospital.status === "approved"
                    ? "bg-emerald-500/20 text-white ring-white/30"
                    : hospital.status === "pending"
                      ? "bg-amber-500/20 text-white ring-white/30"
                      : "bg-red-500/20 text-white ring-white/30"
                }`}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    hospital.status === "approved"
                      ? "bg-emerald-300"
                      : hospital.status === "pending"
                        ? "bg-amber-300"
                        : "bg-red-300",
                  ].join(" ")}
                />
                {hospital.status}
              </span>
            </div>

            {/* Logo overlap */}
            <div className="relative px-6 sm:px-8">
              <div className="-mt-12 inline-block sm:-mt-14">
                {hospital.logoUrl ? (
                  <img
                    src={`${CDN}/uploads/${hospital.logoUrl}`}
                    alt={hospital.name}
                    className="h-24 w-24 rounded-3xl bg-white object-cover ring-4 ring-white shadow-xl sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-3xl ring-4 ring-white shadow-xl sm:h-28 sm:w-28">
                    🏥
                  </div>
                )}
              </div>
            </div>

            {/* Name + meta + actions */}
            <div className="flex flex-col gap-4 px-6 pb-6 pt-3 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:pb-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    {hospital.name}
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-[#4b7eff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#4b7eff]">
                    {TYPE_LABELS[hospital.type] || hospital.type}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <IcoPin />
                    {hospital.city}
                    {hospital.address ? <span className="text-gray-300"> · {hospital.address}</span> : null}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {hospital.phone && (
                    <span className="inline-flex items-center gap-1">
                      <IcoPhone />
                      {hospital.phone}
                    </span>
                  )}
                  {hospital.email && (
                    <span className="inline-flex items-center gap-1">
                      <IcoMail />
                      {hospital.email}
                    </span>
                  )}
                  {hospital.website && (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#4b7eff] hover:underline"
                    >
                      <IcoGlobe />
                      Website
                    </a>
                  )}
                </div>

                {hospital.description && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                    {hospital.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3a5bef] to-[#6366f1] px-4 py-2 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <IcoChart />
                  View reports
                </Link>
                <button
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Pending banner */}
        {hospital?.status === "pending" && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              ⏳
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Your hospital is pending approval
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Our team is reviewing your submission. You will be notified by email once
                approved.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────── */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Therapists"
              value={stats.therapistsCount}
              sub="currently active"
              icon={<IcoUsers />}
              color="#4b7eff"
            />
            <StatCard
              label="Today"
              value={stats.appointmentsToday}
              sub="confirmed + completed"
              icon={<IcoCalendarToday />}
              color="#0f766e"
            />
            <StatCard
              label="This month"
              value={stats.appointmentsMonth}
              sub={new Date().toLocaleString("en-PK", { month: "long", year: "numeric" })}
              icon={<IcoChart />}
              color="#7c3aed"
            />
            <StatCard
              label="All time"
              value={stats.totalAppointments}
              sub="total appointments"
              icon={<IcoTotal />}
              color="#d97706"
            />
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-1 border-b border-gray-100 px-2 sm:px-4">
            {[
              { key: "overview", label: "Overview" },
              { key: "therapists", label: "Therapists", count: therapists.length },
              { key: "appointments", label: "Appointments", count: appointments.length },
            ].map((t) => {
              const active = activeTab === (t.key as any);
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={[
                    "relative px-4 py-3.5 text-sm font-semibold transition-colors",
                    active ? "text-[#4b7eff]" : "text-gray-500 hover:text-gray-800",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {t.label}
                    {t.count != null && (
                      <span
                        className={[
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          active ? "bg-[#4b7eff]/10 text-[#4b7eff]" : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        {t.count}
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#4b7eff]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="p-5 space-y-6">
              {/* Today's appointments */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">Today&apos;s schedule</p>
                  <span className="text-xs text-gray-500">
                    {todaysAppts.length}{" "}
                    {todaysAppts.length === 1 ? "appointment" : "appointments"}
                  </span>
                </div>
                {todaysAppts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-gray-700">No appointments today.</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Check the Appointments tab for the full list.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {todaysAppts.map((a) => (
                      <AppointmentRow key={a._id} a={a} compact />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent appointments */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">Recent appointments</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("appointments")}
                    className="text-xs font-semibold text-[#4b7eff] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                    No appointments yet.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="px-3 py-2.5 text-left">Patient</th>
                          <th className="px-3 py-2.5 text-left">Therapist</th>
                          <th className="px-3 py-2.5 text-left">When</th>
                          <th className="px-3 py-2.5 text-left">Mode</th>
                          <th className="px-3 py-2.5 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {appointments.slice(0, 5).map((a) => (
                          <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-gray-900">{a.patientName}</p>
                              {a.patientId && (
                                <p className="text-[11px] text-gray-400">{a.patientId}</p>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700">{a.therapistName}</td>
                            <td className="px-3 py-2.5 text-gray-700">
                              <p>{fmt(a.start)}</p>
                              <p className="text-[11px] text-gray-400">
                                {fmtTime(a.start)} – {fmtTime(a.end)}
                              </p>
                            </td>
                            <td className="px-3 py-2.5">
                              <ModePill mode={a.mode} />
                            </td>
                            <td className="px-3 py-2.5">
                              <StatusPill status={a.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Therapists */}
          {activeTab === "therapists" && (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{therapists.length}</span>{" "}
                  therapist{therapists.length !== 1 ? "s" : ""} at this facility
                </p>
                <div className="relative w-full sm:w-64">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="search"
                    value={searchT}
                    onChange={(e) => setSearchT(e.target.value)}
                    placeholder="Search by name, email, or specialty"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                  />
                </div>
              </div>

              {filteredTherapists.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {therapists.length === 0
                      ? "No therapists linked yet"
                      : "No matches"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {therapists.length === 0
                      ? "Therapists who affiliate with this hospital will appear here."
                      : "Try a different search term."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredTherapists.map((t) => (
                    <TherapistRow key={t._id} t={t} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments */}
          {activeTab === "appointments" && (
            <div className="p-5">
              {appointments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-700">No appointments yet</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Bookings made by patients at this facility will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {appointments.map((a) => (
                    <AppointmentRow key={a._id} a={a} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {editOpen && hospital && (
        <EditProfileModal
          hospital={hospital}
          token={token}
          onClose={() => setEditOpen(false)}
          onSaved={(h) => setHospital(h)}
        />
      )}
    </div>
  );
}

/* ── small sub-components ──────────────────────────────────── */

function ModePill({ mode }: { mode: string }) {
  const isOnline = mode === "online";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
        isOnline
          ? "bg-blue-50 text-blue-700 ring-blue-200"
          : "bg-violet-50 text-violet-700 ring-violet-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-blue-500" : "bg-violet-500"}`} />
      {isOnline ? "Online" : "In-person"}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const klass = STATUS_STYLES[status] || "bg-gray-50 text-gray-700 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${klass}`}
    >
      {status}
    </span>
  );
}

function AppointmentRow({ a, compact }: { a: Appointment; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-[#4b7eff]/30 hover:shadow-sm transition-all">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {a.patientName}
          <span className="mx-1.5 text-gray-300">→</span>
          <span className="font-medium text-gray-600">{a.therapistName}</span>
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {compact ? fmtTime(a.start) : `${fmt(a.start)} · ${fmtTime(a.start)}`}
          {" – "}
          {fmtTime(a.end)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <ModePill mode={a.mode} />
        <StatusPill status={a.status} />
      </div>
    </div>
  );
}

function TherapistRow({ t }: { t: Therapist }) {
  const avatarUrl = t.profilePicture ? `${CDN}/uploads/${t.profilePicture}` : null;
  const initials =
    t.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
      console.log(avatarUrl)

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-[#4b7eff]/30 hover:shadow-sm transition-all">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={t.name}
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
          width={48}
          height={48}
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-sm font-bold text-white ring-2 ring-white shadow">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">{t.name}</p>
        <p className="truncate text-xs text-gray-500">{t.email}</p>
        {t.room && (
          <p className="mt-0.5 text-[11px] text-gray-400">Room {t.room}</p>
        )}
        {!!t.specializations?.length && (
          <div className="mt-2 flex flex-wrap gap-1">
            {t.specializations.slice(0, 2).map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]"
              >
                {s}
              </span>
            ))}
            {t.specializations.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                +{t.specializations.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      {t.fee != null && (
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Fee
          </p>
          <p className="text-sm font-bold text-gray-900">PKR {t.fee.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
