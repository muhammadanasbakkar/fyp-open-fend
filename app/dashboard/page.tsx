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

function useAppointmentStats(token: string | null) {
  const [stats, setStats] = useState<{ upcoming: number; total: number } | null>(null);
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await api("api/appointments/my", {
          headers: authHeader(token) as HeadersInit,
        });
        const list: any[] = Array.isArray(data) ? data : data?.appointments || [];
        const now = new Date();
        const upcoming = list.filter((a: any) => new Date(a.start || a.date) > now).length;
        setStats({ upcoming, total: list.length });
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


  return (
    <div className="space-y-8">
      <HeroBanner user={user} roleMeta={meta} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {apptStats === null ? (
          [1, 2, 3, 4].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Upcoming" value={apptStats.upcoming} sub="sessions booked" icon={Icons.calendar} color={meta.color} />
            <StatCard label="Total sessions" value={apptStats.total} sub="all time" icon={Icons.chart} color="#0f766e" />
            <StatCard label="Therapists" value="Browse" sub="find the right fit" icon={Icons.search} color="#7c3aed" />
            <StatCard label="Records" value="View" sub="your session notes" icon={Icons.notes} color="#d97706" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <SectionHeader>Quick actions</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            title="Browse therapists"
            desc="Explore therapist profiles, specializations, and availability."
            href="/appointments/book"
            icon={Icons.search}
            accent="#7c3aed"
          />
          {meta.label === "Therapist" &&
            <>
              <ActionCard
                title="Patient records"
                desc="Access your session notes and treatment history."
                href="/patient-records"
                icon={Icons.notes}
                accent="#d97706"
              />
              <ActionCard
                title="Resources"
                desc="Guides, FAQs, and help articles for using TheraKonnect."
                href="/resources"
                icon={Icons.list}
                accent="#64748b"
              />
            </>
          }
          <ActionCard
            title="Account settings"
            desc="Update your contact info, preferences, and profile."
            href="/settings/profile"
            icon={Icons.settings}
            accent="#64748b"
          />
        </div>
      </div>

      {/* Info banner */}
      {/* <div className="rounded-2xl border border-[#4b7eff]/20 bg-[#4b7eff]/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4b7eff]/15 text-[#4b7eff]">
            {Icons.star}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Find the right therapist for you</h3>
            <p className="mt-1 text-xs text-gray-600 max-w-xl">
              TheraKonnect connects you with qualified therapists in Pakistan.
              Browse by specialization, book a slot, and start your journey toward better mental health.
            </p>
            <Link
              href="/appointments/book"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-105 transition-all"
            >
              Browse therapists →
            </Link>
          </div>
        </div>
      </div> */}
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

      {/* Stats — only genuine numeric stats. Navigation cards belong in
          Quick actions, not here. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {apptStats === null ? (
          [1, 2].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Upcoming"
              value={apptStats.upcoming}
              sub="sessions scheduled"
              icon={Icons.calendar}
              color={meta.color}
            />
            <StatCard
              label="Total sessions"
              value={apptStats.total}
              sub="all time"
              icon={Icons.chart}
              color="#4b7eff"
            />
          </>
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

      {pendingCount !== null && pendingCount > 0 && (
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            {Icons.pending}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900">
              {pendingCount} pending approval{pendingCount > 1 ? "s" : ""}
            </h3>
            <p className="mt-1 text-xs text-red-700">
              New therapist or receptionist accounts are waiting for your review and approval.
            </p>
          </div>
          <Link
            href="/admin/pending-users"
            className="shrink-0 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Review now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Pending approvals"
          value={pendingCount === null ? "—" : pendingCount}
          sub="awaiting review"
          icon={Icons.pending}
          color="#dc2626"
        />
        {apptStats === null ? (
          [1, 2, 3].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Upcoming appts" value={apptStats.upcoming} sub="across all clinics" icon={Icons.calendar} color="#4b7eff" />
            <StatCard label="Total appts" value={apptStats.total} sub="all time" icon={Icons.chart} color="#0f766e" />
            <StatCard label="Hospitals" value="Manage" sub="clinics & locations" icon={Icons.building} color="#d97706" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <SectionHeader>Administration</SectionHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Pending users"
            desc="Approve or reject therapist and receptionist account requests."
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
            desc="View appointments across all therapists and clinics."
            href="/appointments/my"
            icon={Icons.calendar}
            accent="#4b7eff"
          />
          <ActionCard
            title="Therapist directory"
            desc="Browse all registered and approved therapists."
            href="/appointments/book"
            icon={Icons.users}
            accent="#7c3aed"
          />
          <ActionCard
            title="Patient records"
            desc="Oversee session notes and record-sharing requests."
            href="/patient-records"
            icon={Icons.notes}
            accent="#0f766e"
          />
          <ActionCard
            title="Account settings"
            desc="Update your admin profile and contact information."
            href="/settings/profile"
            icon={Icons.settings}
            accent="#64748b"
          />
        </div>
      </div>

      {/* System info */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">System overview</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Platform", value: "TheraKonnect", sub: "Mental health clinic management" },
            { label: "Your role", value: "Super Admin", sub: "Full platform access" },
            { label: "Support", value: "resources", sub: "Help center & docs", href: "/resources" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              {item.href ? (
                <Link href={item.href} className="mt-1 text-sm font-semibold text-[#4b7eff] hover:underline">{item.value}</Link>
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">{item.value}</p>
              )}
              <p className="mt-0.5 text-[11px] text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>
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
  // time has passed. First-ever login always shows. A localStorage fallback
  // covers cases where the backend timestamp hasn't yet been reflected in
  // the user object (e.g., session refresh hasn't happened).
  useEffect(() => {
    if (!user || !token || user?.role !== "therapist") return;
    if (modalDecisionMadeRef.current) return;

    const today = getKarachiISODate(); // "YYYY-MM-DD"
    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const firstShownAt = safeGet(user, "therapistInfo.specialtiesModalFirstShownAt");
    const lastShownOn: string | null =
      safeGet(user, "therapistInfo.specialtiesModalLastShownOn") ?? null;
    const userId = user?._id || user?.id || user?.email || "unknown";

    // Pick whichever record is newer: the server-side timestamp or a
    // localStorage stamp written when we last opened the modal in this
    // browser (covers the same-day-after-shown case where the user object
    // hasn't reloaded yet).
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

    const shouldShow = !firstShownAt || now - lastShownTs > THREE_MONTHS_MS;

    modalDecisionMadeRef.current = true;
    if (!shouldShow) return;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, "1");
      localStorage.setItem(`thera:specialtiesModal:lastShown:${userId}`, String(now));
    }
    setShowSpecialtiesModal(true);

    // Record in DB that modal was shown today
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
