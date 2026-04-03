"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function HospitalLoginPage() {
  const router = useRouter();
  const { setHospitalSession } = useAuth() as any;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/hospital/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Login failed.");

      // Store token + user same way loginStaff does
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Notify AuthProvider
      window.dispatchEvent(new CustomEvent("auth:setSession", { detail: { token: data.token, user: data.user } }));

      router.push("/hospital/dashboard");
    } catch (e: any) {
      setErr(e.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-2xl text-white mb-4 shadow-md">
            🏥
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Admin Login</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to manage your hospital on TheraKonnect
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">

          {err && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <span className="mt-px">⚠️</span>
              <p>{err}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@yourhospital.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#4b7eff] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#4b7eff] focus:bg-white focus:outline-none transition-colors pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#7c3aed] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:opacity-95 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="mt-5 space-y-2 text-center text-sm text-gray-500">
          <p>
            New hospital?{" "}
            <Link href="/hospital/onboard" className="font-semibold text-[#4b7eff] hover:underline">
              Enroll your hospital
            </Link>
          </p>
          <p>
            Not a hospital admin?{" "}
            <Link href="/login" className="text-[#4b7eff] hover:underline">
              Go to main login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
