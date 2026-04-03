"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";

// ── types ─────────────────────────────────────────────────────────────────────
type Stats = {
  totalTherapists: number;
  totalSessions: number;
  sessionsThisMonth: number;
};

type Therapist = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  specializations: string[];
  yearsExperience: number;
  sessionCount: number;
  lastSessionDate: string | null;
  joinedAt: string;
};

type Session = {
  _id: string;
  patient: { _id: string; name?: string; patientId?: string; email?: string } | null;
  sessionDate: string;
  diagnosis: string;
  status: "draft" | "signed";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

// ── helpers ───────────────────────────────────────────────────────────────────
const CDN = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

// ── sessions drawer ────────────────────────────────────────────────────────────
function SessionsDrawer({
  therapist,
  token,
  onClose,
}: {
  therapist: Therapist;
  token: string | null;
  onClose: () => void;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api(`api/supervisor/therapists/${therapist._id}/sessions?page=${page}&limit=10`, {
      headers: authHeader(token || undefined) as HeadersInit,
    })
      .then((d: any) => {
        setSessions(d.sessions || []);
        setPages(d.pagination?.pages || 1);
        setTotal(d.pagination?.total || 0);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [therapist._id, page, token]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="flex w-full max-w-xl flex-col bg-white shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#3a5bef] to-[#7c3aed] px-5 py-4 text-white">
          <div>
            <p className="font-semibold">{therapist.name}</p>
            <p className="text-xs opacity-70">{total} session note{total !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))
          ) : sessions.length === 0 ? (
            <p className="mt-8 text-center text-sm text-gray-500">No session notes yet.</p>
          ) : (
            sessions.map((s) => {
              const open = expanded === s._id;
              const patientName = s.patient?.name || s.patient?.email || "Unknown patient";
              const ptId = s.patient?.patientId || "";
              return (
                <div
                  key={s._id}
                  className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden"
                >
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
                    onClick={() => setExpanded(open ? null : s._id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {patientName}
                        {ptId && <span className="ml-2 text-xs text-gray-400">{ptId}</span>}
                      </p>
                      <p className="text-xs text-gray-500">{fmt(s.sessionDate)}{s.diagnosis ? ` · ${s.diagnosis}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        s.status === "signed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {s.status}
                      </span>
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-2 text-xs">
                      {[
                        { label: "S — Subjective", value: s.subjective },
                        { label: "O — Objective",  value: s.objective  },
                        { label: "A — Assessment", value: s.assessment },
                        { label: "P — Plan",       value: s.plan       },
                      ].map(({ label, value }) =>
                        value ? (
                          <div key={label}>
                            <p className="font-semibold text-gray-500">{label}</p>
                            <p className="mt-0.5 text-gray-800 whitespace-pre-wrap">{value}</p>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-4 py-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export default function SupervisorDashboardPage() {
  return (
    <Protected>
      <SupervisorDashboardInner />
    </Protected>
  );
}

function SupervisorDashboardInner() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [stats, setStats]         = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState("");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Therapist | null>(null);

  useEffect(() => {
    if (user && user.role !== "supervisor") {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api("api/supervisor/dashboard", {
      headers: authHeader(token) as HeadersInit,
    })
      .then((d: any) => {
        setStats(d.stats);
        setTherapists(d.therapists || []);
      })
      .catch((e: any) => setErr(e.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = therapists.filter((t) => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.specializations.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your enrolled therapists and their therapy records.
          </p>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Stats row */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Enrolled Therapists"
              value={stats.totalTherapists}
              sub="under your supervision"
            />
            <StatCard
              label="Total Sessions"
              value={stats.totalSessions}
              sub="all-time SOAP notes"
            />
            <StatCard
              label="Sessions This Month"
              value={stats.sessionsThisMonth}
              sub={new Date().toLocaleString("en-PK", { month: "long", year: "numeric" })}
            />
          </div>
        ) : null}

        {/* Therapist list */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <p className="font-semibold text-gray-900">Enrolled Therapists</p>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, specialization…"
              className="w-64 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4b7eff] focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              {therapists.length === 0
                ? "No therapists are enrolled under your supervision yet."
                : "No results match your search."}
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((t) => {
                const avatarUrl = t.profilePicture
                  ? `${CDN}/uploads/${t.profilePicture}`
                  : null;
                const initials = t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <div
                    key={t._id}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* avatar */}
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={t.name}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-sm font-bold text-white">
                          {initials}
                        </div>
                      )}

                      {/* info */}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{t.name}</p>
                        <p className="text-xs text-gray-500 truncate">{t.email}</p>
                        {t.specializations.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {t.specializations.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]"
                              >
                                {s}
                              </span>
                            ))}
                            {t.specializations.length > 3 && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                                +{t.specializations.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* stats + action */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-gray-900">{t.sessionCount}</p>
                        <p className="text-xs text-gray-400">sessions</p>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-xs text-gray-500">Last session</p>
                        <p className="text-xs font-medium text-gray-700">{fmt(t.lastSessionDate)}</p>
                      </div>
                      <button
                        onClick={() => setSelected(t)}
                        className="rounded-xl bg-[#4b7eff] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3a6bef] transition-colors shadow-sm"
                      >
                        View Records
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sessions drawer */}
      {selected && (
        <SessionsDrawer
          therapist={selected}
          token={token}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
