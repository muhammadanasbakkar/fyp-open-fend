"use client";

import Protected from "@/components/Protected";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Goal = { title: string; targetDate?: string; status?: "active" | "done" | "paused" | string };
type Intervention = { title: string; frequency?: string; notes?: string };

export default function TreatmentPlanPage() {
  return (
    <Protected>
      <TreatmentPlanInner />
    </Protected>
  );
}

function TreatmentPlanInner() {
  const { token, user } = useAuth();
  const role = user?.role;

  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const canEdit = role === "therapist" || role === "admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Plan fields
  const [problemList, setProblemList] = useState(""); // main issues
  const [diagnosis, setDiagnosis] = useState("");
  const [goals, setGoals] = useState<Goal[]>([{ title: "", targetDate: "", status: "active" }]);
  const [interventions, setInterventions] = useState<Intervention[]>([{ title: "", frequency: "", notes: "" }]);
  const [frequency, setFrequency] = useState(""); // sessions frequency
  const [reviewDate, setReviewDate] = useState("");
  const [treatmentApproach, setTreatmentApproach] = useState("");


  async function load() {
    if (!patientId) return;
    setLoading(true);
    setErr("");
    setMsg("");

    try {
      const res = await api(`api/treatment-plans/${patientId}`, {
        headers: authHeader(token || undefined),
      } as RequestInit);


      console.log(res)
      const p = res?.plan || res;

      setProblemList(p?.problemList || "");
      setDiagnosis(p?.diagnosis || "");
      setFrequency(p?.frequency || "");
      setReviewDate(p?.reviewDate || "");
      setGoals(Array.isArray(p?.goals) && p.goals.length ? p.goals : [{ title: "", targetDate: "", status: "active" }]);
      setInterventions(
        Array.isArray(p?.interventions) && p.interventions.length
          ? p.interventions
          : [{ title: "", frequency: "", notes: "" }]
      );
    } catch {
      // If no plan exists yet, just show blank form
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
  function updateIntervention(i: number, patch: Partial<Intervention>) {
    setInterventions((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function save() {
    if (!patientId) return;
    if (!canEdit) return;

    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const payload = {
        patientId,
        problemList: problemList.trim(),
        diagnosis: diagnosis.trim(),
        frequency: frequency.trim(),
        reviewDate: reviewDate.trim(),
        goals: goals.filter((g) => g.title.trim()).map((g) => ({
          title: g.title.trim(),
          targetDate: g.targetDate?.trim() || "",
          status: g.status || "active",
        })),
        interventions: interventions.filter((it) => it.title.trim()).map((it) => ({
          title: it.title.trim(),
          frequency: it.frequency?.trim() || "",
          notes: it.notes?.trim() || "",
        })),
      };

      await api(`api/treatment-plans/${patientId}`, {
        method: "PUT",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify(payload),
      });

      setMsg("Treatment plan saved.");
    } catch (e: any) {
      setErr(e.message || "Failed to save treatment plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Treatment Plan</h1>
          <p className="mt-1 text-sm text-gray-600">Patient ID: {patientId}</p>
          <p className="mt-1 text-sm text-gray-600">Therapist Name: {patientId}</p>
        </div>

        {canEdit && (
          <Button onClick={save} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      )}
      {msg && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{msg}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border bg-white p-6">Loading...</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Symptoms</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={problemList}
              onChange={(e) => setProblemList(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Diagnosis</label>
           <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Treatment Approach</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={treatmentApproach}
              onChange={(e) => setTreatmentApproach(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Session frequency</label>
              <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g., Weekly" disabled={!canEdit} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Planned number of sessions to achieve goals</label>
              <Input value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} placeholder="08" disabled={!canEdit} />
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Goals</h2>
              {canEdit && (
                <button
                  className="text-xs text-[var(--brand,#4b7eff)] underline"
                  onClick={() => setGoals((prev) => [...prev, { title: "", targetDate: "", status: "active" }])}
                  type="button"
                >
                  + Add goal
                </button>
              )}
            </div>

            {goals.map((g, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-gray-600">Goal</label>
                    <Input
                      value={g.title}
                      onChange={(e) => updateGoal(i, { title: e.target.value })}
                      disabled={!canEdit}
                      placeholder="e.g., Reduce panic attacks to 1/week"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Target date</label>
                    <Input
                      value={g.targetDate || ""}
                      onChange={(e) => updateGoal(i, { targetDate: e.target.value })}
                      disabled={!canEdit}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs text-gray-600">Status</label>
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={g.status || "active"}
                      onChange={(e) => updateGoal(i, { status: e.target.value })}
                      disabled={!canEdit}
                    >
                      <option value="active">Active</option>
                      <option value="done">Done</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interventions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Interventions</h2>
              {canEdit && (
                <button
                  className="text-xs text-[var(--brand,#4b7eff)] underline"
                  onClick={() => setInterventions((prev) => [...prev, { title: "", frequency: "", notes: "" }])}
                  type="button"
                >
                  + Add intervention
                </button>
              )}
            </div>

            {interventions.map((it, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-gray-600">Intervention</label>
                    <Input
                      value={it.title}
                      onChange={(e) => updateIntervention(i, { title: e.target.value })}
                      disabled={!canEdit}
                      placeholder="e.g., CBT thought record homework"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Frequency</label>
                    <Input
                      value={it.frequency || ""}
                      onChange={(e) => updateIntervention(i, { frequency: e.target.value })}
                      disabled={!canEdit}
                      placeholder="e.g., Daily"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs text-gray-600">Notes</label>
                    <textarea
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      rows={3}
                      value={it.notes || ""}
                      onChange={(e) => updateIntervention(i, { notes: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
