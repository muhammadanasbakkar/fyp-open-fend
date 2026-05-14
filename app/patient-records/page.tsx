"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type PatientLite = {
  _id: string;
  name: string | null;
  email?: string | null;
  patientId: string | null;
};

type SoapNoteRow = {
  _id: string;
  patient: PatientLite | null;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  additionalNotes?: string;
  body?: string;
  history?: any;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AssessmentRow = {
  _id: string;
  patient: PatientLite | null;
  appointment?: { _id: string; start?: string; end?: string; mode?: string; status?: string } | null;
  chiefComplaint?: string;
  presentingProblem?: string;
  initialAssessment?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TreatmentPlanRow = {
  _id: string;
  patient: PatientLite | null;
  problemList?: string;
  diagnosis?: string;
  frequency?: string;
  reviewDate?: string;
  goals?: { title?: string; targetDate?: string; status?: string }[];
  interventions?: { title?: string; frequency?: string; notes?: string }[];
  meta?: any;
  createdAt?: string;
  updatedAt?: string;
};

type Tab = "notes" | "assessments" | "plans";

export default function PatientRecordsIndexPage() {
  return (
    <Protected>
      <Inner />
    </Protected>
  );
}

function fmtDate(dt?: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Returns plain text from possibly-HTML stored content, truncated.
function textPreview(html?: string, max = 180): string {
  if (!html) return "";
  const stripped = String(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > max ? stripped.slice(0, max - 1) + "…" : stripped;
}

function Inner() {
  const { token, user } = useAuth();
  const role = user?.role;

  const [tab, setTab] = useState<Tab>("notes");
  const [q, setQ] = useState("");
  const [notes, setNotes] = useState<SoapNoteRow[] | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRow[] | null>(null);
  const [plans, setPlans] = useState<TreatmentPlanRow[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;
    if (role && role !== "therapist" && role !== "superAdmin") return;
    (async () => {
      setErr("");
      try {
        const [n, a, p] = await Promise.all([
          api("api/patient-records/me/notes", {
            headers: authHeader(token || undefined),
          } as RequestInit),
          api("api/assessments/me", {
            headers: authHeader(token || undefined),
          } as RequestInit),
          api("api/treatment-plans/me", {
            headers: authHeader(token || undefined),
          } as RequestInit),
        ]);
        setNotes(Array.isArray(n) ? n : []);
        setAssessments(Array.isArray(a) ? a : []);
        setPlans(Array.isArray(p) ? p : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load records.");
        setNotes([]);
        setAssessments([]);
        setPlans([]);
      }
    })();
  }, [token, role]);

  const term = q.trim().toLowerCase();

  const filteredNotes = useMemo(() => {
    if (!notes) return null;
    if (!term) return notes;
    return notes.filter((n) => {
      const pt = `${n.patient?.patientId || ""} ${n.patient?.name || ""}`.toLowerCase();
      const txt = [n.subjective, n.objective, n.assessment, n.plan, n.additionalNotes, n.body]
        .map((x) => String(x || ""))
        .join(" ")
        .toLowerCase();
      return pt.includes(term) || txt.includes(term);
    });
  }, [notes, term]);

  const filteredAssessments = useMemo(() => {
    if (!assessments) return null;
    if (!term) return assessments;
    return assessments.filter((a) => {
      const pt = `${a.patient?.patientId || ""} ${a.patient?.name || ""}`.toLowerCase();
      const txt = [a.chiefComplaint, a.presentingProblem, a.initialAssessment]
        .map((x) => String(x || ""))
        .join(" ")
        .toLowerCase();
      return pt.includes(term) || txt.includes(term);
    });
  }, [assessments, term]);

  const filteredPlans = useMemo(() => {
    if (!plans) return null;
    if (!term) return plans;
    return plans.filter((p) => {
      const pt = `${p.patient?.patientId || ""} ${p.patient?.name || ""}`.toLowerCase();
      const txt = [p.problemList, p.diagnosis, p.frequency, p.reviewDate]
        .map((x) => String(x || ""))
        .join(" ")
        .toLowerCase();
      return pt.includes(term) || txt.includes(term);
    });
  }, [plans, term]);

  // Patient role: nothing meaningful to show here — redirect them mentally.
  if (role && role !== "therapist" && role !== "superAdmin") {
    return (
      <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-800">
              Patient records are managed by your therapist.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You can view your sessions from{" "}
              <Link href="/appointments/my" className="text-[#4b7eff] underline">
                My appointments
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    notes: notes?.length ?? 0,
    assessments: assessments?.length ?? 0,
    plans: plans?.length ?? 0,
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
              Patient records
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Records overview</h1>
            <p className="mt-1 text-sm text-gray-600">
              SOAP notes, observations, and treatment plans across all your patients. Read-only.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
            <Input
              placeholder="Search by PT#, name, or content"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="-mx-1 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 px-1 pb-1">
            <TabButton active={tab === "notes"} onClick={() => setTab("notes")} count={counts.notes}>
              SOAP notes
            </TabButton>
            <TabButton
              active={tab === "assessments"}
              onClick={() => setTab("assessments")}
              count={counts.assessments}
            >
              Observations
            </TabButton>
            <TabButton active={tab === "plans"} onClick={() => setTab("plans")} count={counts.plans}>
              Treatment plans
            </TabButton>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Tab body */}
        {tab === "notes" && (
          <FeedSection
            loading={filteredNotes === null}
            empty={filteredNotes?.length === 0}
            emptyLabel={term ? "No notes match your search." : "No SOAP notes yet."}
          >
            {(filteredNotes || []).map((n) => (
              <NoteRow key={n._id} note={n} />
            ))}
          </FeedSection>
        )}

        {tab === "assessments" && (
          <FeedSection
            loading={filteredAssessments === null}
            empty={filteredAssessments?.length === 0}
            emptyLabel={term ? "No observations match your search." : "No observations yet."}
          >
            {(filteredAssessments || []).map((a) => (
              <AssessmentRowView key={a._id} a={a} />
            ))}
          </FeedSection>
        )}

        {tab === "plans" && (
          <FeedSection
            loading={filteredPlans === null}
            empty={filteredPlans?.length === 0}
            emptyLabel={term ? "No treatment plans match your search." : "No treatment plans yet."}
          >
            {(filteredPlans || []).map((p) => (
              <PlanRow key={p._id} plan={p} />
            ))}
          </FeedSection>
        )}
      </div>
    </div>
  );
}

/* ----- shared atoms ----- */

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-[#4b7eff] bg-[#4b7eff] text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#4b7eff]/40 hover:text-[#4b7eff]",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function FeedSection({
  loading,
  empty,
  emptyLabel,
  children,
}: {
  loading: boolean;
  empty?: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
          >
            <div className="h-3 w-40 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-72 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-3/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-600">
        <p className="font-medium text-gray-800">{emptyLabel}</p>
      </div>
    );
  }
  return <div className="space-y-3">{children}</div>;
}

function PatientChip({ patient }: { patient: PatientLite | null }) {
  return (
    <Link
      href={patient?._id ? `/patient-records/${patient._id}` : "#"}
      className="group inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:border-[#4b7eff]/40 hover:text-[#4b7eff]"
      title="Open patient record"
    >
      <span className="font-bold text-gray-900">
        {patient?.patientId || "PT —"}
      </span>
      <span className="truncate text-gray-500">{patient?.name || "Unknown"}</span>
    </Link>
  );
}

function SectionRow({ label, value }: { label: string; value?: string }) {
  const text = textPreview(value, 240);
  if (!text) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}

/* ----- per-row renderers ----- */

function NoteRow({ note }: { note: SoapNoteRow }) {
  const stamp = note.updatedAt || note.createdAt;
  const edited = note.updatedAt && note.createdAt && note.updatedAt !== note.createdAt;
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <PatientChip patient={note.patient} />
        <span className="text-[11px] text-gray-500">
          {fmtDate(stamp)}
          {edited ? " · edited" : ""}
        </span>
      </header>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SectionRow label="Subjective" value={note.subjective} />
        <SectionRow label="Objective" value={note.objective} />
        <SectionRow label="Assessment" value={note.assessment} />
        <SectionRow label="Plan" value={note.plan} />
        {note.additionalNotes && (
          <div className="sm:col-span-2">
            <SectionRow label="Additional" value={note.additionalNotes} />
          </div>
        )}
        {!note.subjective && !note.objective && !note.assessment && !note.plan && note.body && (
          <div className="sm:col-span-2">
            <SectionRow label="Note" value={note.body} />
          </div>
        )}
      </div>
    </article>
  );
}

function AssessmentRowView({ a }: { a: AssessmentRow }) {
  const stamp = a.updatedAt || a.createdAt;
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <PatientChip patient={a.patient} />
        <span className="text-[11px] text-gray-500">
          {a.appointment?.start ? `Session ${fmtDate(a.appointment.start)}` : fmtDate(stamp)}
        </span>
      </header>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SectionRow label="Chief complaint" value={a.chiefComplaint} />
        <SectionRow label="Presenting problem" value={a.presentingProblem} />
        <div className="sm:col-span-2">
          <SectionRow label="Initial assessment" value={a.initialAssessment} />
        </div>
      </div>
    </article>
  );
}

function PlanRow({ plan }: { plan: TreatmentPlanRow }) {
  const stamp = plan.updatedAt || plan.createdAt;
  const goals = (plan.goals || []).filter((g) => (g.title || "").trim());
  const interventions = (plan.interventions || []).filter((it) => (it.title || "").trim());
  const treatmentApproach = plan.meta?.treatmentApproach as string | undefined;

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <PatientChip patient={plan.patient} />
        <span className="text-[11px] text-gray-500">Updated {fmtDate(stamp)}</span>
      </header>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SectionRow label="Problem list" value={plan.problemList} />
        <SectionRow label="Diagnosis" value={plan.diagnosis} />
        {treatmentApproach && (
          <div className="sm:col-span-2">
            <SectionRow label="Approach" value={treatmentApproach} />
          </div>
        )}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Frequency
          </p>
          <p className="mt-0.5 text-xs font-medium text-gray-800">{plan.frequency || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Planned sessions
          </p>
          <p className="mt-0.5 text-xs font-medium text-gray-800">{plan.reviewDate || "—"}</p>
        </div>
        {goals.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Goals
            </p>
            <ul className="mt-1 space-y-1 text-xs text-gray-700">
              {goals.slice(0, 4).map((g, i) => (
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
              {goals.length > 4 && (
                <li className="text-[10px] italic text-gray-400">+{goals.length - 4} more</li>
              )}
            </ul>
          </div>
        )}
        {interventions.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Interventions
            </p>
            <ul className="mt-1 space-y-1 text-xs text-gray-700">
              {interventions.slice(0, 4).map((it, i) => (
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
              {interventions.length > 4 && (
                <li className="text-[10px] italic text-gray-400">+{interventions.length - 4} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
