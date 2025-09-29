// app/availability/page.tsx
"use client";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

// --- dayjs ---
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat"; // optional (LLL etc.)
dayjs.extend(localizedFormat);

// Helpers for <input type="datetime-local">
const INPUT_FMT = "YYYY-MM-DDTHH:mm"; // value format for datetime-local
const DISPLAY_FMT = "ddd, MMM DD, YYYY hh:mm A"; // human-readable

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

function groupByDate(list: any[]) {
  const out: Record<string, any[]> = {};
  for (const s of list) {
    const key = dayjs(s.start).format("YYYY-MM-DD");
    (out[key] ||= []).push(s);
  }
  // sort each day by start
  Object.values(out).forEach((arr) =>
    arr.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
  );
  return out;
}

function Inner() {
  const { token } = useAuth();

  // Defaults: now and +2h in user's local time
  const [start, setStart] = useState(dayjs().format(INPUT_FMT));
  const [end, setEnd] = useState(dayjs().add(2, "hour").format(INPUT_FMT));

  const [list, setList] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  const grouped = useMemo(() => groupByDate(list), [list]);

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

      if (!s.isValid() || !e.isValid()) throw new Error("Please choose valid dates.");
      if (!e.isAfter(s)) throw new Error("End must be after start.");

      const minutes = e.diff(s, "minute");
      if (minutes < 15) throw new Error("Minimum length is 15 minutes.");

      // send ISO strings so backend gets precise timestamps
      await api("api/availability", {
        method: "POST",
        headers: authHeader(token || undefined),
        body: JSON.stringify({ start: s.toISOString(), end: e.toISOString() }),
      });

      setMsg("Availability added.");
      await load();
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
        headers: authHeader(token || undefined),
      });
      setMsg("Deleted.");
      await load();
    } catch (e: any) {
      setErr(e.message || "Could not delete.");
    }
  }

  async function load() {
    try {
      const res = await api("api/availability/me", {
        headers: authHeader(token || undefined),
      });
      setList(res || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load availability.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Availability</h1>
          <p className="mt-1 text-sm text-gray-600">
            Times shown in <span className="font-medium">{tz}</span>.
          </p>
        </div>
      </div>

      {/* Creator Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-900">Add a time window</p>
        <p className="mb-4 text-xs text-gray-600">
          Patients can book within these windows when you’re free.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Start</label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">End</label>
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="self-end">
            <Button onClick={createSlot} disabled={loading}>
              {loading ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>

        {/* Quick durations */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Quick duration:</span>
          {[30, 45, 60, 90, 120].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setQuick(m)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs hover:bg-gray-50"
              title={`Set end to ${m} minutes after start`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Feedback */}
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
      </div>

      {/* List Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">Your windows</p>
          <p className="text-xs text-gray-500">
            {list.length ? `${list.length} total` : "None yet"}
          </p>
        </div>

        {list.length ? (
          <div className="space-y-5">
            {Object.entries(grouped).map(([dayKey, items]) => {
              const dayHeader = dayjs(dayKey).format("dddd, MMM D, YYYY");
              return (
                <div key={dayKey} className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500">{dayHeader}</div>
                  <div className="space-y-2">
                    {items.map((s: any) => (
                      <div
                        key={s._id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <p className="text-sm">
                          {fmtLocal(s.start)} <span className="text-gray-400">→</span>{" "}
                          {fmtLocal(s.end)}
                        </p>
                        <button
                          onClick={() => remove(s._id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No availability yet.</p>
        )}
      </div>
    </div>
  );
}
