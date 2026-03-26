// // app/login/page.tsx
// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Input from "@/components/Input";
// import Button from "@/components/Button";
// import Select from "@/components/Select";
// import { useAuth } from "@/lib/auth";

// export default function LoginPage() {
//   const router = useRouter();
//   const { loginPatient, loginStaff } = useAuth();

//   const [mode, setMode] = useState<"patient" | "staff">("patient");
//   const [patientId, setPatientId] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPw, setShowPw] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr(""); setLoading(true);
//     try {
//       if (mode === "patient") {
//         await loginPatient(patientId.trim(), password);
//       } else {
//         await loginStaff(email.trim(), password);
//       }
//       router.push("/dashboard");
//     } catch (e: any) {
//       setErr(e?.message || "Unable to sign in.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//       <div className="mx-auto max-w-md px-4 sm:px-6 py-14">
//         {/* Brand / heading */}
//         <div className="mb-6 text-center">
//           <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-[var(--brand,#4b7eff)]/10 grid place-items-center">
//             <span className="text-lg font-bold text-[#4b7eff]">PT</span>
//           </div>
//           <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
//           <p className="mt-1 text-sm text-gray-600">
//             {mode === "patient" ? "Patient login (Patient ID + Password)" : "Staff login (Email + Password)"}
//           </p>
//         </div>

//         {/* Mode switch */}
//         <div className="mb-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
//           <button
//             type="button"
//             onClick={() => setMode("patient")}
//             className={`rounded-lg px-3 py-2 ${mode==="patient" ? "bg-white shadow" : "text-gray-600"}`}
//           >
//             Patient
//           </button>
//           <button
//             type="button"
//             onClick={() => setMode("staff")}
//             className={`rounded-lg px-3 py-2 ${mode==="staff" ? "bg-white shadow" : "text-gray-600"}`}
//           >
//             Staff
//           </button>
//         </div>

//         <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//           {err && (
//             <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//               {err}
//             </div>
//           )}

//           <form onSubmit={onSubmit} className="space-y-4">
//             {mode === "patient" ? (
//               <>
//                 <div>
//                   <label className="mb-1 block text-sm text-gray-700">Patient ID</label>
//                   <Input
//                     placeholder="e.g. P-000123"
//                     value={patientId}
//                     onChange={(e) => setPatientId(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="relative">
//                   <label className="mb-1 block text-sm text-gray-700">Password</label>
//                   <Input
//                     type={showPw ? "text" : "password"}
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPw(s => !s)}
//                     className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
//                   >
//                     {showPw ? "Hide" : "Show"}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   <label className="mb-1 block text-sm text-gray-700">Email</label>
//                   <Input
//                     type="email"
//                     placeholder="you@clinic.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="relative">
//                   <div className="mb-1 flex items-center justify-between">
//                     <label className="block text-sm text-gray-700">Password</label>
//                     <Link href="/forgot-password" className="text-xs text-[#4b7eff] hover:underline">
//                       Forgot password?
//                     </Link>
//                   </div>
//                   <Input
//                     type={showPw ? "text" : "password"}
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPw(s => !s)}
//                     className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
//                   >
//                     {showPw ? "Hide" : "Show"}
//                   </button>
//                 </div>
//               </>
//             )}

//             <Button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
//           </form>
//         </div>

//         {/* Divider */}
//         <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
//           <div className="h-px flex-1 bg-gray-200" />
//           or
//           <div className="h-px flex-1 bg-gray-200" />
//         </div>

//         <p className="text-center text-sm text-gray-600">
//           New here?{" "}
//           <Link href="/register" className="font-medium text-[#4b7eff] hover:underline">
//             Create an account
//           </Link>
//         </p>

//         <p className="mt-2 text-center text-xs text-gray-500">
//           Staff account requests?{" "}
//           <Link href="/register/staff" className="text-[#4b7eff] hover:underline">
//             Register as therapist/receptionist
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// app/login/page.tsx
// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Input from "@/components/Input";
// import Button from "@/components/Button";
// import { useAuth } from "@/lib/auth";

// export default function LoginPage() {
//   const router = useRouter();
//   const { loginPatient, loginStaff } = useAuth();

//   const [mode, setMode] = useState<"patient" | "staff">("patient");
//   const [patientId, setPatientId] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPw, setShowPw] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr("");
//     setLoading(true);
//     try {
//       if (mode === "patient") {
//         await loginPatient(patientId.trim(), password);
//       } else {
//         await loginStaff(email.trim(), password);
//       }
//       router.push("/dashboard");
//     } catch (e: any) {
//       setErr(e?.message || "Unable to sign in.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
//       <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:flex-row lg:items-center">
//         {/* Left side . intro */}
//         <div className="w-full space-y-6 lg:w-[45%]">
//           <div className="mb-2 text-xs text-slate-500">
//             <Link href="/" className="hover:underline">
//               Home
//             </Link>{" "}
//             <span className="mx-1 text-slate-400">›</span>
//             <span>Login</span>
//           </div>

//           <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 shadow-sm">
//             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//             Secure sign in
//           </div>

//           <div className="space-y-2">
//             <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
//               Welcome back to TheraKonnect
//             </h1>
//             <p className="text-sm text-slate-600">
//               Sign in as a patient using your Patient ID and password, or as a
//               staff member using your clinic email.
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-xs text-slate-600 shadow-sm backdrop-blur">
//             <p className="text-sm font-medium text-slate-900">
//               Tips for a smooth login
//             </p>
//             <ul className="mt-2 space-y-1">
//               <li>
//                 • Patient ID looks like PT-0000-12345678 or the format your
//                 clinic shared.
//               </li>
//               <li>
//                 • Staff should use the official clinic email registered by a
//                 superAdmin.
//               </li>
//               <li>
//                 • If you can not sign in, try resetting your password or contact
//                 your clinic team.
//               </li>
//             </ul>
//           </div>

//           <p className="text-xs text-slate-500">
//             Need a new account?{" "}
//             <Link
//               href="/register"
//               className="font-medium text-[#4b7eff] hover:underline"
//             >
//               Create a patient account
//             </Link>
//             .
//           </p>
//         </div>

//         {/* Right side . form */}
//         <div className="w-full lg:w-[55%]">
//           <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
//             <button
//               type="button"
//               onClick={() => setMode("patient")}
//               className={`rounded-lg px-3 py-2 transition-all ${
//                 mode === "patient"
//                   ? "bg-white shadow-sm text-slate-900"
//                   : "text-slate-600 hover:text-slate-800"
//               }`}
//             >
//               Patient
//             </button>
//             <button
//               type="button"
//               onClick={() => setMode("staff")}
//               className={`rounded-lg px-3 py-2 transition-all ${
//                 mode === "staff"
//                   ? "bg-white shadow-sm text-slate-900"
//                   : "text-slate-600 hover:text-slate-800"
//               }`}
//             >
//               Staff
//             </button>
//           </div>

//           <div className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur">
//             <div className="mb-4 text-center sm:text-left">
//               <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand,#4b7eff)]/10 sm:mx-0">
//                 <span className="text-lg font-bold text-[#4b7eff]">
//                   TK
//                 </span>
//               </div>
//               <h2 className="text-xl font-semibold tracking-tight text-slate-900">
//                 {mode === "patient" ? "Patient login" : "Staff login"}
//               </h2>
//               <p className="mt-1 text-xs text-slate-500">
//                 {mode === "patient"
//                   ? "Use your Patient ID and password."
//                   : "Use your clinic email and password."}
//               </p>
//             </div>

//             {err && (
//               <div
//                 role="alert"
//                 className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
//               >
//                 {err}
//               </div>
//             )}

//             <form onSubmit={onSubmit} className="space-y-4">
//               {mode === "patient" ? (
//                 <>
//                   <div>
//                     <label className="mb-1 block text-sm text-slate-700">
//                       Patient ID
//                     </label>
//                     <Input
//                       placeholder="PT-1234-12345678"
//                       value={patientId}
//                       onChange={(e) => setPatientId(e.target.value)}
//                       required
//                     />
//                     <p className="mt-1 text-[11px] text-slate-400">
//                       The ID you received when you registered, or from your
//                       clinic.
//                     </p>
//                   </div>

//                   <div className="relative">
//                     <label className="mb-1 block text-sm text-slate-700">
//                       Password
//                     </label>
//                     <Input
//                       type={showPw ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPw((s) => !s)}
//                       className="absolute right-2 top-8 rounded-md px-2 text-xs text-slate-600 hover:bg-slate-50"
//                     >
//                       {showPw ? "Hide" : "Show"}
//                     </button>
//                     <div className="mt-1 text-[11px] text-slate-400">
//                       Password is case sensitive.
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div>
//                     <label className="mb-1 block text-sm text-slate-700">
//                       Email
//                     </label>
//                     <Input
//                       type="email"
//                       placeholder="you@clinic.com"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="relative">
//                     <div className="mb-1 flex items-center justify-between">
//                       <label className="block text-sm text-slate-700">
//                         Password
//                       </label>
//                       <Link
//                         href="/forgot-password"
//                         className="text-xs text-[#4b7eff] hover:underline"
//                       >
//                         Forgot password?
//                       </Link>
//                     </div>
//                     <Input
//                       type={showPw ? "text" : "password"}
//                       placeholder="••••••••"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPw((s) => !s)}
//                       className="absolute right-2 top-8 rounded-md px-2 text-xs text-slate-600 hover:bg-slate-50"
//                     >
//                       {showPw ? "Hide" : "Show"}
//                     </button>
//                   </div>
//                 </>
//               )}

//               <Button
//                 disabled={
//                   loading ||
//                   (mode === "patient" && !patientId) ||
//                   (mode === "staff" && !email)
//                 }
//                 className="
//     w-full
//     bg-blue-600
//     hover:bg-blue-700
//     text-white
//     font-semibold
//     py-3
//     rounded-lg
//     shadow-md
//     transition
//     duration-200
//     disabled:opacity-60
//     disabled:cursor-not-allowed
//   "
//               >
//                 {loading ? "Signing in..." : "Sign in"}
//               </Button>
//             </form>
//           </div>

//           {/* Secondary links */}
//           <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
//             <p className="mt-4 text-center text-sm text-gray-600">
//               Need a new account?{" "}
//               <Link
//                 href="/register?mode=patient"
//                 className="font-bold text-[#4b7eff] hover:underline"
//               >
//                 Create a patient account
//               </Link>
//             </p>
//             <p className="mt-3 text-center text-xs text-slate-500">
//               Need a staff account?{" "}
//               <Link
//                 href="/register/staff"
//                 className="font-bold text-[#4b7eff] hover:underline"
//               >
//                 Register as therapist or receptionist
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { loginPatient, loginStaff } = useAuth();

  const [mode, setMode] = useState<"patient" | "staff">("patient");
  const [patientId, setPatientId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "patient") {
        await loginPatient(patientId.trim(), password);
      } else {
        await loginStaff(email.trim(), password);
      }
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:flex-row lg:items-center">
        {/* Left side — intro */}
        <div className="w-full space-y-6 lg:w-[45%]">
          {/* Breadcrumb */}
          <div className="mb-2 text-xs text-slate-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>{" "}
            <span className="mx-1 text-slate-400">›</span>
            <span>Login</span>
          </div>

          {/* Small badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Secure sign-in to TheraKonnect
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back to TheraKonnect
            </h1>
            <p className="text-sm text-slate-600">
              Sign in as a patient using your Patient ID and password, or as a
              staff member using your clinic email.
            </p>
          </div>

          {/* Tips card */}
          <div className="rounded-2xl border border-blue-100/60 bg-white/80 p-4 text-xs text-slate-600 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-slate-900">
              Tips for a smooth login
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                • Patient ID looks like{" "}
                <span className="font-mono">PT-0000-12345678</span> or the
                format your clinic shared.
              </li>
              <li>
                • Staff should use the official clinic email registered by a
                superAdmin.
              </li>
              <li>
                • If you can not sign in, try resetting your password or contact
                your clinic team.
              </li>
            </ul>
          </div>

          {/* CTA to register */}
          <p className="text-xs text-slate-500">
            New here?{" "}
            <Link
              href="/register?mode=patient"
              className="font-medium text-[#4b7eff] hover:underline"
            >
              Create a patient account
            </Link>
            .
          </p>
        </div>

        {/* Right side — form */}
        <div className="w-full lg:w-[55%]">
          {/* Segmented control */}
          <div
            className="mb-4 grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm shadow-sm"
            role="tablist"
            aria-label="Login as"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "patient"}
              onClick={() => setMode("patient")}
              className={`rounded-full px-3 py-2 transition-all ${
                mode === "patient"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "staff"}
              onClick={() => setMode("staff")}
              className={`rounded-full px-3 py-2 transition-all ${
                mode === "staff"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Staff
            </button>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            {/* Logo + title */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4b7eff]/15 to-[#6aa7ff]/15 border border-[#4b7eff]/20">
                  <span className="text-lg font-bold text-[#4b7eff]">
                    TK
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                    {mode === "patient" ? "Patient login" : "Staff login"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {mode === "patient"
                      ? "Use your Patient ID and password."
                      : "Use your clinic email and password."}
                  </p>
                </div>
              </div>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 sm:inline-flex">
                Mode:{" "}
                <span className="ml-1 capitalize text-[#4b7eff]">
                  {mode}
                </span>
              </span>
            </div>

            {/* Error alert */}
            {err && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <span className="mt-[2px] text-base">⚠️</span>
                <p>{err}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "patient" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">
                      Patient ID
                    </label>
                    <Input
                      placeholder="PT-1234-12345678"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      The ID you received when you registered, or from your
                      clinic.
                    </p>
                  </div>

                  <div className="relative">
                    <label className="mb-1 block text-sm text-slate-700">
                      Password
                    </label>
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-8 rounded-md px-2 text-xs text-slate-500 hover:bg-slate-100"
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Password is case sensitive.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="you@clinic.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block text-sm text-slate-700">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-[#4b7eff] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-8 rounded-md px-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </>
              )}

              <Button
                disabled={loading}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] hover:brightness-105 active:brightness-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff] focus-visible:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </Button>
            </form>
          </div>

          {/* Secondary links */}
          <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
            <p>
              New patient?{" "}
              <Link
                href="/register?mode=patient"
                className="font-semibold text-[#4b7eff] hover:underline"
              >
                Create a patient account
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Need a staff account?{" "}
              <Link
                href="/register/staff"
                className="font-semibold text-[#4b7eff] hover:underline"
              >
                Register as therapist or receptionist
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
