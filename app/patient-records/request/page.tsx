// "use client";
// import Protected from "@/components/Protected";
// import TherapistPicker from "@/components/TherapistPicker";
// import Input from "@/components/Input";
// import Button from "@/components/Button";
// import { useAuth } from "@/lib/auth";
// import { api, authHeader } from "@/lib/api";
// import { useState } from "react";

// export default function RequestRecordPage() {
//     return (
//         <Protected>
//             <RequestForm />
//         </Protected>
//     );
// }

// function RequestForm() {
//     const { token } = useAuth();
//     const [patientId, setPatientId] = useState("");
//     const [therapistId, setTherapistId] = useState("");
//     const [msg, setMsg] = useState("");
//     const [err, setErr] = useState("");

//     async function submit() {
//         try {
//             await api(`/patient-records/requests`, {
//                 method: "POST",
//                 headers: {
//                     ...authHeader(token || undefined),
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({ patientId, fromTherapistId: therapistId, content: "Continuity of care" }),
//             });
//             setMsg("Request sent successfully.");
//             setErr("");
//         } catch (e: any) {
//             setErr(e.message);
//         }
//     }

//     return (
//         <div className="max-w-xl mx-auto p-6 space-y-4">
//             <h1 className="text-xl font-semibold">Request Previous Records</h1>
//             {msg && <p className="text-green-600 text-sm">{msg}</p>}
//             {err && <p className="text-red-600 text-sm">{err}</p>}
//             <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID" />
//             <TherapistPicker value={therapistId} onChange={(id) => setTherapistId(id)} />
//             <Button onClick={submit}>Send Request</Button>
//         </div>
//     );
// }


// app/patient-records/request/page.tsx
"use client";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import TherapistPicker from "@/components/TherapistPicker";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import { useMemo, useState } from "react";

export default function RequestRecordPage() {
  return (
    <Protected>
      <RoleGuard roles={["therapist"]}>
        <RequestForm />
      </RoleGuard>
    </Protected>
  );
}

function RequestForm() {
  const { token } = useAuth();

  const [patientId, setPatientId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [reason, setReason] = useState("Continuity of care");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => patientId.trim().length > 0 && therapistId.trim().length > 0,
    [patientId, therapistId]
  );

  async function submit() {
    setErr("");
    setMsg("");
    if (!canSubmit) {
      setErr("Please enter a valid Patient ID and select the previous therapist.");
      return;
    }
    setLoading(true);
    try {
      await api(`/patient-records/send/requests`, {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ patientId, fromTherapistId: therapistId, content: reason }),
      });
      setMsg("Request sent successfully.");
      setErr("");
    } catch (e: any) {
      setErr(e.message || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Request previous records</h1>
      <p className="mt-1 text-sm text-gray-600">
        Ask the patient’s previous therapist to share clinical notes. A superAdmin may also review the request.
      </p>

      {/* Alerts */}
      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Card */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900">Request details</p>
          <p className="text-xs text-gray-500">Provide the patient ID and select the previous therapist.</p>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Patient ID</label>
            <Input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. patient ObjectId or short ID"
            />
            <p className="mt-1 text-xs text-gray-500">Paste the patient’s database ID or short ID used in your system.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Previous therapist</label>
            <TherapistPicker value={therapistId} onChange={setTherapistId} />
            {!!therapistId && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-600">Therapist selected</p>
                <code className="rounded bg-white px-2 py-1 text-[10px] text-gray-700">{therapistId}</code>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Reason (optional)</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you’re requesting access (e.g., continuity of care, treatment planning)."
            />
          </div>

          <div className="flex items-center justify-end">
            <Button onClick={submit}
            
            disabled={!canSubmit || loading}>
              {loading ? "Sending…" : "Send request"}
            </Button>
          </div>
        </div>
      </div>

      {/* Small footer tip */}
      <p className="mt-4 text-xs text-gray-500">
        After approval, you’ll be able to view shared notes in the patient’s record. You can track status under
        <span className="mx-1 font-medium">Patient Records → Record Requests</span>.
      </p>
    </div>
  );
}
