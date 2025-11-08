// app/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";

type Step = "request" | "verify" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  // prefill from query (?email=)
  const initialEmail = params.get("email") || "";

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // resend cooldown UI (client-side mirror of server throttle)
  const RESEND_COOLDOWN = 45; // seconds; keep in sync with backend env
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch(`${API}api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // The backend always returns 200 for privacy; 429 when throttled.
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setErr(data?.msg || "Please wait before requesting another code.");
        return;
      }
      setInfo("If the email exists, we sent a 6-digit code.");
      setStep("verify");
      setCooldown(RESEND_COOLDOWN);
    } catch (e: any) {
      setErr(e?.message || "Unable to request reset. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown) return;
    setErr(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch(`${API}api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setErr(data?.msg || "Please wait before requesting another code.");
        return;
      }
      setInfo("Code sent again (if the email exists).");
      setCooldown(RESEND_COOLDOWN);
    } catch (e: any) {
      setErr(e?.message || "Unable to resend code right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch(`${API}api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.msg || "Invalid or expired code.");
        return;
      }
      setResetToken(data.resetToken);
      setInfo("Code verified. Please set your new password.");
      setStep("reset");
    } catch (e: any) {
      setErr(e?.message || "Could not verify the code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setLoading(true);
    try {
      if (password !== confirm) {
        setErr("Passwords do not match.");
        return;
      }
      const res = await fetch(`${API}api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.msg || "Reset link invalid or expired.");
        return;
      }
      setInfo("Password changed successfully.");
      setStep("done");
      // Optional small delay then go to login with prefilled email
      setTimeout(() => router.replace(`/login?email=${encodeURIComponent(email)}`), 1200);
    } catch (e: any) {
      setErr(e?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-md px-4 sm:px-6 py-14">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-[var(--brand,#4b7eff)]/10 grid place-items-center">
            <span className="text-lg font-bold text-[var(--brand,#4b7eff)]">PT</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {step === "request" && "Forgot password"}
            {step === "verify" && "Check your email"}
            {step === "reset" && "Set a new password"}
            {step === "done" && "All set!"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {step === "request" && "Enter your staff email. We’ll send a 6-digit code."}
            {step === "verify" && `Enter the 6-digit code sent to ${email}.`}
            {step === "reset" && "Create a strong password for your account."}
            {step === "done" && "Redirecting you to the login page…"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {err && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {info}
            </div>
          )}

          {/* Step: Request */}
          {step === "request" && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Staff Email</label>
                <Input
                  type="email"
                  placeholder="you@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button disabled={loading}>
                {loading ? "Sending code…" : "Send reset code"}
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                Remembered your password?{" "}
                <Link className="text-[var(--brand,#4b7eff)] hover:underline" href="/login">
                  Back to login
                </Link>
              </p>
            </form>
          )}

          {/* Step: Verify */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm text-gray-700">6-digit code</label>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || cooldown > 0}
                    className="text-xs text-[var(--brand,#4b7eff)] disabled:text-gray-400 hover:underline"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
                <Input
                  inputMode="numeric"
                  pattern="\d{6}"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </div>
              <Button disabled={loading}>
                {loading ? "Verifying…" : "Verify code"}
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-[var(--brand,#4b7eff)] hover:underline"
                >
                  Use a different address
                </button>
              </p>
            </form>
          )}

          {/* Step: Reset */}
          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-700">New password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Confirm new password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters and include uppercase, lowercase, number, and symbol.
              </p>
              <Button disabled={loading}>
                {loading ? "Saving…" : "Save new password"}
              </Button>
            </form>
          )}

          {/* Step: Done (tiny state before redirect) */}
          {step === "done" && (
            <div className="text-sm text-gray-700">
              Password updated. Taking you to{" "}
              <Link href="/login" className="text-[var(--brand,#4b7eff)] hover:underline">
                login
              </Link>
              …
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
