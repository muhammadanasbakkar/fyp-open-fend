"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";

const CDN = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/+$/, "");

type Fees = { currency?: string; online?: number; inPerson?: number } | null;

type Therapist = {
  name: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  yearsExperience?: number;
  specializations?: string[];
  modalities?: string[];
  concerns?: string[];
  populations?: string[];
  careSettings?: string[];
  licensingCouncil?: string;
  fees?: Fees;
};

type Clinic = {
  _id: string;
  hospitalId: string;
  name: string;
  city?: string;
  address?: string;
  room?: string;
  fee?: { currency?: string; amount?: number };
};

type NextAvail = { start: string; end: string } | null;

// ── skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex gap-5">
          <Skeleton className="h-28 w-28 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-3 pt-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ── tag pill ──────────────────────────────────────────────────────────────────
function Pill({ label, color = "blue" }: { label: string; color?: "blue" | "violet" | "teal" | "amber" | "rose" }) {
  const cls = {
    blue:   "bg-[#4b7eff]/10 text-[#4b7eff] border-[#4b7eff]/20",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal:   "bg-teal-50 text-teal-700 border-teal-200",
    amber:  "bg-amber-50 text-amber-700 border-amber-200",
    rose:   "bg-rose-50 text-rose-700 border-rose-200",
  }[color];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function TagSection({
  title, items, color, icon,
}: { title: string; items: string[]; color: "blue" | "violet" | "teal" | "amber" | "rose"; icon: React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((x) => <Pill key={x} label={x} color={color} />)}
      </div>
    </div>
  );
}

// ── icons ─────────────────────────────────────────────────────────────────────
const IcoBriefcase = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V14.15M16.5 6v-.75a3.75 3.75 0 00-3.75-3.75h-1.5A3.75 3.75 0 007.5 5.25V6m9 0H7.5m9 0a2.25 2.25 0 012.25 2.25v1.5M7.5 6a2.25 2.25 0 00-2.25 2.25v1.5" />
  </svg>
);
const IcoClock = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IcoStar = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);
const IcoUsers = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IcoBuilding = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);
const IcoCash = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);
const IcoShield = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const IcoSettings = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ── main page ─────────────────────────────────────────────────────────────────
export default function TherapistProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [nextAvail, setNextAvail] = useState<NextAvail>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr("");
    publicApi<{ therapist: Therapist; clinics: Clinic[]; nextAvailability: NextAvail }>(
      `api/therapists/therapists/${id}`
    )
      .then((data) => {
        setTherapist(data.therapist);
        setClinics(data.clinics || []);
        setNextAvail(data.nextAvailability || null);
      })
      .catch((e: any) => setErr(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id]);

  const currency = therapist?.fees?.currency || "PKR";
  const onlineFee = therapist?.fees?.online;
  const inPersonFee = therapist?.fees?.inPerson;

  const avatarSrc = "" 
  // therapist?.profilePicture
  //   ? `${CDN}/${therapist.profilePicture.replace(/^\//, "")}`
  //   : "/default-avatar.png";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">

        {/* back */}
        <Link
          href="/appointments/book"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4b7eff] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to therapists
        </Link>

        {loading && <PageSkeleton />}

        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.007v.008H12v-.008z" />
            </svg>
            {err}
          </div>
        )}

        {therapist && (
          <>
            {/* ── Hero card ───────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {/* gradient strip */}
              <div className="h-24 bg-gradient-to-r from-[#4b7eff] to-[#6366f1]" />

              <div className="px-6 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-12">
                  {/* avatar */}
                  <div className="flex items-end gap-4">
                    <div className="relative">
                      <Image
                        src={avatarSrc}
                        alt={therapist.name}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-md"
                        onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                      />
                      {nextAvail && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                          <span className="h-2 w-2 rounded-full bg-white" />
                        </span>
                      )}
                    </div>

                    <div className="pb-1">
                      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{therapist.name}</h1>
                      <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1.5">
                        <IcoBriefcase />
                        {therapist.yearsExperience
                          ? `${therapist.yearsExperience} year${therapist.yearsExperience !== 1 ? "s" : ""} of experience`
                          : "Licensed Therapist"}
                        {therapist.licensingCouncil && (
                          <span className="text-gray-300">·</span>
                        )}
                        {therapist.licensingCouncil && (
                          <span className="flex items-center gap-1"><IcoShield />{therapist.licensingCouncil}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* book CTA */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/appointments/book?therapist=${id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition-all"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                      </svg>
                      Book a session
                    </Link>
                  </div>
                </div>

                {/* meta pills row */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {nextAvail && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Next available: {dayjs(nextAvail.start).format("ddd, MMM D · h:mm A")}
                    </span>
                  )}
                  {onlineFee != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      <IcoCash />
                      Online: {currency} {onlineFee.toLocaleString()} / session
                    </span>
                  )}
                  {inPersonFee != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      <IcoBuilding />
                      In-person: {currency} {inPersonFee.toLocaleString()} / session
                    </span>
                  )}
                  {!!therapist.specializations?.length &&
                    therapist.specializations.slice(0, 3).map((s) => (
                      <Pill key={s} label={s} color="blue" />
                    ))}
                </div>
              </div>
            </div>

            {/* ── Body grid ───────────────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Left / main column */}
              <div className="lg:col-span-2 space-y-5">

                {/* Bio */}
                {therapist.bio && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </span>
                      About
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{therapist.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                {(!!therapist.modalities?.length || !!therapist.concerns?.length ||
                  !!therapist.populations?.length || !!therapist.careSettings?.length) && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <IcoStar />
                      </span>
                      Expertise & approach
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TagSection
                        title="Modalities"
                        items={therapist.modalities ?? []}
                        color="blue"
                        icon={<IcoSettings />}
                      />
                      <TagSection
                        title="Concerns treated"
                        items={therapist.concerns ?? []}
                        color="violet"
                        icon={<IcoStar />}
                      />
                      <TagSection
                        title="Populations served"
                        items={therapist.populations ?? []}
                        color="teal"
                        icon={<IcoUsers />}
                      />
                      <TagSection
                        title="Care settings"
                        items={therapist.careSettings ?? []}
                        color="amber"
                        icon={<IcoBuilding />}
                      />
                    </div>
                  </div>
                )}

                {/* Why choose this therapist — static trust block */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <IcoShield />
                    </span>
                    How booking works
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { step: "01", title: "Choose a slot", desc: "Pick a date and time that works for you." },
                      { step: "02", title: "Verify via OTP", desc: "Confirm your booking with a 6-digit code sent to your email." },
                      { step: "03", title: "Attend your session", desc: "Show up online or in-person — your therapist will be ready." },
                    ].map((s) => (
                      <div key={s.step} className="flex gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#4b7eff]/10 text-xs font-bold text-[#4b7eff]">{s.step}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">

                {/* Clinics */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <IcoBuilding />
                    </span>
                    Clinic locations
                  </h2>
                  {!clinics.length ? (
                    <p className="text-xs text-gray-500 italic">No clinic locations listed.</p>
                  ) : (
                    <ul className="space-y-3">
                      {clinics.map((c) => {
                        const clinicFee = c.fee?.currency && c.fee?.amount != null
                          ? `${c.fee.currency} ${c.fee.amount.toLocaleString()}`
                          : inPersonFee != null
                          ? `${currency} ${inPersonFee.toLocaleString()}`
                          : null;
                        return (
                          <li key={c._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                            {(c.city || c.address) && (
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                {[c.city, c.address].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            {c.room && (
                              <p className="mt-0.5 text-[11px] text-gray-400">Room {c.room}</p>
                            )}
                            {clinicFee && (
                              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                                <IcoCash /> {clinicFee} / session
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <Link
                    href={`/appointments/book?therapist=${id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#4b7eff]/30 bg-[#4b7eff]/5 px-4 py-2.5 text-sm font-semibold text-[#4b7eff] hover:bg-[#4b7eff]/10 transition-colors"
                  >
                    Book in-person →
                  </Link>
                </div>

                {/* Availability CTA */}
                {nextAvail && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <IcoClock />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Available soon</p>
                        <p className="mt-0.5 text-xs text-emerald-700">
                          Next open slot: <span className="font-semibold">{dayjs(nextAvail.start).format("ddd, MMM D")}</span>
                          {" "}at <span className="font-semibold">{dayjs(nextAvail.start).format("h:mm A")}</span>
                        </p>
                        <Link
                          href={`/appointments/book?therapist=${id}`}
                          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                          Book this slot
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fee summary */}
                {(onlineFee != null || inPersonFee != null) && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <IcoCash />
                      </span>
                      Session fees
                    </h2>
                    <div className="space-y-2">
                      {onlineFee != null && (
                        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                          <span className="text-xs text-blue-700 font-medium">Online / Teletherapy</span>
                          <span className="text-sm font-bold text-blue-800">{currency} {onlineFee.toLocaleString()}</span>
                        </div>
                      )}
                      {inPersonFee != null && (
                        <div className="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2">
                          <span className="text-xs text-violet-700 font-medium">In-person</span>
                          <span className="text-sm font-bold text-violet-800">{currency} {inPersonFee.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400 text-center">Per session · clinic fees may vary</p>
                  </div>
                )}

                {/* Trust badges */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Why TheraKonnect</h2>
                  <div className="space-y-2.5">
                    {[
                      { icon: <IcoShield />, text: "Verified & licensed professionals" },
                      { icon: <IcoClock />,  text: "Real-time availability" },
                      { icon: <IcoUsers />,  text: "Secure patient records" },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                        <span className="text-[#4b7eff]">{b.icon}</span>
                        {b.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bottom CTA banner ────────────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-r from-[#4b7eff] to-[#6366f1] p-6 text-white shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Ready to book with {therapist.name.split(" ")[0]}?</h2>
                  <p className="mt-1 text-sm text-white/80">
                    Choose a time that works for you and confirm with a quick OTP verification.
                  </p>
                </div>
                <Link
                  href={`/appointments/book?therapist=${id}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#4b7eff] shadow-sm hover:bg-white/90 transition-colors"
                >
                  Book a session
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
