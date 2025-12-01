// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// type Role = "therapist" | "receptionist";

// type Hospital = {
//   _id: string;
//   name: string;
//   city?: string;
//   address?: string;
// };

// type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

// const DAY_OPTIONS: { key: DayKey; label: string }[] = [
//   { key: "mon", label: "Monday" },
//   { key: "tue", label: "Tuesday" },
//   { key: "wed", label: "Wednesday" },
//   { key: "thu", label: "Thursday" },
//   { key: "fri", label: "Friday" },
//   { key: "sat", label: "Saturday" },
//   { key: "sun", label: "Sunday" },
// ];

// type DaySchedule = {
//   enabled: boolean;
//   start: string;
//   end: string;
// };

// type ClinicSchedulePayload = {
//   hospitalId: string;
//   days: {
//     day: DayKey;
//     start: string;
//     end: string;
//   }[];
// };

// const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
// const PHONE_REGEX = /^\d{4}-\d{7}$/;

// function formatCNIC(input: string) {
//   const digits = input.replace(/\D/g, "").slice(0, 13);
//   const part1 = digits.slice(0, 5);
//   const part2 = digits.slice(5, 12);
//   const part3 = digits.slice(12, 13);
//   let out = part1;
//   if (part2) out += "-" + part2;
//   if (part3) out += "-" + part3;
//   return out;
// }

// function formatPhone(input: string) {
//   const digits = input.replace(/\D/g, "").slice(0, 11);
//   const part1 = digits.slice(0, 4);
//   const part2 = digits.slice(4, 11);
//   let out = part1;
//   if (part2) out += "-" + part2;
//   return out;
// }

// export default function RegisterStaffPage() {
//   const [role, setRole] = useState<Role>("therapist");
//   const therapist = role === "therapist";

//   const [form, setForm] = useState<{
//     name: string;
//     email: string;
//     password: string;
//     phone: string;
//     address: string;
//     dateOfBirth: string;
//     cnic: string;
//     profileFile?: File;
//     // therapist-only
//     specializations: string;
//     yearsExperience: string;
//     licensingCouncil: string;
//     bio: string;
//     certFiles?: FileList;
//   }>({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     address: "",
//     dateOfBirth: "",
//     cnic: "",
//     profileFile: undefined,
//     specializations: "",
//     yearsExperience: "",
//     licensingCouncil: "",
//     bio: "",
//     certFiles: undefined,
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   // Hospitals
//   const [hospitals, setHospitals] = useState<Hospital[]>([]);
//   const [hospLoading, setHospLoading] = useState(false);
//   const [hospErr, setHospErr] = useState("");
//   const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
//   const [primaryHospital, setPrimaryHospital] = useState<string | null>(null);
//   const [hospSearch, setHospSearch] = useState("");

//   // const [hospitals, setHospitals] = useState([]);
//   const [hospitalId, setHospitalId] = useState("");

//   // Pricing (PKR only)
//   const [feesOnline, setFeesOnline] = useState<string>("");
//   const [feesInPerson, setFeesInPerson] = useState<string>("");

//   // Per-hospital fee overrides
//   const [hospitalFees, setHospitalFees] = useState<Record<string, string>>({});

//   // Per-hospital, per-day schedule
//   const [hospitalSchedule, setHospitalSchedule] = useState<
//     Record<string, Record<DayKey, DaySchedule>>
//   >({});

//   // UI state
//   const [err, setErr] = useState("");
//   const [info, setInfo] = useState("");
//   const [loading, setLoading] = useState(false);

//   const profilePreview = useMemo(
//     () => (form.profileFile ? URL.createObjectURL(form.profileFile) : ""),
//     [form.profileFile]
//   );

//   // Load hospitals for therapist
//   useEffect(() => {
//     if (!therapist) return;

//     (async () => {
//       try {
//         setHospErr("");
//         setHospLoading(true);
//         const res = await fetch(`${API}api/public/hospitals`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data?.msg || "Unable to load hospitals");
//         setHospitals(Array.isArray(data) ? data : data?.hospitals || []);
//       } catch (e: any) {
//         setHospErr(e.message || "Failed to load hospitals");
//       } finally {
//         setHospLoading(false);
//       }
//     })();
//   }, [therapist]);

//   // Keep primaryHospital in sync
//   useEffect(() => {
//     if (primaryHospital && !selectedHospitals.includes(primaryHospital)) {
//       setPrimaryHospital(selectedHospitals[0] || null);
//     }
//   }, [selectedHospitals, primaryHospital]);

//   // Clear therapist-only state when switching to receptionist
//   useEffect(() => {
//     if (!therapist) {
//       setSelectedHospitals([]);
//       setPrimaryHospital(null);
//       setFeesOnline("");
//       setFeesInPerson("");
//       setHospitalFees({});
//       setHospitalSchedule({});
//     }
//   }, [therapist]);

//   const filteredHospitals = useMemo(() => {
//     const q = hospSearch.trim().toLowerCase();
//     if (!q) return hospitals;
//     return hospitals.filter(
//       (h) =>
//         h.name.toLowerCase().includes(q) ||
//         (h.city || "").toLowerCase().includes(q) ||
//         (h.address || "").toLowerCase().includes(q)
//     );
//   }, [hospitals, hospSearch]);

//   function ensureHospitalSchedule(id: string) {
//     setHospitalSchedule((prev) => {
//       if (prev[id]) return prev;
//       const base: Record<DayKey, DaySchedule> = {
//         mon: { enabled: false, start: "", end: "" },
//         tue: { enabled: false, start: "", end: "" },
//         wed: { enabled: false, start: "", end: "" },
//         thu: { enabled: false, start: "", end: "" },
//         fri: { enabled: false, start: "", end: "" },
//         sat: { enabled: false, start: "", end: "" },
//         sun: { enabled: false, start: "", end: "" },
//       };
//       return { ...prev, [id]: base };
//     });
//   }

//   function toggleHospital(id: string) {
//     setSelectedHospitals((prev) => {
//       const exists = prev.includes(id);
//       if (exists) {
//         const next = prev.filter((x) => x !== id);
//         setHospitalFees((fees) => {
//           const { [id]: _, ...rest } = fees;
//           return rest;
//         });
//         setHospitalSchedule((s) => {
//           const { [id]: _, ...rest } = s;
//           return rest;
//         });
//         return next;
//       } else {
//         ensureHospitalSchedule(id);
//         return [...prev, id];
//       }
//     });
//   }

//   function toggleDay(hospitalId: string, day: DayKey) {
//     setHospitalSchedule((prev) => {
//       const existing = prev[hospitalId] ?? {
//         mon: { enabled: false, start: "", end: "" },
//         tue: { enabled: false, start: "", end: "" },
//         wed: { enabled: false, start: "", end: "" },
//         thu: { enabled: false, start: "", end: "" },
//         fri: { enabled: false, start: "", end: "" },
//         sat: { enabled: false, start: "", end: "" },
//         sun: { enabled: false, start: "", end: "" },
//       };
//       const daySched = existing[day] ?? {
//         enabled: false,
//         start: "",
//         end: "",
//       };
//       return {
//         ...prev,
//         [hospitalId]: {
//           ...existing,
//           [day]: { ...daySched, enabled: !daySched.enabled },
//         },
//       };
//     });
//   }

//   function updateHospitalTime(
//     hospitalId: string,
//     day: DayKey,
//     field: "start" | "end",
//     value: string
//   ) {
//     setHospitalSchedule((prev) => {
//       const existing = prev[hospitalId] ?? {
//         mon: { enabled: false, start: "", end: "" },
//         tue: { enabled: false, start: "", end: "" },
//         wed: { enabled: false, start: "", end: "" },
//         thu: { enabled: false, start: "", end: "" },
//         fri: { enabled: false, start: "", end: "" },
//         sat: { enabled: false, start: "", end: "" },
//         sun: { enabled: false, start: "", end: "" },
//       };
//       const daySched = existing[day] ?? {
//         enabled: false,
//         start: "",
//         end: "",
//       };
//       return {
//         ...prev,
//         [hospitalId]: {
//           ...existing,
//           [day]: { ...daySched, [field]: value },
//         },
//       };
//     });
//   }

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr("");
//     setInfo("");
//     setLoading(true);

//     try {
//       if (
//         !form.name ||
//         !form.email ||
//         !form.password ||
//         !form.phone ||
//         !form.cnic
//       ) {
//         throw new Error("Please fill all required fields.");
//       }

//       if (role === "receptionist") {
//         if (!form.address || !form.dateOfBirth) {
//           throw new Error(
//             "Address and date of birth are required for receptionists."
//           );
//         }
//       }

//       if (!form.profileFile) throw new Error("Profile picture is required.");

//       if (!CNIC_REGEX.test(form.cnic)) {
//         throw new Error("CNIC must be in the format XXXXX-XXXXXXX-X.");
//       }
//       if (!PHONE_REGEX.test(form.phone)) {
//         throw new Error("Phone must be in the format XXXX-XXXXXXX.");
//       }

//       if (therapist) {
//         if (!form.specializations?.trim())
//           throw new Error("Add at least one specialization.");
//         if (!form.certFiles?.length)
//           throw new Error("Upload at least one certification document.");
//         if (selectedHospitals.length > 0 && !primaryHospital) {
//           throw new Error("Please choose a primary hospital.");
//         }

//         // Validate schedule per hospital
//         for (const hid of selectedHospitals) {
//           const schedForHospital = hospitalSchedule[hid];
//           if (!schedForHospital) {
//             throw new Error(
//               "Please set days and time for each selected clinic/hospital."
//             );
//           }

//           const activeDays = DAY_OPTIONS.filter(
//             (d) => schedForHospital[d.key]?.enabled
//           );

//           if (!activeDays.length) {
//             throw new Error(
//               "Select at least one working day for each clinic/hospital."
//             );
//           }

//           for (const d of activeDays) {
//             const ds = schedForHospital[d.key];
//             if (!ds.start || !ds.end) {
//               throw new Error(
//                 `Provide start and end time for ${d.label} at each clinic/hospital.`
//               );
//             }
//             if (ds.start >= ds.end) {
//               throw new Error(
//                 `End time must be later than start time for ${d.label}.`
//               );
//             }
//           }
//         }
//       }

//       const fd = new FormData();
//       fd.set("role", role);
//       fd.set("name", form.name);
//       fd.set("email", form.email);
//       fd.set("password", form.password);
//       fd.set("phone", form.phone);
//       fd.set("cnic", form.cnic);
//       fd.append("profilePicture", form.profileFile);

//       if (therapist) {
//         // Just placeholders so backend validation is happy for now
//         fd.set("address", "N/A");
//         fd.set("dateOfBirth", "2000-01-01");
//       } else {
//         fd.set("address", form.address);
//         fd.set("dateOfBirth", form.dateOfBirth);
//       }

//       if (therapist) {
//         fd.set("specializations", form.specializations);
//         fd.set("yearsExperience", String(form.yearsExperience || 0));
//         fd.set("licensingCouncil", form.licensingCouncil || "");
//         fd.set("bio", form.bio || "");

//         Array.from(form.certFiles || []).forEach((f: File) =>
//           fd.append("certificationFiles", f)
//         );

//         selectedHospitals.forEach((id) => fd.append("affiliatedHospitals", id));
//         if (primaryHospital) fd.set("primaryHospital", primaryHospital);

//         // Fees PKR only
//         fd.set("feesCurrency", "PKR");
//         if (feesOnline !== "") fd.set("feesOnline", feesOnline);
//         if (feesInPerson !== "") fd.set("feesInPerson", feesInPerson);

//         Object.entries(hospitalFees).forEach(([hid, amt]) => {
//           if (selectedHospitals.includes(hid) && amt !== "") {
//             fd.set(`hospitalFee[${hid}]`, amt);
//           }
//         });

//         // Build clinicSchedules payload
//         const clinicSchedules: ClinicSchedulePayload[] = selectedHospitals.map(
//           (hid) => {
//             const schedForHospital = hospitalSchedule[hid] || {};
//             const days = DAY_OPTIONS.flatMap((d) => {
//               const ds = schedForHospital[d.key];
//               if (!ds || !ds.enabled || !ds.start || !ds.end) return [];
//               return [
//                 {
//                   day: d.key,
//                   start: ds.start,
//                   end: ds.end,
//                 },
//               ];
//             });
//             return { hospitalId: hid, days };
//           }
//         );

//         if (clinicSchedules.some((c) => c.days.length)) {
//           fd.set("clinicSchedules", JSON.stringify(clinicSchedules));
//         }
//       }

//       const res = await fetch(`${API}api/auth/register`, {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.msg || "Registration failed");

//       setInfo(
//         data?.message ||
//           (role === "receptionist"
//             ? "Receptionist account submitted. Awaiting admin approval."
//             : "Therapist account submitted. Awaiting admin approval.")
//       );
//     } catch (e: any) {
//       setErr(e.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//       <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
//         <div className="mb-4 text-sm text-gray-500">
//           <Link href="/" className="hover:underline">
//             Home
//           </Link>{" "}
//           <span>›</span> <span>Register (Staff)</span>
//         </div>

//         <h1 className="text-2xl font-semibold mb-2">Register staff account</h1>
//         <p className="text-sm text-gray-600 mb-6">
//           Admin approval is required before you can sign in.
//         </p>

//         {err && (
//           <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {err}
//           </div>
//         )}
//         {info && (
//           <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
//             {info}
//           </div>
//         )}

//         <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-5">
//           {/* LEFT */}
//           <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
//             <div>
//               <label className="mb-1 block text-sm text-gray-700">Role</label>
//               <Select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value as Role)}
//               >
//                 <option value="therapist">Therapist</option>
//                 <option value="receptionist">Receptionist</option>
//               </Select>
//             </div>

//             {/* Basic details */}
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Input
//                 placeholder="Full name"
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, name: e.target.value }))
//                 }
//                 required
//               />
//               <Input
//                 type="email"
//                 placeholder="Email"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, email: e.target.value }))
//                 }
//                 required
//               />

//               <div className="relative">
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, password: e.target.value }))
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
//                   onClick={() => setShowPassword((s) => !s)}
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>

//               <Input
//                 placeholder="Phone (e.g. 0300-1234567)"
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))
//                 }
//                 required
//               />

//               {role === "receptionist" && (
//                 <>
//                   <div className="sm:col-span-2">
//                     <Input
//                       placeholder="Address"
//                       value={form.address}
//                       onChange={(e) =>
//                         setForm((f) => ({ ...f, address: e.target.value }))
//                       }
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-1 block text-sm text-gray-700">
//                       Date of birth
//                     </label>
//                     <Input
//                       type="date"
//                       value={form.dateOfBirth}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           dateOfBirth: e.target.value,
//                         }))
//                       }
//                       required
//                     />
//                   </div>
//                 </>
//               )}

//               <Input
//                 placeholder="CNIC (e.g. 12345-1234567-1)"
//                 value={form.cnic}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, cnic: formatCNIC(e.target.value) }))
//                 }
//                 required
//               />
//             </div>

//             {/* Therapist-only */}
//             {therapist && (
//               <>
//                 <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//                   <p className="text-sm font-medium text-gray-900">Pricing</p>
//                   <div className="mt-3 grid gap-3 sm:grid-cols-3">
//                     <div>
//                       <label className="mb-1 block text-sm text-gray-700">
//                         Currency
//                       </label>
//                       <Input value="PKR" disabled />
//                     </div>
//                     <Input
//                       type="number"
//                       min="0"
//                       placeholder="Online fee (PKR)"
//                       value={feesOnline}
//                       onChange={(e) => setFeesOnline(e.target.value)}
//                     />
//                     <Input
//                       type="number"
//                       min="0"
//                       placeholder="Default in-person fee (PKR)"
//                       value={feesInPerson}
//                       onChange={(e) => setFeesInPerson(e.target.value)}
//                     />
//                   </div>
//                   <p className="mt-2 text-xs text-gray-500">
//                     All fees are in PKR. You can override in-person fee per
//                     clinic below.
//                   </p>
//                 </div>

//                 <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
//                   <p className="text-sm font-medium">Therapist details</p>
//                   <div className="grid gap-3 sm:grid-cols-2 mt-3">
//                     <Input
//                       placeholder="Specializations (comma separated)"
//                       value={form.specializations}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           specializations: e.target.value,
//                         }))
//                       }
//                     />
//                     <Input
//                       type="number"
//                       min={0}
//                       placeholder="Years of experience"
//                       value={form.yearsExperience}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           yearsExperience: e.target.value,
//                         }))
//                       }
//                     />
//                     <Input
//                       placeholder="Licensing council"
//                       value={form.licensingCouncil}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           licensingCouncil: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   <label className="mt-3 mb-1 block text-sm text-gray-700">
//                     Bio
//                   </label>
//                   <textarea
//                     className="w-full rounded-md border px-3 py-2 text-sm"
//                     rows={3}
//                     value={form.bio}
//                     onChange={(e) =>
//                       setForm((f) => ({ ...f, bio: e.target.value }))
//                     }
//                   />

//                   <div className="mt-3">
//                     <label className="block text-sm text-gray-700 mb-1">
//                       Certification documents{" "}
//                       <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*,application/pdf"
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           certFiles: e.target.files || undefined,
//                         }))
//                       }
//                       required
//                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
//                     />
//                     <p className="mt-1 text-xs text-gray-500">
//                       Upload degrees, certifications, or registrations.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Clinics / Hospitals */}
//                 <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//                   <div className="flex items-center justify-between gap-3">
//                     <p className="text-sm font-medium text-gray-900">
//                       Clinics / Hospitals
//                     </p>
//                     <Input
//                       placeholder="Search clinics..."
//                       value={hospSearch}
//                       onChange={(e) => setHospSearch(e.target.value)}
//                     />
//                   </div>

//                   {hospErr && (
//                     <p className="mt-2 text-xs text-red-600">{hospErr}</p>
//                   )}
//                   {hospLoading ? (
//                     <div className="mt-3 space-y-2">
//                       {Array.from({ length: 4 }).map((_, i) => (
//                         <div
//                           key={i}
//                           className="h-10 rounded-md bg-gray-100 animate-pulse"
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="mt-3 max-h-64 overflow-auto rounded-md border">
//                       {!filteredHospitals.length ? (
//                         <p className="p-3 text-sm text-gray-500">
//                           No clinics found.
//                         </p>
//                       ) : (
//                         <ul className="divide-y">
//                           {filteredHospitals.map((h) => {
//                             const checked = selectedHospitals.includes(h._id);
//                             const sched = hospitalSchedule[h._id];
//                             return (
//                               <li key={h._id} className="px-3 py-2">
//                                 <div className="flex items-center justify-between gap-3">
//                                   <label className="flex items-center gap-2">
//                                     <input
//                                       type="checkbox"
//                                       checked={checked}
//                                       onChange={() => toggleHospital(h._id)}
//                                     />
//                                     <span className="text-sm">
//                                       {h.name}
//                                       {h.city ? (
//                                         <span className="text-gray-500">
//                                           {" "}
//                                           — {h.city}
//                                         </span>
//                                       ) : null}
//                                     </span>
//                                   </label>

//                                   <label className="flex items-center gap-2 text-xs text-gray-600">
//                                     <input
//                                       type="radio"
//                                       name="primaryHospital"
//                                       disabled={!checked}
//                                       checked={primaryHospital === h._id}
//                                       onChange={() => setPrimaryHospital(h._id)}
//                                     />
//                                     Primary
//                                   </label>
//                                 </div>

//                                 {checked && (
//                                   <>
//                                     <div className="mt-2 pl-6 flex items-center gap-2">
//                                       <Input
//                                         type="number"
//                                         min="0"
//                                         placeholder="Override in-person fee (PKR)"
//                                         value={hospitalFees[h._id] || ""}
//                                         onChange={(e) =>
//                                           setHospitalFees((prev) => ({
//                                             ...prev,
//                                             [h._id]: e.target.value,
//                                           }))
//                                         }
//                                       />
//                                       <span className="text-xs text-gray-500">
//                                         PKR
//                                       </span>
//                                     </div>

//                                     <div className="mt-3 pl-6 space-y-3">
//                                       <p className="text-xs font-medium text-gray-700">
//                                         Working days & time at this clinic /
//                                         hospital
//                                       </p>

//                                       {DAY_OPTIONS.map((d) => {
//                                         const daySched = sched?.[d.key] ?? {
//                                           enabled: false,
//                                           start: "",
//                                           end: "",
//                                         };

//                                         return (
//                                           <div
//                                             key={d.key}
//                                             className="grid grid-cols-[auto,1fr] items-center gap-3 text-xs"
//                                           >
//                                             <label className="flex items-center gap-2">
//                                               <input
//                                                 type="checkbox"
//                                                 checked={daySched.enabled}
//                                                 onChange={() =>
//                                                   toggleDay(h._id, d.key)
//                                                 }
//                                               />
//                                               <span>{d.label}</span>
//                                             </label>

//                                             <div className="grid grid-cols-2 gap-2">
//                                               <div>
//                                                 <label className="mb-1 block text-[11px] text-gray-600">
//                                                   Start
//                                                 </label>
//                                                 <Input
//                                                   type="time"
//                                                   value={daySched.start}
//                                                   disabled={!daySched.enabled}
//                                                   onChange={(e) =>
//                                                     updateHospitalTime(
//                                                       h._id,
//                                                       d.key,
//                                                       "start",
//                                                       e.target.value
//                                                     )
//                                                   }
//                                                 />
//                                               </div>
//                                               <div>
//                                                 <label className="mb-1 block text-[11px] text-gray-600">
//                                                   End
//                                                 </label>
//                                                 <Input
//                                                   type="time"
//                                                   value={daySched.end}
//                                                   disabled={!daySched.enabled}
//                                                   onChange={(e) =>
//                                                     updateHospitalTime(
//                                                       h._id,
//                                                       d.key,
//                                                       "end",
//                                                       e.target.value
//                                                     )
//                                                   }
//                                                 />
//                                               </div>
//                                             </div>
//                                           </div>
//                                         );
//                                       })}

//                                       <p className="text-[11px] text-gray-500">
//                                         Example: Monday 10:00–13:00 and
//                                         Wednesday 16:00–19:00 at the same
//                                         hospital. Backend will auto-create
//                                         1-hour slots within each range for the
//                                         next ~30 days.
//                                       </p>
//                                     </div>
//                                   </>
//                                 )}
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       )}
//                     </div>
//                   )}

//                   {selectedHospitals.length > 0 && (
//                     <p className="mt-2 text-xs text-gray-600">
//                       Selected: {selectedHospitals.length}.{" "}
//                       {primaryHospital
//                         ? "Primary set."
//                         : "Choose a primary hospital."}
//                     </p>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* RIGHT */}
//           <aside className="md:col-span-2 space-y-6">
//             <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//               <p className="mb-3 text-sm font-medium text-gray-900">
//                 Profile photo <span className="text-red-600">*</span>
//               </p>
//               {profilePreview ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={profilePreview}
//                   alt="Preview"
//                   className="mb-3 h-28 w-28 rounded-xl object-cover ring-1 ring-gray-200"
//                 />
//               ) : (
//                 <div className="mb-3 grid h-28 w-28 place-items-center rounded-xl bg-gray-100 text-xs text-gray-500">
//                   No photo
//                 </div>
//               )}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) =>
//                   setForm((f) => ({
//                     ...f,
//                     profileFile: e.target.files?.[0],
//                   }))
//                 }
//                 required
//                 className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
//               />
//               <p className="mt-1 text-xs text-gray-500">
//                 JPG/PNG/WebP up to ~3–5MB.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//               <Button className="w-full" disabled={loading}>
//                 {loading ? "Submitting…" : "Submit for approval"}
//               </Button>
//               <p className="mt-3 text-center text-sm text-gray-600">
//                 Already approved?{" "}
//                 <Link
//                   href="/login"
//                   className="text-[var(--brand,#4b7eff)] hover:underline"
//                 >
//                   Log in
//                 </Link>
//               </p>
//             </div>
//           </aside>
//         </form>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Button from "@/components/Button";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// type Role = "therapist" | "receptionist";

// type Hospital = {
//   _id: string;
//   name: string;
//   city?: string;
//   address?: string;
// };

// type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

// const DAY_OPTIONS: { key: DayKey; label: string }[] = [
//   { key: "mon", label: "Monday" },
//   { key: "tue", label: "Tuesday" },
//   { key: "wed", label: "Wednesday" },
//   { key: "thu", label: "Thursday" },
//   { key: "fri", label: "Friday" },
//   { key: "sat", label: "Saturday" },
//   { key: "sun", label: "Sunday" },
// ];

// type DaySchedule = {
//   enabled: boolean;
//   start: string;
//   end: string;
// };

// type ClinicSchedulePayload = {
//   hospitalId: string;
//   days: {
//     day: DayKey;
//     start: string;
//     end: string;
//   }[];
// };

// const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
// const PHONE_REGEX = /^\d{4}-\d{7}$/;

// function formatCNIC(input: string) {
//   const digits = input.replace(/\D/g, "").slice(0, 13);
//   const part1 = digits.slice(0, 5);
//   const part2 = digits.slice(5, 12);
//   const part3 = digits.slice(12, 13);
//   let out = part1;
//   if (part2) out += "-" + part2;
//   if (part3) out += "-" + part3;
//   return out;
// }

// function formatPhone(input: string) {
//   const digits = input.replace(/\D/g, "").slice(0, 11);
//   const part1 = digits.slice(0, 4);
//   const part2 = digits.slice(4, 11);
//   let out = part1;
//   if (part2) out += "-" + part2;
//   return out;
// }

// export default function RegisterStaffPage() {
//   const [role, setRole] = useState<Role>("therapist");
//   const therapist = role === "therapist";

//   const [form, setForm] = useState<{
//     name: string;
//     email: string;
//     password: string;
//     phone: string;
//     address: string;
//     dateOfBirth: string;
//     cnic: string;
//     profileFile?: File;
//     // therapist-only
//     specializations: string;
//     yearsExperience: string;
//     licensingCouncil: string;
//     bio: string;
//     certFiles?: FileList;
//   }>({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     address: "",
//     dateOfBirth: "",
//     cnic: "",
//     profileFile: undefined,
//     specializations: "",
//     yearsExperience: "",
//     licensingCouncil: "",
//     bio: "",
//     certFiles: undefined,
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   // Hospitals
//   const [hospitals, setHospitals] = useState<Hospital[]>([]);
//   const [hospLoading, setHospLoading] = useState(false);
//   const [hospErr, setHospErr] = useState("");
//   const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
//   const [primaryHospital, setPrimaryHospital] = useState<string | null>(null);
//   const [hospSearch, setHospSearch] = useState("");

//   // For receptionist single hospital selection
//   const [hospitalId, setHospitalId] = useState("");

//   // Pricing (PKR only)
//   const [feesOnline, setFeesOnline] = useState<string>("");
//   const [feesInPerson, setFeesInPerson] = useState<string>("");

//   // Per-hospital fee overrides
//   const [hospitalFees, setHospitalFees] = useState<Record<string, string>>({});

//   // Per-hospital, per-day schedule
//   const [hospitalSchedule, setHospitalSchedule] = useState<
//     Record<string, Record<DayKey, DaySchedule>>
//   >({});

//   // UI state
//   const [err, setErr] = useState("");
//   const [info, setInfo] = useState("");
//   const [loading, setLoading] = useState(false);

//   const profilePreview = useMemo(
//     () => (form.profileFile ? URL.createObjectURL(form.profileFile) : ""),
//     [form.profileFile]
//   );

//   // Load hospitals (for BOTH therapist & receptionist)
//   useEffect(() => {
//     (async () => {
//       try {
//         setHospErr("");
//         setHospLoading(true);
//         const res = await fetch(`${API}api/public/hospitals`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data?.msg || "Unable to load hospitals");
//         setHospitals(Array.isArray(data) ? data : data?.hospitals || []);
//       } catch (e: any) {
//         setHospErr(e.message || "Failed to load hospitals");
//       } finally {
//         setHospLoading(false);
//       }
//     })();
//   }, []);

//   // Keep therapist primaryHospital in sync
//   useEffect(() => {
//     if (primaryHospital && !selectedHospitals.includes(primaryHospital)) {
//       setPrimaryHospital(selectedHospitals[0] || null);
//     }
//   }, [selectedHospitals, primaryHospital]);

//   // Clear therapist-only state when switching to receptionist
//   useEffect(() => {
//     if (!therapist) {
//       setSelectedHospitals([]);
//       setPrimaryHospital(null);
//       setFeesOnline("");
//       setFeesInPerson("");
//       setHospitalFees({});
//       setHospitalSchedule({});
//       // Also clear receptionist hospital when switching FROM receptionist
//       setHospitalId("");
//     }
//   }, [therapist]);

//   const filteredHospitals = useMemo(() => {
//     const q = hospSearch.trim().toLowerCase();
//     if (!q) return hospitals;
//     return hospitals.filter(
//       (h) =>
//         h.name.toLowerCase().includes(q) ||
//         (h.city || "").toLowerCase().includes(q) ||
//         (h.address || "").toLowerCase().includes(q)
//     );
//   }, [hospitals, hospSearch]);

//   function ensureHospitalSchedule(id: string) {
//     setHospitalSchedule((prev) => {
//       if (prev[id]) return prev;
//       const base: Record<DayKey, DaySchedule> = {
//         mon: { enabled: false, start: "", end: "" },
//         tue: { enabled: false, start: "", end: "" },
//         wed: { enabled: false, start: "", end: "" },
//         thu: { enabled: false, start: "", end: "" },
//         fri: { enabled: false, start: "", end: "" },
//         sat: { enabled: false, start: "", end: "" },
//         sun: { enabled: false, start: "", end: "" },
//       };
//       return { ...prev, [id]: base };
//     });
//   }

//   function toggleHospital(id: string) {
//     setSelectedHospitals((prev) => {
//       const exists = prev.includes(id);
//       if (exists) {
//         const next = prev.filter((x) => x !== id);
//         setHospitalFees((fees) => {
//           const { [id]: _, ...rest } = fees;
//           return rest;
//         });
//         setHospitalSchedule((s) => {
//           const { [id]: _, ...rest } = s;
//           return rest;
//         });
//         return next;
//       } else {
//         ensureHospitalSchedule(id);
//         return [...prev, id];
//       }
//     });
//   }

//   function toggleDay(hospitalId: string, day: DayKey) {
//     setHospitalSchedule((prev) => {
//       const existing = prev[hospitalId] ?? {
//         mon: { enabled: false, start: "", end: "" },
//         tue: { enabled: false, start: "", end: "" },
//         wed: { enabled: false, start: "", end: "" },
//         thu: { enabled: false, start: "", end: "" },
//         fri: { enabled: false, start: "", end: "" },
//         sat: { enabled: false, start: "", end: "" },
//         sun: { enabled: false, start: "", end: "" },
//       };
//       const daySched = existing[day] ?? {
//         enabled: false,
//         start: "",
//         end: "",
//       };
//       return {
//         ...prev,
//         [hospitalId]: {
//           ...existing,
//           [day]: { ...daySched, enabled: !daySched.enabled },
//         },
//       };
//     });
//   }

//   function updateHospitalTime(
//     hospitalId: string,
//     day: DayKey,
//     field: "start" | "end",
//     value: string
//   ) {
//     setHospitalSchedule((prev) => {
//       const existing = prev[hospitalId] ?? {
//         mon: { enabled: false, start: "", end: "" },
//         tue: { enabled: false, start: "", end: "" },
//         wed: { enabled: false, start: "", end: "" },
//         thu: { enabled: false, start: "", end: "" },
//         fri: { enabled: false, start: "", end: "" },
//         sat: { enabled: false, start: "", end: "" },
//         sun: { enabled: false, start: "", end: "" },
//       };
//       const daySched = existing[day] ?? {
//         enabled: false,
//         start: "",
//         end: "",
//       };
//       return {
//         ...prev,
//         [hospitalId]: {
//           ...existing,
//           [day]: { ...daySched, [field]: value },
//         },
//       };
//     });
//   }

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr("");
//     setInfo("");
//     setLoading(true);

//     try {
//       if (
//         !form.name ||
//         !form.email ||
//         !form.password ||
//         !form.phone ||
//         !form.cnic
//       ) {
//         throw new Error("Please fill all required fields.");
//       }

//       if (role === "receptionist") {
//         if (!hospitalId) {
//           throw new Error("Please select a hospital for the receptionist.");
//         }
//       }

//       if (!form.profileFile) throw new Error("Profile picture is required.");

//       if (!CNIC_REGEX.test(form.cnic)) {
//         throw new Error("CNIC must be in the format XXXXX-XXXXXXX-X.");
//       }
//       if (!PHONE_REGEX.test(form.phone)) {
//         throw new Error("Phone must be in the format XXXX-XXXXXXX.");
//       }

//       if (therapist) {
//         if (!form.specializations?.trim())
//           throw new Error("Add at least one specialization.");
//         if (!form.certFiles?.length)
//           throw new Error("Upload at least one certification document.");
//         if (selectedHospitals.length > 0 && !primaryHospital) {
//           throw new Error("Please choose a primary hospital.");
//         }

//         // Validate schedule per hospital
//         for (const hid of selectedHospitals) {
//           const schedForHospital = hospitalSchedule[hid];
//           if (!schedForHospital) {
//             throw new Error(
//               "Please set days and time for each selected clinic/hospital."
//             );
//           }

//           const activeDays = DAY_OPTIONS.filter(
//             (d) => schedForHospital[d.key]?.enabled
//           );

//           if (!activeDays.length) {
//             throw new Error(
//               "Select at least one working day for each clinic/hospital."
//             );
//           }

//           for (const d of activeDays) {
//             const ds = schedForHospital[d.key];
//             if (!ds.start || !ds.end) {
//               throw new Error(
//                 `Provide start and end time for ${d.label} at each clinic/hospital.`
//               );
//             }
//             if (ds.start >= ds.end) {
//               throw new Error(
//                 `End time must be later than start time for ${d.label}.`
//               );
//             }
//           }
//         }
//       }

//       const fd = new FormData();
//       fd.set("role", role);
//       fd.set("name", form.name);
//       fd.set("email", form.email);
//       fd.set("password", form.password);
//       fd.set("phone", form.phone);
//       fd.set("cnic", form.cnic);
//       fd.append("profilePicture", form.profileFile);

//       if (therapist) {
//         // Therapist: dummy address + DOB to satisfy any backend fields if needed
//         fd.set("address", "N/A");
//         fd.set("dateOfBirth", "2000-01-01");
//       } else {
//         // Receptionist: no address / DOB required, send blank
//         fd.set("address", "");
//         fd.set("dateOfBirth", "");
//         // Hospital is REQUIRED for receptionist
//         fd.set("primaryHospital", hospitalId);
//         fd.append("affiliatedHospitals", hospitalId);
//       }

//       if (therapist) {
//         fd.set("specializations", form.specializations);
//         fd.set("yearsExperience", String(form.yearsExperience || 0));
//         fd.set("licensingCouncil", form.licensingCouncil || "");
//         fd.set("bio", form.bio || "");

//         Array.from(form.certFiles || []).forEach((f: File) =>
//           fd.append("certificationFiles", f)
//         );

//         selectedHospitals.forEach((id) => fd.append("affiliatedHospitals", id));
//         if (primaryHospital) fd.set("primaryHospital", primaryHospital);

//         // Fees PKR only
//         fd.set("feesCurrency", "PKR");
//         if (feesOnline !== "") fd.set("feesOnline", feesOnline);
//         if (feesInPerson !== "") fd.set("feesInPerson", feesInPerson);

//         Object.entries(hospitalFees).forEach(([hid, amt]) => {
//           if (selectedHospitals.includes(hid) && amt !== "") {
//             fd.set(`hospitalFee[${hid}]`, amt);
//           }
//         });

//         // Build clinicSchedules payload
//         const clinicSchedules: ClinicSchedulePayload[] = selectedHospitals.map(
//           (hid) => {
//             const schedForHospital = hospitalSchedule[hid] || {};
//             const days = DAY_OPTIONS.flatMap((d) => {
//               const ds = schedForHospital[d.key];
//               if (!ds || !ds.enabled || !ds.start || !ds.end) return [];
//               return [
//                 {
//                   day: d.key,
//                   start: ds.start,
//                   end: ds.end,
//                 },
//               ];
//             });
//             return { hospitalId: hid, days };
//           }
//         );

//         if (clinicSchedules.some((c) => c.days.length)) {
//           fd.set("clinicSchedules", JSON.stringify(clinicSchedules));
//         }
//       }

//       const res = await fetch(`${API}api/auth/register`, {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.msg || "Registration failed");

//       setInfo(
//         data?.message ||
//           (role === "receptionist"
//             ? "Receptionist account submitted. Awaiting admin approval."
//             : "Therapist account submitted. Awaiting admin approval.")
//       );
//     } catch (e: any) {
//       setErr(e.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//       <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
//         <div className="mb-4 text-sm text-gray-500">
//           <Link href="/" className="hover:underline">
//             Home
//           </Link>{" "}
//           <span>›</span> <span>Register (Staff)</span>
//         </div>

//         <h1 className="text-2xl font-semibold mb-2">Register staff account</h1>
//         <p className="text-sm text-gray-600 mb-6">
//           Admin approval is required before you can sign in.
//         </p>

//         {err && (
//           <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {err}
//           </div>
//         )}
//         {info && (
//           <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
//             {info}
//           </div>
//         )}

//         <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-5">
//           {/* LEFT */}
//           <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
//             <div>
//               <label className="mb-1 block text-sm text-gray-700">Role</label>
//               <Select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value as Role)}
//               >
//                 <option value="therapist">Therapist</option>
//                 <option value="receptionist">Receptionist</option>
//               </Select>
//             </div>

//             {/* Basic details */}
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Input
//                 placeholder="Full name"
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, name: e.target.value }))
//                 }
//                 required
//               />
//               <Input
//                 type="email"
//                 placeholder="Email"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, email: e.target.value }))
//                 }
//                 required
//               />

//               <div className="relative">
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, password: e.target.value }))
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
//                   onClick={() => setShowPassword((s) => !s)}
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>

//               <Input
//                 placeholder="Phone (e.g. 0300-1234567)"
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))
//                 }
//                 required
//               />

//               {/* Receptionist-only: HOSPITAL DROPDOWN */}
//               {role === "receptionist" && (
//                 <div className="sm:col-span-2">
//                   <label className="mb-1 block text-sm text-gray-700">
//                     Hospital
//                   </label>
//                   <select
//                     value={hospitalId}
//                     onChange={(e) => setHospitalId(e.target.value)}
//                     className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-1 focus:ring-[var(--brand,#4b7eff)]"
//                     required
//                   >
//                     <option value="">
//                       {hospLoading ? "Loading hospitals..." : "Select hospital"}
//                     </option>
//                     {hospitals.map((h) => (
//                       <option key={h._id} value={h._id}>
//                         {h.name}
//                         {h.city ? ` – ${h.city}` : ""}
//                       </option>
//                     ))}
//                   </select>
//                   {hospErr && (
//                     <p className="mt-1 text-xs text-red-600">{hospErr}</p>
//                   )}
//                 </div>
//               )}

//               <Input
//                 placeholder="CNIC (e.g. 12345-1234567-1)"
//                 value={form.cnic}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, cnic: formatCNIC(e.target.value) }))
//                 }
//                 required
//               />
//             </div>

//             {/* Therapist-only details + hospitals */}
//             {therapist && (
//               <>
//                 <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//                   <p className="text-sm font-medium text-gray-900">Pricing</p>
//                   <div className="mt-3 grid gap-3 sm:grid-cols-3">
//                     <div>
//                       <label className="mb-1 block text-sm text-gray-700">
//                         Currency
//                       </label>
//                       <Input value="PKR" disabled />
//                     </div>
//                     <Input
//                       type="number"
//                       min="0"
//                       placeholder="Online fee (PKR)"
//                       value={feesOnline}
//                       onChange={(e) => setFeesOnline(e.target.value)}
//                     />
//                     <Input
//                       type="number"
//                       min="0"
//                       placeholder="Default in-person fee (PKR)"
//                       value={feesInPerson}
//                       onChange={(e) => setFeesInPerson(e.target.value)}
//                     />
//                   </div>
//                   <p className="mt-2 text-xs text-gray-500">
//                     All fees are in PKR. You can override in-person fee per
//                     clinic below.
//                   </p>
//                 </div>

//                 <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
//                   <p className="text-sm font-medium">Therapist details</p>
//                   <div className="grid gap-3 sm:grid-cols-2 mt-3">
//                     <Input
//                       placeholder="Specializations (comma separated)"
//                       value={form.specializations}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           specializations: e.target.value,
//                         }))
//                       }
//                     />
//                     <Input
//                       type="number"
//                       min={0}
//                       placeholder="Years of experience"
//                       value={form.yearsExperience}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           yearsExperience: e.target.value,
//                         }))
//                       }
//                     />
//                     <Input
//                       placeholder="Licensing council"
//                       value={form.licensingCouncil}
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           licensingCouncil: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   <label className="mt-3 mb-1 block text-sm text-gray-700">
//                     Bio
//                   </label>
//                   <textarea
//                     className="w-full rounded-md border px-3 py-2 text-sm"
//                     rows={3}
//                     value={form.bio}
//                     onChange={(e) =>
//                       setForm((f) => ({ ...f, bio: e.target.value }))
//                     }
//                   />

//                   <div className="mt-3">
//                     <label className="block text-sm text-gray-700 mb-1">
//                       Certification documents{" "}
//                       <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*,application/pdf"
//                       onChange={(e) =>
//                         setForm((f) => ({
//                           ...f,
//                           certFiles: e.target.files || undefined,
//                         }))
//                       }
//                       required
//                       className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
//                     />
//                     <p className="mt-1 text-xs text-gray-500">
//                       Upload degrees, certifications, or registrations.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Clinics / Hospitals for therapist */}
//                 <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//                   <div className="flex items-center justify-between gap-3">
//                     <p className="text-sm font-medium text-gray-900">
//                       Clinics / Hospitals
//                     </p>
//                     <Input
//                       placeholder="Search clinics..."
//                       value={hospSearch}
//                       onChange={(e) => setHospSearch(e.target.value)}
//                     />
//                   </div>

//                   {hospErr && (
//                     <p className="mt-2 text-xs text-red-600">{hospErr}</p>
//                   )}
//                   {hospLoading ? (
//                     <div className="mt-3 space-y-2">
//                       {Array.from({ length: 4 }).map((_, i) => (
//                         <div
//                           key={i}
//                           className="h-10 rounded-md bg-gray-100 animate-pulse"
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="mt-3 max-h-64 overflow-auto rounded-md border">
//                       {!filteredHospitals.length ? (
//                         <p className="p-3 text-sm text-gray-500">
//                           No clinics found.
//                         </p>
//                       ) : (
//                         <ul className="divide-y">
//                           {filteredHospitals.map((h) => {
//                             const checked = selectedHospitals.includes(h._id);
//                             const sched = hospitalSchedule[h._id];
//                             return (
//                               <li key={h._id} className="px-3 py-2">
//                                 <div className="flex items-center justify-between gap-3">
//                                   <label className="flex items-center gap-2">
//                                     <input
//                                       type="checkbox"
//                                       checked={checked}
//                                       onChange={() => toggleHospital(h._id)}
//                                     />
//                                     <span className="text-sm">
//                                       {h.name}
//                                       {h.city ? (
//                                         <span className="text-gray-500">
//                                           {" "}
//                                           — {h.city}
//                                         </span>
//                                       ) : null}
//                                     </span>
//                                   </label>

//                                   <label className="flex items-center gap-2 text-xs text-gray-600">
//                                     <input
//                                       type="radio"
//                                       name="primaryHospital"
//                                       disabled={!checked}
//                                       checked={primaryHospital === h._id}
//                                       onChange={() => setPrimaryHospital(h._id)}
//                                     />
//                                     Primary
//                                   </label>
//                                 </div>

//                                 {checked && (
//                                   <>
//                                     <div className="mt-2 pl-6 flex items-center gap-2">
//                                       <Input
//                                         type="number"
//                                         min="0"
//                                         placeholder="Override in-person fee (PKR)"
//                                         value={hospitalFees[h._id] || ""}
//                                         onChange={(e) =>
//                                           setHospitalFees((prev) => ({
//                                             ...prev,
//                                             [h._id]: e.target.value,
//                                           }))
//                                         }
//                                       />
//                                       <span className="text-xs text-gray-500">
//                                         PKR
//                                       </span>
//                                     </div>

//                                     <div className="mt-3 pl-6 space-y-3">
//                                       <p className="text-xs font-medium text-gray-700">
//                                         Working days & time at this clinic /
//                                         hospital
//                                       </p>

//                                       {DAY_OPTIONS.map((d) => {
//                                         const daySched = sched?.[d.key] ?? {
//                                           enabled: false,
//                                           start: "",
//                                           end: "",
//                                         };

//                                         return (
//                                           <div
//                                             key={d.key}
//                                             className="grid grid-cols-[auto,1fr] items-center gap-3 text-xs"
//                                           >
//                                             <label className="flex items-center gap-2">
//                                               <input
//                                                 type="checkbox"
//                                                 checked={daySched.enabled}
//                                                 onChange={() =>
//                                                   toggleDay(h._id, d.key)
//                                                 }
//                                               />
//                                               <span>{d.label}</span>
//                                             </label>

//                                             <div className="grid grid-cols-2 gap-2">
//                                               <div>
//                                                 <label className="mb-1 block text-[11px] text-gray-600">
//                                                   Start
//                                                 </label>
//                                                 <Input
//                                                   type="time"
//                                                   value={daySched.start}
//                                                   disabled={!daySched.enabled}
//                                                   onChange={(e) =>
//                                                     updateHospitalTime(
//                                                       h._id,
//                                                       d.key,
//                                                       "start",
//                                                       e.target.value
//                                                     )
//                                                   }
//                                                 />
//                                               </div>
//                                               <div>
//                                                 <label className="mb-1 block text-[11px] text-gray-600">
//                                                   End
//                                                 </label>
//                                                 <Input
//                                                   type="time"
//                                                   value={daySched.end}
//                                                   disabled={!daySched.enabled}
//                                                   onChange={(e) =>
//                                                     updateHospitalTime(
//                                                       h._id,
//                                                       d.key,
//                                                       "end",
//                                                       e.target.value
//                                                     )
//                                                   }
//                                                 />
//                                               </div>
//                                             </div>
//                                           </div>
//                                         );
//                                       })}

//                                       <p className="text-[11px] text-gray-500">
//                                         Example: Monday 10:00–13:00 and
//                                         Wednesday 16:00–19:00 at the same
//                                         hospital. Backend will auto-create
//                                         1-hour slots within each range for the
//                                         next ~30 days.
//                                       </p>
//                                     </div>
//                                   </>
//                                 )}
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       )}
//                     </div>
//                   )}

//                   {selectedHospitals.length > 0 && (
//                     <p className="mt-2 text-xs text-gray-600">
//                       Selected: {selectedHospitals.length}.{" "}
//                       {primaryHospital
//                         ? "Primary set."
//                         : "Choose a primary hospital."}
//                     </p>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* RIGHT */}
//           <aside className="md:col-span-2 space-y-6">
//             <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//               <p className="mb-3 text-sm font-medium text-gray-900">
//                 Profile photo <span className="text-red-600">*</span>
//               </p>
//               {profilePreview ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={profilePreview}
//                   alt="Preview"
//                   className="mb-3 h-28 w-28 rounded-xl object-cover ring-1 ring-gray-200"
//                 />
//               ) : (
//                 <div className="mb-3 grid h-28 w-28 place-items-center rounded-xl bg-gray-100 text-xs text-gray-500">
//                   No photo
//                 </div>
//               )}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) =>
//                   setForm((f) => ({
//                     ...f,
//                     profileFile: e.target.files?.[0],
//                   }))
//                 }
//                 required
//                 className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
//               />
//               <p className="mt-1 text-xs text-gray-500">
//                 JPG/PNG/WebP up to ~3–5MB.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//               <Button className="w-full" disabled={loading}>
//                 {loading ? "Submitting…" : "Submit for approval"}
//               </Button>
//               <p className="mt-3 text-center text-sm text-gray-600">
//                 Already approved?{" "}
//                 <Link
//                   href="/login"
//                   className="text-[var(--brand,#4b7eff)] hover:underline"
//                 >
//                   Log in
//                 </Link>
//               </p>
//             </div>
//           </aside>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Role = "therapist" | "receptionist";

type Hospital = {
  _id: string;
  name: string;
  city?: string;
  address?: string;
};

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAY_OPTIONS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type DaySchedule = {
  enabled: boolean;
  start: string;
  end: string;
};

type ClinicSchedulePayload = {
  hospitalId: string;
  days: {
    day: DayKey;
    start: string;
    end: string;
  }[];
};

const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
const PHONE_REGEX = /^\d{4}-\d{7}$/;

function formatCNIC(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 13);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 12);
  const part3 = digits.slice(12, 13);
  let out = part1;
  if (part2) out += "-" + part2;
  if (part3) out += "-" + part3;
  return out;
}

function formatPhone(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  const part1 = digits.slice(0, 4);
  const part2 = digits.slice(4, 11);
  let out = part1;
  if (part2) out += "-" + part2;
  return out;
}

export default function RegisterStaffPage() {
  const [role, setRole] = useState<Role>("therapist");
  const therapist = role === "therapist";

  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    cnic: string;
    profileFile?: File;
    // therapist-only
    specializations: string;
    yearsExperience: string;
    licensingCouncil: string;
    bio: string;
    certFiles?: FileList;
  }>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    cnic: "",
    profileFile: undefined,
    specializations: "",
    yearsExperience: "",
    licensingCouncil: "",
    bio: "",
    certFiles: undefined,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospLoading, setHospLoading] = useState(false);
  const [hospErr, setHospErr] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [primaryHospital, setPrimaryHospital] = useState<string | null>(null);
  const [hospSearch, setHospSearch] = useState("");

  // For receptionist single hospital selection
  const [hospitalId, setHospitalId] = useState("");

  // Pricing (PKR only)
  const [feesOnline, setFeesOnline] = useState<string>("");
  const [feesInPerson, setFeesInPerson] = useState<string>("");

  // Per-hospital fee overrides
  const [hospitalFees, setHospitalFees] = useState<Record<string, string>>({});

  // Per-hospital, per-day schedule
  const [hospitalSchedule, setHospitalSchedule] = useState<
    Record<string, Record<DayKey, DaySchedule>>
  >({});

  // UI state
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const profilePreview = useMemo(
    () => (form.profileFile ? URL.createObjectURL(form.profileFile) : ""),
    [form.profileFile]
  );

  // Load hospitals (for BOTH therapist & receptionist)
  useEffect(() => {
    (async () => {
      try {
        setHospErr("");
        setHospLoading(true);
        const res = await fetch(`${API}api/public/hospitals`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.msg || "Unable to load hospitals");
        setHospitals(Array.isArray(data) ? data : data?.hospitals || []);
      } catch (e: any) {
        setHospErr(e.message || "Failed to load hospitals");
      } finally {
        setHospLoading(false);
      }
    })();
  }, []);

  // Keep therapist primaryHospital in sync
  useEffect(() => {
    if (primaryHospital && !selectedHospitals.includes(primaryHospital)) {
      setPrimaryHospital(selectedHospitals[0] || null);
    }
  }, [selectedHospitals, primaryHospital]);

  // Clear therapist-only state when switching to receptionist
  useEffect(() => {
    if (!therapist) {
      setSelectedHospitals([]);
      setPrimaryHospital(null);
      setFeesOnline("");
      setFeesInPerson("");
      setHospitalFees({});
      setHospitalSchedule({});
      // Also clear receptionist hospital when switching FROM receptionist
      setHospitalId("");
    }
  }, [therapist]);

  const filteredHospitals = useMemo(() => {
    const q = hospSearch.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.city || "").toLowerCase().includes(q) ||
        (h.address || "").toLowerCase().includes(q)
    );
  }, [hospitals, hospSearch]);

  function ensureHospitalSchedule(id: string) {
    setHospitalSchedule((prev) => {
      if (prev[id]) return prev;
      const base: Record<DayKey, DaySchedule> = {
        mon: { enabled: false, start: "", end: "" },
        tue: { enabled: false, start: "", end: "" },
        wed: { enabled: false, start: "", end: "" },
        thu: { enabled: false, start: "", end: "" },
        fri: { enabled: false, start: "", end: "" },
        sat: { enabled: false, start: "", end: "" },
        sun: { enabled: false, start: "", end: "" },
      };
      return { ...prev, [id]: base };
    });
  }

  function toggleHospital(id: string) {
    setSelectedHospitals((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        const next = prev.filter((x) => x !== id);
        setHospitalFees((fees) => {
          const { [id]: _, ...rest } = fees;
          return rest;
        });
        setHospitalSchedule((s) => {
          const { [id]: _, ...rest } = s;
          return rest;
        });
        return next;
      } else {
        ensureHospitalSchedule(id);
        return [...prev, id];
      }
    });
  }

  function toggleDay(hospitalId: string, day: DayKey) {
    setHospitalSchedule((prev) => {
      const existing = prev[hospitalId] ?? {
        mon: { enabled: false, start: "", end: "" },
        tue: { enabled: false, start: "", end: "" },
        wed: { enabled: false, start: "", end: "" },
        thu: { enabled: false, start: "", end: "" },
        fri: { enabled: false, start: "", end: "" },
        sat: { enabled: false, start: "", end: "" },
        sun: { enabled: false, start: "", end: "" },
      };
      const daySched = existing[day] ?? {
        enabled: false,
        start: "",
        end: "",
      };
      return {
        ...prev,
        [hospitalId]: {
          ...existing,
          [day]: { ...daySched, enabled: !daySched.enabled },
        },
      };
    });
  }

  function updateHospitalTime(
    hospitalId: string,
    day: DayKey,
    field: "start" | "end",
    value: string
  ) {
    setHospitalSchedule((prev) => {
      const existing = prev[hospitalId] ?? {
        mon: { enabled: false, start: "", end: "" },
        tue: { enabled: false, start: "", end: "" },
        wed: { enabled: false, start: "", end: "" },
        thu: { enabled: false, start: "", end: "" },
        fri: { enabled: false, start: "", end: "" },
        sat: { enabled: false, start: "", end: "" },
        sun: { enabled: false, start: "", end: "" },
      };
      const daySched = existing[day] ?? {
        enabled: false,
        start: "",
        end: "",
      };
      return {
        ...prev,
        [hospitalId]: {
          ...existing,
          [day]: { ...daySched, [field]: value },
        },
      };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setLoading(true);

    try {
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.phone ||
        !form.cnic
      ) {
        throw new Error("Please fill all required fields.");
      }

      if (role === "receptionist") {
        if (!hospitalId) {
          throw new Error("Please select a hospital for the receptionist.");
        }
      }

      if (!form.profileFile) throw new Error("Profile picture is required.");

      if (!CNIC_REGEX.test(form.cnic)) {
        throw new Error("CNIC must be in the format XXXXX-XXXXXXX-X.");
      }
      if (!PHONE_REGEX.test(form.phone)) {
        throw new Error("Phone must be in the format XXXX-XXXXXXX.");
      }

      if (therapist) {
        if (!form.specializations?.trim())
          throw new Error("Add at least one specialization.");
        if (!form.certFiles?.length)
          throw new Error("Upload at least one certification document.");
        if (selectedHospitals.length > 0 && !primaryHospital) {
          throw new Error("Please choose a primary hospital.");
        }

        // Validate schedule per hospital
        for (const hid of selectedHospitals) {
          const schedForHospital = hospitalSchedule[hid];
          if (!schedForHospital) {
            throw new Error(
              "Please set days and time for each selected clinic/hospital."
            );
          }

          const activeDays = DAY_OPTIONS.filter(
            (d) => schedForHospital[d.key]?.enabled
          );

          if (!activeDays.length) {
            throw new Error(
              "Select at least one working day for each clinic/hospital."
            );
          }

          for (const d of activeDays) {
            const ds = schedForHospital[d.key];
            if (!ds.start || !ds.end) {
              throw new Error(
                `Provide start and end time for ${d.label} at each clinic/hospital.`
              );
            }
            if (ds.start >= ds.end) {
              throw new Error(
                `End time must be later than start time for ${d.label}.`
              );
            }
          }
        }
      }

      const fd = new FormData();
      fd.set("role", role);
      fd.set("name", form.name);
      fd.set("email", form.email);
      fd.set("password", form.password);
      fd.set("phone", form.phone);
      fd.set("cnic", form.cnic);
      fd.append("profilePicture", form.profileFile);

      if (therapist) {
        // Therapist: dummy address + DOB to satisfy any backend fields if needed
        fd.set("address", "N/A");
        fd.set("dateOfBirth", "2000-01-01");
      } else {
        // Receptionist: no address / DOB required, send blank
        fd.set("address", "");
        fd.set("dateOfBirth", "");
        // Hospital is REQUIRED for receptionist
        fd.set("primaryHospital", hospitalId);
        fd.append("affiliatedHospitals", hospitalId);
      }

      if (therapist) {
        fd.set("specializations", form.specializations);
        fd.set("yearsExperience", String(form.yearsExperience || 0));
        fd.set("licensingCouncil", form.licensingCouncil || "");
        fd.set("bio", form.bio || "");

        Array.from(form.certFiles || []).forEach((f: File) =>
          fd.append("certificationFiles", f)
        );

        selectedHospitals.forEach((id) => fd.append("affiliatedHospitals", id));
        if (primaryHospital) fd.set("primaryHospital", primaryHospital);

        // Fees PKR only
        fd.set("feesCurrency", "PKR");
        if (feesOnline !== "") fd.set("feesOnline", feesOnline);
        if (feesInPerson !== "") fd.set("feesInPerson", feesInPerson);

        Object.entries(hospitalFees).forEach(([hid, amt]) => {
          if (selectedHospitals.includes(hid) && amt !== "") {
            fd.set(`hospitalFee[${hid}]`, amt);
          }
        });

        // Build clinicSchedules payload
        const clinicSchedules: ClinicSchedulePayload[] = selectedHospitals.map(
          (hid) => {
            const schedForHospital = hospitalSchedule[hid] || {};
            const days = DAY_OPTIONS.flatMap((d) => {
              const ds = schedForHospital[d.key];
              if (!ds || !ds.enabled || !ds.start || !ds.end) return [];
              return [
                {
                  day: d.key,
                  start: ds.start,
                  end: ds.end,
                },
              ];
            });
            return { hospitalId: hid, days };
          }
        );

        if (clinicSchedules.some((c) => c.days.length)) {
          fd.set("clinicSchedules", JSON.stringify(clinicSchedules));
        }
      }

      const res = await fetch(`${API}api/auth/register`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Registration failed");

      setInfo(
        data?.message ||
          (role === "receptionist"
            ? "Receptionist account submitted. Awaiting admin approval."
            : "Therapist account submitted. Awaiting admin approval.")
      );
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700 hover:underline">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span>Register (Staff)</span>
        </div>

        {/* Heading */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Register staff account
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Submit your details to request access. Admin approval is required
              before you can sign in.
            </p>
          </div>

          {/* Role segmented control */}
          <div className="rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <nav
              className="flex text-xs sm:text-sm font-medium"
              aria-label="Select role"
            >
              <button
                type="button"
                onClick={() => setRole("therapist")}
                className={`flex-1 rounded-full px-3 py-1.5 transition ${
                  role === "therapist"
                    ? "bg-[var(--brand,#4b7eff)] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Therapist
              </button>
              <button
                type="button"
                onClick={() => setRole("receptionist")}
                className={`flex-1 rounded-full px-3 py-1.5 transition ${
                  role === "receptionist"
                    ? "bg-[var(--brand,#4b7eff)] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Receptionist
              </button>
            </nav>
          </div>
        </header>

        {/* Alerts */}
        {err && (
          <div
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <span className="mt-[2px] text-base">⚠️</span>
            <p>{err}</p>
          </div>
        )}
        {info && (
          <div
            className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
            role="status"
          >
            <span className="mt-[2px] text-base">✅</span>
            <p>{info}</p>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          {/* LEFT */}
          <div className="space-y-6">
            {/* Section: Basic details */}
            <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Basic information
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    We&apos;ll use this to create your staff account.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                  Role:{" "}
                  <span className="ml-1 capitalize text-[var(--brand,#4b7eff)]">
                    {role}
                  </span>
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <Input
                  type="email"
                  placeholder="Work email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Use at least 8 characters with a mix of letters and
                    numbers.
                  </p>
                </div>

                <div>
                  <Input
                    placeholder="Phone (e.g. 0300-1234567)"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        phone: formatPhone(e.target.value),
                      }))
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Format: 03xx-xxxxxxx
                  </p>
                </div>

                <div>
                  <Input
                    placeholder="CNIC (e.g. 12345-1234567-1)"
                    value={form.cnic}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        cnic: formatCNIC(e.target.value),
                      }))
                    }
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Must match NADRA record.
                  </p>
                </div>

                {/* Receptionist-only: HOSPITAL DROPDOWN */}
                {role === "receptionist" && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Hospital / clinic <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={hospitalId}
                      onChange={(e) => setHospitalId(e.target.value)}
                      className="mt-0.5 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-1 focus:ring-[var(--brand,#4b7eff)]"
                      required
                    >
                      <option value="">
                        {hospLoading
                          ? "Loading hospitals..."
                          : "Select hospital"}
                      </option>
                      {hospitals.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.name}
                          {h.city ? ` – ${h.city}` : ""}
                        </option>
                      ))}
                    </select>
                    {hospErr && (
                      <p className="mt-1 text-xs text-red-600">{hospErr}</p>
                    )}
                    {!hospLoading && !hospErr && !hospitals.length && (
                      <p className="mt-1 text-xs text-gray-500">
                        No hospitals are available yet. Please contact admin.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Therapist-only details + hospitals */}
            {therapist && (
              <>
                {/* Pricing */}
                <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Pricing
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Set your consultation fees. You can override per clinic.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                      Currency: PKR
                    </span>
                  </div>

                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-700">
                        Currency
                      </label>
                      <Input value="PKR" disabled />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-700">
                        Online fee (PKR)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 2000"
                        value={feesOnline}
                        onChange={(e) => setFeesOnline(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-700">
                        Default in-person fee (PKR)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 3000"
                        value={feesInPerson}
                        onChange={(e) => setFeesInPerson(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    These are base fees in PKR. You can set custom in-person
                    fees for each clinic below.
                  </p>
                </section>

                {/* Therapist details */}
                <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Therapist profile
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    This information helps patients understand your background.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Specializations (comma separated)"
                      value={form.specializations}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          specializations: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Years of experience"
                      value={form.yearsExperience}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          yearsExperience: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Licensing council"
                      value={form.licensingCouncil}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          licensingCouncil: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <label className="mt-4 mb-1 block text-xs text-gray-700">
                    Short bio
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[var(--brand,#4b7eff)] focus:outline-none focus:ring-1 focus:ring-[var(--brand,#4b7eff)]"
                    rows={3}
                    placeholder="Share your approach, modalities, and what clients can expect."
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                  />

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Certification documents{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          certFiles: e.target.files || undefined,
                        }))
                      }
                      required
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      Upload degrees, certifications, or registrations. You can
                      upload multiple files.
                    </p>
                  </div>
                </section>

                {/* Clinics / Hospitals for therapist */}
                <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Clinics & schedule
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Select where you practice in-person and set your working
                        hours.
                      </p>
                    </div>
                    <div className="w-full max-w-xs">
                      <Input
                        placeholder="Search clinics..."
                        value={hospSearch}
                        onChange={(e) => setHospSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {hospErr && (
                    <p className="mt-2 text-xs text-red-600">{hospErr}</p>
                  )}

                  {hospLoading ? (
                    <div className="mt-3 space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-10 rounded-md bg-gray-100 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-gray-100 bg-slate-50/60">
                      {!filteredHospitals.length ? (
                        <p className="p-3 text-sm text-gray-500">
                          No clinics found. Try a different search.
                        </p>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {filteredHospitals.map((h) => {
                            const checked = selectedHospitals.includes(h._id);
                            const sched = hospitalSchedule[h._id];
                            return (
                              <li key={h._id} className="px-3 py-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleHospital(h._id)}
                                      className="h-4 w-4 rounded border-gray-300 text-[var(--brand,#4b7eff)] focus:ring-[var(--brand,#4b7eff)]"
                                    />
                                    <div>
                                      <div className="font-medium text-slate-900">
                                        {h.name}
                                      </div>
                                      {(h.city || h.address) && (
                                        <div className="text-[11px] text-gray-500">
                                          {[h.city, h.address]
                                            .filter(Boolean)
                                            .join(" • ")}
                                        </div>
                                      )}
                                    </div>
                                  </label>

                                  <label className="flex items-center gap-2 text-xs text-gray-600">
                                    <input
                                      type="radio"
                                      name="primaryHospital"
                                      disabled={!checked}
                                      checked={primaryHospital === h._id}
                                      onChange={() =>
                                        setPrimaryHospital(h._id)
                                      }
                                      className="h-3.5 w-3.5 text-[var(--brand,#4b7eff)] focus:ring-[var(--brand,#4b7eff)]"
                                    />
                                    <span>
                                      Primary clinic{" "}
                                      {primaryHospital === h._id && "✓"}
                                    </span>
                                  </label>
                                </div>

                                {checked && (
                                  <>
                                    <div className="mt-2 pl-6 flex items-center gap-2">
                                      <div className="w-full max-w-xs">
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="Override in-person fee (PKR)"
                                          value={hospitalFees[h._id] || ""}
                                          onChange={(e) =>
                                            setHospitalFees((prev) => ({
                                              ...prev,
                                              [h._id]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <span className="text-[11px] text-gray-500">
                                        PKR (optional)
                                      </span>
                                    </div>

                                    <div className="mt-3 pl-6 space-y-3">
                                      <p className="text-[11px] font-medium text-gray-700">
                                        Working days & time at this clinic
                                      </p>

                                      {DAY_OPTIONS.map((d) => {
                                        const daySched = sched?.[d.key] ?? {
                                          enabled: false,
                                          start: "",
                                          end: "",
                                        };

                                        return (
                                          <div
                                            key={d.key}
                                            className="grid grid-cols-[auto,1fr] items-center gap-3 text-xs"
                                          >
                                            <label className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={daySched.enabled}
                                                onChange={() =>
                                                  toggleDay(h._id, d.key)
                                                }
                                                className="h-3.5 w-3.5 rounded border-gray-300 text-[var(--brand,#4b7eff)] focus:ring-[var(--brand,#4b7eff)]"
                                              />
                                              <span>{d.label}</span>
                                            </label>

                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <label className="mb-1 block text-[11px] text-gray-600">
                                                  Start
                                                </label>
                                                <Input
                                                  type="time"
                                                  value={daySched.start}
                                                  disabled={!daySched.enabled}
                                                  onChange={(e) =>
                                                    updateHospitalTime(
                                                      h._id,
                                                      d.key,
                                                      "start",
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>
                                              <div>
                                                <label className="mb-1 block text-[11px] text-gray-600">
                                                  End
                                                </label>
                                                <Input
                                                  type="time"
                                                  value={daySched.end}
                                                  disabled={!daySched.enabled}
                                                  onChange={(e) =>
                                                    updateHospitalTime(
                                                      h._id,
                                                      d.key,
                                                      "end",
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}

                                      <p className="text-[11px] text-gray-500">
                                        Example: Monday 10:00–13:00 and
                                        Wednesday 16:00–19:00 at the same
                                        hospital. Backend will auto-create
                                        1-hour slots within each range for the
                                        next ~30 days.
                                      </p>
                                    </div>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {selectedHospitals.length > 0 && (
                    <p className="mt-3 text-xs text-gray-600">
                      Selected clinics:{" "}
                      <span className="font-medium">
                        {selectedHospitals.length}
                      </span>
                      .{" "}
                      {primaryHospital ? (
                        <span className="text-emerald-700">
                          Primary clinic set.
                        </span>
                      ) : (
                        <span className="text-amber-700">
                          Don&apos;t forget to choose a primary clinic.
                        </span>
                      )}
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          {/* RIGHT */}
          <aside className="space-y-6 md:pl-2 md:sticky md:top-24 self-start">
            {/* Profile photo card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <p className="mb-1 text-sm font-semibold text-gray-900">
                Profile photo <span className="text-red-600">*</span>
              </p>
              <p className="mb-3 text-xs text-gray-500">
                A clear, professional headshot helps patients recognize you.
              </p>

              {profilePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="mb-3 h-28 w-28 rounded-xl object-cover ring-1 ring-gray-200"
                />
              ) : (
                <div className="mb-3 grid h-28 w-28 place-items-center rounded-xl bg-gray-100 text-[11px] text-gray-500">
                  No photo selected
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    profileFile: e.target.files?.[0],
                  }))
                }
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                JPG / PNG / WebP up to ~3–5MB. Square or 1:1 works best.
              </p>
            </div>

            {/* Submit card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Submit for approval
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                We will review your details and notify you once your account is
                approved.
              </p>

              <Button
                className="mt-4 w-full"
                disabled={loading}
                type="submit"
              >
                {loading ? "Submitting…" : "Submit for approval"}
              </Button>

              <p className="mt-3 text-center text-xs text-gray-600">
                Already approved?{" "}
                <Link
                  href="/login"
                  className="text-[var(--brand,#4b7eff)] hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
