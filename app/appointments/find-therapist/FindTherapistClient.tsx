// app/appointments/find-therapist/FindTherapistClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import TherapistCard, { TherapistCardProps } from "@/components/TherapistCard";
import FiltersBar from "@/components/FiltersBar";

type ListResponse = {
  items: TherapistCardProps[];
  total: number;
  page: number;
  limit: number;
};

export default function FindTherapistClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(sp.get("page") || "1");
  const limit = Number(sp.get("limit") || "12");

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const spString = useMemo(() => sp.toString(), [sp]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      setData(null);

      const qs = new URLSearchParams();
      ["q", "city", "modality", "concern", "population", "setting", "feeMin", "feeMax", "sort"].forEach(
        (k) => {
          const v = sp.get(k);
          if (v) qs.set(k, v);
        }
      );
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

  function goto(p: number) {
    const qs = new URLSearchParams(spString);
    qs.set("page", String(p));
    router.push(`${pathname}?${qs.toString()}`);
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#eef2ff] to-[#f8faff]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#7c3aed] px-4 pb-14 pt-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Therapist Directory
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find Your Therapist
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/75">
            Browse licensed professionals filtered by city, specialty, fee range, and care setting.
            Every profile is verified by our clinical team.
          </p>

          {/* Trust stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { value: "100+", label: "Verified therapists" },
              { value: "10+", label: "Specializations" },
              { value: "Secure", label: "Booking & payments" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                <span className="text-sm font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-6 pb-16 space-y-5">

        {/* Filters card */}
        <section className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#4b7eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <p className="text-sm font-semibold text-gray-900">Filter &amp; Search</p>
          </div>
          <FiltersBar />
        </section>

        {/* Error */}
        {err && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700">Could not load therapists</p>
              <p className="mt-0.5 text-xs text-red-600">{err}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {/* Results header */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-sm font-semibold text-gray-900">
                {loading
                  ? "Searching…"
                  : data && data.total
                  ? `${data.total} therapist${data.total !== 1 ? "s" : ""} found`
                  : "No results"}
              </p>
            </div>
            {!loading && data && data.total > 0 && (
              <p className="text-xs text-gray-400">
                Showing {firstItem}–{lastItem} of {data.total}
              </p>
            )}
          </div>

          <div className="min-h-[280px] p-5">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-100" />
                        <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-100" />
                        <div className="mt-2 flex gap-1">
                          <div className="h-4 w-14 animate-pulse rounded-full bg-gray-100" />
                          <div className="h-4 w-14 animate-pulse rounded-full bg-gray-100" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="h-3 w-16 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-6 w-24 animate-pulse rounded-lg bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data && data.items.length ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.items.map((t) => (
                    <TherapistCard key={t._id} {...t} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
                    <p className="text-xs text-gray-500">
                      Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
                      <span className="font-semibold text-gray-800">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => goto(page - 1)}
                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Previous
                      </button>

                      {/* Page number chips */}
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
                                  : "border-2 border-gray-200 text-gray-600 hover:border-[#4b7eff]/40 hover:text-[#4b7eff]",
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
                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] disabled:cursor-not-allowed disabled:opacity-40 transition-all"
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
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                  <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">No therapists matched your filters</p>
                  <p className="mt-1 max-w-xs text-xs text-gray-500">
                    Try removing one or two filters, expanding the fee range, or choosing a nearby city.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
