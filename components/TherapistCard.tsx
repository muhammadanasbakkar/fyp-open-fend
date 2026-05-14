"use client";
import Image from "next/image";
import Link from "next/link";

export type TherapistCardProps = {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
  specializations?: string[];
  yearsExperience?: number;
  fees?: { currency?: string; online?: number; inPerson?: number } | null;
  city?: string;
};

export default function TherapistCard({
  _id,
  name,
  email,
  profilePicture,
  specializations = [],
  yearsExperience = 0,
  fees,
  city,
}: TherapistCardProps) {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "";
  const src =
    profilePicture && profilePicture.startsWith("http")
      ? profilePicture
      : profilePicture
        ? `${cdnBase}${profilePicture}`
        : null;

  const expLabel = yearsExperience
    ? `${yearsExperience} yr${yearsExperience !== 1 ? "s" : ""}`
    : "Licensed";

  const minFee = (() => {
    const candidates = [fees?.online, fees?.inPerson].filter(
      (v): v is number => typeof v === "number" && v > 0
    );
    return candidates.length ? Math.min(...candidates) : null;
  })();
  const currency = fees?.currency || "PKR";

  const initials = (name || email || "T")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/therapists/${_id}`}
      className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4b7eff]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff]/60"
    >
      {/* Top row — avatar + name + verified badge */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {src ? (
            <Image
              src={src}
              alt={name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-lg font-bold text-white ring-2 ring-white shadow">
              {initials}
            </div>
          )}
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-base font-bold text-gray-900 group-hover:text-[#4b7eff]">
              {name}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          </div>

          {/* Meta row: rating · experience · city */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-0.5 font-semibold text-gray-700">
              <svg className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-0.5">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V14.15M16.5 6v-.75a3.75 3.75 0 00-3.75-3.75h-1.5A3.75 3.75 0 007.5 5.25V6m9 0H7.5" />
              </svg>
              {expLabel}
            </span>
            {city && (
              <>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-0.5">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {city}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Specializations */}
      {!!specializations.length && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specializations.slice(0, 3).map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]"
            >
              {s}
            </span>
          ))}
          {specializations.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500">
              +{specializations.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-3 -mx-5 px-5 mt-4">
        {minFee != null ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              From
            </p>
            <p className="text-sm font-bold text-gray-900">
              {currency} {minFee.toLocaleString()}
              <span className="ml-0.5 text-[10px] font-normal text-gray-400">/ session</span>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Fee
            </p>
            <p className="text-sm font-bold text-gray-500">On request</p>
          </div>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b7eff] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all group-hover:bg-[#3a5bef] group-hover:shadow-md">
          Book session
          <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
