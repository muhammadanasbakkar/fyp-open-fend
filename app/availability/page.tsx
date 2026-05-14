

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

type Hospital = {
  _id: string;
  name: string;
};

type AvailabilityItem = {
  _id: string;
  start: string;
  end: string;
  hospitalId?: string | null;
  hospital?: { _id: string; name: string } | null;
};

export default function AvailabilityPage() {
  return (
    <Protected>
      <RoleGuard roles={["therapist"]}>
        <Inner />
      </RoleGuard>
    </Protected>
  );
}

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

function Inner() {
  const { token } = useAuth();

  const [start, setStart] = useState(dayjs().format(INPUT_FMT));
  const [end, setEnd] = useState(dayjs().add(2, "hour").format(INPUT_FMT));

  const [list, setList] = useState<AvailabilityItem[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState<string>("");
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsErr, setHospitalsErr] = useState("");

  // Monthly bulk-add state — signup-style days-of-week schedule.
  // Each day independently: enabled + start + end.
  type DaySched = { enabled: boolean; start: string; end: string };
  type WeekSched = Record<number, DaySched>; // keyed 0..6 (Sun..Sat)
  const EMPTY_WEEK: WeekSched = {
    0: { enabled: false, start: "09:00", end: "17:00" },
    1: { enabled: true,  start: "09:00", end: "17:00" },
    2: { enabled: true,  start: "09:00", end: "17:00" },
    3: { enabled: true,  start: "09:00", end: "17:00" },
    4: { enabled: true,  start: "09:00", end: "17:00" },
    5: { enabled: true,  start: "09:00", end: "17:00" },
    6: { enabled: false, start: "09:00", end: "17:00" },
  };
  const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [mode, setMode] = useState<"slot" | "monthly">("slot");
  const [bulkHospitalId, setBulkHospitalId] = useState<string>("");
  const [bulkMonth, setBulkMonth] = useState(dayjs().startOf("month"));
  const [week, setWeek] = useState<WeekSched>(EMPTY_WEEK);
  const [bulkLoading, setBulkLoading] = useState(false);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  const grouped = useMemo(() => groupByDate(list), [list]);

  function updateDay(dow: number, patch: Partial<DaySched>) {
    setWeek((prev) => ({ ...prev, [dow]: { ...prev[dow], ...patch } }));
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
        next[+k as 0|1|2|3|4|5|6] = { ...next[+k as 0|1|2|3|4|5|6], enabled: false };
      }
      return next;
    });
  }

  function setQuick(minutes: number) {
    const s = dayjs(start);
    setEnd(s.add(minutes, "minute").format(INPUT_FMT));
  }

  async function createSlot() {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const s = dayjs(start);
      const e = dayjs(end);

      if (!s.isValid() || !e.isValid())
        throw new Error("Please choose valid dates.");
      if (!e.isAfter(s)) throw new Error("End must be after start.");

      const minutes = e.diff(s, "minute");
      if (minutes < 15) throw new Error("Minimum length is 15 minutes.");

      if (!hospitalId) throw new Error("Please select a hospital or clinic.");
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
      if (!hospitalId && arr.length) setHospitalId(arr[0]?._id);
      if (!bulkHospitalId && arr.length) setBulkHospitalId(arr[0]?._id);
    } catch (e: any) {
      setHospitalsErr(e.message || "Failed to load hospitals.");
    } finally {
      setHospitalsLoading(false);
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
      setErr("Pick a clinic to apply the monthly schedule to.");
      return;
    }

    // Collect enabled days with valid times.
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
        setErr(`${DAY_LABELS[dow]} has an invalid time.`);
        return;
      }
      if ((eh * 60 + em) - (sh * 60 + sm) < 15) {
        setErr(`${DAY_LABELS[dow]} window must be at least 15 minutes.`);
        return;
      }
      enabledDays.push({ dow, sh, sm, eh, em });
    }

    if (enabledDays.length === 0) {
      setErr("Enable at least one day with a time range.");
      return;
    }

    // Build a slot for every occurrence of each enabled day in the month.
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

    // Idempotent re-apply: skip slots that already exist at the same
    // YYYY-MM-DD @ HH:mm for this hospital.
    const existingKeys = new Set(
      list
        .filter((s) => {
          const hid = s.hospital?._id || s.hospitalId || "";
          return hid === bulkHospitalId;
        })
        .map((s) => `${dayjs(s.start).format("YYYY-MM-DD")}@${dayjs(s.start).format("HH:mm")}`)
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
    setMsg(`Monthly schedule applied. ${parts.join(", ")}.`);
    await loadAvailability();
  }

  useEffect(() => {
    if (!token) return;
    loadAvailability();
    loadHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const hospitalNameById = useMemo(() => {
    const m: Record<string, string> = {};
    hospitals?.forEach((h) => (m[h._id] = h.name));
    return m;
  }, [hospitals]);

  const totalWindows = list.length;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--brand,#4b7eff)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
              Therapist tools
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              My availability
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Patients can only book inside these windows. Times shown in{" "}
              <span className="font-medium">{tz}</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Active windows.{" "}
                <span className="font-semibold text-slate-900">
                  {totalWindows}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("slot")}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              mode === "slot"
                ? "bg-[var(--brand,#4b7eff)] text-white"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            Single slot
          </button>
          <button
            type="button"
            onClick={() => setMode("monthly")}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              mode === "monthly"
                ? "bg-[var(--brand,#4b7eff)] text-white"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            Weekly schedule · monthly
          </button>
        </div>

        {/* Weekly schedule applied to a whole month */}
        {mode === "monthly" && (
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Weekly schedule → applied to the whole month
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Just like signup: tick the days you work at this clinic and set
                  the time. We&apos;ll create one availability window for every
                  matching weekday in the chosen month.
                </p>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-500">
                Minimum 15 minutes
              </span>
            </div>

            {/* Hospital + month */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-700">
                  Hospital or clinic
                </label>
                <select
                  value={bulkHospitalId}
                  onChange={(e) => setBulkHospitalId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-2 focus:ring-[var(--brand,#4b7eff)]/40"
                  disabled={hospitalsLoading || bulkLoading}
                >
                  {hospitals.length === 0 && <option value="">No hospitals</option>}
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">Month</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBulkMonth((m) => m.subtract(1, "month"))}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="Previous month"
                    disabled={bulkLoading}
                  >
                    ‹
                  </button>
                  <div className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-900">
                    {bulkMonth.format("MMMM YYYY")}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkMonth((m) => m.add(1, "month"))}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="Next month"
                    disabled={bulkLoading}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Days of week — signup style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">Working days & time</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyMondayToWeekdays}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    disabled={bulkLoading}
                    title="Copy Monday's times to Tue–Fri"
                  >
                    Copy Mon → Fri
                  </button>
                  <button
                    type="button"
                    onClick={clearWeek}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    disabled={bulkLoading}
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
                  const d = week[dow];
                  return (
                    <div
                      key={dow}
                      className={[
                        "grid grid-cols-1 sm:grid-cols-[10rem_1fr_1fr] items-center gap-3 rounded-2xl border p-3",
                        d.enabled
                          ? "border-[var(--brand,#4b7eff)]/30 bg-[var(--brand,#4b7eff)]/5"
                          : "border-slate-100 bg-slate-50/40",
                      ].join(" ")}
                    >
                      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={d.enabled}
                          onChange={(e) => updateDay(dow, { enabled: e.target.checked })}
                          disabled={bulkLoading}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--brand,#4b7eff)] focus:ring-[var(--brand,#4b7eff)]"
                        />
                        {DAY_LABELS[dow]}
                      </label>
                      <div>
                        <label className="mb-1 block text-[11px] text-slate-600">Start</label>
                        <Input
                          type="time"
                          value={d.start}
                          disabled={!d.enabled || bulkLoading}
                          onChange={(e) => updateDay(dow, { start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] text-slate-600">End</label>
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
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Existing windows at the same date & start time will be skipped.
              </p>
              <Button
                onClick={bulkCreate}
                disabled={bulkLoading || !bulkHospitalId}
                className="
                  w-full sm:w-auto
                  px-4 py-2 text-sm font-medium rounded-md
                  bg-blue-600 text-white shadow-sm hover:bg-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {bulkLoading ? "Applying…" : `Apply to ${bulkMonth.format("MMMM")}`}
              </Button>
            </div>

            {err && (
              <p className="text-sm text-red-600 flex items-center gap-1">{err}</p>
            )}
            {msg && (
              <p className="text-sm text-emerald-600 flex items-center gap-1">{msg}</p>
            )}
          </div>
        )}

        {/* Creator card */}
        {mode === "slot" && (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Add availability window
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Choose a clinic. then select the start and end time when you are
                available for appointments.
              </p>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-500">
              Minimum 15 minutes
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate-700">
                Hospital or clinic
              </label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-2 focus:ring-[var(--brand,#4b7eff)]/60"
                disabled={hospitalsLoading}
              >
                {!hospitalsLoading && hospitals.length === 0 && (
                  <option value="">No hospitals available</option>
                )}
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
              {hospitalsErr && (
                <p className="mt-1 text-xs text-red-600">{hospitalsErr}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">Start</label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">End</label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Quick duration</span>
              {[30, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setQuick(m)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-slate-50"
                  title={`Set end to ${m} minutes after start`}
                >
                  {m} min
                </button>
              ))}
            </div>

         <Button
  onClick={createSlot}
  disabled={loading || hospitalsLoading || !hospitalId}
  className="
    mt-4
    w-full sm:w-auto
    px-4 
    py-2 
    text-sm 
    font-medium 
    rounded-md 
    bg-blue-600 
    text-white 
    shadow-sm
    hover:bg-blue-700
    disabled:opacity-50 
    disabled:cursor-not-allowed
  "
>
  {loading ? "Adding..." : "Add window"}
</Button>
          </div>

          {err && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
              {err}
            </p>
          )}
          {msg && (
            <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1">
              {msg}
            </p>
          )}
        </div>
        )}

        {/* List card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900">
              Your availability windows
            </p>
            <p className="text-xs text-slate-500">
              {list.length ? `${list.length} total` : "No windows yet"}
            </p>
          </div>

          {list.length ? (
            <div className="space-y-5">
              {Object.entries(grouped).map(([dayKey, items]) => {
                const dayHeader = dayjs(dayKey).format("dddd, MMM D, YYYY");
                return (
                  <div key={dayKey} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span>{dayHeader}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((s) => {
                        const attachedName =
                          s.hospital?.name ||
                          (s.hospitalId ? hospitalNameById[s.hospitalId] : null);
                        return (
                          <div
                            key={s._id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">
                                {fmtLocal(s.start)}{" "}
                                <span className="text-slate-400">→</span>{" "}
                                {fmtLocal(s.end)}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">
                                {attachedName ||
                                  "No hospital attached to this window"}
                              </div>
                            </div>
                            <button
                              onClick={() => remove(s._id)}
                              className="text-xs font-medium text-red-600 hover:underline"
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
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              You have not added any availability windows yet. 
              <br />
              Use the form above to set your first clinic slot.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
