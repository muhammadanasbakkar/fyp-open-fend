// // app/appointments/find-therapist/FindTherapistClient.tsx  (Client Component)
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { publicApi } from "@/lib/publicApi";
// import TherapistCard, { TherapistCardProps } from "@/components/TherapistCard";
// import FiltersBar from "@/components/FiltersBar";

// type ListResponse = {
//   items: TherapistCardProps[];
//   total: number;
//   page: number;
//   limit: number;
// };

// export default function FindTherapistClient() {
//   const sp = useSearchParams();
//   const router = useRouter();
//   const pathname = usePathname();

//   const page = Number(sp.get("page") || "1");
//   const limit = Number(sp.get("limit") || "12");

//   const [data, setData] = useState<ListResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   // stable string to depend on (sp object identity can change)
//   const spString = useMemo(() => sp.toString(), [sp]);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       setErr("");
//       setData(null);

//       const qs = new URLSearchParams();
//       ["q","city","modality","concern","population","setting","feeMin","feeMax","sort"].forEach(k => {
//         const v = sp.get(k);
//         if (v) qs.set(k, v);
//       });
//       qs.set("page", String(page));
//       qs.set("limit", String(limit));

//       try {
//         const res = await publicApi<ListResponse>(`api/public/therapists?${qs.toString()}`);
//         setData(res);
//       } catch (e: any) {
//         setErr(e.message || "Failed to load therapists");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [spString, page, limit]);

//   const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

//   function goto(p: number) {
//     const qs = new URLSearchParams(spString);
//     qs.set("page", String(p));
//     router.push(`${pathname}?${qs.toString()}`); // SPA navigation
//   }

//   return (
//     <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold">Find a therapist</h1>
//         <p className="text-sm text-gray-600">Filter by city, modality, fee, and more.</p>
//       </div>

//       <FiltersBar />

//       {err && (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {err}
//         </div>
//       )}

//       <div className="min-h-[200px]">
//         {loading ? (
//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="h-28 rounded-2xl border bg-gray-100 animate-pulse" />
//             ))}
//           </div>
//         ) : data && data.items.length ? (
//           <>
//             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {data.items.map((t) => <TherapistCard key={t._id} {...t} />)}
//             </div>

//             <div className="mt-6 flex items-center justify-center gap-2">
//               <button disabled={page<=1} onClick={()=>goto(page-1)} className="btn">Prev</button>
//               <div className="text-sm text-gray-600">
//                 Page <b>{page}</b> of <b>{totalPages}</b>
//               </div>
//               <button disabled={page>=totalPages} onClick={()=>goto(page+1)} className="btn">Next</button>
//             </div>
//           </>
//         ) : (
//           <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//             No therapists matched your filters.
//           </div>
//         )}
//       </div>

//       <style jsx>{`.btn{ @apply inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed; }`}</style>
//     </div>
//   );
// }


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

  // stable string to depend on
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
        const res = await publicApi<ListResponse>(
          `api/public/therapists?${qs.toString()}`
        );
        setData(res);
      } catch (e: any) {
        setErr(e.message || "Failed to load therapists");
      } finally {
        setLoading(false);
      }
    })();
  }, [spString, page, limit, sp]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const firstItem =
    data && data.total > 0 ? (page - 1) * data.limit + 1 : 0;
  const lastItem =
    data && data.total > 0
      ? Math.min(page * data.limit, data.total)
      : 0;

  function goto(p: number) {
    const qs = new URLSearchParams(spString);
    qs.set("page", String(p));
    router.push(`${pathname}?${qs.toString()}`);
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Find a therapist that fits your needs
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Find a therapist
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Filter by city, speciality, fee range and care setting. 
            </p>
          </div>

          {!loading && data && (
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
              <p className="font-medium text-slate-800">
                Search summary
              </p>
              <p className="mt-1">
                Showing{" "}
                <span className="font-semibold">
                  {data.total ? `${firstItem}-${lastItem}` : 0}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {data.total}
                </span>{" "}
                therapists
              </p>
              {sp.get("city") && (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  City filter: <span className="font-medium">{sp.get("city")}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
          <FiltersBar />
        </section>

        {/* Error state */}
        {err && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            <p className="font-medium">Could not load therapists</p>
            <p className="mt-0.5 text-xs">
              {err}
            </p>
          </div>
        )}

        {/* Result list */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 p-4 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {loading
                ? "Searching available therapists"
                : data && data.total
                ? `Found ${data.total} therapist${data.total > 1 ? "s" : ""}`
                : "No therapists found for current filters"}
            </span>
          </div>

          <div className="min-h-[220px]">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2.5 w-full rounded bg-slate-100 animate-pulse" />
                      <div className="h-2.5 w-5/6 rounded bg-slate-100 animate-pulse" />
                    </div>
                    <div className="mt-4 h-8 w-24 rounded-full bg-slate-100 animate-pulse" />
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
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => goto(page - 1)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      <span className="text-sm">‹</span>
                      <span>Previous</span>
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => goto(page + 1)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      <span>Next</span>
                      <span className="text-sm">›</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  !
                </div>
                <p className="text-sm font-medium text-amber-800">
                  No therapists matched your filters
                </p>
                <p className="max-w-sm text-xs text-amber-700">
                  Try removing one or two filters, expanding the fee range or choosing a nearby city to see more options.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
