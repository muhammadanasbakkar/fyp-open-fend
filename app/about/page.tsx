// app/about/page.tsx
"use client";

import Link from "next/link";

const stats = [
  { k: "99.9%", v: "Target uptime", icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { k: "AES-256", v: "Encryption at rest", icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )},
  { k: "Role-based", v: "Access control", icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )},
  { k: "4 roles", v: "Admin · Therapist · Reception · Patient", icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )},
];

const features = [
  {
    title: "Smart booking",
    desc: "Patients see live availability, choose from your defined slot lengths, and receive confirmations automatically.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    color: "bg-[#4b7eff]/10 text-[#4b7eff]",
  },
  {
    title: "Structured notes",
    desc: "Therapists keep consistent visit notes and attach files. Sharing requires an explicit request with admin oversight.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "Clinic workflows",
    desc: "Reception manages walk-ins and reschedules. Approvals flow through the admin instead of scattered messages.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Built to grow",
    desc: "Start with a single therapist, scale to multi-location clinics without changing your tools or data structures.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    color: "bg-amber-100 text-amber-600",
  },
];

const principles = [
  {
    n: "01",
    title: "Privacy first, not as a checkbox",
    desc: "We design features around who should see what — access rules are built into the architecture, not bolted on later.",
  },
  {
    n: "02",
    title: "Low friction for patients",
    desc: "Booking and reminders are clear and mobile-friendly so patients arrive prepared and on time.",
  },
  {
    n: "03",
    title: "Visible controls for admins",
    desc: "Super admins see who has access to records, pending approvals, and system activity in one unified view.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 pt-10 space-y-12">

        {/* Hero header */}
        <header className="text-center space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b7eff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
            About TheraKonnect
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Built for modern{" "}
            <span className="text-[#4b7eff]">therapy workflows</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-500">
            TheraKonnect helps clinics and independent therapists manage availability, appointments, and patient notes in one secure, calm workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition-all"
            >
              Get started free
            </Link>
            <Link
              href="/appointments/book"
              className="inline-flex items-center rounded-xl border border-[#4b7eff]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#4b7eff] hover:bg-[#4b7eff]/5 transition-colors"
            >
              Browse therapists
            </Link>
          </div>
        </header>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#4b7eff]/10 text-[#4b7eff]">
                {s.icon}
              </div>
              <div className="text-lg font-bold text-gray-900">{s.k}</div>
              <div className="mt-0.5 text-[11px] text-gray-500">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            {/* Mission */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4b7eff]/10 text-[#4b7eff]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Our mission</h2>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                We believe mental healthcare deserves tools that feel calm, secure, and invisible.
                TheraKonnect reduces admin noise so clinicians spend more time with patients.
                Booking, reminders, patient records, and inter-therapist sharing are all designed
                with superAdmin oversight and privacy as the foundation — not an afterthought.
              </p>
            </section>

            {/* Features grid */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">How TheraKonnect helps</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Designed around real clinic roles.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                  Clinic-ready
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((f) => (
                  <div key={f.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}>
                      {f.icon}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Principles */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Our product approach</h2>
              <div className="space-y-5">
                {principles.map((p) => (
                  <div key={p.n} className="flex gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#4b7eff]/10 text-xs font-bold text-[#4b7eff]">
                      {p.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Dark highlights card */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-[#1a1f36] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4b7eff]">
                Platform highlights
              </p>
              <h3 className="mt-1 text-base font-semibold text-white">
                Core controls that matter for clinical teams
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  { label: "HIPAA-aligned architecture", ok: true },
                  { label: "Audit trail on all record access", ok: true },
                  { label: "Multi-clinic support", ok: true },
                  { label: "Role-scoped dashboards", ok: true },
                  { label: "Secure file attachments", ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4b7eff]/20">
                      <svg className="h-3 w-3 text-[#6aa7ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="rounded-2xl border border-[#4b7eff]/20 bg-[#4b7eff]/5 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Ready to try TheraKonnect?</h3>
              <p className="mt-1 text-xs text-gray-600">
                Create a clinic or individual account, invite your team, and start managing appointments today.
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition-all"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[#4b7eff]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#4b7eff] hover:bg-[#4b7eff]/5 transition-colors"
                >
                  Log in
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 text-center">
                You can add therapists and receptionists later from the admin dashboard.
              </p>
            </div>

            {/* Who is it for */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Who is it for?</h3>
              <div className="space-y-2.5">
                {[
                  { role: "Patients", desc: "Book sessions, track history", color: "bg-blue-50 text-blue-700" },
                  { role: "Therapists", desc: "Manage schedule & notes", color: "bg-violet-50 text-violet-700" },
                  { role: "Receptionists", desc: "Handle walk-ins & admin", color: "bg-emerald-50 text-emerald-700" },
                  { role: "Super Admins", desc: "Oversee all clinic activity", color: "bg-amber-50 text-amber-700" },
                ].map((r) => (
                  <div key={r.role} className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${r.color}`}>
                      {r.role}
                    </span>
                    <span className="text-xs text-gray-500">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom CTA banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#4b7eff] to-[#6366f1] p-8 text-center text-white shadow-sm">
          <h2 className="text-2xl font-bold">Start improving your clinic workflow today</h2>
          <p className="mt-2 text-sm text-white/80">
            Join clinics across Pakistan using TheraKonnect to deliver better mental healthcare.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4b7eff] hover:bg-white/90 transition-colors shadow-sm"
            >
              Create your account
            </Link>
            <Link
              href="/appointments/book"
              className="inline-flex items-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse therapists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
