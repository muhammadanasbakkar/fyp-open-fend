// "use client";
// import Protected from "@/components/Protected";
// import { useEffect, useState } from "react";
// import { api, authHeader } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import Link from "next/link";

// export default function MyAppointmentsPage() {
//   return (
//     <Protected>
//       <List />
//     </Protected>
//   );
// }

// function List() {
//   const { token } = useAuth();
//   const [data, setData] = useState<any[]>([]);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(false);  // To handle the loading state for updates

//   const { user } = useAuth();
//   const role = user?.role;

//   // Fetch appointments when the component mounts
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api("/appointments/my", { headers: authHeader(token || undefined) });
//         setData(res); // Set the fetched data to the state
//       } catch (e: any) {
//         setErr(e.message);  // Set error message if there's any issue fetching the data
//       }
//     })();
//   }, [token]);

//   // Function to handle status update (Confirm or Cancel)
//   const updateAppointmentStatus = async (appointmentId: string, status: string) => {
//     setLoading(true);  // Set loading state to true when updating
//     try {
//       const response = await api(`/appointments/${appointmentId}/confirm`, {
//         method: "PATCH",
//         headers: authHeader(token || undefined),
//         body: JSON.stringify({ status }),
//       });

//       // Update the data in the UI after confirmation/cancellation
//       setData((prevData) =>
//         prevData.map((appointment) =>
//           appointment._id === appointmentId ? { ...appointment, status: response.status } : appointment
//         )
//       );
//       setLoading(false);  // Set loading state to false after the update is done
//     } catch (error: any) {
//       setErr("Error updating appointment status");
//       setLoading(false);  // Set loading state to false in case of error
//     }
//   };

//   return (
//     <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
//       <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>
//       {err && <p className="text-sm text-red-600">{err}</p>}

//       {/* Loading State */}
//       {loading && <p className="text-sm text-blue-600">Updating appointment...</p>}

//       <div className="space-y-3">
//         {data.map((a) => (
//           <div key={a._id} className="rounded-lg border p-4">
//             <div className="flex items-center justify-between">
//               <p className="font-medium">{new Date(a.start).toLocaleString()} → {new Date(a.end).toLocaleTimeString()}</p>
//               <span className="text-xs rounded px-2 py-1 bg-gray-100">{a.status}</span>
//               {role === "therapist" && a.patient && (
//                 <Link
//                   href={`/patient-records/${a.patient?._id || a.patient}`}
//                   className="text-xs rounded px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
//                   title="Open patient records"
//                 >
//                   Notes
//                 </Link>
//               )}
//             </div>
//             <p className="text-sm text-gray-600 mt-1">Therapist: {a.therapist?.name || a.therapist}</p>
//             <p className="text-sm text-gray-600">Patient: {a.patient?.name || a.patient}</p>

//             {/* Show Confirm and Cancel buttons only for "pending" appointments */}
//             {a.status === "pending" && (
//               <div className="flex gap-2 mt-3">
//                 <button
//                   onClick={() => updateAppointmentStatus(a._id, "confirmed")}
//                   className="bg-green-500 text-white px-4 py-2 rounded"
//                 >
//                   Confirm
//                 </button>
//                 <button
//                   onClick={() => updateAppointmentStatus(a._id, "cancelled")}
//                   className="bg-red-500 text-white px-4 py-2 rounded"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//         {!data.length && <p className="text-sm text-gray-500">No appointments yet.</p>}
//       </div>
//     </div>
//   );
// }

// app/appointments/my/page.tsx
"use client";
import Protected from "@/components/Protected";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Appt = {
  _id: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | string;
  therapist?: { _id: string; name: string } | string;
  patient?: { _id: string; name: string } | string;
  createdAt?: string;
};

export default function MyAppointmentsPage() {
  return (
    <Protected>
      <List />
    </Protected>
  );
}

function fmt(dt: string | Date) {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtTime(dt: string | Date) {
  const d = new Date(dt);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Appt["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    confirmed: "bg-green-50 text-green-700 ring-1 ring-green-200",
    cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
    completed: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };
  const klass = map[status] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${klass}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function List() {
  const { token, user } = useAuth();
  const role = user?.role;
  const [data, setData] = useState<Appt[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [q, setQ] = useState(""); // simple local search by therapist/patient name

  async function load() {
    setErr("");
    setMsg("");
    setLoadingList(true);
    try {
      const res = await api("api/appointments/my", {
        headers: authHeader(token || undefined),
      });
      setData(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setErr(e.message || "Failed to load appointments.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Confirm / Cancel helpers
  async function confirmAppt(id: string) {
    setErr("");
    setMsg("");
    setActingId(id);
    try {
      const res = await api(`api/appointments/${id}/confirm`, {
        method: "PATCH",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        },
      });
      // reflect new status in UI
      setData((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: res.status || "confirmed" } : a
        )
      );
      setMsg("Appointment confirmed.");
    } catch (e: any) {
      setErr(e.message || "Could not confirm appointment.");
    } finally {
      setActingId(null);
    }
  }

  async function cancelAppt(id: string) {
    setErr("");
    setMsg("");
    if (!confirm("Cancel this appointment?")) return;
    setActingId(id);
    try {
      // Prefer a dedicated cancel route if you have it; otherwise fall back to status patch
      let res;
      try {
        res = await api(`/appointments/${id}/cancel`, {
          method: "PATCH",
          headers: {
            ...authHeader(token || undefined),
            "Content-Type": "application/json",
          },
        });
      } catch {
        res = await api(`/appointments/${id}/confirm`, {
          method: "PATCH",
          headers: {
            ...authHeader(token || undefined),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        });
      }
      setData((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: res.status || "cancelled" } : a
        )
      );
      setMsg("Appointment cancelled.");
    } catch (e: any) {
      setErr(e.message || "Could not cancel appointment.");
    } finally {
      setActingId(null);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((a) => {
      const t =
        typeof a.therapist === "string" ? a.therapist : a.therapist?.name || "";
      const p =
        typeof a.patient === "string" ? a.patient : a.patient?.name || "";
      return t.toLowerCase().includes(term) || p.toLowerCase().includes(term);
    });
  }, [q, data]);

  // Sort by start time ascending (soonest first)
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => +new Date(a.start) - +new Date(b.start)),
    [filtered]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My appointments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage upcoming and past sessions.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search by therapist or patient"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Alerts */}
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Loading skeleton */}
      {loadingList && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="h-4 w-52 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-72 rounded bg-gray-200" />
              <div className="mt-3 h-8 w-40 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loadingList && !sorted.length && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
          No appointments yet.
        </div>
      )}

      {/* List */}
      {!loadingList && !!sorted.length && (
        <div className="space-y-3">
          {sorted.map((a) => {
            const isPending = a.status === "pending";
            const isActing = actingId === a._id;

            const therapistName =
              typeof a.therapist === "string" ? a.therapist : a.therapist?.name;
            const patientName =
              typeof a.patient === "string" ? a.patient : a.patient?.name;

            return (
              <div
                key={a._id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {fmt(a.start)} <span className="text-gray-400">→</span>{" "}
                      {fmtTime(a.end)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Therapist:{" "}
                      <span className="font-medium text-gray-800">
                        {therapistName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Patient:{" "}
                      <span className="font-medium text-gray-800">
                        {patientName}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    {role === "therapist" && a.patient && (
                      <Link
                        href={`/patient-records/${
                          (a.patient as any)?._id || a.patient
                        }`}
                        className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100"
                        title="Open patient records"
                        prefetch={false}
                      >
                        Notes
                      </Link>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => confirmAppt(a._id)}
                      disabled={isActing}
                    >
                      {isActing ? "Working…" : "Confirm"}
                    </Button>
                    <button
                      onClick={() => cancelAppt(a._id)}
                      disabled={isActing}
                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
