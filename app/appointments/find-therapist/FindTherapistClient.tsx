// app/appointments/find-therapist/FindTherapistClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import TherapistCard, { TherapistCardProps } from "@/components/TherapistCard";

export type ListResponse = {
  items: TherapistCardProps[];
  total: number;
  page: number;
  limit: number;
};

const QUICK_FILTERS = [
  { label: "Anxiety", key: "concern", value: "anxiety" },
  { label: "Depression", key: "concern", value: "depression" },
  { label: "Couples", key: "concern", value: "couples" },
  { label: "Trauma", key: "concern", value: "trauma" },
  { label: "Stress", key: "concern", value: "stress" },
  { label: "ADHD", key: "concern", value: "adhd" },
  { label: "CBT", key: "modality", value: "CBT" },
  { label: "Online", key: "setting", value: "online" },
  { label: "In-person", key: "setting", value: "in-person" },
];

const POPULAR_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"];

const ACTIVE_FILTER_KEYS = [
  { key: "q", label: "Search" },
  { key: "city", label: "City" },
  { key: "modality", label: "Modality" },
  { key: "concern", label: "Concern" },
  { key: "population", label: "Population" },
  { key: "setting", label: "Setting" },
  { key: "feeMin", label: "Min fee" },
  { key: "feeMax", label: "Max fee" },
] as const;

export default function FindTherapistClient({
  initialData,
}: {
  initialData?: ListResponse | null;
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(sp.get("page") || "1");
  const limit = Number(sp.get("limit") || "12");

  const [data, setData] = useState<ListResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Hero quick-search controls
  const [quickQ, setQuickQ] = useState(sp.get("q") || "");
  const [quickCity, setQuickCity] = useState(sp.get("city") || "");
  useEffect(() => {
    setQuickQ(sp.get("q") || "");
    setQuickCity(sp.get("city") || "");
  }, [sp]);

  // "More filters" drawer state
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const spString = useMemo(() => sp.toString(), [sp]);
  const skipFirstFetch = useRef(!!initialData);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    (async () => {
      setLoading(true);
      setErr("");
      setData(null);

      const qs = new URLSearchParams();
      [
        "q", "city", "modality", "concern", "population", "setting", "feeMin", "feeMax", "sort",
      ].forEach((k) => {
        const v = sp.get(k);
        if (v) qs.set(k, v);
      });
      qs.set("page", String(page));
      qs.set("limit", String(limit));

      try {
        const res = await publicApi<ListResponse>(`api/public/therapists?${qs.toString()}`);
        setData(res);
      } catch (e: any) {
        setErr(e.message || "Failed to load therapists");
      } finally {
        setLoading(false);
      }
    })();
  }, [spString, page, limit, sp]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const firstItem = data && data.total > 0 ? (page - 1) * data.limit + 1 : 0;
  const lastItem = data && data.total > 0 ? Math.min(page * data.limit, data.total) : 0;

  const activeFilters = ACTIVE_FILTER_KEYS.map(({ key, label }) => {
    const value = sp.get(key);
    return value ? { key, label, value } : null;
  }).filter(Boolean) as { key: string; label: string; value: string }[];

  function setParam(updates: Record<string, string | null>) {
    const qs = new URLSearchParams(spString);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") qs.delete(k);
      else qs.set(k, v);
    }
    qs.delete("page");
    router.push(`${pathname}?${qs.toString()}`);
  }

  function removeFilter(key: string) {
    setParam({ [key]: null });
  }
  function clearAllFilters() {
    router.push(pathname);
  }
  function applyChip(key: string, value: string) {
    const current = sp.get(key);
    setParam({ [key]: current === value ? null : value });
  }
  function applyQuickSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam({ q: quickQ, city: quickCity });
  }

  function goto(p: number) {
    const qs = new URLSearchParams(spString);
    qs.set("page", String(p));
    router.push(`${pathname}?${qs.toString()}`);
  }

  const currentSort = sp.get("sort") || "recent";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-white">
      {/* ── HERO (light, minimal) ──────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#4b7eff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
            Therapist Directory
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Find your therapist
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
            Browse licensed professionals by city, specialty, and fee.{" "}
            <span className="font-medium text-gray-800">
              {data?.total ?? "100+"} verified
            </span>{" "}
            and ready to help.
          </p>

          {/* Clean search bar */}
          <form
            onSubmit={applyQuickSearch}
            className="mt-6 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm sm:max-w-2xl sm:flex-row sm:items-stretch sm:gap-1"
          >
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={quickQ}
                onChange={(e) => setQuickQ(e.target.value)}
                placeholder="Search by name, specialty, or modality"
                className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="hidden h-9 w-px self-center bg-gray-200 sm:block" />
            <div className="relative sm:w-44">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <input
                value={quickCity}
                onChange={(e) => setQuickCity(e.target.value)}
                placeholder="City"
                className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#4b7eff] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#3a5bef] active:scale-[0.98] transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* ── FILTER PILLS BAR ─────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-x-auto py-3">
            <button
              type="button"
              onClick={clearAllFilters}
              className={[
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                activeFilters.length === 0
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              ].join(" ")}
            >
              All
            </button>
            {QUICK_FILTERS.map((f) => {
              const active = sp.get(f.key) === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => applyChip(f.key, f.value)}
                  className={[
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-[#4b7eff] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#4b7eff]/40 hover:text-[#4b7eff]",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              );
            })}

            <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
              <button
                type="button"
                onClick={() => setShowMoreFilters((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#4b7eff]/40 hover:text-[#4b7eff] transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                More filters
                {activeFilters.length > 0 && (
                  <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#4b7eff] px-1 text-[9px] font-bold text-white">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips (sub-bar) */}
          {activeFilters.length > 0 && (
            <div className="-mt-1 flex items-center gap-1.5 overflow-x-auto pb-3">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => removeFilter(f.key)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#4b7eff]/10 px-2.5 py-1 text-[11px] font-medium text-[#4b7eff] hover:bg-[#4b7eff]/20 transition-colors"
                >
                  <span className="font-semibold">{f.label}:</span>
                  <span>{f.value}</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="shrink-0 text-[11px] font-semibold text-gray-500 hover:text-gray-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MORE FILTERS DRAWER ──────────────────────────────── */}
      {showMoreFilters && (
        <MoreFiltersModal
          sp={sp}
          onClose={() => setShowMoreFilters(false)}
          onApply={(updates) => {
            setParam(updates);
            setShowMoreFilters(false);
          }}
          onClear={() => {
            clearAllFilters();
            setShowMoreFilters(false);
          }}
        />
      )}

      {/* ── RESULTS ────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-16">
        {/* Header row */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-gray-900 sm:text-xl">
              {loading
                ? "Searching…"
                : data && data.total
                  ? `${data.total} therapist${data.total !== 1 ? "s" : ""}`
                  : "No results"}
            </p>
            {!loading && data && data.total > 0 && (
              <p className="text-xs text-gray-500">
                Showing {firstItem}–{lastItem}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Sort</label>
            <select
              value={currentSort}
              onChange={(e) =>
                setParam({ sort: e.target.value === "recent" ? null : e.target.value })
              }
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
            >
              <option value="recent">Most recent</option>
              <option value="name">Name A–Z</option>
              <option value="experience">Most experienced</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700">Could not load therapists</p>
              <p className="mt-0.5 text-xs text-red-600">{err}</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <div className="h-4 w-14 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-4 w-14 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-4 w-10 animate-pulse rounded-full bg-gray-100" />
                </div>
                <div className="-mx-5 mt-4 flex items-center justify-between border-t border-gray-100 px-5 pt-3">
                  <div className="space-y-1">
                    <div className="h-2 w-8 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                  <div className="h-8 w-28 animate-pulse rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.items.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((t) => (
                <TherapistCard key={t._id} {...t} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-gray-500">
                  Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
                  <span className="font-semibold text-gray-800">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => goto(page - 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Previous
                  </button>
                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={p}
                          onClick={() => goto(p)}
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all",
                            p === page
                              ? "bg-[#4b7eff] text-white shadow-sm"
                              : "border border-gray-200 text-gray-600 hover:border-[#4b7eff]/40 hover:text-[#4b7eff]",
                          ].join(" ")}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => goto(page + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                No therapists matched your filters
              </p>
              <p className="mt-1 max-w-xs text-xs text-gray-500">
                Try removing one or two filters or choosing a nearby city.
              </p>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#4b7eff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a5bef] transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── More filters modal ────────────────────────────────────── */

function MoreFiltersModal({
  sp,
  onClose,
  onApply,
  onClear,
}: {
  sp: URLSearchParams;
  onClose: () => void;
  onApply: (updates: Record<string, string | null>) => void;
  onClear: () => void;
}) {
  const [city, setCity] = useState(sp.get("city") || "");
  const [modality, setModality] = useState(sp.get("modality") || "");
  const [concern, setConcern] = useState(sp.get("concern") || "");
  const [population, setPopulation] = useState(sp.get("population") || "");
  const [setting, setSetting] = useState(sp.get("setting") || "");
  const [feeMin, setFeeMin] = useState(sp.get("feeMin") || "");
  const [feeMax, setFeeMax] = useState(sp.get("feeMax") || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onApply({
      city: city || null,
      modality: modality || null,
      concern: concern || null,
      population: population || null,
      setting: setting || null,
      feeMin: feeMin || null,
      feeMax: feeMax || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-gray-900">More filters</p>
            <p className="text-[11px] text-gray-500">Refine your search</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* City */}
          <Field label="City">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Karachi"
              className={inputCls}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(city === c ? "" : c)}
                  className={[
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    city === c
                      ? "bg-[#4b7eff] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-[#4b7eff]/40 hover:text-[#4b7eff]",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Modality">
              <input
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                placeholder="e.g., CBT, EMDR"
                className={inputCls}
              />
            </Field>
            <Field label="Concern">
              <input
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g., anxiety"
                className={inputCls}
              />
            </Field>
            <Field label="Population">
              <input
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                placeholder="e.g., couples"
                className={inputCls}
              />
            </Field>
            <Field label="Setting">
              <input
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g., online"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Fee range (per session)">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                value={feeMin}
                onChange={(e) => setFeeMin(e.target.value)}
                placeholder="Min"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                value={feeMax}
                onChange={(e) => setFeeMax(e.target.value)}
                placeholder="Max"
                className={inputCls}
              />
            </div>
          </Field>
        </form>

        <footer className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800"
          >
            Clear all
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit as any}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b7eff] px-5 py-2 text-sm font-bold text-white hover:bg-[#3a5bef]"
            >
              Apply filters
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}
