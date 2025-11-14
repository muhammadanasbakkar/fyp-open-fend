// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";

// type Hospital = {
//   _id?: string;
//   name?: string;
//   city?: string;
//   address?: string;
// };
// type TherapistRow = {
//   _id?: string;
//   name?: string;
//   email?: string;
//   profilePicture?: string;
//   therapistInfo?: {
//     specializations?: string[];
//     modalities?: string[];
//     concerns?: string[];
//     populations?: string[];
//     careSettings?: string[];
//   };
//   primaryHospital?: Hospital; // from $lookup
//   affiliatedHospitals?: Hospital | null; // may be 1 row due to $unwind
// };

// function normalizeId(x: any) {
//   if (!x) return "";
//   if (typeof x === "string") return x;
//   if (x._id) return String(x._id);
//   return String(x);
// }
// function uniqById<T extends { _id?: any }>(list: T[]) {
//   const m = new Map<string, T>();
//   for (const it of list || []) {
//     const id = normalizeId(it?._id);
//     if (!m.has(id)) m.set(id, { ...it, _id: id } as T);
//   }
//   return Array.from(m.values());
// }
// function titleFromSlug(slug?: string) {
//   if (!slug) return "Therapy";
//   return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
// }

// export default function TherapyListingPage() {
//   const params = useParams<{ slug: string }>();
//   const search = useSearchParams();

//   // read any of these ?params
//   const modality = (search.get("modality") || "").trim();
//   const concern = (search.get("concern") || "").trim();
//   const population = (search.get("population") || "").trim();
//   const setting = (search.get("setting") || "").trim();
//   const domain = (search.get("domain") || "").trim().toLowerCase();

//   const heading = titleFromSlug(params?.slug);

//   // build qs for API
//   const qs = useMemo(() => {
//     const p = new URLSearchParams();
//     if (modality) p.set("modality", modality);
//     if (concern) p.set("concern", concern);
//     if (population) p.set("population", population);
//     if (setting) p.set("setting", setting);
//     if (domain) p.set("domain", domain);
//     return p.toString();
//   }, [modality, concern, population, setting, domain]);

//   const [rows, setRows] = useState<TherapistRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   async function load() {
//     setErr("");
//     setLoading(true);
//     setRows([]);
//     try {
//       // if your route is actually /api/therapists/names, update this line:
//       // const url = `${API}api/therapists/names${qs ? `?${qs}` : ""}`;
//       const url = `${API}api/therapists/names${qs ? `?${qs}` : ""}`;
//       const res = await fetch(url, { cache: "no-store" });
//       const data = await res.json();
//       if (!res.ok)
//         throw new Error(data?.error || data?.msg || "Failed to load");

//       const result: TherapistRow[] = Array.isArray(data?.result)
//         ? data.result
//         : [];
//       setRows(uniqById(result));
//     } catch (e: any) {
//       setErr(e.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [qs]);

//   const activeFilters = [
//     modality && { label: "Modality", value: modality },
//     concern && { label: "Concern", value: concern },
//     population && { label: "Population", value: population },
//     setting && { label: "Setting", value: setting },
//   ].filter(Boolean) as { label: string; value: string }[];

//   return (
//     <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
//       <div>
//         <h1 className="text-2xl font-semibold">{heading}</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Showing approved therapists{activeFilters.length ? " matching:" : "."}
//         </p>

//         {!!activeFilters.length && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {activeFilters.map((f) => (
//               <span
//                 key={f.label}
//                 className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
//               >
//                 <b className="font-medium">{f.label}:</b> {f.value}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <div className="mb-3 flex items-center justify-between">
//           <p className="text-sm font-medium">Therapists</p>
//           <p className="text-xs text-gray-500">
//             {loading
//               ? "Loading…"
//               : `${rows.length} result${rows.length === 1 ? "" : "s"}`}
//           </p>
//         </div>

//         {err && (
//           <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//             {err}
//           </div>
//         )}

//         {loading ? (
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-24 rounded-lg border bg-gray-50 animate-pulse"
//               />
//             ))}
//           </div>
//         ) : rows.length === 0 ? (
//           <p className="text-sm text-gray-500">
//             No therapists match these filters.
//           </p>
//         ) : (
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {rows.map((t) => {
//               const name = t.name || t.email || "Therapist";
//               const specs = t.therapistInfo?.specializations || [];
//               return (
//                 <div key={t._id} className="rounded-lg border p-4">
//                   <div className="flex items-center gap-3">
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img
//                       src={t.profilePicture || "/default-avatar.png"}
//                       alt={name}
//                       className="h-10 w-10 rounded-full object-cover"
//                     />
//                     <div className="min-w-0">
//                       <div className="truncate text-sm font-medium">{name}</div>
//                       {!!specs.length && (
//                         <div className="truncate text-xs text-gray-500">
//                           {specs.slice(0, 3).join(", ")}
//                           {specs.length > 3 ? "…" : ""}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mt-2 space-y-1 text-xs text-gray-600">
//                     {t.primaryHospital?.name && (
//                       <div>
//                         🏥 {t.primaryHospital.name}
//                         {t.primaryHospital.city
//                           ? ` — ${t.primaryHospital.city}`
//                           : ""}
//                       </div>
//                     )}
//                     {!!t.therapistInfo?.modalities?.length && (
//                       <div>
//                         🧭 {t.therapistInfo.modalities.slice(0, 4).join(", ")}
//                         {t.therapistInfo.modalities.length > 4 ? "…" : ""}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";

type Hospital = {
  _id?: string;
  name?: string;
  city?: string;
  address?: string;
};

type TherapistRow = {
  _id?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
  therapistInfo?: {
    specializations?: string[];
    modalities?: string[];
    concerns?: string[];
    populations?: string[];
    careSettings?: string[];
  };
  primaryHospital?: Hospital;
  affiliatedHospitals?: Hospital | null;
};

function normalizeId(x: any) {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (x._id) return String(x._id);
  return String(x);
}

function uniqById<T extends { _id?: any }>(list: T[]) {
  const m = new Map<string, T>();
  for (const it of list || []) {
    const id = normalizeId(it?._id);
    if (!m.has(id)) m.set(id, { ...it, _id: id } as T);
  }
  return Array.from(m.values());
}

function titleFromSlug(slug?: string) {
  if (!slug) return "Therapy";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TherapyListingPage() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();

  const modality = (search.get("modality") || "").trim();
  const concern = (search.get("concern") || "").trim();
  const population = (search.get("population") || "").trim();
  const setting = (search.get("setting") || "").trim();
  const domain = (search.get("domain") || "").trim().toLowerCase();

  const heading = titleFromSlug(params?.slug);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (modality) p.set("modality", modality);
    if (concern) p.set("concern", concern);
    if (population) p.set("population", population);
    if (setting) p.set("setting", setting);
    if (domain) p.set("domain", domain);
    return p.toString();
  }, [modality, concern, population, setting, domain]);

  const [rows, setRows] = useState<TherapistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    setRows([]);
    try {
      const url = `${API}api/therapists/names${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.msg || "Failed to load");
      }
      const result: TherapistRow[] = Array.isArray(data?.result)
        ? data.result
        : [];
      setRows(uniqById(result));
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const activeFilters = [
    modality && { label: "Modality", value: modality },
    concern && { label: "Concern", value: concern },
    population && { label: "Population", value: population },
    setting && { label: "Setting", value: setting },
  ].filter(Boolean) as { label: string; value: string }[];

  const total = rows.length;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand,#4b7eff)]/20 bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-[11px] font-medium text-[var(--brand,#4b7eff)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
              Mental health specialists
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Showing approved therapists
              {activeFilters.length
                ? " that match your selected filters."
                : " available for appointments."}
            </p>

            {!!activeFilters.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
                  >
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">
                      {f.label}
                    </span>
                    <span className="font-medium">{f.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end gap-4">
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-xs text-gray-500">Therapists found</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? "…" : total}
              </p>
            </div>
          </div>
        </header>

        {/* Main card */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900">
              Available therapists
            </p>
            <p className="text-xs text-gray-500">
              {loading
                ? "Loading therapists, please wait."
                : total === 1
                ? "1 therapist matches your criteria."
                : `${total} therapists match your criteria.`}
            </p>
          </div>

          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                      <div className="h-2.5 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                    <div className="h-2.5 w-2/3 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-6 py-10 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm">
                !
              </div>
              <p className="text-sm font-medium text-amber-900">
                No therapists match these filters.
              </p>
              <p className="mt-1 max-w-md text-xs text-amber-800">
                Try removing one or more filters or searching a broader concern
                or modality.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((t) => {
                console.log("Therapist row:", t);
                const name = t.name || t.email || "Therapist";
                const specs = t.therapistInfo?.specializations || [];
                const modalities = t.therapistInfo?.modalities || [];
                const concerns = t.therapistInfo?.concerns || [];
                const firstConcern = concerns[0];

                return (
                  <article
                    key={t._id}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-gray-50/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand,#4b7eff)]/30 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Image
                        src={
                          process.env.NEXT_PUBLIC_CDN_BASE! +
                          (t.profilePicture || "/default-avatar.png")
                        }
                        alt={name}
                        className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                        width={44}
                        height={44}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-sm font-semibold text-gray-900">
                            {name}
                          </h2>
                          {firstConcern && (
                            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[var(--brand,#4b7eff)]/5 px-2 py-0.5 text-[10px] font-medium text-[var(--brand,#4b7eff)]">
                              {firstConcern}
                            </span>
                          )}
                        </div>
                        {!!specs.length && (
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {specs.slice(0, 3).join(", ")}
                            {specs.length > 3 ? "…" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      {t.primaryHospital?.name && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px]" aria-hidden="true">
                            🏥
                          </span>
                          <span className="truncate">
                            {t.primaryHospital.name}
                            {t.primaryHospital.city
                              ? ` · ${t.primaryHospital.city}`
                              : ""}
                          </span>
                        </div>
                      )}

                      {!!modalities.length && (
                        <div className="flex items-start gap-1.5">
                          <span
                            className="mt-0.5 text-[11px]"
                            aria-hidden="true"
                          >
                            🧭
                          </span>
                          <span className="flex-1">
                            <span className="text-[11px] uppercase tracking-wide text-gray-400">
                              Modalities
                            </span>
                            <span className="block">
                              {modalities.slice(0, 3).join(", ")}
                              {modalities.length > 3 ? "…" : ""}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                      <span>
                        Approved therapist
                        {t.primaryHospital?.city
                          ? ` · ${t.primaryHospital.city}`
                          : ""}
                      </span>
                      <Link
                        href={`/therapists/${t._id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--brand,#4b7eff)] shadow-sm group-hover:border-[var(--brand,#4b7eff)]/40"
                      >
                        View profile
                        <span aria-hidden="true">›</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
