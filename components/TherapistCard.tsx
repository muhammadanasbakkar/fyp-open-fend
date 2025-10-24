"use client";
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
  _id, name, profilePicture, specializations = [], yearsExperience = 0, fees
}: TherapistCardProps) {
  const tag = yearsExperience ? `${yearsExperience} yrs experience` : "Therapist";
  const fee =
    fees?.currency && (fees.online || fees.inPerson)
      ? `${fees.currency} ${fees.online ?? fees.inPerson} / session`
      : "Fee on request";

  return (
    <Link
      href={`/therapists/${_id}`}
      className="group block rounded-2xl border border-gray-100 bg-white hover:shadow-md transition"
    >
      <div className="p-4 flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profilePicture || "/default-avatar.png"}
          alt={name}
          className="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="mt-0.5 text-xs text-gray-600">{tag}</div>
          {!!specializations.length && (
            <div className="mt-1 truncate text-xs text-gray-500">
              {specializations.slice(0, 3).join(", ")}
              {specializations.length > 3 ? "…" : ""}
            </div>
          )}
          <div className="mt-2 text-sm font-medium text-gray-900">{fee}</div>
        </div>
      </div>
      <div className="px-4 pb-3 text-xs text-brand-700">View profile →</div>
    </Link>
  );
}
