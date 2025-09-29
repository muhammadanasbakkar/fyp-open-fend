// app/patient-records/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import Button from "@/components/Button";
import Input from "@/components/Input";

type Patient = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  patientId?: string; // e.g. PT-2025-000123
};

type Note = {
  _id: string;
  author?: { _id: string; name?: string; role?: string } | string;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

export default function PatientRecordPage() {
  return (
    <Protected>
      <PatientRecordInner />
    </Protected>
  );
}

function PatientRecordInner() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id;
  const { token, user } = useAuth();
  const role = user?.role;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // add note state
  const [noteBody, setNoteBody] = useState("");
  const [adding, setAdding] = useState(false);

  const canWrite = role === "therapist" || role === "superAdmin";


  async function load() {
    if (!patientId) return;
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      // Adjust endpoints to match your backend
      // Expect response like: { patient: {...}, notes: [...] }
      const res = await api(`api/patient-records/${patientId}`, {
        headers: authHeader(token || undefined),
      });


      setPatient(res?.patient || null);
      setNotes(Array.isArray(res?.notes) ? res.notes : []);
    } catch (e: any) {
      setErr(e.message || "Failed to load patient record.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, token]);

  async function addNote() {
    if (!noteBody.trim()) return;
    setErr("");
    setMsg("");
    setAdding(true);
    try {
      const res = await api(`api/patient-records/${patientId}/notes`, {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: noteBody.trim() }),
      });
      // Prepend new note to the list
      if (res && res._id) {
        setNotes((prev) => [{ ...res }, ...prev]);
      } else {
        // Fallback: reload
        await load();
      }
      setNoteBody("");
      setMsg("Note added.");
    } catch (e: any) {
      setErr(e.message || "Could not add note.");
    } finally {
      setAdding(false);
    }
  }

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notes]
  );

  const avatar = patient?.profilePicture || "/default-avatar.png";
  const displayName = patient?.name || patient?.email || patient?.phone || "Patient";
  const ptCode = patient?.patientId ? patient.patientId : "—";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header / Patient Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-72 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* <img
              src={avatar}
              alt={displayName}
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200"
            /> */}
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>
                  <span className="text-gray-500">Patient ID:</span>{" "}
                  <span className="font-medium">{ptCode}</span>
                </span>
                {patient?.email && <span>{patient.email}</span>}
                {patient?.phone && <span>{patient.phone}</span>}
              </div>
            </div>
          </div>
        )}
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

      {/* Add note (therapists only) */}
      {canWrite && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-900">Add note</p>
          <p className="mb-3 text-xs text-gray-600">
            Notes are visible to the care team. Avoid PII beyond clinical relevance.
          </p>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={5}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Session summary, observations, treatment plan, etc."
          />
          <div className="mt-3">
            <Button onClick={addNote} disabled={adding || !noteBody.trim()}>
              {adding ? "Saving…" : "Save note"}
            </Button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">Notes</p>
          <p className="text-xs text-gray-500">
            {sortedNotes.length ? `${sortedNotes.length} total` : "None yet"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-gray-50 p-3">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-full rounded bg-gray-200" />
                <div className="mt-1 h-3 w-5/6 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : sortedNotes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((n) => (
              <div key={n._id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {formatDate(n.createdAt)}
                    {n.updatedAt && n.updatedAt !== n.createdAt
                      ? ` (edited ${formatDate(n.updatedAt)})`
                      : ""}
                  </span>
                  <span className="truncate">
                    {typeof n.author === "string"
                      ? n.author
                      : n.author?.name || n.author?._id || "—"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dt: string | Date) {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
