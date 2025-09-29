// app/therapists/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

type Suggestion = {
  therapistId: string;
  name: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  nextStart: string;
};

export default function PublicTherapistsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Find a therapist</h1>
        <p className="mt-1 text-sm text-gray-600">
          Browse therapists with availability in your selected window. No account needed to explore.
        </p>
      </header>
      <Directory />
    </div>
  );
}

function Directory() {
  const [from, setFrom] = useState<string>(dayjs().toISOString());
  const [to, setTo] = useState<string>(dayjs().add(7, "day").toISOString());
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [limit, setLimit] = useState(24);

  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setErr(""); setLoading(true);
    try {
      const qs = `?from=${dayjs(from).toISOString()}&to=${dayjs(to).toISOString()}&limit=${limit}`;
      const data = await api(`/therapists/suggestions${qs}`);
      setItems(data?.suggestions || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load therapists.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to, limit]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(t =>
      (t.name || "").toLowerCase().includes(term) ||
      (t.email || "").toLowerCase().includes(term)
    );
  }, [q, items]);

  return (
    <>
      {/* Controls */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-600">From</label>
            <Input
              type="datetime-local"
              value={dayjs(from).local().format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => setFrom(dayjs(e.target.value).utc().toISOString())}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-600">To</label>
            <Input
              type="datetime-local"
              value={dayjs(to).local().format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => setTo(dayjs(e.target.value).utc().toISOString())}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Slot length</label>
            <Select value={String(slotMinutes)} onChange={(e)=>setSlotMinutes(parseInt(e.target.value))}>
              {[15,20,30,45,60].map(m=><option key={m} value={m}>{m} min</option>)}
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Input placeholder="Search by name or email" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <Select value={String(limit)} onChange={(e)=>setLimit(parseInt(e.target.value))}>
            {[12,24,48,96].map(n=><option key={n} value={n}>Show {n}</option>)}
          </Select>
          <Button onClick={load}>Refresh</Button>
          <p className="text-xs text-gray-500 ml-auto">Showing {filtered.length} of {items.length}</p>
        </div>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      {/* Grid */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({length:9}).map((_,i)=>(
              <div key={i} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-2 h-3 w-28 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-4 h-8 w-24 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(t => (
              <Card key={t.therapistId} t={t} slotMinutes={slotMinutes} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-gray-600">No therapists found for this window.</div>
        )}
      </div>
    </>
  );
}

function Card({ t, slotMinutes }: { t: Suggestion; slotMinutes: number }) {
  const next = new Date(t.nextStart);
  const when = next.toLocaleString(undefined, { weekday:"short", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });

  return (
    <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden">
          {t.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.profilePicture} alt={t.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-gray-500">No photo</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{t.name}</p>
          <p className="mt-0.5 text-xs text-gray-600">Next: {when}</p>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/therapists/${t.therapistId}`}
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-100"
              title="View profile"
            >
              View profile
            </Link>
            <Link
              href={`/appointments/book?therapistId=${t.therapistId}&slotMinutes=${slotMinutes}`}
              className="inline-flex items-center rounded-md bg-[var(--brand,#4b7eff)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-95"
              title="Book"
            >
              Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
