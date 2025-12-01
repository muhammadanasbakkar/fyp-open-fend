// // "use client";

// // import { useEffect, useState } from "react";
// // import { api, authHeader } from "@/lib/api";
// // import { useAuth } from "@/lib/auth";
// // import Protected from "@/components/Protected";
// // import Image from "next/image";
// // import Button from "@/components/Button";
// // import Link from "next/link";

// // export default function ReceptionistBookingPage() {
// //   const { token } = useAuth();
// //   const [therapists, setTherapists] = useState<any[]>([]);
// //   const [err, setErr] = useState("");
// //   console.log(therapists, "therapists");
// //   useEffect(() => {
// //     if (!token) return;

// //     async function fetchTherapists() {
// //       try {
// //         const res = await api("api/therapists/available", {
// //           headers: authHeader(token || undefined) as HeadersInit,
// //         });
// //         setTherapists(res?.items || []);
// //       } catch (e: any) {
// //         setErr(e.message);
// //       }
// //     }

// //     fetchTherapists();
// //   }, [token]);

// //   return (
// //     <Protected>
// //       <div className="max-w-4xl mx-auto p-6">
// //         <h1 className="text-2xl font-semibold mb-6">Available Therapists</h1>
// //         {err && <p className="text-red-500 text-sm">{err}</p>}
// //         <div className="grid sm:grid-cols-2 gap-6">
// //           {therapists?.map((t) => (
// //             <div
// //               key={t?.therapistId}
// //               className="border rounded-lg p-4 bg-white shadow-sm flex flex-col items-center text-center"
// //             >
// //               <Image
// //                 src={
// //                   process.env.NEXT_PUBLIC_CDN_BASE! + t.profilePicture ||
// //                   "/default-avatar.png"
// //                 }
// //                 alt={t.name}
// //                 width={80}
// //                 height={80}
// //                 className="rounded-full"
// //               />
// //               <h3 className="font-semibold text-lg mt-2">{t.name}</h3>
// //               <p className="text-sm text-gray-600">{t.email}</p>
// //               <p className="text-sm text-gray-600">
// //                 {t.specialization || "General Therapist"}
// //               </p>
// //               {/* Optional availability or action */}
// //               <Link
// //                 href={{
// //                   pathname: "/appointments/book",
// //                   query: { therapistId: t.therapistId },
// //                 }}
// //                 className="mt-3"
// //               >
// //                 <Button>Book Appointment</Button>
// //               </Link>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </Protected>
// //   );
// // }


// "use client";

// import { useEffect, useState } from "react";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import Protected from "@/components/Protected";
// import Image from "next/image";
// import Button from "@/components/Button";
// import Link from "next/link";

// type Therapist = {
//   therapistId: string;
//   name: string;
//   email: string;
//   profilePicture?: string;
//   specialization?: string;
// };

// export default function ReceptionistBookingPage() {
//   const { token } = useAuth();
//   const [therapists, setTherapists] = useState<Therapist[]>([]);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!token) return;

//     async function fetchTherapists() {
//       try {
//         setLoading(true);
//         setErr("");
//         const res = await api("api/therapists/available", {
//           headers: authHeader(token || undefined) as HeadersInit,
//         });
//         setTherapists(res?.items || []);
//       } catch (e: any) {
//         setErr(e.message || "Failed to load therapists");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTherapists();
//   }, [token]);

//   return (
//     <Protected>
//       <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 to-slate-100">
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
//           {/* Header */}
//           <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
//                 Book a Therapist
//               </h1>
//               <p className="mt-1 text-sm text-slate-600">
//                 Choose a therapist and continue to appointment booking.
//               </p>
//             </div>
//           </div>

//           {/* Error */}
//           {err && (
//             <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {err}
//             </div>
//           )}

//           {/* Loading */}
//           {loading && (
//             <div className="grid gap-4 sm:grid-cols-2">
//               {[0, 1, 2, 3].map((i) => (
//                 <div
//                   key={i}
//                   className="h-44 rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse"
//                 />
//               ))}
//             </div>
//           )}

//           {/* Content */}
//           {!loading && therapists.length === 0 && !err && (
//             <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-600">
//               <p className="font-medium text-slate-800">
//                 No therapists available right now
//               </p>
//               <p className="mt-1 text-xs text-slate-500">
//                 Once therapists add their availability, they will appear here
//                 for booking.
//               </p>
//             </div>
//           )}

//           {!loading && therapists.length > 0 && (
//             <div className="grid gap-6 sm:grid-cols-2">
//               {therapists.map((t) => {
//                 const src =
//                   (process.env.NEXT_PUBLIC_CDN_BASE || "") + (t.profilePicture || "");
//                 const imageSrc =
//                   t.profilePicture && process.env.NEXT_PUBLIC_CDN_BASE
//                     ? src
//                     : "/default-avatar.png";

//                 return (
//                   <div
//                     key={t.therapistId}
//                     className="group flex flex-col rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
//                         <Image
//                           src={imageSrc}
//                           alt={t.name}
//                           width={56}
//                           height={56}
//                           className="h-full w-full object-cover"
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex flex-wrap items-center gap-1.5">
//                           <h3 className="text-sm font-semibold text-slate-900">
//                             {t.name}
//                           </h3>
//                           <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
//                             {t.specialization || "Therapist"}
//                           </span>
//                         </div>
//                         <p className="mt-1 text-xs text-slate-500">
//                           {t.email}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="mt-4 flex items-center justify-between gap-3">
//                       <div className="text-xs text-slate-500">
//                         <p>Click below to see available slots.</p>
//                       </div>
//                       <Link
//                         href={{
//                           pathname: "/appointments/book",
//                           query: { therapistId: t.therapistId },
//                         }}
//                         className="w-auto"
//                       >
//                         <Button
//                           className="rounded-xl bg-[var(--brand,#2563eb)] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
//                         >
//                           Book appointment
//                         </Button>
//                       </Link>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </Protected>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import Button from "./Button";
import Input from "./Input";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Therapist = {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
  therapistInfo?: {
    specializations?: string[];
  };
};

type Slot = {
  _id: string;
  therapist: string;
  hospital: string;
  start: string; // ISO string
  end: string;   // ISO string
};

type GroupedSlots = {
  dateLabel: string;
  dateKey: string;
  items: Slot[];
};

export default function ReceptionistBookingPage() {
  const { user } = useAuth() as { user: any };
  const [token, setToken] = useState("");

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [therapistError, setTherapistError] = useState("");

  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [patientId, setPatientId] = useState("");
  const [reason, setReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Load token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token") || "";
      setToken(stored);
    }
  }, []);

  // Load therapists for this receptionist (same hospital(s))
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setTherapistError("");
        setLoadingTherapists(true);

        const res = await fetch(`${API}api/receptionist/therapists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.msg || "Failed to load therapists");

        setTherapists(data.therapists || []);

        // If only one therapist, auto-select
        if ((data.therapists || []).length === 1) {
          setSelectedTherapistId(data.therapists[0]._id);
        }
      } catch (e: any) {
        setTherapistError(e.message || "Something went wrong");
      } finally {
        setLoadingTherapists(false);
      }
    })();
  }, [token]);

  // Load free slots whenever therapist changes
  useEffect(() => {
    if (!token || !selectedTherapistId) {
      setSlots([]);
      return;
    }

    (async () => {
      try {
        setSlotsError("");
        setLoadingSlots(true);

        // Next 7 days
        const from = new Date();
        const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

        const params = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
        });

        const res = await fetch(
          `${API}api/receptionist/therapists/${selectedTherapistId}/free-slots?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data?.msg || "Failed to load slots");

        setSlots(data.slots || []);
      } catch (e: any) {
        setSlotsError(e.message || "Something went wrong");
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [token, selectedTherapistId]);

  // Group slots by date for nicer UI
  const groupedSlots: GroupedSlots[] = useMemo(() => {
    const byDate: Record<string, Slot[]> = {};
    for (const s of slots) {
      const d = new Date(s.start);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(s);
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, items]) => {
        const d = new Date(key);
        const label = d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        items.sort((a, b) => (a.start < b.start ? -1 : 1));
        return { dateKey: key, dateLabel: label, items };
      });
  }, [slots]);

  async function handleBook(slot: Slot) {
    setBookingError("");
    setBookingMessage("");

    if (!patientId.trim()) {
      setBookingError(
        "Please enter a valid Patient ID. Register the patient first if needed."
      );
      return;
    }

    try {
      setBookingLoading(true);

      const res = await fetch(`${API}api/receptionist/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          availabilityId: slot._id,
          therapistId: slot.therapist,
          patientId: patientId.trim(),
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to book slot");

      setBookingMessage("Slot booked successfully.");
      // Remove booked slot from UI
      setSlots((prev) => prev.filter((s) => s._id !== slot._id));
      setReason("");
    } catch (e: any) {
      setBookingError(e.message || "Something went wrong");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top section: title + therapist select */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Book therapist slots</h2>
          <p className="mt-1 text-sm text-gray-600">
            Select a therapist from your hospital and book an available slot
            for a registered patient.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Note: For walk-in patients, please register them as a patient first
            and then use their Patient ID here.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Therapist
          </label>
          <select
            value={selectedTherapistId}
            onChange={(e) => setSelectedTherapistId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-1 focus:ring-[var(--brand,#4b7eff)]"
          >
            <option value="">
              {loadingTherapists
                ? "Loading therapists..."
                : "Select therapist"}
            </option>
            {therapists.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
                {t.therapistInfo?.specializations?.length
                  ? ` (${t.therapistInfo.specializations.join(", ")})`
                  : ""}
              </option>
            ))}
          </select>
          {therapistError && (
            <p className="text-xs text-red-600">{therapistError}</p>
          )}
        </div>
      </div>

      {/* Patient info panel (patient must already be registered) */}
      <div className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Patient ID (MR / System ID)
          </label>
          <Input
            placeholder="Enter patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Use the ID shown after patient registration.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Reason / notes (optional)
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-1 focus:ring-[var(--brand,#4b7eff)]"
            rows={3}
            placeholder="Short reason for visit (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      {/* Slots list */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Available slots (next 7 days)
          </h3>
          {loadingSlots && (
            <span className="text-xs text-gray-500">Loading slots…</span>
          )}
        </div>

        {slotsError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {slotsError}
          </div>
        )}

        {!loadingSlots && !groupedSlots.length && (
          <p className="text-sm text-gray-500">
            No free slots found for this therapist in the next 7 days.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {groupedSlots.map((group) => (
            <div
              key={group.dateKey}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-800">
                  {group.dateLabel}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-gray-500">
                  {group.items.length} slot
                  {group.items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((slot) => {
                  const start = new Date(slot.start);
                  const end = new Date(slot.end);
                  const label = `${start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} – ${end.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`;

                  return (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => handleBook(slot)}
                      disabled={bookingLoading}
                      className="rounded-full border border-[var(--brand,#4b7eff)]/40 bg-white px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)] shadow-sm hover:bg-[var(--brand,#4b7eff)]/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {(bookingMessage || bookingError) && (
          <div className="mt-4 text-xs">
            {bookingMessage && (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700">
                {bookingMessage}
              </p>
            )}
            {bookingError && (
              <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                {bookingError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
