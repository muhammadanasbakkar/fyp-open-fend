// app/resources/page.tsx
"use client";
import Link from "next/link";

type Resource = {
  title: string;
  desc: string;
  href: string;
  external?: boolean;
};

const quickLinks: Resource[] = [
  { title: "Book an appointment", desc: "Find a therapist & pick a slot", href: "/appointments/book" },
  { title: "My appointments", desc: "Manage upcoming & past sessions", href: "/appointments/my" },
  { title: "Therapist availability", desc: "Set your open hours", href: "/availability" },
  { title: "Patient records", desc: "Create notes & view history", href: "/patient-records" },
];

const guides: Resource[] = [
  { title: "Patient records & sharing", desc: "How to write notes and request prior records", href: "/docs/patient-records" },
  { title: "Roles & approvals", desc: "superAdmin, therapist, receptionist, patient", href: "/docs/roles" },
  { title: "Security & privacy", desc: "Access control, storage, and audit basics", href: "/docs/security" },
];

const externals: Resource[] = [
  { title: "Cloudinary console", desc: "Manage uploaded documents", href: "https://cloudinary.com/console", external: true },
  { title: "Status page", desc: "Platform uptime & incidents", href: "https://status.example.com", external: true },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            Helpful links and guides to get the most out of PsyTrack.
          </p>
        </header>

        {/* Quick links */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Quick links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {quickLinks.map((r) => (
              <Card key={r.title} {...r} />
            ))}
          </div>
        </section>

        {/* Guides */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Guides</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {guides.map((r) => (
              <Card key={r.title} {...r} />
            ))}
          </div>
        </section>

        {/* External tools */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">External tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {externals.map((r) => (
              <Card key={r.title} {...r} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">FAQs</h2>
          <div className="mt-4 space-y-3">
            <Faq q="How do I request a patient’s previous records?" a="Go to Patient Records → Request Previous Records, select the prior therapist, and submit a reason. A superAdmin may review the request." />
            <Faq q="Why can’t I log in as a therapist yet?" a="Therapist and receptionist accounts require superAdmin approval. You’ll see a message if approval is pending." />
            <Faq q="Why are my times off by a few hours?" a="We display time in your local timezone but send UTC to the server. Check your device’s timezone and the availability window." />
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, desc, href, external }: Resource) {
  const base =
    "group rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50 transition-colors";
  const inner =
    "flex items-start justify-between gap-3";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={base}>
      <div className={inner}>
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
        <span className="text-xs text-gray-500 group-hover:text-gray-700">↗</span>
      </div>
    </a>
  ) : (
    <Link href={href} className={base}>
      <div className={inner}>
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
        <span className="text-xs text-gray-400 group-hover:text-gray-700">›</span>
      </div>
    </Link>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-gray-100 bg-gray-50 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900">{q}</p>
          <span className="text-gray-400 group-open:rotate-90 transition-transform">›</span>
        </div>
      </summary>
      <p className="mt-2 text-sm text-gray-600">{a}</p>
    </details>
  );
}
