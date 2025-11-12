// app/appointments/pending/page.tsx
export default function PendingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Request submitted</h1>
      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        Your appointment request has been <b>lodged</b>. The therapist will review and approve it.
        You’ll be notified once your appointment is confirmed.
      </div>
      <p className="mt-6 text-sm text-gray-600">
        Tip: You can close this page — we’ll email you when there’s an update.
      </p>
    </div>
  );
}
