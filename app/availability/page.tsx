// // app/availability/page.tsx
// "use client";
// import Protected from "@/components/Protected";
// import RoleGuard from "@/components/RoleGuard";
// import Input from "@/components/Input";
// import Button from "@/components/Button";
// import { useAuth } from "@/lib/auth";
// import { api, authHeader } from "@/lib/api";
// import { useEffect, useMemo, useState } from "react";

// // --- dayjs ---
// import dayjs from "dayjs";
// import localizedFormat from "dayjs/plugin/localizedFormat"; // optional (LLL etc.)
// dayjs.extend(localizedFormat);

// // Helpers for <input type="datetime-local">
// const INPUT_FMT = "YYYY-MM-DDTHH:mm"; // value format for datetime-local
// const DISPLAY_FMT = "ddd, MMM DD, YYYY hh:mm A"; // human-readable

// export default function AvailabilityPage() {
//   return (
//     <Protected>
//       <RoleGuard roles={["therapist"]}>
//         <Inner />
//       </RoleGuard>
//     </Protected>
//   );
// }

// function fmtLocal(dt: string | Date) {
//   return dayjs(dt).format(DISPLAY_FMT);
// }

// function groupByDate(list: any[]) {
//   const out: Record<string, any[]> = {};
//   for (const s of list) {
//     const key = dayjs(s.start).format("YYYY-MM-DD");
//     (out[key] ||= []).push(s);
//   }
//   // sort each day by start
//   Object.values(out).forEach((arr) =>
//     arr.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
//   );
//   return out;
// }

// function Inner() {
//   const { token } = useAuth();

//   // Defaults: now and +2h in user's local time
//   const [start, setStart] = useState(dayjs().format(INPUT_FMT));
//   const [end, setEnd] = useState(dayjs().add(2, "hour").format(INPUT_FMT));

//   const [list, setList] = useState<any[]>([]);
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);
//   const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

//   const grouped = useMemo(() => groupByDate(list), [list]);

//   function setQuick(minutes: number) {
//     const s = dayjs(start);
//     setEnd(s.add(minutes, "minute").format(INPUT_FMT));
//   }

//   async function createSlot() {
//     setErr("");
//     setMsg("");
//     setLoading(true);

//     try {
//       const s = dayjs(start);
//       const e = dayjs(end);

//       if (!s.isValid() || !e.isValid()) throw new Error("Please choose valid dates.");
//       if (!e.isAfter(s)) throw new Error("End must be after start.");

//       const minutes = e.diff(s, "minute");
//       if (minutes < 15) throw new Error("Minimum length is 15 minutes.");

//       // send ISO strings so backend gets precise timestamps
//       await api("api/availability", {
//         method: "POST",
//         headers: authHeader(token || undefined),
//         body: JSON.stringify({ start: s.toISOString(), end: e.toISOString() }),
//       });

//       setMsg("Availability added.");
//       await load();
//     } catch (e: any) {
//       setErr(e.message || "Could not add availability.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function remove(id: string) {
//     setErr("");
//     setMsg("");
//     const ok = confirm("Delete this availability window?");
//     if (!ok) return;
//     try {
//       await api(`/availability/${id}`, {
//         method: "DELETE",
//         headers: authHeader(token || undefined),
//       });
//       setMsg("Deleted.");
//       await load();
//     } catch (e: any) {
//       setErr(e.message || "Could not delete.");
//     }
//   }

//   async function load() {
//     try {
//       const res = await api("api/availability/me", {
//         headers: authHeader(token || undefined),
//       });
//       setList(res || []);
//     } catch (e: any) {
//       setErr(e.message || "Failed to load availability.");
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   return (
//     <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">My Availability</h1>
//           <p className="mt-1 text-sm text-gray-600">
//             Times shown in <span className="font-medium">{tz}</span>.
//           </p>
//         </div>
//       </div>

//       {/* Creator Card */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="text-sm font-medium text-gray-900">Add a time window</p>
//         <p className="mb-4 text-xs text-gray-600">
//           Patients can book within these windows when you’re free.
//         </p>

//         <div className="grid gap-4 sm:grid-cols-3">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Start</label>
//             <Input
//               type="datetime-local"
//               value={start}
//               onChange={(e) => setStart(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">End</label>
//             <Input
//               type="datetime-local"
//               value={end}
//               onChange={(e) => setEnd(e.target.value)}
//             />
//           </div>
//           <div className="self-end">
//             <Button onClick={createSlot} disabled={loading}>
//               {loading ? "Adding…" : "Add"}
//             </Button>
//           </div>
//         </div>

//         {/* Quick durations */}
//         <div className="mt-3 flex flex-wrap gap-2">
//           <span className="text-xs text-gray-500 self-center">Quick duration:</span>
//           {[30, 45, 60, 90, 120].map((m) => (
//             <button
//               key={m}
//               type="button"
//               onClick={() => setQuick(m)}
//               className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs hover:bg-gray-50"
//               title={`Set end to ${m} minutes after start`}
//             >
//               {m} min
//             </button>
//           ))}
//         </div>

//         {/* Feedback */}
//         {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
//         {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
//       </div>

//       {/* List Card */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <div className="mb-3 flex items-center justify-between">
//           <p className="text-sm font-medium text-gray-900">Your windows</p>
//           <p className="text-xs text-gray-500">
//             {list.length ? `${list.length} total` : "None yet"}
//           </p>
//         </div>

//         {list.length ? (
//           <div className="space-y-5">
//             {Object.entries(grouped).map(([dayKey, items]) => {
//               const dayHeader = dayjs(dayKey).format("dddd, MMM D, YYYY");
//               return (
//                 <div key={dayKey} className="space-y-2">
//                   <div className="text-xs font-semibold text-gray-500">{dayHeader}</div>
//                   <div className="space-y-2">
//                     {items.map((s: any) => (
//                       <div
//                         key={s._id}
//                         className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
//                       >
//                         <p className="text-sm">
//                           {fmtLocal(s.start)} <span className="text-gray-400">→</span>{" "}
//                           {fmtLocal(s.end)}
//                         </p>
//                         <button
//                           onClick={() => remove(s._id)}
//                           className="text-sm text-red-600 hover:underline"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">No availability yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// // app/availability/page.tsx
// "use client";
// import Protected from "@/components/Protected";
// import RoleGuard from "@/components/RoleGuard";
// import Input from "@/components/Input";
// import Button from "@/components/Button";
// import { useAuth } from "@/lib/auth";
// import { api, authHeader } from "@/lib/api";
// import { useEffect, useMemo, useState } from "react";

// // --- dayjs ---
// import dayjs from "dayjs";
// import localizedFormat from "dayjs/plugin/localizedFormat"; // optional (LLL etc.)
// dayjs.extend(localizedFormat);

// // Helpers for <input type="datetime-local">
// const INPUT_FMT = "YYYY-MM-DDTHH:mm"; // value format for datetime-local
// const DISPLAY_FMT = "ddd, MMM DD, YYYY hh:mm A"; // human-readable

// type Hospital = {
//   // hospitals?: {
//   _id: string;
//   name: string;
//   // }[];
//   // add other fields if your API returns them
// };

// type AvailabilityItem = {
//   _id: string;
//   start: string;
//   end: string;
//   hospitalId?: string | null;
//   hospital?: { _id: string; name: string } | null; // if API expands it
// };

// export default function AvailabilityPage() {
//   return (
//     <Protected>
//       <RoleGuard roles={["therapist"]}>
//         <Inner />
//       </RoleGuard>
//     </Protected>
//   );
// }

// function fmtLocal(dt: string | Date) {
//   return dayjs(dt).format(DISPLAY_FMT);
// }

// function groupByDate(list: AvailabilityItem[]) {
//   const out: Record<string, AvailabilityItem[]> = {};
//   for (const s of list) {
//     const key = dayjs(s.start).format("YYYY-MM-DD");
//     (out[key] ||= []).push(s);
//   }
//   // sort each day by start
//   Object.values(out).forEach((arr) =>
//     arr.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
//   );
//   return out;
// }

// function Inner() {
//   const { token } = useAuth();

//   console.log("AvailabilityPage Inner render, token:", token);
//   // Defaults: now and +2h in user's local time
//   const [start, setStart] = useState(dayjs().format(INPUT_FMT));
//   const [end, setEnd] = useState(dayjs().add(2, "hour").format(INPUT_FMT));

//   const [list, setList] = useState<AvailabilityItem[]>([]);
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Hospitals
//   const [hospitals, setHospitals] = useState<any[]>([]);
//   const [hospitalId, setHospitalId] = useState<string>(""); // selected
//   const [hospitalsLoading, setHospitalsLoading] = useState(false);
//   const [hospitalsErr, setHospitalsErr] = useState("");

//   const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

//   const grouped = useMemo(() => groupByDate(list), [list]);

//   // quick duration helper
//   function setQuick(minutes: number) {
//     const s = dayjs(start);
//     setEnd(s.add(minutes, "minute").format(INPUT_FMT));
//   }

//   async function createSlot() {
//     setErr("");
//     setMsg("");
//     setLoading(true);

//     try {
//       const s = dayjs(start);
//       const e = dayjs(end);

//       if (!s.isValid() || !e.isValid())
//         throw new Error("Please choose valid dates.");
//       if (!e.isAfter(s)) throw new Error("End must be after start.");

//       const minutes = e.diff(s, "minute");
//       if (minutes < 15) throw new Error("Minimum length is 15 minutes.");

//       if (!hospitalId) throw new Error("Please select a hospital/clinic.");
//       if (!token) throw new Error("Session expired. Please log in again.");

//       await api("api/availability", {
//         method: "POST",
//         headers: {
//           ...(authHeader(token) as HeadersInit), // Authorization: Bearer ...
//           "Content-Type": "application/json", // 🔥 important
//         },
//         body: JSON.stringify({
//           start: s.toISOString(),
//           end: e.toISOString(),
//           hospital: hospitalId, // your controller accepts hospitalId OR hospital
//         }),
//       });

//       setMsg("Availability added.");
//       await loadAvailability();
//     } catch (e: any) {
//       setErr(e.message || "Could not add availability.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function remove(id: string) {
//     setErr("");
//     setMsg("");
//     const ok = confirm("Delete this availability window?");
//     if (!ok) return;
//     try {
//       await api(`/availability/${id}`, {
//         method: "DELETE",
//         headers: authHeader(token || undefined) as HeadersInit,
//       });
//       setMsg("Deleted.");
//       await loadAvailability();
//     } catch (e: any) {
//       setErr(e.message || "Could not delete.");
//     }
//   }

//   async function loadAvailability() {
//     try {
//       const res = await api("api/availability/me", {
//         headers: authHeader(token || undefined) as HeadersInit,
//       });
//       setList((res || []) as AvailabilityItem[]);
//     } catch (e: any) {
//       setErr(e.message || "Failed to load availability.");
//     }
//   }

//   async function loadHospitals() {
//     setHospitalsErr("");
//     setHospitalsLoading(true);
//     try {
//       // Adjust this endpoint if your API differs (e.g., 'api/hospitals/me')
//       const res = await api("api/public/hospitals", {
//         headers: authHeader(token || undefined) as HeadersInit,
//       });
//       const arr = (res?.hospitals || []) as Hospital[];
//       // console.log("Loaded hospitals:", arr);
//       setHospitals(arr);
//       // If nothing selected yet, pick first hospital by default
//       if (!hospitalId && arr.length) setHospitalId(arr[0]?._id);
//     } catch (e: any) {
//       setHospitalsErr(e.message || "Failed to load hospitals.");
//     } finally {
//       setHospitalsLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadAvailability();
//     loadHospitals();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   // convenience map for displaying hospital names on items
//   const hospitalNameById = useMemo(() => {
//     const m: Record<string, string> = {};
//     hospitals?.forEach((h) => (m[h?._id] = h?.name));
//     return m;
//   }, [hospitals]);

//   return (
//     <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">My Availability</h1>
//           <p className="mt-1 text-sm text-gray-600">
//             Times shown in <span className="font-medium">{tz}</span>.
//           </p>
//         </div>
//       </div>

//       {/* Creator Card */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <p className="text-sm font-medium text-gray-900">Add a time window</p>
//         <p className="mb-4 text-xs text-gray-600">
//           Patients can book within these windows when you’re free.
//         </p>

//         <div className="grid gap-4 sm:grid-cols-4">
//           <div className="sm:col-span-2">
//             <label className="text-sm text-gray-600 mb-1 block">
//               Hospital / Clinic
//             </label>
//             <select
//               value={hospitalId}
//               onChange={(e) => setHospitalId(e.target.value)}
//               className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               disabled={hospitalsLoading}
//             >
//               {!hospitalsLoading && hospitals.length === 0 && (
//                 <option value="">No hospitals available</option>
//               )}
//               {hospitals.map((h) => (
//                 <option key={h?._id} value={h?._id}>
//                   {h?.name}
//                 </option>
//               ))}
//             </select>
//             {hospitalsErr && (
//               <p className="mt-1 text-xs text-red-600">{hospitalsErr}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Start</label>
//             <Input
//               type="datetime-local"
//               value={start}
//               onChange={(e) => setStart(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">End</label>
//             <Input
//               type="datetime-local"
//               value={end}
//               onChange={(e) => setEnd(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="mt-3 flex items-center justify-between">
//           {/* Quick durations */}
//           <div className="flex flex-wrap gap-2">
//             <span className="text-xs text-gray-500 self-center">
//               Quick duration:
//             </span>
//             {[30, 45, 60, 90, 120].map((m) => (
//               <button
//                 key={m}
//                 type="button"
//                 onClick={() => setQuick(m)}
//                 className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs hover:bg-gray-50"
//                 title={`Set end to ${m} minutes after start`}
//               >
//                 {m} min
//               </button>
//             ))}
//           </div>

//           <Button
//             onClick={createSlot}
//             disabled={loading || hospitalsLoading || !hospitalId}
//           >
//             {loading ? "Adding…" : "Add"}
//           </Button>
//         </div>

//         {/* Feedback */}
//         {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
//         {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
//       </div>

//       {/* List Card */}
//       <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//         <div className="mb-3 flex items-center justify-between">
//           <p className="text-sm font-medium text-gray-900">Your windows</p>
//           <p className="text-xs text-gray-500">
//             {list.length ? `${list.length} total` : "None yet"}
//           </p>
//         </div>

//         {list.length ? (
//           <div className="space-y-5">
//             {Object.entries(grouped).map(([dayKey, items]) => {
//               const dayHeader = dayjs(dayKey).format("dddd, MMM D, YYYY");
//               return (
//                 <div key={dayKey} className="space-y-2">
//                   <div className="text-xs font-semibold text-gray-500">
//                     {dayHeader}
//                   </div>
//                   <div className="space-y-2">
//                     {items.map((s) => {
//                       const attachedName =
//                         s.hospital?.name ||
//                         (s.hospitalId ? hospitalNameById[s.hospitalId] : null);
//                       return (
//                         <div
//                           key={s._id}
//                           className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
//                         >
//                           <div className="text-sm">
//                             <div>
//                               {fmtLocal(s.start)}{" "}
//                               <span className="text-gray-400">→</span>{" "}
//                               {fmtLocal(s.end)}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {attachedName
//                                 ? attachedName
//                                 : "— No hospital specified —"}
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => remove(s._id)}
//                             className="text-sm text-red-600 hover:underline"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">No availability yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }


// app/availability/page.tsx
"use client";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

const INPUT_FMT = "YYYY-MM-DDTHH:mm";
const DISPLAY_FMT = "ddd, MMM DD, YYYY hh:mm A";

type Hospital = {
  _id: string;
  name: string;
};

type AvailabilityItem = {
  _id: string;
  start: string;
  end: string;
  hospitalId?: string | null;
  hospital?: { _id: string; name: string } | null;
};

export default function AvailabilityPage() {
  return (
    <Protected>
      <RoleGuard roles={["therapist"]}>
        <Inner />
      </RoleGuard>
    </Protected>
  );
}

function fmtLocal(dt: string | Date) {
  return dayjs(dt).format(DISPLAY_FMT);
}

function groupByDate(list: AvailabilityItem[]) {
  const out: Record<string, AvailabilityItem[]> = {};
  for (const s of list) {
    const key = dayjs(s.start).format("YYYY-MM-DD");
    (out[key] ||= []).push(s);
  }
  Object.values(out).forEach((arr) =>
    arr.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
  );
  return out;
}

function Inner() {
  const { token } = useAuth();

  const [start, setStart] = useState(dayjs().format(INPUT_FMT));
  const [end, setEnd] = useState(dayjs().add(2, "hour").format(INPUT_FMT));

  const [list, setList] = useState<AvailabilityItem[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState<string>("");
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsErr, setHospitalsErr] = useState("");

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  const grouped = useMemo(() => groupByDate(list), [list]);

  function setQuick(minutes: number) {
    const s = dayjs(start);
    setEnd(s.add(minutes, "minute").format(INPUT_FMT));
  }

  async function createSlot() {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const s = dayjs(start);
      const e = dayjs(end);

      if (!s.isValid() || !e.isValid())
        throw new Error("Please choose valid dates.");
      if (!e.isAfter(s)) throw new Error("End must be after start.");

      const minutes = e.diff(s, "minute");
      if (minutes < 15) throw new Error("Minimum length is 15 minutes.");

      if (!hospitalId) throw new Error("Please select a hospital or clinic.");
      if (!token) throw new Error("Session expired. Please log in again.");

      await api("api/availability", {
        method: "POST",
        headers: {
          ...(authHeader(token) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: s.toISOString(),
          end: e.toISOString(),
          hospital: hospitalId,
        }),
      });

      setMsg("Availability window added.");
      await loadAvailability();
    } catch (e: any) {
      setErr(e.message || "Could not add availability.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setErr("");
    setMsg("");
    const ok = confirm("Delete this availability window?");
    if (!ok) return;
    try {
      await api(`/availability/${id}`, {
        method: "DELETE",
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setMsg("Availability deleted.");
      await loadAvailability();
    } catch (e: any) {
      setErr(e.message || "Could not delete availability.");
    }
  }

  async function loadAvailability() {
    try {
      const res = await api("api/availability/me", {
        headers: authHeader(token || undefined) as HeadersInit,
      });
      setList((res || []) as AvailabilityItem[]);
    } catch (e: any) {
      setErr(e.message || "Failed to load availability.");
    }
  }

  async function loadHospitals() {
    setHospitalsErr("");
    setHospitalsLoading(true);
    try {
      const res = await api("api/public/hospitals", {
        headers: authHeader(token || undefined) as HeadersInit,
      });
      const arr = (res?.hospitals || []) as Hospital[];
      setHospitals(arr);
      if (!hospitalId && arr.length) setHospitalId(arr[0]?._id);
    } catch (e: any) {
      setHospitalsErr(e.message || "Failed to load hospitals.");
    } finally {
      setHospitalsLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadAvailability();
    loadHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const hospitalNameById = useMemo(() => {
    const m: Record<string, string> = {};
    hospitals?.forEach((h) => (m[h._id] = h.name));
    return m;
  }, [hospitals]);

  const totalWindows = list.length;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--brand,#4b7eff)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
              Therapist tools
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              My availability
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Patients can only book inside these windows. Times shown in{" "}
              <span className="font-medium">{tz}</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Active windows.{" "}
                <span className="font-semibold text-slate-900">
                  {totalWindows}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Creator card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Add availability window
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Choose a clinic. then select the start and end time when you are
                available for appointments.
              </p>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-500">
              Minimum 15 minutes
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate-700">
                Hospital or clinic
              </label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-2 focus:ring-[var(--brand,#4b7eff)]/60"
                disabled={hospitalsLoading}
              >
                {!hospitalsLoading && hospitals.length === 0 && (
                  <option value="">No hospitals available</option>
                )}
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
              {hospitalsErr && (
                <p className="mt-1 text-xs text-red-600">{hospitalsErr}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">Start</label>
              <Input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">End</label>
              <Input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Quick duration</span>
              {[30, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setQuick(m)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm hover:bg-slate-50"
                  title={`Set end to ${m} minutes after start`}
                >
                  {m} min
                </button>
              ))}
            </div>

         <Button
  onClick={createSlot}
  disabled={loading || hospitalsLoading || !hospitalId}
  className="
    mt-4
    w-full sm:w-auto
    px-4 
    py-2 
    text-sm 
    font-medium 
    rounded-md 
    bg-blue-600 
    text-white 
    shadow-sm
    hover:bg-blue-700
    disabled:opacity-50 
    disabled:cursor-not-allowed
  "
>
  {loading ? "Adding..." : "Add window"}
</Button>
          </div>

          {err && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
              {err}
            </p>
          )}
          {msg && (
            <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1">
              {msg}
            </p>
          )}
        </div>

        {/* List card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900">
              Your availability windows
            </p>
            <p className="text-xs text-slate-500">
              {list.length ? `${list.length} total` : "No windows yet"}
            </p>
          </div>

          {list.length ? (
            <div className="space-y-5">
              {Object.entries(grouped).map(([dayKey, items]) => {
                const dayHeader = dayjs(dayKey).format("dddd, MMM D, YYYY");
                return (
                  <div key={dayKey} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span>{dayHeader}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((s) => {
                        const attachedName =
                          s.hospital?.name ||
                          (s.hospitalId ? hospitalNameById[s.hospitalId] : null);
                        return (
                          <div
                            key={s._id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">
                                {fmtLocal(s.start)}{" "}
                                <span className="text-slate-400">→</span>{" "}
                                {fmtLocal(s.end)}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">
                                {attachedName ||
                                  "No hospital attached to this window"}
                              </div>
                            </div>
                            <button
                              onClick={() => remove(s._id)}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              You have not added any availability windows yet. 
              <br />
              Use the form above to set your first clinic slot.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
