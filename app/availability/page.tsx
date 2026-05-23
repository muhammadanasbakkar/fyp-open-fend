// app/availability/page.tsx
"use client";

import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

const INPUT_FMT = "YYYY-MM-DDTHH:mm";
const DISPLAY_FMT = "ddd, MMM DD, YYYY hh:mm A";

type Hospital = { _id: string; name: string };
type AvailabilityItem = {
  _id: string;
  start: string;
  end: string;
  hospitalId?: string | null;
  hospital?: { _id: string; name: string } | null;
};

type DaySched = { enabled: boolean; start: string; end: string };
type WeekSched = Record<number, DaySched>; // 0..6 (Sun..Sat)

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function emptyWeek(): WeekSched {
  return {
    0: { enabled: false, start: "09:00", end: "17:00" },
    1: { enabled: true, start: "09:00", end: "17:00" },
    2: { enabled: true, start: "09:00", end: "17:00" },
    3: { enabled: true, start: "09:00", end: "17:00" },
    4: { enabled: true, start: "09:00", end: "17:00" },
    5: { enabled: true, start: "09:00", end: "17:00" },
    6: { enabled: false, start: "09:00", end: "17:00" },
  };
}

// Quick-apply templates so the therapist doesn't tick each box.
const TEMPLATES: { label: string; build: () => WeekSched }[] = [
  {
    label: "Weekdays 9–5",
    build: () => emptyWeek(),
  },
  {
    label: "Weekdays 10–6",
    build: () => {
      const w = emptyWeek();
      [1, 2, 3, 4, 5].forEach((d) => {
        w[d] = { enabled: true, start: "10:00", end: "18:00" };
      });
      return w;
    },
  },
  {
    label: "Mon/Wed/Fri",
    build: () => {
      const w = emptyWeek();
      [0, 2, 4, 6].forEach((d) => (w[d].enabled = false));
      [1, 3, 5].forEach((d) => (w[d] = { enabled: true, start: "10:00", end: "16:00" }));
      return w;
    },
  },
  {
    label: "Weekends only",
    build: () => {
      const w = emptyWeek();
      [1, 2, 3, 4, 5].forEach((d) => (w[d].enabled = false));
      w[6] = { enabled: true, start: "10:00", end: "16:00" };
      w[0] = { enabled: true, start: "10:00", end: "16:00" };
      return w;
    },
  },
];

function fmtLocal(dt: string | Date) {
  return dayjs(dt).format(DISPLAY_FMT);
}

function groupByDate(list: AvailabilityItem[]) {
  const out: Record<string, AvailabilityItem[]> = {};
  for (const s of list) {
    const key = dayjs(s.start).format("YYYY-MM-DD");
    (out[key] ||= []).push(s);
  }
  Object.values(out).forEach((arr) =>
    arr.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
  );
  return out;
}

export default function AvailabilityPage() {
  return (
    <Protected>
      <RoleGuard roles={["therapist"]}>
        <Inner />
      </RoleGuard>
    </Protected>
  );
}

function Inner() {
  const { token } = useAuth();

  const [list, setList] = useState<AvailabilityItem[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsErr, setHospitalsErr] = useState("");

  // Weekly schedule (default mode, matches signup pattern).
  const [bulkHospitalId, setBulkHospitalId] = useState<string>("");
  const [bulkMonth, setBulkMonth] = useState(dayjs().startOf("month"));
  const [week, setWeek] = useState<WeekSched>(emptyWeek());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Single one-off slot (secondary mode).
  const [mode, setMode] = useState<"quick" | "weekly" | "slot">("quick");
  const [hospitalId, setHospitalId] = useState<string>("");
  const [start, setStart] = useState(dayjs().format(INPUT_FMT));
  const [end, setEnd] = useState(dayjs().add(1, "hour").format(INPUT_FMT));
  const [loading, setLoading] = useState(false);

  // Quick fill — one time range applied to whichever weekdays are toggled
  // on across an entire month. Minimal path: pick clinic → tap days → set
  // start/end → apply.
  const [quickDays, setQuickDays] = useState<Set<number>>(
    () => new Set([1, 2, 3, 4, 5]) // Mon–Fri by default
  );
  const [quickStart, setQuickStart] = useState("09:00");
  const [quickEnd, setQuickEnd] = useState("17:00");
  const [quickLoading, setQuickLoading] = useState(false);

  function toggleQuickDay(dow: number) {
    setQuickDays((prev) => {
      const next = new Set(prev);
      if (next.has(dow)) next.delete(dow);
      else next.add(dow);
      return next;
    });
  }

  // Live preview of how many windows the quick fill will create.
  const quickPlannedCount = useMemo(() => {
    if (quickDays.size === 0) return 0;
    const monthStart = bulkMonth.startOf("month");
    const daysInMonth = bulkMonth.daysInMonth();
    let count = 0;
    for (let i = 0; i < daysInMonth; i++) {
      if (quickDays.has(monthStart.add(i, "day").day())) count++;
    }
    return count;
  }, [quickDays, bulkMonth]);

  async function quickApply() {
    setErr("");
    setMsg("");
    if (!token) {
      setErr("Session expired. Please log in again.");
      return;
    }
    if (!bulkHospitalId) {
      setErr("Pick a clinic.");
      return;
    }
    if (quickDays.size === 0) {
      setErr("Tap at least one day.");
      return;
    }

    const [sh, sm] = quickStart.split(":").map(Number);
    const [eh, em] = quickEnd.split(":").map(Number);
    if (
      !Number.isFinite(sh) || !Number.isFinite(sm) ||
      !Number.isFinite(eh) || !Number.isFinite(em)
    ) {
      setErr("Invalid time.");
      return;
    }
    if ((eh * 60 + em) - (sh * 60 + sm) < 15) {
      setErr("Window must be at least 15 minutes.");
      return;
    }

    const monthStart = bulkMonth.startOf("month");
    const daysInMonth = bulkMonth.daysInMonth();
    const slots: { startISO: string; endISO: string; dayKey: string }[] = [];
    for (let i = 0; i < daysInMonth; i++) {
      const d = monthStart.add(i, "day");
      if (!quickDays.has(d.day())) continue;
      const s = d.hour(sh).minute(sm).second(0).millisecond(0);
      const e = d.hour(eh).minute(em).second(0).millisecond(0);
      slots.push({
        startISO: s.toISOString(),
        endISO: e.toISOString(),
        dayKey: d.format("YYYY-MM-DD"),
      });
    }
    if (!slots.length) {
      setErr("No matching days in the selected month.");
      return;
    }

    // Skip existing windows at the same day + start time.
    const existingKeys = new Set(
      list
        .filter((s) => {
          const hid = s.hospital?._id || s.hospitalId || "";
          return hid === bulkHospitalId;
        })
        .map(
          (s) =>
            `${dayjs(s.start).format("YYYY-MM-DD")}@${dayjs(s.start).format("HH:mm")}`
        )
    );

    setQuickLoading(true);
    let created = 0, skipped = 0, failed = 0;
    for (const slot of slots) {
      const key = `${slot.dayKey}@${dayjs(slot.startISO).format("HH:mm")}`;
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      try {
        await api("api/availability", {
          method: "POST",
          headers: {
            ...(authHeader(token) as HeadersInit),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: slot.startISO,
            end: slot.endISO,
            hospital: bulkHospitalId,
          }),
        });
        created++;
      } catch {
        failed++;
      }
    }
    setQuickLoading(false);
    const parts: string[] = [];
    if (created) parts.push(`${created} added`);
    if (skipped) parts.push(`${skipped} already existed`);
    if (failed) parts.push(`${failed} failed`);
    setMsg(`Done. ${parts.join(", ") || "Nothing to add."}`);
    await loadAvailability();
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  const grouped = useMemo(() => groupByDate(list), [list]);

  function updateDay(dow: number, patch: Partial<DaySched>) {
    setWeek((prev) => ({ ...prev, [dow]: { ...prev[dow], ...patch } }));
  }

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setWeek(t.build());
  }

  function copyMondayToWeekdays() {
    const m = week[1];
    setWeek((prev) => ({
      ...prev,
      2: { ...prev[2], ...m },
      3: { ...prev[3], ...m },
      4: { ...prev[4], ...m },
      5: { ...prev[5], ...m },
    }));
  }

  function clearWeek() {
    setWeek((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        const dow = +k as 0 | 1 | 2 | 3 | 4 | 5 | 6;
        next[dow] = { ...next[dow], enabled: false };
      }
      return next;
    });
  }

  // Preview: count of windows we'd create in the chosen month.
  const plannedCount = useMemo(() => {
    const enabledDays = Object.entries(week)
      .filter(([, d]) => d.enabled)
      .map(([k]) => +k);
    if (!enabledDays.length) return 0;
    const monthStart = bulkMonth.startOf("month");
    const daysInMonth = bulkMonth.daysInMonth();
    let count = 0;
    for (let i = 0; i < daysInMonth; i++) {
      const d = monthStart.add(i, "day");
      if (enabledDays.includes(d.day())) count++;
    }
    return count;
  }, [week, bulkMonth]);

  async function loadAvailability() {
    try {
      const res = await api("api/availability/me", {
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setList((res || []) as AvailabilityItem[]);
    } catch (e: any) {
      setErr(e.message || "Failed to load availability.");
    }
  }

  async function loadHospitals() {
    setHospitalsErr("");
    setHospitalsLoading(true);
    try {
      const res = await api("api/public/hospitals", {
        headers: authHeader(token || undefined) as HeadersInit,
      });
      const arr = (res?.hospitals || []) as Hospital[];
      setHospitals(arr);
      if (!hospitalId && arr.length) setHospitalId(arr[0]._id);
      if (!bulkHospitalId && arr.length) setBulkHospitalId(arr[0]._id);
    } catch (e: any) {
      setHospitalsErr(e.message || "Failed to load hospitals.");
    } finally {
      setHospitalsLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadAvailability();
    loadHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function setQuick(minutes: number) {
    setEnd(dayjs(start).add(minutes, "minute").format(INPUT_FMT));
  }

  async function createSlot() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const s = dayjs(start);
      const e = dayjs(end);
      if (!s.isValid() || !e.isValid()) throw new Error("Please choose valid dates.");
      if (!e.isAfter(s)) throw new Error("End must be after start.");
      if (e.diff(s, "minute") < 15) throw new Error("Minimum length is 15 minutes.");
      if (!hospitalId) throw new Error("Please select a clinic.");
      if (!token) throw new Error("Session expired. Please log in again.");

      await api("api/availability", {
        method: "POST",
        headers: {
          ...(authHeader(token) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: s.toISOString(),
          end: e.toISOString(),
          hospital: hospitalId,
        }),
      });
      setMsg("Availability window added.");
      await loadAvailability();
    } catch (e: any) {
      setErr(e.message || "Could not add availability.");
    } finally {
      setLoading(false);
    }
  }

  async function bulkCreate() {
    setErr("");
    setMsg("");
    if (!token) {
      setErr("Session expired. Please log in again.");
      return;
    }
    if (!bulkHospitalId) {
      setErr("Pick a clinic to apply the schedule to.");
      return;
    }

    const enabledDays: { dow: number; sh: number; sm: number; eh: number; em: number }[] = [];
    for (const k of Object.keys(week)) {
      const dow = +k;
      const d = week[dow];
      if (!d.enabled) continue;
      const [sh, sm] = d.start.split(":").map(Number);
      const [eh, em] = d.end.split(":").map(Number);
      if (
        !Number.isFinite(sh) || !Number.isFinite(sm) ||
        !Number.isFinite(eh) || !Number.isFinite(em)
      ) {
        setErr(`${DAY_FULL[dow]} has an invalid time.`);
        return;
      }
      if (eh * 60 + em - (sh * 60 + sm) < 15) {
        setErr(`${DAY_FULL[dow]} window must be at least 15 minutes.`);
        return;
      }
      enabledDays.push({ dow, sh, sm, eh, em });
    }

    if (!enabledDays.length) {
      setErr("Enable at least one day with a time range.");
      return;
    }

    const monthStart = bulkMonth.startOf("month");
    const daysInMonth = bulkMonth.daysInMonth();
    const slots: { startISO: string; endISO: string; dayKey: string }[] = [];
    for (let i = 0; i < daysInMonth; i++) {
      const d = monthStart.add(i, "day");
      const sched = enabledDays.find((x) => x.dow === d.day());
      if (!sched) continue;
      const s = d.hour(sched.sh).minute(sched.sm).second(0).millisecond(0);
      const e = d.hour(sched.eh).minute(sched.em).second(0).millisecond(0);
      slots.push({
        startISO: s.toISOString(),
        endISO: e.toISOString(),
        dayKey: d.format("YYYY-MM-DD"),
      });
    }

    if (!slots.length) {
      setErr("No matching days in the selected month.");
      return;
    }

    // Idempotent re-apply: skip slots that already exist.
    const existingKeys = new Set(
      list
        .filter((s) => {
          const hid = s.hospital?._id || s.hospitalId || "";
          return hid === bulkHospitalId;
        })
        .map(
          (s) =>
            `${dayjs(s.start).format("YYYY-MM-DD")}@${dayjs(s.start).format("HH:mm")}`
        )
    );

    setBulkLoading(true);
    let created = 0;
    let skipped = 0;
    let failed = 0;
    for (const slot of slots) {
      const key = `${slot.dayKey}@${dayjs(slot.startISO).format("HH:mm")}`;
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      try {
        await api("api/availability", {
          method: "POST",
          headers: {
            ...(authHeader(token) as HeadersInit),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: slot.startISO,
            end: slot.endISO,
            hospital: bulkHospitalId,
          }),
        });
        created++;
      } catch {
        failed++;
      }
    }

    setBulkLoading(false);
    const parts: string[] = [];
    if (created) parts.push(`${created} added`);
    if (skipped) parts.push(`${skipped} already existed`);
    if (failed) parts.push(`${failed} failed`);
    setMsg(`Schedule applied. ${parts.join(", ") || "Nothing to add."}`);
    await loadAvailability();
  }

  async function remove(id: string) {
    setErr("");
    setMsg("");
    const ok = confirm("Delete this availability window?");
    if (!ok) return;
    try {
      await api(`/availability/${id}`, {
        method: "DELETE",
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setMsg("Availability deleted.");
      await loadAvailability();
    } catch (e: any) {
      setErr(e.message || "Could not delete availability.");
    }
  }

  const hospitalNameById = useMemo(() => {
    const m: Record<string, string> = {};
    hospitals?.forEach((h) => (m[h._id] = h.name));
    return m;
  }, [hospitals]);

  // Stats for the header pill.
  const now = Date.now();
  const upcomingCount = list.filter((w) => +new Date(w.start) > now).length;
  const thisMonthCount = list.filter((w) => {
    const d = dayjs(w.start);
    return d.year() === dayjs().year() && d.month() === dayjs().month();
  }).length;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="relative h-24 bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#7c3aed] sm:h-28">
            <div
              aria-hidden
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden
              className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-3xl"
            />
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Therapist
            </span>
          </div>
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-4 px-6 pb-5 sm:px-8 sm:pb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                My availability
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                Define when patients can book you at each clinic. Use a
                <span className="font-semibold text-gray-900"> weekly schedule </span>
                to fill a whole month in one go, or drop in a
                <span className="font-semibold text-gray-900"> single slot </span>
                for one-off availability. Times shown in{" "}
                <span className="font-medium text-gray-900">{tz}</span>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Upcoming
                </span>
                <span className="text-base font-bold text-gray-900">{upcomingCount}</span>
              </span>
              <span className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  This month
                </span>
                <span className="text-base font-bold text-gray-900">{thisMonthCount}</span>
              </span>
              <span className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total
                </span>
                <span className="text-base font-bold text-gray-900">{list.length}</span>
              </span>
            </div>
          </div>
        </section>

        {/* ── Mode tabs ───────────────────────────────────────── */}
        <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(
            [
              { key: "quick", label: "Quick fill", hint: "Fastest" },
              { key: "weekly", label: "Weekly schedule", hint: "Per-day times" },
              { key: "slot", label: "Single slot", hint: "One-off" },
            ] as const
          ).map((t) => {
            const active = mode === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setMode(t.key)}
                className={[
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-[#4b7eff] text-white"
                    : "text-gray-600 hover:bg-gray-50",
                ].join(" ")}
                title={t.hint}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Top-level messages */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {err}
          </div>
        )}
        {msg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            {msg}
          </div>
        )}

        {/* ── Quick fill — minimal flow ──────────────────────── */}
        {mode === "quick" && (
          <section className="space-y-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-gray-600">
              Fastest way to fill a month: tap the days, set the time once, hit
              Apply.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Clinic
                </label>
                <select
                  value={bulkHospitalId}
                  onChange={(e) => setBulkHospitalId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                  disabled={hospitalsLoading || quickLoading}
                >
                  {hospitals.length === 0 && <option value="">No clinics linked</option>}
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Month
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBulkMonth((m) => m.subtract(1, "month"))}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    aria-label="Previous month"
                    disabled={quickLoading}
                  >
                    ‹
                  </button>
                  <div className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-900">
                    {bulkMonth.format("MMMM YYYY")}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkMonth((m) => m.add(1, "month"))}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    aria-label="Next month"
                    disabled={quickLoading}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Day pills — tap to toggle */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Working days
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
                  const active = quickDays.has(dow);
                  return (
                    <button
                      key={dow}
                      type="button"
                      onClick={() => toggleQuickDay(dow)}
                      disabled={quickLoading}
                      className={[
                        "h-11 w-11 rounded-xl text-sm font-bold transition-all sm:h-12 sm:w-12",
                        active
                          ? "bg-[#4b7eff] text-white shadow-sm ring-2 ring-[#4b7eff]/30"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                      ].join(" ")}
                      title={DAY_FULL[dow]}
                    >
                      {DAY_LABELS[dow]}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuickDays(new Set([1, 2, 3, 4, 5]))}
                  disabled={quickLoading}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDays(new Set([0, 6]))}
                  disabled={quickLoading}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDays(new Set([0, 1, 2, 3, 4, 5, 6]))}
                  disabled={quickLoading}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Every day
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDays(new Set())}
                  disabled={quickLoading}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Single time range applied to all selected days */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start
                </label>
                <Input
                  type="time"
                  value={quickStart}
                  onChange={(e) => setQuickStart(e.target.value)}
                  disabled={quickLoading}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End
                </label>
                <Input
                  type="time"
                  value={quickEnd}
                  onChange={(e) => setQuickEnd(e.target.value)}
                  disabled={quickLoading}
                />
              </div>
            </div>

            {/* Preview + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {quickPlannedCount === 0
                    ? "No days selected"
                    : `${quickPlannedCount} ${
                        quickPlannedCount === 1 ? "window" : "windows"
                      } · ${quickStart}–${quickEnd}`}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Days already booked at the same start time are skipped.
                </p>
              </div>
              <Button
                onClick={quickApply}
                disabled={
                  quickLoading ||
                  !bulkHospitalId ||
                  quickDays.size === 0 ||
                  quickPlannedCount === 0
                }
                className="w-full rounded-xl bg-[#4b7eff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3a6bef] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {quickLoading ? "Applying…" : `Apply to ${bulkMonth.format("MMMM")}`}
              </Button>
            </div>
          </section>
        )}

        {/* ── Weekly schedule (per-day times) ───────────────────── */}
        {mode === "weekly" && (
          <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            {/* Clinic + month controls */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Clinic
                </label>
                <select
                  value={bulkHospitalId}
                  onChange={(e) => setBulkHospitalId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                  disabled={hospitalsLoading || bulkLoading}
                >
                  {hospitals.length === 0 && <option value="">No clinics linked</option>}
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
                {hospitalsErr && (
                  <p className="mt-1 text-[11px] text-red-600">{hospitalsErr}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Apply to month
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBulkMonth((m) => m.subtract(1, "month"))}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    aria-label="Previous month"
                    disabled={bulkLoading}
                  >
                    ‹
                  </button>
                  <div className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-900">
                    {bulkMonth.format("MMMM YYYY")}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkMonth((m) => m.add(1, "month"))}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    aria-label="Next month"
                    disabled={bulkLoading}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Preset templates */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Quick start
              </span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  disabled={bulkLoading}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 disabled:opacity-50"
                >
                  {t.label}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-gray-200" />
              <button
                type="button"
                onClick={copyMondayToWeekdays}
                disabled={bulkLoading}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                title="Copy Monday's times to Tue–Fri"
              >
                Copy Mon → Fri
              </button>
              <button
                type="button"
                onClick={clearWeek}
                disabled={bulkLoading}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
            </div>

            {/* Day rows — visually richer than plain rows */}
            <div className="grid gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
                const d = week[dow];
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <div
                    key={dow}
                    className={[
                      "grid grid-cols-1 items-center gap-3 rounded-2xl border p-3 transition-colors sm:grid-cols-[7rem_auto_1fr_1fr]",
                      d.enabled
                        ? "border-[#4b7eff]/30 bg-[#4b7eff]/5"
                        : "border-gray-100 bg-gray-50/50",
                    ].join(" ")}
                  >
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                      <input
                        type="checkbox"
                        checked={d.enabled}
                        onChange={(e) =>
                          updateDay(dow, { enabled: e.target.checked })
                        }
                        disabled={bulkLoading}
                        className="h-4 w-4 rounded border-gray-300 text-[#4b7eff] focus:ring-[#4b7eff]"
                      />
                      {DAY_FULL[dow]}
                      {isWeekend && (
                        <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                          weekend
                        </span>
                      )}
                    </label>
                    <span
                      className={[
                        "hidden text-xs sm:inline",
                        d.enabled ? "text-gray-700" : "text-gray-400",
                      ].join(" ")}
                    >
                      {d.enabled ? `${d.start} – ${d.end}` : "off"}
                    </span>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Start
                      </label>
                      <Input
                        type="time"
                        value={d.start}
                        disabled={!d.enabled || bulkLoading}
                        onChange={(e) => updateDay(dow, { start: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        End
                      </label>
                      <Input
                        type="time"
                        value={d.end}
                        disabled={!d.enabled || bulkLoading}
                        onChange={(e) => updateDay(dow, { end: e.target.value })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preview + Apply CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {plannedCount === 0
                    ? "No days selected"
                    : `Will create ${plannedCount} availability ${
                        plannedCount === 1 ? "window" : "windows"
                      } in ${bulkMonth.format("MMMM")}`}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Days already on your schedule with the same start time will be
                  skipped, so it&apos;s safe to re-apply.
                </p>
              </div>
              <Button
                onClick={bulkCreate}
                disabled={bulkLoading || !bulkHospitalId || plannedCount === 0}
                className="w-full rounded-xl bg-[#4b7eff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3a6bef] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {bulkLoading ? "Applying…" : `Apply to ${bulkMonth.format("MMMM")}`}
              </Button>
            </div>
          </section>
        )}

        {/* ── Single slot mode ────────────────────────────────── */}
        {mode === "slot" && (
          <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-gray-600">
              Add a one-off availability window. Useful for special hours,
              make-up slots, or trial sessions.
            </p>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Clinic
                </label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                  disabled={hospitalsLoading}
                >
                  {!hospitalsLoading && hospitals.length === 0 && (
                    <option value="">No clinics linked</option>
                  )}
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start
                </label>
                <Input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End
                </label>
                <Input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500">Quick duration</span>
                {[30, 45, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQuick(m)}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    {m} min
                  </button>
                ))}
              </div>
              <Button
                onClick={createSlot}
                disabled={loading || hospitalsLoading || !hospitalId}
                className="w-full rounded-xl bg-[#4b7eff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3a6bef] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Adding…" : "Add window"}
              </Button>
            </div>
          </section>
        )}

        {/* ── Existing windows ────────────────────────────────── */}
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Your availability windows
              </p>
              <p className="text-[11px] text-gray-500">
                Patients can book inside any of these.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
              {list.length} total
            </span>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-gray-700">
                No availability set yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Use the weekly schedule above to add windows for an entire month
                in a few clicks.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([dayKey, items]) => {
                const isToday =
                  dayjs(dayKey).format("YYYY-MM-DD") ===
                  dayjs().format("YYYY-MM-DD");
                const isPast =
                  dayjs(dayKey).isBefore(dayjs().startOf("day"));
                return (
                  <div key={dayKey} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <span
                        className={[
                          "inline-block h-1.5 w-1.5 rounded-full",
                          isToday
                            ? "bg-emerald-500"
                            : isPast
                              ? "bg-gray-300"
                              : "bg-[#4b7eff]",
                        ].join(" ")}
                      />
                      <span className={isPast ? "text-gray-400" : ""}>
                        {dayjs(dayKey).format("dddd, MMM D, YYYY")}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-700">
                          today
                        </span>
                      )}
                      <span className="ml-auto text-[10px] font-medium normal-case text-gray-400">
                        {items.length} {items.length === 1 ? "window" : "windows"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((s) => {
                        const attachedName =
                          s.hospital?.name ||
                          (s.hospitalId ? hospitalNameById[s.hospitalId] : null);
                        const past = +new Date(s.end) < Date.now();
                        return (
                          <div
                            key={s._id}
                            className={[
                              "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
                              past
                                ? "border-gray-100 bg-gray-50/60 opacity-70"
                                : "border-gray-100 bg-white hover:border-[#4b7eff]/30",
                            ].join(" ")}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900">
                                {dayjs(s.start).format("hh:mm A")}{" "}
                                <span className="text-gray-300">→</span>{" "}
                                {dayjs(s.end).format("hh:mm A")}
                              </div>
                              <div className="mt-0.5 truncate text-[11px] text-gray-500">
                                {attachedName || "No clinic attached"}
                              </div>
                            </div>
                            <button
                              onClick={() => remove(s._id)}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
