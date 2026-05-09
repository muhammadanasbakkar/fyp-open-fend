"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import Button from "@/components/Button";
import { cleanTranscript } from "@/utils/cleanTranscript";
import { useSpeechToText } from "@/app/hooks/useSpeechToText";
import ChatGPTComposer from "@/components/ChatGPTComposer";

type Patient = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  patientId?: string;
};

type NoteRaw = any;

type NoteComment = {
  _id?: string;
  author?: string;
  authorName?: string;
  authorRole?: "therapist" | "supervisor";
  text: string;
  createdAt?: string;
};

type SoapNote = {
  _id: string;
  author?: { _id: string; name?: string; role?: string } | string;

  // SOAP
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;

  additionalNotes?: string;

  // legacy fallback
  body?: string;
  diagnosis?: string;
  treatment?: string;
  activity?: string;

  createdAt: string;
  updatedAt?: string;

  // Private therapist↔supervisor thread on this note.
  comments?: NoteComment[];
};

export default function PatientRecordPage() {
  return (
    <Protected>
      <PatientRecordInner />
    </Protected>
  );
}

/**
 * Parse free text into SOAP buckets if user speaks like:
 * "Subjective: ... Objective: ... Assessment: ... Plan: ... Additional: ..."
 */
function parseSoapFromText(raw: string) {
  const text = cleanTranscript(raw || "").trim();
  if (!text) {
    return { subjective: "", objective: "", assessment: "", plan: "", additionalNotes: "", residual: "" };
  }

  let t = text.replace(/\s+/g, " ").trim();

  // Match labels even in narrative form:
  // "Subjective of patient was ..."
  // "as per his objective he was ..."
  // "assessment on ..."
  // "plan of treatment was ..."
  const SUBJECTIVE_RE =
    /\bsubjective\b(?:\s+(?:of|for)\s+(?:the\s+)?patient)?(?:\s+(?:he|she|they|patient|client|his|her|their))?\s*(?:(?::|-|—|=)\s*|\b(?:is|was|are|were)\b\s*)/i;

  const OBJECTIVE_RE =
    /\bobjective\b(?:\s+(?:of|for)\s+(?:the\s+)?patient)?(?:\s+(?:he|she|they|patient|client|his|her|their))?\s*(?:(?::|-|—|=)\s*|\b(?:is|was|are|were)\b\s*)/i;

  const ASSESSMENT_RE =
    /\bassessment\b(?:\s+(?:of|for|on))?(?:\s+(?:the\s+)?patient)?(?:\s+(?:he|she|they|patient|client|his|her|their))?\s*(?:(?::|-|—|=)\s*|\b(?:is|was|are|were)\b\s*)/i;

  const PLAN_RE =
    /\bplan\b(?:\s+of\s+treatment)?(?:\s+(?:for|of)\s+(?:the\s+)?patient)?(?:\s+(?:he|she|they|patient|client|his|her|their))?\s*(?:(?::|-|—|=)\s*|\b(?:is|was|are|were)\b\s*)/i;

  type Key = "subjective" | "objective" | "assessment" | "plan";
  const patterns: { key: Key; re: RegExp }[] = [
    { key: "subjective", re: SUBJECTIVE_RE },
    { key: "objective", re: OBJECTIVE_RE },
    { key: "assessment", re: ASSESSMENT_RE },
    { key: "plan", re: PLAN_RE },
  ];

  // Find all occurrences (anywhere in the paragraph)
  const hits: { key: Key; start: number; after: number }[] = [];
  for (const p of patterns) {
    const r = new RegExp(p.re.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = r.exec(t)) !== null) {
      hits.push({ key: p.key, start: m.index, after: r.lastIndex });
      // prevent infinite loops on zero-length
      if (m.index === r.lastIndex) r.lastIndex++;
    }
  }

  // If nothing matched, don't guess
  if (!hits.length) {
    return { subjective: "", objective: "", assessment: "", plan: "", additionalNotes: "", residual: t };
  }

  // Sort by position and slice until next hit
  hits.sort((a, b) => a.start - b.start);

  const append = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b || "");

  let subjective = "";
  let objective = "";
  let assessment = "";
  let plan = "";

  const covered: [number, number][] = [];

  for (let i = 0; i < hits.length; i++) {
    const h = hits[i];
    const end = i + 1 < hits.length ? hits[i + 1].start : t.length;

    let content = t.slice(h.after, end).trim();
    content = content.replace(/^[\s.,;:\-—=]+/, "").trim();
    if (!content) continue;

    if (h.key === "subjective") subjective = append(subjective, content);
    if (h.key === "objective") objective = append(objective, content);
    if (h.key === "assessment") assessment = append(assessment, content);
    if (h.key === "plan") plan = append(plan, content);

    covered.push([h.start, end]);
  }

  // Build residual by blanking covered ranges
  let residual = "";
  if (covered.length) {
    const chars = t.split("");
    for (const [s, e] of covered) {
      for (let i = s; i < e; i++) chars[i] = " ";
    }
    residual = chars.join("").replace(/\s+/g, " ").trim();
  }

  return {
    subjective: subjective.trim(),
    objective: objective.trim(),
    assessment: assessment.trim(),
    plan: plan.trim(),
    additionalNotes: "",
    residual,
  };
}



function fmtCommentTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── private therapist↔supervisor thread under a single note ───────────────────
function NoteCommentThread({
  patientId,
  therapistId,
  noteId,
  comments,
  token,
  onCommentAdded,
}: {
  patientId: string;
  therapistId: string;
  noteId: string;
  comments: NoteComment[];
  token: string | null;
  onCommentAdded: (c: NoteComment) => void;
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
        `api/record-requests/notes/${patientId}/${therapistId}/${noteId}/comment`,
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

function PatientRecordInner() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const { token, user } = useAuth();
  const role = user?.role;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<SoapNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // SOAP form state
  const [noteBody, setNoteBody] = useState(""); // free text / dictation scratchpad
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [autoStructure, setAutoStructure] = useState(true);
  const [showStructured, setShowStructured] = useState(true);

  const [adding, setAdding] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);
  const [summary, setSummary] = useState<any | null>(null);

  // When non-null, the SOAP form below is editing this existing note instead
  // of creating a new one. Save will PATCH /notes/:noteId; Cancel clears it.
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const canWrite = role === "therapist";

  function startEditNote(n: SoapNote) {
    if (!n._id) return;
    setEditingNoteId(String(n._id));
    setSubjective(n.subjective || "");
    setObjective(n.objective || "");
    setAssessment(n.assessment || "");
    setPlan(n.plan || "");
    setAdditionalNotes(n.additionalNotes || "");
    setNoteBody(n.body || "");
    setErr("");
    setMsg("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function cancelEditNote() {
    setEditingNoteId(null);
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
    setAdditionalNotes("");
    setNoteBody("");
  }

  // Note: records are auto-shared with the therapist's supervisor — no opt-in step.

  // Speech-to-text
  const [sttLang, setSttLang] = useState("en-US");
  const {
    supported: sttSupported,
    listening,
    error: sttError,
    interim,
    finalText,
    start: sttStart,
    stop: sttStop,
    setLang: sttSetLang,
  } = useSpeechToText({ lang: sttLang, continuous: true, interimResults: true });

  const baseAtStartRef = useRef<string>("");
  const prevListeningRef = useRef<boolean>(false);
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  async function anonymizeText(text: string): Promise<string> {
    try {
      const res: any = await api("api/chatbot/anonymize", {
        method: "POST",
        headers: {
          ...(authHeader(tokenRef.current || undefined) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      return res?.anonymized || text;
    } catch {
      return text;
    }
  }

  useEffect(() => {
    if (listening && !prevListeningRef.current) {
      baseAtStartRef.current = noteBody;
    }
    prevListeningRef.current = listening;
  }, [listening, noteBody]);

  useEffect(() => {
    if (!listening) return;
    const base = baseAtStartRef.current?.trim() || "";
    const f = (finalText || "").trim();
    const i = (interim || "").trim();
    const combined = [base, f, i].filter(Boolean).join(" ").replace(/\s+/g, " ");
    if (combined !== noteBody) setNoteBody(combined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText, interim, listening]);

  useEffect(() => {
    const wasListening = prevListeningRef.current;
    if (wasListening && !listening) {
      const cleaned = cleanTranscript(noteBody);
      setNoteBody(cleaned);

      if (autoStructure) {
        const append = (oldV: string, newV: string) =>
          oldV && newV ? `${oldV} ${newV}` : oldV || newV || "";

        // Anonymize names/identifiers first, then auto-structure into SOAP
        (async () => {
          setAnonymizing(true);
          let textToStructure = cleaned;
          try {
            textToStructure = await anonymizeText(cleaned);
            setNoteBody(textToStructure);
          } catch {
            // silently fall back to original
          } finally {
            setAnonymizing(false);
          }

          const parsed = parseSoapFromText(textToStructure);
          setSubjective((old) => append(old, parsed.subjective));
          setObjective((old) => append(old, parsed.objective));
          setAssessment((old) => append(old, parsed.assessment));
          setPlan((old) => append(old, parsed.plan));
          setAdditionalNotes((old) => append(old, parsed.additionalNotes));
          setNoteBody(parsed.residual);
          setShowStructured(true);
        })();
      }
    }
    prevListeningRef.current = listening;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, autoStructure]);


  function normalizeNotes(raw: NoteRaw[]): SoapNote[] {
    return (Array.isArray(raw) ? raw : [])
      .filter(Boolean)
      .map((n, i) => {
        const id =
          n?._id ?? n?.id ?? n?.noteId ?? `${n?.createdAt ?? n?.date ?? "no-date"}-${i}`;
        const created = n?.createdAt ?? n?.date ?? new Date().toISOString();

        // Prefer SOAP if present, else map legacy -> SOAP for display.
        const subj = (n?.subjective ?? "").trim();
        const obj = (n?.objective ?? "").trim();
        const assess = (n?.assessment ?? n?.diagnosis ?? "").trim();
        const plan = (n?.plan ?? n?.treatment ?? n?.activity ?? "").trim();

        return {
          _id: String(id),
          author: n?.author,
          subjective: subj || undefined,
          objective: obj || undefined,
          assessment: assess || undefined,
          plan: plan || undefined,
          additionalNotes: (n?.additionalNotes ?? "").trim() || undefined,

          // keep raw legacy too
          diagnosis: n?.diagnosis || undefined,
          treatment: n?.treatment || undefined,
          activity: n?.activity || undefined,
          body: n?.body || n?.content || undefined,

          createdAt: String(created),
          updatedAt: n?.updatedAt ? String(n.updatedAt) : undefined,
          comments: Array.isArray(n?.comments) ? n.comments : [],
        };
      });
  }

  async function load() {
    if (!patientId) return;
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const sum = await api(`api/patient-records/${patientId}/summary`, {
        headers: authHeader(token || undefined) as HeadersInit,
      }).catch(() => null);
      setSummary(sum || null);

      const res = await api(`api/patient-records/${patientId}`, {
        headers: authHeader(token || undefined) as HeadersInit,
      });

      const p = res?.patient ?? res?.record?.patient ?? null;
      const rawNotes =
        (Array.isArray(res?.notes) ? res.notes : null) ??
        (Array.isArray(res?.record?.notes) ? res.record.notes : []) ??
        [];

      setPatient(p);
      setNotes(normalizeNotes(rawNotes));
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

  async function sendChatMessage() {
  if (!noteBody.trim()) return;

  setErr("");
  setMsg("");

  const cleaned = cleanTranscript(noteBody);

  if (autoStructure) {
    const parsed = parseSoapFromText(cleaned);

    const append = (oldV: string, newV: string) =>
      oldV && newV ? `${oldV} ${newV}` : oldV || newV || "";

    // Fill SOAP fields automatically
    setSubjective((old) => append(old, parsed.subjective));
    setObjective((old) => append(old, parsed.objective));
    setAssessment((old) => append(old, parsed.assessment));
    setPlan((old) => append(old, parsed.plan));
    setAdditionalNotes((old) => append(old, parsed.additionalNotes));

    // leftover text stays in scratch
    setNoteBody(parsed.residual);
  }

  // Save note to backend
  await addNote();
}


  const atLeastOneFilled = useMemo(() => {
    return (
      noteBody.trim() ||
      subjective.trim() ||
      objective.trim() ||
      assessment.trim() ||
      plan.trim() ||
      additionalNotes.trim()
    );
  }, [noteBody, subjective, objective, assessment, plan, additionalNotes]);

  async function addNote() {
    if (!patientId) return;
    if (!atLeastOneFilled) {
      setErr("Please enter at least one field.");
      return;
    }
    setErr("");
    setMsg("");
    setAdding(true);

    try {
      // For an edit we always send every field (including empty ones) so that
      // clearing a field actually clears it server-side. For a brand-new note
      // we only send populated fields to keep the payload tight.
      const isEdit = !!editingNoteId;
      const payload: any = {};

      if (isEdit) {
        payload.subjective = subjective.trim();
        payload.objective = objective.trim();
        payload.assessment = assessment.trim();
        payload.plan = plan.trim();
        payload.additionalNotes = additionalNotes.trim();
        payload.body = noteBody.trim();
        // legacy mirror fields (the backend accepts both new + legacy keys)
        payload.diagnosis = assessment.trim();
        payload.treatment = plan.trim();
      } else {
        if (subjective.trim()) payload.subjective = subjective.trim();
        if (objective.trim()) payload.objective = objective.trim();
        if (assessment.trim()) payload.assessment = assessment.trim();
        if (plan.trim()) payload.plan = plan.trim();
        if (additionalNotes.trim()) payload.additionalNotes = additionalNotes.trim();

        // keep legacy compatibility with your CURRENT backend controller:
        // it expects objective/diagnosis/treatment/activity/body (see controller.patientRecord.js) :contentReference[oaicite:2]{index=2}
        if (assessment.trim()) payload.diagnosis = assessment.trim();
        if (plan.trim()) payload.treatment = plan.trim();
        // activity is optional; if you want a separate activity UI later, split plan into treatment/activity.
        // For now, don't force activity unless you want:
        // payload.activity = "";

        if (noteBody.trim()) payload.body = noteBody.trim(); // scratch / legacy free-text
      }

      const url = isEdit
        ? `api/patient-records/${patientId}/notes/${editingNoteId}`
        : `api/patient-records/${patientId}/notes`;

      await api(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify(payload),
      });

      setNoteBody("");
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
      setAdditionalNotes("");
      setEditingNoteId(null);

      setMsg(isEdit ? "SOAP note updated." : "SOAP note added.");
      await load();
    } catch (e: any) {
      setErr(e.message || "Could not save note.");
    } finally {
      setAdding(false);
    }
  }

  const sortedNotes = useMemo(() => {
    const withDates = (notes || []).filter(Boolean).map((n, i) => ({
      ...n,
      createdAt: n.createdAt || new Date(0).toISOString(),
      _i: i,
    }));
    return withDates.sort((a, b) => {
      const d = +new Date(b.createdAt) - +new Date(a.createdAt);
      return d !== 0 ? d : a._i - b._i;
    });
  }, [notes]);

  const displayName = patient?.name || patient?.email || patient?.phone || "Patient";
  const ptCode =
    patient?.patientId ?? summary?.patient?.patientId ?? summary?.patient?.ptNumber ?? "—";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
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
            <div className="min-w-0 flex-1">
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
            {canWrite && (
              <span
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                title="Records are automatically visible to your supervisor"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Auto-shared with supervisor
              </span>
            )}
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

      {/* Add / Edit SOAP note */}
      {canWrite && (
        <div
          className={[
            "rounded-2xl border bg-white shadow-sm transition-colors",
            editingNoteId
              ? "border-amber-300 ring-1 ring-amber-200/60"
              : "border-gray-100",
          ].join(" ")}
        >
          {/* Header strip */}
          <div
            className={[
              "flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b px-5 py-3",
              editingNoteId
                ? "border-amber-200 bg-amber-50/60"
                : "border-gray-100 bg-gradient-to-r from-[#4b7eff]/5 to-transparent",
            ].join(" ")}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  editingNoteId
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-[#4b7eff]/10 text-[#4b7eff]",
                ].join(" ")}
                aria-hidden
              >
                {editingNoteId ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </span>
              <p className="text-sm font-semibold text-gray-900">
                {editingNoteId ? "Edit SOAP note" : "Add SOAP note"}
              </p>
              {editingNoteId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Editing
                </span>
              )}
            </div>
          </div>

          <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 sr-only">
              {editingNoteId ? "Edit SOAP note" : "Add SOAP note"}
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={autoStructure}
                  onChange={(e) => setAutoStructure(e.target.checked)}
                />
                Auto-structure after dictation
              </label>

              {sttSupported ? (
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                    listening
                      ? "border-[var(--brand,#4b7eff)] text-[var(--brand,#4b7eff)]"
                      : "border-gray-300 text-gray-600",
                  ].join(" ")}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full animate-pulse"
                    style={{ background: listening ? "var(--brand,#4b7eff)" : "#9ca3af" }}
                  />
                  {listening ? "Mic on" : "Mic off"}
                </span>
              ) : (
                <span className="text-xs text-amber-700">Speech not supported.</span>
              )}
            </div>
          </div>

          {anonymizing && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              Anonymizing names and identifiers with AI…
            </div>
          )}

          {/* <p className="mb-3 mt-1 text-xs text-gray-600">
            Dictate freely — names and identifiers will be anonymized automatically, then structured into SOAP.
          </p> */}

          {/* <label className="mb-1 block text-sm text-gray-700">Scratch / Dictation text</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={5}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder='Example: "Subjective: feels better. Objective: calm. Assessment: GAD improving. Plan: CBT homework."'
          /> */}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            {/* <div className="flex items-center gap-2">
              <label>Dictate language</label>
              <select
                className="rounded border px-2 py-1 text-xs"
                value={sttLang}
                onChange={(e) => {
                  setSttLang(e.target.value);
                  sttSetLang(e.target.value);
                }}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="ur-PK">Urdu (Pakistan)</option>
                <option value="hi-IN">Hindi (India)</option>
              </select>

              {sttSupported && (listening ? (
                <Button onClick={sttStop}>⏹ Stop</Button>
              ) : (
                <Button onClick={sttStart}>🎙 Start</Button>
              ))}

              {sttError && <span className="text-red-600">Mic error: {sttError}</span>}
            </div> */}

            <div className="flex items-center gap-3">
              {/* <button
                type="button"
                onClick={() => setNoteBody(cleanTranscript(noteBody))}
                className="text-[var(--brand,#4b7eff)] hover:underline"
              >
                Clean up text
              </button>

              <button
                type="button"
                disabled={anonymizing || !noteBody.trim()}
                onClick={async () => {
                  if (!noteBody.trim()) return;
                  setAnonymizing(true);
                  try {
                    const anonymized = await anonymizeText(noteBody);
                    setNoteBody(anonymized);
                  } finally {
                    setAnonymizing(false);
                  }
                }}
                className="text-violet-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {anonymizing ? "Anonymizing…" : "🔒 Anonymize names"}
              </button> */}

              {/* <button
                type="button"
                onClick={() => {
                  const parsed = parseSoapFromText(noteBody);

                  const append = (oldV: string, newV: string) =>
                    oldV && newV ? `${oldV} ${newV}` : oldV || newV || "";

                  setSubjective((old) => append(old, parsed.subjective));
                  setObjective((old) => append(old, parsed.objective));
                  setAssessment((old) => append(old, parsed.assessment));
                  setPlan((old) => append(old, parsed.plan));
                  setAdditionalNotes((old) => append(old, parsed.additionalNotes));
                  setNoteBody(parsed.residual);

                  setShowStructured(true);
                }}
                className="text-[var(--brand,#4b7eff)] hover:underline"
              >
                Apply SOAP structuring now
              </button> */}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">SOAP fields</span>
              <span className="text-[11px] text-gray-400">at least one is required</span>
            </div>
            <button
              type="button"
              onClick={() => setShowStructured((s) => !s)}
              className="text-xs font-medium text-[#4b7eff] hover:underline"
            >
              {showStructured ? "Hide" : "Show"}
            </button>
          </div>

          {showStructured && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <RichField
                soapTag="S"
                tagColor="blue"
                label="Subjective"
                hint="What the patient reports — symptoms, history, concerns."
                value={subjective}
                onChange={setSubjective}
                rows={5}
              />
              <RichField
                soapTag="O"
                tagColor="emerald"
                label="Objective"
                hint="Observable findings — vitals, exam, labs."
                value={objective}
                onChange={setObjective}
                rows={5}
              />
              <RichField
                soapTag="A"
                tagColor="violet"
                label="Assessment"
                hint="Your clinical impression / diagnosis."
                value={assessment}
                onChange={setAssessment}
                rows={5}
              />
              <RichField
                soapTag="P"
                tagColor="amber"
                label="Plan"
                hint="Treatment, follow-up, homework."
                value={plan}
                onChange={setPlan}
                rows={5}
              />
              <div className="sm:col-span-2">
                <RichField
                  label="Additional notes"
                  hint="Optional — anything that doesn't fit above."
                  value={additionalNotes}
                  onChange={setAdditionalNotes}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Sticky-feeling action footer */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <Button onClick={addNote} disabled={adding || !atLeastOneFilled}>
                {adding
                  ? "Saving…"
                  : editingNoteId
                    ? "Save changes"
                    : "Save SOAP note"}
              </Button>

              {editingNoteId ? (
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  onClick={cancelEditNote}
                  disabled={adding}
                >
                  Cancel edit
                </button>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
                  onClick={() => {
                    setNoteBody("");
                    setSubjective("");
                    setObjective("");
                    setAssessment("");
                    setPlan("");
                    setAdditionalNotes("");
                  }}
                  disabled={adding}
                >
                  Clear all fields
                </button>
              )}
            </div>

            {!atLeastOneFilled && (
              <p className="text-[11px] italic text-gray-500">
                Fill at least one SOAP field to enable saving.
              </p>
            )}
          </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">SOAP Notes</p>
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
            {sortedNotes.map((n, i) => {
              const S = (n.subjective || "").trim();
              const O = (n.objective || "").trim();
              const A = (n.assessment || "").trim();
              const P = (n.plan || "").trim();
              const hasSoap = !!(S || O || A || P || (n.additionalNotes || "").trim());

              return (
                <div
                  key={String(n._id ?? n.createdAt ?? i)}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                    <span>
                      {formatDate(n.createdAt)}
                      {n.updatedAt && n.updatedAt !== n.createdAt
                        ? ` (edited ${formatDate(n.updatedAt)})`
                        : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* <span className="truncate">
                        {typeof n.author === "string"
                          ? n.author
                          : n.author?.name || n.author?._id || "—"}
                      </span> */}
                      {canWrite && n._id && (
                        <button
                          type="button"
                          onClick={() => startEditNote(n)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-100"
                          title="Edit this note"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {hasSoap ? (
                    <div className="mt-2 space-y-2 text-sm text-gray-800">
                      {S && (
                        <SoapBlock label="S" tagColor="bg-blue-50 text-blue-700 ring-blue-200" html={renderNoteHtml(S)} />
                      )}
                      {O && (
                        <SoapBlock label="O" tagColor="bg-emerald-50 text-emerald-700 ring-emerald-200" html={renderNoteHtml(O)} />
                      )}
                      {A && (
                        <SoapBlock label="A" tagColor="bg-violet-50 text-violet-700 ring-violet-200" html={renderNoteHtml(A)} />
                      )}
                      {P && (
                        <SoapBlock label="P" tagColor="bg-amber-50 text-amber-700 ring-amber-200" html={renderNoteHtml(P)} />
                      )}
                      {n.additionalNotes && (
                        <SoapBlock
                          label="Additional"
                          tagColor="bg-gray-100 text-gray-700 ring-gray-200"
                          html={renderNoteHtml(n.additionalNotes)}
                          wide
                        />
                      )}

                      {n.body && (
                        <SoapBlock
                          label="Legacy"
                          tagColor="bg-gray-50 text-gray-500 ring-gray-200"
                          html={renderNoteHtml(n.body)}
                          wide
                          dim
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      className="mt-2 rich-content text-sm text-gray-800"
                      dangerouslySetInnerHTML={{ __html: renderNoteHtml(n.body || "—") }}
                    />
                  )}

                  {/* Private therapist↔supervisor thread (visible only to therapist & supervisor) */}
                  {role === "therapist" && patientId && user?.id && n._id && (
                    <NoteCommentThread
                      patientId={patientId}
                      therapistId={String(user.id)}
                      noteId={String(n._id)}
                      comments={n.comments || []}
                      token={token}
                      onCommentAdded={(c) => {
                        setNotes((prev) =>
                          prev.map((nn) =>
                            nn._id === n._id
                              ? { ...nn, comments: [...(nn.comments || []), c] }
                              : nn
                          )
                        );
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* <div className="sticky bottom-0 z-20 bg-white/80 backdrop-blur border-t">
        <ChatGPTComposer
          value={noteBody}
          onChange={setNoteBody}
          onSend={sendChatMessage}
          onAttach={() => fileInputRef.current?.click()}
          onMicToggle={() => (listening ? sttStop() : sttStart())}
          micActive={listening}
          rightMode="send"
          disabled={adding}
          placeholder='Ask anything'
        />
      </div> */}
    </div>
    </div>
  );
}

function Field({
  label,
  hint,
  soapTag,
  tagColor = "gray",
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  soapTag?: string;
  tagColor?: "blue" | "emerald" | "violet" | "amber" | "gray";
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const tagCls: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  // Per-field voice-to-text. Each Field instantiates its own recognizer; the
  // browser allows only one active session at a time, so starting on field B
  // will end any session on field A automatically (its onend fires).
  const {
    supported: sttSupported,
    listening,
    finalText,
    interim,
    error: sttError,
    start,
    stop,
  } = useSpeechToText({ continuous: true, interimResults: true });

  // baseRef = the field's value at the moment we last appended speech.
  // lastFinalRef = the cumulative finalText we've already absorbed.
  const baseRef = useRef(value);
  const lastFinalRef = useRef("");

  // Capture the current value as the base whenever a fresh listening session starts.
  useEffect(() => {
    if (listening) {
      baseRef.current = value;
      lastFinalRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  // Append newly-finalized speech to the field.
  useEffect(() => {
    if (!finalText) return;
    if (finalText === lastFinalRef.current) return;
    const newPart = finalText.slice(lastFinalRef.current.length).trim();
    lastFinalRef.current = finalText;
    if (!newPart) return;
    const merged = baseRef.current
      ? `${baseRef.current.replace(/\s+$/, "")} ${newPart}`
      : newPart;
    baseRef.current = merged;
    onChange(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText]);

  function toggleMic() {
    if (listening) stop();
    else start();
  }

  const showInterim = listening && interim;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors focus-within:border-[#4b7eff]/60 focus-within:ring-2 focus-within:ring-[#4b7eff]/15">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-3 py-2">
        <div className="flex items-start gap-2 min-w-0">
          {soapTag && (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ring-1 ${tagCls[tagColor]}`}
              aria-hidden
            >
              {soapTag}
            </span>
          )}
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-800 leading-tight">{label}</label>
            {hint && <p className="mt-0.5 text-[11px] text-gray-500 leading-tight">{hint}</p>}
          </div>
        </div>
        {sttSupported && (
          <button
            type="button"
            onClick={toggleMic}
            title={listening ? "Stop dictation" : "Dictate into this field"}
            aria-pressed={listening}
            className={[
              "shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              listening
                ? "bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse"
                : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:ring-[#4b7eff]/30",
            ].join(" ")}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {listening ? "Rec" : "Mic"}
          </button>
        )}
      </div>
      <textarea
        className="block w-full resize-y rounded-b-xl border-0 bg-white px-3.5 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none"
        style={{ minHeight: `${Math.max(96, rows * 24)}px` }}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint ? "" : `Enter ${label.toLowerCase()}…`}
      />
      {showInterim && (
        <p className="border-t border-gray-100 px-3 py-1.5 text-[11px] italic text-gray-400 truncate" title={interim}>
          …{interim}
        </p>
      )}
      {sttError && listening && (
        <p className="border-t border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] text-red-600">Mic error: {sttError}</p>
      )}
    </div>
  );
}

// ── Rich-text field ────────────────────────────────────────────────────────
// A minimal WYSIWYG editor — toolbar + contentEditable area, no extra deps.
// Stores HTML. Backwards-compatible with plain-text legacy content (rendered
// as-is; line breaks preserved in CSS via `whitespace-pre-wrap` on read view).
function RichField({
  label,
  hint,
  soapTag,
  tagColor = "gray",
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  hint?: string;
  soapTag?: string;
  tagColor?: "blue" | "emerald" | "violet" | "amber" | "gray";
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const tagCls: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };

  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [focused, setFocused] = useState(false);

  // Sync external value → editor only when it differs from what's already
  // rendered (avoids resetting the cursor on every keystroke).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  function emit() {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
  }

  function exec(cmd: string, arg?: string) {
    editorRef.current?.focus();
    // execCommand is deprecated but still supported in all major browsers and
    // is the lightest way to do this without a 100KB+ editor library.
    document.execCommand(cmd, false, arg);
    emit();
  }

  // Per-field speech-to-text — appends recognised text into the editor.
  const {
    supported: sttSupported,
    listening,
    finalText,
    interim,
    error: sttError,
    start,
    stop,
  } = useSpeechToText({ continuous: true, interimResults: true });

  const lastFinalRef = useRef("");
  useEffect(() => {
    if (!finalText || finalText === lastFinalRef.current) return;
    const newPart = finalText.slice(lastFinalRef.current.length).trim();
    lastFinalRef.current = finalText;
    if (!newPart || !editorRef.current) return;
    // Append at end with a leading space if there's existing content.
    const sep = editorRef.current.innerText.trim() ? " " : "";
    document.execCommand("insertText", false, sep + newPart);
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText]);

  function toggleMic() {
    if (listening) stop();
    else {
      lastFinalRef.current = "";
      start();
    }
  }

  // Toolbar buttons
  const ToolbarBtn = ({
    onClick,
    title,
    children,
    active,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()} // keep editor focus
      onClick={onClick}
      className={[
        "inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-[#4b7eff]/10 text-[#4b7eff]"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      ].join(" ")}
    >
      {children}
    </button>
  );

  const showInterim = listening && interim;

  return (
    <div
      className={[
        "rounded-xl border bg-white shadow-sm transition-colors",
        focused ? "border-[#4b7eff]/60 ring-2 ring-[#4b7eff]/15" : "border-gray-200",
      ].join(" ")}
    >
      {/* Label header */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-3 py-2">
        <div className="flex items-start gap-2 min-w-0">
          {soapTag && (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ring-1 ${tagCls[tagColor]}`}
              aria-hidden
            >
              {soapTag}
            </span>
          )}
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-800 leading-tight">{label}</label>
            {hint && <p className="mt-0.5 text-[11px] text-gray-500 leading-tight">{hint}</p>}
          </div>
        </div>
        {sttSupported && (
          <button
            type="button"
            onClick={toggleMic}
            title={listening ? "Stop dictation" : "Dictate into this field"}
            aria-pressed={listening}
            className={[
              "shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              listening
                ? "bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse"
                : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:ring-[#4b7eff]/30",
            ].join(" ")}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {listening ? "Rec" : "Mic"}
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-white px-2 py-1">
        <ToolbarBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)">
          <span className="font-bold">B</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} title="Italic (Ctrl+I)">
          <span className="italic">I</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("underline")} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("formatBlock", "h3")} title="Heading">
          H
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "p")} title="Paragraph">
          P
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bulleted list">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75V17.25zM8.25 6.75h12M8.25 12h12M8.25 17.25h12" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered list">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zM3.75 12h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
          </svg>
        </ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("outdent")} title="Outdent">‹</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("indent")} title="Indent">›</ToolbarBtn>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear formatting">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ToolbarBtn>
        <span className="ml-auto" />
        <ToolbarBtn onClick={() => exec("undo")} title="Undo (Ctrl+Z)">↶</ToolbarBtn>
        <ToolbarBtn onClick={() => exec("redo")} title="Redo (Ctrl+Y)">↷</ToolbarBtn>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={() => { setFocused(false); emit(); }}
        onFocus={() => setFocused(true)}
        onPaste={(e) => {
          // Strip rich formatting on paste — clinicians often paste from Word
          // and end up with stray inline styles. Plain text is safer.
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        className="rich-editor block w-full overflow-y-auto rounded-b-xl px-3.5 py-3 text-sm leading-relaxed text-gray-900 focus:outline-none"
        style={{ minHeight: `${Math.max(120, rows * 24)}px`, maxHeight: "320px" }}
        aria-label={label}
        data-placeholder={hint || `Enter ${label.toLowerCase()}…`}
      />
      {showInterim && (
        <p className="border-t border-gray-100 px-3 py-1.5 text-[11px] italic text-gray-400 truncate" title={interim}>
          …{interim}
        </p>
      )}
      {sttError && listening && (
        <p className="border-t border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] text-red-600">Mic error: {sttError}</p>
      )}
    </div>
  );
}

// ── Rendered HTML utilities ────────────────────────────────────────────────
// Convert a stored note value to safe-ish HTML for display. If it already
// looks like HTML (has <tag> markers from the rich editor) we render as-is;
// otherwise it's legacy plain text and we preserve newlines via <br>.
function looksLikeHtml(s: string) {
  return /<\/?[a-z][^>]*>/i.test(s);
}
function renderNoteHtml(s?: string): string {
  if (!s) return "";
  if (looksLikeHtml(s)) return s;
  // Escape, then convert newlines to <br>.
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br>");
}

// Small block used to render a single SOAP letter section in the read view.
// Renders the stored value as HTML so bullets/bold/etc. survive round-trip.
function SoapBlock({
  label,
  tagColor,
  html,
  wide,
  dim,
}: {
  label: string;
  tagColor: string;
  html: string;
  wide?: boolean;
  dim?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${dim ? "opacity-70" : ""}`}>
      <span
        className={`mt-0.5 inline-flex h-5 ${
          wide ? "px-2" : "w-5 justify-center"
        } shrink-0 items-center rounded-md text-[10px] font-bold ring-1 ${tagColor}`}
        aria-hidden
      >
        {label}
      </span>
      <div
        className="rich-content min-w-0 flex-1 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
