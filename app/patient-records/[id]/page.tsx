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

  const canWrite = role === "therapist";

  // Share with supervisor (therapist only)
  const [sharing, setSharing] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  async function shareWithSupervisor() {
    if (!patientId || !token) return;
    setSharing(true);
    setErr("");
    setMsg("");
    try {
      const res: any = await api("api/record-requests/share-with-supervisor", {
        method: "POST",
        headers: {
          ...(authHeader(token) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patient: patientId }),
      });
      setShareDone(true);
      setMsg(
        res?.reused
          ? "Records were already shared with your supervisor."
          : "Records shared with your supervisor."
      );
    } catch (e: any) {
      setErr(e?.message || "Could not share records with supervisor.");
    } finally {
      setSharing(false);
    }
  }

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
      const payload: any = {};

      // always include SOAP (new)
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

      await api(`api/patient-records/${patientId}/notes`, {
        method: "POST",
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

      setMsg("SOAP note added.");
      await load();
    } catch (e: any) {
      setErr(e.message || "Could not add note.");
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
              <button
                type="button"
                onClick={shareWithSupervisor}
                disabled={sharing || shareDone}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#4b7eff]/30 bg-[#4b7eff]/5 px-4 py-2 text-sm font-semibold text-[#4b7eff] hover:bg-[#4b7eff]/10 disabled:opacity-60 transition-colors"
                title="Share this patient's records with your supervisor"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0 12.814a2.25 2.25 0 103.933 2.185 2.25 2.25 0 00-3.933-2.185z" />
                </svg>
                {shareDone ? "Shared" : sharing ? "Sharing…" : "Share with supervisor"}
              </button>
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

      {/* Add SOAP note */}
      {canWrite && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Add SOAP note</p>

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

          <div className="mt-4 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">SOAP fields</label>
            <button
              type="button"
              onClick={() => setShowStructured((s) => !s)}
              className="text-xs text-[var(--brand,#4b7eff)] hover:underline"
            >
              {showStructured ? "Hide" : "Show"}
            </button>
          </div>

          {showStructured && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Subjective (S)" value={subjective} onChange={setSubjective} />
              <Field label="Objective (O)" value={objective} onChange={setObjective} />
              <Field label="Assessment (A)" value={assessment} onChange={setAssessment} />
              <Field label="Plan (P)" value={plan} onChange={setPlan} />
              <div className="sm:col-span-2">
                <Field
                  label="Additional notes (optional)"
                  value={additionalNotes}
                  onChange={setAdditionalNotes}
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button onClick={addNote} disabled={adding || !atLeastOneFilled}>
              {adding ? "Saving…" : "Save SOAP note"}
            </Button>

            <button
              type="button"
              className="text-xs text-gray-600 hover:underline"
              onClick={() => {
                setNoteBody("");
                setSubjective("");
                setObjective("");
                setAssessment("");
                setPlan("");
                setAdditionalNotes("");
              }}
            >
              Clear
            </button>
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

                  {hasSoap ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-800">
                      {S && (
                        <p>
                          <span className="font-medium">S:</span> {S}
                        </p>
                      )}
                      {O && (
                        <p>
                          <span className="font-medium">O:</span> {O}
                        </p>
                      )}
                      {A && (
                        <p>
                          <span className="font-medium">A:</span> {A}
                        </p>
                      )}
                      {P && (
                        <p>
                          <span className="font-medium">P:</span> {P}
                        </p>
                      )}
                      {n.additionalNotes && (
                        <p>
                          <span className="font-medium">Additional:</span>{" "}
                          {n.additionalNotes}
                        </p>
                      )}

                      {/* Optional: show legacy body if you want */}
                      {n.body && (
                        <p className="opacity-70">
                          <span className="font-medium">Legacy:</span> {n.body}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                      {n.body || "—"}
                    </p>
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
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
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
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-sm text-gray-700">{label}</label>
        {sttSupported && (
          <button
            type="button"
            onClick={toggleMic}
            title={listening ? "Stop dictation" : "Dictate into this field"}
            aria-pressed={listening}
            className={[
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              listening
                ? "bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse"
                : "bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:ring-[#4b7eff]/30",
            ].join(" ")}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {listening ? "Listening…" : "Mic"}
          </button>
        )}
      </div>
      <textarea
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff]"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showInterim && (
        <p className="mt-1 text-[11px] italic text-gray-400 truncate" title={interim}>
          …{interim}
        </p>
      )}
      {sttError && listening && (
        <p className="mt-1 text-[11px] text-red-500">Mic error: {sttError}</p>
      )}
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
