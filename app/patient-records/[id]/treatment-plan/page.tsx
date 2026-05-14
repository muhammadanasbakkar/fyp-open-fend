"use client";

import Protected from "@/components/Protected";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import RichField, { RichView } from "@/components/RichField";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type GoalStatus = "active" | "done" | "paused";
type Goal = { title: string; targetDate?: string; status?: GoalStatus | string };
type Intervention = { title: string; frequency?: string; notes?: string };

type PatientInfo = { _id: string; name: string | null; email?: string | null; patientId: string | null };
type TherapistInfo = { _id: string; name: string | null; email?: string | null };

export default function TreatmentPlanPage() {
  return (
    <Protected>
      <TreatmentPlanInner />
    </Protected>
  );
}

function fmtTimestamp(dt?: string | Date) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 ring-blue-200",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paused: "bg-amber-50 text-amber-700 ring-amber-200",
};

function StatusPill({ status }: { status?: string }) {
  const s = (status || "active").toLowerCase();
  const klass = STATUS_STYLE[s] || "bg-gray-100 text-gray-700 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${klass}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function TreatmentPlanInner() {
  const { token, user } = useAuth();
  const router = useRouter();
  const role = user?.role;

  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const canEdit = role === "therapist" || role === "admin" || role === "superAdmin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [therapistInfo, setTherapistInfo] = useState<TherapistInfo | null>(null);

  // Plan fields
  const [problemList, setProblemList] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentApproach, setTreatmentApproach] = useState("");
  const [frequency, setFrequency] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  // Snapshot for dirty detection / discard
  const savedRef = useRef({
    problemList: "",
    diagnosis: "",
    treatmentApproach: "",
    frequency: "",
    reviewDate: "",
    goals: [] as Goal[],
    interventions: [] as Intervention[],
  });

  function applyPlan(p: any) {
    const _problemList = p?.problemList || "";
    const _diagnosis = p?.diagnosis || "";
    const _treatmentApproach = p?.meta?.treatmentApproach || "";
    const _frequency = p?.frequency || "";
    const _reviewDate = p?.reviewDate || "";
    const _goals: Goal[] = Array.isArray(p?.goals) && p.goals.length ? p.goals : [];
    const _interventions: Intervention[] =
      Array.isArray(p?.interventions) && p.interventions.length ? p.interventions : [];

    setProblemList(_problemList);
    setDiagnosis(_diagnosis);
    setTreatmentApproach(_treatmentApproach);
    setFrequency(_frequency);
    setReviewDate(_reviewDate);
    setGoals(_goals);
    setInterventions(_interventions);

    savedRef.current = {
      problemList: _problemList,
      diagnosis: _diagnosis,
      treatmentApproach: _treatmentApproach,
      frequency: _frequency,
      reviewDate: _reviewDate,
      goals: JSON.parse(JSON.stringify(_goals)),
      interventions: JSON.parse(JSON.stringify(_interventions)),
    };
  }

  async function load() {
    if (!patientId) return;
    setLoading(true);
    setErr("");
    setMsg("");

    try {
      const res = await api(`api/treatment-plans/${patientId}`, {
        headers: authHeader(token || undefined),
      } as RequestInit);

      if (res?.patient) setPatientInfo(res.patient);
      if (res?.therapist) setTherapistInfo(res.therapist);

      const p = res?.plan;
      if (p) {
        applyPlan(p);
        if (p.updatedAt) setLastSavedAt(p.updatedAt);
        setHasExisting(true);
        setEditing(false);
      } else {
        applyPlan({});
        setHasExisting(false);
        setEditing(canEdit); // patients land in view mode even when empty
      }
    } catch {
      // If no plan exists yet, just show blank form
      applyPlan({});
      setHasExisting(false);
      setEditing(canEdit);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, token]);

  function updateGoal(i: number, patch: Partial<Goal>) {
    setGoals((prev) => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function removeGoal(i: number) {
    setGoals((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addGoal() {
    setGoals((prev) => [...prev, { title: "", targetDate: "", status: "active" }]);
  }

  function updateIntervention(i: number, patch: Partial<Intervention>) {
    setInterventions((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function removeIntervention(i: number) {
    setInterventions((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addIntervention() {
    setInterventions((prev) => [...prev, { title: "", frequency: "", notes: "" }]);
  }

  const isDirty = useMemo(() => {
    const s = savedRef.current;
    return (
      problemList !== s.problemList ||
      diagnosis !== s.diagnosis ||
      treatmentApproach !== s.treatmentApproach ||
      frequency !== s.frequency ||
      reviewDate !== s.reviewDate ||
      JSON.stringify(goals) !== JSON.stringify(s.goals) ||
      JSON.stringify(interventions) !== JSON.stringify(s.interventions)
    );
  }, [problemList, diagnosis, treatmentApproach, frequency, reviewDate, goals, interventions]);

  async function save() {
    if (!patientId || !canEdit) return;

    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const cleanedGoals = goals
        .filter((g) => g.title.trim())
        .map((g) => ({
          title: g.title.trim(),
          targetDate: g.targetDate?.trim() || "",
          status: (g.status as string) || "active",
        }));

      const cleanedInterventions = interventions
        .filter((it) => it.title.trim())
        .map((it) => ({
          title: it.title.trim(),
          frequency: it.frequency?.trim() || "",
          notes: it.notes?.trim() || "",
        }));

      const payload = {
        patientId,
        problemList: problemList.trim(),
        diagnosis: diagnosis.trim(),
        frequency: frequency.trim(),
        reviewDate: reviewDate.trim(),
        goals: cleanedGoals,
        interventions: cleanedInterventions,
        meta: { treatmentApproach: treatmentApproach.trim() },
      };

      const res = await api(`api/treatment-plans/${patientId}`, {
        method: "PUT",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify(payload),
      });

      if (res?.plan) applyPlan(res.plan);
      else applyPlan({ ...payload, meta: payload.meta });

      setLastSavedAt(res?.plan?.updatedAt || new Date().toISOString());
      setHasExisting(true);
      setEditing(false);
      setMsg("Treatment plan saved.");
    } catch (e: any) {
      setErr(e?.message || "Failed to save treatment plan.");
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    const s = savedRef.current;
    setProblemList(s.problemList);
    setDiagnosis(s.diagnosis);
    setTreatmentApproach(s.treatmentApproach);
    setFrequency(s.frequency);
    setReviewDate(s.reviewDate);
    setGoals(JSON.parse(JSON.stringify(s.goals)));
    setInterventions(JSON.parse(JSON.stringify(s.interventions)));
    setErr("");
    setMsg("");
    if (hasExisting) setEditing(false);
  }

  function startEdit() {
    setEditing(true);
    setErr("");
    setMsg("");
  }

  const patientName = patientInfo?.name || "—";
  const therapistName = therapistInfo?.name || "—";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#4b7eff] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            {lastSavedAt && (
              <span className="hidden sm:inline text-xs text-gray-500">
                Last saved {fmtTimestamp(lastSavedAt)}
              </span>
            )}
            {!loading && canEdit && hasExisting && !editing && (
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
              Treatment Plan
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {patientName === "—" ? "Treatment Plan" : `Plan · ${patientName}`}
              </h1>
              {patientInfo?.patientId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                  PT # {patientInfo.patientId}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-white/80">
              {therapistName !== "—" ? (
                <>
                  Owning therapist <span className="font-medium text-white">{therapistName}</span> · long-term treatment goals, interventions, and review cadence.
                </>
              ) : (
                <>Long-term treatment goals, interventions, and review cadence for this patient.</>
              )}
            </p>
          </div>

          {/* Context grid */}
          <div className="grid gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContextItem
              label="Patient"
              value={patientName}
              hint={patientInfo?.patientId ? `PT # ${patientInfo.patientId}` : undefined}
              loading={loading}
            />
            <ContextItem
              label="Therapist"
              value={therapistName}
              loading={loading}
            />
            <ContextItem
              label="Session frequency"
              value={frequency || "—"}
              loading={loading}
            />
            <ContextItem
              label="Planned sessions"
              value={reviewDate || "—"}
              loading={loading}
            />
          </div>
        </div>

        {/* Alerts */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
        )}
        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{msg}</div>
        )}

        {/* Body */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4b7eff]" />
            <p className="mt-3 text-sm text-gray-500">Loading treatment plan…</p>
          </div>
        ) : editing ? (
          <EditView
            canEdit={canEdit}
            hasExisting={hasExisting}
            isDirty={isDirty}
            saving={saving}
            problemList={problemList}
            setProblemList={setProblemList}
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            treatmentApproach={treatmentApproach}
            setTreatmentApproach={setTreatmentApproach}
            frequency={frequency}
            setFrequency={setFrequency}
            reviewDate={reviewDate}
            setReviewDate={setReviewDate}
            goals={goals}
            updateGoal={updateGoal}
            removeGoal={removeGoal}
            addGoal={addGoal}
            interventions={interventions}
            updateIntervention={updateIntervention}
            removeIntervention={removeIntervention}
            addIntervention={addIntervention}
            onSave={save}
            onDiscard={discardChanges}
          />
        ) : (
          <ReadOnlyView
            canEdit={canEdit}
            hasExisting={hasExisting}
            problemList={problemList}
            diagnosis={diagnosis}
            treatmentApproach={treatmentApproach}
            frequency={frequency}
            reviewDate={reviewDate}
            goals={goals}
            interventions={interventions}
            onEdit={startEdit}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Edit view ---------------- */

function EditView(props: {
  canEdit: boolean;
  hasExisting: boolean;
  isDirty: boolean;
  saving: boolean;
  problemList: string;
  setProblemList: (v: string) => void;
  diagnosis: string;
  setDiagnosis: (v: string) => void;
  treatmentApproach: string;
  setTreatmentApproach: (v: string) => void;
  frequency: string;
  setFrequency: (v: string) => void;
  reviewDate: string;
  setReviewDate: (v: string) => void;
  goals: Goal[];
  updateGoal: (i: number, patch: Partial<Goal>) => void;
  removeGoal: (i: number) => void;
  addGoal: () => void;
  interventions: Intervention[];
  updateIntervention: (i: number, patch: Partial<Intervention>) => void;
  removeIntervention: (i: number) => void;
  addIntervention: () => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const {
    canEdit, hasExisting, isDirty, saving,
    problemList, setProblemList, diagnosis, setDiagnosis,
    treatmentApproach, setTreatmentApproach,
    frequency, setFrequency, reviewDate, setReviewDate,
    goals, updateGoal, removeGoal, addGoal,
    interventions, updateIntervention, removeIntervention, addIntervention,
    onSave, onDiscard,
  } = props;

  return (
    <div className="space-y-6">
      {hasExisting && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          You are editing a saved treatment plan. Save to keep changes, or cancel to revert.
        </div>
      )}

      {/* Clinical picture */}
      <FormSection
        title="Clinical picture"
        description="Symptoms the patient is presenting with and the working diagnosis."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697A3.42 3.42 0 001.946 7.83a3.42 3.42 0 010 6.34 3.42 3.42 0 003.13 4.34l1.7-.005M12 6v6m0 0v6" />
          </svg>
        }
      >
        <RichField
          label="Problem list / symptoms"
          hint="Primary issues the patient is bringing to treatment. Use lists for multiple symptoms."
          value={problemList}
          onChange={setProblemList}
          disabled={!canEdit}
          rows={4}
        />

        <RichField
          label="Diagnosis"
          hint="Working diagnosis, including any rule-outs."
          value={diagnosis}
          onChange={setDiagnosis}
          disabled={!canEdit}
          rows={3}
        />
      </FormSection>

      {/* Approach & cadence */}
      <FormSection
        title="Approach & cadence"
        description="Treatment modality, session rhythm, and planned duration."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <RichField
          label="Treatment approach"
          hint="e.g., CBT, EMDR, psychodynamic, mixed. Use lists to outline phases or modules."
          value={treatmentApproach}
          onChange={setTreatmentApproach}
          disabled={!canEdit}
          rows={4}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Session frequency">
            <Input
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g., Weekly"
              disabled={!canEdit}
            />
          </Field>
          <Field label="Planned number of sessions">
            <Input
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              placeholder="e.g., 8"
              disabled={!canEdit}
            />
          </Field>
        </div>
      </FormSection>

      {/* Goals */}
      <FormSection
        title="Goals"
        description="Specific, measurable outcomes you and the patient are working toward."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.343 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
          </svg>
        }
      >
        {goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
            No goals yet. Add one to start tracking outcomes.
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((g, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Goal {i + 1}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeGoal(i)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Field label="Goal">
                      <Input
                        value={g.title}
                        onChange={(e) => updateGoal(i, { title: e.target.value })}
                        disabled={!canEdit}
                        placeholder="e.g., Reduce panic attacks to 1/week"
                      />
                    </Field>
                  </div>
                  <Field label="Target date">
                    <Input
                      type="date"
                      value={g.targetDate || ""}
                      onChange={(e) => updateGoal(i, { targetDate: e.target.value })}
                      disabled={!canEdit}
                    />
                  </Field>
                  <div className="sm:col-span-3">
                    <Field label="Status">
                      <select
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff] disabled:opacity-50 disabled:bg-gray-50"
                        value={g.status || "active"}
                        onChange={(e) => updateGoal(i, { status: e.target.value })}
                        disabled={!canEdit}
                      >
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                        <option value="paused">Paused</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {canEdit && (
          <button
            type="button"
            onClick={addGoal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#4b7eff]/40 bg-[#4b7eff]/5 px-3 py-2 text-xs font-medium text-[#4b7eff] hover:bg-[#4b7eff]/10 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add goal
          </button>
        )}
      </FormSection>

      {/* Interventions */}
      <FormSection
        title="Interventions"
        description="Techniques, homework, and tools applied between sessions."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      >
        {interventions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
            No interventions yet. Add one to start logging techniques.
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map((it, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Intervention {i + 1}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeIntervention(i)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Field label="Intervention">
                      <Input
                        value={it.title}
                        onChange={(e) => updateIntervention(i, { title: e.target.value })}
                        disabled={!canEdit}
                        placeholder="e.g., CBT thought record homework"
                      />
                    </Field>
                  </div>
                  <Field label="Frequency">
                    <Input
                      value={it.frequency || ""}
                      onChange={(e) => updateIntervention(i, { frequency: e.target.value })}
                      disabled={!canEdit}
                      placeholder="e.g., Daily"
                    />
                  </Field>
                  <div className="sm:col-span-3">
                    <RichField
                      label="Notes"
                      hint="Implementation notes, contraindications, modifications."
                      value={it.notes || ""}
                      onChange={(v) => updateIntervention(i, { notes: v })}
                      disabled={!canEdit}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {canEdit && (
          <button
            type="button"
            onClick={addIntervention}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#4b7eff]/40 bg-[#4b7eff]/5 px-3 py-2 text-xs font-medium text-[#4b7eff] hover:bg-[#4b7eff]/10 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add intervention
          </button>
        )}
      </FormSection>

      {/* Sticky action bar */}
      {canEdit && (
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
                onClick={onDiscard}
                disabled={(!isDirty && !hasExisting) || saving}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {hasExisting ? "Cancel" : "Discard"}
              </button>
              <Button onClick={onSave} disabled={saving || !isDirty}>
                {saving ? "Saving…" : "Save plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Read-only view ---------------- */

function ReadOnlyView({
  canEdit,
  hasExisting,
  problemList,
  diagnosis,
  treatmentApproach,
  frequency,
  reviewDate,
  goals,
  interventions,
  onEdit,
}: {
  canEdit: boolean;
  hasExisting: boolean;
  problemList: string;
  diagnosis: string;
  treatmentApproach: string;
  frequency: string;
  reviewDate: string;
  goals: Goal[];
  interventions: Intervention[];
  onEdit: () => void;
}) {
  if (!hasExisting) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4b7eff]/10 text-[#4b7eff]">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-800">No treatment plan yet</p>
        <p className="mt-1 text-xs text-gray-500">
          {canEdit ? "Create a plan to capture goals and interventions." : "Your therapist has not created a plan for this patient yet."}
        </p>
        {canEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:brightness-95 transition-all"
          >
            Create treatment plan
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Clinical picture"
        description="Symptoms and working diagnosis."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697A3.42 3.42 0 001.946 7.83a3.42 3.42 0 010 6.34 3.42 3.42 0 003.13 4.34l1.7-.005M12 6v6m0 0v6" />
          </svg>
        }
      >
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700">Problem list / symptoms</p>
          <RichView value={problemList} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700">Diagnosis</p>
          <RichView value={diagnosis} />
        </div>
      </FormSection>

      <FormSection
        title="Approach & cadence"
        description="Modality, frequency, and planned duration."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700">Treatment approach</p>
          <RichView value={treatmentApproach} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadField label="Session frequency" value={frequency} />
          <ReadField label="Planned number of sessions" value={reviewDate} />
        </div>
      </FormSection>

      <FormSection
        title="Goals"
        description="Outcomes you and the patient are working toward."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.343 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
          </svg>
        }
      >
        {goals.filter((g) => g.title?.trim()).length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-sm italic text-gray-400">
            No goals recorded
          </p>
        ) : (
          <ul className="space-y-2">
            {goals
              .filter((g) => g.title?.trim())
              .map((g, i) => (
                <li key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{g.title}</p>
                    <StatusPill status={g.status} />
                  </div>
                  {g.targetDate && (
                    <p className="mt-1 text-xs text-gray-500">Target {g.targetDate}</p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </FormSection>

      <FormSection
        title="Interventions"
        description="Techniques and homework applied between sessions."
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      >
        {interventions.filter((it) => it.title?.trim()).length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-sm italic text-gray-400">
            No interventions recorded
          </p>
        ) : (
          <ul className="space-y-2">
            {interventions
              .filter((it) => it.title?.trim())
              .map((it, i) => (
                <li key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{it.title}</p>
                    {it.frequency && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
                        {it.frequency}
                      </span>
                    )}
                  </div>
                  {it.notes && (
                    <div
                      className="rich-content mt-1 text-xs leading-relaxed text-gray-600"
                      dangerouslySetInnerHTML={{ __html: it.notes }}
                    />
                  )}
                </li>
              ))}
          </ul>
        )}
      </FormSection>

      {canEdit && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:brightness-95 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit plan
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

function ContextItem({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {loading ? (
        <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-900 truncate">{value}</p>
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
