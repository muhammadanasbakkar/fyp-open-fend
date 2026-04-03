"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";

// ── shared types ──────────────────────────────────────────────────────────────
type KV   = { label: string; count: number };
type Monthly = { label: string; count: number };

// ── colour palette ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500", completed: "bg-blue-500",
  pending:   "bg-amber-400",   cancelled: "bg-red-400",
  "in-person": "bg-violet-500", online: "bg-sky-500",
  signed: "bg-emerald-500",    draft: "bg-amber-400",
};
const PILL_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  pending:   "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
  "in-person": "bg-violet-100 text-violet-700",
  online:    "bg-sky-100 text-sky-700",
};

// ── reusable chart components ─────────────────────────────────────────────────
function BarChart({ data, title, color = "bg-[#4b7eff]" }: {
  data: Monthly[]; title: string; color?: string;
}) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-gray-800">{title}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500">{d.count || ""}</span>
            <div
              className={`w-full rounded-t-md ${color} transition-all`}
              style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%` }}
            />
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DualBarChart({ data, title }: {
  data: { label: string; patients: number; therapists: number }[]; title: string;
}) {
  const max = Math.max(...data.flatMap(d => [d.patients, d.therapists]), 1);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold text-gray-800">{title}</p>
      <div className="mb-3 flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#4b7eff]" />Patients</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#7c3aed]" />Therapists</span>
      </div>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="flex w-full items-end gap-0.5">
              <div className="flex-1 rounded-t bg-[#4b7eff] transition-all" style={{ height: `${Math.max((d.patients / max) * 112, d.patients > 0 ? 4 : 0)}px` }} />
              <div className="flex-1 rounded-t bg-[#7c3aed] transition-all" style={{ height: `${Math.max((d.therapists / max) * 112, d.therapists > 0 ? 4 : 0)}px` }} />
            </div>
            <span className="text-[10px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, title }: { data: KV[]; title: string }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colors = ["#4b7eff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-gray-800">{title}</p>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 36 36" className="h-24 w-24 shrink-0">
          {(() => {
            let offset = 0;
            return data.map((d, i) => {
              const pct = (d.count / total) * 100;
              const el = (
                <circle
                  key={i}
                  r="15.9155" cx="18" cy="18"
                  fill="transparent"
                  stroke={colors[i % colors.length]}
                  strokeWidth="3.5"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={-offset}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              );
              offset += pct;
              return el;
            });
          })()}
          <text x="18" y="20" textAnchor="middle" className="text-[6px] font-bold fill-gray-700" style={{ fontSize: "6px", fontWeight: 700 }}>
            {total}
          </text>
        </svg>
        <div className="space-y-1.5 flex-1 min-w-0">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
                <span className="capitalize truncate text-gray-700">{d.label}</span>
              </div>
              <span className="font-semibold text-gray-900 shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HBarChart({ data, title }: { data: KV[]; title: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-gray-800">{title}</p>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-xs text-gray-600 text-right">{d.label}</span>
            <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4b7eff] to-[#7c3aed] transition-all"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-xs font-semibold text-gray-700">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${accent || "border-gray-100"}`}>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-gray-800 mt-2">{children}</h2>;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

// ── role-specific report views ────────────────────────────────────────────────

function HospitalAdminReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#4b7eff]/20 bg-[#4b7eff]/5 px-5 py-3">
        <p className="font-semibold text-gray-800">{data.hospital?.name}</p>
        <p className="text-sm text-gray-500 capitalize">{data.hospital?.type} · {data.hospital?.city}</p>
      </div>

      <SectionTitle>Overview</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Appointments"   value={data.summary.totalAppointments} />
        <StatCard label="This Month"           value={data.summary.apptThisMonth} />
        <StatCard label="Today"                value={data.summary.apptToday} />
        <StatCard label="Completed"            value={data.summary.completedCount} />
        <StatCard label="Completion Rate"      value={`${data.summary.completionRate}%`} sub="of all appointments" />
        <StatCard label="Active Therapists"    value={data.summary.therapistsCount} />
      </div>

      <SectionTitle>Trends & Breakdown</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart data={data.monthly} title="Appointments — Last 6 Months" />
        <DonutChart data={data.byStatus} title="By Status" />
        <DonutChart data={data.byMode}   title="By Mode (In-Person vs Online)" />
        {data.topTherapists?.length > 0 && (
          <HBarChart data={data.topTherapists.map((t: any) => ({ label: t.name, count: t.count }))} title="Top Therapists by Sessions" />
        )}
      </div>
    </div>
  );
}

function TherapistReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Your Performance Summary</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={data.summary.totalAppointments} />
        <StatCard label="This Month"         value={data.summary.apptThisMonth} />
        <StatCard label="Upcoming"           value={data.summary.upcomingAppts} sub="confirmed" />
        <StatCard label="Patients Seen"      value={data.summary.totalPatients} />
        <StatCard label="SOAP Notes"         value={data.summary.totalNotes} />
        <StatCard label="Signed Notes"       value={data.summary.signedNotes} />
        <StatCard label="Draft Notes"        value={data.summary.draftNotes} />
        <StatCard label="Notes Signed Rate"  value={`${data.summary.notesSignedRate}%`} />
      </div>

      <SectionTitle>Trends & Breakdown</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart data={data.monthlyAppointments} title="Appointments — Last 6 Months" />
        <BarChart data={data.monthlyNotes} title="SOAP Notes — Last 6 Months" color="bg-[#7c3aed]" />
        <DonutChart data={data.byStatus} title="Appointments by Status" />
        <DonutChart data={data.byMode}   title="Appointments by Mode" />
      </div>

      <SectionTitle>Notes Quality</SectionTitle>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Signed vs Draft</span>
          <span className="text-sm font-semibold text-gray-800">{data.summary.notesSignedRate}% signed</span>
        </div>
        <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${data.summary.notesSignedRate}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Signed: {data.summary.signedNotes}</span>
          <span>Draft: {data.summary.draftNotes}</span>
        </div>
      </div>
    </div>
  );
}

function SupervisorReport({ data }: { data: any }) {
  const maxNotes = Math.max(...(data.therapistStats || []).map((t: any) => t.totalNotes), 1);
  return (
    <div className="space-y-6">
      <SectionTitle>Supervision Overview</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Enrolled Therapists" value={data.summary.totalTherapists} />
        <StatCard label="Total Session Notes" value={data.summary.totalNotes} />
        <StatCard label="Notes This Month"    value={data.summary.notesThisMonth} />
        <StatCard label="Signed Notes"        value={data.summary.signedNotes} />
        <StatCard label="Draft Notes"         value={data.summary.draftNotes} />
        <StatCard label="Signed Rate"         value={`${data.summary.signedRate}%`} />
      </div>

      <SectionTitle>Monthly Notes Trend</SectionTitle>
      <BarChart data={data.monthly} title="Session Notes — Last 6 Months" color="bg-[#7c3aed]" />

      <SectionTitle>Therapist Performance</SectionTitle>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3 text-left">Therapist</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Specializations</th>
              <th className="px-4 py-3 text-center">Total Notes</th>
              <th className="px-4 py-3 text-center">Signed</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data.therapistStats || []).map((t: any) => (
              <tr key={String(t._id)}>
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(t.specializations || []).slice(0, 2).map((s: string) => (
                      <span key={s} className="rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] text-[#4b7eff]">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gray-800">{t.totalNotes}</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{t.signedNotes}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#4b7eff]" style={{ width: `${(t.totalNotes / maxNotes) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
            {!data.therapistStats?.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No therapists enrolled.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuperAdminReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Platform Overview</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Hospitals"    value={data.summary.activeHospitals} sub={`${data.summary.pendingHospitals} pending`} />
        <StatCard label="Active Therapists"   value={data.summary.totalTherapists} sub={`${data.summary.pendingTherapists} pending`} />
        <StatCard label="Registered Patients" value={data.summary.totalPatients} />
        <StatCard label="Receptionists"       value={data.summary.totalReceptionists} />
        <StatCard label="Total Appointments"  value={data.summary.totalAppts} />
        <StatCard label="Appts This Month"    value={data.summary.apptThisMonth} />
        <StatCard label="Pending Hospitals"   value={data.summary.pendingHospitals} accent={data.summary.pendingHospitals > 0 ? "border-amber-200" : ""} />
        <StatCard label="Pending Therapists"  value={data.summary.pendingTherapists} accent={data.summary.pendingTherapists > 0 ? "border-amber-200" : ""} />
      </div>

      <SectionTitle>Trends</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart data={data.monthlyAppointments} title="Appointments — Last 6 Months" />
        <DualBarChart data={data.monthlyRegistrations} title="New Registrations — Last 6 Months" />
        <DonutChart data={data.byStatus} title="Appointments by Status" />
        {data.hospitalsWithTherapists?.length > 0 && (
          <HBarChart
            data={data.hospitalsWithTherapists.map((h: any) => ({ label: h.name, count: h.therapists }))}
            title="Therapists per Hospital"
          />
        )}
      </div>
    </div>
  );
}

function PatientReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Your Health Journey</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments"   value={data.summary.totalAppointments} />
        <StatCard label="Completed Sessions"   value={data.summary.completedSessions} />
        <StatCard label="Upcoming"             value={data.summary.upcomingCount} sub="confirmed" />
        <StatCard label="Therapists Consulted" value={data.summary.therapistsConsulted} />
        <StatCard label="Cancelled"            value={data.summary.cancelledSessions} />
        <StatCard label="Attendance Rate"      value={`${data.summary.attendanceRate}%`} sub="completed / booked" />
        <StatCard label="Assessments"          value={data.summary.assessmentsCount} />
        <StatCard label="Treatment Plan"       value={data.summary.hasTreatmentPlan ? "Active" : "None"} />
      </div>

      {data.upcomingAppointments?.length > 0 && (
        <>
          <SectionTitle>Upcoming Appointments</SectionTitle>
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-50">
              {data.upcomingAppointments.map((a: any) => (
                <div key={a._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="font-medium text-gray-900">{a.therapistName}</p>
                    <p className="text-xs text-gray-500">{a.hospitalName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{fmtDate(a.start)}</p>
                    <p className="text-xs text-gray-500">{fmtTime(a.start)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PILL_COLORS[a.mode] || "bg-gray-100 text-gray-600"}`}>
                    {a.mode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <SectionTitle>Trends & Breakdown</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart data={data.monthly} title="Appointments — Last 6 Months" />
        <DonutChart data={data.byStatus} title="By Status" />
        <DonutChart data={data.byMode}   title="By Mode" />
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3">Attendance Rate</p>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full">
                <circle r="15.9155" cx="18" cy="18" fill="transparent" stroke="#e5e7eb" strokeWidth="3.5" />
                <circle r="15.9155" cx="18" cy="18" fill="transparent"
                  stroke="#10b981" strokeWidth="3.5"
                  strokeDasharray={`${data.summary.attendanceRate} ${100 - data.summary.attendanceRate}`}
                  strokeDashoffset="25"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                {data.summary.attendanceRate}%
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Completed: <strong>{data.summary.completedSessions}</strong></p>
              <p>Cancelled: <strong>{data.summary.cancelledSessions}</strong></p>
              <p>Total: <strong>{data.summary.totalAppointments}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceptionistReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Booking Activity</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings Created" value={data.summary.totalCreated} />
        <StatCard label="This Month"              value={data.summary.createdThisMonth} />
        <StatCard label="Today"                   value={data.summary.createdToday} />
        <StatCard label="Upcoming (Confirmed)"    value={data.summary.upcomingCreated} />
        <StatCard label="Confirmed"               value={data.summary.confirmedCount} />
        <StatCard label="Completed"               value={data.summary.completedCount} />
        <StatCard label="Cancelled"               value={data.summary.cancelledCount} />
      </div>

      <SectionTitle>Trends & Breakdown</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart data={data.monthly} title="Bookings Created — Last 6 Months" />
        <DonutChart data={data.byStatus} title="Bookings by Status" />
        <DonutChart data={data.byMode}   title="Bookings by Mode" />
      </div>
    </div>
  );
}

// ── page shell ────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  hospitalAdmin: "Hospital Admin",
  therapist:     "Therapist",
  supervisor:    "Supervisor",
  superAdmin:    "Super Admin",
  patient:       "Patient",
  receptionist:  "Receptionist",
};

export default function ReportsPage() {
  return <Protected><ReportsInner /></Protected>;
}

function ReportsInner() {
  const { token, user } = useAuth();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api("api/reports", { headers: authHeader(token) as HeadersInit })
      .then(setData)
      .catch((e: any) => setErr(e.message || "Failed to load report."))
      .finally(() => setLoading(false));
  }, [token]);

  const roleLabel = ROLE_LABELS[user?.role || ""] || user?.role || "";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">

        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
              {roleLabel}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Data as of {new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors print:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        ) : data ? (
          <>
            {data.role === "hospitalAdmin" && <HospitalAdminReport data={data} />}
            {data.role === "therapist"     && <TherapistReport     data={data} />}
            {data.role === "supervisor"    && <SupervisorReport    data={data} />}
            {data.role === "superAdmin"    && <SuperAdminReport    data={data} />}
            {data.role === "patient"       && <PatientReport       data={data} />}
            {data.role === "receptionist"  && <ReceptionistReport  data={data} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
