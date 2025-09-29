// import Link from "next/link";

// export default function Landing() {
//   return (
//     <>
//       {/* Hero */}
//       <section className="bg-gradient-to-b from-brand-50 to-white">
//         <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
//           <div>
//             <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
//               Mental health care, without the hassle.
//             </h1>
//             <p className="mt-5 text-lg text-gray-600">
//               Book therapy sessions, manage availability, and keep everyone in sync — patients, therapists, receptionists, and admins.
//             </p>
//             <div className="mt-8 flex gap-3">
//               <Link href="/register" className="rounded-md bg-brand-500 px-5 py-3 text-white font-medium hover:bg-brand-600">
//                 Get started
//               </Link>
//               <Link href="/appointments/book" className="rounded-md border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50">
//                 Book an appointment
//               </Link>
//             </div>
//             <div className="mt-6 text-sm text-gray-500">
//               Secure, role-based access • Real-time free slots • Admin approvals
//             </div>
//           </div>
//           <div className="relative">
//             <div className="aspect-[4/3] rounded-2xl border bg-white shadow-lg p-6">
//               <div className="h-full w-full grid grid-cols-2 gap-3">
//                 <div className="rounded-lg bg-brand-100/60"></div>
//                 <div className="rounded-lg bg-brand-200/60"></div>
//                 <div className="rounded-lg bg-brand-300/60"></div>
//                 <div className="rounded-lg bg-brand-400/60"></div>
//               </div>
//             </div>
//             <div className="absolute -bottom-6 -right-6 bg-white shadow-lg rounded-xl p-4 border">
//               <p className="text-sm font-medium">Next available today at 4:00 PM</p>
//               <p className="text-xs text-gray-500">Dr. Ayesha • Online</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-8">
//         {[
//           { title:"Book with confidence", desc:"See only free slots. Double-booking is prevented server-side."},
//           { title:"Therapist tools", desc:"Manage availability and confirm or complete sessions quickly."},
//           { title:"Admin control", desc:"Approve staff accounts and keep your clinic organized."}
//         ].map((f,i)=>(
//           <div key={i} className="rounded-xl border p-6 hover:shadow-sm transition">
//             <h3 className="font-semibold text-lg">{f.title}</h3>
//             <p className="mt-2 text-gray-600 text-sm">{f.desc}</p>
//           </div>
//         ))}
//       </section>

//       {/* Testimonials */}
//       <section className="bg-gray-50">
//         <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-8">
//           {[
//             {q:"So simple to book and reschedule.", a:"— Patient"},
//             {q:"No more phone tag. The free-slot view is gold.", a:"— Receptionist"},
//             {q:"Approvals and availability just work.", a:"— Admin"},
//           ].map((t,i)=>(
//             <blockquote key={i} className="rounded-xl border bg-white p-6">
//               <p className="text-gray-700">“{t.q}”</p>
//               <footer className="mt-3 text-sm text-gray-500">{t.a}</footer>
//             </blockquote>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-center">
//         <h2 className="text-2xl font-semibold">Ready to streamline your clinic?</h2>
//         <p className="mt-2 text-gray-600">Create an account and start booking in minutes.</p>
//         <div className="mt-6">
//           <Link href="/register" className="rounded-md bg-brand-500 px-5 py-3 text-white font-medium hover:bg-brand-600">Create account</Link>
//         </div>
//       </section>
//     </>
//   );
// }


// app/(marketing)/page.tsx or wherever your Landing page lives
import Link from "next/link";
import Image from "next/image";

export default function Landing() {
  const a = "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop"
  return (
    <>
      {/* Top Bar */}
      {/* <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 text-white font-bold">MH</span>
            <span className="font-semibold tracking-tight">MindHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#testimonials" className="hover:text-gray-900">Testimonials</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Sign in</Link>
            <Link href="/register" className="rounded-md bg-brand-500 px-4 py-2 text-white text-sm font-medium hover:bg-brand-600">
              Get started
            </Link>
          </div>
        </div>
      </header> */}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-700 bg-white/60 backdrop-blur">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>
              HIPAA-style safeguards • Role-based access
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Mental health care, without the hassle.
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Book therapy sessions, manage availability, and keep everyone in sync — patients, therapists, receptionists, and admins.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-md bg-brand-500 px-5 py-3 text-white font-medium hover:bg-brand-600 transition">
                Get started
              </Link>
              <Link href="/appointments/book" className="rounded-md border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50">
                Book an appointment
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <CheckIcon /> Secure access
              </span>
              <span className="inline-flex items-center gap-2">
                <LightningIcon /> Real-time free slots
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldIcon /> Admin approvals
              </span>
            </div>

            {/* Social proof stats */}
            <dl className="mt-8 grid grid-cols-3 gap-6 max-w-md">
              {[
                {k: "Clinics", v: "120+"},
                {k: "Bookings/mo", v: "25k"},
                {k: "Uptime", v: "99.95%"},
              ].map((s,i)=>(
                <div key={i} className="rounded-lg border bg-white/60 backdrop-blur p-4 text-center">
                  <dt className="text-xs text-gray-500">{s.k}</dt>
                  <dd className="mt-1 text-xl font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-xl ring-1 ring-black/5">
              <Image
                src={a}
                alt="Therapist meeting patient online"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating availability card */}
            <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 border w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3">
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
                  alt="Dr. Ayesha profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">Next available today at 4:00 PM</p>
                  <p className="text-xs text-gray-500">Dr. Ayesha • Online</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                <ClockIcon /> 50 min • Video / In-person
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Everything you need to run a calm clinic</h2>
          <p className="mt-3 text-gray-600">Purpose-built tools for each role, neatly organized and secure.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Book with confidence",
              desc: "See only free slots. Double-booking is prevented server-side.",
              icon: <CalendarIcon />,
              img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
            },
            {
              title: "Therapist tools",
              desc: "Manage availability and confirm or complete sessions quickly.",
              icon: <ToolIcon />,
              img: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?q=80&w=1200&auto=format&fit=crop",
            },
            {
              title: "Admin control",
              desc: "Approve staff accounts and keep your clinic organized.",
              icon: <AdminIcon />,
              img: "https://images.unsplash.com/photo-1557425529-b1ae9c141e7d?q=80&w=1200&auto=format&fit=crop",
            },
          ].map((f, i) => (
            <div key={i} className="group rounded-xl border bg-white overflow-hidden hover:shadow-md transition">
              <div className="relative h-44">
                <Image
                  src={f.img}
                  alt={f.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    {f.icon}
                  </span>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                </div>
                <p className="mt-2 text-gray-600 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary CTA with image */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border bg-white shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop"
              alt="Clinic reception"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            <div className="relative p-6 sm:p-10 text-white max-w-lg">
              <h3 className="text-2xl font-semibold">Keep your front desk zen</h3>
              <p className="mt-2 text-white/80">
                Receptionists get real-time availability, patient context, and confirmations without phone tag.
              </p>
              <div className="mt-4">
                <Link href="/appointments/book" className="inline-flex items-center gap-2 rounded-md bg-white/90 px-4 py-2 text-gray-900 font-medium hover:bg-white">
                  Book an appointment <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h4 className="font-semibold">Why clinics switch</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li className="inline-flex items-start gap-2"><CheckIcon className="mt-1" /> Role-based dashboards</li>
              <li className="inline-flex items-start gap-2"><CheckIcon className="mt-1" /> Calendar sync & reminders</li>
              <li className="inline-flex items-start gap-2"><CheckIcon className="mt-1" /> Intake forms and notes</li>
              <li className="inline-flex items-start gap-2"><CheckIcon className="mt-1" /> Privacy-first architecture</li>
            </ul>

            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              <p><strong className="text-gray-900">Tip:</strong> You can block time, set recurring availability, and require admin approval for new staff — all from one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">What teams say</h2>
            <p className="mt-3 text-gray-600">Across patients, therapists, reception, and admins.</p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {q:"So simple to book and reschedule.", a:"— Patient", img:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop"},
              {q:"No more phone tag. The free-slot view is gold.", a:"— Receptionist", img:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"},
              {q:"Approvals and availability just work.", a:"— Admin", img:"https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop"},
            ].map((t,i)=>(
              <figure key={i} className="rounded-xl border bg-white p-6 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <Image src={t.img} alt={t.a} width={40} height={40} className="rounded-full object-cover" />
                  <figcaption className="text-sm text-gray-500">{t.a}</figcaption>
                </div>
                <blockquote className="mt-3 text-gray-800">“{t.q}”</blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h3 className="text-xl font-semibold text-center">Frequently asked questions</h3>
        <div className="mt-8 divide-y rounded-xl border bg-white">
          {[
            {q:"Can I prevent double-booking?", a:"Yes. Availability is enforced server-side and synced in real time across roles."},
            {q:"Do therapists control their own schedules?", a:"Therapists can set recurring or ad-hoc availability, block time, and confirm or complete sessions."},
            {q:"How are new staff approved?", a:"Admins can approve/deny staff accounts and assign roles with scoped permissions."},
          ].map((f,i)=>(
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
        <div className="rounded-2xl border bg-gradient-to-r from-brand-500 to-brand-600 p-10 text-white">
          <h2 className="text-2xl sm:text-3xl font-semibold">Ready to streamline your clinic?</h2>
          <p className="mt-2 text-white/90">Create an account and start booking in minutes.</p>
          <div className="mt-6">
            <Link href="/register" className="rounded-md bg-white px-5 py-3 text-brand-700 font-medium hover:bg-white/90">
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-6 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} PsyTrack. All rights reserved.</p>
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

/* ---------- Icons (inline, no extra deps) ---------- */
function CheckIcon(props:any){return(<svg {...props} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>)}
function LightningIcon(props:any){return(<svg {...props} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 3 4 14h6l-1 7 9-11h-6z"/></svg>)}
function ShieldIcon(props:any){return(<svg {...props} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"/></svg>)}
function CalendarIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3c1.1 0 2 .9 2 2v3H2V6c0-1.1.9-2 2-2h3V2zm15 8v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8h20z"/></svg>)}
function ToolIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.7 6.3 9 12l3 3 5.7-5.7a4 4 0 1 0-3-3zM7 14l-4 4v3h3l4-4-3-3z"/></svg>)}
function AdminIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>)}
function ClockIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 11h-4V7h2v4h2v2z"/></svg>)}
function ArrowRightIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m10 17 5-5-5-5v10zM5 5h2v14H5z"/></svg>)}
function ChevronIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 15-5-5h10l-5 5z"/></svg>)}
