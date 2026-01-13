"use client";

import Protected from "@/components/Protected";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

function AssessmentInner() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();

  const appointmentId = params?.id;
  const patientId = sp.get("patientId") || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Minimal assessment fields (expand later)
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [presentingProblem, setPresentingProblem] = useState("");
  const [initialAssessment, setInitialAssessment] = useState("");

  useEffect(() => {
    (async () => {
      if (!appointmentId) return;
      setLoading(true);
      setErr("");

      try {
        // Optional: load existing assessment (only if backend route exists)
        const res = await api(`api/assessments/by-appointment/${appointmentId}`, {
          headers: authHeader(token || undefined),
        } as RequestInit);

        if (res?.assessment) {
          setChiefComplaint(res.assessment.chiefComplaint || "");
          setPresentingProblem(res.assessment.presentingProblem || "");
          setInitialAssessment(res.assessment.initialAssessment || "");
        }
      } catch {
        // ignore if none exists
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId, token]);

  async function save() {
    if (!appointmentId) return;

    setErr("");
    setMsg("");

    try {
      await api(`api/assessments`, {
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

      setMsg("Assessment saved.");
    } catch (e: any) {
      setErr(e.message || "Failed to save assessment.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assessment</h1>
        <p className="mt-1 text-sm text-gray-600">
          Appointment: <span className="font-medium">{appointmentId}</span><br />
          Patient Id: <span className="font-medium">{appointmentId}</span><br />
          Therapist Name: <span className="font-medium">{appointmentId}</span><br />
        </p>
      </div>

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

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">Loading…</div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Chief complaint
            </label>
            <Input
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., anxiety, low mood, insomnia…"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Date
            </label>
            {/* <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={4}
              value={presentingProblem}
              onChange={(e) => setPresentingProblem(e.target.value)}
            /> */}
            <Input
              type="date"
              value={presentingProblem}
              onChange={(e) => setPresentingProblem(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Session Summary
            </label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={5}
              value={initialAssessment}
              onChange={(e) => setInitialAssessment(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
