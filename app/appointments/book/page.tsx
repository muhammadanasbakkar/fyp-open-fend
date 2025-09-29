"use client";
import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import dayjs from "dayjs";

type Therapist = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  role?: "therapist";
};

type FreeSlot = { start: string; end: string };
type FreeResponse = {
  therapist: string;
  from: string;
  to: string;
  slotMinutes: number;
  slots: FreeSlot[];
};

const SLOT_MINUTES_DEFAULT = 30;

export default function BookPage() {
  return (
    <Protected>
      <BookInner />
    </Protected>
  );
}

function BookInner() {
  const { token } = useAuth();

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [therapistId, setTherapistId] = useState<string>("");

  const [fromLocal, setFromLocal] = useState<string>(
    dayjs().startOf("day").add(1, "day").format("YYYY-MM-DDTHH:mm")
  );
  const [toLocal, setToLocal] = useState<string>(
    dayjs().startOf("day").add(8, "day").format("YYYY-MM-DDTHH:mm")
  );
  const [slotMinutes, setSlotMinutes] = useState<number>(SLOT_MINUTES_DEFAULT);

  const [free, setFree] = useState<FreeSlot[]>([]);
  const [loadingFree, setLoadingFree] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
    []
  );

  useEffect(() => {
    console.log(therapists);
  }, [therapists]);

  // ---------- Load therapists ----------
  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoadingTherapists(true);
      setErr("");
      try {
        // Expecting an array of { _id, name, email, phone, profilePicture, role }
        // Adjust this path if your route differs (e.g., "/users?role=therapist")
        const data = await api("api/therapists", {
          headers: authHeader(token),
        });

        console.log(data);
        setTherapists(Array.isArray(data?.items) ? data?.items : []);
      } catch (e: any) {
        setErr(e.message || "Unable to load therapists.");
      } finally {
        setLoadingTherapists(false);
      }
    })();
  }, [token]);

  // ---------- Load free slots for selected therapist ----------
  async function loadFree() {
    try {
      setErr("");
      setMsg("");
      setSelectedSlot(null);
      if (!therapistId) throw new Error("Choose a therapist.");
      if (!fromLocal || !toLocal) throw new Error("Pick a date range.");

      const fromISO = dayjs(fromLocal).toISOString();
      const toISO = dayjs(toLocal).toISOString();

      setLoadingFree(true);
      const res: FreeResponse = await api(
        `api/availability/therapist/${therapistId}/free?from=${encodeURIComponent(
          fromISO
        )}&to=${encodeURIComponent(toISO)}&slotMinutes=${slotMinutes}`,
        { headers: authHeader(token || undefined) }
      );
      setFree(res?.slots || []);
    } catch (e: any) {
      setErr(e.message || "Could not load free slots.");
      setFree([]);
    } finally {
      setLoadingFree(false);
    }
  }

  // ---------- Book selected slot ----------
  async function book() {
    try {
      setErr("");
      setMsg("");
      if (!therapistId) throw new Error("Choose a therapist.");
      if (!selectedSlot) throw new Error("Choose a time slot.");

      await api("api/appointments", {
        method: "POST",
        headers: authHeader(token || undefined),
        body: JSON.stringify({
          therapist: therapistId,
          start: selectedSlot.start, // ISO
          end: selectedSlot.end, // ISO
        }),
      });

      setMsg(
        "Request sent! The therapist will accept/reject. You’ll get a message."
      );
      setSelectedSlot(null);
    } catch (e: any) {
      setErr(e.message || "Booking failed.");
    }
  }

  const selectedTherapist = therapists.find((t) => t._id === therapistId);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Book an appointment</h1>
        <p className="mt-1 text-sm text-gray-600">
          Times shown in <span className="font-medium">{tz}</span>.
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

      {/* Therapist list */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Choose therapist</p>
        </div>

        {loadingTherapists ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-lg border bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        ) : therapists.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {therapists.map((t) => (
              <button
                key={t._id}
                type="button"
                // onClick={() => setTherapistId(t._id)}

                onClick={() => {
                  const now = dayjs();
                  const twoWeeks = now.add(14, "day");
                  setTherapistId(t._id);
                  setFromLocal(now.format("YYYY-MM-DDTHH:mm"));
                  setToLocal(twoWeeks.format("YYYY-MM-DDTHH:mm"));
                  setSlotMinutes(30);
                  // fire and forget load
                  (async () => {
                    try {
                      const fromISO = now.toISOString();
                      const toISO = twoWeeks.toISOString();
                      setLoadingFree(true);
                      const res = await api(
                        `api/availability/therapist/${
                          t._id
                        }/free?from=${encodeURIComponent(
                          fromISO
                        )}&to=${encodeURIComponent(toISO)}&slotMinutes=30`,
                        { headers: authHeader(token || undefined) }
                      );
                      setFree(res?.slots || []);
                      setSelectedSlot(null);
                      setErr("");
                    } catch (e: any) {
                      setErr(e.message || "Could not load free slots.");
                      setFree([]);
                    } finally {
                      setLoadingFree(false);
                    }
                  })();
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
                    alt={t.name || t.email || t.phone || "Therapist"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {t.name || t.email || t.phone || `Therapist`}
                    </div>
                    {t.email && (
                      <div className="truncate text-xs text-gray-500">
                        {t.email}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No therapists found.</p>
        )}
      </div>

      {/* Find free slots */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <p className="text-sm font-medium">Pick a date range (your local)</p>
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-700">From</label>
            <Input
              type="datetime-local"
              value={fromLocal}
              onChange={(e) => setFromLocal(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-700">To</label>
            <Input
              type="datetime-local"
              value={toLocal}
              onChange={(e) => setToLocal(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Slot length
            </label>
            <Select
              value={String(slotMinutes)}
              onChange={(e) =>
                setSlotMinutes(parseInt(e.target.value || "30", 10))
              }
            >
              {[15, 20, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Button onClick={loadFree} disabled={!therapistId || loadingFree}>
            {loadingFree ? "Loading…" : "Find free slots"}
          </Button>
        </div>

        {/* Slots */}
        {free.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">
              Free slots for{" "}
              <span className="font-semibold">
                {selectedTherapist?.name ||
                  selectedTherapist?.email ||
                  selectedTherapist?.phone}
              </span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {free.map((s) => {
                const label = `${dayjs(s.start).format(
                  "ddd, MMM D, HH:mm"
                )} – ${dayjs(s.end).format("HH:mm")}`;
                const isSelected =
                  selectedSlot?.start === s.start &&
                  selectedSlot?.end === s.end;
                return (
                  <button
                    key={`${s.start}-${s.end}`}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-lg border px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                      isSelected ? "ring-2 ring-[var(--brand,#4b7eff)]" : ""
                    }`}
                    title={`${dayjs(s.start).toString()} to ${dayjs(
                      s.end
                    ).toString()}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Book */}
        <div className="pt-2">
          <Button onClick={book} disabled={!selectedSlot || !therapistId}>
            {/* {console.log(therapistId)} */}
            Send booking request
          </Button>
        </div>
      </div>
    </div>
  );
}
