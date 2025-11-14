// // app/about/page.tsx
// "use client";
// import Link from "next/link";

// export default function AboutPage() {
//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//       <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
//         {/* Header */}
//         <header className="text-center">
//           <h1 className="text-3xl font-semibold tracking-tight">About TheraKonnect</h1>
//           <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
//             TheraKonnect helps clinics and independent therapists manage availability, appointments,
//             and patient notes—securely and simply.
//           </p>
//         </header>

//         {/* Mission */}
//         <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-semibold">Our mission</h2>
//           <p className="mt-2 text-sm text-gray-600">
//             We believe mental healthcare deserves modern, privacy-first tools. TheraKonnect streamlines admin
//             tasks so clinicians can focus on care: booking, reminders, patient records, and inter-therapist
//             sharing with superAdmin oversight.
//           </p>
//         </section>

//         {/* Stats / Highlights */}
//         <section className="grid gap-4 sm:grid-cols-3">
//           {[
//             { k: "99.9%", v: "Uptime" },
//             { k: "AES-256", v: "At-rest Encryption" },
//             { k: "Role-based", v: "Access Control" },
//           ].map((item) => (
//             <div
//               key={item.k}
//               className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
//             >
//               <div className="text-2xl font-semibold text-[var(--brand,#4b7eff)]">{item.k}</div>
//               <div className="mt-1 text-sm text-gray-600">{item.v}</div>
//             </div>
//           ))}
//         </section>

//         {/* How it works */}
//         <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-semibold">How TheraKonnect helps</h2>
//           <ul className="mt-3 grid gap-3 sm:grid-cols-2">
//             <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
//               <p className="font-medium">Smart booking</p>
//               <p className="mt-1 text-sm text-gray-600">
//                 Patients see real-time availability and book fixed-length slots.
//               </p>
//             </li>
//             <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
//               <p className="font-medium">Therapist notes</p>
//               <p className="mt-1 text-sm text-gray-600">
//                 Keep structured visit notes. Share upon request with superAdmin oversight.
//               </p>
//             </li>
//             <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
//               <p className="font-medium">Security first</p>
//               <p className="mt-1 text-sm text-gray-600">
//                 Role-based access, audit trails, and secure document storage.
//               </p>
//             </li>
//             <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
//               <p className="font-medium">Clinic-ready</p>
//               <p className="mt-1 text-sm text-gray-600">
//                 Reception workflows, therapist approvals, and admin dashboards.
//               </p>
//             </li>
//           </ul>
//         </section>

//         {/* CTA */}
//         <section className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
//           <h2 className="text-lg font-semibold">Get started</h2>
//           <p className="mt-1 text-sm text-gray-600">
//             Create an account or log in to manage appointments and records.
//           </p>
//           <div className="mt-4 flex items-center justify-center gap-3">
//             <Link
//               href="/register"
//               className="inline-flex items-center rounded-md bg-[var(--brand,#4b7eff)] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
//             >
//               Create account
//             </Link>
//             <Link
//               href="/login"
//               className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
//             >
//               Log in
//             </Link>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }


// app/about/page.tsx
"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6">
        {/* Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            About TheraKonnect
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Built for modern therapy workflows
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-600">
              TheraKonnect helps clinics and independent therapists manage availability, appointments and patient notes in one secure workspace.
            </p>
          </div>
        </header>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]">
          <div className="space-y-8">
            {/* Mission */}
            <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Our mission</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We believe mental healthcare deserves tools that feel calm, secure and invisible. 
                TheraKonnect reduces admin noise so clinicians can spend more time with patients. 
                Booking, reminders, patient records and inter therapist sharing are all designed with superAdmin oversight and privacy in mind.
              </p>
            </section>

            {/* How it helps */}
            <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    How TheraKonnect helps your clinic
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Designed around real roles. superAdmin, therapist, receptionist and patient.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  Clinic ready
                </span>
              </div>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                <li className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Smart booking</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Patients see live availability, choose slot lengths that you define and receive confirmations automatically.
                  </p>
                </li>
                <li className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Structured notes</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Therapists keep consistent visit notes and attach files. 
                    Sharing requires a clear request and superAdmin controls.
                  </p>
                </li>
                <li className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Clinic workflows</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Reception can manage day views, walk ins and reschedules. 
                    Approvals flow to superAdmin instead of scattered chats.
                  </p>
                </li>
                <li className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Built to grow</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Start with a single therapist and scale to multi location clinics without changing tools or data structures.
                  </p>
                </li>
              </ul>
            </section>

            {/* Timeline / approach */}
            <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Our product approach</h2>
              <ol className="mt-4 space-y-4 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Privacy first, not as a checkbox</p>
                    <p className="text-xs text-slate-600">
                      We design features around who should see what, rather than adding access rules at the end.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Low friction for patients</p>
                    <p className="text-xs text-slate-600">
                      Booking and reminders are designed to be clear and mobile friendly, so patients arrive prepared and on time.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Visible controls for admins</p>
                    <p className="text-xs text-slate-600">
                      superAdmins see who has access to records, pending approvals and system activity in one view.
                    </p>
                  </div>
                </li>
              </ol>
            </section>
          </div>

          {/* Right column . highlights and CTA */}
          <aside className="space-y-6">
            {/* Stats / highlights */}
            <section className="rounded-2xl border border-slate-100 bg-slate-950 p-6 text-slate-50 shadow-sm">
              <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                Platform highlights
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Core controls that matter for clinical teams.
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  { k: "99.9%", v: "Target uptime" },
                  { k: "AES-256", v: "Encryption at rest" },
                  { k: "Role based", v: "Access control" },
                ].map((item) => (
                  <div
                    key={item.k}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-300">
                        {item.v}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-sky-300">
                      {item.k}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl border border-sky-100 bg-sky-50/90 p-6 text-slate-900 shadow-sm backdrop-blur">
              <h2 className="text-base font-semibold">
                Ready to try TheraKonnect?
              </h2>
              <p className="mt-1 text-xs text-slate-700">
                Create a clinic or individual account, invite your team and start managing appointments and records today.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm sm:flex-none"
                  style={{
                    background:
                      "linear-gradient(90deg,var(--brand,#4b7eff),var(--brand2,#6aa7ff))",
                  }}
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-50 sm:flex-none"
                >
                  Log in
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                You can add therapists and receptionists later from the admin dashboard.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
