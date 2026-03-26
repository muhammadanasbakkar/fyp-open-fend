// // /app/page.tsx  (or wherever your Landing is)
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useEffect, useState, useMemo } from "react";
// import { publicApi } from "@/lib/publicApi";
// import TherapistCard from "@/components/TherapistCard";

// type LandingPayload = {
//   stats: { therapists: number; hospitals: number; verifiedReviews: number; onlineNow: number };
//   cities: string[];
//   specialties: { name: string; count: number }[];
//   featuredTherapists: {
//     _id: string;
//     name: string;
//     email?: string;
//     profilePicture?: string;
//     yearsExperience?: number;
//     specializations?: string[];
//     fees?: { currency?: string; online?: number; inPerson?: number } | null;
//     nextStart?: string | null;
//   }[];
// };

// const ASSETS = {
//   hero:
//     "https://oladoc.com/dist/images/banner-doc-2_highly-compressed.webp?v=1760712292368",
//   app:
//     "https://images.unsplash.com/photo-1585432959449-389d008b6345?q=80&w=1600&auto=format&fit=crop",
// };

// export default function Landing() {
//   const [data, setData] = useState<LandingPayload | null>(null);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         setErr("");
//         const p = await publicApi<LandingPayload>("api/public/landing");
//         setData(p);
//       } catch (e: any) {
//         setErr(e.message || "Failed to load landing data");
//       }
//     })();
//   }, []);

//   const specialties = useMemo(
//     () => (data?.specialties || []).map((s) => titleCase(s.name)),
//     [data]
//   );

//   const cities = useMemo(() => (data?.cities || []).filter(Boolean).slice(0, 12), [data]);

//   return (
//     <>
//       {/* HERO */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_10%_-10%,theme(colors.brand.100/.6),transparent),radial-gradient(900px_400px_at_110%_10%,theme(colors.brand.200/.4),transparent)] bg-gradient-to-b from-white via-brand-50 to-white" />
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2440%22 viewBox=%220 0 40 40%22><path fill=%22%23e5e7eb%22 fill-opacity=%220.55%22 d=%22M0 39.5h40v1H0zM39.5 0v40h1V0z%22/></svg>')] opacity-[0.35]" />

//         <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
//           <div>
//             <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700 bg-white/70 backdrop-blur">
//               <ShieldIcon /> Privacy-first • Verified therapists
//             </span>

//             <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
//               Book top therapists & secure video sessions — fast.
//             </h1>
//             <p className="mt-3 text-lg text-gray-600">
//               Search by specialty or concern, choose your city, and confirm in seconds.
//             </p>

//             {/* Search card */}
//             <div className="mt-6 rounded-2xl border bg-white/80 backdrop-blur px-4 py-4 sm:p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]">
//               <form className="grid gap-3 sm:grid-cols-[1fr_220px_auto]" action="/appointments/find-therapist" method="GET">
//                 <div className="relative">
//                   <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     name="q"
//                     placeholder="Therapists, specialties, concerns (anxiety, ADHD, couples)"
//                     className="w-full rounded-xl border px-10 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
//                     aria-label="Search therapists"
//                   />
//                 </div>
//                 <div className="relative">
//                   <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     name="city"
//                     placeholder="City or locality"
//                     className="w-full rounded-xl border px-10 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
//                     aria-label="Select city"
//                     list="cities-list"
//                   />
//                   <datalist id="cities-list">
//                     {cities.map((c) => <option key={c} value={c} />)}
//                   </datalist>
//                 </div>
//                 <button className="rounded-xl bg-brand-600 px-5 py-3 text-white font-semibold hover:bg-brand-700 active:translate-y-[1px] transition">
//                   Search
//                 </button>
//               </form>

//               {/* Quick toggles */}
//               <div className="mt-3 flex flex-wrap gap-2 text-sm">
//                 <Chip href="/appointments/find-therapist?setting=online" icon={<VideoIcon />}>Online Therapy</Chip>
//                 <Chip href="/appointments/find-therapist?setting=in-person" icon={<ClinicIcon />}>In-Person</Chip>
//               </div>
//             </div>

//             {/* Trust bar — dynamic */}
//             <dl className="mt-6 grid grid-cols-3 gap-3 max-w-md">
//               {[
//                 { k: "Therapists", v: data?.stats?.therapists ?? "—" },
//                 { k: "Hospitals", v: data?.stats?.hospitals ?? "—" },
//                 { k: "Online now", v: data?.stats?.onlineNow ?? "—" },
//               ].map((s, i) => (
//                 <div key={i} className="rounded-xl border bg-white/80 backdrop-blur p-4 text-center">
//                   <dt className="text-xs text-gray-500">{s.k}</dt>
//                   <dd className="mt-1 text-xl font-bold tracking-tight">{s.v}</dd>
//                 </div>
//               ))}
//             </dl>

//             {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
//           </div>

//           {/* Hero visual */}
//           <div className="relative">
//             <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-white ring-1 ring-black/5 shadow-xl">
//               <Image src={ASSETS.hero} alt="Client booking a therapy session" fill className="object-cover" priority />
//             </div>

//             <div className="absolute -bottom-6 -right-6 w-[280px] rounded-2xl border bg-white/90 backdrop-blur shadow-xl p-4">
//               <div className="flex items-center gap-3">
//                 <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
//                   <DotIcon />
//                 </span>
//                 <div>
//                   <p className="text-sm font-semibold">Therapists online now</p>
//                   <p className="text-xs text-gray-500">
//                     Start a secure video session in minutes
//                   </p>
//                 </div>
//               </div>
//               <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
//                 <span><ClockIcon /> Avg wait: 3–5 min</span>
//                 <Link href="/appointments/find-therapist?setting=online" className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-gray-50">
//                   Start <ArrowRightIcon />
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* POPULAR SPECIALTIES — dynamic */}
//       <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
//         <h2 className="text-xl sm:text-2xl font-semibold">Popular therapy specialties</h2>
//         <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//           {specialties.length ? (
//             specialties.map((s) => (
//               <Link
//                 key={s}
//                 href={`/appointments/find-therapist?modality=${encodeURIComponent(s.toLowerCase())}`}
//                 className="group rounded-xl border bg-white p-3 hover:shadow-sm hover:border-brand-200 transition"
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 group-hover:bg-brand-100">
//                     <SparkIcon />
//                   </span>
//                   <span className="text-sm font-medium">{s}</span>
//                 </div>
//               </Link>
//             ))
//           ) : (
//             <SkeletonGrid count={12} />
//           )}
//         </div>
//       </section>

//       {/* CITY SHORTCUTS — dynamic */}
//       <section className="bg-gray-50">
//         <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
//           <h2 className="text-xl sm:text-2xl font-semibold">Find therapists by city</h2>
//           <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//             {cities.length ? (
//               cities.map((c) => (
//                 <Link
//                   key={c}
//                   href={`/appointments/find-therapist?city=${encodeURIComponent(c)}`}
//                   className="rounded-xl border bg-white px-3 py-3 text-sm text-gray-800 hover:shadow-sm hover:border-brand-200"
//                 >
//                   {c}
//                 </Link>
//               ))
//             ) : (
//               <SkeletonGrid count={12} />
//             )}
//           </div>
//         </div>
//       </section>

//       {/* FEATURED THERAPISTS — dynamic */}
//       <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl sm:text-2xl font-semibold">Recommended therapists</h2>
//           <Link href="/appointments/find-therapist" className="text-sm text-brand-700 hover:underline">See all</Link>
//         </div>

//         <div className="mt-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
//           <div className="flex gap-4 min-w-max pr-2">
//             {data?.featuredTherapists?.length ? (
//               data.featuredTherapists.map((t) => (
//                 <div key={t._id} className="w-[280px]">
//                   <TherapistCard
//                     _id={t._id}
//                     name={t.name}
//                     profilePicture={t.profilePicture}
//                     specializations={t.specializations}
//                     yearsExperience={t.yearsExperience}
//                     fees={t.fees}
//                   />
//                 </div>
//               ))
//             ) : (
//               Array.from({ length: 6 }).map((_, i) => (
//                 <div key={i} className="w-[280px] h-40 rounded-2xl border bg-gray-100 animate-pulse" />
//               ))
//             )}
//           </div>
//         </div>
//       </section>

//       {/* APP PROMO + HELP (kept) */}
//       <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
//         <div className="grid lg:grid-cols-3 gap-6 items-stretch">
//           <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border bg-white shadow-sm">
//             <Image src={ASSETS.app} alt="TheraKonnect mobile app" fill className="object-cover" />
//             <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
//             <div className="relative p-6 sm:p-10 text-white max-w-lg">
//               <h3 className="text-2xl font-semibold">Get the TheraKonnect App</h3>
//               <p className="mt-2 text-white/85">Online therapy, reminders, and secure notes in one place.</p>
//               <div className="mt-4 flex gap-2">
//                 <Link href="/app" className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-gray-900 font-medium hover:bg-white">
//                   Download <ArrowRightIcon />
//                 </Link>
//                 <Link href="/sms-link" className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-white ring-1 ring-white/50 hover:bg-white/25">
//                   Send me the link
//                 </Link>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-3xl border bg-white p-6">
//             <h4 className="font-semibold">Need help booking?</h4>
//             <p className="mt-1 text-sm text-gray-600">Our care team is available 9am–10pm daily.</p>
//             <div className="mt-4 rounded-xl bg-gray-50 p-4">
//               <div className="text-2xl font-bold tracking-tight">042-38900939</div>
//               <p className="text-xs text-gray-500 mt-1">Standard call charges apply</p>
//             </div>
//             <div className="mt-4">
//               <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50">
//                 Chat with us <ArrowRightIcon />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ + CTA + FOOTER (unchanged from your version) */}
//       {/* ... keep your FAQ, CTA, and footer here ... */}
//     </>
//   );
// }

// /* ---------- Helpers & small components ---------- */
// function titleCase(s: string){ return s.replace(/\b\w/g, m => m.toUpperCase()).replace(/-/g," "); }
// function SkeletonGrid({count}:{count:number}) {
//   return (
//     <>
//       {Array.from({ length: count }).map((_,i)=>(
//         <div key={i} className="h-12 rounded-xl border bg-gray-100 animate-pulse" />
//       ))}
//     </>
//   );
// }
// function Chip({ href, icon, children }: any) {
//   return (
//     <Link href={href} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white hover:bg-gray-50">
//       {icon} {children}
//     </Link>
//   );
// }
// function ShieldIcon(props:any){return(<svg {...props} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"/></svg>)}
// function SearchIcon(props:any){return(<svg {...props} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.5 21.5 20l-6-6zM6.5 11a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1 0 5z"/></svg>)}
// function LocationIcon(props:any){return(<svg {...props} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5z"/></svg>)}
// function VideoIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m15 10 6-4v12l-6-4v4H2V6h13v4z"/></svg>)}
// function ClinicIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 10 12 3l9 7v10a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/></svg>)}
// function ClockIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 11h-4V7h2v4h2v2z"/></svg>)}
// function ArrowRightIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m10 17 5-5-5-5v10zM5 5h2v14H5z"/></svg>)}
// function SparkIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 1.76 5.24L19 9l-5.24 1.76L12 16l-1.76-5.24L5 9l5.24-1.76z"/></svg>)}
// function DotIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>)}

// import { redirect } from "next/navigation";

// export default function Home() {
//   redirect("/login");
// }

// app/page.tsx
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

export default function HomePage() {
  const [city, setCity] = useState("Karachi");
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3a5bef] via-[#4b7eff] to-[#6366f1] pt-16 pb-24 sm:pt-20 sm:pb-32">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Pakistan&apos;s #1 mental healthcare booking platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-3xl text-center text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find & book the{" "}
            <span className="relative">
              <span className="relative z-10 text-yellow-300">right therapist</span>
              <span aria-hidden className="absolute inset-x-0 bottom-1 h-2 rounded bg-yellow-300/20" />
            </span>{" "}
            in Pakistan
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-center text-base text-white/75 sm:text-lg">
            Browse verified therapists by city and specialty. Book in-clinic sessions in under a minute.
          </p>

          {/* Search card */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white p-3 shadow-2xl shadow-black/20 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                >
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-[2]">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Specialty or therapist</label>
                <input
                  type="text"
                  placeholder="e.g. anxiety, couples therapy, Ms. Muntaha Ali"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]/30"
                />
              </div>
              <Link
                href={`/appointments/book${query ? `?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}` : ""}`}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6366f1] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-110 transition-all"
              >
                Search
              </Link>
            </div>
            <p className="mt-2 px-1 text-[11px] text-gray-400">
              Popular: <span className="text-gray-600">Anxiety therapy · CBT · Depression · Couples therapy</span>
            </p>
          </form>

          {/* Stats */}
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <div className="text-xl">{s.icon}</div>
                <div className="mt-1 text-lg font-extrabold text-white">{s.value}</div>
                <div className="text-[11px] text-white/70">{s.label}</div>
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

                <p className="flex-1 text-sm text-gray-600 leading-relaxed">"{t.quote}"</p>

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
