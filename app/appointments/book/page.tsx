// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Protected from "@/components/Protected";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import dayjs from "dayjs";
// import { useSearchParams } from "next/navigation";

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
// };

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
//   const searchParams = useSearchParams();
//   const referralFromQS = searchParams.get("referral") || "";

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

//   // manual form (fallback)
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

//   // REFERRAL
//   const [referralId, setReferralId] = useState<string>(referralFromQS);
//   const [referral, setReferral] = useState<ReferralPacket["referral"] | null>(
//     null
//   );
//   const [loadingReferral, setLoadingReferral] = useState(false);
//   const [consenting, setConsenting] = useState(false);
//   const [linkReferral, setLinkReferral] = useState(true);

//   // FEES (NEW)
//   const [displayFee, setDisplayFee] = useState<number>(0);
//   const [currency, setCurrency] = useState<string>("PKR");
//   const [loadingFees, setLoadingFees] = useState(false);

//   const [phone, setPhone] = useState("");
//   const [intentId, setIntentId] = useState<string>("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpCode, setOtpCode] = useState("");
//   const [otpErr, setOtpErr] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
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

//   // ---------- Load referral ----------
//   useEffect(() => {
//     if (!token || !referralId) {
//       setReferral(null);
//       return;
//     }
//     (async () => {
//       setLoadingReferral(true);
//       try {
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
//           if (!therapistId && toId) setTherapistId(toId);
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
//             {
//               headers: authHeader(token),
//             }
//           );
//         } catch {
//           try {
//             data = await api(
//               `api/therapistClinics/therapists/${therapistId}/hospitals`,
//               {
//                 headers: authHeader(token),
//               }
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

//   // ---------- FEES: fetch & compute whenever therapist/hospital/mode changes ----------
//   useEffect(() => {
//     if (!token || !therapistId) {
//       setDisplayFee(0);
//       setCurrency("PKR");
//       return;
//     }
//     (async () => {
//       setLoadingFees(true);
//       try {
//         const data = await api(`api/therapists/${therapistId}/fees`, {
//           headers: authHeader(token),
//         });

//         let fee = 0;
//         let cur = data?.therapist?.fees?.currency || "PKR";

//         if (mode === "online") {
//           fee = data?.therapist?.fees?.online || 0;
//         } else {
//           // in-person
//           const h = (data?.hospitals || []).find(
//             (h: any) => h.hospitalId === hospitalId
//           );
//           fee = h?.fee?.amount ?? data?.therapist?.fees?.inPerson ?? 0;
//           cur = h?.fee?.currency || cur;
//         }

//         setDisplayFee(fee);
//         setCurrency(cur);
//       } catch {
//         setDisplayFee(0);
//         setCurrency("PKR");
//       } finally {
//         setLoadingFees(false);
//       }
//     })();
//   }, [token, therapistId, hospitalId, mode]);

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
//           referralId: shouldAttachReferral ? referral._id : undefined,
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

//   // async function confirmSelectedSlot() {
//   //   if (!selectedSlot) return;
//   //   await startOtpFlow(selectedSlot.start, selectedSlot.end);
//   // }

//   async function startOtpFlow(startISO: string, endISO: string) {
//     setErr("");
//     setMsg("");
//     setOtpErr("");
//     if (!phone.trim()) {
//       setErr("Please enter your phone.");
//       return;
//     }
//     if (mode === "in-person" && !hospitalId) {
//       setErr("Please select a hospital.");
//       return;
//     }

//     try {
//       const body = {
//         phone: phone.trim(),
//         therapist: therapistId,
//         start: startISO,
//         end: endISO,
//         reason,
//         mode,
//         hospital: mode === "in-person" ? hospitalId : undefined,
//         meetingLink: mode === "online" ? meetingLink : undefined,
//         referralId: referral && linkReferral ? referral._id : undefined,
//       };
//       const data = await api("api/otp/booking/intent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       setIntentId(data.intentId);
//       setOtpSent(true);
//       setShowOtp(true);
//       setMsg(`OTP sent to ${data.phoneMasked}.`);
//     } catch (e: any) {
//       setErr(e.message || "Could not send OTP.");
//     }
//   }

//   async function verifyOtpAndBook() {
//     setOtpErr("");
//     setErr("");
//     setMsg("");
//     try {
//       await api("api/otp/booking/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           intentId,
//           phone: phone.trim(),
//           code: otpCode.trim(),
//         }),
//       });
//       // finalize booking (requires auth)
//       await api("api/appointments/confirm", {
//         method: "POST",
//         headers: {
//           ...authHeader(token || undefined),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ intentId }),
//       });
//       setShowOtp(false);
//       setSelectedSlot(null);
//       setMsg("Appointment booked ✅");
//     } catch (e: any) {
//       if (
//         String(e.message || "")
//           .toLowerCase()
//           .includes("code")
//       )
//         setOtpErr(e.message);
//       else setErr(e.message || "Failed to verify / book");
//     }
//   }

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

//   return (
//     <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
//       <div>
//         <h1 className="text-2xl font-semibold">Book an appointment</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Times shown in <span className="font-medium">{tz}</span>.
//         </p>
//       </div>

//       {/* Referral banner */}
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
//             } ${mode === "online" ? "" : "opacity-50 cursor-not-allowed"}`} // disable styles
//           >
//             <input
//               type="radio"
//               name="mode"
//               checked={mode === "online"}
//               onChange={() => setMode("online")}
//               disabled={true}
//             />
//             Online (video) — coming soon!
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

//           {/* Price strip (in-person) */}
//           {therapistId && hospitalId && (
//             <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
//               {loadingFees ? (
//                 "Calculating fee…"
//               ) : (
//                 <>
//                   Estimated fee:&nbsp;
//                   <span className="font-medium">
//                     {currency} {Number(displayFee || 0).toLocaleString()}
//                   </span>
//                   <span className="text-gray-500"> (paid at clinic)</span>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       <div>
//         <label className="mb-1 block text-sm text-gray-700">
//           Phone (verify by SMS)
//         </label>
//         <Input
//           placeholder="+92XXXXXXXXXX"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//         />
//       </div>
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
//                       <div>
//                         Selected:&nbsp;
//                         <span className="font-medium">
//                           {dayjs(selectedSlot.start).format("ddd, MMM D")} •{" "}
//                           {dayjs(selectedSlot.start).format("HH:mm")}–
//                           {dayjs(selectedSlot.end).format("HH:mm")} ({tz})
//                         </span>
//                       </div>
//                       <div className="mt-1">
//                         {loadingFees ? (
//                           "Calculating fee…"
//                         ) : (
//                           <>
//                             Estimated fee:&nbsp;
//                             <span className="font-medium">
//                               {currency}{" "}
//                               {Number(displayFee || 0).toLocaleString()}
//                             </span>
//                             {mode === "in-person" ? (
//                               <span className="text-gray-500">
//                                 {" "}
//                                 (paid at clinic)
//                               </span>
//                             ) : null}
//                           </>
//                         )}
//                       </div>
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

//         {/* Fee echo near manual booking button */}
//         {therapistId && (
//           <div className="mt-3 text-sm text-gray-700">
//             {loadingFees ? (
//               "Calculating fee…"
//             ) : (
//               <>
//                 Estimated fee:&nbsp;
//                 <span className="font-medium">
//                   {currency} {Number(displayFee || 0).toLocaleString()}
//                 </span>
//                 {mode === "in-person" ? (
//                   <span className="text-gray-500"> (paid at clinic)</span>
//                 ) : null}
//               </>
//             )}
//           </div>
//         )}
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

//       {showOtp && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
//           <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
//             <p className="text-sm font-medium">Enter verification code</p>
//             <p className="mt-1 text-xs text-gray-600">
//               We sent a 6-digit code to <b>{phone}</b>.
//             </p>
//             <Input
//               className="mt-3"
//               placeholder="123456"
//               value={otpCode}
//               onChange={(e) => setOtpCode(e.target.value)}
//               maxLength={6}
//             />
//             {otpErr && <p className="mt-2 text-xs text-red-600">{otpErr}</p>}
//             <div className="mt-4 flex justify-end gap-2">
//               <Button
//                 onClick={() => setShowOtp(false)}
//                 // variant="secondary"
//               >
//                 Cancel
//               </Button>
//               <Button onClick={verifyOtpAndBook}>Verify & Book</Button>
//             </div>
//             <p className="mt-2 text-xs text-gray-500">
//               Didn’t get the code? Wait a moment and check coverage. (Resend
//               logic can be added.)
//             </p>
//           </div>
//         </div>
//       )}
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

// // app/book/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Protected from "@/components/Protected";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import dayjs from "dayjs";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
// import Image from "next/image";

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

// // Minimal slice from /api/referrals/:id/packet
// type ReferralPacket = {
//   referral: {
//     _id: string;
//     status: "pending-consent" | "active" | "revoked";
//     patient: string | { _id: string };
//     fromTherapist: string | { _id: string };
//     toTherapist: string | { _id: string };
//     shareScope: "summary" | "selected-notes" | "none";
//   };
// };

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
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const referralFromQS = searchParams.get("referral") || "";

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

//   // manual form (fallback)
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

//   const [phone, setPhone] = useState("");
//   const [phoneErr, setPhoneErr] = useState("");

//   // ui status
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const [posting, setPosting] = useState(false);

//   const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

//   // REFERRAL
//   const [referralId, setReferralId] = useState<string>(referralFromQS);
//   const [referral, setReferral] = useState<ReferralPacket["referral"] | null>(
//     null
//   );
//   const [loadingReferral, setLoadingReferral] = useState(false);
//   const [consenting, setConsenting] = useState(false);
//   const [linkReferral, setLinkReferral] = useState(true);

//   // FEES
//   const [displayFee, setDisplayFee] = useState<number>(0);
//   const [currency, setCurrency] = useState<string>("PKR");
//   const [loadingFees, setLoadingFees] = useState(false);

//   // EMAIL OTP (replaces phone)
//   const [emailAddr, setEmailAddr] = useState("");
//   const [intentId, setIntentId] = useState<string>("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpCode, setOtpCode] = useState("");
//   const [otpErr, setOtpErr] = useState("");
//   const [showOtp, setShowOtp] = useState(false);

//   const tz = useMemo(
//     () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
//     []
//   );

//   // reset selection changes
//   useEffect(() => {
//     setSelectedSlot(null);
//   }, [therapistId, mode, hospitalId, startLocal, slotMinutes]);

//   // therapists
//   useEffect(() => {
//     console.log("Loading therapists...");
//     if (!token) return;
//     (async () => {
//       setErr("");
//       setLoadingTherapists(true);
//       try {
//         const data = await api("api/therapists", {
//           headers: authHeader(token) as HeadersInit,
//         });

//         console.log("Therapists data:", data);
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

//   // referral
//   useEffect(() => {
//     if (!token || !referralId) {
//       setReferral(null);
//       return;
//     }
//     (async () => {
//       setLoadingReferral(true);
//       try {
//         const data = await api(`api/referrals/${referralId}/packet`, {
//           headers: authHeader(token) as HeadersInit,
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
//           if (!therapistId && toId) setTherapistId(toId);
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

//   // hospitals
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
//             { headers: authHeader(token) as HeadersInit }
//           );
//         } catch {
//           try {
//             data = await api(
//               `api/therapistClinics/therapists/${therapistId}/hospitals`,
//               { headers: authHeader(token) as HeadersInit }
//             );
//           } catch {
//             data = await api(`api/hospitals/therapist/${therapistId}`, {
//               headers: authHeader(token) as HeadersInit,
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

//   // fees
//   useEffect(() => {
//     if (!token || !therapistId) {
//       setDisplayFee(0);
//       setCurrency("PKR");
//       return;
//     }
//     (async () => {
//       setLoadingFees(true);
//       try {
//         const data = await api(`api/therapists/${therapistId}/fees`, {
//           headers: authHeader(token) as HeadersInit,
//         });

//         let fee = 0;
//         let cur = data?.therapist?.fees?.currency || "PKR";

//         if (mode === "online") {
//           fee = data?.therapist?.fees?.online || 0;
//         } else {
//           const h = (data?.hospitals || []).find(
//             (h: any) => h.hospitalId === hospitalId
//           );
//           fee = h?.fee?.amount ?? data?.therapist?.fees?.inPerson ?? 0;
//           cur = h?.fee?.currency || cur;
//         }

//         setDisplayFee(fee);
//         setCurrency(cur);
//       } catch {
//         setDisplayFee(0);
//         setCurrency("PKR");
//       } finally {
//         setLoadingFees(false);
//       }
//     })();
//   }, [token, therapistId, hospitalId, mode]);

//   // day window helper
//   function getSelectedDayWindow() {
//     const day = startLocal ? dayjs(startLocal) : dayjs();
//     const from = day.startOf("day").toDate().toISOString();
//     const to = day.endOf("day").toDate().toISOString();
//     return { from, to };
//   }

//   // load free slots
//   // useEffect(() => {
//   //   if (!token || !therapistId) {
//   //     setSlots([]);
//   //     return;
//   //   }
//   //   (async () => {
//   //     setLoadingSlots(true);
//   //     setSlots([]);
//   //     try {
//   //       const { from, to } = getSelectedDayWindow();
//   //       const qs = new URLSearchParams({
//   //         from,
//   //         to,
//   //         slotMinutes: String(slotMinutes),
//   //         ...(mode === "in-person" && hospitalId
//   //           ? { hospital: hospitalId }
//   //           : {}),
//   //       });
//   //       const data = await api(
//   //         `api/availability/therapist/${therapistId}/free?${qs.toString()}`,
//   //         { headers: authHeader(token) as HeadersInit }
//   //       );
//   //       const list: Slot[] = Array.isArray(data?.slots) ? data.slots : [];
//   //       list.sort((a, b) =>
//   //         a.start < b.start ? -1 : a.start > b.start ? 1 : 0
//   //       );
//   //       setSlots(list);
//   //     } catch {
//   //       setSlots([]);
//   //     } finally {
//   //       setLoadingSlots(false);
//   //     }
//   //   })();
//   // }, [token, therapistId, mode, hospitalId, startLocal, slotMinutes]);

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
//           // tell backend which kind of availability to fetch
//           mode: mode === "in-person" ? "inPerson" : "online",
//         });

//         if (mode === "in-person" && hospitalId) {
//           qs.set("hospital", hospitalId);
//         }

//         const data = await api(
//           `api/availability/therapist/${therapistId}/free?${qs.toString()}`,
//           { headers: authHeader(token) as HeadersInit }
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

//   // booking (direct/manual)
//   async function bookWithTimes(startISO: string, endISO: string) {
//     setErr("");
//     setMsg("");
//     if (!therapistId) return setErr("Please choose a therapist.");
//     if (mode === "in-person" && !hospitalId)
//       return setErr("Please select a hospital/clinic.");

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
//           ...(token ? authHeader(token) : {}),
//           "Content-Type": "application/json",
//         } as HeadersInit,
//         body: JSON.stringify({
//           therapist: therapistId,
//           start: startISO,
//           end: endISO,
//           reason: reason || "",
//           mode,
//           hospital: mode === "in-person" ? hospitalId : undefined,
//           meetingLink: mode === "online" ? meetingLink : undefined,
//           referralId: shouldAttachReferral ? referral._id : undefined,
//         }),
//       });
//       router.push("/appointments/verify"); // redirect to appointments list
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

//   // ===== EMAIL OTP FLOW =====
//   async function startEmailOtpFlow(startISO: string, endISO: string) {
//     setErr("");
//     setMsg("");
//     setOtpErr("");

//     if (mode === "online" && !isValidPhone(phone.trim())) {
//       setErr("Please enter a valid mobile number for video coordination.");
//       setPhoneErr("Enter a valid number like +92 3XX XXXXXXX");
//       return;
//     }

//     if (!emailAddr.trim()) {
//       setErr("Please enter a valid email.");
//       return;
//     }
//     if (!therapistId) {
//       setErr("Please choose a therapist.");
//       return;
//     }
//     if (mode === "in-person" && !hospitalId) {
//       setErr("Please select a hospital/clinic.");
//       return;
//     }

//     if (!token) {
//       setErr("Session expired. Please log in again.");
//       return;
//     }

//     try {
//       const body: any = {
//         email: emailAddr.trim(),
//         therapist: therapistId,
//         start: startISO,
//         end: endISO,
//         mode: mode === "in-person" ? "inPerson" : "online",
//         reason,
//         phone: phone.trim(), // 👈 add this
//         hospital: mode === "in-person" ? hospitalId : undefined,
//         meetingLink: mode === "online" ? meetingLink : undefined,
//         // referralId: referral && linkReferral ? referral._id : undefined,
//       };

//       const data = await api("api/appointments/intent", {
//         method: "POST",
//         headers: {
//           ...(authHeader(token) as HeadersInit), // 👈 add auth here
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       // redirect to verify page with intentId
//       const intentIdFromApi = data.intentId;
//       const email = encodeURIComponent(emailAddr.trim());
//       router.push(`/appointments/verify/${intentIdFromApi}?email=${email}`);
//     } catch (e: any) {
//       setErr(e.message || "Could not send verification email.");
//     }
//   }

//   async function verifyOtpAndBook() {
//     setOtpErr("");
//     setErr("");
//     setMsg("");
//     try {
//       if (!token) throw new Error("Session expired. Please log in again.");

//       await api("api/appointments/verify", {
//         // <-- new endpoint
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? authHeader(token) : {}), // ✅ add JWT here
//         } as HeadersInit,
//         body: JSON.stringify({
//           intentId,
//           email: emailAddr.trim(),
//           code: otpCode.trim(),
//         }),
//       });

//       await api("api/appointments/confirm", {
//         // <-- confirm (with auth)
//         method: "POST",
//         headers: {
//           ...authHeader(token || undefined), // <-- spread fix
//           "Content-Type": "application/json",
//         } as HeadersInit,
//         body: JSON.stringify({ intentId }),
//       });

//       setShowOtp(false);
//       setSelectedSlot(null);
//       setMsg("Appointment booked ✅");
//     } catch (e: any) {
//       if (
//         String(e.message || "")
//           .toLowerCase()
//           .includes("code")
//       )
//         setOtpErr(e.message);
//       else setErr(e.message || "Failed to verify / book");
//     }
//   }

//   function isValidPhone(x: string) {
//     // very light check. starts with + or digit. 10 to 15 digits total
//     const digits = x.replace(/[^\d]/g, "");
//     return (
//       /^[+]?[\d\s\-()]+$/.test(x) && digits.length >= 10 && digits.length <= 15
//     );
//   }
//   // Confirm selected slot → start email OTP
//   async function confirmSelectedSlot() {
//     if (!selectedSlot) return;
//     await startEmailOtpFlow(selectedSlot.start, selectedSlot.end);
//   }

//   // manual submit
//   async function onSubmit() {
//     const startISO = dayjs(startLocal).toISOString();
//     const endISO = dayjs(startLocal).add(durationMin, "minute").toISOString();
//     await startEmailOtpFlow(startISO, endISO);
//   }

//   async function giveConsent() {
//     if (!token || !referralId) return;
//     setConsenting(true);
//     setErr("");
//     try {
//       await api(`api/referrals/${referralId}/consent`, {
//         method: "POST",
//         headers: { ...authHeader(token) } as HeadersInit,
//       });
//       setMsg("Consent recorded. Referral is now active.");
//       const data = await api(`api/referrals/${referralId}/packet`, {
//         headers: authHeader(token) as HeadersInit,
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

//   return (
//     <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
//       <div>
//         <h1 className="text-2xl font-semibold">Book an appointment</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Times shown in <span className="font-medium">{tz}</span>.
//         </p>
//       </div>

//       {/* Referral banner */}
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
//             } ${mode === "online" ? "" : "opacity-50 cursor-not-allowed"}`} // disable styles
//           >
//             <input
//               type="radio"
//               name="mode"
//               checked={mode === "online"}
//               onChange={() => setMode("online")}
//               // disabled={true}
//             />
//             Online (video) — coming soon!
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
//             {therapists.map((t) => {
//               console.log(t);
//               const profilePic =
//                 process.env.NEXT_PUBLIC_CDN_BASE! + t?.profilePicture;

//               const displayName = t.name || t.email || "Therapist";
//               const specs = t.specializations?.slice(0, 3) ?? [];
//               const extraCount =
//                 (t.specializations?.length || 0) - specs.length;
//               return (
//                 <button
//                   key={t._id}
//                   type="button"
//                   onClick={() => {
//                     setTherapistId(t._id);
//                     setMsg("");
//                     setErr("");
//                   }}
//                   className={`text-left rounded-lg border p-4 hover:bg-gray-50 ${
//                     t._id === therapistId
//                       ? "ring-2 ring-[var(--brand,#4b7eff)]"
//                       : ""
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <Image
//                       src={profilePic}
//                       width={40}
//                       height={40}
//                       alt={t.name || t.email || "Therapist"}
//                       className="h-10 w-10 rounded-full object-cover"
//                     />
//                     <div className="min-w-0">
//                       <div className="truncate text-sm font-medium">
//                         {t.name || t.email || "Therapist"}
//                       </div>
//                       {!!t.specializations?.length && (
//                         <div className="truncate text-xs text-gray-500">
//                           {t.specializations.slice(0, 3).join(", ")}
//                           {t.specializations.length > 3 ? "…" : ""}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//         {!loadingTherapists && !therapists.length && (
//           <p className="text-sm text-gray-500">No therapists found.</p>
//         )}
//       </div>

//       {/* Step 3: Hospital (in-person) */}
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

//           {/* Price strip (in-person) */}
//           {therapistId && hospitalId && (
//             <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
//               {loadingFees ? (
//                 "Calculating fee…"
//               ) : (
//                 <>
//                   Estimated fee:&nbsp;
//                   <span className="font-medium">
//                     {currency} {Number(displayFee || 0).toLocaleString()}
//                   </span>
//                   <span className="text-gray-500"> (paid at clinic)</span>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {mode === "online" && (
//         <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
//           For video appointments. the therapist will contact you to coordinate
//           the call. Please provide a reachable mobile number. They may share a
//           meeting link or arrange a phone or WhatsApp call.
//         </div>
//       )}

//       <div>
//         <label className="mb-1 block text-sm text-gray-700">
//           Mobile number{" "}
//           {mode === "online" ? "(required for video)" : "(optional)"}
//         </label>
//         <Input
//           type="tel"
//           placeholder="+92 3XX XXXXXXX"
//           value={phone}
//           onChange={(e) => {
//             setPhone(e.target.value);
//             if (phoneErr) setPhoneErr("");
//           }}
//         />
//         {phoneErr && <p className="mt-1 text-xs text-red-600">{phoneErr}</p>}
//       </div>

//       {/* Email for OTP */}
//       <div>
//         <label className="mb-1 block text-sm text-gray-700">
//           Email (verify to confirm slot)
//         </label>
//         <Input
//           type="email"
//           placeholder="you@example.com"
//           value={emailAddr}
//           onChange={(e) => setEmailAddr(e.target.value)}
//         />
//       </div>

//       {mode === "online" && (
//         <p className="mt-1 text-xs text-gray-600">
//           After you confirm. the therapist will contact you on your mobile to
//           coordinate the video call.
//         </p>
//       )}

//       {/* Step 4: Date & slots */}
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
//                       <div>
//                         Selected:&nbsp;
//                         <span className="font-medium">
//                           {dayjs(selectedSlot.start).format("ddd, MMM D")} •{" "}
//                           {dayjs(selectedSlot.start).format("HH:mm")}–
//                           {dayjs(selectedSlot.end).format("HH:mm")} ({tz})
//                         </span>
//                       </div>
//                       <div className="mt-1">
//                         {loadingFees ? (
//                           "Calculating fee…"
//                         ) : (
//                           <>
//                             Estimated fee:&nbsp;
//                             <span className="font-medium">
//                               {currency}{" "}
//                               {Number(displayFee || 0).toLocaleString()}
//                             </span>
//                             {mode === "in-person" ? (
//                               <span className="text-gray-500">
//                                 {" "}
//                                 (paid at clinic)
//                               </span>
//                             ) : null}
//                           </>
//                         )}
//                       </div>
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
//                           (mode === "in-person" && !hospitalId) ||
//                           !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr.trim())
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

//         {/* Fee echo near manual booking button */}
//         {therapistId && (
//           <div className="mt-3 text-sm text-gray-700">
//             {loadingFees ? (
//               "Calculating fee…"
//             ) : (
//               <>
//                 Estimated fee:&nbsp;
//                 <span className="font-medium">
//                   {currency} {Number(displayFee || 0).toLocaleString()}
//                 </span>
//                 {mode === "in-person" ? (
//                   <span className="text-gray-500"> (paid at clinic)</span>
//                 ) : null}
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Submit (manual, no OTP) */}
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

//       {/* OTP modal (email) */}
//       {showOtp && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
//           <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
//             <p className="text-sm font-medium">Enter verification code</p>
//             <p className="mt-1 text-xs text-gray-600">
//               We sent a 6-digit code to <b>{emailAddr}</b>.
//             </p>
//             <Input
//               className="mt-3"
//               placeholder="123456"
//               value={otpCode}
//               onChange={(e) => setOtpCode(e.target.value)}
//               maxLength={6}
//             />
//             {otpErr && <p className="mt-2 text-xs text-red-600">{otpErr}</p>}
//             <div className="mt-4 flex justify-end gap-2">
//               <Button onClick={() => setShowOtp(false)}>Cancel</Button>
//               <Button onClick={verifyOtpAndBook}>Verify & Book</Button>
//             </div>
//             <p className="mt-2 text-xs text-gray-500">
//               Didn’t get the code? Check spam or try again in a minute.
//             </p>
//           </div>
//         </div>
//       )}
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


// app/book/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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

// Minimal slice from /api/referrals/:id/packet
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
  const router = useRouter();
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

  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");

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

  // FEES
  const [displayFee, setDisplayFee] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("PKR");
  const [loadingFees, setLoadingFees] = useState(false);

  // EMAIL OTP (replaces phone)
  const [emailAddr, setEmailAddr] = useState("");
  const [intentId, setIntentId] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
    []
  );

  const selectedTherapist = useMemo(
    () => therapists.find((t) => t._id === therapistId) || null,
    [therapists, therapistId]
  );

  const selectedHospital = useMemo(
    () => hospitals.find((h) => h._id === hospitalId) || null,
    [hospitals, hospitalId]
  );

  // reset selection changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [therapistId, mode, hospitalId, startLocal, slotMinutes]);

  // therapists
  useEffect(() => {
    if (!token) return;
    (async () => {
      setErr("");
      setLoadingTherapists(true);
      try {
        const data = await api("api/therapists", {
          headers: authHeader(token) as HeadersInit,
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

  // referral
  useEffect(() => {
    if (!token || !referralId) {
      setReferral(null);
      return;
    }
    (async () => {
      setLoadingReferral(true);
      try {
        const data = await api(`api/referrals/${referralId}/packet`, {
          headers: authHeader(token) as HeadersInit,
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

  // hospitals
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
            { headers: authHeader(token) as HeadersInit }
          );
        } catch {
          try {
            data = await api(
              `api/therapistClinics/therapists/${therapistId}/hospitals`,
              { headers: authHeader(token) as HeadersInit }
            );
          } catch {
            data = await api(`api/hospitals/therapist/${therapistId}`, {
              headers: authHeader(token) as HeadersInit,
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

  // fees
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
          headers: authHeader(token) as HeadersInit,
        });

        let fee = 0;
        let cur = data?.therapist?.fees?.currency || "PKR";

        if (mode === "online") {
          fee = data?.therapist?.fees?.online || 0;
        } else {
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

  // day window helper
  function getSelectedDayWindow() {
    const day = startLocal ? dayjs(startLocal) : dayjs();
    const from = day.startOf("day").toDate().toISOString();
    const to = day.endOf("day").toDate().toISOString();
    return { from, to };
  }

  // load free slots
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
          mode: mode === "in-person" ? "inPerson" : "online",
        });

        if (mode === "in-person" && hospitalId) {
          qs.set("hospital", hospitalId);
        }

        const data = await api(
          `api/availability/therapist/${therapistId}/free?${qs.toString()}`,
          { headers: authHeader(token) as HeadersInit }
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

  // booking (direct/manual) – still here if you need it later
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
          ...(token ? authHeader(token) : {}),
          "Content-Type": "application/json",
        } as HeadersInit,
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
      router.push("/appointments/verify");
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

  // ===== EMAIL OTP FLOW =====
  function isValidPhone(x: string) {
    const digits = x.replace(/[^\d]/g, "");
    return (
      /^[+]?[\d\s\-()]+$/.test(x) && digits.length >= 10 && digits.length <= 15
    );
  }

  async function startEmailOtpFlow(startISO: string, endISO: string) {
    setErr("");
    setMsg("");
    setOtpErr("");

    if (mode === "online" && !isValidPhone(phone.trim())) {
      setErr("Please enter a valid mobile number for video coordination.");
      setPhoneErr("Enter a valid number like +92 3XX XXXXXXX");
      return;
    }

    if (!emailAddr.trim()) {
      setErr("Please enter a valid email.");
      return;
    }
    if (!therapistId) {
      setErr("Please choose a therapist.");
      return;
    }
    if (mode === "in-person" && !hospitalId) {
      setErr("Please select a hospital/clinic.");
      return;
    }

    if (!token) {
      setErr("Session expired. Please log in again.");
      return;
    }

    try {
      const body: any = {
        email: emailAddr.trim(),
        therapist: therapistId,
        start: startISO,
        end: endISO,
        mode: mode === "in-person" ? "inPerson" : "online",
        reason,
        phone: phone.trim(),
        hospital: mode === "in-person" ? hospitalId : undefined,
        meetingLink: mode === "online" ? meetingLink : undefined,
      };

      const data = await api("api/appointments/intent", {
        method: "POST",
        headers: {
          ...(authHeader(token) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const intentIdFromApi = data.intentId;
      const email = encodeURIComponent(emailAddr.trim());
      router.push(`/appointments/verify/${intentIdFromApi}?email=${email}`);
    } catch (e: any) {
      setErr(e.message || "Could not send verification email.");
    }
  }

  async function verifyOtpAndBook() {
    setOtpErr("");
    setErr("");
    setMsg("");
    try {
      if (!token) throw new Error("Session expired. Please log in again.");

      await api("api/appointments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? authHeader(token) : {}),
        } as HeadersInit,
        body: JSON.stringify({
          intentId,
          email: emailAddr.trim(),
          code: otpCode.trim(),
        }),
      });

      await api("api/appointments/confirm", {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ intentId }),
      });

      setShowOtp(false);
      setSelectedSlot(null);
      setMsg("Appointment booked ✅");
    } catch (e: any) {
      if (String(e.message || "").toLowerCase().includes("code"))
        setOtpErr(e.message);
      else setErr(e.message || "Failed to verify / book");
    }
  }

  // Confirm selected slot → start email OTP
  async function confirmSelectedSlot() {
    if (!selectedSlot) return;
    await startEmailOtpFlow(selectedSlot.start, selectedSlot.end);
  }

  // manual submit
  async function onSubmit() {
    const startISO = dayjs(startLocal).toISOString();
    const endISO = dayjs(startLocal).add(durationMin, "minute").toISOString();
    await startEmailOtpFlow(startISO, endISO);
  }

  async function giveConsent() {
    if (!token || !referralId) return;
    setConsenting(true);
    setErr("");
    try {
      await api(`api/referrals/${referralId}/consent`, {
        method: "POST",
        headers: { ...authHeader(token) } as HeadersInit,
      });
      setMsg("Consent recorded. Referral is now active.");
      const data = await api(`api/referrals/${referralId}/packet`, {
        headers: authHeader(token) as HeadersInit,
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

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr.trim());

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <header>
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--brand,#4b7eff)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
            Patient booking
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Book an appointment
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Times shown in <span className="font-medium">{tz}</span>. You’ll
                confirm your booking by email.
              </p>
            </div>
            <div className="hidden text-xs text-gray-500 sm:block">
              <p className="font-medium text-gray-700">Steps</p>
              <p>1. Mode · 2. Therapist · 3. Clinic & time · 4. Confirm</p>
            </div>
          </div>
        </header>

        {/* Referral banner */}
        {referralId && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {loadingReferral ? (
              "Checking referral…"
            ) : referral ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-blue-800">
                    Referral
                  </span>
                  <div className="mt-1">
                    Status{" "}
                    <span className="font-medium capitalize">
                      {referral.status.replace("-", " ")}
                    </span>
                    {therapistId &&
                      normalizeId(referral.toTherapist) !==
                        normalizeId(therapistId) && (
                        <span className="ml-2 text-xs text-red-700">
                          • This referral is for a different therapist. Select
                          the referred therapist to link.
                        </span>
                      )}
                  </div>
                </div>
                {referral.status === "active" ? (
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={linkReferral}
                      onChange={(e) => setLinkReferral(e.target.checked)}
                    />
                    Link this appointment to referral
                  </label>
                ) : referral.status === "pending-consent" ? (
                  <Button

                    onClick={giveConsent}
                    disabled={consenting}
                  >
                    {consenting ? "Saving…" : "Give consent to share summary"}
                  </Button>
                ) : null}
              </div>
            ) : (
              "Referral not found or not accessible. You can still book without linking."
            )}
          </div>
        )}

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

        {/* Main layout: left steps + right summary */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)] lg:items-start">
          {/* Left column: steps */}
          <div className="space-y-6">
            {/* Step 1: Mode */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                Step 1 · Consultation mode
              </p>
              <p className="mb-3 text-sm text-gray-700">
                Choose how you’d like to meet your therapist.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("in-person")}
                  className={[
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                    mode === "in-person"
                      ? "border-[var(--brand,#4b7eff)] bg-[var(--brand,#4b7eff)]/5 ring-2 ring-[var(--brand,#4b7eff)]"
                      : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand,#4b7eff)]/10 text-lg">
                    🏥
                  </div>
                  <div>
                    <p className="text-sm font-medium">In-person</p>
                    <p className="text-xs text-gray-600">
                      Visit your therapist at a hospital or clinic.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("online")}
                  className={[
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                    mode === "online"
                      ? "border-[var(--brand,#4b7eff)] bg-[var(--brand,#4b7eff)]/5 ring-2 ring-[var(--brand,#4b7eff)]"
                      : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand,#4b7eff)]/10 text-lg">
                    💻
                  </div>
                  <div>
                    <p className="text-sm font-medium">Online (video)</p>
                    <p className="text-xs text-gray-600">
                      Secure video session. Your therapist will coordinate the
                      call.
                    </p>
                  </div>
                </button>
              </div>
            </section>

            {/* Step 2: Therapist */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                Step 2 · Choose therapist
              </p>
              <p className="mb-3 text-sm text-gray-700">
                Pick a therapist from your clinic’s approved list.
              </p>
              {loadingTherapists ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-xl border bg-gray-50 animate-pulse"
                    />
                  ))}
                </div>
              ) : therapists.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {therapists.map((t) => {
                    const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "";
                    const src =
                      t.profilePicture && t.profilePicture.startsWith("http")
                        ? t.profilePicture
                        : `${cdnBase}${t.profilePicture || ""}`;
                    const displayName = t.name || t.email || "Therapist";
                    const specs = t.specializations?.slice(0, 3) ?? [];
                    const isSelected = t._id === therapistId;

                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => {
                          setTherapistId(t._id);
                          setMsg("");
                          setErr("");
                        }}
                        className={[
                          "group flex flex-col justify-between rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                          isSelected
                            ? "border-[var(--brand,#4b7eff)] bg-[var(--brand,#4b7eff)]/5 ring-2 ring-[var(--brand,#4b7eff)]"
                            : "border-gray-200 bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={src || "/default-avatar.png"}
                            width={40}
                            height={40}
                            alt={displayName}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {displayName}
                              </p>
                              {isSelected && (
                                <span className="inline-flex items-center rounded-full bg-[var(--brand,#4b7eff)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                                  Selected
                                </span>
                              )}
                            </div>
                            {!!t.specializations?.length && (
                              <p className="truncate text-xs text-gray-500">
                                {specs.join(", ")}
                                {t.specializations.length > 3 ? "…" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="mt-2 text-[11px] text-gray-500 group-hover:text-[var(--brand,#4b7eff)]">
                          Tap to choose this therapist
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No therapists found for your clinic.
                </p>
              )}
            </section>

            {/* Step 3: Hospital + slot length (in-person) */}
            {mode === "in-person" && therapistId && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                  Step 3 · Clinic & slot length
                </p>
                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Hospital / clinic
                    </label>
                    {loadingHospitals ? (
                      <div className="h-10 w-full animate-pulse rounded-md bg-gray-100" />
                    ) : hospitals.length ? (
                      <Select
                        value={hospitalId}
                        onChange={(e) => setHospitalId(String(e.target.value))}
                      >
                        <option value="">Select clinic…</option>
                        {hospitals.map((h) => (
                          <option key={h._id} value={h._id}>
                            {h.name}
                            {h.address ? ` — ${h.address}` : ""}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                        This therapist has no clinics configured. Please choose
                        another therapist.
                      </p>
                    )}
                  </div>
                  <div className="sm:w-40">
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
                        Estimated fee:{" "}
                        <span className="font-medium">
                          {currency} {Number(displayFee || 0).toLocaleString()}
                        </span>
                        <span className="text-gray-500"> (paid at clinic)</span>
                      </>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Step 3 (online hint) */}
            {mode === "online" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                For video appointments. your therapist will contact you to
                coordinate the call. Please share a reachable mobile number.
              </div>
            )}

            {/* Step 4: Date & slots */}
            {therapistId && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                  Step 4 · Pick day & time
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="sm:w-72">
                    <label className="mb-1 block text-sm text-gray-800">
                      Day (local)
                    </label>
                    <Input
                      type="date"
                      value={dayjs(startLocal).format("YYYY-MM-DD")}
                      onChange={(e) => {
                        const d = dayjs(e.target.value);
                        const current = dayjs(startLocal);
                        const next = d
                          .hour(current.hour())
                          .minute(current.minute());
                        setStartLocal(next.format("YYYY-MM-DDTHH:mm"));
                      }}
                    />
                  </div>
                  {(mode === "online" || !therapistId) && (
                    <div className="sm:w-40">
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
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-9 rounded-md bg-gray-100 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : slots.length ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
                              onClick={() =>
                                setSelectedSlot(isSelected ? null : s)
                              }
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
                                isSelected
                                  ? `Selected: ${label}`
                                  : `Select ${label}`
                              }
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {/* confirmation strip */}
                      {selectedSlot && (
                        <div className="mt-3 flex flex-col items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center">
                          <div className="text-sm">
                            <div>
                              Selected{" "}
                              <span className="font-medium">
                                {dayjs(selectedSlot.start).format(
                                  "ddd, MMM D"
                                )}{" "}
                                ·{" "}
                                {dayjs(selectedSlot.start).format("HH:mm")}–
                                {dayjs(selectedSlot.end).format("HH:mm")} ({tz})
                              </span>
                            </div>
                            <div className="mt-1">
                              {loadingFees ? (
                                "Calculating fee…"
                              ) : (
                                <>
                                  Estimated fee:{" "}
                                  <span className="font-medium">
                                    {currency}{" "}
                                    {Number(displayFee || 0).toLocaleString()}
                                  </span>
                                  {mode === "in-person" && (
                                    <span className="text-gray-500">
                                      {" "}
                                      (paid at clinic)
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSelectedSlot(null)}
                            >
                              Change
                            </Button>
                            <Button
                              onClick={confirmSelectedSlot}
                              disabled={
                                posting ||
                                !therapistId ||
                                (mode === "in-person" && !hospitalId) ||
                                !emailValid
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
                      No free slots for this day. Try another date or change
                      slot length.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Details + manual book */}
            <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                  Extra details
                </p>
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
                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Meeting link (optional)
                  </label>
                  <Input
                    placeholder="https://…"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    If you leave this empty. your therapist can share a link or
                    arrange a call directly.
                  </p>
                </div>
              )}

              {therapistId && (
                <div className="text-sm text-gray-700">
                  {loadingFees ? (
                    "Calculating fee…"
                  ) : (
                    <>
                      Estimated fee:{" "}
                      <span className="font-medium">
                        {currency} {Number(displayFee || 0).toLocaleString()}
                      </span>
                      {mode === "in-person" && (
                        <span className="text-gray-500"> (paid at clinic)</span>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={onSubmit}
                  disabled={
                    posting || !therapistId || (mode === "in-person" && !hospitalId)
                  }
                >
                  {posting ? "Booking…" : "Book appointment via email code"}
                </Button>
                <p className="mt-1 text-xs text-gray-500">
                  We’ll send a verification link or code to your email to
                  confirm the booking.
                </p>
              </div>
            </section>
          </div>

          {/* Right column: contact + summary */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand,#4b7eff)]">
                Contact & verification
              </p>
              <p className="mb-3 text-xs text-gray-600">
                We use your email to verify the booking. For online sessions. a
                mobile number helps your therapist reach you.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                  />
                  {!emailValid && emailAddr && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Mobile number{" "}
                    {mode === "online" ? "(required for video)" : "(optional)"}
                  </label>
                  <Input
                    type="tel"
                    placeholder="+92 3XX XXXXXXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneErr) setPhoneErr("");
                    }}
                  />
                  {phoneErr && (
                    <p className="mt-1 text-xs text-red-600">{phoneErr}</p>
                  )}
                </div>

                {mode === "online" && (
                  <p className="text-[11px] text-gray-500">
                    Your therapist may contact you by call. SMS. or WhatsApp to
                    share a video link.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Appointment summary
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-medium">
                    {mode === "in-person" ? "In-person" : "Online (video)"}
                  </span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Therapist</span>
                  <span className="text-right">
                    {selectedTherapist
                      ? selectedTherapist.name ||
                        selectedTherapist.email ||
                        "Therapist"
                      : "Not selected"}
                  </span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">
                    {mode === "in-person" ? "Clinic" : "Video contact"}
                  </span>
                  <span className="text-right">
                    {mode === "in-person"
                      ? selectedHospital?.name || "Not selected"
                      : phone || "Mobile not added"}
                  </span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Date & time</span>
                  <span className="text-right">
                    {selectedSlot
                      ? `${dayjs(selectedSlot.start).format(
                          "ddd, MMM D"
                        )} · ${dayjs(selectedSlot.start).format(
                          "HH:mm"
                        )}–${dayjs(selectedSlot.end).format("HH:mm")}`
                      : dayjs(startLocal).format("ddd, MMM D")}
                  </span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Estimated fee</span>
                  <span className="font-medium text-right">
                    {loadingFees
                      ? "Loading…"
                      : `${currency} ${Number(
                          displayFee || 0
                        ).toLocaleString()}`}
                  </span>
                </li>
              </ul>
              {referral && referral.status === "active" && linkReferral && (
                <p className="mt-3 rounded-md bg-blue-50 px-2 py-1 text-[11px] text-blue-800">
                  This appointment will be linked to your active referral.
                </p>
              )}
            </section>
          </aside>
        </div>

        {/* OTP modal (if you decide to use it later) */}
        {showOtp && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <p className="text-sm font-medium">Enter verification code</p>
              <p className="mt-1 text-xs text-gray-600">
                We sent a 6-digit code to <b>{emailAddr}</b>.
              </p>
              <Input
                className="mt-3"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
              />
              {otpErr && (
                <p className="mt-2 text-xs text-red-600">{otpErr}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button  onClick={() => setShowOtp(false)}>
                  Cancel
                </Button>
                <Button onClick={verifyOtpAndBook}>Verify & Book</Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Didn’t get the code? Check spam or try again in a minute.
              </p>
            </div>
          </div>
        )}
      </div>
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
