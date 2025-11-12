// app/appointments/verify/[intentId]/page.tsx
"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function VerifyPage() {
  const router = useRouter();
  const { intentId } = useParams<{ intentId: string }>();
  const sp = useSearchParams();
  const email = sp.get("email") || "";
  const { token } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function onVerify() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      // 1) Verify OTP for this intent (email-based)
      await api("api/appointments/verify", {
        method: "POST",
        headers: {
          ...(token ? authHeader(token) : {}),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ intentId, email, code: code.trim() }),
      });

      // 2) Finalize booking (requires auth: patient or receptionist)
      await api("api/appointments/confirm", {
        method: "POST",
        headers: {
          ...(token ? authHeader(token) : {}),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ intentId }),
      });

      // 3) Show “request lodged” screen
      router.replace("/appointments/pending");
    } catch (e: any) {
      setErr(e.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  // (Optional) If you later add a resend endpoint, wire it here.
  async function onResend() {
    setMsg("If you need a new code, please re-start booking.");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-sm text-gray-600">
        We sent a 6-digit code to <b>{email}</b>.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {msg}
        </div>
      )}

      <div className="mt-6">
        <label className="mb-1 block text-sm text-gray-700">
          Verification code
        </label>
        <input
          placeholder="123456"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          maxLength={6}
          className="w-full rounded border px-3 py-2 text-center tracking-widest"
        />
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onVerify}
            disabled={loading || code.length < 6}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & Submit Request"}
          </button>
          <button className="text-sm underline" onClick={onResend}>
            Resend
          </button>
          <a href="/appointments/book" className="text-sm">
            Change email
          </a>
        </div>
      </div>
    </div>
  );
}
