// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "@/lib/auth";

// type Role = "patient" | "therapist" | "receptionist" | "superAdmin";

// function cn(...a: (string | false | null | undefined)[]) {
//   return a.filter(Boolean).join(" ");
// }

// /** ---------- Inline Logo (no external images) ---------- */
// function Logo({ className }: { className?: string }) {
//   return (
//     <span className={cn("inline-flex items-center gap-2", className)}>
//       <svg
//         width="28"
//         height="28"
//         viewBox="0 0 64 64"
//         aria-hidden="true"
//         className="shrink-0"
//       >
//         {/* Brain-ish mark */}
//         <defs>
//           <linearGradient id="g" x1="0" x2="1">
//             <stop offset="0" stopColor="var(--brand,#4b7eff)" />
//             <stop offset="1" stopColor="var(--brand2,#6aa7ff)" />
//           </linearGradient>
//         </defs>
//         <path
//           fill="url(#g)"
//           d="M32 6c11 0 20 9 20 20v7c0 9-7 16-16 16h-3c-1 3-4 5-7 5-5 0-9-4-9-9v-1c-4-2-7-6-7-11V26C10 14 21 6 32 6z"
//         />
//         <path
//           fill="#fff"
//           fillOpacity=".85"
//           d="M22 24a2 2 0 1 1 0-4h8a2 2 0 1 1 0 4h-8zm-3 8a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H21a2 2 0 0 1-2-2zm6 8a2 2 0 0 1 2-2h10a2 2 0 1 1 0 4H27a2 2 0 0 1-2-2z"
//         />
//       </svg>
//       <span className="font-semibold tracking-tight">TheraKonnect</span>
//     </span>
//   );
// }

// /** ---------- Small atoms ---------- */
// function NavLink({
//   href,
//   label,
//   onClick,
//   active,
//   variant = "nav", // "nav" | "menu"
// }: {
//   href: string;
//   label: string;
//   onClick?: () => void;
//   active?: boolean;
//   variant?: "nav" | "menu";
// }) {
//   const navClasses = cn(
//     "rounded-md px-3 py-2 text-sm font-medium",
//     active
//       ? "bg-gray-100 text-gray-900"
//       : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//   );

//   const menuClasses = cn(
//     "block w-full rounded-lg px-3 py-2 text-sm",
//     "text-gray-700 hover:bg-gray-50",
//     "whitespace-nowrap", // prevent line breaks
//     active && "bg-gray-100 text-gray-900"
//   );

//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={variant === "menu" ? menuClasses : navClasses}
//     >
//       {label}
//     </Link>
//   );
// }

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const pathname = usePathname();

//   const [open, setOpen] = useState(false); // mobile menu
//   const [userOpen, setUserOpen] = useState(false); // user dropdown (desktop)
//   const [apptOpen, setApptOpen] = useState(false); // appointments dropdown (desktop)
//   const [therapyOpen, setTherapyOpen] = useState(false); // therapy mega menu (desktop)

//   const userMenuRef = useRef<HTMLDivElement>(null);
//   const apptMenuRef = useRef<HTMLDivElement>(null);
//   const therapyMenuRef = useRef<HTMLDivElement>(null);

//   const role = user?.role as Role | undefined;
//   const firstName = user?.name?.split(" ")[0] || "User";

//   // Role links
//   const roleLinks = [
//     ...(role === "therapist"
//       ? [{ href: "/availability", label: "Availability" }]
//       : []),
//     ...(role === "receptionist"
//       ? [{ href: "/receptionist/book", label: "Reception" }]
//       : []),
//     ...(role === "superAdmin"
//       ? [
//           { href: "/admin/pending-users", label: "Admin" },
//           { href: "/admin/hospitals", label: "Admin: Hospitals" },
//         ]
//       : []),
//     ...(role === "therapist"
//       ? [
//           // { href: "/patient-records/request", label: "Request Records" },
//           // { href: "/patient-records/requests", label: "Record Requests" },
//           // { href: "/patient-records/shared", label: "Shared Records" },
//         ]
//       : role === "superAdmin"
//       ? [{ href: "/patient-records/requests", label: "Record Requests" }]
//       : []),
//   ];

//   // Mega menu data (many therapy options)
//   const therapyColumns: {
//     heading: string;
//     items: { href: string; label: string; desc?: string }[];
//   }[] = [
//     {
//       heading: "By Modality",
//       items: [
//         {
//           href: "/therapy/cbt",
//           label: "CBT",
//           desc: "Cognitive Behavioral Therapy",
//         },
//         {
//           href: "/therapy/dbt",
//           label: "DBT",
//           desc: "Dialectical Behavior Therapy",
//         },
//         { href: "/therapy/emdr", label: "EMDR", desc: "Trauma processing" },
//         { href: "/therapy/act", label: "ACT", desc: "Acceptance & Commitment" },
//         {
//           href: "/therapy/mindfulness",
//           label: "Mindfulness",
//           desc: "MBSR & MBCT",
//         },
//         { href: "/therapy/psychodynamic", label: "Psychodynamic" },
//         { href: "/therapy/solution-focused", label: "Solution-Focused" },
//       ],
//     },
//     {
//       heading: "By Concern",
//       items: [
//         { href: "/therapy/anxiety", label: "Anxiety" },
//         { href: "/therapy/depression", label: "Depression" },
//         { href: "/therapy/ocd", label: "OCD" },
//         { href: "/therapy/adhd", label: "ADHD" },
//         { href: "/therapy/ptsd", label: "PTSD & Trauma" },
//         { href: "/therapy/eating-disorders", label: "Eating Disorders" },
//         { href: "/therapy/addiction", label: "Addiction" },
//         { href: "/therapy/sleep", label: "Sleep Issues" },
//         { href: "/therapy/grief", label: "Grief" },
//         { href: "/therapy/stress-burnout", label: "Stress & Burnout" },
//       ],
//     },
//     {
//       heading: "By Population",
//       items: [
//         { href: "/therapy/individual", label: "Individual" },
//         { href: "/therapy/couples", label: "Couples" },
//         { href: "/therapy/family", label: "Family" },
//         { href: "/therapy/child", label: "Child & Adolescent" },
//         { href: "/therapy/group", label: "Group Therapy" },
//         { href: "/therapy/lgbtq", label: "LGBTQ+ Affirming" },
//         { href: "/therapy/geriatric", label: "Geriatric" },
//       ],
//     },
//     {
//       heading: "Care Settings",
//       items: [
//         { href: "/therapy/online", label: "Online (Teletherapy)" },
//         { href: "/therapy/in-person", label: "In-Person" },
//         { href: "/therapy/psychiatry", label: "Psychiatry" },
//         { href: "/therapy/medication", label: "Medication Management" },
//         { href: "/therapy/assessment", label: "Psych Assessments" },
//         { href: "/therapy/workshops", label: "Workshops" },
//       ],
//     },
//   ];

//   // Active helpers
//   const isActive = (href: string) => pathname === href;
//   const apptActive = pathname.startsWith("/appointments/");
//   const therapyActive = pathname.startsWith("/therapy/");

//   // Close menus on route change
//   useEffect(() => {
//     setOpen(false);
//     setUserOpen(false);
//     setApptOpen(false);
//     setTherapyOpen(false);
//   }, [pathname]);

//   // Escape / outside click
//   useEffect(() => {
//     function onKey(e: KeyboardEvent) {
//       if (e.key === "Escape") {
//         setOpen(false);
//         setUserOpen(false);
//         setApptOpen(false);
//         setTherapyOpen(false);
//       }
//     }
//     function onClick(e: MouseEvent) {
//       const t = e.target as Node;
//       if (userMenuRef.current && !userMenuRef.current.contains(t))
//         setUserOpen(false);
//       if (apptMenuRef.current && !apptMenuRef.current.contains(t))
//         setApptOpen(false);
//       if (therapyMenuRef.current && !therapyMenuRef.current.contains(t))
//         setTherapyOpen(false);
//     }
//     window.addEventListener("keydown", onKey);
//     window.addEventListener("click", onClick);
//     return () => {
//       window.removeEventListener("keydown", onKey);
//       window.removeEventListener("click", onClick);
//     };
//   }, []);

//   return (
//     <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
//       <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
//         {/* Brand */}
//         <Link href="/" className="text-xl">
//           <Logo />
//         </Link>

//         {/* Desktop nav */}
//         <nav className="hidden md:flex items-center gap-1">
//           {/* Therapy mega menu */}
//           <div className="relative" ref={therapyMenuRef}>
//             <button
//               onClick={() => setTherapyOpen((s) => !s)}
//               aria-expanded={therapyOpen}
//               aria-haspopup="menu"
//               className={cn(
//                 "rounded-md px-3 py-2 text-sm font-medium",
//                 therapyActive
//                   ? "bg-gray-100 text-gray-900"
//                   : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//               )}
//             >
//               Therapy
//               <span className="ml-1 inline-block align-middle">▾</span>
//             </button>

//             {therapyOpen && (
//               <div
//                 role="menu"
//                 className="absolute left-0 mt-2 grid w-[760px] grid-cols-4 gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
//               >
//                 {therapyColumns.map((col, i) => (
//                   <div key={i}>
//                     <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       {col.heading}
//                     </div>
//                     <ul className="space-y-1">
//                       {col.items.map((it) => (
//                         <li key={it.href}>
//                           <Link
//                             href={it.href}
//                             className={cn(
//                               "flex flex-col rounded-md px-2 py-2 hover:bg-gray-50",
//                               isActive(it.href) && "bg-gray-100 text-gray-900"
//                             )}
//                           >
//                             <span className="text-sm text-gray-800">
//                               {it.label}
//                             </span>
//                             {it.desc && (
//                               <span className="text-[11px] text-gray-500">
//                                 {it.desc}
//                               </span>
//                             )}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Appointments dropdown */}
//           <div className="relative" ref={apptMenuRef}>
//             <button
//               onClick={() => setApptOpen((s) => !s)}
//               aria-expanded={apptOpen}
//               aria-haspopup="menu"
//               className={cn(
//                 "rounded-md px-3 py-2 text-sm font-medium",
//                 apptActive
//                   ? "bg-gray-100 text-gray-900"
//                   : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//               )}
//             >
//               Appointments{" "}
//               <span className="ml-1 inline-block align-middle">▾</span>
//             </button>
//             {apptOpen && (
//               <div
//                 role="menu"
//                 className="absolute left-0 mt-2 min-w-[220px] rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
//               >
//                 <NavLink
//                   variant="menu"
//                   href="/appointments/book"
//                   label="Book an appointment"
//                   active={isActive("/appointments/book")}
//                 />
//                 <NavLink
//                   variant="menu"
//                   href="/appointments/my"
//                   label="My appointments"
//                   active={isActive("/appointments/my")}
//                 />
//                 <NavLink
//                   variant="menu"
//                   href="/appointments/find-therapist"
//                   label="Find a therapist"
//                   active={isActive("/appointments/find-therapist")}
//                 />
//                 <NavLink
//                   variant="menu"
//                   href="/appointments/insurance"
//                   label="Insurance & fees"
//                   active={isActive("/appointments/insurance")}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Role-aware links */}
//           {roleLinks.map((l) => (
//             <NavLink
//               key={l.href}
//               href={l.href}
//               label={l.label}
//               active={isActive(l.href)}
//             />
//           ))}

//           {/* Resources */}
//           <NavLink
//             href="/resources"
//             label="Resources"
//             active={isActive("/resources")}
//           />
//           <NavLink href="/about" label="About" active={isActive("/about")} />
//         </nav>

//         {/* Right side (auth) */}
//         <div className="hidden md:flex items-center gap-3">
//           {!user ? (
//             <>
//               <Link
//                 href="/login"
//                 className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//               >
//                 Login
//               </Link>
//               <Link
//                 href="/register"
//                 className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold bg-[var(--brand,#4b7eff)] text-white hover:brightness-95"
//               >
//                 Get started
//               </Link>
//             </>
//           ) : (
//             <div className="relative" ref={userMenuRef}>
//               <button
//                 onClick={() => setUserOpen((s) => !s)}
//                 aria-expanded={userOpen}
//                 aria-haspopup="menu"
//                 className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
//               >
//                 <span className="hidden sm:inline text-sm text-gray-700">
//                   Hi, {firstName}
//                 </span>
//                 <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
//                   {firstName.slice(0, 1).toUpperCase()}
//                 </span>
//               </button>
//               {userOpen && (
//                 <div
//                   role="menu"
//                   className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg flex flex-col"
//                 >
//                   <NavLink
//                     href="/dashboard"
//                     label="Dashboard"
//                     active={isActive("/dashboard")}
//                   />
//                   <NavLink
//                     href="/settings/profile"
//                     label="Settings"
//                     active={isActive("/settings")}
//                   />
//                   <button
//                     onClick={logout}
//                     className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-50"
//                     role="menuitem"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Mobile toggle */}
//         <button
//           className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-50"
//           aria-label="Open menu"
//           aria-expanded={open}
//           onClick={() => setOpen((s) => !s)}
//         >
//           <div className="space-y-1.5">
//             <span className="block h-0.5 w-5 bg-gray-900" />
//             <span className="block h-0.5 w-5 bg-gray-900" />
//             <span className="block h-0.5 w-5 bg-gray-900" />
//           </div>
//         </button>
//       </div>

//       {/* Mobile panel */}
//       {open && (
//         <div className="md:hidden border-t border-gray-100 bg-white">
//           <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
//             {/* Therapy accordion */}
//             <details className="group rounded-md border border-gray-100">
//               <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold">
//                 Therapy
//                 <span className="transition group-open:rotate-180">▾</span>
//               </summary>
//               <div className="grid grid-cols-1 gap-1 p-2">
//                 {therapyColumns.map((col, i) => (
//                   <div key={i} className="rounded-md bg-gray-50">
//                     <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       {col.heading}
//                     </div>
//                     {col.items.map((it) => (
//                       <NavLink
//                         key={it.href}
//                         href={it.href}
//                         label={it.label}
//                         active={isActive(it.href)}
//                         onClick={() => setOpen(false)}
//                         // className="mx-2"
//                       />
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </details>

//             {/* Appointments */}
//             <div className="rounded-md border border-gray-100">
//               <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                 Appointments
//               </div>
//               <NavLink
//                 href="/appointments/book"
//                 label="Book"
//                 active={isActive("/appointments/book")}
//                 onClick={() => setOpen(false)}
//               />
//               <NavLink
//                 href="/appointments/my"
//                 label="My"
//                 active={isActive("/appointments/my")}
//                 onClick={() => setOpen(false)}
//               />
//               <NavLink
//                 href="/appointments/find-therapist"
//                 label="Find a therapist"
//                 active={isActive("/appointments/find-therapist")}
//                 onClick={() => setOpen(false)}
//               />
//               <NavLink
//                 href="/appointments/insurance"
//                 label="Insurance & fees"
//                 active={isActive("/appointments/insurance")}
//                 onClick={() => setOpen(false)}
//               />
//             </div>

//             {/* Role links */}
//             {roleLinks.length > 0 && (
//               <div className="rounded-md border border-gray-100">
//                 <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                   For you
//                 </div>
//                 {roleLinks.map((l) => (
//                   <NavLink
//                     key={l.href}
//                     href={l.href}
//                     label={l.label}
//                     active={isActive(l.href)}
//                     onClick={() => setOpen(false)}
//                   />
//                 ))}
//               </div>
//             )}

//             <div className="my-2 h-px bg-gray-100" />

//             {/* Auth area */}
//             <div className="hidden md:flex items-center gap-3">
//               {!user ? (
//                 <>
//                   <Link
//                     href="/login"
//                     className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//                   >
//                     Login
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold bg-[var(--brand,#4b7eff)] text-white hover:brightness-95"
//                   >
//                     Register
//                   </Link>
//                 </>
//               ) : (
//                 <div className="relative" ref={userMenuRef}>
//                   {/* Trigger */}
//                   <button
//                     onClick={() => setUserOpen((s) => !s)}
//                     aria-expanded={userOpen}
//                     aria-haspopup="menu"
//                     className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand,#4b7eff)]"
//                   >
//                     <span className="hidden sm:inline text-sm text-gray-700">
//                       Hi, {firstName}
//                     </span>
//                     <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
//                       {firstName.slice(0, 1).toUpperCase()}
//                     </span>
//                   </button>

//                   {/* Dropdown */}
//                   {userOpen && (
//                     <div
//                       role="menu"
//                       className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
//                     >
//                       <Link
//                         href="/dashboard"
//                         className="block w-full rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         role="menuitem"
//                       >
//                         Dashboard
//                       </Link>
//                       <Link
//                         href="/settings"
//                         className="block w-full rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         role="menuitem"
//                       >
//                         Settings
//                       </Link>

//                       <div className="my-1 h-px bg-gray-100" />

//                       <button
//                         onClick={logout}
//                         className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
//                         role="menuitem"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }


// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "@/lib/auth";

// type Role = "patient" | "therapist" | "receptionist" | "superAdmin";

// function cn(...a: (string | false | null | undefined)[]) {
//   return a.filter(Boolean).join(" ");
// }

// /** ---------- Inline Logo (no external images) ---------- */
// function Logo({ className }: { className?: string }) {
//   return (
//     <span className={cn("inline-flex items-center gap-2", className)}>
//       <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
//         <defs>
//           <linearGradient id="g" x1="0" x2="1">
//             <stop offset="0" stopColor="var(--brand,#4b7eff)" />
//             <stop offset="1" stopColor="var(--brand2,#6aa7ff)" />
//           </linearGradient>
//         </defs>
//         <path
//           fill="url(#g)"
//           d="M32 6c11 0 20 9 20 20v7c0 9-7 16-16 16h-3c-1 3-4 5-7 5-5 0-9-4-9-9v-1c-4-2-7-6-7-11V26C10 14 21 6 32 6z"
//         />
//         <path
//           fill="#fff"
//           fillOpacity=".85"
//           d="M22 24a2 2 0 1 1 0-4h8a2 2 0 1 1 0 4h-8zm-3 8a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H21a2 2 0 0 1-2-2zm6 8a2 2 0 0 1 2-2h10a2 2 0 1 1 0 4H27a2 2 0 0 1-2-2z"
//         />
//       </svg>
//       <span className="font-semibold tracking-tight">TheraKonnect</span>
//     </span>
//   );
// }

// /** ---------- Small atoms ---------- */
// function NavLink({
//   href,
//   label,
//   onClick,
//   active,
//   variant = "nav",
// }: {
//   href: string;
//   label: string;
//   onClick?: () => void;
//   active?: boolean;
//   variant?: "nav" | "menu";
// }) {
//   const navClasses = cn(
//     "rounded-md px-3 py-2 text-sm font-medium",
//     active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//   );

//   const menuClasses = cn(
//     "block w-full rounded-lg px-3 py-2 text-sm",
//     "text-gray-700 hover:bg-gray-50",
//     "whitespace-nowrap",
//     active && "bg-gray-100 text-gray-900"
//   );

//   return (
//     <Link href={href} onClick={onClick} className={variant === "menu" ? menuClasses : navClasses}>
//       {label}
//     </Link>
//   );
// }

// /** Helper: append a query param to a path (keeps your existing routes) */
// function withParam(path: string, key: string, value: string) {
//   const qs = new URLSearchParams({ [key]: value });
//   return `${path}?${qs.toString()}`;
// }

// type TherapyItem = {
//   href: string;
//   label: string;
//   desc?: string;
//   /** which query param to emit when a user clicks this item */
//   paramKey: "modality" | "concern" | "population" | "setting";
//   /** value to pass for that param */
//   paramValue: string;
// };

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const pathname = usePathname();

//   const [open, setOpen] = useState(false); // mobile menu
//   const [userOpen, setUserOpen] = useState(false); // user dropdown (desktop)
//   const [apptOpen, setApptOpen] = useState(false); // appointments dropdown (desktop)
//   const [therapyOpen, setTherapyOpen] = useState(false); // therapy mega menu (desktop)

//   const userMenuRef = useRef<HTMLDivElement>(null);
//   const apptMenuRef = useRef<HTMLDivElement>(null);
//   const therapyMenuRef = useRef<HTMLDivElement>(null);

//   const role = user?.role as Role | undefined;
//   const firstName = user?.name?.split(" ")[0] || "User";

//   // Role links
//   const roleLinks = [
//     ...(role === "therapist" ? [{ href: "/availability", label: "Availability" }] : []),
//     ...(role === "receptionist" ? [{ href: "/receptionist/book", label: "Reception" }] : []),
//     ...(role === "superAdmin"
//       ? [
//           { href: "/admin/pending-users", label: "Admin" },
//           { href: "/admin/hospitals", label: "Admin: Hospitals" },
//         ]
//       : []),
//     ...(role === "therapist"
//       ? []
//       : role === "superAdmin"
//       ? [{ href: "/patient-records/requests", label: "Record Requests" }]
//       : []),
//   ];

//   // Mega menu data (adds paramKey/paramValue so the selection is also in ?params)
//   const therapyColumns: {
//     heading: string;
//     items: TherapyItem[];
//   }[] = [
//     {
//       heading: "By Modality",
//       items: [
//         { href: "/therapy/cbt", label: "CBT", desc: "Cognitive Behavioral Therapy", paramKey: "modality", paramValue: "cbt" },
//         { href: "/therapy/dbt", label: "DBT", desc: "Dialectical Behavior Therapy", paramKey: "modality", paramValue: "dbt" },
//         { href: "/therapy/emdr", label: "EMDR", desc: "Trauma processing", paramKey: "modality", paramValue: "emdr" },
//         { href: "/therapy/act", label: "ACT", desc: "Acceptance & Commitment", paramKey: "modality", paramValue: "act" },
//         { href: "/therapy/mindfulness", label: "Mindfulness", desc: "MBSR & MBCT", paramKey: "modality", paramValue: "mindfulness" },
//         { href: "/therapy/psychodynamic", label: "Psychodynamic", paramKey: "modality", paramValue: "psychodynamic" },
//         { href: "/therapy/solution-focused", label: "Solution-Focused", paramKey: "modality", paramValue: "solution-focused" },
//       ],
//     },
//     {
//       heading: "By Concern",
//       items: [
//         { href: "/therapy/anxiety", label: "Anxiety", paramKey: "concern", paramValue: "anxiety" },
//         { href: "/therapy/depression", label: "Depression", paramKey: "concern", paramValue: "depression" },
//         { href: "/therapy/ocd", label: "OCD", paramKey: "concern", paramValue: "ocd" },
//         { href: "/therapy/adhd", label: "ADHD", paramKey: "concern", paramValue: "adhd" },
//         { href: "/therapy/ptsd", label: "PTSD & Trauma", paramKey: "concern", paramValue: "ptsd-trauma" },
//         { href: "/therapy/eating-disorders", label: "Eating Disorders", paramKey: "concern", paramValue: "eating-disorders" },
//         { href: "/therapy/addiction", label: "Addiction", paramKey: "concern", paramValue: "addiction" },
//         { href: "/therapy/sleep", label: "Sleep Issues", paramKey: "concern", paramValue: "sleep" },
//         { href: "/therapy/grief", label: "Grief", paramKey: "concern", paramValue: "grief" },
//         { href: "/therapy/stress-burnout", label: "Stress & Burnout", paramKey: "concern", paramValue: "stress-burnout" },
//       ],
//     },
//     {
//       heading: "By Population",
//       items: [
//         { href: "/therapy/individual", label: "Individual", paramKey: "population", paramValue: "individual" },
//         { href: "/therapy/couples", label: "Couples", paramKey: "population", paramValue: "couples" },
//         { href: "/therapy/family", label: "Family", paramKey: "population", paramValue: "family" },
//         { href: "/therapy/child", label: "Child & Adolescent", paramKey: "population", paramValue: "child-adolescent" },
//         { href: "/therapy/group", label: "Group Therapy", paramKey: "population", paramValue: "group" },
//         { href: "/therapy/lgbtq", label: "LGBTQ+ Affirming", paramKey: "population", paramValue: "lgbtq" },
//         { href: "/therapy/geriatric", label: "Geriatric", paramKey: "population", paramValue: "geriatric" },
//       ],
//     },
//     {
//       heading: "Care Settings",
//       items: [
//         { href: "/therapy/online", label: "Online (Teletherapy)", paramKey: "setting", paramValue: "online" },
//         { href: "/therapy/in-person", label: "In-Person", paramKey: "setting", paramValue: "in-person" },
//         { href: "/therapy/psychiatry", label: "Psychiatry", paramKey: "setting", paramValue: "psychiatry" },
//         { href: "/therapy/medication", label: "Medication Management", paramKey: "setting", paramValue: "medication-management" },
//         { href: "/therapy/assessment", label: "Psych Assessments", paramKey: "setting", paramValue: "assessment" },
//         { href: "/therapy/workshops", label: "Workshops", paramKey: "setting", paramValue: "workshops" },
//       ],
//     },
//   ];

//   // Active helpers
//   const isActive = (href: string) => pathname === href;
//   const apptActive = pathname.startsWith("/appointments/");
//   const therapyActive = pathname.startsWith("/therapy/");

//   // Close menus on route change
//   useEffect(() => {
//     setOpen(false);
//     setUserOpen(false);
//     setApptOpen(false);
//     setTherapyOpen(false);
//   }, [pathname]);

//   // Escape / outside click
//   useEffect(() => {
//     function onKey(e: KeyboardEvent) {
//       if (e.key === "Escape") {
//         setOpen(false);
//         setUserOpen(false);
//         setApptOpen(false);
//         setTherapyOpen(false);
//       }
//     }
//     function onClick(e: MouseEvent) {
//       const t = e.target as Node;
//       if (userMenuRef.current && !userMenuRef.current.contains(t)) setUserOpen(false);
//       if (apptMenuRef.current && !apptMenuRef.current.contains(t)) setApptOpen(false);
//       if (therapyMenuRef.current && !therapyMenuRef.current.contains(t)) setTherapyOpen(false);
//     }
//     window.addEventListener("keydown", onKey);
//     window.addEventListener("click", onClick);
//     return () => {
//       window.removeEventListener("keydown", onKey);
//       window.removeEventListener("click", onClick);
//     };
//   }, []);

//   return (
//     <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
//       <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
//         {/* Brand */}
//         <Link href="/" className="text-xl">
//           <Logo />
//         </Link>

//         {/* Desktop nav */}
//         <nav className="hidden md:flex items-center gap-1">
//           {/* Therapy mega menu */}
//           <div className="relative" ref={therapyMenuRef}>
//             <button
//               onClick={() => setTherapyOpen((s) => !s)}
//               aria-expanded={therapyOpen}
//               aria-haspopup="menu"
//               className={cn(
//                 "rounded-md px-3 py-2 text-sm font-medium",
//                 therapyActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//               )}
//             >
//               Therapy
//               <span className="ml-1 inline-block align-middle">▾</span>
//             </button>

//             {therapyOpen && (
//               <div
//                 role="menu"
//                 className="absolute left-0 mt-2 grid w-[760px] grid-cols-4 gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
//               >
//                 {therapyColumns.map((col, i) => (
//                   <div key={i}>
//                     <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       {col.heading}
//                     </div>
//                     <ul className="space-y-1">
//                       {col.items.map((it) => {
//                         const hrefWithParam = withParam(it.href, it.paramKey, it.paramValue);
//                         return (
//                           <li key={it.href}>
//                             <Link
//                               href={hrefWithParam}
//                               className={cn(
//                                 "flex flex-col rounded-md px-2 py-2 hover:bg-gray-50",
//                                 isActive(it.href) && "bg-gray-100 text-gray-900"
//                               )}
//                             >
//                               <span className="text-sm text-gray-800">{it.label}</span>
//                               {it.desc && <span className="text-[11px] text-gray-500">{it.desc}</span>}
//                             </Link>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Appointments dropdown */}
//           <div className="relative" ref={apptMenuRef}>
//             <button
//               onClick={() => setApptOpen((s) => !s)}
//               aria-expanded={apptOpen}
//               aria-haspopup="menu"
//               className={cn(
//                 "rounded-md px-3 py-2 text-sm font-medium",
//                 apptActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
//               )}
//             >
//               Appointments <span className="ml-1 inline-block align-middle">▾</span>
//             </button>
//             {apptOpen && (
//               <div role="menu" className="absolute left-0 mt-2 min-w-[220px] rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
//                 <NavLink variant="menu" href="/appointments/book" label="Book an appointment" active={isActive("/appointments/book")} />
//                 <NavLink variant="menu" href="/appointments/my" label="My appointments" active={isActive("/appointments/my")} />
//                 <NavLink variant="menu" href="/appointments/find-therapist" label="Find a therapist" active={isActive("/appointments/find-therapist")} />
//                 <NavLink variant="menu" href="/appointments/insurance" label="Insurance & fees" active={isActive("/appointments/insurance")} />
//               </div>
//             )}
//           </div>

//           {/* Role-aware links */}
//           {roleLinks.map((l) => (
//             <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
//           ))}

//           {/* Resources */}
//           <NavLink href="/resources" label="Resources" active={isActive("/resources")} />
//           <NavLink href="/about" label="About" active={isActive("/about")} />
//         </nav>

//         {/* Right side (auth) */}
//         <div className="hidden md:flex items-center gap-3">
//           {!user ? (
//             <>
//               <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
//                 Login
//               </Link>
//               <Link
//                 href="/register"
//                 className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold bg-[var(--brand,#4b7eff)] text-white hover:brightness-95"
//               >
//                 Get started
//               </Link>
//             </>
//           ) : (
//             <div className="relative" ref={userMenuRef}>
//               <button
//                 onClick={() => setUserOpen((s) => !s)}
//                 aria-expanded={userOpen}
//                 aria-haspopup="menu"
//                 className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
//               >
//                 <span className="hidden sm:inline text-sm text-gray-700">Hi, {firstName}</span>
//                 <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
//                   {firstName.slice(0, 1).toUpperCase()}
//                 </span>
//               </button>
//               {userOpen && (
//                 <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg flex flex-col">
//                   <NavLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
//                   <NavLink href="/settings/profile" label="Settings" active={isActive("/settings")} />
//                   <button onClick={logout} className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-50" role="menuitem">
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Mobile toggle */}
//         <button
//           className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-50"
//           aria-label="Open menu"
//           aria-expanded={open}
//           onClick={() => setOpen((s) => !s)}
//         >
//           <div className="space-y-1.5">
//             <span className="block h-0.5 w-5 bg-gray-900" />
//             <span className="block h-0.5 w-5 bg-gray-900" />
//             <span className="block h-0.5 w-5 bg-gray-900" />
//           </div>
//         </button>
//       </div>

//       {/* Mobile panel */}
//       {open && (
//         <div className="md:hidden border-t border-gray-100 bg-white">
//           <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
//             {/* Therapy accordion */}
//             <details className="group rounded-md border border-gray-100">
//               <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold">
//                 Therapy
//                 <span className="transition group-open:rotate-180">▾</span>
//               </summary>
//               <div className="grid grid-cols-1 gap-1 p-2">
//                 {therapyColumns.map((col, i) => (
//                   <div key={i} className="rounded-md bg-gray-50">
//                     <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{col.heading}</div>
//                     {col.items.map((it) => {
//                       const hrefWithParam = withParam(it.href, it.paramKey, it.paramValue);
//                       return (
//                         <NavLink
//                           key={it.href}
//                           href={hrefWithParam}
//                           label={it.label}
//                           active={isActive(it.href)}
//                           onClick={() => setOpen(false)}
//                         />
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>
//             </details>

//             {/* Appointments */}
//             <div className="rounded-md border border-gray-100">
//               <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Appointments</div>
//               <NavLink href="/appointments/book" label="Book" active={isActive("/appointments/book")} onClick={() => setOpen(false)} />
//               <NavLink href="/appointments/my" label="My" active={isActive("/appointments/my")} onClick={() => setOpen(false)} />
//               <NavLink
//                 href="/appointments/find-therapist"
//                 label="Find a therapist"
//                 active={isActive("/appointments/find-therapist")}
//                 onClick={() => setOpen(false)}
//               />
//               <NavLink
//                 href="/appointments/insurance"
//                 label="Insurance & fees"
//                 active={isActive("/appointments/insurance")}
//                 onClick={() => setOpen(false)}
//               />
//             </div>

//             {/* Role links */}
//             {roleLinks.length > 0 && (
//               <div className="rounded-md border border-gray-100">
//                 <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">For you</div>
//                 {roleLinks.map((l) => (
//                   <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} onClick={() => setOpen(false)} />
//                 ))}
//               </div>
//             )}

//             <div className="my-2 h-px bg-gray-100" />

//             {/* Auth area (kept as-is, hidden on mobile per your code) */}
//             <div className="hidden md:flex items-center gap-3">
//               {!user ? (
//                 <>
//                   <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
//                     Login
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold bg-[var(--brand,#4b7eff)] text-white hover:brightness-95"
//                   >
//                     Register
//                   </Link>
//                 </>
//               ) : (
//                 <div className="relative" ref={userMenuRef}>
//                   {/* Trigger */}
//                   <button
//                     onClick={() => setUserOpen((s) => !s)}
//                     aria-expanded={userOpen}
//                     aria-haspopup="menu"
//                     className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand,#4b7eff)]"
//                   >
//                     <span className="hidden sm:inline text-sm text-gray-700">Hi, {firstName}</span>
//                     <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
//                       {firstName.slice(0, 1).toUpperCase()}
//                     </span>
//                   </button>

//                   {/* Dropdown */}
//                   {userOpen && (
//                     <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
//                       <Link href="/dashboard" className="block w-full rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
//                         Dashboard
//                       </Link>
//                       <Link href="/settings" className="block w-full rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
//                         Settings
//                       </Link>
//                       <div className="my-1 h-px bg-gray-100" />
//                       <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" role="menuitem">
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import logoImage from '@/public/logo.svg';

type Role = "patient" | "therapist" | "receptionist" | "superAdmin";

function cn(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

/** ---------- Inline Logo ---------- */
function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={logoImage}
        alt="TheraKonnect"
        width={70}
        height={70}
        className="shrink-0"
      />
      {/* <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="var(--brand,#4b7eff)" />
            <stop offset="1" stopColor="var(--brand2,#6aa7ff)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#g)"
          d="M32 6c11 0 20 9 20 20v7c0 9-7 16-16 16h-3c-1 3-4 5-7 5-5 0-9-4-9-9v-1c-4-2-7-6-7-11V26C10 14 21 6 32 6z"
        />
        <path
          fill="#fff"
          fillOpacity=".85"
          d="M22 24a2 2 0 1 1 0-4h8a2 2 0 1 1 0 4h-8zm-3 8a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H21a2 2 0 0 1-2-2zm6 8a2 2 0 0 1 2-2h10a2 2 0 1 1 0 4H27a2 2 0 0 1-2-2z"
        />
      </svg> */}
      {/* <span className="font-semibold tracking-tight">TheraKonnect</span> */}
    </span>
  );
}

/** ---------- Small atoms ---------- */
function NavLink({
  href,
  label,
  onClick,
  active,
  variant = "nav",
}: {
  href: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  variant?: "nav" | "menu";
}) {
  const navClasses = cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-gray-100 text-gray-900"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
  );

  const menuClasses = cn(
    "block w-full rounded-lg px-3 py-2 text-sm transition-colors",
    "text-gray-700 hover:bg-gray-50",
    "whitespace-nowrap",
    active && "bg-gray-100 text-gray-900"
  );

  return (
    <Link href={href} onClick={onClick} className={variant === "menu" ? menuClasses : navClasses}>
      {label}
    </Link>
  );
}

/** Helper: append a query param to a path (keeps your existing routes) */
function withParam(path: string, key: string, value: string) {
  const qs = new URLSearchParams({ [key]: value });
  return `${path}?${qs.toString()}`;
}

type TherapyItem = {
  href: string;
  label: string;
  desc?: string;
  paramKey: "modality" | "concern" | "population" | "setting";
  paramValue: string;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [apptOpen, setApptOpen] = useState(false);
  const [therapyOpen, setTherapyOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const apptMenuRef = useRef<HTMLDivElement>(null);
  const therapyMenuRef = useRef<HTMLDivElement>(null);

  const role = user?.role as Role | undefined;
  const firstName = user?.name?.split(" ")[0] || "User";

  const roleLinks = [
    ...(role === "therapist" ? [{ href: "/availability", label: "Availability" }] : []),
    ...(role === "receptionist" ? [{ href: "/receptionist/book", label: "Reception" }] : []),
    ...(role === "superAdmin"
      ? [
          { href: "/admin/pending-users", label: "Admin" },
          { href: "/admin/hospitals", label: "Admin: Hospitals" },
        ]
      : []),
    ...(role === "therapist"
      ? []
      : role === "superAdmin"
      ? [{ href: "/patient-records/requests", label: "Record Requests" }]
      : []),
  ];

  const therapyColumns: { heading: string; items: TherapyItem[] }[] = [
    {
      heading: "By Modality",
      items: [
        { href: "/therapy/cbt", label: "CBT", desc: "Cognitive Behavioral Therapy", paramKey: "modality", paramValue: "cbt" },
        { href: "/therapy/dbt", label: "DBT", desc: "Dialectical Behavior Therapy", paramKey: "modality", paramValue: "dbt" },
        { href: "/therapy/emdr", label: "EMDR", desc: "Trauma processing", paramKey: "modality", paramValue: "emdr" },
        { href: "/therapy/act", label: "ACT", desc: "Acceptance & Commitment", paramKey: "modality", paramValue: "act" },
        { href: "/therapy/mindfulness", label: "Mindfulness", desc: "MBSR & MBCT", paramKey: "modality", paramValue: "mindfulness" },
        { href: "/therapy/psychodynamic", label: "Psychodynamic", paramKey: "modality", paramValue: "psychodynamic" },
        { href: "/therapy/solution-focused", label: "Solution-Focused", paramKey: "modality", paramValue: "solution-focused" },
      ],
    },
    {
      heading: "By Concern",
      items: [
        { href: "/therapy/anxiety", label: "Anxiety", paramKey: "concern", paramValue: "anxiety" },
        { href: "/therapy/depression", label: "Depression", paramKey: "concern", paramValue: "depression" },
        { href: "/therapy/ocd", label: "OCD", paramKey: "concern", paramValue: "ocd" },
        { href: "/therapy/adhd", label: "ADHD", paramKey: "concern", paramValue: "adhd" },
        { href: "/therapy/ptsd", label: "PTSD & Trauma", paramKey: "concern", paramValue: "ptsd-trauma" },
        { href: "/therapy/eating-disorders", label: "Eating Disorders", paramKey: "concern", paramValue: "eating-disorders" },
        { href: "/therapy/addiction", label: "Addiction", paramKey: "concern", paramValue: "addiction" },
        { href: "/therapy/sleep", label: "Sleep Issues", paramKey: "concern", paramValue: "sleep" },
        { href: "/therapy/grief", label: "Grief", paramKey: "concern", paramValue: "grief" },
        { href: "/therapy/stress-burnout", label: "Stress & Burnout", paramKey: "concern", paramValue: "stress-burnout" },
      ],
    },
    {
      heading: "By Population",
      items: [
        { href: "/therapy/individual", label: "Individual", paramKey: "population", paramValue: "individual" },
        { href: "/therapy/couples", label: "Couples", paramKey: "population", paramValue: "couples" },
        { href: "/therapy/family", label: "Family", paramKey: "population", paramValue: "family" },
        { href: "/therapy/child", label: "Child & Adolescent", paramKey: "population", paramValue: "child-adolescent" },
        { href: "/therapy/group", label: "Group Therapy", paramKey: "population", paramValue: "group" },
        { href: "/therapy/lgbtq", label: "LGBTQ+ Affirming", paramKey: "population", paramValue: "lgbtq" },
        { href: "/therapy/geriatric", label: "Geriatric", paramKey: "population", paramValue: "geriatric" },
      ],
    },
    {
      heading: "Care Settings",
      items: [
        { href: "/therapy/online", label: "Online (Teletherapy)", paramKey: "setting", paramValue: "online" },
        { href: "/therapy/in-person", label: "In-Person", paramKey: "setting", paramValue: "in-person" },
        { href: "/therapy/psychiatry", label: "Psychiatry", paramKey: "setting", paramValue: "psychiatry" },
        { href: "/therapy/medication", label: "Medication Management", paramKey: "setting", paramValue: "medication-management" },
        { href: "/therapy/assessment", label: "Psych Assessments", paramKey: "setting", paramValue: "assessment" },
        { href: "/therapy/workshops", label: "Workshops", paramKey: "setting", paramValue: "workshops" },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;
  const apptActive = pathname.startsWith("/appointments/");
  const therapyActive = pathname.startsWith("/therapy/");

  useEffect(() => {
    setOpen(false);
    setUserOpen(false);
    setApptOpen(false);
    setTherapyOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setUserOpen(false);
        setApptOpen(false);
        setTherapyOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(t)) setUserOpen(false);
      if (apptMenuRef.current && !apptMenuRef.current.contains(t)) setApptOpen(false);
      if (therapyMenuRef.current && !therapyMenuRef.current.contains(t)) setTherapyOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand */}
        <Link href="/" className="text-xl">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Therapy mega menu */}
          <div className="relative" ref={therapyMenuRef}>
            <button
              onClick={() => setTherapyOpen((s) => !s)}
              aria-expanded={therapyOpen}
              aria-haspopup="menu"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                therapyActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Therapy <span className="ml-1 inline-block align-middle">▾</span>
            </button>

            {therapyOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 grid w-[760px] grid-cols-4 gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
              >
                {therapyColumns.map((col, i) => (
                  <div key={i}>
                    <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {col.heading}
                    </div>
                    <ul className="space-y-1">
                      {col.items.map((it) => {
                        const hrefWithParam = withParam(it.href, it.paramKey, it.paramValue);
                        return (
                          <li key={it.href}>
                            <Link
                              href={hrefWithParam}
                              className={cn(
                                "flex flex-col rounded-md px-2 py-2 hover:bg-gray-50",
                                isActive(it.href) && "bg-gray-100 text-gray-900"
                              )}
                            >
                              <span className="text-sm text-gray-800">{it.label}</span>
                              {it.desc && <span className="text-[11px] text-gray-500">{it.desc}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments dropdown */}
          <div className="relative" ref={apptMenuRef}>
            <button
              onClick={() => setApptOpen((s) => !s)}
              aria-expanded={apptOpen}
              aria-haspopup="menu"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                apptActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Appointments <span className="ml-1 inline-block align-middle">▾</span>
            </button>
            {apptOpen && (
              <div role="menu" className="absolute left-0 mt-2 min-w-[220px] rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
                <NavLink variant="menu" href="/appointments/book" label="Book an appointment" active={isActive("/appointments/book")} />
                <NavLink variant="menu" href="/appointments/my" label="My appointments" active={isActive("/appointments/my")} />
                <NavLink variant="menu" href="/appointments/find-therapist" label="Find a therapist" active={isActive("/appointments/find-therapist")} />
                <NavLink variant="menu" href="/appointments/insurance" label="Insurance & fees" active={isActive("/appointments/insurance")} />
              </div>
            )}
          </div>

          {/* Role-aware links */}
          {roleLinks.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
          ))}

          {/* Static links */}
          <NavLink href="/resources" label="Resources" active={isActive("/resources")} />
          <NavLink href="/about" label="About" active={isActive("/about")} />
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold bg-[var(--brand,#4b7eff)] text-white shadow-sm hover:brightness-95"
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserOpen((s) => !s)}
                aria-expanded={userOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
              >
                <span className="hidden sm:inline text-sm text-gray-700">Hi, {firstName}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                  {firstName.slice(0, 1).toUpperCase()}
                </span>
              </button>
              {userOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg flex flex-col">
                  <NavLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
                  <NavLink href="/settings/profile" label="Settings" active={isActive("/settings")} />
                  <button onClick={logout} className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-50" role="menuitem">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-50"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-gray-900" />
            <span className="block h-0.5 w-5 bg-gray-900" />
            <span className="block h-0.5 w-5 bg-gray-900" />
          </div>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-sm">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
            {/* Quick actions row */}
            {!user ? (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 text-center">
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md px-4 py-2 text-sm font-semibold text-white text-center"
                  style={{ background: "linear-gradient(90deg,var(--brand,#4b7eff),var(--brand2,#6aa7ff))" }}
                >
                  Get started
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                    {firstName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Hi, {firstName}</div>
                    <div className="text-gray-500">Signed in</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Therapy accordion */}
            <details className="group rounded-md border border-gray-100">
              <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold">
                Therapy
                <span className="transition group-open:rotate-180">▾</span>
              </summary>
              <div className="grid grid-cols-1 gap-1 p-2">
                {therapyColumns.map((col, i) => (
                  <div key={i} className="rounded-md bg-gray-50">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{col.heading}</div>
                    {col.items.map((it) => {
                      const hrefWithParam = withParam(it.href, it.paramKey, it.paramValue);
                      return (
                        <NavLink key={it.href} href={hrefWithParam} label={it.label} active={isActive(it.href)} onClick={() => setOpen(false)} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </details>

            {/* Appointments */}
            <div className="rounded-md border border-gray-100">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Appointments</div>
              <NavLink href="/appointments/book" label="Book" active={isActive("/appointments/book")} onClick={() => setOpen(false)} />
              <NavLink href="/appointments/my" label="My" active={isActive("/appointments/my")} onClick={() => setOpen(false)} />
              <NavLink href="/appointments/find-therapist" label="Find a therapist" active={isActive("/appointments/find-therapist")} onClick={() => setOpen(false)} />
              <NavLink href="/appointments/insurance" label="Insurance & fees" active={isActive("/appointments/insurance")} onClick={() => setOpen(false)} />
            </div>

            {/* Role links */}
            {roleLinks.length > 0 && (
              <div className="rounded-md border border-gray-100">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">For you</div>
                {roleLinks.map((l) => (
                  <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} onClick={() => setOpen(false)} />
                ))}
              </div>
            )}

            {/* Static */}
            <div className="grid grid-cols-2 gap-2">
              <NavLink href="/resources" label="Resources" active={isActive("/resources")} onClick={() => setOpen(false)} />
              <NavLink href="/about" label="About" active={isActive("/about")} onClick={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
