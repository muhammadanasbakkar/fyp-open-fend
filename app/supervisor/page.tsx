"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import Image from "next/image";

// ── types ─────────────────────────────────────────────────────────────────────
type Stats = {
  totalTherapists: number;
  totalSessions: number;
  sessionsThisMonth: number;
  activeThisMonth: number;
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

type DrawerPatient = {
  patient: {
    _id: string;
    name: string | null;
    patientId: string | null;
    email: string | null;
    dateOfBirth?: string | null;
  };
  notes: SharedNote[];
  treatmentPlan?: SharedTreatmentPlan | null;
  assessments?: SharedAssessment[];
  missing?: string[];
  counts?: { notes: number; assessments: number; hasTreatmentPlan: boolean };
  lastActivityAt?: string | null;
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

type SharedAssessment = {
  _id: string;
  chiefComplaint?: string;
  presentingProblem?: string;
  initialAssessment?: string;
  createdAt?: string;
  updatedAt?: string;
  appointment?: { _id: string; start?: string; end?: string; mode?: string; status?: string } | null;
  comments?: NoteComment[];
};

type SharedTreatmentPlan = {
  _id: string;
  problemList?: string;
  diagnosis?: string;
  frequency?: string;
  reviewDate?: string;
  goals?: { title?: string; targetDate?: string; status?: string }[];
  interventions?: { title?: string; frequency?: string; notes?: string }[];
  meta?: { treatmentApproach?: string } & Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  comments?: NoteComment[];
};

type SharedRecordItem = {
  shareId: string;
  sharedAt: string;
  reason: string;
  patient: { _id: string; name: string; patientId: string | null; email: string | null } | null;
  therapist: { _id: string; name: string; email: string | null; profilePicture: string | null } | null;
  notes: SharedNote[];
  treatmentPlan?: SharedTreatmentPlan | null;
  assessments?: SharedAssessment[];
  missing?: string[];
  counts?: { notes: number; assessments: number; hasTreatmentPlan: boolean };
};

// ── helpers ───────────────────────────────────────────────────────────────────
// Prefer the dedicated CDN base (CloudFront / S3). Fall back to the API host
// for legacy dev backends. Stored profilePicture values are already the full
// object key (e.g. "therakonnect/uploads/profile/xyz.webp") so we DO NOT
// prepend "/uploads/" — that would duplicate the path.
const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_BASE || process.env.NEXT_PUBLIC_API_URL || "")
  .replace(/\/+$/, "");

function avatarSrc(profilePicture: string | null | undefined): string | null {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
    return profilePicture;
  }
  const key = profilePicture.replace(/^\/+/, "");
  return `${CDN_BASE}/${key}`;
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── icons ─────────────────────────────────────────────────── */
const IcoUsers = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IcoNotes = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3m3-4.5v4.5m-9-12h3.75M9 3.75H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const IcoCalendar = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.25h18" />
  </svg>
);
const IcoShare = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

/* ── KPI card with icon tile ────────────────────────────────── */
function KpiCard({
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

/* ── reusable private comment thread ────────────────────────── */
function CommentThread({
  comments,
  onSubmit,
  placeholder = "Leave a private comment for the therapist…",
}: {
  comments: NoteComment[];
  onSubmit: (text: string) => Promise<NoteComment | null>;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setErr("");
    setPosting(true);
    try {
      const saved = await onSubmit(trimmed);
      if (saved) setText("");
    } catch (e: any) {
      setErr(e?.message || "Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="mb-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
        Private thread · therapist & you
      </p>
      {comments.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {comments.map((c, i) => (
            <li
              key={c._id || i}
              className={[
                "rounded-lg px-2.5 py-1.5 text-xs",
                c.authorRole === "supervisor"
                  ? "bg-[#4b7eff]/10 ring-1 ring-[#4b7eff]/20"
                  : "bg-white ring-1 ring-gray-200",
              ].join(" ")}
            >
              <p className="text-[10px] text-gray-500">
                <span className="font-bold text-gray-700">
                  {c.authorName ||
                    (c.authorRole === "supervisor" ? "Supervisor" : "Therapist")}
                </span>
                <span className="ml-1 text-gray-400">· {fmtDateTime(c.createdAt)}</span>
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-gray-800">{c.text}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-start gap-2">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={posting}
          maxLength={1000}
          className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || posting}
          className="shrink-0 rounded-lg bg-[#4b7eff] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#3a6bef] disabled:opacity-50 transition-colors"
        >
          {posting ? "…" : "Post"}
        </button>
      </div>
      {err && <p className="mt-1 text-[11px] text-red-600">{err}</p>}
    </div>
  );
}

/* ── shared-note card with private comment thread ───────────── */
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
  const subj = note.subjective || "";
  const obj = note.objective || "";
  const ass = note.assessment || note.diagnosis || "";
  const plan = note.plan || note.treatment || note.activity || "";
  const extra = note.additionalNotes || note.body || "";
  const comments = note.comments || [];

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        Session note · {note.createdAt ? fmt(note.createdAt) : "—"}
      </p>
      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
        {[
          { label: "S — Subjective", value: subj, color: "bg-blue-50 text-blue-700 ring-blue-200" },
          { label: "O — Objective", value: obj, color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
          { label: "A — Assessment", value: ass, color: "bg-violet-50 text-violet-700 ring-violet-200" },
          { label: "P — Plan", value: plan, color: "bg-amber-50 text-amber-700 ring-amber-200" },
        ].map(({ label, value, color }) =>
          value ? (
            <div key={label} className="rounded-lg border border-gray-100 bg-white p-2.5">
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1 ${color}`}>
                {label}
              </span>
              <div
                className="rich-content mt-1 text-gray-800"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          ) : null
        )}
        {extra && (
          <div className="rounded-lg border border-gray-100 bg-white p-2.5 sm:col-span-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-700 ring-1 ring-gray-200">
              Notes
            </span>
            <div
              className="rich-content mt-1 text-gray-800"
              dangerouslySetInnerHTML={{ __html: extra }}
            />
          </div>
        )}
      </div>

      <CommentThread
        comments={comments}
        onSubmit={async (trimmed) => {
          if (!note._id) return null;
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
          const saved: NoteComment = res?.comment || {
            text: trimmed,
            authorRole: "supervisor",
            createdAt: new Date().toISOString(),
          };
          onCommentAdded(note._id, saved);
          return saved;
        }}
      />
    </div>
  );
}

/* ── sessions drawer ────────────────────────────────────────── */
function SessionsDrawer({
  therapist,
  token,
  onClose,
}: {
  therapist: Therapist;
  token: string | null;
  onClose: () => void;
}) {
  const [patients, setPatients] = useState<DrawerPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  type DrawerTab = "notes" | "assessments" | "plan";
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("notes");

  const avatarUrl = avatarSrc(therapist.profilePicture);
  const initials = therapist.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setLoading(true);
    api(`api/supervisor/therapists/${therapist._id}/sessions`, {
      headers: authHeader(token || undefined) as HeadersInit,
    })
      .then((d: any) => {
        setPatients(Array.isArray(d?.patients) ? d.patients : []);
        // Auto-expand the first patient so the supervisor sees content immediately.
        if (Array.isArray(d?.patients) && d.patients.length === 1) {
          setExpanded(String(d.patients[0].patient._id));
        }
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [therapist._id, token]);

  const totalPatients = patients.length;
  const totalNotes = patients.reduce((s, p) => s + (p.counts?.notes ?? 0), 0);
  const totalAssessments = patients.reduce((s, p) => s + (p.counts?.assessments ?? 0), 0);
  const totalPlans = patients.reduce((s, p) => s + (p.counts?.hasTreatmentPlan ? 1 : 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="flex w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#3a5bef] to-[#7c3aed] px-5 py-4 text-white">
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={therapist.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/40"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold ring-2 ring-white/40">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{therapist.name}</p>
                <p className="truncate text-[11px] text-white/80">{therapist.email}</p>
              </div>
            </div>
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
          {/* Roll-up totals across all patients */}
          {!loading && totalPatients > 0 && (
            <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">
                {totalPatients} patient{totalPatients === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">
                {totalNotes} note{totalNotes === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">
                {totalPlans} plan{totalPlans === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur">
                {totalAssessments} session{totalAssessments === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/40 p-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))
          ) : patients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-700">No records yet</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {therapist.name.split(" ")[0]} hasn&apos;t worked with any patients yet.
              </p>
            </div>
          ) : (
            patients.map((row) => {
              const pid = String(row.patient._id);
              const open = expanded === pid;
              const noteCount = row.counts?.notes ?? row.notes.length;
              const assessmentCount =
                row.counts?.assessments ?? (row.assessments || []).length;
              const hasPlan = row.counts?.hasTreatmentPlan ?? !!row.treatmentPlan;
              const missing = row.missing || [];
              return (
                <div
                  key={pid}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : pid)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {row.patient.name || row.patient.email || "Unknown patient"}
                        {row.patient.patientId && (
                          <span className="ml-2 text-[10px] font-mono text-gray-400">
                            {row.patient.patientId}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-gray-500">
                        Last activity {fmt(row.lastActivityAt || null)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <ArtifactChip
                          label="Notes"
                          count={noteCount}
                          present={noteCount > 0}
                          color="blue"
                        />
                        <ArtifactChip
                          label="Plan"
                          count={hasPlan ? 1 : 0}
                          present={hasPlan}
                          color="emerald"
                        />
                        <ArtifactChip
                          label="Sessions"
                          count={assessmentCount}
                          present={assessmentCount > 0}
                          color="violet"
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {missing.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200"
                          title="Missing artifacts"
                        >
                          ⚠ {missing.length} missing
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 bg-gray-50/60">
                      {/* Tab switcher */}
                      <div className="flex items-center gap-1 border-b border-gray-100 bg-white px-2 sm:px-3">
                        {([
                          { key: "notes", label: "SOAP notes", count: noteCount, color: "blue" as const },
                          { key: "assessments", label: "Sessions", count: assessmentCount, color: "violet" as const },
                          { key: "plan", label: "Treatment plan", count: hasPlan ? 1 : 0, color: "emerald" as const },
                        ] as { key: DrawerTab; label: string; count: number; color: "blue" | "violet" | "emerald" }[]).map((tab) => {
                          const isActive = drawerTab === tab.key;
                          const dotColor = ARTIFACT_PALETTE[tab.color].bar;
                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => setDrawerTab(tab.key)}
                              className={[
                                "relative px-3 py-2.5 text-xs font-semibold transition-colors",
                                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-800",
                              ].join(" ")}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                {tab.label}
                                <span
                                  className={[
                                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                    isActive ? "bg-gray-900/5 text-gray-700" : "bg-gray-100 text-gray-500",
                                  ].join(" ")}
                                >
                                  {tab.count}
                                </span>
                              </span>
                              {isActive && (
                                <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full ${dotColor}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tab body */}
                      <div className="p-4">
                        {drawerTab === "plan" && (
                          row.treatmentPlan ? (
                            <TreatmentPlanCard
                              plan={row.treatmentPlan}
                              token={token}
                              onCommentAdded={(_planId, comment) => {
                                setPatients((prev) =>
                                  prev.map((it) =>
                                    String(it.patient._id) !== pid || !it.treatmentPlan
                                      ? it
                                      : {
                                          ...it,
                                          treatmentPlan: {
                                            ...it.treatmentPlan,
                                            comments: [
                                              ...(it.treatmentPlan.comments || []),
                                              comment,
                                            ],
                                          },
                                        }
                                  )
                                );
                              }}
                            />
                          ) : (
                            <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs italic text-gray-500">
                              No treatment plan yet.
                            </p>
                          )
                        )}

                        {drawerTab === "assessments" && (
                          assessmentCount === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs italic text-gray-500">
                              No session summaries recorded yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(row.assessments || []).map((a) => (
                                <AssessmentCard
                                  key={a._id}
                                  a={a}
                                  token={token}
                                  onCommentAdded={(assessmentId, comment) => {
                                    setPatients((prev) =>
                                      prev.map((it) =>
                                        String(it.patient._id) !== pid
                                          ? it
                                          : {
                                              ...it,
                                              assessments: (it.assessments || []).map((aa) =>
                                                aa._id === assessmentId
                                                  ? {
                                                      ...aa,
                                                      comments: [
                                                        ...(aa.comments || []),
                                                        comment,
                                                      ],
                                                    }
                                                  : aa
                                              ),
                                            }
                                      )
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          )
                        )}

                        {drawerTab === "notes" && (
                          noteCount === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs italic text-gray-500">
                              No SOAP notes recorded yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(row.notes || []).map((n, i) => (
                                <SharedNoteCard
                                  key={n._id || i}
                                  note={n}
                                  patientId={pid}
                                  therapistId={therapist._id}
                                  token={token}
                                  onCommentAdded={(noteId, comment) => {
                                    setPatients((prev) =>
                                      prev.map((it) =>
                                        String(it.patient._id) !== pid
                                          ? it
                                          : {
                                              ...it,
                                              notes: it.notes.map((nn) =>
                                                nn._id === noteId
                                                  ? {
                                                      ...nn,
                                                      comments: [
                                                        ...(nn.comments || []),
                                                        comment,
                                                      ],
                                                    }
                                                  : nn
                                              ),
                                            }
                                      )
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
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

  const [stats, setStats] = useState<Stats | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Therapist | null>(null);

  const [shared, setShared] = useState<SharedRecordItem[]>([]);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [openShare, setOpenShare] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"therapists" | "shared">("therapists");

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

  const filtered = useMemo(
    () =>
      therapists.filter((t) => {
        const q = search.toLowerCase();
        return (
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q))
        );
      }),
    [therapists, search]
  );

  // Comes from the backend now — counts distinct therapists with at least one
  // non-cancelled appointment scheduled within the current calendar month.
  const activeThisMonth = stats?.activeThisMonth ?? 0;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
        {/* ── Hero supervisor card ───────────────────────────── */}
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
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Supervisor
            </span>
          </div>

          <div className="relative px-6 sm:px-8">
            {(() => {
              // avatarSrc() prefixes the CDN base internally and handles
              // already-absolute URLs — never concatenate CDN_BASE manually.
              const supSrc = avatarSrc((user as any)?.profilePicture);
              return (
                <div className="relative -mt-12 inline-block sm:-mt-14">
                  {supSrc ? (
                    <Image
                      src={supSrc}
                      alt={user?.name || "Supervisor"}
                      width={112}
                      height={112}
                      className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white shadow-xl sm:h-24 sm:w-24"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-2xl font-bold text-white ring-4 ring-white shadow-xl sm:h-24 sm:w-24">
                      {(user?.name || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex flex-col gap-2 px-6 pb-6 pt-3 sm:px-8 sm:pb-7">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Supervisor Dashboard"}
            </h1>
            <p className="text-sm text-gray-600">
              Oversight of your enrolled therapists and patient records they&apos;ve shared with you for review.
            </p>
          </div>
        </section>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* ── KPI cards ──────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-white" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Therapists"
              value={stats.totalTherapists}
              sub="under your supervision"
              icon={<IcoUsers />}
              color="#4b7eff"
            />
            <KpiCard
              label="Active this month"
              value={activeThisMonth}
              sub="had at least one appointment"
              icon={<IcoCalendar />}
              color="#0f766e"
            />
            <KpiCard
              label="Sessions this month"
              value={stats.sessionsThisMonth}
              sub={new Date().toLocaleString("en-PK", { month: "long", year: "numeric" })}
              icon={<IcoNotes />}
              color="#7c3aed"
            />
            <KpiCard
              label="Total sessions"
              value={stats.totalSessions}
              sub="all-time appointments"
              icon={<IcoShare />}
              color="#d97706"
            />
          </div>
        ) : null}

        {/* ── Tabbed content ────────────────────────────────── */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-1 border-b border-gray-100 px-2 sm:px-4">
            {[
              {
                key: "therapists",
                label: "Therapists",
                count: therapists.length,
              },
              {
                key: "shared",
                label: "Shared records",
                count: shared.length,
              },
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
                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        active
                          ? "bg-[#4b7eff]/10 text-[#4b7eff]"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {t.count}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#4b7eff]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Therapists tab */}
          {activeTab === "therapists" && (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{therapists.length}</span>{" "}
                  therapist{therapists.length !== 1 ? "s" : ""} enrolled
                </p>
                <div className="relative w-full sm:w-72">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or specialization"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {therapists.length === 0
                      ? "No therapists enrolled yet"
                      : "No matches"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {therapists.length === 0
                      ? "Therapists who sign up under your supervision will appear here."
                      : "Try a different search term."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {filtered.map((t) => {
                    const avatarUrl = avatarSrc(t.profilePicture);
                    const initials = t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    const recent = t.lastSessionDate
                      ? new Date(t.lastSessionDate).getTime() >
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                      : false;
                    return (
                      <div
                        key={t._id}
                        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#4b7eff]/30 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={t.name}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-sm font-bold text-white ring-2 ring-white shadow">
                                {initials}
                              </div>
                            )}
                            {recent && (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5"
                                title="Active in last 30 days"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {t.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">{t.email}</p>
                            {t.specializations.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {t.specializations.slice(0, 3).map((s) => (
                                  <span
                                    key={s}
                                    className="inline-flex items-center rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {t.specializations.length > 3 && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                                    +{t.specializations.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="-mx-4 mt-3 flex items-center justify-between gap-3 border-t border-gray-100 px-4 pt-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                Sessions
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {t.sessionCount}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                Last
                              </p>
                              <p className="text-xs font-medium text-gray-700">
                                {fmt(t.lastSessionDate)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelected(t)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#4b7eff] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#3a6bef] transition-colors"
                          >
                            View records
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Shared records tab */}
          {activeTab === "shared" && (
            <div className="p-5">
              {sharedLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : shared.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No patients shared with you yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    When a therapist shares a patient&apos;s records for review, they&apos;ll appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shared.map((s) => {
                    const open = openShare === s.shareId;
                    const noteCount = s.counts?.notes ?? (s.notes || []).length;
                    const assessmentCount =
                      s.counts?.assessments ?? (s.assessments || []).length;
                    const hasPlan = s.counts?.hasTreatmentPlan ?? !!s.treatmentPlan;
                    const missing = s.missing || [];
                    return (
                      <div
                        key={s.shareId}
                        className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenShare(open ? null : s.shareId)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {s.patient?.name || "Unknown patient"}
                              {s.patient?.patientId && (
                                <span className="ml-2 text-[10px] font-mono text-gray-400">
                                  {s.patient.patientId}
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              Shared by{" "}
                              <span className="font-medium text-gray-700">
                                {s.therapist?.name || "—"}
                              </span>{" "}
                              · {fmt(s.sharedAt)}
                            </p>
                            {/* Artifact-presence chips */}
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              <ArtifactChip
                                label="Notes"
                                count={noteCount}
                                present={noteCount > 0}
                                color="blue"
                              />
                              <ArtifactChip
                                label="Plan"
                                count={hasPlan ? 1 : 0}
                                present={hasPlan}
                                color="emerald"
                              />
                              <ArtifactChip
                                label="Sessions"
                                count={assessmentCount}
                                present={assessmentCount > 0}
                                color="violet"
                              />
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {missing.length > 0 && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200"
                                title="Missing artifacts"
                              >
                                ⚠ {missing.length} missing
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
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {open && (
                          <div className="space-y-4 border-t border-gray-100 bg-gray-50/60 p-4">
                            {/* Treatment plan */}
                            <ArtifactSection
                              title="Treatment plan"
                              color="emerald"
                              empty={!s.treatmentPlan}
                              emptyText="No treatment plan yet."
                            >
                              {s.treatmentPlan && (
                                <TreatmentPlanCard
                                  plan={s.treatmentPlan}
                                  token={token}
                                  onCommentAdded={(_planId, comment) => {
                                    setShared((prev) =>
                                      prev.map((item) =>
                                        item.shareId !== s.shareId || !item.treatmentPlan
                                          ? item
                                          : {
                                              ...item,
                                              treatmentPlan: {
                                                ...item.treatmentPlan,
                                                comments: [
                                                  ...(item.treatmentPlan.comments || []),
                                                  comment,
                                                ],
                                              },
                                            }
                                      )
                                    );
                                  }}
                                />
                              )}
                            </ArtifactSection>

                            {/* Session summaries / assessments */}
                            <ArtifactSection
                              title={`Session summaries${assessmentCount ? ` · ${assessmentCount}` : ""}`}
                              color="violet"
                              empty={assessmentCount === 0}
                              emptyText="No session summaries recorded yet."
                            >
                              <div className="space-y-2">
                                {(s.assessments || []).map((a) => (
                                  <AssessmentCard
                                    key={a._id}
                                    a={a}
                                    token={token}
                                    onCommentAdded={(assessmentId, comment) => {
                                      setShared((prev) =>
                                        prev.map((item) =>
                                          item.shareId !== s.shareId
                                            ? item
                                            : {
                                                ...item,
                                                assessments: (item.assessments || []).map((aa) =>
                                                  aa._id === assessmentId
                                                    ? {
                                                        ...aa,
                                                        comments: [
                                                          ...(aa.comments || []),
                                                          comment,
                                                        ],
                                                      }
                                                    : aa
                                                ),
                                              }
                                        )
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </ArtifactSection>

                            {/* SOAP notes */}
                            <ArtifactSection
                              title={`SOAP notes${noteCount ? ` · ${noteCount}` : ""}`}
                              color="blue"
                              empty={noteCount === 0}
                              emptyText="No SOAP notes recorded yet."
                            >
                              <div className="space-y-2">
                                {(s.notes || []).map((n, i) => (
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
                                                    ? {
                                                        ...nn,
                                                        comments: [
                                                          ...(nn.comments || []),
                                                          comment,
                                                        ],
                                                      }
                                                    : nn
                                                ),
                                              }
                                        )
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </ArtifactSection>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
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

/* ── artifact chips + sections (used in Shared records tab) ── */

const ARTIFACT_PALETTE: Record<
  string,
  { present: string; absent: string; bar: string }
> = {
  blue: {
    present: "bg-blue-50 text-blue-700 ring-blue-200",
    absent: "bg-gray-50 text-gray-400 ring-gray-200",
    bar: "bg-blue-500",
  },
  emerald: {
    present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    absent: "bg-gray-50 text-gray-400 ring-gray-200",
    bar: "bg-emerald-500",
  },
  violet: {
    present: "bg-violet-50 text-violet-700 ring-violet-200",
    absent: "bg-gray-50 text-gray-400 ring-gray-200",
    bar: "bg-violet-500",
  },
};

function ArtifactChip({
  label,
  count,
  present,
  color,
}: {
  label: string;
  count: number;
  present: boolean;
  color: "blue" | "emerald" | "violet";
}) {
  const p = ARTIFACT_PALETTE[color];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
        present ? p.present : p.absent,
      ].join(" ")}
    >
      {present ? "✓" : "·"} {label}
      {present && count > 1 ? ` ${count}` : ""}
    </span>
  );
}

function ArtifactSection({
  title,
  color,
  empty,
  emptyText,
  children,
}: {
  title: string;
  color: "blue" | "emerald" | "violet";
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
}) {
  const p = ARTIFACT_PALETTE[color];
  return (
    <div>
      <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
        <span className={`h-1.5 w-1.5 rounded-full ${p.bar}`} />
        {title}
      </p>
      {empty ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-xs italic text-gray-500">
          {emptyText || "Nothing recorded yet."}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

function TreatmentPlanCard({
  plan,
  token,
  onCommentAdded,
}: {
  plan: SharedTreatmentPlan;
  token?: string | null;
  onCommentAdded?: (planId: string, comment: NoteComment) => void;
}) {
  const goals = (plan.goals || []).filter((g) => (g.title || "").trim());
  const interventions = (plan.interventions || []).filter((it) => (it.title || "").trim());
  const treatmentApproach = plan.meta?.treatmentApproach;
  const comments = plan.comments || [];
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Updated {fmt(plan.updatedAt || plan.createdAt || "")}
        </p>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <ReadField label="Problem list" value={plan.problemList} />
        <ReadField label="Diagnosis" value={plan.diagnosis} />
        {treatmentApproach && (
          <div className="sm:col-span-2">
            <ReadField label="Approach" value={treatmentApproach} />
          </div>
        )}
        <ReadField label="Session frequency" value={plan.frequency} />
        <ReadField label="Planned sessions" value={plan.reviewDate} />
      </div>
      {goals.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Goals
          </p>
          <ul className="mt-1 space-y-1 text-xs text-gray-700">
            {goals.slice(0, 5).map((g, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                <span className="flex-1 truncate">{g.title}</span>
                {g.status && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-gray-500">
                    {g.status}
                  </span>
                )}
              </li>
            ))}
            {goals.length > 5 && (
              <li className="text-[10px] italic text-gray-400">
                +{goals.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
      {interventions.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Interventions
          </p>
          <ul className="mt-1 space-y-1 text-xs text-gray-700">
            {interventions.slice(0, 5).map((it, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                <span className="flex-1 truncate">{it.title}</span>
                {it.frequency && (
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-blue-700">
                    {it.frequency}
                  </span>
                )}
              </li>
            ))}
            {interventions.length > 5 && (
              <li className="text-[10px] italic text-gray-400">
                +{interventions.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}

      {onCommentAdded && (
        <CommentThread
          comments={comments}
          placeholder="Comment on this treatment plan…"
          onSubmit={async (trimmed) => {
            const res: any = await api(
              `api/record-requests/treatment-plans/${plan._id}/comment`,
              {
                method: "POST",
                headers: {
                  ...authHeader(token || undefined),
                  "Content-Type": "application/json",
                } as HeadersInit,
                body: JSON.stringify({ text: trimmed }),
              }
            );
            const saved: NoteComment = res?.comment || {
              text: trimmed,
              authorRole: "supervisor",
              createdAt: new Date().toISOString(),
            };
            onCommentAdded(plan._id, saved);
            return saved;
          }}
        />
      )}
    </div>
  );
}

function AssessmentCard({
  a,
  token,
  onCommentAdded,
}: {
  a: SharedAssessment;
  token?: string | null;
  onCommentAdded?: (assessmentId: string, comment: NoteComment) => void;
}) {
  const comments = a.comments || [];
  return (
    <div className="rounded-xl border border-violet-100 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
        Session {a.appointment?.start ? fmt(a.appointment.start) : fmt(a.createdAt || "")}
      </p>
      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
        <ReadField label="Chief complaint" value={a.chiefComplaint} />
        <ReadField label="Presenting problem" value={a.presentingProblem} />
        <div className="sm:col-span-2">
          <ReadField label="Initial assessment" value={a.initialAssessment} />
        </div>
      </div>

      {onCommentAdded && (
        <CommentThread
          comments={comments}
          placeholder="Comment on this session summary…"
          onSubmit={async (trimmed) => {
            const res: any = await api(
              `api/record-requests/assessments/${a._id}/comment`,
              {
                method: "POST",
                headers: {
                  ...authHeader(token || undefined),
                  "Content-Type": "application/json",
                } as HeadersInit,
                body: JSON.stringify({ text: trimmed }),
              }
            );
            const saved: NoteComment = res?.comment || {
              text: trimmed,
              authorRole: "supervisor",
              createdAt: new Date().toISOString(),
            };
            onCommentAdded(a._id, saved);
            return saved;
          }}
        />
      )}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value?: string }) {
  if (!value || isHtmlEmpty(value)) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div
        className="rich-content mt-0.5 text-xs leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

// True when stored rich-text content has no visible content. Used so
// we don't render an empty `<div class="rich-content">` block.
function isHtmlEmpty(html: string): boolean {
  if (!html) return true;
  return (
    String(html)
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<p>\s*<\/p>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, "")
      .replace(/\s+/g, "")
      .trim().length === 0
  );
}
