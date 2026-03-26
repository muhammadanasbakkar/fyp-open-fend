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
};

export default function TherapistCard({
  _id,
  name,
  email,
  profilePicture,
  specializations = [],
  yearsExperience = 0,
  fees,
}: TherapistCardProps) {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE || "";
  const src =
    profilePicture && profilePicture.startsWith("http")
      ? profilePicture
      : profilePicture
      ? `${cdnBase}${profilePicture}`
      : null;

  const expLabel = yearsExperience ? `${yearsExperience} yr${yearsExperience !== 1 ? "s" : ""} exp.` : null;
  const feeLabel =
    fees?.currency && (fees.online || fees.inPerson)
      ? `${fees.currency} ${fees.inPerson ?? fees.online}`
      : null;

  const initials = (name || email || "T")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/therapists/${_id}`}
      className="group flex flex-col rounded-2xl border-2 border-gray-100 bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#4b7eff]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff]/60"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        {src ? (
          <Image
            src={src}
            alt={name}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-[#4b7eff]/20 transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4b7eff]/20 to-[#6aa7ff]/20 text-base font-bold text-[#4b7eff] ring-2 ring-gray-100">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
          {expLabel && <p className="mt-0.5 text-xs text-gray-500">{expLabel}</p>}

          {!!specializations.length && (
            <div className="mt-2 flex flex-wrap gap-1">
              {specializations.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]"
                >
                  {s}
                </span>
              ))}
              {specializations.length > 2 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                  +{specializations.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 px-4 py-3">
        {feeLabel ? (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Per session</p>
            <p className="text-sm font-bold text-gray-900">{feeLabel}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Fee on request</p>
        )}
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#4b7eff]/8 px-3 py-1.5 text-xs font-semibold text-[#4b7eff] transition-colors group-hover:bg-[#4b7eff] group-hover:text-white">
          View profile
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
