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

type NoteComment = {
  _id?: string;
  author?: string;
  authorName?: string;
  authorRole?: "therapist" | "supervisor";
  text: string;
  createdAt?: string;
};

type SharedNote = {
  _id?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis?: string;
  treatment?: string;
  activity?: string;
  additionalNotes?: string;
  body?: string;
  createdAt?: string;
  comments?: NoteComment[];
};

type SharedRecordItem = {
  shareId: string;
  sharedAt: string;
  reason: string;
  patient: { _id: string; name: string; patientId: string | null; email: string | null } | null;
  therapist: { _id: string; name: string; email: string | null; profilePicture: string | null } | null;
  notes: SharedNote[];
};

// ── helpers ───────────────────────────────────────────────────────────────────
const CDN = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── shared-note card with private therapist↔supervisor comment thread ────────
function SharedNoteCard({
  note,
  patientId,
  therapistId,
  token,
  onCommentAdded,
}: {
  note: SharedNote;
  patientId: string;
  therapistId: string;
  token: string | null;
  onCommentAdded: (noteId: string, comment: NoteComment) => void;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");

  const subj = note.subjective || "";
  const obj  = note.objective  || "";
  const ass  = note.assessment || note.diagnosis || "";
  const plan = note.plan       || note.treatment || note.activity || "";
  const extra = note.additionalNotes || note.body || "";
  const comments = note.comments || [];

  async function submitComment() {
    const trimmed = text.trim();
    if (!trimmed || !note._id) return;
    setErr("");
    setPosting(true);
    try {
      const res: any = await api(
        `api/record-requests/notes/${patientId}/${therapistId}/${note._id}/comment`,
        {
          method: "POST",
          headers: {
            ...authHeader(token || undefined),
            "Content-Type": "application/json",
          } as HeadersInit,
          body: JSON.stringify({ text: trimmed }),
        }
      );
      onCommentAdded(note._id, res?.comment || { text: trimmed, authorRole: "supervisor", createdAt: new Date().toISOString() });
      setText("");
    } catch (e: any) {
      setErr(e?.message || "Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
        {note.createdAt ? fmt(note.createdAt) : "—"}
      </p>
      {[
        { label: "S — Subjective", value: subj },
        { label: "O — Objective",  value: obj  },
        { label: "A — Assessment", value: ass  },
        { label: "P — Plan",       value: plan },
        { label: "Notes",          value: extra },
      ].map(({ label, value }) =>
        value ? (
          <div key={label} className="mb-1.5 last:mb-0">
            <p className="font-semibold text-gray-500">{label}</p>
            <p className="text-gray-800 whitespace-pre-wrap">{value}</p>
          </div>
        ) : null
      )}

      {/* Private comment thread */}
      <div className="mt-3 border-t border-gray-200 pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400">
          Private comments · therapist & you
        </p>
        {comments.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {comments.map((c, i) => (
              <li
                key={c._id || i}
                className={`rounded-lg px-2.5 py-1.5 ${
                  c.authorRole === "supervisor"
                    ? "bg-[#4b7eff]/10 border border-[#4b7eff]/20"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-[10px] text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {c.authorName || (c.authorRole === "supervisor" ? "Supervisor" : "Therapist")}
                  </span>
                  <span className="ml-1 text-gray-400">· {fmtDateTime(c.createdAt)}</span>
                </p>
                <p className="mt-0.5 text-gray-800 whitespace-pre-wrap">{c.text}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-start gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a private comment for the therapist…"
            disabled={posting}
            maxLength={1000}
            className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-[#4b7eff] focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submitComment}
            disabled={!text.trim() || posting}
            className="shrink-0 rounded-lg bg-[#4b7eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3a6bef] disabled:opacity-50 transition-colors"
          >
            {posting ? "…" : "Post"}
          </button>
        </div>
        {err && <p className="mt-1 text-[11px] text-red-600">{err}</p>}
      </div>
    </div>
  );
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
        console.log(`aaaaa`, d);
        setSessions(d.sessions || []);
        setPages(d.pagination?.pages || 1);
        setTotal(d.pagination?.total || 0);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [therapist._id, page, token]);



  console.log(sessions,"111");
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
  console.log(stats,"stats");
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState("");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Therapist | null>(null);

  const [shared, setShared]       = useState<SharedRecordItem[]>([]);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [openShare, setOpenShare] = useState<string | null>(null);

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

  useEffect(() => {
    if (!token) return;
    setSharedLoading(true);
    api("api/supervisor/shared-records", {
      headers: authHeader(token) as HeadersInit,
    })
      .then((d: any) => {
        console.log("[supervisor/shared-records] response:", d);
        const items =
          (Array.isArray(d?.items) && d.items) ||
          (Array.isArray(d) && d) ||
          (Array.isArray(d?.shared) && d.shared) ||
          [];
        setShared(items);
      })
      .catch((e: any) => {
        console.error("[supervisor/shared-records] fetch failed:", e);
        setErr(e?.message || "Failed to load shared records.");
        setShared([]);
      })
      .finally(() => setSharedLoading(false));
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

        {/* Patients shared with you */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <p className="font-semibold text-gray-900">Patients shared with you</p>
              <p className="text-xs text-gray-500">Therapists who have shared a patient's records with you for review.</p>
            </div>
            {!sharedLoading && (
              <span className="rounded-full bg-[#4b7eff]/10 px-2.5 py-0.5 text-xs font-semibold text-[#4b7eff]">
                {shared.length}
              </span>
            )}
          </div>

          {sharedLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : shared.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              No therapist has shared a patient with you yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {shared.map((s) => {
                console.log(`shared item:`, s);
                const open = openShare === s.shareId;
                const noteCount = (s.notes || []).length;
                return (
                  <div key={s.shareId} className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setOpenShare(open ? null : s.shareId)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {s.patient?.name || "Unknown patient"}
                          {s.patient?.patientId && (
                            <span className="ml-2 text-xs font-normal text-gray-400">{s.patient.patientId}</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 truncate">
                          Shared by <span className="font-medium text-gray-700">{s.therapist?.name || "—"}</span>
                          {" · "}{fmt(s.sharedAt)}
                          {" · "}{noteCount} note{noteCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <svg
                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {open && (
                      <div className="mt-3 space-y-2">
                        {noteCount === 0 ? (
                          <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                            No notes recorded by this therapist for this patient yet.
                          </p>
                        ) : (
                          s.notes.map((n, i) => (
                            <SharedNoteCard
                              key={n._id || i}
                              note={n}
                              patientId={s.patient?._id || ""}
                              therapistId={s.therapist?._id || ""}
                              token={token}
                              onCommentAdded={(noteId, comment) => {
                                setShared((prev) =>
                                  prev.map((item) =>
                                    item.shareId !== s.shareId
                                      ? item
                                      : {
                                          ...item,
                                          notes: item.notes.map((nn) =>
                                            nn._id === noteId
                                              ? { ...nn, comments: [...(nn.comments || []), comment] }
                                              : nn
                                          ),
                                        }
                                  )
                                );
                              }}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
