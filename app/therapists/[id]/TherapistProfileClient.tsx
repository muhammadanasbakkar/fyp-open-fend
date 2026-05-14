"use client";

import { useEffect, useMemo, useState } from "react";
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
  licenseNumber?: string;
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

/* ── skeleton ────────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="h-40 animate-pulse bg-gray-100" />
        <div className="space-y-3 p-6">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-44 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}

/* ── small atoms ─────────────────────────────────────────────── */
function Pill({
  label,
  color = "blue",
}: {
  label: string;
  color?: "blue" | "violet" | "teal" | "amber" | "rose";
}) {
  const cls = {
    blue: "bg-[#4b7eff]/10 text-[#4b7eff] ring-[#4b7eff]/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
  }[color];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}
    >
      {label}
    </span>
  );
}

/* ── icons (kept consistent with rest of app) ────────────────── */
const IcoCalendar = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
  </svg>
);
const IcoBriefcase = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V14.15M16.5 6v-.75a3.75 3.75 0 00-3.75-3.75h-1.5A3.75 3.75 0 007.5 5.25V6m9 0H7.5" />
  </svg>
);
const IcoShield = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const IcoBuilding = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
  </svg>
);
const IcoStar = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const IcoBolt = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const IcoCheck = () => (
  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

/* ── main client component ───────────────────────────────────── */
export default function TherapistProfileClient() {
  const { id } = useParams<{ id: string }>();

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [nextAvail, setNextAvail] = useState<NextAvail>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  type Tab = "modalities" | "concerns" | "populations" | "settings";
  const [tab, setTab] = useState<Tab>("modalities");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr("");
    publicApi<{ therapist: Therapist; hospitals: Clinic[]; nextAvailability: NextAvail }>(
      `api/therapists/therapists/${id}`
    )
      .then((data) => {
        setTherapist(data.therapist);
        setClinics(data.hospitals || []);
        setNextAvail(data.nextAvailability || null);
      })
      .catch((e: any) => setErr(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id]);

  const currency = therapist?.fees?.currency || "PKR";
  const onlineFee = therapist?.fees?.online;
  const inPersonFee = therapist?.fees?.inPerson;

  const avatarSrc = therapist?.profilePicture
    ? `${CDN}/${therapist.profilePicture.replace(/^\//, "")}`
    : null;

  // Pick a default tab that actually has data
  const tabData = useMemo(() => {
    const all = {
      modalities: therapist?.modalities ?? [],
      concerns: therapist?.concerns ?? [],
      populations: therapist?.populations ?? [],
      settings: therapist?.careSettings ?? [],
    };
    const order: Tab[] = ["modalities", "concerns", "populations", "settings"];
    return { all, order };
  }, [therapist]);
  const hasAnyExpertise = tabData.order.some((k) => (tabData.all as any)[k].length > 0);

  useEffect(() => {
    if (!therapist) return;
    const order: Tab[] = ["modalities", "concerns", "populations", "settings"];
    const first = order.find((k) => (tabData.all as any)[k].length > 0);
    if (first && (tabData.all as any)[tab].length === 0) setTab(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapist]);

  const firstName = therapist?.name?.split(" ")?.[0] || "this therapist";

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
        {/* Back */}
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
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.007v.008H12v-.008z" />
            </svg>
            {err}
          </div>
        )}

        {therapist && (
          <>
            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              {/* Cover gradient with subtle pattern */}
              <div className="relative h-28 bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#7c3aed] sm:h-32">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div aria-hidden className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
                <div aria-hidden className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />

                {/* Floating "Verified" badge */}
                <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/20">
                  <IcoCheck />
                  Verified Therapist
                </span>
              </div>

              {/* Avatar — overlaps cover only halfway so the name has clear
                  space below it on every screen size. */}
              <div className="relative px-6 sm:px-8">
                <div className="-mt-12 inline-block sm:-mt-14">
                  <div className="relative">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={therapist.name}
                        width={112}
                        height={112}
                        className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white shadow-xl sm:h-28 sm:w-28"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-3xl font-bold text-white ring-4 ring-white shadow-xl sm:h-28 sm:w-28">
                        {therapist.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {nextAvail && (
                      <span
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5"
                        title="Available soon"
                      >
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Name + meta + CTA — fully below the cover in white space */}
              <div className="flex flex-col gap-4 px-6 pb-6 pt-3 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:pb-8">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    {therapist.name}
                  </h1>

                  {/* Rating + experience + license — wrap-safe row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IcoStar key={i} />
                      ))}
                      <span className="ml-1 font-bold text-gray-900">4.9</span>
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <IcoBriefcase />
                      {therapist.yearsExperience
                        ? `${therapist.yearsExperience} yr${therapist.yearsExperience !== 1 ? "s" : ""} experience`
                        : "Licensed therapist"}
                    </span>
                    {therapist.licensingCouncil && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <IcoShield />
                          {therapist.licensingCouncil}
                        </span>
                      </>
                    )}
                  </div>

                  {!!therapist.specializations?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {therapist.specializations.slice(0, 4).map((s) => (
                        <Pill key={s} label={s} color="blue" />
                      ))}
                      {therapist.specializations.length > 4 && (
                        <span className="self-center text-[11px] text-gray-400">
                          +{therapist.specializations.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/appointments/book?therapist=${id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3a5bef] to-[#6366f1] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all"
                >
                  <IcoCalendar />
                  Book a session
                </Link>
              </div>

              {/* Bottom stats strip — sits inside the hero card */}
              <div className="grid grid-cols-2 gap-px border-t border-gray-100 bg-gray-100 sm:grid-cols-4">
                {[
                  {
                    label: "Experience",
                    value: therapist.yearsExperience ? `${therapist.yearsExperience}+ yrs` : "Licensed",
                    icon: <IcoBriefcase />,
                  },
                  {
                    label: "Locations",
                    value: clinics.length ? `${clinics.length} clinic${clinics.length !== 1 ? "s" : ""}` : "Online only",
                    icon: <IcoBuilding />,
                  },
                  {
                    label: "Response",
                    value: "Within 24 hrs",
                    icon: <IcoBolt />,
                  },
                  {
                    label: "Status",
                    value: nextAvail ? "Available" : "Booking soon",
                    icon: nextAvail ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                    ),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-center gap-2 bg-white px-3 py-3 text-center"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
                      {s.icon}
                    </span>
                    <div className="text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {s.label}
                      </p>
                      <p className="text-xs font-bold text-gray-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── BODY GRID ─────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              {/* Left column */}
              <div className="space-y-6">
                {/* About */}
                {therapist.bio && (
                  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </span>
                      About {firstName}
                    </h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {therapist.bio}
                    </p>
                  </section>
                )}

                {/* Expertise — tabbed */}
                {hasAnyExpertise && (
                  <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <header className="border-b border-gray-100 px-6 py-4">
                      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                          <IcoStar />
                        </span>
                        Expertise & approach
                      </h2>
                    </header>
                    <div className="border-b border-gray-100">
                      <div className="-mb-px flex gap-1 overflow-x-auto px-4 sm:px-6">
                        {[
                          { key: "modalities" as Tab, label: "Modalities" },
                          { key: "concerns" as Tab, label: "Concerns treated" },
                          { key: "populations" as Tab, label: "Populations" },
                          { key: "settings" as Tab, label: "Care settings" },
                        ].map((t) => {
                          const count = (tabData.all as any)[t.key].length as number;
                          const active = tab === t.key;
                          const disabled = count === 0;
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => !disabled && setTab(t.key)}
                              disabled={disabled}
                              className={[
                                "shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors",
                                disabled
                                  ? "border-transparent text-gray-300 cursor-not-allowed"
                                  : active
                                    ? "border-[#4b7eff] text-[#4b7eff]"
                                    : "border-transparent text-gray-500 hover:text-gray-800",
                              ].join(" ")}
                            >
                              {t.label}
                              <span
                                className={[
                                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                  disabled
                                    ? "bg-gray-50 text-gray-300"
                                    : active
                                      ? "bg-[#4b7eff]/10 text-[#4b7eff]"
                                      : "bg-gray-100 text-gray-500",
                                ].join(" ")}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="p-6">
                      {(() => {
                        const list = (tabData.all as any)[tab] as string[];
                        if (!list.length) {
                          return (
                            <p className="text-xs italic text-gray-400">
                              No entries in this category yet.
                            </p>
                          );
                        }
                        const color =
                          tab === "modalities"
                            ? "blue"
                            : tab === "concerns"
                              ? "violet"
                              : tab === "populations"
                                ? "teal"
                                : "amber";
                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {list.map((x) => (
                              <Pill key={x} label={x} color={color as any} />
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </section>
                )}

                {/* Locations */}
                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <IcoBuilding />
                    </span>
                    Clinic locations
                  </h2>
                  {!clinics.length ? (
                    <p className="text-xs italic text-gray-500">
                      No clinic locations listed — {firstName} may offer online sessions only.
                    </p>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {clinics.map((c) => {
                        const clinicFee =
                          c.fee?.currency && c.fee?.amount != null
                            ? `${c.fee.currency} ${c.fee.amount.toLocaleString()}`
                            : inPersonFee != null
                              ? `${currency} ${inPersonFee.toLocaleString()}`
                              : null;
                        return (
                          <li
                            key={c._id}
                            className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                          >
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
                              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200">
                                {clinicFee} / session
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {/* How booking works */}
                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <IcoShield />
                    </span>
                    How booking works
                  </h2>
                  <ol className="grid gap-4 sm:grid-cols-3">
                    {[
                      { step: "01", title: "Choose a slot", desc: "Pick a date and time that works for you." },
                      { step: "02", title: "Verify via OTP", desc: "Confirm with a 6-digit code sent to your email." },
                      { step: "03", title: "Attend your session", desc: "Show up online or in-person — your therapist will be ready." },
                    ].map((s) => (
                      <li key={s.step} className="flex gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#4b7eff]/10 text-xs font-bold text-[#4b7eff]">
                          {s.step}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{s.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              {/* Sticky booking sidebar (desktop) */}
              <aside className="lg:sticky lg:top-6">
                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  {/* Header */}
                  <div className="border-b border-gray-100 bg-gradient-to-r from-[#4b7eff]/5 via-[#6366f1]/5 to-transparent px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4b7eff]">
                      Book a session
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">
                      Reserve your spot with {firstName}
                    </p>
                  </div>

                  <div className="space-y-4 p-5">
                    {/* Next available */}
                    {nextAvail ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Next available
                          </p>
                        </div>
                        <p className="mt-1.5 text-sm font-bold text-emerald-900">
                          {dayjs(nextAvail.start).format("dddd, MMM D")}
                        </p>
                        <p className="text-xs text-emerald-700">
                          {dayjs(nextAvail.start).format("h:mm A")} –{" "}
                          {dayjs(nextAvail.end).format("h:mm A")}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Availability
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-700">
                          Check booking calendar for open slots.
                        </p>
                      </div>
                    )}

                    {/* Fees */}
                    {(onlineFee != null || inPersonFee != null) && (
                      <div className="rounded-xl border border-gray-100 bg-white p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Session fees
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {onlineFee != null && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Online / Teletherapy</span>
                              <span className="text-sm font-bold text-gray-900">
                                {currency} {onlineFee.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {inPersonFee != null && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">In-person</span>
                              <span className="text-sm font-bold text-gray-900">
                                {currency} {inPersonFee.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-[10px] text-gray-400">
                          Per session · clinic fees may vary
                        </p>
                      </div>
                    )}

                    <Link
                      href={`/appointments/book?therapist=${id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3a5bef] to-[#6366f1] py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <IcoCalendar />
                      Book a session
                    </Link>

                    {/* Trust micro-list */}
                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      {[
                        "License-verified profile",
                        "Encrypted patient records",
                        "Confirm in 60 seconds",
                      ].map((t) => (
                        <p key={t} className="flex items-center gap-2 text-[11px] text-gray-600">
                          <span className="text-emerald-500">
                            <IcoCheck />
                          </span>
                          {t}
                        </p>
                      ))}
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            {/* ── Bottom CTA banner ───────────────────────────── */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#6366f1] p-6 sm:p-8 shadow-sm">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    Ready to book with {firstName}?
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    Pick a time that works for you and confirm with a quick OTP — usually under
                    60 seconds.
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
            </section>
          </>
        )}
      </div>
    </div>
  );
}
