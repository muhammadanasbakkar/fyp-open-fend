"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// ── types ──────────────────────────────────────────────────────────────────
type HospitalInfo = {
  name: string; city: string; address: string; phone: string;
  email: string; website: string; description: string; type: string;
};
type AdminInfo = { adminName: string; adminEmail: string; adminPassword: string; confirmPassword: string };

const HOSPITAL_TYPES = [
  { value: "hospital",        label: "Hospital" },
  { value: "clinic",          label: "Clinic" },
  { value: "wellness-center", label: "Wellness Center" },
  { value: "rehab-center",    label: "Rehab Center" },
  { value: "other",           label: "Other" },
];

// ── step indicators ────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Hospital Info", "Admin Account", "Review & Submit"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done    = idx < current;
        const active  = idx === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                done   ? "bg-emerald-500 text-white"
                : active ? "bg-[#4b7eff] text-white"
                : "bg-gray-100 text-gray-400"
              }`}>
                {done ? "✓" : idx}
              </div>
              <span className={`text-[11px] font-medium ${active ? "text-[#4b7eff]" : done ? "text-emerald-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 mb-5 h-0.5 w-12 sm:w-20 transition-colors ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── field components ───────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4b7eff] focus:bg-white focus:outline-none transition-colors";

// ── step 1: hospital info ──────────────────────────────────────────────────
function Step1({ data, onChange, onNext }: {
  data: HospitalInfo;
  onChange: (d: Partial<HospitalInfo>) => void;
  onNext: () => void;
}) {
  const [err, setErr] = useState("");

  function validate() {
    if (!data.name.trim())    return setErr("Hospital name is required.");
    if (!data.city.trim())    return setErr("City is required.");
    if (!data.address.trim()) return setErr("Address is required.");
    if (!data.phone.trim())   return setErr("Phone is required.");
    if (!data.email.trim())   return setErr("Email is required.");
    setErr("");
    onNext();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hospital Name" required>
          <input className={inputCls} value={data.name} onChange={e => onChange({ name: e.target.value })} placeholder="e.g. City Care Hospital" />
        </Field>
        <Field label="Type" required>
          <select className={inputCls} value={data.type} onChange={e => onChange({ type: e.target.value })}>
            {HOSPITAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="City" required>
          <input className={inputCls} value={data.city} onChange={e => onChange({ city: e.target.value })} placeholder="e.g. Karachi" />
        </Field>
        <Field label="Phone" required>
          <input className={inputCls} value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+92 300 0000000" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address" required>
            <input className={inputCls} value={data.address} onChange={e => onChange({ address: e.target.value })} placeholder="Street address" />
          </Field>
        </div>
        <Field label="Official Email" required>
          <input type="email" className={inputCls} value={data.email} onChange={e => onChange({ email: e.target.value })} placeholder="info@hospital.pk" />
        </Field>
        <Field label="Website">
          <input className={inputCls} value={data.website} onChange={e => onChange({ website: e.target.value })} placeholder="https://hospital.pk" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={data.description}
              onChange={e => onChange({ description: e.target.value })}
              placeholder="Brief description of your facility and services…"
            />
          </Field>
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex justify-end">
        <button onClick={validate} className="rounded-xl bg-[#4b7eff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6bef] transition-colors shadow-sm">
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── step 2: admin account ──────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }: {
  data: AdminInfo;
  onChange: (d: Partial<AdminInfo>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);

  function validate() {
    if (!data.adminName.trim())  return setErr("Your name is required.");
    if (!data.adminEmail.trim()) return setErr("Your email is required.");
    if (data.adminPassword.length < 8) return setErr("Password must be at least 8 characters.");
    if (data.adminPassword !== data.confirmPassword) return setErr("Passwords do not match.");
    setErr("");
    onNext();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        This account will be used to manage your hospital on TheraKonnect. You will be able to log in once your application is approved.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your Full Name" required>
          <input className={inputCls} value={data.adminName} onChange={e => onChange({ adminName: e.target.value })} placeholder="e.g. Dr. Ahmed Khan" />
        </Field>
        <Field label="Your Email" required>
          <input type="email" className={inputCls} value={data.adminEmail} onChange={e => onChange({ adminEmail: e.target.value })} placeholder="you@hospital.pk" />
        </Field>
        <Field label="Password" required>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className={`${inputCls} pr-10`}
              value={data.adminPassword}
              onChange={e => onChange({ adminPassword: e.target.value })}
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" required>
          <input
            type={showPw ? "text" : "password"}
            className={inputCls}
            value={data.confirmPassword}
            onChange={e => onChange({ confirmPassword: e.target.value })}
            placeholder="Repeat password"
          />
        </Field>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={validate} className="rounded-xl bg-[#4b7eff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6bef] transition-colors shadow-sm">
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── step 3: review ─────────────────────────────────────────────────────────
function Step3({ hospital, admin, onBack, onSubmit, submitting }: {
  hospital: HospitalInfo;
  admin: AdminInfo;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const typeLabel = HOSPITAL_TYPES.find(t => t.value === hospital.type)?.label || hospital.type;

  function Row({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex justify-between gap-4 py-2">
        <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
        <span className="text-xs text-gray-900 text-right">{value || "—"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#4b7eff]/8 to-[#7c3aed]/8 px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Hospital Details</p>
        </div>
        <div className="divide-y divide-gray-50 px-4">
          <Row label="Name"        value={hospital.name} />
          <Row label="Type"        value={typeLabel} />
          <Row label="City"        value={hospital.city} />
          <Row label="Address"     value={hospital.address} />
          <Row label="Phone"       value={hospital.phone} />
          <Row label="Email"       value={hospital.email} />
          {hospital.website && <Row label="Website" value={hospital.website} />}
          {hospital.description && <Row label="Description" value={hospital.description} />}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#4b7eff]/8 to-[#7c3aed]/8 px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Admin Account</p>
        </div>
        <div className="divide-y divide-gray-50 px-4">
          <Row label="Name"  value={admin.adminName} />
          <Row label="Email" value={admin.adminEmail} />
          <Row label="Password" value="••••••••" />
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        Your application will be reviewed by our team. You will be notified once your hospital is approved and your account is activated.
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} disabled={submitting} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

// ── success screen ─────────────────────────────────────────────────────────
function Success() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Application Submitted!</h2>
        <p className="mt-1 text-sm text-gray-600 max-w-sm">
          Thank you for registering your hospital on TheraKonnect. Our team will review your application and notify you once approved.
        </p>
      </div>
      <Link
        href="/hospital/login"
        className="mt-2 rounded-xl bg-[#4b7eff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6bef] transition-colors shadow-sm"
      >
        Go to Hospital Login
      </Link>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function HospitalOnboardPage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo>({
    name: "", city: "", address: "", phone: "", email: "", website: "", description: "", type: "hospital",
  });
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    adminName: "", adminEmail: "", adminPassword: "", confirmPassword: "",
  });

  async function submit() {
    setSubmitting(true);
    setSubmitErr("");
    try {
      await api("api/hospital/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...hospitalInfo, ...adminInfo }),
      });
      setDone(true);
    } catch (e: any) {
      setSubmitErr(e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-white text-2xl mb-4">
            🏥
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enroll Your Hospital</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join TheraKonnect to connect your facility with licensed therapists
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
          {done ? (
            <Success />
          ) : (
            <>
              <Steps current={step} />

              {submitErr && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitErr}
                </div>
              )}

              {step === 1 && (
                <Step1
                  data={hospitalInfo}
                  onChange={d => setHospitalInfo(prev => ({ ...prev, ...d }))}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <Step2
                  data={adminInfo}
                  onChange={d => setAdminInfo(prev => ({ ...prev, ...d }))}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3
                  hospital={hospitalInfo}
                  admin={adminInfo}
                  onBack={() => setStep(2)}
                  onSubmit={submit}
                  submitting={submitting}
                />
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Already enrolled?{" "}
          <Link href="/hospital/login" className="text-[#4b7eff] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
