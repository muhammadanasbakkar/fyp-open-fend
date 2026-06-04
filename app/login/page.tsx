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

  function roleHome(role: string) {
    if (role === "hospitalAdmin") return "/hospital/dashboard";
    if (role === "supervisor") return "/supervisor";
    return "/dashboard";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "patient") {
        await loginPatient(patientId.trim(), password);
        router.push("/dashboard");
      } else {
        const { role } = await loginStaff(email.trim(), password);
        router.push(roleHome(role));
      }
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
          <p className="text-xs text-[#4b7eff]">
            New here?{" "}
            <Link
              href="/register?mode=patient"
              className="font-semibold underline-offset-2 hover:underline"
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
              className={`rounded-full px-3 py-2 transition-all ${mode === "patient"
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
              className={`rounded-full px-3 py-2 transition-all ${mode === "staff"
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
          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === "patient" ?
              <>
                <p >
                  New patient?{" "}
                  <Link
                    style={{ color: "#4b7eff", fontWeight: "600" }}
                    href="/register?mode=patient"
                    className="text-[#4b7eff] font-semibold underline-offset-2 hover:underline"

                  >
                    Create a patient account
                  </Link>
                </p>
              </>
              : 
              <>
                <p className="text-xs ">
                  Need a staff account?{" "}
                  <Link
                    style={{ color: "#4b7eff", fontWeight: "600" }}
                    href="/register/staff"
                    className="text-[#4b7eff] font-semibold underline-offset-2 hover:underline"
                  >
                    Register as therapist or receptionist
                  </Link>
                </p>
                <p className="text-xs">
                  Hospital admin?{" "}
                  <Link
                    style={{ color: "#4b7eff", fontWeight: "600" }}
                    href="/hospital/login"
                    className="text-[#4b7eff] font-semibold underline-offset-2 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </>}


          </div>
        </div>
      </div>
    </div>
  );
}
