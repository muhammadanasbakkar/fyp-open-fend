"use client";

import Protected from "@/components/Protected";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AssessmentPage() {
  return (
    <Protected>
      <AssessmentInner />
    </Protected>
  );
}

type Appt = {
  _id: string;
  start: string;
  end: string;
  status: string;
  mode?: string;
  meetingLink?: string;
  therapist?: { _id: string; name: string; email?: string } | string;
  patient?: { _id: string; name: string; email?: string; patientId?: string } | string;
};

function fmtDate(dt?: string | Date) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTime(dt?: string | Date) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

type AssessmentComment = {
  _id?: string;
  author?: string;
  authorName?: string;
  authorRole?: "therapist" | "supervisor";
  text: string;
  createdAt?: string;
};

function fmtCommentTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AssessmentCommentThread({
  assessmentId,
  comments,
  token,
  onCommentAdded,
}: {
  assessmentId: string;
  comments: AssessmentComment[];
  token: string | null;
  onCommentAdded: (c: AssessmentComment) => void;
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
      const res: any = await api(
        `api/record-requests/assessments/${assessmentId}/comment`,
        {
          method: "POST",
          headers: {
            ...authHeader(token || undefined),
            "Content-Type": "application/json",
          } as HeadersInit,
          body: JSON.stringify({ text: trimmed }),
        }
      );
      onCommentAdded(
        res?.comment || {
          text: trimmed,
          authorRole: "therapist",
          createdAt: new Date().toISOString(),
        }
      );
      setText("");
    } catch (e: any) {
      setErr(e?.message || "Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400">
        Private comments · you & your supervisor
      </p>
      {comments.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {comments.map((c, i) => (
            <li
              key={c._id || i}
              className={`rounded-lg px-2.5 py-1.5 text-xs ${
                c.authorRole === "supervisor"
                  ? "bg-violet-50 border border-violet-200"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="text-[10px] text-gray-500">
                <span className="font-semibold text-gray-700">
                  {c.authorName || (c.authorRole === "supervisor" ? "Supervisor" : "You")}
                </span>
                <span className="ml-1 text-gray-400">· {fmtCommentTime(c.createdAt)}</span>
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
          placeholder="Reply privately to your supervisor…"
          disabled={posting}
          maxLength={1000}
          className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-[#4b7eff] focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || posting}
          className="shrink-0 rounded-lg bg-[#4b7eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3a6bef] disabled:opacity-50 transition-colors"
        >
          {posting ? "…" : "Post"}
        </button>
      </div>
      {err && <p className="mt-1 text-[11px] text-red-600">{err}</p>}
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-green-50 text-green-700 ring-green-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    completed: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  const klass = map[status] || "bg-gray-100 text-gray-700 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${klass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AssessmentInner() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();

  const appointmentId = params?.id;
  const patientId = sp.get("patientId") || "";

  const [appt, setAppt] = useState<Appt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [presentingProblem, setPresentingProblem] = useState("");
  const [initialAssessment, setInitialAssessment] = useState("");

  // Assessment identity + private comment thread. Comments require an
  // already-saved assessment — `assessmentId` stays null until then.
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentComments, setAssessmentComments] = useState<AssessmentComment[]>([]);

  // Snapshot of last-saved values to detect dirty form
  const savedRef = useRef({ chiefComplaint: "", presentingProblem: "", initialAssessment: "" });

  useEffect(() => {
    (async () => {
      if (!appointmentId) return;
      setLoading(true);
      setErr("");

      const [apptRes, assessmentRes] = await Promise.allSettled([
        api(`api/appointments/${appointmentId}`, {
          headers: authHeader(token || undefined),
        } as RequestInit),
        api(`api/assessments/by-appointment/${appointmentId}`, {
          headers: authHeader(token || undefined),
        } as RequestInit),
      ]);

      // Start with whatever the appointment endpoint gives us, then overlay
      // the richer patient/therapist data the assessments endpoint returns
      // (which crucially includes the patient PT number).
      let merged: Appt | null = null;
      if (apptRes.status === "fulfilled" && apptRes.value) {
        merged = apptRes.value as Appt;
      }

      if (assessmentRes.status === "fulfilled" && assessmentRes.value) {
        const v = assessmentRes.value;
        merged = {
          ...(merged || ({} as Appt)),
          ...(v.appointment || {}),
          patient: v.patient || merged?.patient,
          therapist: v.therapist || merged?.therapist,
        } as Appt;

        if (v.assessment) {
          const a = v.assessment;
          setChiefComplaint(a.chiefComplaint || "");
          setPresentingProblem(a.presentingProblem || "");
          setInitialAssessment(a.initialAssessment || "");
          savedRef.current = {
            chiefComplaint: a.chiefComplaint || "",
            presentingProblem: a.presentingProblem || "",
            initialAssessment: a.initialAssessment || "",
          };
          if (a.updatedAt) setLastSavedAt(a.updatedAt);
          setAssessmentId(a._id ? String(a._id) : null);
          setAssessmentComments(Array.isArray(a.comments) ? a.comments : []);
          setHasExisting(true);
          setEditing(false);
        } else {
          setAssessmentId(null);
          setAssessmentComments([]);
          setHasExisting(false);
          setEditing(true);
        }
      } else {
        setAssessmentId(null);
        setAssessmentComments([]);
        setHasExisting(false);
        setEditing(true);
      }

      if (merged) setAppt(merged);

      setLoading(false);
    })();
  }, [appointmentId, token]);

  const isDirty = useMemo(() => {
    return (
      chiefComplaint !== savedRef.current.chiefComplaint ||
      presentingProblem !== savedRef.current.presentingProblem ||
      initialAssessment !== savedRef.current.initialAssessment
    );
  }, [chiefComplaint, presentingProblem, initialAssessment]);

  async function save() {
    if (!appointmentId) return;

    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const res = await api(`api/assessments`, {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({
          appointmentId,
          patientId,
          chiefComplaint,
          presentingProblem,
          initialAssessment,
        }),
      });

      savedRef.current = { chiefComplaint, presentingProblem, initialAssessment };
      if (res?.assessment?.updatedAt) {
        setLastSavedAt(res.assessment.updatedAt);
      } else {
        setLastSavedAt(new Date().toISOString());
      }
      if (res?.assessment?._id) setAssessmentId(String(res.assessment._id));
      if (Array.isArray(res?.assessment?.comments)) {
        setAssessmentComments(res.assessment.comments);
      }
      setHasExisting(true);
      setEditing(false);
      setMsg("Assessment saved.");
    } catch (e: any) {
      setErr(e.message || "Failed to save assessment.");
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    setChiefComplaint(savedRef.current.chiefComplaint);
    setPresentingProblem(savedRef.current.presentingProblem);
    setInitialAssessment(savedRef.current.initialAssessment);
    setErr("");
    setMsg("");
    if (hasExisting) setEditing(false);
  }

  function startEdit() {
    setEditing(true);
    setMsg("");
    setErr("");
  }

  const patientObj = appt && typeof appt.patient === "object" ? appt.patient : null;
  const therapistObj = appt && typeof appt.therapist === "object" ? appt.therapist : null;
  const patientName = patientObj?.name || (typeof appt?.patient === "string" ? appt?.patient : "—");
  const therapistName = therapistObj?.name || (typeof appt?.therapist === "string" ? appt?.therapist : "—");
console.log(therapistName,"patientObj")
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/appointments/my"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#4b7eff] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to appointments
          </Link>
          <div className="flex items-center gap-3">
            {lastSavedAt && (
              <span className="hidden sm:inline text-xs text-gray-500">
                Last saved {fmtDate(lastSavedAt)}
              </span>
            )}
            {!loading && hasExisting && !editing && (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#4b7eff]/30 bg-[#4b7eff]/5 px-3 py-1.5 text-xs font-medium text-[#4b7eff] hover:bg-[#4b7eff]/10 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-6 py-5 text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Session Assessment
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {patientName === "—" ? "Session Assessment" : `Assessment · ${patientName}`}
              </h1>
              {patientObj?.patientId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                  PT # {patientObj.patientId}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-white/80">
              {therapistName !== "—" ? (
                <>
                  With <span className="font-medium text-white">{therapistName}</span> · capture chief complaint, presenting problem, and clinical impressions for this session.
                </>
              ) : (
                <>Capture chief complaint, presenting problem, and clinical impressions for this session.</>
              )}
            </p>
          </div>

          {/* Context grid */}
          <div className="grid gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContextItem
              label="Patient"
              value={patientName}
              hint={patientObj?.patientId ? `PT # ${patientObj.patientId}` : undefined}
              loading={loading}
            />
            <ContextItem
              label="Therapist"
              value={therapistName}
              loading={loading}
            />
            <ContextItem
              label="Scheduled"
              value={appt ? fmtDate(appt.start) : "—"}
              hint={appt ? `→ ${fmtTime(appt.end)}` : undefined}
              loading={loading}
            />
            <ContextItem
              label="Mode & status"
              value={appt?.mode ? (appt.mode === "online" ? "Online" : "In person") : "—"}
              custom={<StatusPill status={appt?.status} />}
              loading={loading}
            />
          </div>
        </div>

        {/* Alerts */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {msg}
          </div>
        )}

        {/* Form / View */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4b7eff]" />
            <p className="mt-3 text-sm text-gray-500">Loading assessment…</p>
          </div>
        ) : editing ? (
          <div className="space-y-6">
            {hasExisting && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                You are editing a saved assessment. Save to keep changes, or discard to revert.
              </div>
            )}

            {/* Subjective section */}
            <FormSection
              title="Subjective"
              description="What the patient is reporting in their own words."
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A8 8 0 113 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            >
              <Field
                label="Chief complaint"
                hint="The primary concern bringing the patient to this session."
              >
                <Input
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g., anxiety, low mood, insomnia…"
                />
              </Field>

              <Field
                label="Presenting problem"
                hint="Context, onset, duration, triggers, and how it affects daily life."
                counter={`${presentingProblem.length} chars`}
              >
                <textarea
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff]"
                  rows={4}
                  value={presentingProblem}
                  onChange={(e) => setPresentingProblem(e.target.value)}
                  placeholder="Describe the problem in the patient's own words, including onset and impact…"
                />
              </Field>
            </FormSection>

            {/* Clinical impression section */}
            <FormSection
              title="Clinical impression"
              description="Therapist observations, session summary, and initial assessment."
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            >
              <Field
                label="Session summary & initial assessment"
                hint="Mental status, risk indicators, hypotheses, and any next-step considerations."
                counter={`${initialAssessment.length} chars`}
              >
                <textarea
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff]"
                  rows={7}
                  value={initialAssessment}
                  onChange={(e) => setInitialAssessment(e.target.value)}
                  placeholder="Summarize the session, clinical observations, and your initial assessment…"
                />
              </Field>
            </FormSection>

            {/* Sticky action bar */}
            <div className="sticky bottom-4 z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span
                    className={[
                      "inline-flex h-2 w-2 rounded-full",
                      isDirty ? "bg-amber-400" : "bg-emerald-500",
                    ].join(" ")}
                  />
                  {isDirty ? "Unsaved changes" : hasExisting ? "All changes saved" : "Nothing entered yet"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={discardChanges}
                    disabled={(!isDirty && !hasExisting) || saving}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {hasExisting ? "Cancel" : "Discard"}
                  </button>
                  <Button onClick={save} disabled={saving || !isDirty}>
                    {saving ? "Saving…" : "Save assessment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ReadOnlyView
            chiefComplaint={chiefComplaint}
            presentingProblem={presentingProblem}
            initialAssessment={initialAssessment}
            onEdit={startEdit}
          />
        )}

        {/* Private therapist↔supervisor thread on this session summary.
            Only rendered once the assessment has been saved. */}
        {assessmentId && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Private comments</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Visible only to you and your supervisor.
            </p>
            <AssessmentCommentThread
              assessmentId={assessmentId}
              comments={assessmentComments}
              token={token}
              onCommentAdded={(c) => setAssessmentComments((prev) => [...prev, c])}
            />
          </section>
        )}
      </div>
    </div>
  );
}

function ContextItem({
  label,
  value,
  hint,
  custom,
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  custom?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {loading ? (
        <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-gray-100" />
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
          {custom}
        </div>
      )}
      {!loading && hint && <p className="mt-0.5 text-[11px] text-gray-500 truncate">{hint}</p>}
    </div>
  );
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        {counter && <span className="text-[10px] text-gray-400">{counter}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

function ReadOnlyView({
  chiefComplaint,
  presentingProblem,
  initialAssessment,
  onEdit,
}: {
  chiefComplaint: string;
  presentingProblem: string;
  initialAssessment: string;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <FormSection
        title="Subjective"
        description="What the patient is reporting in their own words."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A8 8 0 113 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
      >
        <ReadField label="Chief complaint" value={chiefComplaint} />
        <ReadField label="Presenting problem" value={presentingProblem} multiline />
      </FormSection>

      <FormSection
        title="Clinical impression"
        description="Therapist observations, session summary, and initial assessment."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
      >
        <ReadField label="Session summary & initial assessment" value={initialAssessment} multiline />
      </FormSection>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:brightness-95 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit assessment
        </button>
      </div>
    </div>
  );
}

function ReadField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const empty = !value || !value.trim();
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-700">{label}</p>
      {empty ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-sm italic text-gray-400">
          Not recorded
        </p>
      ) : (
        <p
          className={[
            "rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900",
            multiline ? "whitespace-pre-wrap leading-relaxed" : "",
          ].join(" ")}
        >
          {value}
        </p>
      )}
    </div>
  );
}
