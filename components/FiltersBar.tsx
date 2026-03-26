"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inputCls =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#4b7eff] focus:ring-0";

export default function FiltersBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") || "");
  const [city, setCity] = useState(sp.get("city") || "");
  const [modality, setModality] = useState(sp.get("modality") || "");
  const [concern, setConcern] = useState(sp.get("concern") || "");
  const [population, setPopulation] = useState(sp.get("population") || "");
  const [setting, setSetting] = useState(sp.get("setting") || "");
  const [feeMin, setFeeMin] = useState(sp.get("feeMin") || "");
  const [feeMax, setFeeMax] = useState(sp.get("feeMax") || "");
  const [sort, setSort] = useState(sp.get("sort") || "recent");

  useEffect(() => {
    setQ(sp.get("q") || "");
    setCity(sp.get("city") || "");
    setModality(sp.get("modality") || "");
    setConcern(sp.get("concern") || "");
    setPopulation(sp.get("population") || "");
    setSetting(sp.get("setting") || "");
    setFeeMin(sp.get("feeMin") || "");
    setFeeMax(sp.get("feeMax") || "");
    setSort(sp.get("sort") || "recent");
  }, [sp]);

  const activeCount = [q, city, modality, concern, population, setting, feeMin, feeMax].filter(Boolean).length;

  function apply() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (modality) params.set("modality", modality);
    if (concern) params.set("concern", concern);
    if (population) params.set("population", population);
    if (setting) params.set("setting", setting);
    if (feeMin) params.set("feeMin", feeMin);
    if (feeMax) params.set("feeMax", feeMax);
    if (sort && sort !== "recent") params.set("sort", sort);
    router.push(`/appointments/find-therapist?${params.toString()}`);
  }

  function clearAll() {
    router.push(`/appointments/find-therapist`);
  }

  return (
    <div className="space-y-4">
      {/* Top row: search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#4b7eff]"
            placeholder="Search by name or specialty…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
          />
        </div>
        <div className="sm:w-44">
          <select
            className={inputCls}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Sort: Recent</option>
            <option value="name">Sort: Name A–Z</option>
            <option value="experience">Sort: Experience</option>
          </select>
        </div>
      </div>

      {/* Filter grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <input className={inputCls} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input className={inputCls} placeholder="Modality (e.g. CBT)" value={modality} onChange={(e) => setModality(e.target.value)} />
        <input className={inputCls} placeholder="Concern (e.g. anxiety)" value={concern} onChange={(e) => setConcern(e.target.value)} />
        <input className={inputCls} placeholder="Population (e.g. couples)" value={population} onChange={(e) => setPopulation(e.target.value)} />
        <input className={inputCls} placeholder="Setting (e.g. online)" value={setting} onChange={(e) => setSetting(e.target.value)} />
        <div className="flex gap-2">
          <input type="number" min={0} className={inputCls} placeholder="Min fee" value={feeMin} onChange={(e) => setFeeMin(e.target.value)} />
          <input type="number" min={0} className={inputCls} placeholder="Max fee" value={feeMax} onChange={(e) => setFeeMax(e.target.value)} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={apply}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b7eff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3a5bef] active:scale-[.98] transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search
        </button>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear{" "}
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#4b7eff] text-[9px] font-bold text-white">
              {activeCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
