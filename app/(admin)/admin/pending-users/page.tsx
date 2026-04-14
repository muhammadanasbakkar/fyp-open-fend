// // app/admin/pending-users/page.tsx
// "use client";
// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Button from "@/components/Button";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import { useAuth } from "@/lib/auth";
// import Image from "next/image";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// // type PendingUser = {
// //   _id: string;
// //   name: string;
// //   email: string;
// //   role: "therapist" | "receptionist";
// //   phone?: string;
// //   address?: string;
// //   dateOfBirth?: string;
// //   cnic?: string;
// //   profilePicture?: string;
// //   therapistInfo?: {
// //     specializations?: string[];
// //     yearsExperience?: number;
// //     licenseNumber?: string;
// //     licensingCouncil?: string;
// //     clinicAddress?: string;
// //     bio?: string;
// //     certifications?: { name?: string; fileUrl: string }[];
// //     modalities?: string[];
// //     concerns?: string[];
// //     populations?: string[];
// //     careSettings?: string[];
// //   };
// // };

// type PendingUser = {
//   _id: string;
//   name: string;
//   email: string;
//   role: "therapist" | "receptionist";
//   phone?: string;
//   address?: string;
//   dateOfBirth?: string;
//   cnic?: string;

//   // Legacy field (full URL) OR new field (key)
//   profilePicture?: string; // legacy URL (may be S3/CloudFront)
//   profilePictureKey?: string; // new (preferred)

//   therapistInfo?: {
//     specializations?: string[];
//     yearsExperience?: number;
//     licenseNumber?: string;
//     licensingCouncil?: string;
//     clinicAddress?: string;
//     bio?: string;
//     certifications?: {
//       name?: string;

//       // Legacy or new
//       fileUrl?: string; // legacy URL
//       fileKey?: string; // new (preferred)
//     }[];
//     modalities?: string[];
//     concerns?: string[];
//     populations?: string[];
//     careSettings?: string[];
//   };
// };

// function toCDN(url?: string) {
//   if (!url) return "";
//   try {
//     const u = new URL(url);
//     // Replace S3 domain with CloudFront
//     return `${process.env.NEXT_PUBLIC_CDN_BASE}${u.pathname}`;
//   } catch {
//     return url; // fallback if it's already a CDN URL or invalid format
//   }
// }

// function isAbsoluteUrl(u?: string) {
//   return !!u && /^https?:\/\//i.test(u);
// }

// function buildCdnUrl(key?: string) {
//   if (!key) return "";
//   const base = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/+$/, "");
//   const k = key.replace(/^\/+/, "");
//   return `${base}/${encodeURI(k)}`;
// }

// /** Prefer key→CDN, else use absolute URL if present, else "" */
// function pickImageSrc(key?: string, legacyUrl?: string) {
//   if (key) return buildCdnUrl(key);
//   if (isAbsoluteUrl(legacyUrl)) return legacyUrl!;
//   // If legacy “full S3 URL” accidentally saved in `key`, try to extract a key:
//   if (legacyUrl && /amazonaws\.com\//.test(legacyUrl)) {
//     const m = legacyUrl.match(/amazonaws\.com\/(.+)$/);
//     if (m?.[1]) return buildCdnUrl(m[1]);
//   }
//   return legacyUrl || ""; // last resort
// }

// export default function PendingUsersPage() {
//   const router = useRouter();
//   const { user, token, hydrated } = useAuth();

//   const [data, setData] = useState<PendingUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [q, setQ] = useState("");
//   const [filterRole, setFilterRole] = useState<
//     "" | "therapist" | "receptionist"
//   >("");

//   useEffect(() => {
//     if (!hydrated) return;
//     if (!user || user.role !== "superAdmin") {
//       // Simple guard — you can replace with a dedicated 403 page
//       router.replace("/login");
//       return;
//     }
//     (async () => {
//       setErr("");
//       setLoading(true);
//       try {
//         const res = await fetch(`${API}api/auth/pending-users`, {
//           method: "GET",
//           headers: { Authorization: `Bearer ${token}` },
//           credentials: "include",
//         });
//         const json = await res.json();
//         if (!res.ok)
//           throw new Error(json?.msg || "Failed to fetch pending users");
//         setData(json as PendingUser[]);
//       } catch (e: any) {
//         setErr(e.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [hydrated, user, token, router]);

//   async function act(id: string, action: "approve" | "reject") {
//     if (!token) return;
//     try {
//       const res = await fetch(`${API}api/auth/${action}-user/${id}`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         credentials: "include",
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json?.msg || `${action} failed`);
//       // Optimistic update
//       setData((prev) => prev.filter((u) => u._id !== id));
//     } catch (e: any) {
//       alert(e.message || "Operation failed");
//     }
//   }

//   const filtered = useMemo(() => {
//     const term = q.trim().toLowerCase();
//     return data.filter((u) => {
//       const matchesRole = filterRole ? u.role === filterRole : true;
//       if (!term) return matchesRole;
//       const hay = [
//         u.name,
//         u.email,
//         u.role,
//         u.phone,
//         u.address,
//         u.cnic,
//         ...(u.therapistInfo?.specializations || []),
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return matchesRole && hay.includes(term);
//     });
//   }, [data, q, filterRole]);

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//       <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
//         <div className="mb-4 text-sm text-gray-500">
//           <Link href="/" className="hover:underline">
//             Home
//           </Link>{" "}
//           <span>›</span> <span>Admin</span> <span>›</span>{" "}
//           <span>Pending users</span>
//         </div>

//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-semibold tracking-tight">
//               Pending Users
//             </h1>
//             <p className="text-sm text-gray-600">
//               Approve or reject therapists and receptionists.
//             </p>
//           </div>
//           <Link
//             href="/dashboard"
//             className="text-sm text-[var(--brand,#4b7eff)] hover:underline"
//           >
//             Back to dashboard
//           </Link>
//         </div>

//         {err && (
//           <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {err}
//           </div>
//         )}

//         <div className="mb-5 grid gap-3 sm:grid-cols-3">
//           <Input
//             placeholder="Search name/email/cnic/specialization"
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//           />
//           <Select
//             value={filterRole}
//             onChange={(e) => setFilterRole(e.target.value as any)}
//           >
//             <option value="">All roles</option>
//             <option value="therapist">Therapist</option>
//             <option value="receptionist">Receptionist</option>
//           </Select>
//         </div>

//         {loading ? (
//           <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//             Loading…
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-sm text-gray-600">
//             No pending users.
//           </div>
//         ) : (
//           <ul className="grid gap-4">
//             {filtered.map((u) => {
//               const profileSrc = pickImageSrc(
//                 u.profilePictureKey,
//                 u.profilePicture
//               );
//               const profilePic = process.env.NEXT_PUBLIC_CDN_BASE + profileSrc;

//               return (
//                 <li
//                   key={u._id}
//                   className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex items-start gap-4">
//                       {/* avatar */}
//                       <div className="h-12 w-12 overflow-hidden rounded-xl ring-1 ring-gray-200">
//                         {/* <Image
//                           alt={u.name}
//                           src={toCDN(profileSrc) || "/avatar-placeholder.png"}
//                           width={48}
//                           height={48}
//                           /> */}
//                         <Image
//                           alt={u.name}
//                           // className="h-full w-full object-cover"
//                           src={profilePic}
//                           className="h-full w-full object-cover"
//                           width={48}
//                           height={48}
//                         />
//                       </div>

//                       <div>
//                         <p className="text-sm font-medium text-gray-900">
//                           {u.name}{" "}
//                           <span className="ml-2 rounded-md bg-gray-100 px-2 py-0.5 text-xs">
//                             {u.role}
//                           </span>
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {u.email} {u.phone ? <>• {u.phone}</> : null}{" "}
//                           {u.cnic ? <>• CNIC: {u.cnic}</> : null}
//                         </p>
//                         {u.address && (
//                           <p className="text-xs text-gray-500 mt-1">
//                             {u.address}
//                           </p>
//                         )}

//                         {u.role === "therapist" && (
//                           <div className="mt-3 grid gap-2">
//                             {!!u.therapistInfo?.specializations?.length && (
//                               <p className="text-xs text-gray-700">
//                                 <span className="font-medium">
//                                   Specializations:
//                                 </span>{" "}
//                                 {u.therapistInfo.specializations.join(", ")}
//                               </p>
//                             )}
//                             {!!u.therapistInfo?.modalities?.length && (
//                               <p className="text-xs text-gray-700">
//                                 <span className="font-medium">Modalities:</span>{" "}
//                                 {u.therapistInfo.modalities.join(", ")}
//                               </p>
//                             )}
//                             {!!u.therapistInfo?.concerns?.length && (
//                               <p className="text-xs text-gray-700">
//                                 <span className="font-medium">Concerns:</span>{" "}
//                                 {u.therapistInfo.concerns.join(", ")}
//                               </p>
//                             )}
//                             {!!u.therapistInfo?.populations?.length && (
//                               <p className="text-xs text-gray-700">
//                                 <span className="font-medium">
//                                   Populations:
//                                 </span>{" "}
//                                 {u.therapistInfo.populations.join(", ")}
//                               </p>
//                             )}
//                             {!!u.therapistInfo?.careSettings?.length && (
//                               <p className="text-xs text-gray-700">
//                                 <span className="font-medium">
//                                   Care settings:
//                                 </span>{" "}
//                                 {u.therapistInfo.careSettings.join(", ")}
//                               </p>
//                             )}

//                             {!!u.therapistInfo?.certifications?.length && (
//                               <div className="text-xs text-gray-700">
//                                 <span className="font-medium">
//                                   Certifications:
//                                 </span>{" "}
//                                 <span className="text-gray-600">
//                                   {u.therapistInfo.certifications.length}{" "}
//                                   file(s)
//                                 </span>
//                                 <div className="mt-1 flex flex-wrap gap-2">
//                                   {u.therapistInfo.certifications
//                                     .slice(0, 4)
//                                     .map((c, i) => {
//                                       const certHref = pickImageSrc(
//                                         c.fileKey,
//                                         c.fileUrl
//                                       );
//                                       const url = isAbsoluteUrl(certHref)
//                                         ? certHref
//                                         : process.env.NEXT_PUBLIC_CDN_BASE +
//                                           certHref;
//                                       return (
//                                         <a
//                                           key={i}
//                                           href={url}
//                                           target="_blank"
//                                           rel="noreferrer"
//                                           className="inline-flex items-center rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
//                                         >
//                                           View
//                                         </a>
//                                       );
//                                     })}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex shrink-0 items-center gap-2">
//                       <Button onClick={() => act(u._id, "approve")}>
//                         Approve
//                       </Button>
//                       <button
//                         onClick={() => act(u._id, "reject")}
//                         className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// app/admin/pending-users/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PendingUser = {
  _id: string;
  name: string;
  email: string;
  role: "therapist" | "receptionist";
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  cnic?: string;

  profilePicture?: string; // legacy URL
  profilePictureKey?: string; // new key

  therapistInfo?: {
    specializations?: string[];
    yearsExperience?: number;
    licenseNumber?: string;
    licensingCouncil?: string;
    clinicAddress?: string;
    bio?: string;
    certifications?: {
      name?: string;
      fileUrl?: string;
      fileKey?: string;
    }[];
    modalities?: string[];
    concerns?: string[];
    populations?: string[];
    careSettings?: string[];
  };
};

function isAbsoluteUrl(u?: string) {
  return !!u && /^https?:\/\//i.test(u);
}

function buildCdnUrl(key?: string) {
  if (!key) return "";
  const base = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/+$/, "");
  const k = key.replace(/^\/+/, "");
  return `${base}/${encodeURI(k)}`;
}

/** Prefer key→CDN, else use absolute URL, else try to derive key from S3 URL */
function pickImageSrc(key?: string, legacyUrl?: string) {
  if (key) return buildCdnUrl(key);
  if (isAbsoluteUrl(legacyUrl)) return legacyUrl!;
  if (legacyUrl && /amazonaws\.com\//.test(legacyUrl)) {
    const m = legacyUrl.match(/amazonaws\.com\/(.+)$/);
    if (m?.[1]) return buildCdnUrl(m[1]);
  }
  return legacyUrl || "";
}

export default function PendingUsersPage() {
  const router = useRouter();
  const { user, token, hydrated } = useAuth();

  const [data, setData] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState<
    "" | "therapist" | "receptionist"
  >("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "superAdmin") {
      router.replace("/login");
      return;
    }
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`${API}api/auth/pending-users`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.msg || "Failed to fetch pending users");
        setData(json as PendingUser[]);
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, user, token, router]);

  async function act(id: string, action: "approve" | "reject") {
    if (!token) return;
    try {
      const res = await fetch(`${API}api/auth/${action}-user/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || `${action} failed`);
      setData((prev) => prev.filter((u) => u._id !== id));
    } catch (e: any) {
      alert(e.message || "Operation failed");
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((u) => {
      const matchesRole = filterRole ? u.role === filterRole : true;
      if (!term) return matchesRole;
      const hay = [
        u.name,
        u.email,
        u.role,
        u.phone,
        u.address,
        u.cnic,
        ...(u.therapistInfo?.specializations || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesRole && hay.includes(term);
    });
  }, [data, q, filterRole]);

  const pendingCount = data.length;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span>/</span>
          <span>Admin</span>
          <span>/</span>
          <span className="font-medium text-gray-700">Pending users</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Pending Users
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review therapists and receptionists before they get access.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#4b7eff]/10 px-3 py-1 text-xs font-semibold text-[#4b7eff]">
                {pendingCount} pending
              </span>
            )}
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#4b7eff] hover:underline"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        {err && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Filters card */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-800">
              Filter and search
            </p>
            {filtered.length !== pendingCount && (
              <p className="text-xs text-gray-500">
                Showing {filtered.length} of {pendingCount}
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search name, email, CNIC or specialization"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
            >
              <option value="">All roles</option>
              <option value="therapist">Therapist</option>
              <option value="receptionist">Receptionist</option>
            </Select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl border border-gray-100 bg-white/80 shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-8 text-center text-sm text-gray-600">
            <p className="font-medium text-gray-800">
              No pending users right now
            </p>
            <p className="mt-1 text-xs text-gray-500">
              New therapist or receptionist requests will appear here for
              review.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((u) => {
              const rawProfileSrc = pickImageSrc(
                u.profilePictureKey,
                u.profilePicture
              );
              const profileSrc =
                rawProfileSrc && rawProfileSrc.trim().length > 0
                  ? rawProfileSrc
                  : "/avatar-placeholder.png";

              const roleColorClasses =
                u.role === "therapist"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                  : "bg-indigo-50 text-indigo-700 ring-indigo-100";
              return (
                <li
                  key={u._id}
                  className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-gray-200 bg-gray-100">
                        <Image
                          alt={u.name}
                          src={process.env.NEXT_PUBLIC_CDN_BASE! + profileSrc}
                          className="h-full w-full object-cover"
                          width={48}
                          height={48}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {u.name}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${roleColorClasses}`}
                          >
                            {u.role === "therapist"
                              ? "Therapist"
                              : "Receptionist"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {u.email}
                          {u.phone && (
                            <>
                              {" "}
                              • <span>{u.phone}</span>
                            </>
                          )}
                          {u.cnic && (
                            <>
                              {" "}
                              • <span>CNIC: {u.cnic}</span>
                            </>
                          )}
                        </p>

                        {u.address && (
                          <p className="mt-1 text-xs text-gray-500">
                            {u.address}
                          </p>
                        )}

                        {u.role === "therapist" && (
                          <div className="mt-3 grid gap-1.5 text-xs text-gray-700">
                            {!!u.therapistInfo?.specializations?.length && (
                              <p>
                                <span className="font-medium">
                                  Specializations:
                                </span>{" "}
                                {u.therapistInfo.specializations.join(", ")}
                              </p>
                            )}
                            {!!u.therapistInfo?.modalities?.length && (
                              <p>
                                <span className="font-medium">Modalities:</span>{" "}
                                {u.therapistInfo.modalities.join(", ")}
                              </p>
                            )}
                            {!!u.therapistInfo?.concerns?.length && (
                              <p>
                                <span className="font-medium">Concerns:</span>{" "}
                                {u.therapistInfo.concerns.join(", ")}
                              </p>
                            )}
                            {!!u.therapistInfo?.populations?.length && (
                              <p>
                                <span className="font-medium">
                                  Populations:
                                </span>{" "}
                                {u.therapistInfo.populations.join(", ")}
                              </p>
                            )}
                            {!!u.therapistInfo?.careSettings?.length && (
                              <p>
                                <span className="font-medium">
                                  Care settings:
                                </span>{" "}
                                {u.therapistInfo.careSettings.join(", ")}
                              </p>
                            )}

                            {!!u.therapistInfo?.certifications?.length && (
                              <div className="mt-1">
                                <span className="font-medium">
                                  Certifications:
                                </span>{" "}
                                <span className="text-gray-600">
                                  {u.therapistInfo.certifications.length} file
                                  {u.therapistInfo.certifications.length > 1
                                    ? "s"
                                    : ""}
                                </span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {u.therapistInfo.certifications
                                    .slice(0, 4)
                                    .map((c, i) => {
                                      const certHref = pickImageSrc(
                                        c.fileKey,
                                        c.fileUrl
                                      );
                                      const url = isAbsoluteUrl(certHref)
                                        ? certHref
                                        : buildCdnUrl(certHref);
                                      if (!url) return null;
                                      return (
                                        <a
                                          key={i}
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-gray-50"
                                        >
                                          View file {i + 1}
                                        </a>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 self-end md:self-start">
                      <Button
                        onClick={() => act(u._id, "approve")}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] hover:brightness-105 active:brightness-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff] focus-visible:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Approve
                      </Button>
                      <button
                        onClick={() => act(u._id, "reject")}
                        className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
