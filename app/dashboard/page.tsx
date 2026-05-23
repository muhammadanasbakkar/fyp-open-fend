"use client";

import Protected from "@/components/Protected";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SpecialtiesModal from "./SpecialtiesModal";
import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, authHeader } from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function greeting(name?: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${time}${name ? `, ${name.split(" ")[0]}` : ""}`;
}

function today() {
  return new Date().toLocaleDateString("en-PK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function safeGet(obj: any, path: string) {
  return path.split(".").reduce((a, k) => (a ? a[k] : undefined), obj);
}

function getKarachiISODate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

// ─── stat skeleton ───────────────────────────────────────────────────────────

function StatSkeleton() {
  return <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />;
}

// ─── shared ui atoms ─────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, color,
}: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title, desc, href, icon, accent = "#4b7eff", badge,
}: { title: string; desc: string; href: string; icon: React.ReactNode; accent?: string; badge?: string }) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderTopColor: `${accent}33`, borderTopWidth: 3 }}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>
          {badge}
        </span>
      )}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}15` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{desc}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold group-hover:translate-x-0.5 transition-transform" style={{ color: accent }}>
        Open →
      </span>
    </Link>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">{children}</h2>
  );
}

// ─── SVG icon set ────────────────────────────────────────────────────────────

const Icons = {
  calendar: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  clock: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  notes: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  building: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  search: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  star: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  pending: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  plus: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  list: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  chart: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
};

// ─── role config ─────────────────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  patient: { label: "Patient", color: "#4b7eff", bg: "from-[#4b7eff] to-[#6aa7ff]" },
  therapist: { label: "Therapist", color: "#7c3aed", bg: "from-[#7c3aed] to-[#9d6cff]" },
  receptionist: { label: "Receptionist", color: "#0f766e", bg: "from-[#0f766e] to-[#0d9488]" },
  superAdmin: { label: "Super Admin", color: "#dc2626", bg: "from-[#dc2626] to-[#f97316]" },
  admin: { label: "Admin", color: "#d97706", bg: "from-[#d97706] to-[#f59e0b]" },
};

// ─── appointment fetcher hook ─────────────────────────────────────────────────

type ApptStats = {
  upcoming: number;
  total: number;
  completed: number;
  pending: number;
  nextSession: any | null;
  // Future-scheduled appointments awaiting therapist confirmation. Patients
  // need this surfaced because a "pending" booking still needs to be approved
  // before they should rely on it.
  pendingList: any[];
  // Therapist dashboard extras — also useful for any role looking at their
  // appointment feed:
  todayList: any[];        // non-cancelled appts whose `start` falls today
  weekCount: number;       // non-cancelled appts in this calendar week
  activePatients: number;  // distinct patients with activity in [-30d, +60d]
};

function useAppointmentStats(token: string | null) {
  const [stats, setStats] = useState<ApptStats | null>(null);
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api("api/appointments/my", {
          headers: authHeader(token) as HeadersInit,
        });
        const list: any[] = Array.isArray(data) ? data : data?.appointments || [];
        const now = Date.now();

        // Upcoming = scheduled in the future and not cancelled.
        // A cancelled appointment is not "upcoming" even if its date hasn't passed.
        const upcomingAppts = list
          .filter((a: any) => {
            const start = +new Date(a.start || a.date);
            return start > now && a.status !== "cancelled";
          })
          .sort((a: any, b: any) => +new Date(a.start || a.date) - +new Date(b.start || b.date));

        // Completed = any past, non-cancelled appointment. Therapists rarely
        // flip "confirmed" → "completed" after a session, and past "pending"
        // rows still represent a date that's now in the past — treating them
        // as completed makes the three KPIs reconcile (upcoming + completed
        // = total) and matches what the patient sees in their history.
        const completed = list.filter((a: any) => {
          const start = +new Date(a.start || a.date);
          return start <= now && a.status !== "cancelled";
        }).length;

        // Pending = the therapist hasn't confirmed yet. We only surface
        // future-dated pending appointments to the patient (a past-dated
        // pending row almost certainly means the booking was never acted on
        // and isn't actionable anymore).
        const pendingList = list
          .filter((a: any) => {
            const start = +new Date(a.start || a.date);
            return a.status === "pending" && start > now;
          })
          .sort((a: any, b: any) => +new Date(a.start || a.date) - +new Date(b.start || b.date));
        const pending = pendingList.length;

        // Total excludes cancelled sessions so the three KPI numbers reconcile.
        const total = list.filter((a: any) => a.status !== "cancelled").length;

        // Today's schedule: non-cancelled appointments whose `start` falls
        // anywhere in today's calendar day (local timezone).
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const todayList = list
          .filter((a: any) => {
            if (a.status === "cancelled") return false;
            const s = +new Date(a.start || a.date);
            return s >= +startOfToday && s < +startOfTomorrow;
          })
          .sort((a: any, b: any) => +new Date(a.start || a.date) - +new Date(b.start || b.date));

        // This calendar week (Mon–Sun). We treat Monday as the week start
        // since that's what most clinics expect.
        const startOfWeek = new Date(startOfToday);
        const day = startOfWeek.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const daysFromMonday = (day + 6) % 7; // distance back to Monday
        startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
        const startOfNextWeek = new Date(startOfWeek);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
        const weekCount = list.filter((a: any) => {
          if (a.status === "cancelled") return false;
          const s = +new Date(a.start || a.date);
          return s >= +startOfWeek && s < +startOfNextWeek;
        }).length;

        // Active patients: distinct patient ids on any non-cancelled
        // appointment in the rolling window [−30 days, +60 days].
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        const sixtyDaysAhead = now + 60 * 24 * 60 * 60 * 1000;
        const activeIds = new Set<string>();
        for (const a of list) {
          if (a.status === "cancelled") continue;
          const s = +new Date(a.start || a.date);
          if (s < thirtyDaysAgo || s > sixtyDaysAhead) continue;
          const pid =
            typeof a.patient === "object" ? a.patient?._id : a.patient;
          if (pid) activeIds.add(String(pid));
        }

        setStats({
          upcoming: upcomingAppts.length,
          total,
          completed,
          pending,
          nextSession: upcomingAppts[0] || null,
          pendingList,
          todayList,
          weekCount,
          activePatients: activeIds.size,
        });
      } catch { /* silent */ }
    })();
  }, [token]);
  return stats;
}

function usePendingCount(token: string | null, role: string | undefined) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!token || role !== "superAdmin") return;
    (async () => {
      try {
        const data = await api("api/therapists/pending", {
          headers: authHeader(token) as HeadersInit,
        });
        const list = Array.isArray(data) ? data : data?.users || data?.pending || [];
        setCount(list.length);
      } catch { /* silent */ }
    })();
  }, [token, role]);
  return count;
}

// ─── hero banner ─────────────────────────────────────────────────────────────

function HeroBanner({
  user, roleMeta,
}: { user: any; roleMeta: { label: string; color: string; bg: string } }) {
  const initials = (user?.name || roleMeta.label).slice(0, 2).toUpperCase();
  return (
    <div className={`rounded-2xl bg-gradient-to-r ${roleMeta.bg} p-6 text-white shadow-sm`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold backdrop-blur-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">{today()}</p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">
              {greeting(user?.name)}!
            </h1>
            <p className="mt-0.5 text-sm text-white/70">
              Signed in as <span className="font-semibold text-white">{roleMeta.label}</span>
              {user?.email ? ` · ${user.email}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            {roleMeta.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── patient dashboard ────────────────────────────────────────────────────────

function PatientDashboard({ user, token }: { user: any; token: string | null }) {
  const apptStats = useAppointmentStats(token);
  const meta = ROLE_META.patient;
  const next = apptStats?.nextSession;
  const therapistName =
    typeof next?.therapist === "object" ? next?.therapist?.name : next?.therapist;
  const fmt = (d: any) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div className="space-y-8">
      <HeroBanner user={user} roleMeta={meta} />

      {/* Next session highlight — only when one exists. Otherwise show an
          empty-state CTA encouraging a booking. */}
      {apptStats === null ? (
        <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
      ) : next ? (
        <div className="overflow-hidden rounded-2xl border border-[#0f766e]/20 bg-gradient-to-br from-[#0f766e]/5 via-white to-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f766e]/10 text-[#0f766e]">
                {Icons.calendar}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0f766e]">
                  Your next session
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">
                  {fmt(next.start || next.date)}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-600">
                  with <span className="font-medium text-gray-800">{therapistName || "—"}</span>
                  {next.mode ? (
                    <span className="ml-1 inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      {next.mode === "online" ? "Online" : "In person"}
                    </span>
                  ) : null}
                  {next.status ? (
                    <span
                      className={`ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        next.status === "confirmed"
                          ? "bg-green-50 text-green-700"
                          : next.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {next.status}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {next.mode === "online" && next.meetingLink ? (
                <a
                  href={next.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
                >
                  Join video session
                </a>
              ) : null}
              <Link
                href="/appointments/my"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#4b7eff]/20 bg-gradient-to-br from-[#4b7eff]/5 to-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                No upcoming sessions yet
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Browse our therapists and book your first session in minutes.
              </p>
            </div>
            <Link
              href="/appointments/book"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition-all"
            >
              {Icons.plus}
              Book your first session
            </Link>
          </div>
        </div>
      )}

      {/* Pending confirmations — sessions the therapist hasn't approved yet.
          Surfaced separately from "Upcoming" so the patient knows these
          aren't guaranteed yet. */}
      {apptStats?.pendingList?.length ? (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-100/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200/70 text-amber-700">
                {Icons.pending}
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Awaiting therapist confirmation
                </p>
                <p className="text-[11px] text-amber-700">
                  {apptStats.pendingList.length} session
                  {apptStats.pendingList.length === 1 ? "" : "s"} pending approval
                </p>
              </div>
            </div>
            <Link
              href="/appointments/my"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-amber-100">
            {apptStats.pendingList.slice(0, 4).map((a: any) => {
              const tName =
                typeof a.therapist === "object"
                  ? a.therapist?.name || "Therapist"
                  : a.therapist || "Therapist";
              return (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      with {tName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {new Date(a.start || a.date).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {a.mode ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                          {a.mode === "online" ? "Online" : "In person"}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Stats — three real numeric metrics, no navigation tiles. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {apptStats === null ? (
          [1, 2, 3].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Upcoming"
              value={apptStats.upcoming}
              sub="sessions booked"
              icon={Icons.calendar}
              color={meta.color}
            />
            <StatCard
              label="Completed"
              value={apptStats.completed}
              sub="past sessions"
              icon={Icons.chart}
              color="#0f766e"
            />
            <StatCard
              label="Total"
              value={apptStats.total}
              sub="all time"
              icon={Icons.list}
              color="#4b7eff"
            />
          </>
        )}
      </div>

      {/* Quick actions — trimmed to four daily destinations. */}
      <div>
        <SectionHeader>Quick actions</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            title="Book a session"
            desc="Find an available therapist and secure a slot in minutes."
            href="/appointments/book"
            icon={Icons.plus}
            accent={meta.color}
          />
          <ActionCard
            title="My appointments"
            desc="View upcoming and past sessions, cancel or reschedule."
            href="/appointments/my"
            icon={Icons.calendar}
            accent="#0f766e"
          />
          <ActionCard
            title="Resources"
            desc="Guides, FAQs, and articles to help you on your journey."
            href="/resources"
            icon={Icons.list}
            accent="#7c3aed"
          />
          <ActionCard
            title="Account settings"
            desc="Update your contact info, emergency contact, and profile."
            href="/settings/profile"
            icon={Icons.settings}
            accent="#64748b"
          />
        </div>
      </div>
    </div>
  );
}

// ─── therapist dashboard ──────────────────────────────────────────────────────

function TherapistDashboard({
  user, token, onOpenSpecialties,
}: { user: any; token: string | null; onOpenSpecialties: () => void }) {
  const apptStats = useAppointmentStats(token);
  const meta = ROLE_META.therapist;
  const specialtiesCompleted = !!safeGet(user, "therapistInfo.specialtiesCompleted");

  // Show the "Complete your specialties" banner at most once every 3 months
  // per user. We stamp localStorage on first display, then suppress further
  // shows until the timestamp is older than ~3 months. A manual close on the
  // banner hides it for the rest of the session but does not reset the timer.
  const [showSpecialtiesBanner, setShowSpecialtiesBanner] = useState(false);
  useEffect(() => {
    if (specialtiesCompleted) return;
    if (typeof window === "undefined") return;
    const userId = user?._id || user?.id;
    if (!userId) return;
    const key = `specialties-banner-shown:${userId}`;
    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    const lastShown = Number(localStorage.getItem(key) || 0);
    if (Date.now() - lastShown > THREE_MONTHS_MS) {
      setShowSpecialtiesBanner(true);
      localStorage.setItem(key, String(Date.now()));
    }
  }, [specialtiesCompleted, user]);

  return (
    <div className="space-y-8">
      <HeroBanner user={user} roleMeta={meta} />

      {!specialtiesCompleted && showSpecialtiesBanner && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            {Icons.pending}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">Complete your specialties profile</h3>
            <p className="mt-1 text-xs text-amber-700">
              Patients search by specialization. Adding your modalities, concerns, and populations helps you appear in the right searches.
            </p>
          </div>
          <button
            onClick={onOpenSpecialties}
            className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Complete now
          </button>
          <button
            type="button"
            onClick={() => setShowSpecialtiesBanner(false)}
            className="shrink-0 rounded-lg p-1 text-amber-600 hover:bg-amber-100"
            aria-label="Dismiss"
            title="Dismiss for now"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* KPI row — four numbers a therapist checks at a glance. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {apptStats === null ? (
          [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Today"
              value={apptStats.todayList.length}
              sub={apptStats.todayList.length === 1 ? "session today" : "sessions today"}
              icon={Icons.calendar}
              color={meta.color}
            />
            <StatCard
              label="This week"
              value={apptStats.weekCount}
              sub="Mon – Sun"
              icon={Icons.chart}
              color="#0f766e"
            />
            <StatCard
              label="Active patients"
              value={apptStats.activePatients}
              sub="last 30 / next 60 days"
              icon={Icons.users}
              color="#7c3aed"
            />
            <StatCard
              label="Total sessions"
              value={apptStats.total}
              sub="all time"
              icon={Icons.list}
              color="#4b7eff"
            />
          </>
        )}
      </div>

      {/* Pending confirmations — bookings the therapist needs to approve. */}
      {apptStats?.pendingList?.length ? (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-100/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200/70 text-amber-700">
                {Icons.pending}
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Pending your approval
                </p>
                <p className="text-[11px] text-amber-700">
                  {apptStats.pendingList.length} booking
                  {apptStats.pendingList.length === 1 ? "" : "s"} awaiting confirmation
                </p>
              </div>
            </div>
            <Link
              href="/appointments/my"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Review all
            </Link>
          </div>
          <ul className="divide-y divide-amber-100">
            {apptStats.pendingList.slice(0, 5).map((a: any) => {
              const pName =
                typeof a.patient === "object"
                  ? a.patient?.name || "Patient"
                  : a.patient || "Patient";
              const ptId =
                typeof a.patient === "object" ? a.patient?.patientId : null;
              return (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {pName}
                      {ptId ? (
                        <span className="ml-2 font-mono text-[10px] text-gray-400">
                          {ptId}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {new Date(a.start || a.date).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {a.mode ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                          {a.mode === "online" ? "Online" : "In person"}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Today's schedule — concrete next-action list for the rest of the day. */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
              {Icons.calendar}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Today&apos;s schedule</p>
              <p className="text-[11px] text-gray-500">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "2-digit",
                })}
              </p>
            </div>
          </div>
          <Link
            href="/appointments/my"
            className="text-xs font-semibold text-[#4b7eff] hover:underline"
          >
            Full calendar
          </Link>
        </div>
        {apptStats === null ? (
          <div className="space-y-2 p-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : apptStats.todayList.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">No sessions scheduled today</p>
            <p className="mt-0.5 text-xs text-gray-500">Enjoy the breather, or set new availability.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {apptStats.todayList.map((a: any) => {
              const pName =
                typeof a.patient === "object"
                  ? a.patient?.name || "Patient"
                  : a.patient || "Patient";
              const start = new Date(a.start || a.date);
              const end = a.end ? new Date(a.end) : null;
              const isPast = +start < Date.now();
              return (
                <li key={a._id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="flex w-16 shrink-0 flex-col rounded-lg bg-gray-50 px-2 py-1.5 text-center">
                    <span className="text-xs font-bold text-gray-900">
                      {start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {end && (
                      <span className="text-[10px] text-gray-500">
                        → {end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{pName}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      {a.mode ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-700">
                          {a.mode === "online" ? "Online" : "In person"}
                        </span>
                      ) : null}
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium",
                          a.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700"
                            : a.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600",
                        ].join(" ")}
                      >
                        {a.status}
                      </span>
                      {isPast && (
                        <span className="text-[10px] text-gray-400">past</span>
                      )}
                    </div>
                  </div>
                  {a.mode === "online" && a.meetingLink ? (
                    <a
                      href={a.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg bg-[#0f766e] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:brightness-110"
                    >
                      Join
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick actions — trimmed to the four daily-use destinations. */}
      <div>
        <SectionHeader>Quick actions</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            title="My appointments"
            desc="View today's schedule and upcoming patient sessions."
            href="/appointments/my"
            icon={Icons.calendar}
            accent="#4b7eff"
          />
          <ActionCard
            title="Patient records"
            desc="Write session notes and review patient history."
            href="/patient-records"
            icon={Icons.notes}
            accent="#d97706"
          />
          <ActionCard
            title="Manage availability"
            desc="Define your working hours and open appointment slots."
            href="/availability"
            icon={Icons.clock}
            accent={meta.color}
          />
          <button
            type="button"
            onClick={onOpenSpecialties}
            className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md text-left"
            style={{ borderTopColor: "#f59e0b33", borderTopWidth: 3 }}
          >
            {!specialtiesCompleted && (
              <span className="absolute right-4 top-4 rounded-full bg-[#f59e0b] px-2 py-0.5 text-[10px] font-bold text-white">!</span>
            )}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              {Icons.star}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Specialties & modalities</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Update the specialties that help patients find you.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:translate-x-0.5 transition-transform">
              Open →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── receptionist dashboard ───────────────────────────────────────────────────

function ReceptionistDashboard({ user, token }: { user: any; token: string | null }) {
  const apptStats = useAppointmentStats(token);
  const meta = ROLE_META.receptionist;
  return (
    <div className="space-y-8">
      <HeroBanner user={user} roleMeta={meta} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {apptStats === null ? (
          [1, 2, 3, 4].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Upcoming" value={apptStats.upcoming} sub="appointments" icon={Icons.calendar} color={meta.color} />
            <StatCard label="Total booked" value={apptStats.total} sub="all time" icon={Icons.chart} color="#4b7eff" />
            <StatCard label="Therapists" value="Available" sub="book on behalf" icon={Icons.users} color="#7c3aed" />
            <StatCard label="Walk-ins" value="Manage" sub="quick booking" icon={Icons.plus} color="#d97706" />
          </>
        )}
      </div>

      {/* Primary CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0f766e] to-[#0d9488] p-6  shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ">
          <div>
            <h2 className="text-lg font-bold text-white">Book an appointment for a patient</h2>
            <p className="mt-1 text-sm text-white/80">
              Select a therapist and choose an available slot for a walk-in or registered patient.
            </p>
          </div>
          <Link
            href="/receptionist/book"
            className=" inline-flex shrink-0 items-center gap-2 rounded-xl bg-white  px-5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-white/90 transition-colors"
          >
            {Icons.plus}
            Book now
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <SectionHeader>Quick actions</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Book on behalf"
            desc="Find available therapists and book for a walk-in patient."
            href="/receptionist/book"
            icon={Icons.plus}
            accent={meta.color}
          />
          <ActionCard
            title="All appointments"
            desc="View and manage the day's schedule."
            href="/appointments/my"
            icon={Icons.calendar}
            accent="#4b7eff"
          />
          <ActionCard
            title="Therapist availability"
            desc="Check which therapists have open slots today."
            href="/availability"
            icon={Icons.clock}
            accent="#7c3aed"
          />
          <ActionCard
            title="Patient records"
            desc="Access session notes and patient history."
            href="/patient-records"
            icon={Icons.notes}
            accent="#d97706"
          />
          <ActionCard
            title="Browse therapists"
            desc="See therapist profiles and specializations."
            href="/appointments/book"
            icon={Icons.search}
            accent="#64748b"
          />
          <ActionCard
            title="Account settings"
            desc="Update your reception account profile."
            href="/settings/profile"
            icon={Icons.settings}
            accent="#64748b"
          />
        </div>
      </div>
    </div>
  );
}

// ─── superAdmin dashboard ─────────────────────────────────────────────────────

function SuperAdminDashboard({ user, token }: { user: any; token: string | null }) {
  const apptStats = useAppointmentStats(token);
  const pendingCount = usePendingCount(token, user?.role);
  const meta = ROLE_META.superAdmin;
  return (
    <div className="space-y-8">
      <HeroBanner user={user} roleMeta={meta} />

      {/* Urgent: pending approvals — only renders when there's something to action */}
      {pendingCount !== null && pendingCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-rose-50 to-white p-5 shadow-sm">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-200/30 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                {Icons.pending}
              </div>
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-red-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  Action required
                </p>
                <h3 className="mt-1 text-base font-bold text-red-900 sm:text-lg">
                  {pendingCount} pending approval{pendingCount > 1 ? "s" : ""}
                </h3>
                <p className="mt-1 max-w-md text-xs text-red-700">
                  Therapist or receptionist accounts are waiting for your review.
                </p>
              </div>
            </div>
            <Link
              href="/admin/pending-users"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-700 active:scale-[0.98] transition-all"
            >
              Review now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Stats — four real numeric KPIs (no navigation tiles). */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending approvals"
          value={pendingCount === null ? "—" : pendingCount}
          sub="awaiting review"
          icon={Icons.pending}
          color="#dc2626"
        />
        {apptStats === null ? (
          [1, 2, 3].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Upcoming appts"
              value={apptStats.upcoming}
              sub="across all clinics"
              icon={Icons.calendar}
              color={meta.color}
            />
            <StatCard
              label="Pending bookings"
              value={apptStats.pending}
              sub="awaiting therapist confirm"
              icon={Icons.clock}
              color="#d97706"
            />
            <StatCard
              label="Completed sessions"
              value={apptStats.completed}
              sub="all time"
              icon={Icons.chart}
              color="#0f766e"
            />
          </>
        )}
      </div>

      {/* Administration — four daily-use destinations. */}
      <div>
        <SectionHeader>Administration</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            title="Pending users"
            desc="Approve or reject therapist and receptionist accounts."
            href="/admin/pending-users"
            icon={Icons.check}
            accent="#dc2626"
            badge={pendingCount !== null && pendingCount > 0 ? String(pendingCount) : undefined}
          />
          <ActionCard
            title="Manage hospitals"
            desc="Add, edit, or remove clinic and hospital records."
            href="/admin/hospitals"
            icon={Icons.building}
            accent="#d97706"
          />
          <ActionCard
            title="All appointments"
            desc="View bookings across every therapist and clinic."
            href="/appointments/my"
            icon={Icons.calendar}
            accent="#4b7eff"
          />
          <ActionCard
            title="Reports & analytics"
            desc="Platform-wide trends, registrations, and breakdowns."
            href="/reports"
            icon={Icons.chart}
            accent="#0f766e"
          />
        </div>
      </div>

      {/* Hospitals overview — list every hospital and its therapists. */}
      <HospitalsOverview token={token} />

      {/* Supervisors overview — list every supervisor and the therapists they oversee. */}
      <SupervisorsOverview token={token} />

      {/* Secondary destinations — smaller row for less-frequent navigation. */}
      <div>
        <SectionHeader>Other</SectionHeader>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Therapist directory",
              desc: "Browse approved therapist profiles.",
              href: "/appointments/book",
              icon: Icons.users,
              accent: "#7c3aed",
            },
            {
              title: "Patient records",
              desc: "Oversee session notes & sharing.",
              href: "/patient-records",
              icon: Icons.notes,
              accent: "#0f766e",
            },
            {
              title: "Resources",
              desc: "Help articles & platform docs.",
              href: "/resources",
              icon: Icons.list,
              accent: "#64748b",
            },
            {
              title: "Account settings",
              desc: "Profile & sign-in security.",
              href: "/settings/profile",
              icon: Icons.settings,
              accent: "#64748b",
            },
          ].map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="group flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#4b7eff]/30 hover:shadow-md"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${a.accent}15`, color: a.accent }}
              >
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-gray-500">{a.desc}</p>
              </div>
              <svg
                className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#4b7eff]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── hospitals overview (used by SuperAdmin dashboard) ───────────────────────

type AdminHospital = {
  _id: string;
  name: string;
  city?: string;
  address?: string;
  type?: string;
  status?: "pending" | "approved" | "rejected";
  isActive?: boolean;
  therapistsCount: number;
  approvedCount: number;
  pendingCount: number;
  therapists: {
    _id: string;
    name: string | null;
    email: string | null;
    profilePicture: string | null;
    isApproved: boolean;
    specializations: string[];
    yearsExperience: number | null;
    fees: { currency?: string; online?: number; inPerson?: number } | null;
    isPrimary: boolean;
  }[];
};

const HOSPITAL_CDN = (
  process.env.NEXT_PUBLIC_CDN_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/+$/, "");

function hospitalAvatarSrc(profilePicture: string | null | undefined): string | null {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
    return profilePicture;
  }
  return `${HOSPITAL_CDN}/${profilePicture.replace(/^\/+/, "")}`;
}

function HospitalsOverview({ token }: { token: string | null }) {
  const [hospitals, setHospitals] = useState<AdminHospital[] | null>(null);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    setErr("");
    api("api/admin/hospitals/with-therapists", {
      headers: authHeader(token) as HeadersInit,
    })
      .then((d: any) => setHospitals(Array.isArray(d) ? d : []))
      .catch((e: any) => {
        setErr(e?.message || "Failed to load hospitals.");
        setHospitals([]);
      });
  }, [token]);

  const filtered = (hospitals || []).filter((h) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.therapists.some((t) => t.name?.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader>Hospitals overview</SectionHeader>
        <div className="relative w-full sm:w-64">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital, city, therapist"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
          />
        </div>
      </div>

      {err && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {hospitals === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-white"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {hospitals.length === 0
              ? "No hospitals registered yet."
              : "No hospitals match your search."}
          </div>
        ) : (
          filtered.map((h) => {
            const open = expanded === h._id;
            return (
              <section
                key={h._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : h._id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4b7eff]/15 to-[#7c3aed]/15 text-lg">
                      🏥
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="truncate">{h.name}</span>
                        {h.status && (
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1",
                              h.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : h.status === "pending"
                                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                                  : "bg-red-50 text-red-700 ring-red-200",
                            ].join(" ")}
                          >
                            {h.status}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {[h.city, h.address].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4b7eff]/10 px-2 py-0.5 text-[11px] font-bold text-[#4b7eff]">
                      {h.therapistsCount} therapist
                      {h.therapistsCount === 1 ? "" : "s"}
                    </span>
                    {h.pendingCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                        {h.pendingCount} pending
                      </span>
                    )}
                    <svg
                      className={[
                        "h-4 w-4 text-gray-400 transition-transform",
                        open ? "rotate-180" : "",
                      ].join(" ")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 sm:px-5">
                    {h.therapists.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-500">
                        No therapists are affiliated with this hospital yet.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {h.therapists.map((t) => {
                          const src = hospitalAvatarSrc(t.profilePicture);
                          const initials = (t.name || t.email || "T")
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase();
                          const minFee = (() => {
                            const cands = [t.fees?.online, t.fees?.inPerson].filter(
                              (v): v is number => typeof v === "number" && v > 0
                            );
                            return cands.length ? Math.min(...cands) : null;
                          })();
                          return (
                            <Link
                              key={t._id}
                              href={`/therapists/${t._id}`}
                              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-[#4b7eff]/30 hover:bg-white"
                            >
                              {src ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={src}
                                  alt={t.name || ""}
                                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-xs font-bold text-white ring-2 ring-white shadow">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-gray-900">
                                  <span className="truncate">{t.name || "—"}</span>
                                  {t.isPrimary && (
                                    <span className="rounded-full bg-[#4b7eff]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#4b7eff]">
                                      Primary
                                    </span>
                                  )}
                                  {!t.isApproved && (
                                    <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                                      Pending
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-[11px] text-gray-500">
                                  {t.email || "—"}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  {(t.specializations || []).slice(0, 2).map((s) => (
                                    <span
                                      key={s}
                                      className="inline-flex items-center rounded-full bg-[#4b7eff]/8 px-1.5 py-0.5 text-[9px] font-medium text-[#4b7eff]"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                  {(t.specializations || []).length > 2 && (
                                    <span className="text-[9px] text-gray-400">
                                      +{t.specializations.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                {minFee != null && (
                                  <>
                                    <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                                      From
                                    </p>
                                    <p className="text-xs font-bold text-gray-900">
                                      {t.fees?.currency || "PKR"} {minFee.toLocaleString()}
                                    </p>
                                  </>
                                )}
                                {t.yearsExperience != null && t.yearsExperience > 0 && (
                                  <p className="mt-0.5 text-[10px] text-gray-500">
                                    {t.yearsExperience} yr{t.yearsExperience === 1 ? "" : "s"}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── supervisors overview (used by SuperAdmin dashboard) ─────────────────────

type AdminSupervisor = {
  _id: string;
  name: string | null;
  email: string | null;
  profilePicture: string | null;
  specializations: string[];
  yearsExperience: number | null;
  licensingCouncil: string | null;
  therapistsCount: number;
  approvedCount: number;
  pendingCount: number;
  therapists: {
    _id: string;
    name: string | null;
    email: string | null;
    profilePicture: string | null;
    isApproved: boolean;
    specializations: string[];
    yearsExperience: number | null;
  }[];
};

function SupervisorsOverview({ token }: { token: string | null }) {
  const [supervisors, setSupervisors] = useState<AdminSupervisor[] | null>(null);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    setErr("");
    api("api/admin/supervisors/with-therapists", {
      headers: authHeader(token) as HeadersInit,
    })
      .then((d: any) => setSupervisors(Array.isArray(d) ? d : []))
      .catch((e: any) => {
        setErr(e?.message || "Failed to load supervisors.");
        setSupervisors([]);
      });
  }, [token]);

  const filtered = (supervisors || []).filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.therapists.some((t) => t.name?.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader>Supervisors overview</SectionHeader>
        <div className="relative w-full sm:w-64">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supervisor or therapist"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
          />
        </div>
      </div>

      {err && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {supervisors === null ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-white"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {supervisors.length === 0
              ? "No supervisors registered yet."
              : "No supervisors match your search."}
          </div>
        ) : (
          filtered.map((sup) => {
            const open = expanded === sup._id;
            const supSrc = hospitalAvatarSrc(sup.profilePicture);
            const supInitials = (sup.name || sup.email || "S")
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <section
                key={sup._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : sup._id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {supSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={supSrc}
                        alt={sup.name || ""}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-[#4b7eff] text-xs font-bold text-white ring-2 ring-white shadow">
                        {supInitials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="truncate">{sup.name || "—"}</span>
                        {sup.licensingCouncil && (
                          <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">
                            {sup.licensingCouncil}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {sup.email || "—"}
                        {sup.yearsExperience != null && sup.yearsExperience > 0 && (
                          <span className="ml-2 text-gray-400">
                            · {sup.yearsExperience} yr{sup.yearsExperience === 1 ? "" : "s"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                      {sup.therapistsCount} therapist
                      {sup.therapistsCount === 1 ? "" : "s"}
                    </span>
                    {sup.pendingCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                        {sup.pendingCount} pending
                      </span>
                    )}
                    <svg
                      className={[
                        "h-4 w-4 text-gray-400 transition-transform",
                        open ? "rotate-180" : "",
                      ].join(" ")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 sm:px-5">
                    {sup.therapists.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-500">
                        No therapists are assigned to this supervisor yet.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sup.therapists.map((t) => {
                          const tSrc = hospitalAvatarSrc(t.profilePicture);
                          const initials = (t.name || t.email || "T")
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase();
                          return (
                            <Link
                              key={t._id}
                              href={`/therapists/${t._id}`}
                              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-violet-300 hover:bg-white"
                            >
                              {tSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={tSrc}
                                  alt={t.name || ""}
                                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-xs font-bold text-white ring-2 ring-white shadow">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-gray-900">
                                  <span className="truncate">{t.name || "—"}</span>
                                  {!t.isApproved && (
                                    <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                                      Pending
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-[11px] text-gray-500">
                                  {t.email || "—"}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  {(t.specializations || []).slice(0, 2).map((s) => (
                                    <span
                                      key={s}
                                      className="inline-flex items-center rounded-full bg-[#4b7eff]/8 px-1.5 py-0.5 text-[9px] font-medium text-[#4b7eff]"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                  {(t.specializations || []).length > 2 && (
                                    <span className="text-[9px] text-gray-400">
                                      +{t.specializations.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {t.yearsExperience != null && t.yearsExperience > 0 && (
                                <div className="shrink-0 text-right text-[10px] text-gray-500">
                                  {t.yearsExperience} yr{t.yearsExperience === 1 ? "" : "s"}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── admin dashboard (fallback) ───────────────────────────────────────────────

function AdminDashboard({ user, token }: { user: any; token: string | null }) {
  const apptStats = useAppointmentStats(token);
  const meta = ROLE_META.admin;
  return (
    <div className="space-y-8">
      <HeroBanner user={user} roleMeta={meta} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {apptStats === null ? (
          [1, 2, 3].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Upcoming" value={apptStats.upcoming} sub="appointments" icon={Icons.calendar} color={meta.color} />
            <StatCard label="Total" value={apptStats.total} sub="all time" icon={Icons.chart} color="#4b7eff" />
            <StatCard label="Clinics" value="Manage" sub="hospitals" icon={Icons.building} color="#0f766e" />
          </>
        )}
      </div>
      <div>
        <SectionHeader>Quick actions</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard title="Appointments" desc="View and manage all appointments." href="/appointments/my" icon={Icons.calendar} accent={meta.color} />
          <ActionCard title="Hospitals" desc="Manage clinic and hospital records." href="/admin/hospitals" icon={Icons.building} accent="#0f766e" />
          <ActionCard title="Patient records" desc="Oversee patient session notes." href="/patient-records" icon={Icons.notes} accent="#7c3aed" />
          <ActionCard title="Settings" desc="Update your admin account." href="/settings/profile" icon={Icons.settings} accent="#64748b" />
        </div>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, token } = useAuth() as { user: any; token?: string };
  console.log("User on dashboard:", user);
  const role = user?.role;
  const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false);
  const modalDecisionMadeRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "hospitalAdmin") router.replace("/hospital/dashboard");
    if (user?.role === "supervisor") router.replace("/supervisor");
  }, [user, router]);

  const roleMeta = ROLE_META[user?.role] ?? ROLE_META.patient;

  // Specialties modal gating — show once every ~3 months per therapist.
  // Backend records `specialtiesModalLastShownOn` (YYYY-MM-DD) each time we
  // open the modal; we compare that against today to decide whether enough
  // time has passed. A localStorage stamp covers the case where the backend
  // POST hasn't yet been reflected in the user object (or quietly failed) —
  // we treat either source as authoritative for "shown" so the modal can't
  // re-appear before three months elapse.
  useEffect(() => {
    if (!user || !token || user?.role !== "therapist") return;
    if (modalDecisionMadeRef.current) return;

    const today = getKarachiISODate(); // "YYYY-MM-DD"
    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const lastShownOn: string | null =
      safeGet(user, "therapistInfo.specialtiesModalLastShownOn") ?? null;
    const userId = user?._id || user?.id || user?.email || "unknown";

    // Pick whichever record is newer: the server-side timestamp or a
    // localStorage stamp written when we last opened the modal in this
    // browser. `lastShownTs === 0` means we have no record from either
    // source — that's the only case where we show on first sight.
    let lastShownTs = lastShownOn ? Date.parse(lastShownOn) : 0;
    if (typeof window !== "undefined") {
      const localTs = Number(localStorage.getItem(`thera:specialtiesModal:lastShown:${userId}`) || 0);
      if (localTs > lastShownTs) lastShownTs = localTs;
    }

    // Session-storage guard: prevents re-showing on in-session navigation.
    const sessionKey = `thera:specialtiesModal:shown:${userId}:${today}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey) === "1") {
      modalDecisionMadeRef.current = true;
      return;
    }

    // Show only when we have NO record of ever showing it, OR the last show
    // was more than three months ago. This guarantees a hard cadence even if
    // the backend write to `specialtiesModalFirstShownAt` failed previously
    // (in which case `firstShownAt` stays null and the old `!firstShownAt`
    // check would have re-fired every reload).
    const shouldShow = lastShownTs === 0 || now - lastShownTs > THREE_MONTHS_MS;

    modalDecisionMadeRef.current = true;
    if (!shouldShow) return;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, "1");
      localStorage.setItem(`thera:specialtiesModal:lastShown:${userId}`, String(now));
    }
    setShowSpecialtiesModal(true);

    // Record in DB that modal was shown today. We still rely on this for
    // cross-device gating (a user on a different browser won't have our
    // localStorage stamp, only the server timestamp).
    fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/api/auth/therapist/specialties-modal-shown`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }).catch(() => { });
  }, [user, token]);

  const content = useMemo(() => {
    const role = user?.role;
    if (role === "patient") return <PatientDashboard user={user} token={token ?? null} />;
    if (role === "therapist") return <TherapistDashboard user={user} token={token ?? null} onOpenSpecialties={() => setShowSpecialtiesModal(true)} />;
    if (role === "receptionist") return <ReceptionistDashboard user={user} token={token ?? null} />;
    if (role === "superAdmin") return <SuperAdminDashboard user={user} token={token ?? null} />;
    return <AdminDashboard user={user} token={token ?? null} />;
  }, [user, token]);

  return (
    <Protected>
      <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          {content}
        </div>
      </div>

      {user?.role === "therapist" && (
        <SpecialtiesModal
          open={showSpecialtiesModal}
          onClose={() => setShowSpecialtiesModal(false)}
          token={token || ""}
        />
      )}
    </Protected>
  );
}
