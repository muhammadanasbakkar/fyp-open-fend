"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";

type Fees = { currency?: string; online?: number; inPerson?: number } | null;

type Therapist = {
  name: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  yearsExperience?: number;
  specializations?: string[];
  modalities?: string[];
  concerns?: string[];
  populations?: string[];
  careSettings?: string[];
  fees?: Fees;
};

type Clinic = {
  _id: string;
  hospitalId: string;
  name: string;
  city?: string;
  address?: string;
  room?: string;
  fee?: { currency?: string; amount?: number };
};

type NextAvail = { start: string; end: string } | null;

export default function TherapistProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [nextAvail, setNextAvail] = useState<NextAvail>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await publicApi<{ therapist: Therapist; clinics: Clinic[]; nextAvailability: NextAvail }>(
          `api/therapists/therapists/${id}`
        );
        setTherapist(data.therapist);
        setClinics(data.clinics || []);
        setNextAvail(data.nextAvailability || null);
      } catch (e:any) {
        setErr(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const feeSummary =
    therapist?.fees?.currency && (therapist?.fees?.online || therapist?.fees?.inPerson)
      ? `${therapist.fees.currency} ${therapist.fees.online ?? therapist.fees.inPerson} / session`
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {loading && <div className="h-24 rounded-xl border bg-gray-100 animate-pulse" />}
      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
      {therapist && (
        <>
          {/* Header */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
              src={process.env.NEXT_PUBLIC_CDN_BASE! + therapist.profilePicture || "/default-avatar.png"}
              alt={therapist.name}
              className="h-24 w-24 rounded-2xl object-cover ring-1 ring-gray-200"
              width={96}
              height={96}
              // unoptimized
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold">{therapist.name}</h1>
              <div className="mt-1 text-sm text-gray-600">
                {therapist.yearsExperience ? `${therapist.yearsExperience} years experience` : "Therapist"}
              </div>

              {!!therapist.specializations?.length && (
                <div className="mt-2 text-sm text-gray-700">
                  <b>Specializations:</b> {therapist.specializations.join(", ")}
                </div>
              )}

              {!!feeSummary && <div className="mt-2 text-sm font-medium text-gray-900">{feeSummary}</div>}

              {nextAvail && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-green-200">
                  Next available: {dayjs(nextAvail.start).format("ddd, MMM D, HH:mm")}
                </div>
              )}
            </div>

            <div className="ml-auto">
              <Link
                href={`/appointments/book?therapist=${id}`}
                className="inline-flex items-center rounded-lg bg-[var(--brand,#4b7eff)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                Book session
              </Link>
            </div>
          </div>

          {/* Bio & tags */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
              {therapist.bio && (
                <>
                  <h2 className="font-semibold">About</h2>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{therapist.bio}</p>
                </>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {!!therapist.modalities?.length && (
                  <TagBlock title="Modalities" items={therapist.modalities} />
                )}
                {!!therapist.concerns?.length && (
                  <TagBlock title="Concerns" items={therapist.concerns} />
                )}
                {!!therapist.populations?.length && (
                  <TagBlock title="Populations" items={therapist.populations} />
                )}
                {!!therapist.careSettings?.length && (
                  <TagBlock title="Care settings" items={therapist.careSettings} />
                )}
              </div>
            </div>

            {/* Clinics & fees */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Clinics & in-person fees</h2>
              {!clinics.length ? (
                <p className="mt-2 text-sm text-gray-600">No clinics listed.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {clinics.map((c) => (
                    <li key={c._id} className="rounded-lg border p-3">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-gray-600">
                        {[c.city, c.address].filter(Boolean).join(" • ")}
                      </div>
                      {c.room && <div className="text-xs text-gray-500">Room: {c.room}</div>}
                      <div className="mt-1 text-sm font-medium">
                        {c.fee?.currency && c.fee?.amount != null
                          ? `${c.fee.currency} ${c.fee.amount} / session`
                          : therapist?.fees?.inPerson
                          ? `${therapist.fees.currency || "PKR"} ${therapist.fees.inPerson} / session`
                          : "Fee on request"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4">
                <Link
                  href={`/appointments/book?therapist=${id}`}
                  className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Book in-person
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TagBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 flex flex-wrap gap-2">
        {items.map((x) => (
          <span key={x} className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}
