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

import Image from "next/image";

const stats = [
  { label: "Verified therapists", value: "25,000+" },
  { label: "Cities covered", value: "70+" },
  { label: "Patients served", value: "5M+" },
  { label: "User rating", value: "4.9 / 5" },
];

const specialties = [
  "Clinical Psychologist",
  "Counseling Psychologist",
  "Child & Adolescent Therapist",
  "Couples & Marriage Therapist",
  "Family Therapist",
  "Trauma & PTSD Specialist",
  "Anxiety & Mood Disorders",
  "Addiction & Recovery",
  "Grief & Loss Counselor",
  "Neurodiversity (ADHD, Autism)",
  "Workplace Stress & Burnout",
];

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Multan",
  "Hyderabad",
];

export default function HomePage() {
  return (
    <div className="page">
      {/* Header */}

      {/* Hero section */}
      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-left">
              <div className="hero-badge">
                <span className="hero-dot" />
                Pakistan’s first connected digital health platform that securely
                tracks and stores all your medical records in one place.
              </div>
              <h1 className="hero-title">
                Book appointments with the best therapists in Pakistan
              </h1>
              <p className="hero-subtitle">
                Search top verified therapists by city and specialty. Consult
                online in minutes or visit clinic with instant confirmed
                booking.
              </p>

              {/* search card */}
              <div id="search" className="search-card">
                <div className="search-row">
                  <div className="field">
                    <label>City</label>
                    <select>
                      <option>Karachi</option>
                      <option>Lahore</option>
                      <option>Islamabad</option>
                      <option>Rawalpindi</option>
                      <option>Faisalabad</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Specialty, therapist or condition</label>
                    <input
                      type="text"
                      placeholder="Eg. anxiety, couples therapy, Ms. Muntaha Ali"
                    />
                  </div>
                  <button className="btn btn-primary search-btn">Search</button>
                </div>
                <p className="search-hint">
                  Popular searches. Skin specialist, child specialist,
                  psychologist, dentist
                </p>
              </div>

              {/* stats */}
              <div className="stats">
                {stats.map((item) => (
                  <div key={item.label} className="stat-item">
                    <div className="stat-value">{item.value}</div>
                    <div className="stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-right">
              <div className="doctor-card">
                <div className="doctor-avatar">
                  {/* <Image
                    src="https://therakonnect.com/public/images/therapists/therapist-1627891234567.jpg"
                    alt="Ms. Muntaha Ali"
                    width={64}
                    height={64}
                    className="doctor-image"
                  /> */}
                </div>
                <div>
                  <h3 className="doctor-name">Ms. Muntaha Ali</h3>
                  <p className="doctor-meta">Clinical Psychologist. Karachi</p>
                  <p className="doctor-rating">⭐ 4.9 . 1,250 reviews</p>
                </div>
              </div>

              <div className="hero-panel">
                <h3>Book in clinic or video consult</h3>
                <ul>
                  <li>Instant booking with confirmed time</li>
                  <li>Video consult from home in 2 minutes</li>
                  <li>Digital prescriptions and medical history</li>
                </ul>
                <div className="hero-panel-footer">
                  <button className="btn btn-primary btn-full">
                    Start video consult
                  </button>
                  <p className="hero-panel-note">
                    Available from 9.00am to 11.00pm daily
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* specialties section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Consult top specialists</h2>
              <p>Find therapists by specialty for your health concern</p>
            </div>

            <div className="chips-grid">
              {specialties.map((sp) => (
                <button key={sp} className="chip">
                  {sp}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* how it works */}
        <section id="how-it-works" className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2>How TheraKonnect works</h2>
              <p>Three simple steps to better care</p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Search therapist</h3>
                <p>
                  Enter your city and specialty. Compare profiles, experience
                  and reviews to choose the right therapist.
                </p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Book appointment</h3>
                <p>
                  Select clinic or video consult. Pick a convenient time and get
                  instant confirmed booking.
                </p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Consult and follow up</h3>
                <p>
                  Join your consult on time. Receive digital prescription and
                  follow up with the same therapist easily.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* top cities */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Top cities in Pakistan</h2>
              <p>Find therapist near you in major cities</p>
            </div>
            <div className="chips-grid">
              {cities.map((city) => (
                <button key={city} className="chip chip-outline">
                  {city}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* app section */}
        {/* <section id="video-consult" className="section section-alt">
          <div className="container app-section">
            <div className="app-left">
              <h2>Book and consult using our mobile app</h2>
              <p>
                Download the TheraKonnect.com app to manage your health more
                easily. Keep prescriptions, reports and appointments in one
                secure place.
              </p>
              <div className="store-buttons">
                <div className="store-btn">
                  <span className="store-label">Get it on</span>
                  <span className="store-title">Google Play</span>
                </div>
                <div className="store-btn">
                  <span className="store-label">Download on the</span>
                  <span className="store-title">App Store</span>
                </div>
              </div>
            </div>
            <div className="app-right">
              <div className="phone-mock">
                <div className="phone-screen">
                  <div className="phone-header">Upcoming appointment</div>
                  <div className="phone-card">
                    <div className="phone-doc-avatar" />
                    <div>
                      <div className="phone-doc-name">Dr. Imran Ahmed</div>
                      <div className="phone-doc-meta">Cardiologist. Lahore</div>
                      <div className="phone-doc-time">Today . 6.30pm</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full phone-btn">
                    Join video call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* simple testimonials and trust */}
        <section id="labs" className="section">
          <div className="container">
            <div className="section-header">
              <h2>Trusted by millions</h2>
              <p>Real patients. Real stories</p>
            </div>
            <div className="testimonials">
              <div className="testimonial">
                <p>
                  I booked a therapist in Karachi in just a few minutes. The
                  online session was smooth, and I received my notes and
                  follow-up plan right after.
                </p>
                <div className="testimonial-name">Sara, Karachi</div>
              </div>
              <div className="testimonial">
                <p>
                  I found a child specialist for my son and could check reviews
                  before booking. Very helpful for parents.
                </p>
                <div className="testimonial-name">Ali, Lahore</div>
              </div>
              <div className="testimonial">
                <p>
                  Booking lab tests and therapist visits in one place saves me a
                  lot of time. Highly recommended.
                </p>
                <div className="testimonial-name">Farhan, Islamabad</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
    </div>
  );
}
