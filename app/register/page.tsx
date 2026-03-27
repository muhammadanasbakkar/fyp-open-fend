// // app/register/page.tsx  (PATIENT REGISTRATION)
// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import Input from "@/components/Input";
// import Select from "@/components/Select";
// import Swal from "sweetalert2";
// import Button from "@/components/Button";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// export default function RegisterPatientPage() {
//   const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
//   const [dateOfBirth, setDob] = useState("");
//   const [cnicLastDigits, setCnicLastDigits] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPw, setShowPw] = useState(false);
//   const [err, setErr] = useState("");
//   const [info, setInfo] = useState<{ patientId?: string } | null>(null);
//   const [loading, setLoading] = useState(false);

//   const passwordRules = {
//     length: password.length >= 8,
//     upper: /[A-Z]/.test(password),
//     lower: /[a-z]/.test(password),
//     number: /\d/.test(password),
//     special: /[^A-Za-z0-9]/.test(password),
//   };

//   const isPasswordValid = Object.values(passwordRules).every(Boolean);

//   function getPasswordSuggestions(password: string) {
//     const suggestions: string[] = [];

//     if (password.length < 8) suggestions.push("Add more characters (min 8)");

//     if (!/[A-Z]/.test(password))
//       suggestions.push("Add an uppercase letter (A-Z)");

//     if (!/[a-z]/.test(password))
//       suggestions.push("Add a lowercase letter (a-z)");

//     if (!/\d/.test(password)) suggestions.push("Add a number (0-9)");

//     if (!/[^A-Za-z0-9]/.test(password))
//       suggestions.push("Add a special character (!@#$)");

//     if (password && suggestions.length === 0)
//       suggestions.push("Strong password ✅");

//     return suggestions;
//   }

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr("");
//     setInfo(null);
//     setLoading(true);
//     try {
//       if (!isPasswordValid) {
//         setLoading(false);
//         Swal.fire({
//           icon: "warning",
//           title: "Weak Password",
//           text: "Password must be at least 8 characters and include uppercase, lowercase, number & symbol.",
//         });
//         return;
//       }
//       const res = await fetch(`${API}api/auth/register-patient`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ gender, dateOfBirth, password, cnicLastDigits }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         Swal.fire({
//           icon: "error",
//           title: "Registration Failed",
//           text: data?.msg || "Registration failed",
//         });
//       }
//       // if (!res.ok) throw new Error(data?.msg || "Registration failed");
//       // Show the Patient ID prominently
//       setInfo({ patientId: data.patientId });
//       // optionally auto-store token/user if you want immediate login:
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//     } catch (e: any) {
//       setErr(e.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
//       <div className="mx-auto max-w-md px-4 sm:px-6 py-12">
//         <div className="mb-4 text-sm text-gray-500">
//           <Link href="/" className="hover:underline">
//             Home
//           </Link>{" "}
//           <span>›</span> <span>Register (Patient)</span>
//         </div>

//         <h1 className="text-2xl font-semibold mb-2">
//           Create your patient account
//         </h1>
//         <p className="text-sm text-gray-600 mb-6">
//           You’ll receive a unique Patient ID to sign in.
//         </p>

//         {err && (
//           <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {err}
//           </div>
//         )}

//         {info?.patientId ? (
//           <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
//             <p className="font-medium">Registration successful!</p>
//             <p className="mt-1">Your Patient ID is:</p>
//             <div className="mt-2 flex items-center gap-2">
//               <code className="rounded-md bg-white px-2 py-1 text-gray-900 ring-1 ring-green-200">
//                 {info.patientId}
//               </code>
//               <button
//                 className="rounded-md px-2 py-1 text-xs ring-1 ring-green-300 hover:bg-white"
//                 onClick={() => navigator.clipboard.writeText(info.patientId!)}
//               >
//                 Copy
//               </button>
//             </div>
//             <p className="mt-3">
//               Use this Patient ID with your password on the{" "}
//               <Link
//                 href="/login"
//                 className="text-[#4b7eff] underline"
//               >
//                 login page
//               </Link>
//               .
//             </p>
//           </div>
//         ) : (
//           <form
//             onSubmit={onSubmit}
//             className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4"
//           >
//             <div>
//               <label className="mb-1 block text-sm text-gray-700">Gender</label>
//               <Select
//                 value={gender}
//                 onChange={(e) => setGender(e.target.value as any)}
//                 required
//               >
//                 <option value="">Select…</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </Select>
//             </div>

//             <div>
//               <label className="mb-1 block text-sm text-gray-700">
//                 Date of birth
//               </label>
//               <Input
//                 type="date"
//                 value={dateOfBirth}
//                 onChange={(e) => setDob(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm text-gray-700">
//                 CNIC last 4 Digits
//               </label>
//               <Input
//                 type="text"
//                 value={cnicLastDigits}
//                 onChange={(e) => setCnicLastDigits(e.target.value)}
//                 required
//               />
//             </div>

//             {/* <div className="relative">
//               <label className="mb-1 block text-sm text-gray-700">
//                 Password
//               </label>
//               <Input
//                 type={showPw ? "text" : "password"}
//                 placeholder="Create a password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPw((s) => !s)}
//                 className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
//               >
//                 {showPw ? "Hide" : "Show"}
//               </button>
//             </div> */}
//             <div className="relative">
//               <label className="mb-1 block text-sm text-gray-700">
//                 Password
//               </label>
//               <Input
//                 type={showPw ? "text" : "password"}
//                 placeholder="Create a strong password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPw((s) => !s)}
//                 className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
//               >
//                 {showPw ? "Hide" : "Show"}
//               </button>

//               {password && (
//                 <div className="mt-2 text-xs space-y-1 text-gray-600">
//                   <div
//                     className={
//                       passwordRules.length ? "text-green-600" : "text-red-500"
//                     }
//                   >
//                     • At least 8 characters
//                   </div>
//                   <div
//                     className={
//                       passwordRules.upper ? "text-green-600" : "text-red-500"
//                     }
//                   >
//                     • Contains uppercase letter
//                   </div>
//                   <div
//                     className={
//                       passwordRules.lower ? "text-green-600" : "text-red-500"
//                     }
//                   >
//                     • Contains lowercase letter
//                   </div>
//                   <div
//                     className={
//                       passwordRules.number ? "text-green-600" : "text-red-500"
//                     }
//                   >
//                     • Contains number
//                   </div>
//                   <div
//                     className={
//                       passwordRules.special ? "text-green-600" : "text-red-500"
//                     }
//                   >
//                     • Contains special character
//                   </div>
//                 </div>
//               )}

//               {/* {password && (
//                 <div className="mt-2 text-xs text-gray-500">
//                   <span className="font-medium text-gray-700">
//                     Suggestions:
//                   </span>
//                   <ul className="mt-1 space-y-1">
//                     {getPasswordSuggestions(password).map((s, i) => (
//                       <li key={i} className="flex items-center gap-1">
//                         <span>•</span> {s}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )} */}
//             </div>
//             <Button className="w-full" disabled={loading || !isPasswordValid}>
//               {loading ? "Creating…" : "Create account"}
//             </Button>
//           </form>
//         )}

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Staff member?{" "}
//           <Link
//             href="/register/staff"
//             className="text-[#4b7eff] hover:underline"
//           >
//             Register as therapist/receptionist
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// app/register/page.tsx  (PATIENT REGISTRATION)
"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { alertWarning, alertError } from "@/components/MySwal";
import Button from "@/components/Button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";

export default function RegisterPatientPage() {
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dateOfBirth, setDob] = useState("");
  const [cnicLastDigits, setCnicLastDigits] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState<{ patientId?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo(null);
    setLoading(true);

    try {
      if (!isPasswordValid) {
        setLoading(false);
        alertWarning("Weak password", "Password must be at least 8 characters and include uppercase, lowercase, number and symbol.");
        return;
      }

      const res = await fetch(`${API}api/auth/register-patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, dateOfBirth, password, cnicLastDigits }),
      });

      const data = await res.json();

      if (!res.ok) {
        alertError("Registration failed", data?.msg || "Registration failed");
        return;
      }

      // Only set success state when request is OK
      setInfo({ patientId: data.patientId });

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:flex-row lg:items-center">
        {/* Left side - intro */}
        <div className="w-full lg:w-[45%] space-y-5">
          <div className="mb-2 text-xs text-slate-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>{" "}
            <span className="mx-1 text-slate-400">›</span>
            <span>Register (Patient)</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Patient registration
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Create your TheraKonnect patient account
            </h1>
            <p className="text-sm text-slate-600">
              You will receive a unique Patient ID that you can use, along with
              your password, to access your appointments and digital records
              securely.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100/60 bg-white/80 p-4 text-xs text-slate-600 shadow-sm">
            <p className="font-medium text-slate-900 text-sm">
              Why we ask for your details
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                • Gender and date of birth help therapists understand your
                context.
              </li>
              <li>
                • CNIC last 4 digits help uniquely match you while keeping your
                full CNIC private.
              </li>
              <li>
                • Your password is encrypted and never shown back in plain text.
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Already have a Patient ID?{" "}
            <Link
              href="/login"
              className="font-medium text-[#4b7eff] hover:underline"
            >
              <b>Log in here</b>
            </Link>
            .
          </p>
        </div>

        {/* Right side - form / success */}
        <div className="w-full lg:w-[55%]">
          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {info?.patientId ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                  ✓
                </div>
                <div className="text-sm text-emerald-900">
                  <p className="font-semibold">Registration successful</p>
                  <p className="mt-1">
                    Your Patient ID has been generated. Keep it safe and do not
                    share it publicly.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-800">
                        Patient ID
                      </span>
                      <code className="rounded-md bg-white px-2 py-1 text-xs font-mono text-slate-900 ring-1 ring-emerald-200">
                        {info.patientId}
                      </code>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      onClick={() =>
                        navigator.clipboard.writeText(info.patientId!)
                      }
                    >
                      Copy ID
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-emerald-900">
                    Use this Patient ID with your password on the{" "}
                    <Link
                      href="/login"
                      className="font-medium text-emerald-800 underline"
                    >
                      login page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4"
            >
              {/* Section heading */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Basic information
                  </p>
                  <p className="text-xs text-slate-500">
                    These details will appear on your digital record.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  Step 1 of 2
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-700">
                    Gender
                  </label>
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    {/* <option value="other">Other</option> */}
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">
                    Date of birth
                  </label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="mb-1 block text-sm text-slate-700">
                      CNIC last 4 digits
                    </label>
                    <span className="text-[11px] text-slate-400">
                      We never store full CNIC
                    </span>
                  </div>
                  <Input
                    type="text"
                    value={cnicLastDigits}
                    onChange={(e) => setCnicLastDigits(e.target.value)}
                    maxLength={4}
                    placeholder="1234"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Choose a password
                    </p>
                    <p className="text-xs text-slate-500">
                      Make sure it is strong and only you know it.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      !password
                        ? "bg-slate-100 text-slate-500"
                        : isPasswordValid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {!password
                      ? "Not started"
                      : isPasswordValid
                      ? "Strong"
                      : "Needs improvement"}
                  </span>
                </div>

                <div className="relative">
                  <label className="mb-1 block text-sm text-slate-700">
                    Password
                  </label>
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Create a strong password"
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

                {/* Simple strength bar */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={`transition-all ${
                          Object.values(passwordRules).filter(Boolean)
                            .length === 0
                            ? "w-0"
                            : Object.values(passwordRules).filter(Boolean)
                                .length <= 2
                            ? "w-1/4 bg-red-400"
                            : Object.values(passwordRules).filter(Boolean)
                                .length === 3
                            ? "w-2/4 bg-amber-400"
                            : Object.values(passwordRules).filter(Boolean)
                                .length === 4
                            ? "w-3/4 bg-lime-400"
                            : "w-full bg-emerald-500"
                        }`}
                      />
                    </div>

                    <div className="grid gap-1.5 text-[11px] text-slate-600 sm:grid-cols-2">
                      <RuleChip
                        ok={passwordRules.length}
                        label="At least 8 characters"
                      />
                      <RuleChip
                        ok={passwordRules.upper}
                        label="Uppercase letter (A-Z)"
                      />
                      <RuleChip
                        ok={passwordRules.lower}
                        label="Lowercase letter (a-z)"
                      />
                      <RuleChip
                        ok={passwordRules.number}
                        label="Number (0-9)"
                      />
                      <RuleChip
                        ok={passwordRules.special}
                        label="Special character (! @ # $ etc)"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] hover:brightness-105 active:brightness-95 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || !isPasswordValid}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Creating...
                  </span>
                ) : "Create patient account"}
              </Button>

              <p className="mt-3 text-[11px] text-slate-500 text-center">
                By creating an account, you confirm that your details are
                correct and give consent to store your digital records securely.
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Staff member?{" "}
            <Link
              href="/register/staff"
              className="text-[#4b7eff] hover:underline"
            >
              Register as therapist or receptionist
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RuleChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
        ok
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-slate-50 text-slate-500 border border-slate-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ok ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      <span>{label}</span>
    </div>
  );
}
