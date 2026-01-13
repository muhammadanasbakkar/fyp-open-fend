// // // "use client";
// // // import Protected from "@/components/Protected";
// // // import RoleGuard from "@/components/RoleGuard";
// // // import Link from "next/link";
// // // import { useAuth } from "@/lib/auth";
// // // import ReceptionistBookingPage from "@/components/ReceptionistBookingPage";

// // // export default function Dashboard() {
// // //   const { user } = useAuth();






// // //   // If user is receptionist, only show receptionist content
// // //   if (user?.role === "receptionist") {
// // //     return (
// // //       <Protected>
// // //         <ReceptionistBookingPage />
// // //         {/* <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
// // //           <h1 className="text-2xl font-semibold">Receptionist Dashboard</h1>
// // //           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //             <Card title="Reception booking" href="/receptionist/book" />
// // //             <Card title="My appointments" href="/appointments/my" />
// // //           </div>
// // //           <p className="text-sm text-gray-500">Logged in as <strong>receptionist</strong>.</p>
// // //         </div> */}
// // //       </Protected>
// // //     );
// // //   }

// // //   // All other roles
// // //   return (
// // //     <Protected>
// // //       <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
// // //         <h1 className="text-2xl font-semibold">Dashboard</h1>
// // //         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //           <Card title="Book an appointment" href="/appointments/book" />
// // //           <Card title="My appointments" href="/appointments/my" />
// // //           <RoleGuard roles={["therapist"]}>
// // //             <Card title="Manage availability" href="/availability" />
// // //           </RoleGuard>
// // //           <RoleGuard roles={["superAdmin"]}>
// // //             <Card title="Pending users" href="/admin/pending-users" />
// // //           </RoleGuard>
// // //         </div>
// // //         <p className="text-sm text-gray-500">Logged in as <strong>{user?.role}</strong>.</p>
// // //       </div>
// // //     </Protected>
// // //   );
// // // }

// // // function Card({ title, href }: { title: string; href: string }) {
// // //   return (
// // //     <Link href={href} className="block rounded-xl border p-6 hover:shadow-sm">
// // //       <h3 className="font-medium">{title}</h3>
// // //       <p className="text-sm text-gray-500 mt-1">Open</p>
// // //     </Link>
// // //   );
// // // }


// // "use client";
// // import Protected from "@/components/Protected";
// // import RoleGuard from "@/components/RoleGuard";
// // import Link from "next/link";
// // import SpecialtiesModal from "./SpecialtiesModal";
// // import { useAuth } from "@/lib/auth";
// // import ReceptionistBookingPage from "@/components/ReceptionistBookingPage";
// // import { useState } from "react";

// // export default function Dashboard() {
// //   const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false);
// //   const { user } = useAuth();
// //   const roleLabel = user?.role
// //     ? user.role === "superAdmin"
// //       ? "Super Admin"
// //       : user.role.charAt(0).toUpperCase() + user.role.slice(1)
// //     : "User";

// //   // Receptionist only view
// //   if (user?.role === "receptionist") {
// //     return (
// //       <Protected>
// //         <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
// //           <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
// //             <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// //               <div>
// //                 <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)]">
// //                   <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
// //                   Receptionist workspace
// //                 </p>
// //                 <h1 className="mt-3 text-2xl font-semibold tracking-tight">
// //                   Receptionist dashboard
// //                 </h1>
// //                 <p className="mt-1 text-sm text-gray-600">
// //                   Book appointments on behalf of patients. Manage the day schedule in one place.
// //                 </p>
// //               </div>

// //               <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
// //                 <div className="flex items-center justify-between gap-3">
// //                   <span className="font-medium text-gray-900">Signed in as</span>
// //                   <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
// //                     Receptionist
// //                   </span>
// //                 </div>
// //                 <p className="mt-1 truncate text-[11px] text-gray-500">
// //                   {user?.email || "Reception account"}
// //                 </p>
// //               </div>
// //             </header>

// //             <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
// //               <ReceptionistBookingPage />
// //             </div>
// //           </div>
// //         </div>
// //       </Protected>
// //     );
// //   }

// //   // All other roles
// //   return (
// //     <Protected>
// //       <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
// //         <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
// //           {/* Header */}
// //           <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// //             <div>
// //               <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)]">
// //                 <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
// //                 TheraKonnect dashboard
// //               </p>
// //               <h1 className="mt-3 text-2xl font-semibold tracking-tight">
// //                 Welcome back
// //               </h1>
// //               <p className="mt-1 text-sm text-gray-600">
// //                 Quickly jump into bookings, manage your schedule, and review appointments from one place.
// //               </p>
// //             </div>

// //             <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
// //               <div className="flex items-center justify-between gap-3">
// //                 <span className="font-medium text-gray-900">Signed in as</span>
// //                 <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
// //                   {roleLabel}
// //                 </span>
// //               </div>
// //               <p className="mt-1 truncate text-[11px] text-gray-500">
// //                 {user?.email || "Account"}
// //               </p>
// //             </div>
// //           </header>

// //           {/* Quick actions */}
// //           <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
// //             <Card
// //               title="Book an appointment"
// //               desc="Find an available slot and confirm in a few clicks."
// //               href="/appointments/book"
// //               icon="📅"
// //             />
// //             <Card
// //               title="My appointments"
// //               desc="View upcoming and past sessions at a glance."
// //               href="/appointments/my"
// //               icon="🗂️"
// //             />

// //             <RoleGuard roles={["therapist"]}>
// //               <Card
// //                 title="Manage availability"
// //                 desc="Set your working hours and recurring days."
// //                 href="/availability"
// //                 icon="⏰"
// //               />
// //             </RoleGuard>

// //             <RoleGuard roles={["superAdmin"]}>
// //               <Card
// //                 title="Pending users"
// //                 desc="Approve therapists and receptionists for your clinic."
// //                 href="/admin/pending-users"
// //                 icon="✅"
// //               />
// //             </RoleGuard>
// //           </section>

// //           {/* Footer note */}
// //           <p className="text-sm text-gray-500">
// //             Logged in as <strong>{roleLabel}</strong>. Your actions and access are controlled by your role.
// //           </p>
// //         </div>
// //       </div>
// //     </Protected>
// //   );
// // }

// // function Card({
// //   title,
// //   desc,
// //   href,
// //   icon,
// // }: {
// //   title: string;
// //   desc: string;
// //   href: string;
// //   icon?: string;
// // }) {
// //   return (
// //     <Link
// //       href={href}
// //       className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-[var(--brand,#4b7eff)]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand,#4b7eff)]/60"
// //     >
// //       <div className="flex items-start gap-3">
// //         {icon && (
// //           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand,#4b7eff)]/10 text-lg">
// //             <span>{icon}</span>
// //           </div>
// //         )}
// //         <div className="min-w-0">
// //           <h3 className="truncate text-sm font-semibold text-gray-900">
// //             {title}
// //           </h3>
// //           <p className="mt-1 text-xs text-gray-600">{desc}</p>
// //         </div>
// //       </div>
// //       <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
// //         <span>Open</span>
// //         <span className="inline-flex items-center gap-1 text-[var(--brand,#4b7eff)] group-hover:translate-x-0.5 transition-transform">
// //           Go
// //           <span aria-hidden="true">›</span>
// //         </span>
// //       </div>
// //     </Link>
// //   );
// // }


// "use client";
// import Protected from "@/components/Protected";
// import RoleGuard from "@/components/RoleGuard";
// import Link from "next/link";
// import SpecialtiesModal from "./SpecialtiesModal";
// import { useAuth } from "@/lib/auth";
// import ReceptionistBookingPage from "@/components/ReceptionistBookingPage";
// import { useEffect, useState } from "react";

// export default function Dashboard() {
//   const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false);

//   // assuming useAuth returns { user, token, ... }
//   const { user, token } = useAuth() as {
//     user: any;
//     token?: string;
//   };

//   const roleLabel = user?.role
//     ? user.role === "superAdmin"
//       ? "Super Admin"
//       : user.role.charAt(0).toUpperCase() + user.role.slice(1)
//     : "User";

//   // When therapist logs in and has not completed specialties, open modal
//   useEffect(() => {
//     if (
//       user?.role === "therapist" &&
//       !user?.therapistInfo?.specialtiesCompleted
//     ) {
//       setShowSpecialtiesModal(true);
//     }
//   }, [user]);

//   // Receptionist only view
//   if (user?.role === "receptionist") {
//     return (
//       <Protected>
//         <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//           <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
//             <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)]">
//                   <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
//                   Receptionist workspace
//                 </p>
//                 <h1 className="mt-3 text-2xl font-semibold tracking-tight">
//                   Receptionist dashboard
//                 </h1>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Book appointments on behalf of patients. Manage the day
//                   schedule in one place.
//                 </p>
//               </div>

//               <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
//                 <div className="flex items-center justify-between gap-3">
//                   <span className="font-medium text-gray-900">
//                     Signed in as
//                   </span>
//                   <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
//                     Receptionist
//                   </span>
//                 </div>
//                 <p className="mt-1 truncate text-[11px] text-gray-500">
//                   {user?.email || "Reception account"}
//                 </p>
//               </div>
//             </header>

//             <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
//               <ReceptionistBookingPage />
//             </div>
//           </div>
//         </div>
//       </Protected>
//     );
//   }

//   // All other roles (therapist, superAdmin, etc.)
//   return (
//     <Protected>
//       <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//         <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
//           {/* Header */}
//           <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)]">
//                 <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
//                 TheraKonnect dashboard
//               </p>
//               <h1 className="mt-3 text-2xl font-semibold tracking-tight">
//                 Welcome back
//               </h1>
//               <p className="mt-1 text-sm text-gray-600">
//                 Quickly jump into bookings, manage your schedule, and review
//                 appointments from one place.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
//               <div className="flex items-center justify-between gap-3">
//                 <span className="font-medium text-gray-900">Signed in as</span>
//                 <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
//                   {roleLabel}
//                 </span>
//               </div>
//               <p className="mt-1 truncate text-[11px] text-gray-500">
//                 {user?.email || "Account"}
//               </p>
//             </div>
//           </header>

//           {/* Quick actions */}
//           <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             <Card
//               title="Book an appointment"
//               desc="Find an available slot and confirm in a few clicks."
//               href="/appointments/book"
//               icon="📅"
//             />
//             <Card
//               title="My appointments"
//               desc="View upcoming and past sessions at a glance."
//               href="/appointments/my"
//               icon="🗂️"
//             />

//             <RoleGuard roles={["therapist"]}>
//               <Card
//                 title="Manage availability"
//                 desc="Set your working hours and recurring days."
//                 href="/availability"
//                 icon="⏰"
//               />
//             </RoleGuard>

//             <RoleGuard roles={["superAdmin"]}>
//               <Card
//                 title="Pending users"
//                 desc="Approve therapists and receptionists for your clinic."
//                 href="/admin/pending-users"
//                 icon="✅"
//               />
//             </RoleGuard>
//           </section>

//           {/* Footer note */}
//           <p className="text-sm text-gray-500">
//             Logged in as <strong>{roleLabel}</strong>. Your actions and access
//             are controlled by your role.
//           </p>
//         </div>

//         {/* Therapist specialties modal – only relevant for therapists */}
//         {user?.role === "therapist" && (
//           <SpecialtiesModal
//             open={showSpecialtiesModal}
//             onClose={() => setShowSpecialtiesModal(false)}
//             token={token || ""}
//           />
//         )}
//       </div>
//     </Protected>
//   );
// }

// function Card({
//   title,
//   desc,
//   href,
//   icon,
// }: {
//   title: string;
//   desc: string;
//   href: string;
//   icon?: string;
// }) {
//   return (
//     <Link
//       href={href}
//       className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-[var(--brand,#4b7eff)]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand,#4b7eff)]/60"
//     >
//       <div className="flex items-start gap-3">
//         {icon && (
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand,#4b7eff)]/10 text-lg">
//             <span>{icon}</span>
//           </div>
//         )}
//         <div className="min-w-0">
//           <h3 className="truncate text-sm font-semibold text-gray-900">
//             {title}
//           </h3>
//           <p className="mt-1 text-xs text-gray-600">{desc}</p>
//         </div>
//       </div>
//       <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
//         <span>Open</span>
//         <span className="inline-flex items-center gap-1 text-[var(--brand,#4b7eff)] group-hover:translate-x-0.5 transition-transform">
//           Go
//           <span aria-hidden="true">›</span>
//         </span>
//       </div>
//     </Link>
//   );
// }

"use client";

import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";
import SpecialtiesModal from "./SpecialtiesModal";
import { useAuth } from "@/lib/auth";
import ReceptionistBookingPage from "@/components/ReceptionistBookingPage";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * ---- Helpers ----
 */

function apiUrl(path: string) {
  // Ensures: BASE + /api/... always becomes a valid URL
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function getKarachiISODate(): string {
  // YYYY-MM-DD (Asia/Karachi)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isKarachiMonday(): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
  }).format(new Date());
  return weekday === "Mon";
}

function safeGet(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export default function Dashboard() {
  const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false);

  // assuming useAuth returns { user, token, ... }
  const { user, token } = useAuth() as {
    user: any;
    token?: string;
  };

  const roleLabel = useMemo(() => {
    return user?.role
      ? user.role === "superAdmin"
        ? "Super Admin"
        : user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : "User";
  }, [user?.role]);

  /**
   * ---- Modal gating (DB-backed + session guard) ----
   *
   * DB fields expected on user.therapistInfo:
   * - specialtiesCompleted: boolean
   * - specialtiesModalFirstShownAt: Date | null
   * - specialtiesModalLastShownOn: "YYYY-MM-DD" | null
   *
   * Behavior:
   * - Show once ever (if firstShownAt missing)
   * - Then only on Mondays, and only once per Monday (lastShownOn !== today)
   *
   * IMPORTANT:
   * Even if DB updates, your `user` in client state may be stale until refreshed,
   * so we also guard with sessionStorage to stop repeated showing on navigation.
   */
  const modalDecisionMadeRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (!token) return;

    // Prevent re-running opening logic on rerenders / strict mode
    if (modalDecisionMadeRef.current) return;

    if (user?.role !== "therapist") return;

    const specialtiesCompleted = !!safeGet(user, "therapistInfo.specialtiesCompleted");
    if (specialtiesCompleted) return;

    const today = getKarachiISODate();
    const monday = isKarachiMonday();

    const firstShownAt = safeGet(user, "therapistInfo.specialtiesModalFirstShownAt");
    const lastShownOn = safeGet(user, "therapistInfo.specialtiesModalLastShownOn");

    // Session guard key: per-user (so switching accounts doesn't conflict)
    const sessionKey = `thera:specialtiesModal:shown:${user?._id || user?.id || user?.email || "unknown"}:${today}`;

    // If we already opened today in this session, don't show again
    if (typeof window !== "undefined") {
      const alreadyOpened = sessionStorage.getItem(sessionKey) === "1";
      if (alreadyOpened) {
        modalDecisionMadeRef.current = true;
        return;
      }
    }

    const shouldShow = !firstShownAt || (monday && lastShownOn !== today);

    // Lock decision either way to stop re-checks on navigation
    modalDecisionMadeRef.current = true;

    if (!shouldShow) return;

    // Mark session guard immediately (so if user navigates away/back it won't reopen)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, "1");
    }

    // Open modal
    setShowSpecialtiesModal(true);

    // Fire-and-forget: record in DB that modal was shown.
    // Make sure your backend route is EXACTLY this (common prefix is /api).
    fetch(apiUrl("/api/auth/therapist/specialties-modal-shown"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).catch(() => {
      // If it fails, session guard still prevents loop this session.
      // Next login might show again (which is acceptable vs infinite loop).
    });
  }, [user, token]);

  // Receptionist only view
  if (user?.role === "receptionist") {
    return (
      <Protected>
        <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
                  Receptionist workspace
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                  Receptionist dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Book appointments on behalf of patients. Manage the day schedule in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-900">Signed in as</span>
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
                    Receptionist
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-gray-500">
                  {user?.email || "Reception account"}
                </p>
              </div>
            </header>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
              <ReceptionistBookingPage />
            </div>
          </div>
        </div>
      </Protected>
    );
  }

  // All other roles (therapist, superAdmin, etc.)
  return (
    <Protected>
      <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand,#4b7eff)]/5 px-3 py-1 text-xs font-medium text-[var(--brand,#4b7eff)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand,#4b7eff)]" />
                TheraKonnect dashboard
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-600">
                Quickly jump into bookings, manage your schedule, and review appointments from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-gray-900">Signed in as</span>
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-gray-500">{user?.email || "Account"}</p>
            </div>
          </header>

          {/* Quick actions */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Book an appointment"
              desc="Find an available slot and confirm in a few clicks."
              href="/appointments/book"
              icon="📅"
            />
            <Card
              title="My appointments"
              desc="View upcoming and past sessions at a glance."
              href="/appointments/my"
              icon="🗂️"
            />

            <RoleGuard roles={["therapist"]}>
              <Card
                title="Manage availability"
                desc="Set your working hours and recurring days."
                href="/availability"
                icon="⏰"
              />
            </RoleGuard>

            <RoleGuard roles={["superAdmin"]}>
              <Card
                title="Pending users"
                desc="Approve therapists and receptionists for your clinic."
                href="/admin/pending-users"
                icon="✅"
              />
            </RoleGuard>
          </section>

          {/* Footer note */}
          <p className="text-sm text-gray-500">
            Logged in as <strong>{roleLabel}</strong>. Your actions and access are controlled by your role.
          </p>
        </div>

        {/* Therapist specialties modal – only relevant for therapists */}
        {/* {user?.role === "therapist" && (
          <SpecialtiesModal
            open={showSpecialtiesModal}
            onClose={() => setShowSpecialtiesModal(false)}
            token={token || ""}
          />
        )} */}
      </div>
    </Protected>
  );
}

function Card({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-[var(--brand,#4b7eff)]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--brand,#4b7eff)]/60"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand,#4b7eff)]/10 text-lg">
            <span>{icon}</span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-600">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Open</span>
        <span className="inline-flex items-center gap-1 text-[var(--brand,#4b7eff)] group-hover:translate-x-0.5 transition-transform">
          Go <span aria-hidden="true">›</span>
        </span>
      </div>
    </Link>
  );
}
