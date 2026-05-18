"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";

// ── shared types ──────────────────────────────────────────────────────────────
type KV   = { label: string; count: number };
type Monthly = { label: string; count: number };

// Format a Date as a calendar-local YYYY-MM-DD string. We intentionally
// don't use toISOString() here: that converts to UTC, which shifts the
// date back a day for any timezone east of UTC (e.g. PKT → "Mar 1 local"
// becomes "Feb 28 UTC") and breaks the month-bucket math on the server.
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Date range filter for chart-driving reports (supervisor + therapist).
// Pure-controlled: parent owns `from` / `to` state and refetches when they
// change. The four presets cover the common windows; "Custom" reveals raw
// date inputs.
function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  function rangeForMonths(monthsBack: number) {
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
    return { from: localDateStr(fromDate), to: localDateStr(now) };
  }

  const presets: { label: string; months: number }[] = [
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "12M", months: 12 },
    { label: "24M", months: 24 },
  ];

  // Match the active preset by checking whether the current range equals
  // what each preset would produce. Falls back to "Custom" when nothing matches.
  const activePreset = presets.find(p => {
    const r = rangeForMonths(p.months);
    return r.from === from && r.to === to;
  });

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {presets.map(p => {
          const isActive = activePreset?.label === p.label;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(rangeForMonths(p.months))}
              className={[
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                isActive ? "bg-[#4b7eff] text-white" : "text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">From</label>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="bg-transparent text-xs text-gray-700 focus:outline-none"
        />
        <span className="text-gray-300">→</span>
        <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">To</label>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="bg-transparent text-xs text-gray-700 focus:outline-none"
        />
      </div>
    </div>
  );
}

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

// Stacked bar chart: shows SOAP-on-bottom + Session-on-top per month bucket.
// Used by the supervisor report so the user can see the SOAP vs Session
// composition of each month at a glance.
function StackedNotesChart({
  data,
  title,
}: {
  data: { label: string; soap: number; session: number; total: number }[];
  title: string;
}) {
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-1 text-sm font-semibold text-gray-800">{title}</p>
      <div className="mb-3 flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#4b7eff]" /> SOAP
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#7c3aed]" /> Session
        </span>
      </div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => {
          const soapPct = (d.soap / max) * 100;
          const sessionPct = (d.session / max) * 100;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">{d.total || ""}</span>
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-t-md"
                style={{ height: `${Math.max(((d.total) / max) * 100, d.total > 0 ? 4 : 0)}%` }}
                title={`${d.label} — SOAP ${d.soap}, Session ${d.session}`}
              >
                <div className="w-full bg-[#4b7eff]" style={{ height: `${(soapPct / (soapPct + sessionPct || 1)) * 100}%` }} />
                <div className="w-full bg-[#7c3aed]" style={{ height: `${(sessionPct / (soapPct + sessionPct || 1)) * 100}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.label}</span>
            </div>
          );
        })}
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
  const s = data.summary || {};
  const totalByMode = (data.byMode || []).reduce(
    (acc: number, x: KV) => acc + x.count,
    0
  ) || 0;
  const onlineCount = (data.byMode || []).find((x: KV) => x.label === "online")?.count || 0;
  const inPersonCount =
    (data.byMode || []).find((x: KV) => x.label === "in-person")?.count || 0;
  const onlinePct = totalByMode ? Math.round((onlineCount / totalByMode) * 100) : 0;
  const inPersonPct = totalByMode ? Math.round((inPersonCount / totalByMode) * 100) : 0;
  const dominantMode =
    onlineCount === 0 && inPersonCount === 0
      ? null
      : onlineCount >= inPersonCount
        ? { label: "Online", pct: onlinePct }
        : { label: "In-person", pct: inPersonPct };

  const peakMonth = (data.monthly || []).reduce(
    (best: Monthly | null, m: Monthly) => (!best || m.count > best.count ? m : best),
    null as Monthly | null
  );

  return (
    <div className="space-y-6">
      {/* Hospital hero strip */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-24 bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#7c3aed] sm:h-28">
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div aria-hidden className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Live data
          </span>
        </div>

        <div className="relative px-6 sm:px-8">
          <div className="-mt-12 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl ring-4 ring-white shadow-xl sm:-mt-14 sm:h-24 sm:w-24">
            🏥
          </div>
        </div>

        <div className="flex flex-col gap-2 px-6 pb-6 pt-3 sm:px-8 sm:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              {data.hospital?.name || "Your hospital"}
            </h2>
            {data.hospital?.type && (
              <span className="inline-flex items-center rounded-full bg-[#4b7eff]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4b7eff]">
                {data.hospital.type.replace(/-/g, " ")}
              </span>
            )}
          </div>
          {data.hospital?.city && (
            <p className="inline-flex items-center gap-1 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {data.hospital.city}
            </p>
          )}
        </div>
      </section>

      {/* Headline KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total appointments"
          value={s.totalAppointments ?? 0}
          sub="all time"
          color="#4b7eff"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
            </svg>
          }
        />
        <KpiCard
          label="This month"
          value={s.apptThisMonth ?? 0}
          sub={new Date().toLocaleString("en-PK", { month: "long", year: "numeric" })}
          color="#0f766e"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />
        <KpiCard
          label="Today"
          value={s.apptToday ?? 0}
          sub="confirmed + completed"
          color="#7c3aed"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Active therapists"
          value={s.therapistsCount ?? 0}
          sub="enrolled at this facility"
          color="#d97706"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
      </div>

      {/* Completion-rate hero card + mode split */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Completion rate
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle r="15.9155" cx="18" cy="18" fill="transparent" stroke="#e5e7eb" strokeWidth="3.5" />
                <circle
                  r="15.9155"
                  cx="18"
                  cy="18"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray={`${s.completionRate || 0} ${100 - (s.completionRate || 0)}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-emerald-900">
                {s.completionRate ?? 0}%
              </span>
            </div>
            <div className="text-xs text-gray-700">
              <p>
                <span className="font-bold text-gray-900">{s.completedCount ?? 0}</span>{" "}
                completed
              </p>
              <p className="mt-1">
                of{" "}
                <span className="font-bold text-gray-900">{s.totalAppointments ?? 0}</span>{" "}
                total
              </p>
              <p className="mt-2 text-[11px] text-gray-500">
                Healthy range is 70%+ for active clinics.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-900">Mode split</p>
            {dominantMode && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                {dominantMode.label} leads · {dominantMode.pct}%
              </span>
            )}
          </div>
          <ModeBar
            label="In-person"
            count={inPersonCount}
            pct={inPersonPct}
            color="#7c3aed"
          />
          <div className="mt-3" />
          <ModeBar
            label="Online"
            count={onlineCount}
            pct={onlinePct}
            color="#0ea5e9"
          />
          {!totalByMode && (
            <p className="mt-2 text-xs italic text-gray-400">
              No appointments recorded yet.
            </p>
          )}
        </div>
      </div>

      {/* Trend + status donut */}
      <SectionTitle>Trends & breakdown</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChart
            data={data.monthly}
            title={
              peakMonth?.count
                ? `Appointments — Last 6 months · peak ${peakMonth.label} (${peakMonth.count})`
                : "Appointments — Last 6 months"
            }
          />
        </div>
        <DonutChart data={data.byStatus} title="By status" />
      </div>

      {/* Top therapists */}
      {data.topTherapists?.length > 0 && (
        <>
          <SectionTitle>Top therapists</SectionTitle>
          <HBarChart
            data={data.topTherapists.map((t: any) => ({ label: t.name, count: t.count }))}
            title="Sessions per therapist"
          />
        </>
      )}
    </div>
  );
}

/* ── KPI card with icon tile ─────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </span>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-3xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-500">{sub}</p>}
    </div>
  );
}

/* ── horizontal mode bar (in-person vs online) ───────────── */
function ModeBar({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="text-gray-500">
          <span className="font-bold text-gray-900">{count}</span> · {pct}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
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
        <StatCard label="Upcoming"           value={data.summary.upcomingAppts} sub="scheduled" />
        <StatCard label="Patients Seen"      value={data.summary.totalPatients} />
        <StatCard label="Ongoing Patients"   value={data.summary.ongoingPatients} sub="active in last 60 days" />
        <StatCard label="SOAP Notes"         value={data.summary.soapNotes} />
        <StatCard label="Session Notes"      value={data.summary.sessionNotes} sub="session summaries" />
      </div>

      <SectionTitle>Trends & Breakdown</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChart data={data.monthlyAppointments} title="Appointments — Last 6 Months" />
        <BarChart data={data.monthlyNotes} title="Notes & Session Summaries — Last 6 Months" color="bg-[#7c3aed]" />
        <DonutChart data={data.byStatus} title="Appointments by Status" />
        <DonutChart data={data.byMode}   title="Appointments by Mode" />
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
        <StatCard label="Ongoing Patients"    value={data.summary.ongoingPatients} sub="active in last 60 days" />
        <StatCard label="Notes This Month"    value={data.summary.notesThisMonth} sub="SOAP + session" />
        <StatCard label="SOAP Notes"          value={data.summary.soapNotes} sub="all time" />
        <StatCard label="Session Notes"       value={data.summary.sessionNotes} sub="session summaries" />
      </div>

      <SectionTitle>Monthly Notes Trend</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <StackedNotesChart
          data={data.monthlyDetailed || []}
          title="Notes by Month — SOAP vs Session"
        />
        <DonutChart
          data={[
            { label: "SOAP Notes", count: data.summary.soapNotes || 0 },
            { label: "Session Notes", count: data.summary.sessionNotes || 0 },
          ]}
          title="Notes Composition — All Time"
        />
      </div>

      {(data.therapistStats || []).length > 0 && (
        <>
          <SectionTitle>Top Therapists by Note Volume</SectionTitle>
          <HBarChart
            data={[...(data.therapistStats || [])]
              .sort((a: any, b: any) => b.totalNotes - a.totalNotes)
              .slice(0, 8)
              .map((t: any) => ({ label: t.name || "—", count: t.totalNotes || 0 }))}
            title="Total notes per therapist (top 8)"
          />
        </>
      )}

      <SectionTitle>Therapist Performance</SectionTitle>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3 text-left">Therapist</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Specializations</th>
              <th className="px-4 py-3 text-center">SOAP Notes</th>
              <th className="px-4 py-3 text-center">Session Notes</th>
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
                <td className="px-4 py-3 text-center font-semibold text-gray-800">{t.soapNotes}</td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">{t.sessionNotes}</span>
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

// Default: last 6 calendar months, ending today. Uses local-calendar dates
// (see localDateStr above) so the server interprets them the same way the
// user sees them in the date pickers.
function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { from: localDateStr(fromDate), to: localDateStr(now) };
}

// Print-only document header. Rendered hidden on screen and shown in the
// printed output so the report has a proper title, role / user context, and
// the date range it was generated for.
function PrintHeader({
  roleLabel,
  user,
  range,
}: {
  roleLabel: string;
  user: any;
  range: { from: string; to: string };
}) {
  const fmtLong = (s: string) => {
    if (!s) return "—";
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  const generatedAt = new Date().toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="hidden print:block">
      <div className="border-b-2 border-gray-800 pb-3 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          {roleLabel} Report
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Therakonnect — Reports & Analytics
        </h1>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[11px] text-gray-700">
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-500">Prepared for</p>
            <p className="mt-0.5">{user?.name || "—"}</p>
            <p className="text-gray-500">{user?.email || ""}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-500">Reporting period</p>
            <p className="mt-0.5">{fmtLong(range.from)}</p>
            <p>to {fmtLong(range.to)}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-500">Generated</p>
            <p className="mt-0.5">{generatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsInner() {
  const { token, user } = useAuth();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");
  const [range, setRange]     = useState<{ from: string; to: string }>(defaultRange);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const qs = new URLSearchParams();
    if (range.from) qs.set("from", range.from);
    if (range.to) qs.set("to", range.to);
    const url = `api/reports${qs.toString() ? `?${qs.toString()}` : ""}`;
    api(url, { headers: authHeader(token) as HeadersInit })
      .then(setData)
      .catch((e: any) => setErr(e.message || "Failed to load report."))
      .finally(() => setLoading(false));
  }, [token, range.from, range.to]);

  const roleLabel = ROLE_LABELS[user?.role || ""] || user?.role || "";
  // Only the reports that actually use a monthly chart respond to filtering.
  const showFilter = data?.role === "supervisor" || data?.role === "therapist";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white print:bg-white">
      {/* Print-specific stylesheet:
          - Force Chrome/Edge to preserve background colors in chart bars and
            chips (otherwise everything renders as outlines).
          - Tighten margins so the report fits on standard A4/Letter.
          - Avoid splitting individual cards / charts / table rows across pages. */}
      <style jsx global>{`
        @media print {
          @page { margin: 12mm; }
          html, body { background: #ffffff !important; }
          .print\\:bg-white { background: #ffffff !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .rounded-2xl, .rounded-xl,
          table, tr,
          section, h1, h2 {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          h1, h2 { page-break-after: avoid; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6 print:px-0 print:py-0">
        <PrintHeader roleLabel={roleLabel} user={user} range={range} />

        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
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
          {showFilter && (
            <DateRangeFilter
              from={range.from}
              to={range.to}
              onChange={setRange}
            />
          )}
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
