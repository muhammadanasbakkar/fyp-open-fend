"use client";

import { useState } from "react";
import Link from "next/link";

// ── role-specific copy pulled from the TheraKonnect Privacy Policy ──────────
type Role = "patient" | "therapist" | "receptionist" | "supervisor";

type RoleCopy = {
  title: string;
  intro: string;
  collects: string[];
  used: string[];
  rights?: string[];
  duties?: string[];
  /** A short role-specific commitment shown next to the checkbox. */
  commitment: string;
  policyAnchor: string;
};

const ROLE_COPY: Record<Role, RoleCopy> = {
  patient: {
    title: "Privacy & confidentiality — for patients",
    intro:
      "Your therapy records, clinical notes, and mental-health information are private. They are only accessible to your therapist, their authorized supervisor, and the clinic involved in your care.",
    collects: [
      "Name, phone, email, age/DOB, gender, city",
      "Login details and platform activity",
      "Appointment bookings and therapist selection",
      "Therapy preferences and history you share",
      "Clinical notes created by your therapist",
      "Payment / billing details, where applicable",
    ],
    used: [
      "Create and manage your account",
      "Book and manage therapy appointments",
      "Connect you with therapists",
      "Maintain therapy notes and records",
      "Send appointment reminders and notifications",
      "Comply with legal or safety requirements",
    ],
    rights: [
      "Access your personal information",
      "Correct inaccurate information",
      "Close your account",
      "Restrict non-essential communication",
      "Request information about how your data is used",
    ],
    commitment:
      "I understand my therapy records are confidential and only accessible to my therapist, their authorized supervisor, and the clinic involved in my care.",
    policyAnchor: "patient-policy",
  },

  therapist: {
    title: "Privacy & confidentiality — for therapists",
    intro:
      "As a clinician on TheraKonnect, you must protect patient confidentiality and only access records authorized for your role.",
    collects: [
      "Name, phone, email, profile photo",
      "Qualifications, experience, specialties",
      "License / certification details",
      "Clinic affiliation and availability schedule",
      "Appointment history and patient records you create",
      "Supervisor comments / review history",
    ],
    used: [
      "Create and manage your therapist account",
      "Verify your identity and qualifications",
      "Display your profile to patients",
      "Manage availability and appointments",
      "Maintain therapy records and notes",
      "Process payouts where applicable",
    ],
    duties: [
      "Don't share patient information without authorization",
      "Don't download or copy patient records unnecessarily",
      "Don't use patient data for marketing",
      "Don't share login credentials",
      "Don't record sessions without proper consent",
      "Discuss patient cases only in authorized clinical or supervision settings",
    ],
    commitment:
      "I commit to protecting patient confidentiality, only accessing records authorized for my role, and following the responsibilities outlined in the policy.",
    policyAnchor: "therapist-policy",
  },

  receptionist: {
    title: "Privacy & confidentiality — for clinic staff",
    intro:
      "Clinic personnel may access patient information only for legitimate clinical, administrative, appointment-management, billing, or recordkeeping purposes.",
    collects: [
      "Name, phone, email, profile photo",
      "Clinic affiliation",
      "Login activity and platform usage",
    ],
    used: [
      "Create and manage your clinic-staff account",
      "Allow you to manage appointments at your clinic",
      "Support patient lookup and recordkeeping",
      "Maintain audit logs of administrative actions",
    ],
    duties: [
      "Don't access, use, copy, export, or disclose patient information unless required for your assigned role",
      "Don't share patient details outside the clinic",
      "Don't share login credentials or allow unauthorized persons to access records",
      "Use the platform only for legitimate clinic operations",
    ],
    commitment:
      "I commit to accessing patient information only for legitimate clinic operations and protecting confidentiality at all times.",
    policyAnchor: "patient-policy", // clinic access is described inside Section 5.3 / Patient policy
  },

  supervisor: {
    title: "Privacy & confidentiality — for supervisors",
    intro:
      "You may access patient records only for therapists assigned to your supervision, and only for reviewing therapy work, case notes, or clinical guidance.",
    collects: [
      "Name, phone, email",
      "Qualifications, experience, clinic affiliation",
      "Assigned therapists",
      "Supervision notes and case review comments",
      "Login activity and platform usage",
    ],
    used: [
      "Create and manage your supervisor account",
      "Assign therapists for supervision",
      "Review therapist work and clinical quality",
      "Maintain supervision records",
      "Support clinic administration",
    ],
    duties: [
      "Don't access patient records outside your assigned supervision role",
      "Don't share patient records externally",
      "Don't use patient information for teaching, research, or publication without proper authorization",
      "Don't copy, export, or disclose therapy notes without permission",
      "Use patient information only for supervision purposes — never personal use",
    ],
    commitment:
      "I commit to accessing patient records only for therapists assigned to me, and using that access strictly for supervision and clinical guidance.",
    policyAnchor: "supervisor-policy",
  },
};

// ── component ───────────────────────────────────────────────────────────────
export default function PolicyConsent({
  role,
  agreed,
  onChange,
  className = "",
}: {
  role: Role;
  agreed: boolean;
  onChange: (next: boolean) => void;
  className?: string;
}) {
  const copy = ROLE_COPY[role];
  const [open, setOpen] = useState(false);

  return (
    <div
      className={[
        "rounded-2xl border bg-white shadow-sm transition-colors",
        agreed ? "border-emerald-200" : "border-slate-200",
        className,
      ].join(" ")}
    >
      {/* Header strip */}
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-[#4b7eff]/8 to-transparent px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{copy.title}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Specific to your role ·
            <Link
              href={`/privacy#${copy.policyAnchor}`}
              target="_blank"
              className="ml-1 text-[#4b7eff] underline-offset-2 hover:underline"
            >
              View full policy
            </Link>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs leading-relaxed text-slate-600">{copy.intro}</p>

        {/* Collapsible details */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#4b7eff] hover:underline"
          aria-expanded={open}
        >
          <svg
            className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          {open ? "Hide details" : "What this means in detail"}
        </button>

        {open && (
          <div className="mt-3 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <DetailGroup title="Information we collect" items={copy.collects} tone="blue" />
            <DetailGroup title="How it's used" items={copy.used} tone="indigo" />
            {copy.rights && <DetailGroup title="Your rights" items={copy.rights} tone="emerald" />}
            {copy.duties && <DetailGroup title="Your responsibilities" items={copy.duties} tone="rose" />}
            <p className="pt-1 text-[11px] text-slate-500">
              For the complete document covering data sharing, security, retention, and contact details, read the{" "}
              <Link href="/privacy" target="_blank" className="font-medium text-[#4b7eff] underline-offset-2 hover:underline">
                full Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}

        {/* Consent checkbox */}
        <label
          className={[
            "mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors",
            agreed
              ? "border-emerald-300 bg-emerald-50/60"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100",
          ].join(" ")}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#4b7eff] focus:ring-2 focus:ring-[#4b7eff]/40"
          />
          <span className="text-xs leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">I agree.</span>{" "}
            {copy.commitment}
          </span>
        </label>
      </div>
    </div>
  );
}

// ── small helper ────────────────────────────────────────────────────────────
function DetailGroup({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "blue" | "indigo" | "emerald" | "rose";
}) {
  const dotCls: Record<string, string> = {
    blue: "bg-blue-400",
    indigo: "bg-indigo-400",
    emerald: "bg-emerald-400",
    rose: "bg-rose-400",
  };
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
            <span className={`mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full ${dotCls[tone]}`} aria-hidden />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
