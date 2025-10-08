import Link from "next/link";
import Image from "next/image";

/** Replace these with PsyTrack/approved asset URLs only if you have permission */
const ASSETS = {
  hero:
    "https://images.unsplash.com/photo-1586731103961-2171cd4bd614?q=80&w=1600&auto=format&fit=crop",
  app:
    "https://images.unsplash.com/photo-1585432959449-389d008b6345?q=80&w=1600&auto=format&fit=crop",
  t1:
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800&auto=format&fit=crop",
  t2:
    "https://images.unsplash.com/photo-1550831108-3d1b437fef81?q=80&w=800&auto=format&fit=crop",
  t3:
    "https://images.unsplash.com/photo-1606813907291-76e7c1df2d01?q=80&w=800&auto=format&fit=crop",
};

export default function Landing() {
  const specialties = [
    "Clinical Psychologist",
    "CBT Therapist",
    "Child & Adolescent Therapist",
    "Couples & Family Therapist",
    "Trauma Therapist (EMDR)",
    "Addiction Counselor",
    "Anxiety & Depression",
    "Grief Counselor",
    "ADHD Specialist",
    "Workplace Stress",
    "Sleep Therapist",
    "Eating Disorders",
  ];

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"];

  const therapists = [
    {
      name: "Ayesha Khan, MS, CPsych",
      tag: "Clinical Psychologist • 8 yrs",
      fee: "Rs 3,500 / session",
      rating: 4.9,
      img: ASSETS.t1,
      href: "/therapists/ayesha-khan",
    },
    {
      name: "Hamza Ahmed, CBT",
      tag: "CBT Therapist • 12 yrs",
      fee: "Rs 2,800 / session",
      rating: 4.8,
      img: ASSETS.t2,
      href: "/therapists/hamza-ahmed",
    },
    {
      name: "Meera Saeed, EMDR",
      tag: "Trauma Therapist • 10 yrs",
      fee: "Rs 4,000 / session",
      rating: 4.9,
      img: ASSETS.t3,
      href: "/therapists/meera-saeed",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* soft gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_10%_-10%,theme(colors.brand.100/.6),transparent),radial-gradient(900px_400px_at_110%_10%,theme(colors.brand.200/.4),transparent)] bg-gradient-to-b from-white via-brand-50 to-white" />
        {/* subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2440%22 viewBox=%220 0 40 40%22><path fill=%22%23e5e7eb%22 fill-opacity=%220.55%22 d=%22M0 39.5h40v1H0zM39.5 0v40h1V0z%22/></svg>')] opacity-[0.35]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700 bg-white/70 backdrop-blur">
              <ShieldIcon /> Privacy-first • Verified therapists
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
              Book top therapists & secure video sessions — fast.
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Search by specialty or concern, choose your city, and confirm in seconds.
            </p>

            {/* Search card */}
            <div className="mt-6 rounded-2xl border bg-white/80 backdrop-blur px-4 py-4 sm:p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]">
              <form className="grid gap-3 sm:grid-cols-[1fr_220px_auto]" action="/search" method="GET">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="q"
                    name="q"
                    placeholder="Therapists, specialties, concerns (anxiety, ADHD, couples)"
                    className="w-full rounded-xl border px-10 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    aria-label="Search therapists by name, specialty or concern"
                  />
                </div>
                <div className="relative">
                  <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="city"
                    name="city"
                    placeholder="City or locality"
                    className="w-full rounded-xl border px-10 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    aria-label="Select city"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg border bg-white hover:bg-gray-50"
                    aria-label="Detect location"
                  >
                    Detect
                  </button>
                </div>
                <button className="rounded-xl bg-brand-600 px-5 py-3 text-white font-semibold hover:bg-brand-700 active:translate-y-[1px] transition">
                  Search
                </button>
              </form>

              {/* Quick toggles */}
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Chip href="/online-therapy" icon={<VideoIcon />}>Online Therapy</Chip>
                <Chip href="/in-person" icon={<ClinicIcon />}>In-Person</Chip>
                {/* <Chip href="/assessments" icon={<LabIcon />}>Assessments</Chip> */}
              </div>
            </div>

            {/* Trust bar */}
            <dl className="mt-6 grid grid-cols-3 gap-3 max-w-md">
              {[
                { k: "Therapists", v: "3k+" },
                { k: "Verified reviews", v: "150k+" },
                { k: "Online sessions", v: "1M+" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border bg-white/80 backdrop-blur p-4 text-center">
                  <dt className="text-xs text-gray-500">{s.k}</dt>
                  <dd className="mt-1 text-xl font-bold tracking-tight">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual with overlay card */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-white ring-1 ring-black/5 shadow-xl">
              <Image
                src={ASSETS.hero}
                alt="Client booking a therapy session"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute -bottom-6 -right-6 w-[280px] rounded-2xl border bg-white/90 backdrop-blur shadow-xl p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <DotIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold">Therapists online now</p>
                  <p className="text-xs text-gray-500">Start a secure video session in minutes</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                <span><ClockIcon /> Avg wait: 3–5 min</span>
                <Link href="/online-therapy" className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-gray-50">
                  Start <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SPECIALTIES */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-semibold">Popular therapy specialties</h2>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {specialties.map((s) => (
            <Link
              key={s}
              href={`/specialties/${slugify(s)}`}
              className="group rounded-xl border bg-white p-3 hover:shadow-sm hover:border-brand-200 transition"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 group-hover:bg-brand-100">
                  <SparkIcon />
                </span>
                <span className="text-sm font-medium">{s}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CITY SHORTCUTS */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h2 className="text-xl sm:text-2xl font-semibold">Find therapists by city</h2>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {cities.map((c) => (
              <Link
                key={c}
                href={`/cities/${c.toLowerCase()}`}
                className="rounded-xl border bg-white px-3 py-3 text-sm text-gray-800 hover:shadow-sm hover:border-brand-200"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECOMMENDED THERAPISTS — horizontal scroll */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold">Recommended therapists</h2>
          <Link href="/search" className="text-sm text-brand-700 hover:underline">See all</Link>
        </div>

        <div className="mt-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
          <div className="flex gap-4 min-w-max pr-2">
            {therapists.map((t) => (
              <Link
                key={t.name}
                href={t.href}
                className="group w-[280px] rounded-2xl border bg-white hover:shadow-md transition"
              >
                <div className="relative h-40">
                  <Image src={t.img} alt={t.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full bg-green-50 text-green-700 px-2 py-0.5">
                      <StarIcon /> {t.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{t.tag}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{t.fee}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-brand-700">
                      Book <ArrowRightIcon />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* APP PROMO */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border bg-white shadow-sm">
            <Image
              src={ASSETS.app}
              alt="TheraKonnect mobile app"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="relative p-6 sm:p-10 text-white max-w-lg">
              <h3 className="text-2xl font-semibold">Get the TheraKonnect App</h3>
              <p className="mt-2 text-white/85">
                Online therapy, reminders, and secure notes in one place.
              </p>
              <div className="mt-4 flex gap-2">
                <Link href="/app" className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-gray-900 font-medium hover:bg-white">
                  Download <ArrowRightIcon />
                </Link>
                <Link href="/sms-link" className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-white ring-1 ring-white/50 hover:bg-white/25">
                  Send me the link
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <h4 className="font-semibold">Need help booking?</h4>
            <p className="mt-1 text-sm text-gray-600">Our care team is available 9am–10pm daily.</p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <div className="text-2xl font-bold tracking-tight">042-38900939</div>
              <p className="text-xs text-gray-500 mt-1">Standard call charges apply</p>
            </div>
            <div className="mt-4">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50">
                Chat with us <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <h3 className="text-xl font-semibold text-center">FAQs</h3>
        <div className="mt-6 divide-y rounded-2xl border bg-white">
          {[
            { q: "How do I book a session?", a: "Search a specialty/therapist, pick a slot, and confirm. You’ll get instant confirmation and reminders." },
            { q: "Can I start therapy online?", a: "Yes. Choose “Online Therapy” to connect with available therapists for a secure video session." },
            { q: "What about fees?", a: "Session fees vary by therapist, city, and modality. Use fee filters on search results to match your budget." },
          ].map((f, i) => (
            <details key={i} className="group p-5 open:bg-gray-50">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">{f.q}</span>
                <span className="transition group-open:rotate-180"><ChevronIcon /></span>
              </summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 text-center">
        <div className="rounded-3xl border bg-gradient-to-r from-brand-600 to-brand-700 p-10 text-white">
          <h2 className="text-2xl sm:text-3xl font-semibold">Find a therapist now</h2>
          <p className="mt-2 text-white/90">Online or in-person therapy — your choice.</p>
          <div className="mt-6">
            <Link href="/search" className="rounded-xl bg-white px-5 py-3 text-brand-700 font-semibold hover:bg-white/90">
              Search therapists
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-6 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} TheraKonnect. All rights reserved.</p>
          <div className="flex sm:justify-end gap-4">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ---------- Helpers & icons ---------- */
function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}
function Chip({ href, icon, children }: any) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white hover:bg-gray-50">
      {icon} {children}
    </Link>
  );
}
function ShieldIcon(props:any){return(<svg {...props} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"/></svg>)}
function SearchIcon(props:any){return(<svg {...props} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.5 21.5 20l-6-6zM6.5 11a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0"/></svg>)}
function LocationIcon(props:any){return(<svg {...props} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5z"/></svg>)}
function VideoIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m15 10 6-4v12l-6-4v4H2V6h13v4z"/></svg>)}
function ClinicIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 10 12 3l9 7v10a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/></svg>)}
function LabIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 2h6v2h-1v6.1l6.3 9.9A2 2 0 0 1 18.7 22H5.3a2 2 0 0 1-1.6-3.1L10 10.1V4H9z"/></svg>)}
function ClockIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 11h-4V7h2v4h2v2z"/></svg>)}
function ArrowRightIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m10 17 5-5-5-5v10zM5 5h2v14H5z"/></svg>)}
function StarIcon(){return(<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
function SparkIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 1.76 5.24L19 9l-5.24 1.76L12 16l-1.76-5.24L5 9l5.24-1.76z"/></svg>)}
function DotIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>)}
function ChevronIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 15-5-5h10l-5 5z"/></svg>)}
