"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm grid gap-3 md:grid-cols-4 lg:grid-cols-6">
      <input className="input" placeholder="Search name/specialty" value={q} onChange={e=>setQ(e.target.value)} />
      <input className="input" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
      <input className="input" placeholder="Modality (e.g. cbt)" value={modality} onChange={e=>setModality(e.target.value)} />
      <input className="input" placeholder="Concern (e.g. anxiety)" value={concern} onChange={e=>setConcern(e.target.value)} />
      <input className="input" placeholder="Population (e.g. couples)" value={population} onChange={e=>setPopulation(e.target.value)} />
      <input className="input" placeholder="Setting (online / in-person)" value={setting} onChange={e=>setSetting(e.target.value)} />

      <div className="md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-3">
        <input type="number" min={0} className="input" placeholder="Min fee" value={feeMin} onChange={e=>setFeeMin(e.target.value)} />
        <input type="number" min={0} className="input" placeholder="Max fee" value={feeMax} onChange={e=>setFeeMax(e.target.value)} />
        <select className="input" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="recent">Sort: Recent</option>
          <option value="name">Sort: Name</option>
          <option value="experience">Sort: Experience</option>
        </select>
      </div>

      <div className="md:col-span-2 lg:col-span-3 flex gap-3">
        <button onClick={apply} className="btn-primary">Apply</button>
        <button onClick={clearAll} className="btn">Clear</button>
      </div>

      {/* Tiny styles so it looks good with Tailwind */}
      <style jsx>{`
        .input{ @apply w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200; }
        .btn{ @apply inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50; }
        .btn-primary{ @apply inline-flex items-center rounded-lg bg-[var(--brand,#4b7eff)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95; }
      `}</style>
    </div>
  );
}
