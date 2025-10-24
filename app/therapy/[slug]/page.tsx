"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

const API = "http://localhost:5000/";

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
  primaryHospital?: Hospital; // from $lookup
  affiliatedHospitals?: Hospital | null; // may be 1 row due to $unwind
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
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
}

export default function TherapyListingPage() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();

  // read any of these ?params
  const modality = (search.get("modality") || "").trim();
  const concern = (search.get("concern") || "").trim();
  const population = (search.get("population") || "").trim();
  const setting = (search.get("setting") || "").trim();
  const domain = (search.get("domain") || "").trim().toLowerCase();

  const heading = titleFromSlug(params?.slug);

  // build qs for API
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
      // if your route is actually /api/therapists/names, update this line:
      // const url = `${API}api/therapists/names${qs ? `?${qs}` : ""}`;
      const url = `${API}api/therapists/names${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || data?.msg || "Failed to load");

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

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{heading}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Showing approved therapists{activeFilters.length ? " matching:" : "."}
        </p>

        {!!activeFilters.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
              >
                <b className="font-medium">{f.label}:</b> {f.value}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Therapists</p>
          <p className="text-xs text-gray-500">
            {loading
              ? "Loading…"
              : `${rows.length} result${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {err && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg border bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            No therapists match these filters.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((t) => {
              const name = t.name || t.email || "Therapist";
              const specs = t.therapistInfo?.specializations || [];
              return (
                <div key={t._id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.profilePicture || "/default-avatar.png"}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{name}</div>
                      {!!specs.length && (
                        <div className="truncate text-xs text-gray-500">
                          {specs.slice(0, 3).join(", ")}
                          {specs.length > 3 ? "…" : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    {t.primaryHospital?.name && (
                      <div>
                        🏥 {t.primaryHospital.name}
                        {t.primaryHospital.city
                          ? ` — ${t.primaryHospital.city}`
                          : ""}
                      </div>
                    )}
                    {!!t.therapistInfo?.modalities?.length && (
                      <div>
                        🧭 {t.therapistInfo.modalities.slice(0, 4).join(", ")}
                        {t.therapistInfo.modalities.length > 4 ? "…" : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
