// app/register/page.tsx  (PATIENT REGISTRATION)
"use client";
import { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Swal from "sweetalert2";
import Button from "@/components/Button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  function getPasswordSuggestions(password: string) {
    const suggestions: string[] = [];

    if (password.length < 8) suggestions.push("Add more characters (min 8)");

    if (!/[A-Z]/.test(password))
      suggestions.push("Add an uppercase letter (A-Z)");

    if (!/[a-z]/.test(password))
      suggestions.push("Add a lowercase letter (a-z)");

    if (!/\d/.test(password)) suggestions.push("Add a number (0-9)");

    if (!/[^A-Za-z0-9]/.test(password))
      suggestions.push("Add a special character (!@#$)");

    if (password && suggestions.length === 0)
      suggestions.push("Strong password ✅");

    return suggestions;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo(null);
    setLoading(true);
    try {
      if (!isPasswordValid) {
        setLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Weak Password",
          text: "Password must be at least 8 characters and include uppercase, lowercase, number & symbol.",
        });
        return;
      }
      const res = await fetch(`${API}api/auth/register-patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, dateOfBirth, password, cnicLastDigits }),
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data?.msg || "Registration failed",
        });
      }
      // if (!res.ok) throw new Error(data?.msg || "Registration failed");
      // Show the Patient ID prominently
      setInfo({ patientId: data.patientId });
      // optionally auto-store token/user if you want immediate login:
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-md px-4 sm:px-6 py-12">
        <div className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          <span>›</span> <span>Register (Patient)</span>
        </div>

        <h1 className="text-2xl font-semibold mb-2">
          Create your patient account
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          You’ll receive a unique Patient ID to sign in.
        </p>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {info?.patientId ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
            <p className="font-medium">Registration successful!</p>
            <p className="mt-1">Your Patient ID is:</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="rounded-md bg-white px-2 py-1 text-gray-900 ring-1 ring-green-200">
                {info.patientId}
              </code>
              <button
                className="rounded-md px-2 py-1 text-xs ring-1 ring-green-300 hover:bg-white"
                onClick={() => navigator.clipboard.writeText(info.patientId!)}
              >
                Copy
              </button>
            </div>
            <p className="mt-3">
              Use this Patient ID with your password on the{" "}
              <Link
                href="/login"
                className="text-[var(--brand,#4b7eff)] underline"
              >
                login page
              </Link>
              .
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm text-gray-700">Gender</label>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                required
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">
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
              <label className="mb-1 block text-sm text-gray-700">
                CNIC last 4 Digits
              </label>
              <Input
                type="text"
                value={cnicLastDigits}
                onChange={(e) => setCnicLastDigits(e.target.value)}
                required
              />
            </div>

            {/* <div className="relative">
              <label className="mb-1 block text-sm text-gray-700">
                Password
              </label>
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div> */}
            <div className="relative">
              <label className="mb-1 block text-sm text-gray-700">
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
                className="absolute right-2 top-8 rounded-md px-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                {showPw ? "Hide" : "Show"}
              </button>

              {password && (
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                  <div
                    className={
                      passwordRules.length ? "text-green-600" : "text-red-500"
                    }
                  >
                    • At least 8 characters
                  </div>
                  <div
                    className={
                      passwordRules.upper ? "text-green-600" : "text-red-500"
                    }
                  >
                    • Contains uppercase letter
                  </div>
                  <div
                    className={
                      passwordRules.lower ? "text-green-600" : "text-red-500"
                    }
                  >
                    • Contains lowercase letter
                  </div>
                  <div
                    className={
                      passwordRules.number ? "text-green-600" : "text-red-500"
                    }
                  >
                    • Contains number
                  </div>
                  <div
                    className={
                      passwordRules.special ? "text-green-600" : "text-red-500"
                    }
                  >
                    • Contains special character
                  </div>
                </div>
              )}

              {/* {password && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    Suggestions:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {getPasswordSuggestions(password).map((s, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </div>
            <Button className="w-full" disabled={loading || !isPasswordValid}>
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Staff member?{" "}
          <Link
            href="/register/staff"
            className="text-[var(--brand,#4b7eff)] hover:underline"
          >
            Register as therapist/receptionist
          </Link>
        </p>
      </div>
    </div>
  );
}
