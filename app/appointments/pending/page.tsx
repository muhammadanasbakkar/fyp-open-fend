// app/appointments/pending/page.tsx
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Request submitted!</h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Your appointment request has been <span className="font-medium text-gray-800">lodged successfully</span>.
            The therapist will review and approve it — you&apos;ll receive an email once it&apos;s confirmed.
          </p>

          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            You can close this page — we&apos;ll email you when there&apos;s an update.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/appointments/my"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:brightness-95 transition-all"
            >
              View my appointments
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Appointments are typically confirmed within a few hours.
        </p>
      </div>
    </div>
  );
}
