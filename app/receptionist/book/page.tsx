"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Protected from "@/components/Protected";
import Image from "next/image";
import Button from "@/components/Button";
import Link from "next/link";

export default function ReceptionistBookingPage() {
  const { token } = useAuth();
  const [therapists, setTherapists] = useState<any[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;

    async function fetchTherapists() {
      try {
        const res = await api("/patient-records/therapists/available", {
          headers: authHeader(token || undefined) as HeadersInit,
        } );
        setTherapists(res);
      } catch (e: any) {
        setErr(e.message);
      }
    }

    fetchTherapists();
  }, [token]);

  return (
    <Protected>
      <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
              Receptionist
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">Book on behalf of patient</h1>
            <p className="mt-1 text-sm text-gray-500">Select a therapist to book an appointment for a walk-in patient.</p>
          </div>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
          )}

          {therapists.length === 0 && !err && (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4b7eff]" />
              <p className="mt-3 text-sm text-gray-500">Loading available therapists…</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            {therapists.map((t) => (
              <div
                key={t._id}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col items-center text-center"
              >
                <div className="relative">
                  <Image
                    src={t.profilePicture || "/default-avatar.png"}
                    alt={t.name}
                    width={72}
                    height={72}
                    className="rounded-2xl object-cover ring-2 ring-gray-100"
                  />
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{t.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t.email}</p>
                <span className="mt-2 inline-flex items-center rounded-full bg-[#4b7eff]/8 px-2.5 py-0.5 text-xs font-medium text-[#4b7eff]">
                  {t.specialization || "General Therapist"}
                </span>
                <Link
                  className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition-all"
                  href={`/appointments/book?therapistId=${t._id}`}
                >
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Protected>
  );
}
