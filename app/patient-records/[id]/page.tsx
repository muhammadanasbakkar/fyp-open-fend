// // app/patient-records/[id]/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "next/navigation";
// import Protected from "@/components/Protected";
// import { useAuth } from "@/lib/auth";
// import { api, authHeader } from "@/lib/api";
// import Button from "@/components/Button";
// import { cleanTranscript } from "@/utils/cleanTranscript";
// import { useSpeechToText } from "@/app/hooks/useSpeechToText";

// type Patient = {
//   _id: string;
//   name?: string;
//   email?: string;
//   phone?: string;
//   profilePicture?: string;
//   patientId?: string;
// };

// type Note = {
//   _id: string;
//   author?: { _id: string; name?: string; role?: string } | string;
//   body: string;
//   createdAt: string;
//   updatedAt?: string;
// };

// export default function PatientRecordPage() {
//   return (
//     <Protected>
//       <PatientRecordInner />
//     </Protected>
//   );
// }

// function PatientRecordInner() {
//   const params = useParams<{ id: string }>();
//   const patientId = params?.id;
//   const { token, user } = useAuth();
//   const role = user?.role;

//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");

//   const [objective, setObjective] = useState("");
//   const [diagnosis, setDiagnosis] = useState("");
//   const [treatment, setTreatment] = useState("");
//   const [activity, setActivity] = useState("");
//   // const [additionalNotes, setAdditionalNotes] = useState("");

//   const [summary, setSummary] = useState<any | null>(null); // for PT#

//   // add note
//   const [noteBody, setNoteBody] = useState("");
//   const [adding, setAdding] = useState(false);
//   const [additionalNotes, setAdditionalNotes] = useState("");

//   const [sttLang, setSttLang] = useState("en-US"); // or "ur-PK"
//   const {
//     supported: sttSupported,
//     listening,
//     error: sttError,
//     interim,
//     finalText,
//     start: sttStart,
//     stop: sttStop,
//     setLang: sttSetLang,
//   } = useSpeechToText({
//     lang: sttLang,
//     continuous: true,
//     interimResults: true,
//   });

//   useEffect(() => {
//     // Live compose: base typed text + final + interim (not persisted)
//     // If you prefer only FINAL chunks, use finalText only.
//     const typed = noteBody.trim();
//     const combined = [typed, finalText, interim]
//       .filter(Boolean)
//       .join(" ")
//       .replace(/\s+/g, " ");
//     // Avoid moving cursor if therapist is typing: only auto-set while listening.
//     if (listening) setNoteBody(combined);

//     const cleaned = cleanTranscript(finalText || noteBody);
//     setNoteBody(cleaned);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [finalText, interim, listening]);

//   const canWrite = role === "therapist" || role === "superAdmin";

//   // ---------- helpers ----------
//   function normalizeNotes(raw: any[]): Note[] {
//     return (Array.isArray(raw) ? raw : []).filter(Boolean).map((n, i) => {
//       const id =
//         n?._id ??
//         n?.id ??
//         n?.noteId ??
//         `${n?.createdAt ?? n?.date ?? "no-date"}-${i}`;
//       const body = n?.body ?? n?.content ?? "";
//       const created = n?.createdAt ?? n?.date ?? new Date().toISOString();
//       return {
//         _id: String(id),
//         author: n?.author,
//         body: String(body),
//         createdAt: String(created),
//         updatedAt: n?.updatedAt ? String(n.updatedAt) : undefined,
//       };
//     });
//   }

//   async function load() {
//     if (!patientId) return;
//     setErr("");
//     setMsg("");
//     setLoading(true);
//     try {
//       const sum = await api(`api/patient-records/${patientId}/summary`, {
//         headers: authHeader(token || undefined),
//       }).catch(() => null);
//       setSummary(sum || null);

//       const res = await api(`api/patient-records/${patientId}`, {
//         headers: authHeader(token || undefined),
//       });

//       // accept both shapes: {patient,notes} OR {record:{patient,notes}}
//       const p = res?.patient ?? res?.record?.patient ?? null;
//       const rawNotes =
//         (Array.isArray(res?.notes) ? res.notes : null) ??
//         (Array.isArray(res?.record?.notes) ? res.record.notes : []) ??
//         [];

//       setPatient(p);
//       setNotes(normalizeNotes(rawNotes));
//     } catch (e: any) {
//       setErr(e.message || "Failed to load patient record.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [patientId, token]);

//   async function addNote() {
//     if (!noteBody.trim()) return;
//     setErr("");
//     setMsg("");
//     setAdding(true);
//     try {
//       await api(`api/patient-records/${patientId}/notes`, {
//         method: "POST",
//         headers: {
//           ...authHeader(token || undefined),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           body: noteBody.trim(),
//           additionalNotes: additionalNotes.trim() || undefined,
//         }),
//       });
//       setNoteBody("");
//       setAdditionalNotes("");
//       setMsg("Note added.");
//       await load(); // reload so we get server-normalized note with _id
//     } catch (e: any) {
//       setErr(e.message || "Could not add note.");
//     } finally {
//       setAdding(false);
//     }
//   }

//   const sortedNotes = useMemo(() => {
//     const withDates = (notes || []).filter(Boolean).map((n, i) => ({
//       ...n,
//       createdAt: n.createdAt || new Date(0).toISOString(),
//       _i: i,
//     }));
//     return withDates.sort((a, b) => {
//       const d = +new Date(b.createdAt) - +new Date(a.createdAt);
//       return d !== 0 ? d : a._i - b._i;
//     });
//   }, [notes]);

//   const displayName =
//     patient?.name || patient?.email || patient?.phone || "Patient";
//   const ptCode =
//     patient?.patientId ??
//     summary?.patient?.patientId ??
//     summary?.patient?.ptNumber ??
//     "—";

//   return (
//     <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
//       {/* Header / Patient Card */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//         {loading ? (
//           <div className="flex items-center gap-4">
//             <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
//             <div className="space-y-2">
//               <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
//               <div className="h-3 w-72 bg-gray-200 rounded animate-pulse" />
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-wrap items-center gap-4">
//             <div className="min-w-0">
//               <h1 className="text-xl font-semibold">{displayName}</h1>
//               <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
//                 <span>
//                   <span className="text-gray-500">Patient ID:</span>{" "}
//                   <span className="font-medium">{ptCode}</span>
//                 </span>
//                 {patient?.email && <span>{patient.email}</span>}
//                 {patient?.phone && <span>{patient.phone}</span>}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {err && (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {err}
//         </div>
//       )}
//       {msg && (
//         <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
//           {msg}
//         </div>
//       )}

//       {/* Add note (therapists only) */}
//       {canWrite && (
//         <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//           <p className="text-sm font-medium text-gray-900">Add note</p>
//           <p className="mb-3 text-xs text-gray-600">
//             Notes are visible to the care team. Avoid PII beyond clinical
//             relevance.
//           </p>
//           <textarea
//             className="w-full rounded-md border px-3 py-2 text-sm"
//             rows={5}
//             value={noteBody}
//             onChange={(e) => setNoteBody(e.target.value)}
//             placeholder="Session summary, observations, treatment plan, etc."
//           />
//           <div className="mb-2 flex flex-wrap items-center gap-2">
//             <label className="text-xs text-gray-600">Dictate language</label>
//             <select
//               className="rounded border px-2 py-1 text-xs"
//               value={sttLang}
//               onChange={(e) => {
//                 setSttLang(e.target.value);
//                 sttSetLang(e.target.value);
//               }}
//             >
//               <option value="en-US">English (US)</option>
//               <option value="en-GB">English (UK)</option>
//               <option value="ur-PK">Urdu (Pakistan)</option>
//               <option value="hi-IN">Hindi (India)</option>
//             </select>

//             {sttSupported ? (
//               listening ? (
//                 <Button onClick={sttStop}>⏹ Stop listening</Button>
//               ) : (
//                 <Button onClick={sttStart}>🎙 Start dictation</Button>
//               )
//             ) : (
//               <span className="text-xs text-amber-700">
//                 Speech recognition not supported in this browser.
//               </span>
//             )}

//             {sttError && (
//               <span className="text-xs text-red-600">
//                 Mic error: {sttError}
//               </span>
//             )}
//           </div>

//           <label className="mb-1 mt-3 block text-sm text-gray-700">
//             Additional notes (optional)
//           </label>
//           <textarea
//             className="w-full rounded-md border px-3 py-2 text-sm"
//             rows={3}
//             value={additionalNotes}
//             onChange={(e) => setAdditionalNotes(e.target.value)}
//             placeholder="Anything else you want to capture (optional)"
//           />
//           <div className="mt-3">
//             <Button onClick={addNote} disabled={adding || !noteBody.trim()}>
//               {adding ? "Saving…" : "Save note"}
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Notes list */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <div className="mb-3 flex items-center justify-between">
//           <p className="text-sm font-medium text-gray-900">Notes</p>
//           <p className="text-xs text-gray-500">
//             {sortedNotes.length ? `${sortedNotes.length} total` : "None yet"}
//           </p>
//         </div>

//         {loading ? (
//           <div className="space-y-3">
//             {Array.from({ length: 3 }).map((_, i) => (
//               <div key={i} className="rounded-lg border bg-gray-50 p-3">
//                 <div className="h-4 w-40 rounded bg-gray-200" />
//                 <div className="mt-2 h-3 w-full rounded bg-gray-200" />
//                 <div className="mt-1 h-3 w-5/6 rounded bg-gray-200" />
//               </div>
//             ))}
//           </div>
//         ) : sortedNotes.length === 0 ? (
//           <p className="text-sm text-gray-500">No notes yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {sortedNotes.filter(Boolean).map((n, i) => (
//               <div
//                 key={String(n._id ?? n.createdAt ?? i)}
//                 className="rounded-lg border border-gray-100 bg-gray-50 p-3"
//               >
//                 <div className="flex items-center justify-between text-xs text-gray-600">
//                   <span>
//                     {formatDate(n.createdAt)}
//                     {n.updatedAt && n.updatedAt !== n.createdAt
//                       ? ` (edited ${formatDate(n.updatedAt)})`
//                       : ""}
//                   </span>
//                   <span className="truncate">
//                     {typeof n.author === "string"
//                       ? n.author
//                       : n.author?.name || n.author?._id || "—"}
//                   </span>
//                 </div>
//                 <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
//                   {n.body}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function formatDate(dt: string | Date) {
//   const d = new Date(dt);
//   return d.toLocaleString(undefined, {
//     weekday: "short",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// app/patient-records/[id]/page.tsx
// app/patient-records/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import Tesseract from "tesseract.js";
import Button from "@/components/Button";
import { cleanTranscript } from "@/utils/cleanTranscript";
import { useSpeechToText } from "@/app/hooks/useSpeechToText";

type Patient = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  patientId?: string;
};

type Note = {
  _id: string;
  author?: { _id: string; name?: string; role?: string } | string;
  body?: string;
  objective?: string;
  diagnosis?: string;
  treatment?: string;
  activity?: string;
  additionalNotes?: string;
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

/** --- Simple NLP-lite: split free text into structured boxes --- */
function parseStructuredFromText(raw: string) {
  if (!raw?.trim()) {
    return {
      objective: "",
      diagnosis: "",
      treatment: "",
      activity: "",
      additionalNotes: "",
      residual: "",
    };
  }

  // Normalize
  let t = cleanTranscript(raw).replace(/\s+/g, " ").trim();

  // Common mishears (tune for your clinic)
  const repl: [RegExp, string][] = [
    /\bdiagno(?:sis|sed?)?\b/gi,
    "diagnosis",
    /\btx\b/gi,
    "treatment",
    /\bplan\b/gi,
    "treatment",
    /\bactivity\s+breath(?:ing)?\b/gi,
    "activity breathing",
    /\bhand?outs?\b/gi,
    "handouts",
  ].reduce<[RegExp, string][]>((acc, v, i, arr) => {
    if (i % 2 === 0) acc.push([arr[i] as RegExp, arr[i + 1] as string]);
    return acc;
  }, []);
  for (const [re, to] of repl) t = t.replace(re, to);

  // Section cues (you can extend these)
  const cues = [
    // label, regex group to match
    ["objective", "(?:objective|obj)"],
    ["diagnosis", "(?:diagnosis|dx)"],
    ["treatment", "(?:treatment|tx|plan)"],
    ["activity", "(?:activity|homework|tasks?)"],
    ["additionalNotes", "(?:additional notes?|extra notes?)"],
  ] as const;

  // Build a regex to capture "label: content" OR "label ... content" style.
  // We also allow phrases like "the objective of patient was ..." etc.
  const labelPart = (g: string) =>
    `(?:the\\s+)?${g}(?:\\s+of\\s+patient\\s+(?:was|is))?|${g}|${g}\\s*:?`;

  const bigRe = new RegExp(
    `(?:^|\\.|;|,|\\n|\\r)\\s*(?<label>${cues
      .map(([, g]) => labelPart(g))
      .join("|")})\\s*(?<sep>:|-|is|was|are|\\s)?\\s*(?<content>[^.\\n\\r]+)`,
    "gi"
  );

  let objective = "";
  let diagnosis = "";
  let treatment = "";
  let activity = "";
  let additionalNotes = "";

  const takenSpans: [number, number][] = [];

  let m: RegExpExecArray | null;
  while ((m = bigRe.exec(t)) !== null) {
    const labelRaw = (m.groups?.label || "").toLowerCase();
    const content = (m.groups?.content || "").trim();

    const assign = (
      k:
        | "objective"
        | "diagnosis"
        | "treatment"
        | "activity"
        | "additionalNotes"
    ) => {
      if (!content) return;
      if (k === "objective")
        objective = objective ? `${objective} ${content}` : content;
      if (k === "diagnosis")
        diagnosis = diagnosis ? `${diagnosis} ${content}` : content;
      if (k === "treatment")
        treatment = treatment ? `${treatment} ${content}` : content;
      if (k === "activity")
        activity = activity ? `${activity} ${content}` : content;
      if (k === "additionalNotes")
        additionalNotes = additionalNotes
          ? `${additionalNotes} ${content}`
          : content;
      takenSpans.push([m!.index, bigRe.lastIndex]);
    };

    if (/objective|obj/.test(labelRaw)) assign("objective");
    else if (/diagnosis|dx/.test(labelRaw)) assign("diagnosis");
    else if (/treatment|tx|plan/.test(labelRaw)) assign("treatment");
    else if (/activity|homework|task/.test(labelRaw)) assign("activity");
    else if (/additional notes?|extra notes?/.test(labelRaw))
      assign("additionalNotes");
  }

  // Residual = anything not captured; if no sections detected, treat whole as objective
  let residual = t;
  if (takenSpans.length) {
    // remove captured spans from text (rough)
    let chars = t.split("");
    for (const [s, e] of takenSpans) {
      for (let i = s; i < e; i++) chars[i] = " ";
    }
    residual = cleanTranscript(chars.join(" ").replace(/\s+/g, " ").trim());
  } else {
    // No sections found—fallback: objective = all text
    objective = objective || t;
    residual = "";
  }

  // Final tidy
  const tidy = (s: string) =>
    s
      .replace(/\s+/g, " ")
      .replace(/\s*([.?!])?$/, (m, p1) => (p1 ? p1 : "."))
      .trim();

  return {
    objective: objective ? tidy(objective) : "",
    diagnosis: diagnosis ? tidy(diagnosis) : "",
    treatment: treatment ? tidy(treatment) : "",
    activity: activity ? tidy(activity) : "",
    additionalNotes: additionalNotes ? tidy(additionalNotes) : "",
    residual: residual || "",
  };
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

  // -------- add note form state --------
  const [noteBody, setNoteBody] = useState("");
  const [objective, setObjective] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [activity, setActivity] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [autoStructure, setAutoStructure] = useState(true);
  const [showStructured, setShowStructured] = useState(true);

  const [adding, setAdding] = useState(false);
  const [summary, setSummary] = useState<any | null>(null); // for PT#

  // Image to text
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);

  // const canWrite = role === "therapist" || role === "superAdmin";
  const canWrite = role === "therapist";

  // ---- Speech-to-text ----
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
  } = useSpeechToText({
    lang: sttLang,
    continuous: true,
    interimResults: true,
  });

  // stable dictation (no stutter/repeat):
  const baseAtStartRef = useRef<string>("");
  const prevListeningRef = useRef<boolean>(false);

  // Image to text start
  function ocrLangFor(stt: string) {
    // You can add more, but make sure the traineddata exists
    // eng is bundled by default. For urd/hin you may need network fetch of traineddata.
    if (stt.startsWith("ur")) return "eng+urd";
    if (stt.startsWith("hi")) return "eng+hin";
    return "eng";
  }

  // merge (append politely)
  const append = (oldV: string, newV: string) =>
    oldV && newV ? `${oldV} ${newV}` : oldV || newV || "";

  /** Run OCR on the selected image and push results into the note */
  async function handleImageFiles(files: FileList | null) {
    if (!files || !files[0]) return;
    const file = files[0];

    // show a tiny preview
    if (ocrPreviewUrl) URL.revokeObjectURL(ocrPreviewUrl);
    setOcrPreviewUrl(URL.createObjectURL(file));

    setOcrBusy(true);
    setOcrProgress(0);
    try {
      const { data } = await Tesseract.recognize(file, ocrLangFor(sttLang), {
        logger: (m) => {
          if (
            m.status === "recognizing text" &&
            typeof m.progress === "number"
          ) {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      // raw OCR text
      const raw = (data.text || "").trim();
      if (!raw) {
        setErr("Could not extract any text from the image.");
        return;
      }

      // clean it, then try to auto-structure using your existing parser
      const cleaned = cleanTranscript(raw);
      // put cleaned text into the free-text box (so user can see what came from image)
      setNoteBody((prev) => append(prev, cleaned));

      // also auto-structure (like we do after dictation stops)
      const {
        objective,
        diagnosis,
        treatment,
        activity,
        additionalNotes,
        residual,
      } = parseStructuredFromText(cleaned);

      setObjective((old) => append(old, objective));
      setDiagnosis((old) => append(old, diagnosis));
      setTreatment((old) => append(old, treatment));
      setActivity((old) => append(old, activity));
      setAdditionalNotes((old) => append(old, additionalNotes));

      // keep any leftovers in free text
      if (residual) setNoteBody((prev) => append(prev, residual));

      setMsg("Extracted text from image.");
    } catch (e: any) {
      setErr(e?.message || "OCR failed. Try a clearer image.");
    } finally {
      setOcrBusy(false);
      setOcrProgress(0);
    }
  }

  // Image to text end

  // When mic starts, snapshot existing typed text once
  useEffect(() => {
    if (listening && !prevListeningRef.current) {
      baseAtStartRef.current = noteBody;
    }
    prevListeningRef.current = listening;
  }, [listening, noteBody]);

  // While listening, render base + final + interim (not from current noteBody)
  useEffect(() => {
    if (!listening) return;
    const base = baseAtStartRef.current?.trim() || "";
    const f = (finalText || "").trim();
    const i = (interim || "").trim();
    const combined = [base, f, i]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ");
    if (combined !== noteBody) setNoteBody(combined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText, interim, listening]);

  // When dictation stops: clean once and (optionally) auto-structure
  useEffect(() => {
    const wasListening = prevListeningRef.current;
    if (wasListening && !listening) {
      // Clean
      const cleaned = cleanTranscript(noteBody);
      setNoteBody(cleaned);

      // Auto-structure into boxes
      if (autoStructure) {
        const {
          objective,
          diagnosis,
          treatment,
          activity,
          additionalNotes,
          residual,
        } = parseStructuredFromText(cleaned);

        // Only set fields that are currently empty, otherwise append nicely
        const append = (oldV: string, newV: string) =>
          oldV && newV ? `${oldV} ${newV}` : oldV || newV || "";

        setObjective((old) => append(old, objective));
        setDiagnosis((old) => append(old, diagnosis));
        setTreatment((old) => append(old, treatment));
        setActivity((old) => append(old, activity));
        setAdditionalNotes((old) => append(old, additionalNotes));

        // Keep any leftover free-text in the main box (or clear if none)
        setNoteBody(residual);
      }
    }
    prevListeningRef.current = listening;
  }, [listening, autoStructure, noteBody]);

  // ---------- helpers ----------
  function normalizeNotes(raw: any[]): Note[] {
    return (Array.isArray(raw) ? raw : []).filter(Boolean).map((n, i) => {
      const id =
        n?._id ??
        n?.id ??
        n?.noteId ??
        `${n?.createdAt ?? n?.date ?? "no-date"}-${i}`;
      const created = n?.createdAt ?? n?.date ?? new Date().toISOString();
      return {
        _id: String(id),
        author: n?.author,
        body: (n?.body ?? n?.content ?? "") || undefined,
        objective: n?.objective || undefined,
        diagnosis: n?.diagnosis || undefined,
        treatment: n?.treatment || undefined,
        activity: n?.activity || undefined,
        additionalNotes: n?.additionalNotes || undefined,
        createdAt: String(created),
        updatedAt: n?.updatedAt ? String(n.updatedAt) : undefined,
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
        headers: authHeader(token || undefined),
      }).catch(() => null);
      setSummary(sum || null);

      const res = await api(`api/patient-records/${patientId}`, {
        headers: authHeader(token || undefined),
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

  const atLeastOneFilled = useMemo(() => {
    return (
      noteBody.trim() ||
      objective.trim() ||
      diagnosis.trim() ||
      treatment.trim() ||
      activity.trim() ||
      additionalNotes.trim()
    );
  }, [noteBody, objective, diagnosis, treatment, activity, additionalNotes]);

  async function addNote() {
    if (!atLeastOneFilled) {
      setErr("Please enter at least one field.");
      return;
    }
    setErr("");
    setMsg("");
    setAdding(true);
    try {
      const payload: any = {};
      if (noteBody.trim()) payload.body = noteBody.trim();
      if (objective.trim()) payload.objective = objective.trim();
      if (diagnosis.trim()) payload.diagnosis = diagnosis.trim();
      if (treatment.trim()) payload.treatment = treatment.trim();
      if (activity.trim()) payload.activity = activity.trim();
      if (additionalNotes.trim())
        payload.additionalNotes = additionalNotes.trim();

      await api(`api/patient-records/${patientId}/notes`, {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // clear
      setNoteBody("");
      setObjective("");
      setDiagnosis("");
      setTreatment("");
      setActivity("");
      setAdditionalNotes("");
      setMsg("Note added.");
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

  const displayName =
    patient?.name || patient?.email || patient?.phone || "Patient";
  const ptCode =
    patient?.patientId ??
    summary?.patient?.patientId ??
    summary?.patient?.ptNumber ??
    "—";

  const cleanedPreview = useMemo(
    () => cleanTranscript(noteBody || ""),
    [noteBody]
  );

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
      {/* Image to text (OCR) */}
      <div className="mt-3 rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">
            Upload image (OCR)
          </label>
          {ocrBusy && (
            <span className="text-xs text-gray-600">
              Extracting… {ocrProgress}%
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageFiles(e.target.files)}
            disabled={ocrBusy}
            className="block text-sm"
          />
          {ocrPreviewUrl && (
            <a
              href={ocrPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--brand,#4b7eff)] hover:underline"
            >
              Preview selected image
            </a>
          )}
        </div>

        {ocrBusy && (
          <div className="mt-2 h-2 w-full rounded bg-gray-100">
            <div
              className="h-2 rounded bg-[var(--brand,#4b7eff)] transition-all"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Tip: Upload clear, well-lit images (PNG/JPG). For Urdu/Hindi, switch
          language above so OCR uses <code>eng+urd</code> or{" "}
          <code>eng+hin</code>.
        </p>
      </div>

      {canWrite && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Add note</p>
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
                  title={listening ? "Listening…" : "Idle"}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full animate-pulse"
                    style={{
                      background: listening
                        ? "var(--brand,#4b7eff)"
                        : "#9ca3af",
                    }}
                  />
                  {listening ? "Mic on" : "Mic off"}
                </span>
              ) : (
                <span className="text-xs text-amber-700">
                  Speech recognition not supported.
                </span>
              )}
            </div>
          </div>

          <p className="mb-3 mt-1 text-xs text-gray-600">
            Notes are visible to the care team. Avoid PII beyond clinical
            relevance.
          </p>

          {/* Free text (works great with dictation) */}
          <label className="mb-1 block text-sm text-gray-700">
            Session notes (free text)
          </label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={5}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder='Examples: "Objective: patient reports insomnia. Diagnosis: GAD. Treatment: CBT-I. Activity: breathing exercises."'
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
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
              {sttSupported &&
                (listening ? (
                  <Button onClick={sttStop}>⏹ Stop</Button>
                ) : (
                  <Button onClick={sttStart}>🎙 Start</Button>
                ))}
              {sttError && (
                <span className="text-red-600">Mic error: {sttError}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNoteBody(cleanTranscript(noteBody))}
                className="text-[var(--brand,#4b7eff)] hover:underline"
              >
                Clean up text
              </button>
              <button
                type="button"
                onClick={() => {
                  const {
                    objective,
                    diagnosis,
                    treatment,
                    activity,
                    additionalNotes,
                    residual,
                  } = parseStructuredFromText(noteBody);
                  const append = (oldV: string, newV: string) =>
                    oldV && newV ? `${oldV} ${newV}` : oldV || newV || "";
                  setObjective((old) => append(old, objective));
                  setDiagnosis((old) => append(old, diagnosis));
                  setTreatment((old) => append(old, treatment));
                  setActivity((old) => append(old, activity));
                  setAdditionalNotes((old) => append(old, additionalNotes));
                  setNoteBody(residual);
                  setShowStructured(true);
                }}
                className="text-[var(--brand,#4b7eff)] hover:underline"
              >
                Apply structuring now
              </button>
            </div>
          </div>

          {/* Optional: Live cleaned preview */}
          {noteBody && (
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
              <span className="font-medium">Preview:</span>{" "}
              {cleanTranscript(noteBody)}
            </div>
          )}

          {/* Structured fields */}
          <div className="mt-4 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">
              Structured fields
            </label>
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
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Objective
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Observations, patient report, findings…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Diagnosis
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Patient disorder diagnosis…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Treatment
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Plan, CBT modules, medication, handouts…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Activity
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Homework, breathing exercises, journaling…"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-gray-700">
                  Additional notes (optional)
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Anything else you want to capture (optional)"
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button onClick={addNote} disabled={adding || !atLeastOneFilled}>
              {adding ? "Saving…" : "Save note"}
            </Button>
            <button
              type="button"
              className="text-xs text-gray-600 hover:underline"
              onClick={() => {
                setNoteBody("");
                setObjective("");
                setDiagnosis("");
                setTreatment("");
                setActivity("");
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
            {sortedNotes.filter(Boolean).map((n, i) => {
              const hasStructured =
                n.objective ||
                n.diagnosis ||
                n.treatment ||
                n.activity ||
                n.additionalNotes;
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

                  {hasStructured ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-800">
                      {n.objective && (
                        <p>
                          <span className="font-medium">Objective:</span>{" "}
                          {n.objective}
                        </p>
                      )}
                      {n.diagnosis && (
                        <p>
                          <span className="font-medium">Diagnosis:</span>{" "}
                          {n.diagnosis}
                        </p>
                      )}
                      {n.treatment && (
                        <p>
                          <span className="font-medium">Treatment:</span>{" "}
                          {n.treatment}
                        </p>
                      )}
                      {n.activity && (
                        <p>
                          <span className="font-medium">Activity:</span>{" "}
                          {n.activity}
                        </p>
                      )}
                      {n.additionalNotes && (
                        <p>
                          <span className="font-medium">Additional:</span>{" "}
                          {n.additionalNotes}
                        </p>
                      )}
                      {n.body && (
                        <p className="opacity-75">
                          <span className="font-medium">Legacy body:</span>{" "}
                          {n.body}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                      {n.body}
                    </p>
                  )}
                </div>
              );
            })}
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
