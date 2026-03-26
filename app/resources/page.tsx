// app/resources/page.tsx
"use client";

import Link from "next/link";

type Resource = {
  title: string;
  desc: string;
  href: string;
  external?: boolean;
  tag?: string;
};

const quickLinks: Resource[] = [
  {
    title: "Book an appointment",
    desc: "Find a therapist and pick a slot in a few clicks.",
    href: "/appointments/book",
    tag: "Patients",
  },
  {
    title: "My appointments",
    desc: "View and manage upcoming and past sessions.",
    href: "/appointments/my",
    tag: "Patients",
  },
  {
    title: "Therapist availability",
    desc: "Set your calendar and define open hours.",
    href: "/availability",
    tag: "Therapists",
  },
  {
    title: "Patient records",
    desc: "Create notes and view the full session history.",
    href: "/patient-records",
    tag: "All roles",
  },
];

const guides: Resource[] = [
  {
    title: "Patient records and sharing",
    desc: "How to write notes, import old records, and control access.",
    href: "/docs/patient-records",
    tag: "Guide",
  },
  {
    title: "Roles and approvals",
    desc: "How superAdmin, therapist, receptionist, and patient accounts work.",
    href: "/docs/roles",
    tag: "Onboarding",
  },
  {
    title: "Security and privacy",
    desc: "Access control, storage, and audit basics.",
    href: "/docs/security",
    tag: "Compliance",
  },
];

const externals: Resource[] = [
  {
    title: "Cloudinary console",
    desc: "Check and manage uploaded documents and images.",
    href: "https://cloudinary.com/console",
    external: true,
    tag: "External",
  },
  {
    title: "Status page",
    desc: "Live platform uptime and incident history.",
    href: "https://status.example.com",
    external: true,
    tag: "External",
  },
];

const faqs = [
  {
    q: "How do I request a patient's previous records?",
    a: "Open Patient records, then click Request previous records. Select the prior therapist and add a short reason. A superAdmin will review and approve the request.",
  },
  {
    q: "Why can't I log in as a therapist yet?",
    a: "Therapist and receptionist accounts need superAdmin approval. If your account is pending, you'll see a notice on the login or dashboard page.",
  },
  {
    q: "Why are my appointment times off?",
    a: "We store everything in UTC but display times in your device's timezone. Check your device time settings and confirm your availability window in your profile.",
  },
  {
    q: "Can I cancel or reschedule a booked appointment?",
    a: "Yes — open My appointments, find the session, and use the reschedule or cancel option. Cancellations within 24 hours may be subject to your clinic's policy.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 pt-10 space-y-12">

        {/* Header */}
        <header className="text-center space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4b7eff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
            Support hub
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Resources &{" "}
            <span className="text-[#4b7eff]">Help center</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-500">
            Quick actions, product guides, and external tools — everything you need for TheraKonnect in one place.
          </p>
        </header>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Quick links", "Guides", "FAQs", "External tools"].map((cat) => (
            <span key={cat} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
              {cat}
            </span>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">

            {/* Quick links */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>
                  <p className="mt-0.5 text-xs text-gray-500">The most common actions for patients and therapists.</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  Under 1 min
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickLinks.map((r) => (
                  <ResourceCard key={r.title} {...r} variant="primary" />
                ))}
              </div>
            </section>

            {/* Guides */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Guides</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Learn how the platform works behind the scenes.</p>
                </div>
                <span className="rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-medium text-violet-700">
                  For admins & staff
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((r) => (
                  <ResourceCard key={r.title} {...r} variant="neutral" />
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Frequently asked questions</h2>
                <p className="mt-0.5 text-xs text-gray-500">Short answers for the questions we see most often.</p>
              </div>
              <div className="space-y-2.5">
                {faqs.map((f) => (
                  <Faq key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* External tools */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-[#1a1f36] p-6 text-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#4b7eff]">External</p>
                  <h2 className="mt-0.5 text-base font-semibold text-white">External tools</h2>
                </div>
                <span className="rounded-full bg-gray-800 px-2.5 py-1 text-[10px] font-medium text-gray-300">
                  Opens new tab
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Tools you often open while working in TheraKonnect.</p>
              <div className="space-y-3">
                {externals.map((r) => (
                  <ResourceCard key={r.title} {...r} variant="dark" />
                ))}
              </div>
            </div>

            {/* Help card */}
            <div className="rounded-2xl border border-[#4b7eff]/20 bg-[#4b7eff]/5 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4b7eff] text-white text-sm font-bold">
                  ?
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Need something not listed?
                  </h3>
                  <p className="mt-1 text-xs text-gray-600">
                    Super admins can add internal docs and quick links so your team has a single place to start.
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Settings → Resources to manage this list.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting started card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">New to TheraKonnect?</h3>
              <div className="space-y-2.5">
                {[
                  { step: "1", text: "Create your account" },
                  { step: "2", text: "Complete your profile" },
                  { step: "3", text: "Browse available therapists" },
                  { step: "4", text: "Book your first session" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4b7eff]/10 text-xs font-bold text-[#4b7eff]">
                      {s.step}
                    </span>
                    <span className="text-xs text-gray-600">{s.text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition-all"
              >
                Get started
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  desc,
  href,
  external,
  tag,
  variant = "neutral",
}: Resource & { variant?: "primary" | "neutral" | "dark" }) {
  const isDark = variant === "dark";

  const base = "group relative flex items-start justify-between gap-3 overflow-hidden rounded-xl border p-4 transition-all";
  const variantCls = {
    primary: "border-[#4b7eff]/20 bg-[#4b7eff]/5 hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/8 hover:shadow-sm",
    neutral: "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white hover:shadow-sm",
    dark: "border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700/80",
  }[variant];

  const cls = `${base} ${variantCls}`;

  const inner = (
    <>
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-r bg-gradient-to-b from-[#4b7eff] to-[#6aa7ff]" />
      )}
      <div className="pl-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {title}
          </p>
          {tag && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isDark
                ? "bg-gray-700 text-gray-300"
                : variant === "primary"
                ? "bg-[#4b7eff]/15 text-[#4b7eff]"
                : "bg-gray-200 text-gray-600"
            }`}>
              {tag}
            </span>
          )}
        </div>
        <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {desc}
        </p>
      </div>
      <span className={`mt-1 shrink-0 text-sm transition-transform group-hover:translate-x-0.5 ${
        isDark
          ? "text-gray-500 group-hover:text-gray-200"
          : "text-gray-300 group-hover:text-[#4b7eff]"
      }`}>
        {external ? "↗" : "›"}
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-gray-100 bg-gray-50 transition-all open:bg-white open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
        <p className="text-sm font-medium text-gray-900">{q}</p>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs text-gray-400 transition-all group-open:rotate-90 group-open:border-[#4b7eff]/30 group-open:text-[#4b7eff]">
          ›
        </span>
      </summary>
      <p className="px-4 pb-4 text-xs leading-relaxed text-gray-600">{a}</p>
    </details>
  );
}
