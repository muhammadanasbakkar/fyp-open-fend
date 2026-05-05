"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Patient = { _id: string; name?: string; email?: string; patientId: string };

type Therapist = {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  therapistInfo?: {
    specializations?: string[];
    yearsExperience?: number;
  };
  affiliatedHospitals?: string[];
  primaryHospital?: string;
};

type Slot = {
  _id: string;
  start: string;
  end: string;
  hospital: string;
  therapist: string;
};

export default function ReceptionistBookingPage() {
  return (
    <Protected>
      <RoleGuard roles={["receptionist"]}>
        <Inner />
      </RoleGuard>
    </Protected>
  );
}

function Inner() {
  const { user } = useAuth();

  // Patient lookup
  const [pidInput, setPidInput] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupErr, setLookupErr] = useState("");

  // New patient registration (inline, when lookup fails)
  const [showRegister, setShowRegister] = useState(false);
  const [regGender, setRegGender] = useState<"" | "male" | "female" | "other">("");
  const [regDob, setRegDob] = useState("");
  const [regCnic, setRegCnic] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regErr, setRegErr] = useState("");

  // Therapists (hospital-scoped on the backend)
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [therapistsLoading, setTherapistsLoading] = useState(false);
  const [therapistsErr, setTherapistsErr] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // Slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsErr, setSlotsErr] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Booking
  const [reason, setReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingErr, setBookingErr] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<{ when: string; therapistName: string } | null>(null);

  // Load therapists on mount (hospital-scoped server-side)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTherapistsLoading(true);
      setTherapistsErr("");
      try {
        const res = await api("api/receptionist/therapists");
        if (cancelled) return;
        setTherapists(Array.isArray(res?.therapists) ? res.therapists : []);
      } catch (e: any) {
        if (!cancelled) setTherapistsErr(e?.message || "Failed to load therapists");
      } finally {
        if (!cancelled) setTherapistsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // When a therapist is selected, fetch their free slots
  useEffect(() => {
    if (!selectedTherapist) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setSlotsLoading(true);
      setSlotsErr("");
      setSelectedSlot(null);
      try {
        const res = await api(
          `api/receptionist/therapists/${selectedTherapist._id}/free-slots`
        );
        if (cancelled) return;
        setSlots(Array.isArray(res?.slots) ? res.slots : []);
      } catch (e: any) {
        if (!cancelled) setSlotsErr(e?.message || "Failed to load slots");
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTherapist]);

  async function lookupPatient(e?: React.FormEvent) {
    e?.preventDefault();
    const q = pidInput.trim();
    if (!q) return;
    setLookupLoading(true);
    setLookupErr("");
    setPatient(null);
    try {
      const res = await api(`api/appointments/patients/lookup?q=${encodeURIComponent(q)}`);
      if (res?.patient) setPatient(res.patient);
      else setLookupErr("No patient found with that ID.");
    } catch (e: any) {
      setLookupErr(e?.message || "Patient lookup failed");
    } finally {
      setLookupLoading(false);
    }
  }

  function clearPatient() {
    setPatient(null);
    setPidInput("");
    setLookupErr("");
    setSelectedTherapist(null);
    setSelectedSlot(null);
    setReason("");
    setBookingSuccess(null);
    setBookingErr("");
    resetRegisterForm();
  }

  function resetRegisterForm() {
    setShowRegister(false);
    setRegGender("");
    setRegDob("");
    setRegCnic("");
    setRegPassword("");
    setRegErr("");
  }

  async function registerNewPatient(e?: React.FormEvent) {
    e?.preventDefault();
    if (!regGender || !regDob || !regCnic.trim() || !regPassword) {
      setRegErr("Please fill all fields.");
      return;
    }
    if (!/^\d{4}$/.test(regCnic.trim())) {
      setRegErr("CNIC last 4 must be exactly 4 digits.");
      return;
    }
    const strongPw =
      regPassword.length >= 8 &&
      /[A-Z]/.test(regPassword) &&
      /[a-z]/.test(regPassword) &&
      /\d/.test(regPassword) &&
      /[^A-Za-z0-9]/.test(regPassword);
    if (!strongPw) {
      setRegErr("Password must be 8+ chars with upper, lower, number and symbol.");
      return;
    }

    setRegLoading(true);
    setRegErr("");
    try {
      const res: any = await api("api/auth/staff/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: regGender,
          dateOfBirth: regDob,
          cnicLastDigits: regCnic.trim(),
          password: regPassword,
        }),
      });
      const newPid = res?.patient?.patientId;
      if (!newPid) throw new Error("Registration succeeded but no patient ID was returned.");
      setPatient({ _id: res.patient._id, patientId: newPid });
      setPidInput(newPid);
      setLookupErr("");
      resetRegisterForm();
    } catch (e: any) {
      setRegErr(e?.message || "Could not register patient.");
    } finally {
      setRegLoading(false);
    }
  }

  async function confirmBooking() {
    if (!patient || !selectedTherapist || !selectedSlot) return;
    setBookingLoading(true);
    setBookingErr("");
    try {
      await api("api/receptionist/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityId: selectedSlot._id,
          therapistId: selectedTherapist._id,
          patientId: patient.patientId,
          reason: reason.trim(),
        }),
      });
      setBookingSuccess({
        when: formatRange(selectedSlot.start, selectedSlot.end),
        therapistName: selectedTherapist.name,
      });
      // Remove the booked slot from the list so it can't be picked again
      setSlots((prev) => prev.filter((s) => s._id !== selectedSlot._id));
      setSelectedSlot(null);
      setReason("");
    } catch (e: any) {
      setBookingErr(e?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }

  const slotsByDay = useMemo(() => groupByDay(slots), [slots]);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
            Receptionist
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Walk-in booking
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Look up a patient by ID, pick a therapist from your clinic and book an in-person slot.
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            You can only book with therapists from your assigned hospital{user?.role ? "" : ""}.
          </p>
        </div>

        {bookingSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-800">Booking confirmed</p>
            <p className="mt-1 text-sm text-emerald-700">
              Appointment with <span className="font-medium">{bookingSuccess.therapistName}</span> on{" "}
              <span className="font-medium">{bookingSuccess.when}</span>.
            </p>
            <button
              onClick={clearPatient}
              className="mt-3 inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Book for another patient
            </button>
          </div>
        )}

        {/* Step 1: patient lookup */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">1. Patient</p>
              <p className="text-xs text-gray-500">Enter the patient ID printed on their card (e.g. PT-1234-12031995).</p>
            </div>
            {patient && (
              <button onClick={clearPatient} className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
                Change
              </button>
            )}
          </div>

          {!patient ? (
            <form onSubmit={lookupPatient} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-600">Patient ID</label>
                <Input
                  placeholder="PT-1234-12031995"
                  value={pidInput}
                  onChange={(e) => setPidInput(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={lookupLoading || !pidInput.trim()}>
                {lookupLoading ? "Searching…" : "Find patient"}
              </Button>
            </form>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-4">
              <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
              <p className="mt-0.5 text-xs text-gray-600">{patient.email || "—"}</p>
              <p className="mt-1 inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-mono text-gray-700 ring-1 ring-gray-200">
                {patient.patientId}
              </p>
            </div>
          )}

          {!patient && lookupErr && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-xs text-amber-800">{lookupErr}</p>
              {!showRegister && (
                <button
                  type="button"
                  onClick={() => { setShowRegister(true); setRegErr(""); }}
                  className="text-xs font-medium text-[#4b7eff] hover:underline"
                >
                  + Register a new patient
                </button>
              )}
            </div>
          )}

          {!patient && showRegister && (
            <form onSubmit={registerNewPatient} className="space-y-3 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Register new patient</p>
                <button
                  type="button"
                  onClick={resetRegisterForm}
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Cancel
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Gender</label>
                  <Select value={regGender} onChange={(e) => setRegGender(e.target.value as any)}>
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Date of birth</label>
                  <Input type="date" value={regDob} onChange={(e) => setRegDob(e.target.value)} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">CNIC last 4 digits</label>
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="1234"
                    value={regCnic}
                    onChange={(e) => setRegCnic(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Temporary password</label>
                  <Input
                    type="text"
                    placeholder="Min 8 chars, mixed"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500">
                Share this password with the patient. They can change it after first login.
              </p>

              {regErr && (
                <p className="text-xs text-red-600">{regErr}</p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={regLoading}>
                  {regLoading ? "Registering…" : "Register patient"}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Step 2: pick a therapist */}
        <section className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 ${!patient ? "opacity-60 pointer-events-none" : ""}`}>
          <div>
            <p className="text-sm font-semibold text-gray-800">2. Therapist</p>
            <p className="text-xs text-gray-500">
              Only therapists affiliated with your hospital are shown.
            </p>
          </div>

          {therapistsErr && (
            <p className="text-xs text-red-600">{therapistsErr}</p>
          )}

          {therapistsLoading ? (
            <div className="py-6 text-center text-xs text-gray-500">Loading therapists…</div>
          ) : therapists.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
              No therapists available for your hospital yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {therapists.map((t) => {
                const active = selectedTherapist?._id === t._id;
                const specs = t.therapistInfo?.specializations?.slice(0, 2).join(", ") || "Therapist";
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setSelectedTherapist(t)}
                    className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-[#4b7eff] bg-[#4b7eff]/5 ring-1 ring-[#4b7eff]/40"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Image
                      src={t.profilePicture || "/default-avatar.png"}
                      alt={t.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="truncate text-[11px] text-gray-500">{specs}</p>
                    </div>
                    <span className={`text-[11px] ${active ? "text-[#4b7eff]" : "text-gray-400"}`}>
                      {active ? "Selected" : "Choose"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 3: pick a slot */}
        <section
          className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 ${
            !patient || !selectedTherapist ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">3. Slot</p>
            <p className="text-xs text-gray-500">Available in-person slots for the next 7 days.</p>
          </div>

          {slotsErr && (
            <p className="text-xs text-red-600">{slotsErr}</p>
          )}

          {!selectedTherapist ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
              Pick a therapist first.
            </div>
          ) : slotsLoading ? (
            <div className="py-6 text-center text-xs text-gray-500">Loading available slots…</div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
              No free slots in the next 7 days.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(slotsByDay).map(([day, daySlots]) => (
                <div key={day}>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    {day}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => {
                      const active = selectedSlot?._id === s._id;
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => setSelectedSlot(s)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            active
                              ? "border-[#4b7eff] bg-[#4b7eff] text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5"
                          }`}
                        >
                          {formatTime(s.start)} – {formatTime(s.end)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step 4: confirm */}
        <section
          className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 ${
            !patient || !selectedTherapist || !selectedSlot ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">4. Confirm</p>
            <p className="text-xs text-gray-500">Add a quick reason if helpful, then book.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Reason (optional)</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4b7eff] focus:outline-none"
              placeholder="e.g. Walk-in consultation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {bookingErr && (
            <p className="text-xs text-red-600">{bookingErr}</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {patient && selectedTherapist && selectedSlot
                ? `${patient.name} • ${selectedTherapist.name} • ${formatRange(selectedSlot.start, selectedSlot.end)}`
                : "Complete the steps above to book."}
            </p>
            <Button
              onClick={confirmBooking}
              disabled={!patient || !selectedTherapist || !selectedSlot || bookingLoading}
            >
              {bookingLoading ? "Booking…" : "Confirm booking"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function groupByDay(slots: Slot[]) {
  const out: Record<string, Slot[]> = {};
  for (const s of slots) {
    const d = new Date(s.start);
    const key = d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    (out[key] ||= []).push(s);
  }
  return out;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRange(startIso: string, endIso: string) {
  const day = new Date(startIso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${day} ${formatTime(startIso)}–${formatTime(endIso)}`;
}
