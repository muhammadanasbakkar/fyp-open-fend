"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── data ─────────────────────────────────────────────────── */

const stats = [
  { label: "Verified therapists", value: "25,000+", icon: "👨‍⚕️" },
  { label: "Cities covered", value: "70+", icon: "🏙️" },
  { label: "Patients served", value: "5M+", icon: "🫂" },
  { label: "User rating", value: "4.9 / 5", icon: "⭐" },
];

const specialties = [
  { label: "Clinical Psychologist", icon: "🧠" },
  { label: "Counseling Psychologist", icon: "💬" },
  { label: "Child & Adolescent Therapist", icon: "🧒" },
  { label: "Couples & Marriage Therapist", icon: "💑" },
  { label: "Family Therapist", icon: "👨‍👩‍👧" },
  { label: "Trauma & PTSD Specialist", icon: "🛡️" },
  { label: "Anxiety & Mood Disorders", icon: "🌊" },
  { label: "Addiction & Recovery", icon: "💪" },
  { label: "Grief & Loss Counselor", icon: "🕊️" },
  { label: "Neurodiversity (ADHD, Autism)", icon: "🌈" },
  { label: "Workplace Stress & Burnout", icon: "⚡" },
];

const cities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi",
  "Faisalabad", "Peshawar", "Multan", "Hyderabad",
];

const steps = [
  {
    n: "01",
    title: "Search a therapist",
    desc: "Enter your city and specialty. Browse verified profiles, years of experience, and real reviews to find the right fit.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Book your slot",
    desc: "Pick in-clinic consult. Select a time that suits you and get an instant booking confirmation by email.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Consult & follow up",
    desc: "Join your session on time. Get session notes, a follow-up plan, and continue care with the same therapist.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: "I booked a therapist in Karachi in just a few minutes. The online session was smooth and I received my session notes and follow-up plan right after.",
    name: "Sara A.",
    city: "Karachi",
    rating: 5,
    initials: "SA",
    color: "#4b7eff",
  },
  {
    quote: "I found a child specialist for my son and could check reviews before booking. Booking was instant. Very helpful for parents navigating this alone.",
    name: "Ali R.",
    city: "Lahore",
    rating: 5,
    initials: "AR",
    color: "#0f766e",
  },
  {
    quote: "Managing my therapy appointments in one secure place saves so much time. The therapist I found has been exactly what I needed. Highly recommended.",
    name: "Farhan K.",
    city: "Islamabad",
    rating: 5,
    initials: "FK",
    color: "#7c3aed",
  },
];

const features = [
  { icon: "🔒", title: "Secure & private", desc: "All records encrypted and HIPAA-aligned. Your health data stays yours." },
  { icon: "✅", title: "Verified therapists", desc: "Every therapist is license-verified before joining the platform." },
  { icon: "📋", title: "Digital session notes", desc: "Therapists keep structured notes. You can access your history any time." },
  { icon: "📅", title: "Instant booking", desc: "No wait, no calls. Confirm your slot in under 60 seconds." },
];

/* ─── component ─────────────────────────────────────────────── */

export default function HomePageClient() {
  const [city, setCity] = useState("Karachi");
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#3a5bef] to-[#6366f1] pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        {/* Layered decorative shapes */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 h-[640px] w-[640px] rounded-full bg-gradient-to-br from-[#7c3aed]/40 to-transparent blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-[#06b6d4]/30 to-transparent blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            {/* ── Left: copy + search ── */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Pakistan&apos;s #1 mental healthcare platform
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                Better mental
                <br />
                health starts with{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                    the right fit
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-3 rounded bg-gradient-to-r from-yellow-300/30 via-amber-300/30 to-orange-300/30 blur-sm"
                  />
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base text-white/80 sm:text-lg">
                Browse verified therapists by city, specialty, and language. Book online or in-clinic sessions in under a minute — no phone calls, no waitlists.
              </p>

              {/* Inline trust pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: "✓", text: "License verified" },
                  { icon: "🔒", text: "End-to-end private" },
                  { icon: "⚡", text: "Instant confirmation" },
                ].map((t) => (
                  <span
                    key={t.text}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm"
                  >
                    <span aria-hidden>{t.icon}</span>
                    {t.text}
                  </span>
                ))}
              </div>

              {/* Search card */}
              <form
                onSubmit={handleSearch}
                className="mt-8 rounded-2xl bg-white p-3 shadow-2xl shadow-black/25 ring-1 ring-black/5 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="sm:w-32 sm:shrink-0">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                    >
                      {cities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Specialty or therapist
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Anxiety, CBT, Dr. name…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                      />
                    </div>
                  </div>
                  <Link
                    href={`/appointments/book${
                      query
                        ? `?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`
                        : ""
                    }`}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3a5bef] to-[#6366f1] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Search
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-1">
                  <span className="text-[11px] text-gray-400">Popular:</span>
                  {["Anxiety", "CBT", "Depression", "Couples therapy"].map((p) => (
                    <Link
                      key={p}
                      href={`/appointments/book?q=${encodeURIComponent(p)}`}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-[#4b7eff]/10 hover:text-[#4b7eff] transition-colors"
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              </form>
            </div>

            {/* ── Right: illustrated therapist preview card stack ── */}
            <div className="relative hidden lg:block">
              {/* Floating chip — top-left */}
              <div className="absolute -left-4 top-2 z-20 flex animate-[float_6s_ease-in-out_infinite] items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ring-1 ring-black/5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-base">
                  ✓
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Confirmed
                  </p>
                  <p className="text-xs font-bold text-gray-900">Mon, 3:30 PM</p>
                </div>
              </div>

              {/* Floating chip — bottom-right */}
              <div className="absolute -right-2 bottom-6 z-20 flex animate-[float_7s_ease-in-out_infinite_1s] items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ring-1 ring-black/5">
                <div className="flex -space-x-1.5">
                  {["#4b7eff", "#0f766e", "#7c3aed"].map((c) => (
                    <span
                      key={c}
                      className="h-6 w-6 rounded-full border-2 border-white"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">2,431 booked</p>
                  <p className="text-[10px] text-gray-500">this week</p>
                </div>
              </div>

              {/* Main "therapist preview" card */}
              <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-black/5">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #4b7eff 0%, #7c3aed 100%)",
                      }}
                    >
                      MA
                    </div>
                    <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900">Dr. Muntaha Ali</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
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
                    <p className="mt-0.5 text-xs text-gray-500">
                      Clinical Psychologist · 8 yrs exp
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className="h-3 w-3 text-yellow-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700">4.9</span>
                      <span className="text-[10px] text-gray-400">(312 reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Anxiety", "CBT", "Trauma", "Sleep"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#4b7eff]/8 px-2 py-0.5 text-[10px] font-medium text-[#4b7eff]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Next available
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {[
                      { d: "Today", t: "3:30" },
                      { d: "Today", t: "5:00", primary: true },
                      { d: "Tmrw", t: "10:00" },
                      { d: "Tmrw", t: "2:30" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={[
                          "rounded-lg border-2 px-1 py-1.5 text-center transition-all",
                          s.primary
                            ? "border-[#4b7eff] bg-[#4b7eff] text-white shadow-md"
                            : "border-gray-200 bg-white text-gray-700",
                        ].join(" ")}
                      >
                        <p className="text-[9px] font-semibold uppercase opacity-80">{s.d}</p>
                        <p className="text-xs font-bold leading-tight">{s.t}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Session</p>
                    <p className="text-sm font-bold text-gray-900">
                      PKR 4,500
                      <span className="ml-1 text-[10px] font-normal text-gray-400">/ 50 min</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#3a5bef] to-[#6366f1] px-4 py-2 text-xs font-bold text-white shadow-md">
                    Book now
                  </span>
                </div>
              </div>

              {/* Subtle stacked card behind */}
              <div
                aria-hidden
                className="absolute inset-x-4 -bottom-3 -z-10 h-24 rounded-3xl bg-white/40 backdrop-blur-sm"
              />
              <div
                aria-hidden
                className="absolute inset-x-8 -bottom-6 -z-20 h-24 rounded-3xl bg-white/20 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS STRIP — between hero and content
      ══════════════════════════════════════════════════════════ */}
      <section className="relative -mt-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-xl sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center bg-white px-4 py-5 text-center"
              >
                <div className="text-xl">{s.icon}</div>
                <div className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#4b7eff]/10 text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SPECIALTIES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" /> Specialties
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Find the right specialist for you
            </h2>
            <p className="mt-2 text-sm text-gray-500">Browse therapists by what you&apos;re going through</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map(sp => (
              <Link
                key={sp.label}
                href={`/appointments/book?q=${encodeURIComponent(sp.label)}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:-translate-y-0.5 hover:shadow-md"
              >
                <span>{sp.icon}</span>
                {sp.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" /> How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Book care in three simple steps
            </h2>
            <p className="mt-2 text-sm text-gray-500">No referrals. No long waits. Just care when you need it.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ borderTopWidth: 3, borderTopColor: `${["#4b7eff","#0f766e","#7c3aed"][i]}` }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ background: `${["#4b7eff","#0f766e","#7c3aed"][i]}` }}
                >
                  {s.icon}
                </div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-300">{s.n}</p>
                <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CITIES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" /> Coverage
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Available across Pakistan</h2>
            <p className="mt-2 text-sm text-gray-500">Find a verified therapist near you in every major city</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {cities.map(city => (
              <Link
                key={city}
                href={`/appointments/book?city=${encodeURIComponent(city)}`}
                className="group inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-base">📍</span>
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" /> Testimonials
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Trusted by thousands of patients</h2>
            <p className="mt-2 text-sm text-gray-500">Real people, real breakthroughs</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map(t => (
              <div key={t.name} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="flex-1 text-sm text-gray-600 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>

                {/* Author */}
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#6366f1] px-8 py-14 text-center sm:px-16">
            {/* Decorative circles */}
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <p className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Now accepting new patients
            </p>
            <h2 className="relative mt-4 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              Your mental health journey starts today
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/75 sm:text-base">
              Join thousands of Pakistanis who have found the right therapist and started feeling better.
              Book your first session in under 60 seconds.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/appointments/book"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#4b7eff] shadow-lg hover:brightness-105 transition-all"
              >
                Book a session
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/register/staff"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                Join as a therapist
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
