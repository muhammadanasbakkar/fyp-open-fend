// app/about/page.tsx
"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">About TheraKonnect</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            TheraKonnect helps clinics and independent therapists manage availability, appointments,
            and patient notes—securely and simply.
          </p>
        </header>

        {/* Mission */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Our mission</h2>
          <p className="mt-2 text-sm text-gray-600">
            We believe mental healthcare deserves modern, privacy-first tools. TheraKonnect streamlines admin
            tasks so clinicians can focus on care: booking, reminders, patient records, and inter-therapist
            sharing with superAdmin oversight.
          </p>
        </section>

        {/* Stats / Highlights */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { k: "99.9%", v: "Uptime" },
            { k: "AES-256", v: "At-rest Encryption" },
            { k: "Role-based", v: "Access Control" },
          ].map((item) => (
            <div
              key={item.k}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-2xl font-semibold text-[var(--brand,#4b7eff)]">{item.k}</div>
              <div className="mt-1 text-sm text-gray-600">{item.v}</div>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">How TheraKonnect helps</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="font-medium">Smart booking</p>
              <p className="mt-1 text-sm text-gray-600">
                Patients see real-time availability and book fixed-length slots.
              </p>
            </li>
            <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="font-medium">Therapist notes</p>
              <p className="mt-1 text-sm text-gray-600">
                Keep structured visit notes. Share upon request with superAdmin oversight.
              </p>
            </li>
            <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="font-medium">Security first</p>
              <p className="mt-1 text-sm text-gray-600">
                Role-based access, audit trails, and secure document storage.
              </p>
            </li>
            <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="font-medium">Clinic-ready</p>
              <p className="mt-1 text-sm text-gray-600">
                Reception workflows, therapist approvals, and admin dashboards.
              </p>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">Get started</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create an account or log in to manage appointments and records.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center rounded-md bg-[var(--brand,#4b7eff)] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Log in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
