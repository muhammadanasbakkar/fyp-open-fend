// "use client";
// import { useEffect, useMemo, useState } from "react";
// import Protected from "@/components/Protected";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import dayjs from "dayjs";

// type Therapist = {
//   _id: string;
//   name?: string;
//   email?: string;
//   phone?: string;
//   profilePicture?: string;
//   role?: "therapist";
// };

// type FreeSlot = { start: string; end: string };
// type FreeResponse = {
//   therapist: string;
//   from: string;
//   to: string;
//   slotMinutes: number;
//   slots: FreeSlot[];
// };

// const SLOT_MINUTES_DEFAULT = 30;

// export default function BookPage() {
//   return (
//     <Protected>
//       <BookInner />
//     </Protected>
//   );
// }

// function BookInner() {
//   const { token } = useAuth();

//   const [therapists, setTherapists] = useState<Therapist[]>([]);
//   const [loadingTherapists, setLoadingTherapists] = useState(false);
//   const [therapistId, setTherapistId] = useState<string>("");

//   const [fromLocal, setFromLocal] = useState<string>(
//     dayjs().startOf("day").add(1, "day").format("YYYY-MM-DDTHH:mm")
//   );
//   const [toLocal, setToLocal] = useState<string>(
//     dayjs().startOf("day").add(8, "day").format("YYYY-MM-DDTHH:mm")
//   );
//   const [slotMinutes, setSlotMinutes] = useState<number>(SLOT_MINUTES_DEFAULT);

//   const [free, setFree] = useState<FreeSlot[]>([]);
//   const [loadingFree, setLoadingFree] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null);

//   const [msg, setMsg] = useState("");
//   const [err, setErr] = useState("");

//   const tz = useMemo(
//     () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
//     []
//   );

//   useEffect(() => {
//     console.log(therapists);
//   }, [therapists]);

//   // ---------- Load therapists ----------
//   useEffect(() => {
//     (async () => {
//       if (!token) return;
//       setLoadingTherapists(true);
//       setErr("");
//       try {
//         // Expecting an array of { _id, name, email, phone, profilePicture, role }
//         // Adjust this path if your route differs (e.g., "/users?role=therapist")
//         const data = await api("api/therapists", {
//           headers: authHeader(token),
//         });

//         console.log(data);
//         setTherapists(Array.isArray(data?.items) ? data?.items : []);
//       } catch (e: any) {
//         setErr(e.message || "Unable to load therapists.");
//       } finally {
//         setLoadingTherapists(false);
//       }
//     })();
//   }, [token]);

//   // ---------- Load free slots for selected therapist ----------
//   async function loadFree() {
//     try {
//       setErr("");
//       setMsg("");
//       setSelectedSlot(null);
//       if (!therapistId) throw new Error("Choose a therapist.");
//       if (!fromLocal || !toLocal) throw new Error("Pick a date range.");

//       const fromISO = dayjs(fromLocal).toISOString();
//       const toISO = dayjs(toLocal).toISOString();

//       setLoadingFree(true);
//       const res: FreeResponse = await api(
//         `api/availability/therapist/${therapistId}/free?from=${encodeURIComponent(
//           fromISO
//         )}&to=${encodeURIComponent(toISO)}&slotMinutes=${slotMinutes}`,
//         { headers: authHeader(token || undefined) }
//       );
//       setFree(res?.slots || []);
//     } catch (e: any) {
//       setErr(e.message || "Could not load free slots.");
//       setFree([]);
//     } finally {
//       setLoadingFree(false);
//     }
//   }

//   // ---------- Book selected slot ----------
//   async function book() {
//     try {
//       setErr("");
//       setMsg("");
//       if (!therapistId) throw new Error("Choose a therapist.");
//       if (!selectedSlot) throw new Error("Choose a time slot.");

//       await api("api/appointments", {
//         method: "POST",
//         headers: authHeader(token || undefined),
//         body: JSON.stringify({
//           therapist: therapistId,
//           start: selectedSlot.start, // ISO
//           end: selectedSlot.end, // ISO
//         }),
//       });

//       setMsg(
//         "Request sent! The therapist will accept/reject. You’ll get a message."
//       );
//       setSelectedSlot(null);
//     } catch (e: any) {
//       setErr(e.message || "Booking failed.");
//     }
//   }

//   const selectedTherapist = therapists.find((t) => t._id === therapistId);

//   return (
//     <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
//       <div>
//         <h1 className="text-2xl font-semibold">Book an appointment</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Times shown in <span className="font-medium">{tz}</span>.
//         </p>
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

//       {/* Therapist list */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <div className="mb-3 flex items-center justify-between">
//           <p className="text-sm font-medium">Choose therapist</p>
//         </div>

//         {loadingTherapists ? (
//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-28 rounded-lg border bg-gray-50 animate-pulse"
//               />
//             ))}
//           </div>
//         ) : therapists.length ? (
//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {therapists.map((t) => (
//               <button
//                 key={t._id}
//                 type="button"
//                 // onClick={() => setTherapistId(t._id)}

//                 onClick={() => {
//                   const now = dayjs();
//                   const twoWeeks = now.add(14, "day");
//                   setTherapistId(t._id);
//                   setFromLocal(now.format("YYYY-MM-DDTHH:mm"));
//                   setToLocal(twoWeeks.format("YYYY-MM-DDTHH:mm"));
//                   setSlotMinutes(30);
//                   // fire and forget load
//                   (async () => {
//                     try {
//                       const fromISO = now.toISOString();
//                       const toISO = twoWeeks.toISOString();
//                       setLoadingFree(true);
//                       const res = await api(
//                         `api/availability/therapist/${
//                           t._id
//                         }/free?from=${encodeURIComponent(
//                           fromISO
//                         )}&to=${encodeURIComponent(toISO)}&slotMinutes=30`,
//                         { headers: authHeader(token || undefined) }
//                       );
//                       setFree(res?.slots || []);
//                       setSelectedSlot(null);
//                       setErr("");
//                     } catch (e: any) {
//                       setErr(e.message || "Could not load free slots.");
//                       setFree([]);
//                     } finally {
//                       setLoadingFree(false);
//                     }
//                   })();
//                 }}
//                 className={`text-left rounded-lg border p-4 hover:bg-gray-50 ${
//                   t._id === therapistId
//                     ? "ring-2 ring-[var(--brand,#4b7eff)]"
//                     : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={t.profilePicture || "/default-avatar.png"}
//                     alt={t.name || t.email || t.phone || "Therapist"}
//                     className="h-12 w-12 rounded-full object-cover"
//                   />
//                   <div className="min-w-0">
//                     <div className="truncate text-sm font-medium">
//                       {t.name || t.email || t.phone || `Therapist`}
//                     </div>
//                     {t.email && (
//                       <div className="truncate text-xs text-gray-500">
//                         {t.email}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">No therapists found.</p>
//         )}
//       </div>

//       {/* Find free slots */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
//         <p className="text-sm font-medium">Pick a date range (your local)</p>
//         <div className="grid gap-4 sm:grid-cols-5">
//           <div className="sm:col-span-2">
//             <label className="mb-1 block text-sm text-gray-700">From</label>
//             <Input
//               type="datetime-local"
//               value={fromLocal}
//               onChange={(e) => setFromLocal(e.target.value)}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <label className="mb-1 block text-sm text-gray-700">To</label>
//             <Input
//               type="datetime-local"
//               value={toLocal}
//               onChange={(e) => setToLocal(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm text-gray-700">
//               Slot length
//             </label>
//             <Select
//               value={String(slotMinutes)}
//               onChange={(e) =>
//                 setSlotMinutes(parseInt(e.target.value || "30", 10))
//               }
//             >
//               {[15, 20, 30, 45, 60].map((m) => (
//                 <option key={m} value={m}>
//                   {m} min
//                 </option>
//               ))}
//             </Select>
//           </div>
//         </div>
//         <div>
//           <Button onClick={loadFree} disabled={!therapistId || loadingFree}>
//             {loadingFree ? "Loading…" : "Find free slots"}
//           </Button>
//         </div>

//         {/* Slots */}
//         {free.length > 0 && (
//           <div className="mt-4">
//             <p className="mb-2 text-sm font-medium">
//               Free slots for{" "}
//               <span className="font-semibold">
//                 {selectedTherapist?.name ||
//                   selectedTherapist?.email ||
//                   selectedTherapist?.phone}
//               </span>
//             </p>
//             <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
//               {free.map((s) => {
//                 const label = `${dayjs(s.start).format(
//                   "ddd, MMM D, HH:mm"
//                 )} – ${dayjs(s.end).format("HH:mm")}`;
//                 const isSelected =
//                   selectedSlot?.start === s.start &&
//                   selectedSlot?.end === s.end;
//                 return (
//                   <button
//                     key={`${s.start}-${s.end}`}
//                     type="button"
//                     onClick={() => setSelectedSlot(s)}
//                     className={`rounded-lg border px-3 py-2 text-sm text-left hover:bg-gray-50 ${
//                       isSelected ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
//                     }`}
//                     title={`${dayjs(s.start).toString()} to ${dayjs(
//                       s.end
//                     ).toString()}`}
//                   >
//                     {label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Book */}
//         <div className="pt-2">
//           <Button onClick={book} disabled={!selectedSlot || !therapistId}>
//             {/* {console.log(therapistId)} */}
//             Send booking request
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Protected from "@/components/Protected";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import dayjs from "dayjs";

// type Therapist = {
//   _id: string;
//   name?: string;
//   email?: string;
//   profilePicture?: string;
//   specializations?: string[];
// };

// type Hospital = {
//   _id: string;
//   name: string;
//   address?: string;
// };

// type Mode = "in-person" | "online";

// export default function BookPage() {
//   return (
//     <Protected>
//       <BookInner />
//     </Protected>
//   );
// }

// function BookInner() {
//   const { token } = useAuth();

//   const [therapists, setTherapists] = useState<Therapist[]>([]);
//   const [loadingTherapists, setLoadingTherapists] = useState(false);

//   const [therapistId, setTherapistId] = useState("");
//   const [mode, setMode] = useState<Mode>("in-person");

//   // HOSPITALS (renamed from clinics)
//   const [hospitals, setHospitals] = useState<Hospital[]>([]);
//   const [loadingHospitals, setLoadingHospitals] = useState(false);
//   const [hospitalId, setHospitalId] = useState("");

//   const [startLocal, setStartLocal] = useState(
//     dayjs().add(1, "hour").minute(0).second(0).millisecond(0).format("YYYY-MM-DDTHH:mm")
//   );
//   const [durationMin, setDurationMin] = useState(60);

//   const [reason, setReason] = useState("");
//   const [meetingLink, setMeetingLink] = useState("");

//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const [posting, setPosting] = useState(false);

//   const tz = useMemo(
//     () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
//     []
//   );

//   // Load therapists (approved)
//   useEffect(() => {
//     if (!token) return;
//     (async () => {
//       setErr("");
//       setLoadingTherapists(true);
//       try {
//         const data = await api("api/therapists", { headers: authHeader(token) });
//         setTherapists(Array.isArray(data?.items) ? data.items : []);
//       } catch (e: any) {
//         setErr(e.message || "Unable to load therapists");
//       } finally {
//         setLoadingTherapists(false);
//       }
//     })();
//   }, [token]);

//   // Load hospitals for selected therapist
//   useEffect(() => {
//     if (!token || !therapistId) return;
//     (async () => {
//       setErr("");
//       setLoadingHospitals(true);
//       setHospitals([]);
//       setHospitalId("");
//       try {
//         // Prefer this route:
//         //   GET /api/therapists/:id/hospitals
//         // Fallback:
//         //   GET /api/hospitals/therapist/:id
//         let data: any;
//         try {
//           data = await api(`api/therapistClinics/therapists/${therapistId}/hospitals`, {
//             headers: authHeader(token),
//           });
//         } catch {
//           data = await api(`api/hospitals/therapist/${therapistId}`, {
//             headers: authHeader(token),
//           });
//         }
//         const list = Array.isArray(data) ? data : Array.isArray(data?.hospitals) ? data.hospitals : [];
//         setHospitals(list);
//         if (list.length) setHospitalId(list[0]._id);
//       } catch (e: any) {
//         // leave hospitals empty if route not implemented
//       } finally {
//         setLoadingHospitals(false);
//       }
//     })();
//   }, [token, therapistId]);

//   async function onSubmit() {
//     setErr("");
//     setMsg("");
//     if (!therapistId) return setErr("Please choose a therapist.");
//     if (!startLocal) return setErr("Please choose a start time.");

//     const startISO = dayjs(startLocal).toISOString();
//     const endISO = dayjs(startLocal).add(durationMin, "minute").toISOString();

//     if (mode === "in-person" && !hospitalId) {
//       return setErr("Please select a hospital/clinic.");
//     }

//     setPosting(true);
//     try {
//       await api("api/appointments", {
//         method: "POST",
//         headers: {
//           ...authHeader(token || undefined),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           therapist: therapistId,
//           // patient inferred on backend if role=patient
//           start: startISO,
//           end: endISO,
//           reason: reason || "",
//           mode,
//           hospital: mode === "in-person" ? hospitalId : undefined, // renamed
//           meetingLink: mode === "online" ? meetingLink : undefined,
//         }),
//       });
//       setMsg("Appointment request sent.");
//       setReason("");
//     } catch (e: any) {
//       setErr(e.message || "Could not create appointment.");
//     } finally {
//       setPosting(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
//       <div>
//         <h1 className="text-2xl font-semibold">Book an appointment</h1>
//         <p className="mt-1 text-sm text-gray-600">Times shown in <span className="font-medium">{tz}</span>.</p>
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

//       {/* Step 1: Mode */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Consultation mode</p>
//         <div className="grid gap-3 sm:grid-cols-2">
//           <label className={`flex items-center gap-2 rounded-lg border p-3 ${mode==='in-person'?'ring-2 ring-[var(--brand,#4b7eff)]':''}`}>
//             <input
//               type="radio"
//               name="mode"
//               checked={mode === "in-person"}
//               onChange={() => setMode("in-person")}
//             />
//             In-person (at a hospital/clinic)
//           </label>
//           <label className={`flex items-center gap-2 rounded-lg border p-3 ${mode==='online'?'ring-2 ring-[var(--brand,#4b7eff)]':''}`}>
//             <input
//               type="radio"
//               name="mode"
//               checked={mode === "online"}
//               onChange={() => setMode("online")}
//             />
//             Online (video)
//           </label>
//         </div>
//       </div>

//       {/* Step 2: Therapist */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Choose therapist</p>
//         {loadingTherapists ? (
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="h-24 rounded-lg border bg-gray-50 animate-pulse" />
//             ))}
//           </div>
//         ) : (
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {therapists.map((t) => (
//               <button
//                 key={t._id}
//                 type="button"
//                 onClick={() => setTherapistId(t._id)}
//                 className={`text-left rounded-lg border p-4 hover:bg-gray-50 ${
//                   t._id === therapistId ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={t.profilePicture || "/default-avatar.png"}
//                     alt={t.name || t.email || "Therapist"}
//                     className="h-10 w-10 rounded-full object-cover"
//                   />
//                   <div className="min-w-0">
//                     <div className="truncate text-sm font-medium">
//                       {t.name || t.email || "Therapist"}
//                     </div>
//                     {!!t.specializations?.length && (
//                       <div className="truncate text-xs text-gray-500">
//                         {t.specializations.slice(0, 3).join(", ")}
//                         {t.specializations.length > 3 ? "…" : ""}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//         {!loadingTherapists && !therapists.length && (
//           <p className="text-sm text-gray-500">No therapists found.</p>
//         )}
//       </div>

//       {/* Step 3: Hospital (only for in-person) */}
//       {mode === "in-person" && therapistId && (
//         <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//           <p className="mb-3 text-sm font-medium">Select hospital/clinic</p>
//           {loadingHospitals ? (
//             <div className="h-10 w-64 animate-pulse rounded-md bg-gray-100" />
//           ) : hospitals.length ? (
//             <Select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
//               {hospitals.map((h) => (
//                 <option key={h?._id} value={h?._id}>
//                   {h?.name}{h?.address ? ` — ${h?.address}` : ""}
//                 </option>
//               ))}
//             </Select>
//           ) : (
//             <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
//               This therapist has no hospitals configured. Please pick a different therapist.
//             </p>
//           )}
//         </div>
//       )}

//       {/* Step 4: Date & time */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Pick date & time (your local)</p>
//         <div className="grid gap-4 sm:grid-cols-3">
//           <div className="sm:col-span-2">
//             <Input
//               type="datetime-local"
//               value={startLocal}
//               onChange={(e) => setStartLocal(e.target.value)}
//             />
//           </div>
//           <div>
//             <Select
//               value={String(durationMin)}
//               onChange={(e) => setDurationMin(Number(e.target.value))}
//             >
//               {[30, 45, 60, 90].map((m) => (
//                 <option key={m} value={m}>
//                   {m} minutes
//                 </option>
//               ))}
//             </Select>
//           </div>
//         </div>
//       </div>

//       {/* Step 5: Details */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Details</p>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="sm:col-span-2">
//             <label className="mb-1 block text-sm text-gray-700">Reason (optional)</label>
//             <textarea
//               className="w-full rounded-md border px-3 py-2 text-sm"
//               rows={3}
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Short note for the therapist"
//             />
//           </div>
//           {mode === "online" && (
//             <div className="sm:col-span-2">
//               <label className="mb-1 block text-sm text-gray-700">Meeting link (optional)</label>
//               <Input
//                 placeholder="https://…"
//                 value={meetingLink}
//                 onChange={(e) => setMeetingLink(e.target.value)}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Submit */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <Button
//           onClick={onSubmit}
//           disabled={
//             posting ||
//             !therapistId ||
//             !startLocal ||
//             (mode === "in-person" && !hospitalId)
//           }
//         >
//           {posting ? "Booking…" : "Book appointment"}
//         </Button>
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Protected from "@/components/Protected";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import dayjs from "dayjs";
// import { useSearchParams } from "next/navigation"; // ← NEW

// type Therapist = {
//   _id: string;
//   name?: string;
//   email?: string;
//   profilePicture?: string;
//   specializations?: string[];
// };

// type Hospital = { _id: string; name: string; address?: string };
// type Slot = { start: string; end: string };
// type Mode = "in-person" | "online";

// // Minimal shape we care about from /api/referrals/:id/packet
// type ReferralPacket = {
//   referral: {
//     _id: string;
//     status: "pending-consent" | "active" | "revoked";
//     patient: string | { _id: string };
//     fromTherapist: string | { _id: string };
//     toTherapist: string | { _id: string };
//     shareScope: "summary" | "selected-notes" | "none";
//   };
//   // summary/notes omitted client-side here
// };

// // ---------- helpers ----------
// const normalizeId = (x: any): string =>
//   typeof x === "string" ? x : x?._id?.toString?.() ?? String(x);

// function uniqById<T extends { _id?: any }>(list: T[]): (T & { _id: string })[] {
//   const m = new Map<string, T & { _id: string }>();
//   for (const h of list.filter(Boolean)) {
//     const id = normalizeId(h?._id);
//     if (!m.has(id)) m.set(id, { ...(h as any), _id: id });
//   }
//   return Array.from(m.values());
// }

// function BookPageInner() {
//   const { token } = useAuth();
//   const searchParams = useSearchParams(); // ← NEW
//   const referralFromQS = searchParams.get("referral") || ""; // ← NEW

//   // therapists
//   const [therapists, setTherapists] = useState<Therapist[]>([]);
//   const [loadingTherapists, setLoadingTherapists] = useState(false);

//   // selection
//   const [therapistId, setTherapistId] = useState("");
//   const [mode, setMode] = useState<Mode>("in-person");

//   // hospitals (for in-person)
//   const [hospitals, setHospitals] = useState<Hospital[]>([]);
//   const [loadingHospitals, setLoadingHospitals] = useState(false);
//   const [hospitalId, setHospitalId] = useState("");

//   // slots
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [slotMinutes, setSlotMinutes] = useState<number>(30);

//   // manual form (fallback / “custom time”)
//   const [startLocal, setStartLocal] = useState(
//     dayjs()
//       .add(1, "hour")
//       .minute(0)
//       .second(0)
//       .millisecond(0)
//       .format("YYYY-MM-DDTHH:mm")
//   );
//   const [durationMin, setDurationMin] = useState(60);
//   const [reason, setReason] = useState("");
//   const [meetingLink, setMeetingLink] = useState("");

//   // ui status
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const [posting, setPosting] = useState(false);

//   const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

//   // REFERRAL STATE (NEW)
//   const [referralId, setReferralId] = useState<string>(referralFromQS);
//   const [referral, setReferral] = useState<ReferralPacket["referral"] | null>(
//     null
//   );
//   const [loadingReferral, setLoadingReferral] = useState(false);
//   const [consenting, setConsenting] = useState(false);
//   const [linkReferral, setLinkReferral] = useState(true); // allow toggling linking when active

//   // clear selection when context changes
//   useEffect(() => {
//     setSelectedSlot(null);
//   }, [therapistId, mode, hospitalId, startLocal, slotMinutes]);

//   async function confirmSelectedSlot() {
//     if (!selectedSlot) return;
//     await bookWithTimes(selectedSlot.start, selectedSlot.end);
//   }

//   const tz = useMemo(
//     () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
//     []
//   );

//   // ---------- Load therapists ----------
//   useEffect(() => {
//     if (!token) return;
//     (async () => {
//       setErr("");
//       setLoadingTherapists(true);
//       try {
//         const data = await api("api/therapists", {
//           headers: authHeader(token),
//         });
//         const list = Array.isArray(data?.items) ? data.items : [];
//         setTherapists(
//           list.map((t: any) => ({ ...t, _id: normalizeId(t?._id) }))
//         );
//       } catch (e: any) {
//         setErr(e.message || "Unable to load therapists");
//       } finally {
//         setLoadingTherapists(false);
//       }
//     })();
//   }, [token]);

//   // ---------- Load referral (NEW) ----------
//   useEffect(() => {
//     if (!token || !referralId) {
//       setReferral(null);
//       return;
//     }
//     (async () => {
//       setLoadingReferral(true);
//       try {
//         // Therapist-2 can read /packet, but patient may not.
//         // We only need meta to guide the UI, so try /packet first; if 403 for patient,
//         // fall back to a light meta read if you expose one; otherwise just ignore errors.
//         const data = await api(`api/referrals/${referralId}/packet`, {
//           headers: authHeader(token),
//         }).catch(() => null);
//         if (data?.referral) {
//           const r = data.referral;
//           const toId = normalizeId(r.toTherapist);
//           const ptId = normalizeId(r.patient);
//           setReferral({
//             _id: r._id,
//             status: r.status,
//             patient: ptId,
//             fromTherapist: normalizeId(r.fromTherapist),
//             toTherapist: toId,
//             shareScope: r.shareScope,
//           });
//           // Preselect therapist if not chosen yet and referral specifies it
//           if (!therapistId && toId) setTherapistId(toId);
//           // Default link on only if active
//           setLinkReferral(r.status === "active");
//         } else {
//           setReferral(null);
//         }
//       } finally {
//         setLoadingReferral(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token, referralId]);

//   // Clear hospital when switching to online
//   useEffect(() => {
//     if (mode === "online") setHospitalId("");
//   }, [mode]);

//   // ---------- Load hospitals for selected therapist ----------
//   useEffect(() => {
//     if (!token || !therapistId || mode !== "in-person") {
//       setHospitals([]);
//       setHospitalId("");
//       return;
//     }
//     (async () => {
//       setErr("");
//       setLoadingHospitals(true);
//       setHospitals([]);
//       setHospitalId("");
//       try {
//         let data: any;
//         try {
//           data = await api(
//             `api/therapist-clinics/therapists/${therapistId}/hospitals`,
//             { headers: authHeader(token) }
//           );
//         } catch {
//           try {
//             data = await api(
//               `api/therapistClinics/therapists/${therapistId}/hospitals`,
//               { headers: authHeader(token) }
//             );
//           } catch {
//             data = await api(`api/hospitals/therapist/${therapistId}`, {
//               headers: authHeader(token),
//             });
//           }
//         }
//         const raw = Array.isArray(data)
//           ? data
//           : Array.isArray(data?.hospitals)
//           ? data.hospitals
//           : [];
//         const deduped: any = uniqById(
//           raw.map((h: any) => ({ ...h, _id: normalizeId(h?._id) }))
//         );
//         setHospitals(deduped);
//         if (deduped.length === 1) setHospitalId(deduped[0]._id);
//       } finally {
//         setLoadingHospitals(false);
//       }
//     })();
//   }, [token, therapistId, mode]);

//   // Helper: get the day window (local → UTC ISO strings)
//   function getSelectedDayWindow() {
//     const day = startLocal ? dayjs(startLocal) : dayjs();
//     const from = day.startOf("day").toDate().toISOString();
//     const to = day.endOf("day").toDate().toISOString();
//     return { from, to };
//   }

//   // ---------- Load free slots whenever inputs change ----------
//   useEffect(() => {
//     if (!token || !therapistId) {
//       setSlots([]);
//       return;
//     }
//     (async () => {
//       setLoadingSlots(true);
//       setSlots([]);
//       try {
//         const { from, to } = getSelectedDayWindow();
//         const qs = new URLSearchParams({
//           from,
//           to,
//           slotMinutes: String(slotMinutes),
//           ...(mode === "in-person" && hospitalId
//             ? { hospital: hospitalId }
//             : {}),
//         });
//         const data = await api(
//           `api/availability/therapist/${therapistId}/free?${qs.toString()}`,
//           { headers: authHeader(token) }
//         );
//         const list: Slot[] = Array.isArray(data?.slots) ? data.slots : [];
//         list.sort((a, b) =>
//           a.start < b.start ? -1 : a.start > b.start ? 1 : 0
//         );
//         setSlots(list);
//       } catch {
//         setSlots([]);
//       } finally {
//         setLoadingSlots(false);
//       }
//     })();
//   }, [token, therapistId, mode, hospitalId, startLocal, slotMinutes]);

//   // ---------- Booking ----------
//   async function bookWithTimes(startISO: string, endISO: string) {
//     setErr("");
//     setMsg("");
//     if (!therapistId) return setErr("Please choose a therapist.");
//     if (mode === "in-person" && !hospitalId)
//       return setErr("Please select a hospital/clinic.");

//     // Include referralId ONLY if:
//     // - we have a referral loaded
//     // - referral is ACTIVE
//     // - selected therapist matches referral.toTherapist
//     const shouldAttachReferral =
//       !!referral &&
//       referral.status === "active" &&
//       normalizeId(referral.toTherapist) === normalizeId(therapistId) &&
//       linkReferral;

//     setPosting(true);
//     try {
//       await api("api/appointments", {
//         method: "POST",
//         headers: {
//           ...authHeader(token || undefined),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           therapist: therapistId,
//           start: startISO,
//           end: endISO,
//           reason: reason || "",
//           mode,
//           hospital: mode === "in-person" ? hospitalId : undefined,
//           meetingLink: mode === "online" ? meetingLink : undefined,
//           referralId: shouldAttachReferral ? referral._id : undefined, // ← NEW
//         }),
//       });
//       setMsg(
//         `Appointment booked${
//           shouldAttachReferral ? " (linked to referral)" : ""
//         }.`
//       );
//     } catch (e: any) {
//       setErr(e.message || "Could not create appointment.");
//     } finally {
//       setPosting(false);
//     }
//   }

//   // Manual submit (fallback)
//   async function onSubmit() {
//     const startISO = dayjs(startLocal).toISOString();
//     const endISO = dayjs(startLocal).add(durationMin, "minute").toISOString();
//     await bookWithTimes(startISO, endISO);
//   }

//   // Patient clicks “Give consent” when pending (NEW)
//   async function giveConsent() {
//     if (!token || !referralId) return;
//     setConsenting(true);
//     setErr("");
//     try {
//       await api(`api/referrals/${referralId}/consent`, {
//         method: "POST",
//         headers: { ...authHeader(token) },
//       });
//       setMsg("Consent recorded. Referral is now active.");
//       // reload referral to update status
//       const data = await api(`api/referrals/${referralId}/packet`, {
//         headers: authHeader(token),
//       }).catch(() => null);
//       if (data?.referral) {
//         const r = data.referral;
//         setReferral({
//           _id: r._id,
//           status: r.status,
//           patient: normalizeId(r.patient),
//           fromTherapist: normalizeId(r.fromTherapist),
//           toTherapist: normalizeId(r.toTherapist),
//           shareScope: r.shareScope,
//         });
//         setLinkReferral(true);
//       }
//     } catch (e: any) {
//       setErr(e.message || "Could not record consent.");
//     } finally {
//       setConsenting(false);
//     }
//   }

//   // After therapist + (if in-person) hospital is chosen:

//   return (
//     <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
//       <div>
//         <h1 className="text-2xl font-semibold">Book an appointment</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Times shown in <span className="font-medium">{tz}</span>.
//         </p>
//       </div>

//       {/* Referral banner (NEW) */}
//       {referralId && (
//         <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
//           {loadingReferral ? (
//             "Checking referral…"
//           ) : referral ? (
//             <>
//               <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <b>Referral:</b>{" "}
//                   {referral.status === "active"
//                     ? "Active (consented)"
//                     : referral.status === "pending-consent"
//                     ? "Pending consent"
//                     : "Revoked"}
//                   {therapistId &&
//                     normalizeId(referral.toTherapist) !==
//                       normalizeId(therapistId) && (
//                       <span className="ml-2 text-red-700">
//                         • Note: This referral is for a different therapist.
//                         Selecting the referred therapist will enable linking.
//                       </span>
//                     )}
//                 </div>
//                 {referral.status === "active" ? (
//                   <label className="inline-flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={linkReferral}
//                       onChange={(e) => setLinkReferral(e.target.checked)}
//                     />
//                     Link this appointment to referral
//                   </label>
//                 ) : referral.status === "pending-consent" ? (
//                   <Button onClick={giveConsent} disabled={consenting}>
//                     {consenting ? "Saving…" : "Give consent to share summary"}
//                   </Button>
//                 ) : null}
//               </div>
//             </>
//           ) : (
//             "Referral not found or not accessible. You can still book without linking."
//           )}
//         </div>
//       )}

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

//       {/* Step 1: Mode */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Consultation mode</p>
//         <div className="grid gap-3 sm:grid-cols-2">
//           <label
//             className={`flex items-center gap-2 rounded-lg border p-3 ${
//               mode === "in-person" ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
//             }`}
//           >
//             <input
//               type="radio"
//               name="mode"
//               checked={mode === "in-person"}
//               onChange={() => setMode("in-person")}
//             />
//             In-person (at a hospital/clinic)
//           </label>
//           <label
//             className={`flex items-center gap-2 rounded-lg border p-3 ${
//               mode === "online" ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
//             }`}
//           >
//             <input
//               type="radio"
//               name="mode"
//               checked={mode === "online"}
//               onChange={() => setMode("online")}
//             />
//             Online (video)
//           </label>
//         </div>
//       </div>

//       {/* Step 2: Therapist */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Choose therapist</p>
//         {loadingTherapists ? (
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-24 rounded-lg border bg-gray-50 animate-pulse"
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {therapists.map((t) => (
//               <button
//                 key={t._id}
//                 type="button"
//                 onClick={() => {
//                   setTherapistId(t._id);
//                   setMsg("");
//                   setErr("");
//                 }}
//                 className={`text-left rounded-lg border p-4 hover:bg-gray-50 ${
//                   t._id === therapistId
//                     ? "ring-2 ring-[var(--brand,#4b7eff)]"
//                     : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={t.profilePicture || "/default-avatar.png"}
//                     alt={t.name || t.email || "Therapist"}
//                     className="h-10 w-10 rounded-full object-cover"
//                   />
//                   <div className="min-w-0">
//                     <div className="truncate text-sm font-medium">
//                       {t.name || t.email || "Therapist"}
//                     </div>
//                     {!!t.specializations?.length && (
//                       <div className="truncate text-xs text-gray-500">
//                         {t.specializations.slice(0, 3).join(", ")}
//                         {t.specializations.length > 3 ? "…" : ""}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//         {!loadingTherapists && !therapists.length && (
//           <p className="text-sm text-gray-500">No therapists found.</p>
//         )}
//       </div>

//       {/* Step 3: Hospital (only for in-person) */}
//       {mode === "in-person" && therapistId && (
//         <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//           <div className="flex items-end justify-between gap-3">
//             <div className="flex-1">
//               <p className="mb-3 text-sm font-medium">Select hospital/clinic</p>
//               {loadingHospitals ? (
//                 <div className="h-10 w-64 animate-pulse rounded-md bg-gray-100" />
//               ) : hospitals.length ? (
//                 <Select
//                   value={hospitalId}
//                   onChange={(e) => setHospitalId(String(e.target.value))}
//                 >
//                   {hospitals.map((h) => (
//                     <option key={h._id} value={h._id}>
//                       {h.name}
//                       {h.address ? ` — ${h.address}` : ""}
//                     </option>
//                   ))}
//                 </Select>
//               ) : (
//                 <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
//                   This therapist has no hospitals configured. Please pick a
//                   different therapist.
//                 </p>
//               )}
//             </div>
//             <div className="w-44">
//               <label className="mb-1 block text-sm text-gray-700">
//                 Slot length
//               </label>
//               <Select
//                 value={String(slotMinutes)}
//                 onChange={(e) => setSlotMinutes(Number(e.target.value))}
//               >
//                 {[15, 20, 30, 45, 60].map((m) => (
//                   <option key={m} value={m}>
//                     {m} min
//                   </option>
//                 ))}
//               </Select>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Step 4: Pick day & SHOW AVAILABLE SLOTS */}
//       {therapistId && (
//         <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//           <div className="flex items-end justify-between gap-3">
//             <div className="sm:w-80">
//               <p className="mb-2 text-sm font-medium">Pick day (local)</p>
//               <Input
//                 type="date"
//                 value={dayjs(startLocal).format("YYYY-MM-DD")}
//                 onChange={(e) => {
//                   const d = dayjs(e.target.value);
//                   const current = dayjs(startLocal);
//                   const next = d.hour(current.hour()).minute(current.minute());
//                   setStartLocal(next.format("YYYY-MM-DDTHH:mm"));
//                 }}
//               />
//             </div>
//             {mode === "online" && (
//               <div className="w-44">
//                 <label className="mb-1 block text-sm text-gray-700">
//                   Slot length
//                 </label>
//                 <Select
//                   value={String(slotMinutes)}
//                   onChange={(e) => setSlotMinutes(Number(e.target.value))}
//                 >
//                   {[15, 20, 30, 45, 60].map((m) => (
//                     <option key={m} value={m}>
//                       {m} min
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             )}
//           </div>

//           <div className="mt-4">
//             <p className="mb-2 text-sm text-gray-700">Available slots</p>
//             {loadingSlots ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
//                 {Array.from({ length: 12 }).map((_, i) => (
//                   <div
//                     key={i}
//                     className="h-9 rounded-md bg-gray-100 animate-pulse"
//                   />
//                 ))}
//               </div>
//             ) : slots.length ? (
//               <>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
//                   {slots.map((s) => {
//                     const start = dayjs(s.start);
//                     const end = dayjs(s.end);
//                     const label = `${start.format("HH:mm")}–${end.format(
//                       "HH:mm"
//                     )}`;
//                     const isSelected =
//                       selectedSlot?.start === s.start &&
//                       selectedSlot?.end === s.end;

//                     return (
//                       <button
//                         key={s.start}
//                         type="button"
//                         disabled={posting}
//                         onClick={() => setSelectedSlot(isSelected ? null : s)}
//                         className={[
//                           "h-9 rounded-md border px-2 text-sm transition",
//                           "hover:bg-gray-50 active:scale-[.99] focus:outline-none focus:ring-2",
//                           isSelected
//                             ? "bg-[var(--brand,#4b7eff)] text-white border-[var(--brand,#4b7eff)] ring-2 ring-[var(--brand,#4b7eff)]"
//                             : "bg-white text-gray-900 border-gray-200",
//                         ].join(" ")}
//                         aria-pressed={isSelected}
//                         aria-label={`Select ${label}`}
//                         title={
//                           isSelected ? `Selected: ${label}` : `Select ${label}`
//                         }
//                       >
//                         {label}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* confirmation strip */}
//                 {selectedSlot && (
//                   <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
//                     <div className="text-sm">
//                       Selected slot:&nbsp;
//                       <span className="font-medium">
//                         {dayjs(selectedSlot.start).format("ddd, MMM D")} •{" "}
//                         {dayjs(selectedSlot.start).format("HH:mm")}–
//                         {dayjs(selectedSlot.end).format("HH:mm")} ({tz})
//                       </span>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button onClick={() => setSelectedSlot(null)}>
//                         Change
//                       </Button>
//                       <Button
//                         onClick={confirmSelectedSlot}
//                         disabled={
//                           posting ||
//                           !therapistId ||
//                           (mode === "in-person" && !hospitalId)
//                         }
//                       >
//                         {posting ? "Booking…" : "Confirm booking"}
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
//                 No free slots for this day. Try another date or change slot
//                 length.
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Step 6: Details */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="mb-3 text-sm font-medium">Details</p>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="sm:col-span-2">
//             <label className="mb-1 block text-sm text-gray-700">
//               Reason (optional)
//             </label>
//             <textarea
//               className="w-full rounded-md border px-3 py-2 text-sm"
//               rows={3}
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Short note for the therapist"
//             />
//           </div>
//           {mode === "online" && (
//             <div className="sm:col-span-2">
//               <label className="mb-1 block text-sm text-gray-700">
//                 Meeting link (optional)
//               </label>
//               <Input
//                 placeholder="https://…"
//                 value={meetingLink}
//                 onChange={(e) => setMeetingLink(e.target.value)}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Submit (manual) */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <Button
//           onClick={onSubmit}
//           disabled={
//             posting || !therapistId || (mode === "in-person" && !hospitalId)
//           }
//         >
//           {posting ? "Booking…" : "Book appointment"}
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default function BookPage() {
//   return (
//     <Protected>
//       <BookPageInner />
//     </Protected>
//   );
// }

// app/book/page.tsx (or wherever this component lives)
"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";

type Therapist = {
  _id: string;
  name?: string;
  email?: string;
  profilePicture?: string;
  specializations?: string[];
};

type Hospital = { _id: string; name: string; address?: string };
type Slot = { start: string; end: string };
type Mode = "in-person" | "online";

// Minimal shape we care about from /api/referrals/:id/packet
type ReferralPacket = {
  referral: {
    _id: string;
    status: "pending-consent" | "active" | "revoked";
    patient: string | { _id: string };
    fromTherapist: string | { _id: string };
    toTherapist: string | { _id: string };
    shareScope: "summary" | "selected-notes" | "none";
  };
};

const normalizeId = (x: any): string =>
  typeof x === "string" ? x : x?._id?.toString?.() ?? String(x);

function uniqById<T extends { _id?: any }>(list: T[]): (T & { _id: string })[] {
  const m = new Map<string, T & { _id: string }>();
  for (const h of list.filter(Boolean)) {
    const id = normalizeId(h?._id);
    if (!m.has(id)) m.set(id, { ...(h as any), _id: id });
  }
  return Array.from(m.values());
}

function BookPageInner() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const referralFromQS = searchParams.get("referral") || "";

  // therapists
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);

  // selection
  const [therapistId, setTherapistId] = useState("");
  const [mode, setMode] = useState<Mode>("in-person");

  // hospitals (for in-person)
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalId, setHospitalId] = useState("");

  // slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotMinutes, setSlotMinutes] = useState<number>(30);

  // manual form (fallback)
  const [startLocal, setStartLocal] = useState(
    dayjs()
      .add(1, "hour")
      .minute(0)
      .second(0)
      .millisecond(0)
      .format("YYYY-MM-DDTHH:mm")
  );
  const [durationMin, setDurationMin] = useState(60);
  const [reason, setReason] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // ui status
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [posting, setPosting] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // REFERRAL
  const [referralId, setReferralId] = useState<string>(referralFromQS);
  const [referral, setReferral] = useState<ReferralPacket["referral"] | null>(
    null
  );
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [consenting, setConsenting] = useState(false);
  const [linkReferral, setLinkReferral] = useState(true);

  // FEES (NEW)
  const [displayFee, setDisplayFee] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("PKR");
  const [loadingFees, setLoadingFees] = useState(false);

  const [phone, setPhone] = useState("");
  const [intentId, setIntentId] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  // clear selection when context changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [therapistId, mode, hospitalId, startLocal, slotMinutes]);

  async function confirmSelectedSlot() {
    if (!selectedSlot) return;
    await bookWithTimes(selectedSlot.start, selectedSlot.end);
  }

  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
    []
  );

  // ---------- Load therapists ----------
  useEffect(() => {
    if (!token) return;
    (async () => {
      setErr("");
      setLoadingTherapists(true);
      try {
        const data = await api("api/therapists", {
          headers: authHeader(token),
        });
        const list = Array.isArray(data?.items) ? data.items : [];
        setTherapists(
          list.map((t: any) => ({ ...t, _id: normalizeId(t?._id) }))
        );
      } catch (e: any) {
        setErr(e.message || "Unable to load therapists");
      } finally {
        setLoadingTherapists(false);
      }
    })();
  }, [token]);

  // ---------- Load referral ----------
  useEffect(() => {
    if (!token || !referralId) {
      setReferral(null);
      return;
    }
    (async () => {
      setLoadingReferral(true);
      try {
        const data = await api(`api/referrals/${referralId}/packet`, {
          headers: authHeader(token),
        }).catch(() => null);
        if (data?.referral) {
          const r = data.referral;
          const toId = normalizeId(r.toTherapist);
          const ptId = normalizeId(r.patient);
          setReferral({
            _id: r._id,
            status: r.status,
            patient: ptId,
            fromTherapist: normalizeId(r.fromTherapist),
            toTherapist: toId,
            shareScope: r.shareScope,
          });
          if (!therapistId && toId) setTherapistId(toId);
          setLinkReferral(r.status === "active");
        } else {
          setReferral(null);
        }
      } finally {
        setLoadingReferral(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, referralId]);

  // Clear hospital when switching to online
  useEffect(() => {
    if (mode === "online") setHospitalId("");
  }, [mode]);

  // ---------- Load hospitals for selected therapist ----------
  useEffect(() => {
    if (!token || !therapistId || mode !== "in-person") {
      setHospitals([]);
      setHospitalId("");
      return;
    }
    (async () => {
      setErr("");
      setLoadingHospitals(true);
      setHospitals([]);
      setHospitalId("");
      try {
        let data: any;
        try {
          data = await api(
            `api/therapist-clinics/therapists/${therapistId}/hospitals`,
            {
              headers: authHeader(token),
            }
          );
        } catch {
          try {
            data = await api(
              `api/therapistClinics/therapists/${therapistId}/hospitals`,
              {
                headers: authHeader(token),
              }
            );
          } catch {
            data = await api(`api/hospitals/therapist/${therapistId}`, {
              headers: authHeader(token),
            });
          }
        }
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.hospitals)
          ? data.hospitals
          : [];
        const deduped: any = uniqById(
          raw.map((h: any) => ({ ...h, _id: normalizeId(h?._id) }))
        );
        setHospitals(deduped);
        if (deduped.length === 1) setHospitalId(deduped[0]._id);
      } finally {
        setLoadingHospitals(false);
      }
    })();
  }, [token, therapistId, mode]);

  // ---------- FEES: fetch & compute whenever therapist/hospital/mode changes ----------
  useEffect(() => {
    if (!token || !therapistId) {
      setDisplayFee(0);
      setCurrency("PKR");
      return;
    }
    (async () => {
      setLoadingFees(true);
      try {
        const data = await api(`api/therapists/${therapistId}/fees`, {
          headers: authHeader(token),
        });

        let fee = 0;
        let cur = data?.therapist?.fees?.currency || "PKR";

        if (mode === "online") {
          fee = data?.therapist?.fees?.online || 0;
        } else {
          // in-person
          const h = (data?.hospitals || []).find(
            (h: any) => h.hospitalId === hospitalId
          );
          fee = h?.fee?.amount ?? data?.therapist?.fees?.inPerson ?? 0;
          cur = h?.fee?.currency || cur;
        }

        setDisplayFee(fee);
        setCurrency(cur);
      } catch {
        setDisplayFee(0);
        setCurrency("PKR");
      } finally {
        setLoadingFees(false);
      }
    })();
  }, [token, therapistId, hospitalId, mode]);

  // Helper: get the day window (local → UTC ISO strings)
  function getSelectedDayWindow() {
    const day = startLocal ? dayjs(startLocal) : dayjs();
    const from = day.startOf("day").toDate().toISOString();
    const to = day.endOf("day").toDate().toISOString();
    return { from, to };
  }

  // ---------- Load free slots whenever inputs change ----------
  useEffect(() => {
    if (!token || !therapistId) {
      setSlots([]);
      return;
    }
    (async () => {
      setLoadingSlots(true);
      setSlots([]);
      try {
        const { from, to } = getSelectedDayWindow();
        const qs = new URLSearchParams({
          from,
          to,
          slotMinutes: String(slotMinutes),
          ...(mode === "in-person" && hospitalId
            ? { hospital: hospitalId }
            : {}),
        });
        const data = await api(
          `api/availability/therapist/${therapistId}/free?${qs.toString()}`,
          { headers: authHeader(token) }
        );
        const list: Slot[] = Array.isArray(data?.slots) ? data.slots : [];
        list.sort((a, b) =>
          a.start < b.start ? -1 : a.start > b.start ? 1 : 0
        );
        setSlots(list);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [token, therapistId, mode, hospitalId, startLocal, slotMinutes]);

  // ---------- Booking ----------
  async function bookWithTimes(startISO: string, endISO: string) {
    setErr("");
    setMsg("");
    if (!therapistId) return setErr("Please choose a therapist.");
    if (mode === "in-person" && !hospitalId)
      return setErr("Please select a hospital/clinic.");

    const shouldAttachReferral =
      !!referral &&
      referral.status === "active" &&
      normalizeId(referral.toTherapist) === normalizeId(therapistId) &&
      linkReferral;

    setPosting(true);
    try {
      await api("api/appointments", {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapist: therapistId,
          start: startISO,
          end: endISO,
          reason: reason || "",
          mode,
          hospital: mode === "in-person" ? hospitalId : undefined,
          meetingLink: mode === "online" ? meetingLink : undefined,
          referralId: shouldAttachReferral ? referral._id : undefined,
        }),
      });
      setMsg(
        `Appointment booked${
          shouldAttachReferral ? " (linked to referral)" : ""
        }.`
      );
    } catch (e: any) {
      setErr(e.message || "Could not create appointment.");
    } finally {
      setPosting(false);
    }
  }

  // Manual submit (fallback)
  async function onSubmit() {
    const startISO = dayjs(startLocal).toISOString();
    const endISO = dayjs(startLocal).add(durationMin, "minute").toISOString();
    await bookWithTimes(startISO, endISO);
  }

  // async function confirmSelectedSlot() {
  //   if (!selectedSlot) return;
  //   await startOtpFlow(selectedSlot.start, selectedSlot.end);
  // }

  async function startOtpFlow(startISO: string, endISO: string) {
    setErr("");
    setMsg("");
    setOtpErr("");
    if (!phone.trim()) {
      setErr("Please enter your phone.");
      return;
    }
    if (mode === "in-person" && !hospitalId) {
      setErr("Please select a hospital.");
      return;
    }

    try {
      const body = {
        phone: phone.trim(),
        therapist: therapistId,
        start: startISO,
        end: endISO,
        reason,
        mode,
        hospital: mode === "in-person" ? hospitalId : undefined,
        meetingLink: mode === "online" ? meetingLink : undefined,
        referralId: referral && linkReferral ? referral._id : undefined,
      };
      const data = await api("api/otp/booking/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setIntentId(data.intentId);
      setOtpSent(true);
      setShowOtp(true);
      setMsg(`OTP sent to ${data.phoneMasked}.`);
    } catch (e: any) {
      setErr(e.message || "Could not send OTP.");
    }
  }

  async function verifyOtpAndBook() {
    setOtpErr("");
    setErr("");
    setMsg("");
    try {
      await api("api/otp/booking/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId,
          phone: phone.trim(),
          code: otpCode.trim(),
        }),
      });
      // finalize booking (requires auth)
      await api("api/appointments/confirm", {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intentId }),
      });
      setShowOtp(false);
      setSelectedSlot(null);
      setMsg("Appointment booked ✅");
    } catch (e: any) {
      if (
        String(e.message || "")
          .toLowerCase()
          .includes("code")
      )
        setOtpErr(e.message);
      else setErr(e.message || "Failed to verify / book");
    }
  }

  async function giveConsent() {
    if (!token || !referralId) return;
    setConsenting(true);
    setErr("");
    try {
      await api(`api/referrals/${referralId}/consent`, {
        method: "POST",
        headers: { ...authHeader(token) },
      });
      setMsg("Consent recorded. Referral is now active.");
      const data = await api(`api/referrals/${referralId}/packet`, {
        headers: authHeader(token),
      }).catch(() => null);
      if (data?.referral) {
        const r = data.referral;
        setReferral({
          _id: r._id,
          status: r.status,
          patient: normalizeId(r.patient),
          fromTherapist: normalizeId(r.fromTherapist),
          toTherapist: normalizeId(r.toTherapist),
          shareScope: r.shareScope,
        });
        setLinkReferral(true);
      }
    } catch (e: any) {
      setErr(e.message || "Could not record consent.");
    } finally {
      setConsenting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Book an appointment</h1>
        <p className="mt-1 text-sm text-gray-600">
          Times shown in <span className="font-medium">{tz}</span>.
        </p>
      </div>

      {/* Referral banner */}
      {referralId && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {loadingReferral ? (
            "Checking referral…"
          ) : referral ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <b>Referral:</b>{" "}
                  {referral.status === "active"
                    ? "Active (consented)"
                    : referral.status === "pending-consent"
                    ? "Pending consent"
                    : "Revoked"}
                  {therapistId &&
                    normalizeId(referral.toTherapist) !==
                      normalizeId(therapistId) && (
                      <span className="ml-2 text-red-700">
                        • Note: This referral is for a different therapist.
                        Selecting the referred therapist will enable linking.
                      </span>
                    )}
                </div>
                {referral.status === "active" ? (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={linkReferral}
                      onChange={(e) => setLinkReferral(e.target.checked)}
                    />
                    Link this appointment to referral
                  </label>
                ) : referral.status === "pending-consent" ? (
                  <Button onClick={giveConsent} disabled={consenting}>
                    {consenting ? "Saving…" : "Give consent to share summary"}
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            "Referral not found or not accessible. You can still book without linking."
          )}
        </div>
      )}

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

      {/* Step 1: Mode */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium">Consultation mode</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex items-center gap-2 rounded-lg border p-3 ${
              mode === "in-person" ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
            }`}
          >
            <input
              type="radio"
              name="mode"
              checked={mode === "in-person"}
              onChange={() => setMode("in-person")}
            />
            In-person (at a hospital/clinic)
          </label>
          <label
            className={`flex items-center gap-2 rounded-lg border p-3 ${
              mode === "online" ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
            }`}
          >
            <input
              type="radio"
              name="mode"
              checked={mode === "online"}
              onChange={() => setMode("online")}
            />
            Online (video)
          </label>
        </div>
      </div>

      {/* Step 2: Therapist */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium">Choose therapist</p>
        {loadingTherapists ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg border bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {therapists.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => {
                  setTherapistId(t._id);
                  setMsg("");
                  setErr("");
                }}
                className={`text-left rounded-lg border p-4 hover:bg-gray-50 ${
                  t._id === therapistId
                    ? "ring-2 ring-[var(--brand,#4b7eff)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.profilePicture || "/default-avatar.png"}
                    alt={t.name || t.email || "Therapist"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {t.name || t.email || "Therapist"}
                    </div>
                    {!!t.specializations?.length && (
                      <div className="truncate text-xs text-gray-500">
                        {t.specializations.slice(0, 3).join(", ")}
                        {t.specializations.length > 3 ? "…" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {!loadingTherapists && !therapists.length && (
          <p className="text-sm text-gray-500">No therapists found.</p>
        )}
      </div>

      {/* Step 3: Hospital (only for in-person) */}
      {mode === "in-person" && therapistId && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <p className="mb-3 text-sm font-medium">Select hospital/clinic</p>
              {loadingHospitals ? (
                <div className="h-10 w-64 animate-pulse rounded-md bg-gray-100" />
              ) : hospitals.length ? (
                <Select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(String(e.target.value))}
                >
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                      {h.address ? ` — ${h.address}` : ""}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  This therapist has no hospitals configured. Please pick a
                  different therapist.
                </p>
              )}
            </div>
            <div className="w-44">
              <label className="mb-1 block text-sm text-gray-700">
                Slot length
              </label>
              <Select
                value={String(slotMinutes)}
                onChange={(e) => setSlotMinutes(Number(e.target.value))}
              >
                {[15, 20, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Price strip (in-person) */}
          {therapistId && hospitalId && (
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              {loadingFees ? (
                "Calculating fee…"
              ) : (
                <>
                  Estimated fee:&nbsp;
                  <span className="font-medium">
                    {currency} {Number(displayFee || 0).toLocaleString()}
                  </span>
                  <span className="text-gray-500"> (paid at clinic)</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-gray-700">
          Phone (verify by SMS)
        </label>
        <Input
          placeholder="+92XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      {/* Step 4: Pick day & SHOW AVAILABLE SLOTS */}
      {therapistId && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div className="sm:w-80">
              <p className="mb-2 text-sm font-medium">Pick day (local)</p>
              <Input
                type="date"
                value={dayjs(startLocal).format("YYYY-MM-DD")}
                onChange={(e) => {
                  const d = dayjs(e.target.value);
                  const current = dayjs(startLocal);
                  const next = d.hour(current.hour()).minute(current.minute());
                  setStartLocal(next.format("YYYY-MM-DDTHH:mm"));
                }}
              />
            </div>
            {mode === "online" && (
              <div className="w-44">
                <label className="mb-1 block text-sm text-gray-700">
                  Slot length
                </label>
                <Select
                  value={String(slotMinutes)}
                  onChange={(e) => setSlotMinutes(Number(e.target.value))}
                >
                  {[15, 20, 30, 45, 60].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-700">Available slots</p>
            {loadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-md bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : slots.length ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {slots.map((s) => {
                    const start = dayjs(s.start);
                    const end = dayjs(s.end);
                    const label = `${start.format("HH:mm")}–${end.format(
                      "HH:mm"
                    )}`;
                    const isSelected =
                      selectedSlot?.start === s.start &&
                      selectedSlot?.end === s.end;

                    return (
                      <button
                        key={s.start}
                        type="button"
                        disabled={posting}
                        onClick={() => setSelectedSlot(isSelected ? null : s)}
                        className={[
                          "h-9 rounded-md border px-2 text-sm transition",
                          "hover:bg-gray-50 active:scale-[.99] focus:outline-none focus:ring-2",
                          isSelected
                            ? "bg-[var(--brand,#4b7eff)] text-white border-[var(--brand,#4b7eff)] ring-2 ring-[var(--brand,#4b7eff)]"
                            : "bg-white text-gray-900 border-gray-200",
                        ].join(" ")}
                        aria-pressed={isSelected}
                        aria-label={`Select ${label}`}
                        title={
                          isSelected ? `Selected: ${label}` : `Select ${label}`
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* confirmation strip */}
                {selectedSlot && (
                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="text-sm">
                      <div>
                        Selected:&nbsp;
                        <span className="font-medium">
                          {dayjs(selectedSlot.start).format("ddd, MMM D")} •{" "}
                          {dayjs(selectedSlot.start).format("HH:mm")}–
                          {dayjs(selectedSlot.end).format("HH:mm")} ({tz})
                        </span>
                      </div>
                      <div className="mt-1">
                        {loadingFees ? (
                          "Calculating fee…"
                        ) : (
                          <>
                            Estimated fee:&nbsp;
                            <span className="font-medium">
                              {currency}{" "}
                              {Number(displayFee || 0).toLocaleString()}
                            </span>
                            {mode === "in-person" ? (
                              <span className="text-gray-500">
                                {" "}
                                (paid at clinic)
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setSelectedSlot(null)}>
                        Change
                      </Button>
                      <Button
                        onClick={confirmSelectedSlot}
                        disabled={
                          posting ||
                          !therapistId ||
                          (mode === "in-person" && !hospitalId)
                        }
                      >
                        {posting ? "Booking…" : "Confirm booking"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                No free slots for this day. Try another date or change slot
                length.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 6: Details */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium">Details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-700">
              Reason (optional)
            </label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Short note for the therapist"
            />
          </div>
          {mode === "online" && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-gray-700">
                Meeting link (optional)
              </label>
              <Input
                placeholder="https://…"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Fee echo near manual booking button */}
        {therapistId && (
          <div className="mt-3 text-sm text-gray-700">
            {loadingFees ? (
              "Calculating fee…"
            ) : (
              <>
                Estimated fee:&nbsp;
                <span className="font-medium">
                  {currency} {Number(displayFee || 0).toLocaleString()}
                </span>
                {mode === "in-person" ? (
                  <span className="text-gray-500"> (paid at clinic)</span>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      {/* Submit (manual) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Button
          onClick={onSubmit}
          disabled={
            posting || !therapistId || (mode === "in-person" && !hospitalId)
          }
        >
          {posting ? "Booking…" : "Book appointment"}
        </Button>
      </div>

      {showOtp && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-sm font-medium">Enter verification code</p>
            <p className="mt-1 text-xs text-gray-600">
              We sent a 6-digit code to <b>{phone}</b>.
            </p>
            <Input
              className="mt-3"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
            />
            {otpErr && <p className="mt-2 text-xs text-red-600">{otpErr}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => setShowOtp(false)} 
              // variant="secondary"
              >
                Cancel
              </Button>
              <Button onClick={verifyOtpAndBook}>Verify & Book</Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Didn’t get the code? Wait a moment and check coverage. (Resend
              logic can be added.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Protected>
      <BookPageInner />
    </Protected>
  );
}
