// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/Select";
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
    setErr(""); setLoading(true);
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
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-md px-4 sm:px-6 py-14">
        {/* Brand / heading */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-[var(--brand,#4b7eff)]/10 grid place-items-center">
            <span className="text-lg font-bold text-[var(--brand,#4b7eff)]">PT</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-600">
            {mode === "patient" ? "Patient login (Patient ID + Password)" : "Staff login (Email + Password)"}
          </p>
        </div>

        {/* Mode switch */}
        <div className="mb-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("patient")}
            className={`rounded-lg px-3 py-2 ${mode==="patient" ? "bg-white shadow" : "text-gray-600"}`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`rounded-lg px-3 py-2 ${mode==="staff" ? "bg-white shadow" : "text-gray-600"}`}
          >
            Staff
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {err && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "patient" ? (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Patient ID</label>
                  <Input
                    placeholder="e.g. P-000123"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <label className="mb-1 block text-sm text-gray-700">Password</label>
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Email</label>
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
                    <label className="block text-sm text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-xs text-[var(--brand,#4b7eff)] hover:underline">
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
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </>
            )}

            <Button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
          <div className="h-px flex-1 bg-gray-200" />
          or
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-600">
          New here?{" "}
          <Link href="/register" className="font-medium text-[var(--brand,#4b7eff)] hover:underline">
            Create an account
          </Link>
        </p>

        <p className="mt-2 text-center text-xs text-gray-500">
          Staff account requests?{" "}
          <Link href="/register/staff" className="text-[var(--brand,#4b7eff)] hover:underline">
            Register as therapist/receptionist
          </Link>
        </p>
      </div>
    </div>
  );
}
