


// app/book/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Select from "@/components/Select";

import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);


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

function shortClinicLabel(h: Hospital, max = 42) {
  const text = `${h.name}${h.address ? ` — ${h.address}` : ""}`;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

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

// ✅ FIX: Helper to get a fresh default startLocal value (always forward-looking)
function freshStartLocal() {
  return dayjs()
    .add(1, "hour")
    .minute(0)
    .second(0)
    .millisecond(0)
    .format("YYYY-MM-DDTHH:mm");
}

function BookPageInner() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromQS = searchParams.get("referral") || "";

  // Tab: "self" = patient books for themselves, "behalf" = staff books for a patient
  const isStaff = user?.role === "therapist" || user?.role === "receptionist";
  const [bookingMode, setBookingMode] = useState<"self" | "behalf">("self");

  // Patient info (used only in "behalf" mode)
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  // Patient ID lookup (behalf mode)
  const [patientIdInput, setPatientIdInput] = useState("");
  const [patientUserId, setPatientUserId] = useState(""); // MongoDB _id of looked-up patient
  const [lookingUpPatient, setLookingUpPatient] = useState(false);
  const [patientLookupErr, setPatientLookupErr] = useState("");
  const [patientLookupOk, setPatientLookupOk] = useState(false);

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);

  const [therapistId, setTherapistId] = useState("");
  const mode: Mode = "in-person";

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalId, setHospitalId] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotMinutes, setSlotMinutes] = useState<number>(60);

  // ✅ FIX: Use freshStartLocal() so it's always a valid future time on mount
  const [startLocal, setStartLocal] = useState(freshStartLocal);

  const [durationMin, setDurationMin] = useState(60);
  const [reason, setReason] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [posting, setPosting] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [referralId] = useState<string>(referralFromQS);
  const [referral, setReferral] = useState<ReferralPacket["referral"] | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [consenting, setConsenting] = useState(false);
  const [linkReferral, setLinkReferral] = useState(true);

  const [displayFee, setDisplayFee] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("PKR");
  const [loadingFees, setLoadingFees] = useState(false);

  const [emailAddr, setEmailAddr] = useState("");
  const [expandTherapistGrid, setExpandTherapistGrid] = useState(false);
  // Polish: collapse the optional Notes block + hide the "Pick another date"
  // calendar behind a small toggle so the booking flow stays focused.
  const [showNotes, setShowNotes] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ FIX: Single slot-fetch trigger counter — incrementing this forces a re-fetch
  // without depending on stale state values
  const [slotFetchTick, setSlotFetchTick] = useState(0);

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

  // ✅ FIX: Single reset effect — clear selectedSlot when booking context changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [therapistId, mode, hospitalId, startLocal, slotMinutes]);

  // ✅ FIX: Window focus listener — increments tick to force slot re-fetch
  // Previously this cleared slots but never triggered a re-fetch
  useEffect(() => {
    const onFocus = () => {
      setSelectedSlot(null);
      setSlotFetchTick((t) => t + 1); // ← triggers the slots useEffect to re-run
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

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
          setReferral({
            _id: r._id,
            status: r.status,
            patient: normalizeId(r.patient),
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

  // hospitals
  useEffect(() => {
    if (!token || !therapistId) {
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
  }, [token, therapistId]);

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
        const h = (data?.hospitals || []).find(
          (h: any) => h.hospitalId === hospitalId
        );
        fee = h?.fee?.amount ?? data?.therapist?.fees?.inPerson ?? 0;
        cur = h?.fee?.currency || cur;
        setDisplayFee(fee);
        setCurrency(cur);
      } catch {
        setDisplayFee(0);
        setCurrency("PKR");
      } finally {
        setLoadingFees(false);
      }
    })();
  }, [token, therapistId, hospitalId]);

  // Query the full local day in UTC so slots for the selected local date are returned correctly
  function getSelectedDayWindow() {
    const from = dayjs(startLocal).startOf("day").toISOString();
    const to = dayjs(startLocal).endOf("day").toISOString();
    return { from, to };
  }

  // ✅ FIX: Single slots useEffect — includes slotFetchTick so focus re-fetches correctly
  // Removed the duplicate/broken second slots useEffect entirely
  useEffect(() => {
    if (!token || !therapistId) {
      setSlots([]);
      return;
    }
    let cancelled = false; // ✅ prevent stale async updates if deps change mid-fetch

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
        if (cancelled) return; // ✅ discard if deps changed while fetching
        const list: Slot[] = Array.isArray(data?.slots) ? data.slots : [];
        console.log("Fetched slots:", list);
        list.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
        setSlots(list);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => { cancelled = true; }; // ✅ cleanup on dep change
  }, [token, therapistId, hospitalId, startLocal, slotMinutes, slotFetchTick]);

  // ===== PATIENT ID LOOKUP (behalf mode) =====
  async function lookupPatient() {
    const q = patientIdInput.trim();
    if (!q) return;
    setPatientLookupErr("");
    setPatientLookupOk(false);
    setLookingUpPatient(true);
    try {
      const res = await api(`api/appointments/patients/lookup?q=${encodeURIComponent(q)}`, {
        headers: authHeader(token || undefined) as HeadersInit,
      });
      const p = res.patient ?? res;
      setPatientUserId(p._id);
      setPatientName(p.name || "");
      setEmailAddr(p.email || "");
      setPatientLookupOk(true);
    } catch (e: any) {
      setPatientLookupErr(e.message || "Patient not found");
      setPatientUserId("");
    } finally {
      setLookingUpPatient(false);
    }
  }

  function clearPatientLookup() {
    setPatientIdInput("");
    setPatientUserId("");
    setPatientName("");
    setEmailAddr("");
    setPatientLookupOk(false);
    setPatientLookupErr("");
  }

  // ===== EMAIL OTP FLOW =====
  async function startEmailOtpFlow(startISO: string, endISO: string) {
    setErr("");
    setMsg("");

    if (!emailAddr.trim()) {
      setErr("Please enter your email.");
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

    setPosting(true);
    try {
      const body: any = {
        email: emailAddr.trim(),
        therapist: therapistId,
        start: startISO,
        end: endISO,
        mode: "inPerson",
        reason,
        hospital: hospitalId,
        ...(bookingMode === "behalf" && patientUserId ? { patient: patientUserId } : {}),
      };

      const data = await api("api/appointments/intent", {
        method: "POST",
        headers: {
          ...(authHeader(token) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // ✅ FIX: Clear ALL booking state before navigating so returning to page is fresh
      setSelectedSlot(null);
      setSlots([]);
      setStartLocal(freshStartLocal());
      setReason("");

      const intentIdFromApi = data.intentId || data._id || data.id;
      if (!intentIdFromApi) throw new Error("Server did not return an intent ID. Please try again.");
      const email = encodeURIComponent(emailAddr.trim());
      router.push(`/appointments/verify/${intentIdFromApi}?email=${email}`);
    } catch (e: any) {
      setErr(e.message || "Could not send verification email.");
    } finally {
      setPosting(false);
    }
  }

  // ✅ FIX: confirmSelectedSlot passes the slot's own ISO strings directly (already UTC)
  async function confirmSelectedSlot() {
    if (!selectedSlot) return;
    await startEmailOtpFlow(selectedSlot.start, selectedSlot.end);
  }

  // Treat startLocal as local time and convert correctly to UTC
  async function onSubmit() {
    const start = dayjs(startLocal);
    const startISO = start.toISOString();
    const endISO = start.add(durationMin, "minute").toISOString();
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

  const step1Done = !!therapistId;
  const step2Done = step1Done && !!hospitalId;
  const step3Done = step2Done && !!selectedSlot;

  const groupedSlots = useMemo(() => {
    const morning: Slot[] = [], afternoon: Slot[] = [], evening: Slot[] = [];
    slots.forEach((s) => {
      const h = dayjs(s.start).hour();
      if (h < 12) morning.push(s);
      else if (h < 17) afternoon.push(s);
      else evening.push(s);
    });
    return [
      { label: "Morning", dot: "bg-amber-400", slots: morning },
      { label: "Afternoon", dot: "bg-orange-400", slots: afternoon },
      { label: "Evening", dot: "bg-indigo-400", slots: evening },
    ].filter((g) => g.slots.length > 0);
  }, [slots]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-gradient-to-b from-[#eef2ff] to-[#f8faff]">
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#7c3aed] px-4 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Patient Portal
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">
            Book an Appointment
          </h1>
          <p className="mt-1 text-xs text-white/75 sm:mt-1.5 sm:text-sm">
            Times shown in <span className="font-semibold text-white">{tz}</span>.
            A 6-digit code will be sent to confirm.
          </p>
          {/* Dynamic progress steps — full labels on sm+, compact pills on phones */}
          <div className="mt-4 -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-5 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {[
              { label: "Choose Therapist", short: "Therapist", done: step1Done, active: !step1Done },
              { label: "Select Clinic", short: "Clinic", done: step2Done, active: step1Done && !step2Done },
              { label: "Pick Date & Time", short: "Date", done: step3Done, active: step2Done && !step3Done },
              { label: "Confirm", short: "Confirm", done: false, active: step3Done && emailValid },
            ].map((s, i, arr) => (
              <span key={s.label} className="flex shrink-0 items-center gap-1 sm:shrink">
                <span className={[
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all sm:px-3 sm:text-xs",
                  s.done ? "bg-emerald-400/30 text-white ring-1 ring-emerald-300/40"
                    : s.active ? "bg-white text-[#3a5bef] shadow-md"
                      : "bg-white/10 text-white/50",
                ].join(" ")}>
                  {s.done ? (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
                      {i + 1}
                    </span>
                  )}
                  {/* Short label on phones (saves horizontal space), full label on sm+ */}
                  <span className="sm:hidden">{s.short}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                {i < arr.length - 1 && <span className="text-white/25 text-xs">›</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-4 px-3 pb-32 sm:space-y-5 sm:px-6 xl:pb-16">
        {/* ── Staff Tab Switcher (therapist / receptionist only) ── */}
        {isStaff && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
              <svg className="h-4 w-4 text-[#4b7eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Booking Mode</p>
            </div>
            <div className="flex gap-1.5 p-1.5">
              <button
                type="button"
                onClick={() => setBookingMode("self")}
                className={[
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
                  bookingMode === "self"
                    ? "bg-[#4b7eff] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100",
                ].join(" ")}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="sm:hidden">For Myself</span>
                <span className="hidden sm:inline">Book for Myself</span>
              </button>
              <button
                type="button"
                onClick={() => setBookingMode("behalf")}
                className={[
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
                  bookingMode === "behalf"
                    ? "bg-[#4b7eff] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100",
                ].join(" ")}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span className="sm:hidden">For Patient</span>
                <span className="hidden sm:inline">Book for a Patient</span>
              </button>
            </div>
            {bookingMode === "behalf" && (
              <div className="mx-4 mb-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-amber-700">
                  You are booking on behalf of a patient. Fill in the patient&apos;s details below.
                  A 6-digit OTP will be sent to the patient&apos;s email to confirm the appointment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Referral banner ── */}
        {referralId && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm sm:px-5 sm:py-4">
            {loadingReferral ? (
              <p className="animate-pulse text-sm text-indigo-700">Checking referral…</p>
            ) : referral ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base">🔗</span>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Referral Attached</p>
                    <p className="text-xs text-indigo-700">
                      Status:{" "}
                      <span className="font-medium capitalize">{referral.status.replace("-", " ")}</span>
                      {therapistId && normalizeId(referral.toTherapist) !== normalizeId(therapistId) && (
                        <span className="ml-2 text-red-600">• Referral is for a different therapist.</span>
                      )}
                    </p>
                  </div>
                </div>
                {referral.status === "active" ? (
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-800 shadow-sm">
                    <input
                      type="checkbox"
                      className="accent-indigo-600"
                      checked={linkReferral}
                      onChange={(e) => setLinkReferral(e.target.checked)}
                    />
                    Link to this referral
                  </label>
                ) : referral.status === "pending-consent" ? (
                  <Button
                    onClick={giveConsent}
                    disabled={consenting}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {consenting ? "Saving…" : "Give consent"}
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-indigo-700">Referral not found. You can still book without linking.</p>
            )}
          </div>
        )}

        {/* ── Alerts ── */}
        {err && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <span className="mt-0.5 text-lg">⚠️</span>
            <p className="text-sm text-red-700">{err}</p>
          </div>
        )}
        {msg && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
            <span className="mt-0.5 text-lg">✅</span>
            <p className="text-sm text-emerald-700">{msg}</p>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          {/* ── Left column ── */}
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {/* Patient Info section — behalf mode only */}
            {bookingMode === "behalf" && (
              <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-transparent px-4 py-3 sm:px-5 sm:py-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white shadow">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">Patient Information</p>
                    <p className="text-xs text-gray-500">Enter the patient&apos;s details to book on their behalf.</p>
                  </div>
                </div>
                <div className="p-4 pb-0 sm:p-5 sm:pb-0">
                  {/* ── Patient ID quick-lookup ── */}
                  <div className="mb-4 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-4">
                    <p className="mb-2 text-xs font-semibold text-violet-700">
                      Quick Lookup by Patient ID
                      <span className="ml-1 font-normal text-violet-500">(e.g. PT-1234-20001231)</span>
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="PT-XXXX-YYYYMMDD"
                          value={patientIdInput}
                          onChange={(e) => {
                            setPatientIdInput(e.target.value.toUpperCase());
                            setPatientLookupErr("");
                            setPatientLookupOk(false);
                          }}
                          onKeyDown={(e) => { if (e.key === "Enter") lookupPatient(); }}
                          className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-mono text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-400 focus:outline-none"
                        />
                      </div>
                      {patientLookupOk ? (
                        <button
                          type="button"
                          onClick={clearPatientLookup}
                          className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors sm:py-2"
                        >
                          Clear
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={lookupPatient}
                          disabled={!patientIdInput.trim() || lookingUpPatient}
                          className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors sm:py-2"
                        >
                          {lookingUpPatient ? "Searching…" : "Lookup"}
                        </button>
                      )}
                    </div>
                    {patientLookupErr && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {patientLookupErr}
                      </p>
                    )}
                    {patientLookupOk && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                        <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Patient found — details auto-filled below. You can still edit them.
                      </p>
                    )}
                    {!patientLookupOk && !patientLookupErr && (
                      <p className="mt-2 text-[11px] text-violet-500">
                        Or fill in the patient details manually below.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Patient Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={emailAddr}
                        onChange={(e) => setEmailAddr(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-400 focus:outline-none"
                      />
                    </div>
                    {!emailValid && emailAddr && (
                      <p className="mt-1.5 text-xs text-red-500">Please enter a valid email address.</p>
                    )}
                    {emailValid && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        OTP confirmation will be sent here
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Patient Phone <span className="font-normal normal-case text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="+92 300 0000000"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full rounded-xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-3">
                      <p className="text-xs font-semibold text-violet-700">How this works</p>
                      <ol className="mt-2 space-y-1.5">
                        {[
                          "Enter the patient's details above",
                          "Select the clinic and time slot",
                          "Click Book — OTP is sent to patient's email",
                          "Patient confirms via OTP (or you enter it for them)",
                        ].map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-violet-600">
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-violet-200 text-[8px] font-bold text-violet-700 mt-0.5">
                              {i + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 1 — Therapist */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow transition-colors",
                    step1Done ? "bg-emerald-500 text-white" : "bg-[#4b7eff] text-white",
                  ].join(" ")}>
                    {step1Done ? "✓" : "1"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">Choose Therapist</p>
                    <p className="text-xs text-gray-500">Select from your clinic's approved professionals.</p>
                  </div>
                </div>
                {step1Done && (
                  <button
                    type="button"
                    onClick={() => { setTherapistId(""); setExpandTherapistGrid(false); setMsg(""); setErr(""); }}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-[#4b7eff] hover:bg-[#4b7eff]/8 transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="p-4 sm:p-5">
                {loadingTherapists ? (
                  // <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      // <></>
                      <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                  </div>
                ) : selectedTherapist && !expandTherapistGrid ? (
                  /* Compact selected-therapist card */
                  <div className="flex items-center gap-3 rounded-xl border-2 border-[#4b7eff] bg-[#4b7eff]/5 p-3 sm:gap-3 sm:p-4">
                    {(() => {
                      const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "";
                      const src = selectedTherapist.profilePicture && selectedTherapist.profilePicture.startsWith("http")
                        ? selectedTherapist.profilePicture
                        : `${cdnBase}${selectedTherapist.profilePicture || ""}`;
                      return (
                        <Image
                          src={src}
                          width={48}
                          height={48}
                          alt={selectedTherapist.name || "Therapist"}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow sm:h-[52px] sm:w-[52px]"
                          onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                        />
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-gray-900">{selectedTherapist.name || selectedTherapist.email || "Therapist"}</p>
                      {!!selectedTherapist.specializations?.length && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">{selectedTherapist.specializations.slice(0, 3).join(" · ")}</p>
                      )}
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        ✓ Selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandTherapistGrid(true)}
                      className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                      Browse all
                    </button>
                  </div>
                ) : therapists.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {therapists.map((t) => {
                      const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "";
                      const src = t.profilePicture && t.profilePicture.startsWith("http")
                        ? t.profilePicture
                        : `${cdnBase}${t.profilePicture || ""}`;
                      const isSelected = t._id === therapistId;
                      return (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => { setTherapistId(t._id); setExpandTherapistGrid(false); setMsg(""); setErr(""); }}
                          className={[
                            "group relative flex min-w-0 flex-col rounded-xl border-2 p-3 text-left transition-all duration-150 hover:-translate-y-0.5 sm:p-4",
                            // "group relative flex flex-col rounded-xl border-2 p-4 text-left transition-all duration-150 hover:-translate-y-0.5",
                            isSelected ? "border-[#4b7eff] bg-[#4b7eff]/5 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
                          ].join(" ")}
                        >
                          {isSelected && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#4b7eff] text-[10px] text-white shadow">✓</span>
                          )}
                          <div className="flex items-center gap-3">
                            <Image
                              src={src}
                              width={44}
                              height={44}
                              alt={t.name || t.email || "Therapist"}
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
                              onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {t.name || t.email || "Therapist"}
                              </p>
                              {!!t.specializations?.length && (
                                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                  {t.specializations.slice(0, 2).join(" · ")}
                                  {t.specializations.length > 2 ? " +more" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          {!isSelected && (
                            <span className="mt-3 text-[11px] font-medium text-[#4b7eff] opacity-0 transition-opacity group-hover:opacity-100">
                              Tap to select →
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">🔍</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">No therapists found</p>
                      <p className="mt-0.5 text-xs text-gray-500">No approved professionals are available at the moment.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Step 2 — Clinic (in-person only) */}
            {mode === "in-person" && therapistId && (
              <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
                  <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow transition-colors",
                    step2Done ? "bg-emerald-500 text-white" : "bg-[#4b7eff] text-white",
                  ].join(" ")}>
                    {step2Done ? "✓" : "2"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">Select Clinic</p>
                    <p className="text-xs text-gray-500">Choose a hospital or clinic location.</p>
                  </div>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Hospital / Clinic</label>
                      {loadingHospitals ? (
                        <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                      ) : hospitals.length ? (
                        <div className="min-w-0 max-w-full overflow-hidden [&_select]:w-full [&_select]:max-w-full [&_select]:truncate">
                        <Select
                          value={hospitalId}
                          onChange={(e) => setHospitalId(String(e.target.value))}
                        >
                          <option value="">Select a clinic…</option>
                          {hospitals.map((h) => (
                            <option key={h._id} value={h._id}>
                              {shortClinicLabel(h)}
                            </option>
                          ))}
                        </Select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          <span>⚠️</span> No clinics configured for this therapist.
                        </div>
                      )}
                    </div>
                    <div className="sm:w-36">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Slot Length</label>
                      <Select
                        value={String(slotMinutes)}
                        onChange={(e) => setSlotMinutes(Number(e.target.value))}
                      >
                        {[15, 20, 30, 45, 60].map((m) => (
                          <option key={m} value={m}>{m} min</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  {hospitalId && (
                    <div className="flex items-center justify-between rounded-xl bg-[#4b7eff]/5 px-4 py-3">
                      <span className="text-sm text-gray-600">Estimated consultation fee</span>
                      <span className="text-sm font-bold text-[#4b7eff]">
                        {loadingFees ? "—" : `${currency} ${Number(displayFee || 0).toLocaleString()}`}
                        <span className="ml-1 text-xs font-normal text-gray-500">(at clinic)</span>
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Step 3 — Date & Slots */}
            {therapistId && (
              <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
                  <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow transition-colors",
                    step3Done ? "bg-emerald-500 text-white" : "bg-[#4b7eff] text-white",
                  ].join(" ")}>
                    {step3Done ? "✓" : "3"}
                  </span>
                  {/* <div className="min-w-0 flex-1"> */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900">Pick Day &amp; Time</p>
                    <p className="text-xs text-gray-500">Select a date then choose an available slot.</p>
                  </div>
                </div>
                <div className="space-y-5 p-4 sm:p-5">

                  {/* Quick day navigation — 7-day strip with a togglable date
                      picker for picking dates further out. Replaces the
                      always-on native input that doubled the controls. */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Quick Select</p>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:border-[#4b7eff]/40 hover:text-[#4b7eff] transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
                        </svg>
                        {showDatePicker ? "Hide calendar" : "Pick another date"}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = dayjs().add(i, "day");
                        const isActive = d.format("YYYY-MM-DD") === dayjs(startLocal).format("YYYY-MM-DD");
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              const cur = dayjs(startLocal);
                              setStartLocal(d.hour(cur.hour()).minute(cur.minute()).format("YYYY-MM-DDTHH:mm"));
                            }}
                            className={[
                              "flex min-w-0 flex-col items-center rounded-xl border-2 px-2 py-2 text-center transition-all",
                              isActive
                                ? "border-[#4b7eff] bg-[#4b7eff] text-white shadow-md"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff]",
                            ].join(" ")}
                          >
                            <span className="text-[10px] font-semibold uppercase leading-tight opacity-75">
                              {i === 0 ? "Today" : i === 1 ? "Tmrw" : d.format("ddd")}
                            </span>
                            <span className="text-base font-bold leading-tight">{d.format("D")}</span>
                            <span className="text-[10px] opacity-60">{d.format("MMM")}</span>
                          </button>
                        );
                      })}
                    </div>
                    {showDatePicker && (
                      <div className="mt-3">
                        <Input
                          type="date"
                          value={dayjs(startLocal).format("YYYY-MM-DD")}
                          onChange={(e) => {
                            const d = dayjs(e.target.value);
                            const cur = dayjs(startLocal);
                            setStartLocal(d.hour(cur.hour()).minute(cur.minute()).format("YYYY-MM-DDTHH:mm"));
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Slot grid */}
                  <div>
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Slots — {dayjs(startLocal).format("ddd, MMM D")}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          Times shown in your local zone
                          <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">{tz}</span>
                        </p>
                      </div>
                      {slots.length > 0 && (
                        <span className="rounded-full bg-[#4b7eff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#4b7eff]">
                          {slots.length} open
                        </span>
                      )}
                    </div>
                    {loadingSlots ? (
                      <div className="grid grid-cols-3 gap-2 min-[380px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                        ))}
                      </div>
                    ) : groupedSlots.length > 0 ? (
                      <div className="min-w-0 space-y-4 sm:space-y-5">
                        {groupedSlots.map((group) => (
                          <div key={group.label}>
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${group.dot}`} />
                              {group.label}
                              <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500">
                                {group.slots.length}
                              </span>
                            </p>
                            <div className="grid grid-cols-3 gap-2 min-[380px]:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                              {group.slots.map((s) => {
                                const isSel = selectedSlot?.start === s.start && selectedSlot?.end === s.end;
                                return (
                                  <button
                                    key={s.start}
                                    type="button"
                                    disabled={posting}
                                    onClick={() => setSelectedSlot(isSel ? null : s)}
                                    aria-pressed={isSel}
                                    aria-label={`Book ${dayjs(s.start).format("h:mm A")} on ${dayjs(s.start).format("dddd, MMMM D")}`}
                                    className={[
                                      "group min-h-[48px] rounded-xl border-2 px-1 py-2 text-center transition-all duration-150 sm:py-2.5",
                                      // "group rounded-xl border-2 py-2.5 text-center transition-all duration-150",
                                      "focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/40 active:scale-[0.97]",
                                      isSel
                                        ? "border-[#4b7eff] bg-gradient-to-br from-[#4b7eff] to-[#6aa7ff] text-white shadow-lg shadow-[#4b7eff]/25"
                                        : "border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-[#4b7eff]/50 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:shadow-sm",
                                    ].join(" ")}
                                  >
                                    <span className="block text-sm font-semibold leading-tight">
                                      {dayjs(s.start).format("h:mm")}
                                    </span>
                                    <span className={[
                                      "block text-[10px] font-medium tracking-wide",
                                      isSel ? "text-white/80" : "text-gray-400 group-hover:text-[#4b7eff]/70",
                                    ].join(" ")}>
                                      {dayjs(s.start).format("A")}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Selected slot confirmation strip */}
                        {selectedSlot && (
                          <div className="overflow-hidden rounded-2xl border-2 border-[#4b7eff] shadow-lg">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-[#3a5bef] to-[#4b7eff] px-4 py-2.5">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              <span className="text-sm font-semibold text-white">Selected Slot</span>
                            </div>
                            <div className="flex flex-col gap-3 bg-[#4b7eff]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">{dayjs(selectedSlot.start).format("dddd, MMMM D, YYYY")}</p>
                                <p className="mt-0.5 text-sm text-gray-600">
                                  {dayjs(selectedSlot.start).format("h:mm A")} – {dayjs(selectedSlot.end).format("h:mm A")}
                                  <span className="ml-1.5 text-xs text-gray-400">({tz})</span>
                                </p>
                                {displayFee > 0 && (
                                  <p className="mt-1 text-sm font-semibold text-[#4b7eff]">
                                    {currency} {Number(displayFee).toLocaleString()}
                                    <span className="ml-1 text-xs font-normal text-gray-400">(at clinic)</span>
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedSlot(null)}
                                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5 sm:py-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">📭</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-800">No slots available</p>
                          <p className="mt-0.5 text-xs text-amber-600">Try a different date or adjust the slot length.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Mobile-only inline Book card — same controls as the sidebar CTA so
                users on phones don't have to scroll past the Notes block to find
                the email input + Book button. Hidden on xl where the sidebar shows. */}
            {therapistId && hospitalId && (
              <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 xl:hidden">
                <div className={[
                  "border-b border-gray-100 bg-gradient-to-r to-transparent px-4 py-3 sm:px-5 sm:py-4",
                  bookingMode === "behalf" ? "from-violet-50" : "from-[#4b7eff]/8",
                ].join(" ")}>
                  <p className="text-sm font-semibold text-gray-900">
                    {bookingMode === "behalf" ? "Patient Contact" : "Confirm & Book"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {bookingMode === "behalf"
                      ? "OTP will be sent to the patient's email."
                      : "We'll email a 6-digit OTP to confirm."}
                  </p>
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                  {bookingMode === "self" ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Your Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={emailAddr}
                        onChange={(e) => setEmailAddr(e.target.value)}
                      />
                      {!emailValid && emailAddr && (
                        <p className="mt-1.5 text-xs text-red-500">Please enter a valid email.</p>
                      )}
                    </div>
                  ) : (
                    !emailAddr && (
                      <p className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                        Fill in the patient's email in the Patient Information card above.
                      </p>
                    )
                  )}

                  <button
                    type="button"
                    onClick={selectedSlot ? confirmSelectedSlot : onSubmit}
                    disabled={posting || !therapistId || !hospitalId || !emailValid || !selectedSlot}
                    className={[
                      "flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60",
                      bookingMode === "behalf"
                        ? "bg-gradient-to-r from-violet-500 to-violet-600"
                        : "bg-gradient-to-r from-[#3a5bef] to-[#4b7eff]",
                    ].join(" ")}
                  >
                    {posting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending code…
                      </>
                    ) : !selectedSlot ? (
                      "Pick a time slot above"
                    ) : !emailValid ? (
                      "Enter your email to continue"
                    ) : (
                      <>
                        {bookingMode === "behalf" ? "Book for Patient & Send OTP" : "Book Appointment & Get OTP"}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}

            {/* Notes (optional) — collapsed by default so it doesn't push
                the booking CTA below the fold for users who don't need it. */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                aria-expanded={showNotes}
                className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 sm:px-5 sm:py-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500">✎</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-900">
                    Notes &amp; Details
                    {reason.trim() && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                        added
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {showNotes ? "Hide" : "Optional"} information for your therapist.
                  </span>
                </span>
                <svg
                  className={[
                    "h-4 w-4 text-gray-400 transition-transform",
                    showNotes ? "rotate-180" : "",
                  ].join(" ")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showNotes && (
                <div className="p-4 sm:p-5">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reason for visit <span className="font-normal normal-case text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    className="w-full resize-none rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm transition-colors focus:border-[#4b7eff] focus:outline-none"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief note for your therapist…"
                  />
                </div>
              )}
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="hidden space-y-5 xl:sticky xl:top-6 xl:block">
            {/* Contact & Verify + CTA */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className={[
                "border-b border-gray-100 bg-gradient-to-r to-transparent px-5 py-4",
                bookingMode === "behalf" ? "from-violet-50" : "from-[#4b7eff]/8",
              ].join(" ")}>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingMode === "behalf" ? "Patient Contact" : "Contact & Verification"}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {bookingMode === "behalf"
                    ? "OTP will be sent to the patient's email for confirmation."
                    : "Required for your booking confirmation OTP."}
                </p>
              </div>
              <div className="space-y-4 p-4 sm:p-5">

                {/* Email input — hidden in behalf mode (captured in Patient Info card) */}
                {bookingMode === "self" ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={emailAddr}
                      onChange={(e) => setEmailAddr(e.target.value)}
                    />
                    {!emailValid && emailAddr && (
                      <p className="mt-1.5 text-xs text-red-500">Please enter a valid email.</p>
                    )}
                    {emailValid && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        OTP will be sent here
                      </p>
                    )}
                  </div>
                ) : (
                  /* Behalf mode — show readonly summary of entered patient email */
                  <div className="rounded-xl border-2 border-violet-200 bg-violet-50 px-4 py-3">
                    <p className="text-xs font-semibold text-violet-700">Patient&apos;s Email</p>
                    {emailAddr ? (
                      <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{emailAddr}</p>
                    ) : (
                      <p className="mt-0.5 text-sm text-violet-400 italic">Not entered yet — fill in Patient Information above</p>
                    )}
                    {patientName && (
                      <p className="mt-1 text-xs text-violet-600">Patient: <span className="font-semibold">{patientName}</span></p>
                    )}
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={selectedSlot ? confirmSelectedSlot : onSubmit}
                  // disabled={posting || !therapistId || !hospitalId || !emailValid}
                  disabled={posting || !therapistId || !hospitalId || !emailValid || !selectedSlot}
                  className={[
                    "w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
                    bookingMode === "behalf"
                      ? "bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 hover:shadow-xl"
                      : "bg-gradient-to-r from-[#3a5bef] to-[#4b7eff] hover:from-[#2d4de0] hover:to-[#3a5bef] hover:shadow-xl",
                  ].join(" ")}
                >
                  {posting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending code…
                    </span>
                  ) : selectedSlot ? (
                    <span className="flex items-center justify-center gap-1.5">
                      {bookingMode === "behalf" ? "Book for Patient & Send OTP" : "Confirm & Get OTP"}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  ) : bookingMode === "behalf" ? (
                    "Book Appointment for Patient →"
                  ) : (
                    "Book Appointment & Get OTP →"
                  )}
                </button>
                {!step1Done && <p className="text-center text-xs text-gray-400">Select a therapist above to continue</p>}
                {step1Done && !step2Done && <p className="text-center text-xs text-gray-400">Select a clinic to continue</p>}
                {step2Done && !selectedSlot && <p className="text-center text-xs text-gray-400">Pick a time slot above to confirm</p>}
                <p className="text-center text-xs text-gray-400">
                  {bookingMode === "behalf"
                    ? "A 6-digit OTP will be sent to the patient's email."
                    : "A 6-digit OTP will be emailed to confirm."}
                </p>
              </div>
            </section>

            {/* Booking summary */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-sm font-semibold text-gray-900">Booking Summary</p>
                {bookingMode === "behalf" && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    Booking on behalf of patient
                  </span>
                )}
              </div>
              <ul className="divide-y divide-gray-100">
                {bookingMode === "behalf" && (
                  <li className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span className="text-xs">Patient</span>
                    </div>
                    <span className="max-w-[160px] truncate text-right text-xs font-medium text-violet-700">
                      {patientName || emailAddr || "Not entered"}
                    </span>
                  </li>
                )}
                {[
                  { icon: "🏥", label: "Mode", value: "In-person" },
                  { icon: "👤", label: "Therapist", value: selectedTherapist ? (selectedTherapist.name || selectedTherapist.email || "—") : "Not selected" },
                  { icon: "📍", label: "Clinic", value: selectedHospital?.name || "Not selected" },
                  {
                    icon: "📅",
                    label: "Date & Time",
                    value: selectedSlot
                      ? `${dayjs(selectedSlot.start).format("MMM D")} · ${dayjs(selectedSlot.start).format("h:mm")}–${dayjs(selectedSlot.end).format("h:mm A")}`
                      : dayjs(startLocal).format("MMM D, YYYY"),
                  },
                  { icon: "💰", label: "Est. Fee", value: loadingFees ? "Calculating…" : `${currency} ${Number(displayFee || 0).toLocaleString()}`, highlight: true },
                ].map((row) => (
                  // <li key={row.label} className="flex items-center justify-between gap-3 px-5 py-3">
                  <li key={row.label} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <span className="text-base">{row.icon}</span>
                      <span className="text-xs">{row.label}</span>
                    </div>
                    {/* <span className={["max-w-[160px] truncate text-right text-xs", row.highlight ? "font-bold text-[#4b7eff]" : "font-medium text-gray-800"].join(" ")}> */}
                    <span className={["min-w-0 max-w-[55%] truncate text-right text-xs sm:max-w-[160px]", row.highlight ? "font-bold text-[#4b7eff]" : "font-medium text-gray-800"].join(" ")}>
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
              {referral && referral.status === "active" && linkReferral && (
                <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                  🔗 Linked to your active referral
                </div>
              )}
            </section>

            {/* How it works */}
            <section className="rounded-2xl border border-dashed border-[#4b7eff]/30 bg-[#4b7eff]/5 px-4 py-3 sm:px-5 sm:py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#4b7eff]">How it works</p>
              <ol className="space-y-3">
                {[
                  "Enter your email & pick a time slot",
                  "Click Book — we'll email a 6-digit OTP",
                  "Enter the OTP on the next screen",
                  "Your appointment is confirmed!",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4b7eff] text-[9px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </div>

      {/* Mobile-only sticky CTA bar — keeps the primary action one-tap away on
          phones where the right sidebar lives below the page fold. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur sm:px-4 xl:hidden">
        {selectedSlot && (
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {dayjs(selectedSlot.start).format("ddd, MMM D")}
                <span className="ml-1 font-normal text-gray-500">
                  · {dayjs(selectedSlot.start).format("h:mm A")}
                </span>
              </p>
              {!emailValid && (
                <p className="text-[10px] text-amber-600">Enter your email below to enable booking</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="shrink-0 rounded-md text-[10px] font-medium text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
            >
              Change
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={selectedSlot ? confirmSelectedSlot : onSubmit}
          disabled={posting || !therapistId || !hospitalId || !emailValid || !selectedSlot}
          className={[
            "flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
            bookingMode === "behalf"
              ? "bg-gradient-to-r from-violet-500 to-violet-600"
              : "bg-gradient-to-r from-[#3a5bef] to-[#4b7eff]",
          ].join(" ")}
        >
          {posting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending code…
            </>
          ) : !therapistId ? (
            "Choose a therapist to start"
          ) : !hospitalId ? (
            "Pick a clinic to continue"
          ) : !selectedSlot ? (
            "Pick a time slot"
          ) : !emailValid ? (
            "Enter email below to confirm"
          ) : (
            <>
              {bookingMode === "behalf" ? "Book for Patient & Send OTP" : "Confirm & Get OTP"}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BookPage() {
  // ✅ FIX: Use a mount-time timestamp as key so every navigation
  // to this page gets a fully fresh component with clean state
  const [mountKey] = useState(() => Date.now());
  return (
    <Protected>
      <BookPageInner key={mountKey} />
    </Protected>
  );
}