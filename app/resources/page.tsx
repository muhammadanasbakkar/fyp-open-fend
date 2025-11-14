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
    desc: "Set your calendar and open hours.",
    href: "/availability",
    tag: "Therapists",
  },
  {
    title: "Patient records",
    desc: "Create notes and view the full history.",
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
    desc: "How superAdmin, therapist, receptionist and patient accounts work.",
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

export default function ResourcesPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6">
        {/* Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Support hub
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Resources and help center
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-600">
              Quick actions, product guides, and external tools you use with TheraKonnect in one place.
            </p>
          </div>
        </header>

        {/* Two column layout on desktop */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="space-y-8">
            {/* Quick links */}
            <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    The most common actions for patients and therapists.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  Under 1 minute to start
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {quickLinks.map((r) => (
                  <Card key={r.title} {...r} variant="primary" />
                ))}
              </div>
            </section>

            {/* Guides */}
            <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Guides</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Learn how the platform works behind the scenes.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
                  For admins and staff
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {guides.map((r) => (
                  <Card key={r.title} {...r} variant="neutral" />
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">FAQs</h2>
              <p className="mt-1 text-xs text-slate-500">
                Short answers for the questions we see most often.
              </p>
              <div className="mt-4 space-y-3">
                <Faq
                  q="How do I request a patient previous records?"
                  a="Open Patient records, then Request previous records. Select the prior therapist and add a short reason. A superAdmin may review and approve the request."
                />
                <Faq
                  q="Why can not I log in as a therapist yet?"
                  a="Therapist and receptionist accounts need superAdmin approval. If your account is pending, you will see a notice on the login or dashboard page."
                />
                <Faq
                  q="Why are my times off by a few hours?"
                  a="We store everything in UTC but show times in your device timezone. Check your device time settings and confirm the availability window in your profile."
                />
              </div>
            </section>
          </div>

          {/* Right column . external tools and a small help card */}
          <aside className="space-y-6">
            {/* External tools */}
            <section className="rounded-2xl border border-slate-100 bg-slate-950 text-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">External tools</h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Tools you often open while working in TheraKonnect.
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-200">
                  Opens in new tab
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {externals.map((r) => (
                  <Card key={r.title} {...r} variant="dark" />
                ))}
              </div>
            </section>

            {/* Small help card */}
            <section className="rounded-2xl border border-sky-100 bg-sky-50/80 p-5 text-slate-900 shadow-sm backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-sky-500/90 text-white grid place-items-center text-sm font-semibold">
                  ?
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Need something that is not listed?
                  </h3>
                  <p className="text-xs text-slate-700">
                    Super admins can add internal docs and quick links here so your team has a single place to start.
                  </p>
                  <p className="text-xs text-slate-500">
                    Ask your superAdmin to open Settings then Resources to manage this list.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  desc,
  href,
  external,
  tag,
  variant = "neutral",
}: Resource & { variant?: "primary" | "neutral" | "dark" }) {
  const baseCommon =
    "group relative overflow-hidden rounded-xl border p-4 transition-all";
  const variants: Record<typeof variant, string> = {
    primary:
      "border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-slate-50 hover:border-sky-200 hover:shadow-md",
    neutral:
      "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm",
    dark: "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-900/90",
  };

  const isDark = variant === "dark";
  const titleCls = isDark
    ? "font-medium text-slate-50"
    : "font-medium text-slate-900";
  const descCls = isDark
    ? "mt-1 text-xs text-slate-300"
    : "mt-1 text-xs text-slate-600";

  const containerClass = `${baseCommon} ${variants[variant]}`;

  const inner =
    "flex items-start justify-between gap-3";

  const Tag = external ? "a" : Link;
  const tagProps = external
    ? { href, target: "_blank", rel: "noreferrer" }
    : { href };

  return (
    <Tag className={containerClass} {...tagProps}>
      {/* subtle highlight stripe on primary */}
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-400 to-emerald-400" />
      )}

      <div className={inner}>
        <div className="pl-1">
          <div className="flex items-center gap-2">
            <p className={titleCls}>{title}</p>
            {tag && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isDark
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tag}
              </span>
            )}
          </div>
          <p className={descCls}>{desc}</p>
        </div>
        <span
          className={`mt-1 text-xs transition-transform group-hover:translate-x-0.5 ${
            isDark
              ? "text-slate-400 group-hover:text-slate-100"
              : "text-slate-300 group-hover:text-slate-600"
          }`}
        >
          {external ? "↗" : "›"}
        </span>
      </div>
    </Tag>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-colors open:bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">{q}</p>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-500 transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{a}</p>
    </details>
  );
}
