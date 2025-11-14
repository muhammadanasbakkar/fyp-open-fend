// "use client";

// import { useEffect, useState } from "react";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import Protected from "@/components/Protected";
// import Image from "next/image";
// import Button from "@/components/Button";
// import Link from "next/link";

// export default function ReceptionistBookingPage() {
//   const { token } = useAuth();
//   const [therapists, setTherapists] = useState<any[]>([]);
//   const [err, setErr] = useState("");
//   console.log(therapists, "therapists");
//   useEffect(() => {
//     if (!token) return;

//     async function fetchTherapists() {
//       try {
//         const res = await api("api/therapists/available", {
//           headers: authHeader(token || undefined) as HeadersInit,
//         });
//         setTherapists(res?.items || []);
//       } catch (e: any) {
//         setErr(e.message);
//       }
//     }

//     fetchTherapists();
//   }, [token]);

//   return (
//     <Protected>
//       <div className="max-w-4xl mx-auto p-6">
//         <h1 className="text-2xl font-semibold mb-6">Available Therapists</h1>
//         {err && <p className="text-red-500 text-sm">{err}</p>}
//         <div className="grid sm:grid-cols-2 gap-6">
//           {therapists?.map((t) => (
//             <div
//               key={t?.therapistId}
//               className="border rounded-lg p-4 bg-white shadow-sm flex flex-col items-center text-center"
//             >
//               <Image
//                 src={
//                   process.env.NEXT_PUBLIC_CDN_BASE! + t.profilePicture ||
//                   "/default-avatar.png"
//                 }
//                 alt={t.name}
//                 width={80}
//                 height={80}
//                 className="rounded-full"
//               />
//               <h3 className="font-semibold text-lg mt-2">{t.name}</h3>
//               <p className="text-sm text-gray-600">{t.email}</p>
//               <p className="text-sm text-gray-600">
//                 {t.specialization || "General Therapist"}
//               </p>
//               {/* Optional availability or action */}
//               <Link
//                 href={{
//                   pathname: "/appointments/book",
//                   query: { therapistId: t.therapistId },
//                 }}
//                 className="mt-3"
//               >
//                 <Button>Book Appointment</Button>
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Protected>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Protected from "@/components/Protected";
import Image from "next/image";
import Button from "@/components/Button";
import Link from "next/link";

type Therapist = {
  therapistId: string;
  name: string;
  email: string;
  profilePicture?: string;
  specialization?: string;
};

export default function ReceptionistBookingPage() {
  const { token } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchTherapists() {
      try {
        setLoading(true);
        setErr("");
        const res = await api("api/therapists/available", {
          headers: authHeader(token || undefined) as HeadersInit,
        });
        setTherapists(res?.items || []);
      } catch (e: any) {
        setErr(e.message || "Failed to load therapists");
      } finally {
        setLoading(false);
      }
    }

    fetchTherapists();
  }, [token]);

  return (
    <Protected>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Book a Therapist
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Choose a therapist and continue to appointment booking.
              </p>
            </div>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Content */}
          {!loading && therapists.length === 0 && !err && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                No therapists available right now
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Once therapists add their availability, they will appear here
                for booking.
              </p>
            </div>
          )}

          {!loading && therapists.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {therapists.map((t) => {
                const src =
                  (process.env.NEXT_PUBLIC_CDN_BASE || "") + (t.profilePicture || "");
                const imageSrc =
                  t.profilePicture && process.env.NEXT_PUBLIC_CDN_BASE
                    ? src
                    : "/default-avatar.png";

                return (
                  <div
                    key={t.therapistId}
                    className="group flex flex-col rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                        <Image
                          src={imageSrc}
                          alt={t.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {t.name}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                            {t.specialization || "Therapist"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {t.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        <p>Click below to see available slots.</p>
                      </div>
                      <Link
                        href={{
                          pathname: "/appointments/book",
                          query: { therapistId: t.therapistId },
                        }}
                        className="w-auto"
                      >
                        <Button
                          className="rounded-xl bg-[var(--brand,#2563eb)] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                          Book appointment
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
