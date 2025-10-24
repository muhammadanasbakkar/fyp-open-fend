"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import TherapistCard, { TherapistCardProps } from "@/components/TherapistCard";
import FiltersBar from "@/components/FiltersBar";

type ListResponse = {
  items: TherapistCardProps[];
  total: number;
  page: number;
  limit: number;
};

export default function FindTherapistPage() {
  const sp = useSearchParams();
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const page = Number(sp.get("page") || "1");
  const limit = Number(sp.get("limit") || "12");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      setData(null);

      const qs = new URLSearchParams();
      ["q","city","modality","concern","population","setting","feeMin","feeMax","sort"].forEach(k=>{
        const v = sp.get(k); if (v) qs.set(k, v);
      });
      qs.set("page", String(page));
      qs.set("limit", String(limit));

      try {
        const res = await publicApi<ListResponse>(`api/public/therapists?${qs.toString()}`);
        setData(res);
      } catch (e:any) {
        setErr(e.message || "Failed to load therapists");
      } finally {
        setLoading(false);
      }
    })();
  }, [sp, page, limit]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function goto(p: number) {
    const qs = new URLSearchParams(sp.toString());
    qs.set("page", String(p));
    window.location.href = `/appointments/find-therapist?${qs.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Find a therapist</h1>
        <p className="text-sm text-gray-600">Filter by city, modality, fee, and more.</p>
      </div>

      <FiltersBar />

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      {/* Results */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl border bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : data && data.items.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((t) => <TherapistCard key={t._id} {...t} />)}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={page<=1} onClick={()=>goto(page-1)} className="btn">Prev</button>
              <div className="text-sm text-gray-600">
                Page <b>{page}</b> of <b>{totalPages}</b>
              </div>
              <button disabled={page>=totalPages} onClick={()=>goto(page+1)} className="btn">Next</button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No therapists matched your filters.
          </div>
        )}
      </div>

      <style jsx>{`.btn{ @apply inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed; }`}</style>
    </div>
  );
}
