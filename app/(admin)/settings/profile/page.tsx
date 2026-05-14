"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Fees = { currency?: string; online?: number; inPerson?: number };
type TherapistInfo = {
  bio?: string;
  licenseNumber?: string;
  licensingCouncil?: string;
  yearsExperience?: number;
  clinicAddress?: string;
  specializations?: string[];
  modalities?: string[];
  concerns?: string[];
  populations?: string[];
  fees?: Fees;
  specialtiesCompleted?: boolean;
};
type EmergencyContact = { name?: string; phone?: string };
type MeUser = {
  _id?: string;
  id?: string;
  role: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  gender?: "male" | "female" | "other" | string;
  dateOfBirth?: string;
  patientId?: string;
  cnicLastDigits?: string;
  cnic?: string;
  emergencyContact?: EmergencyContact;
  therapistInfo?: TherapistInfo;
  isApproved?: boolean;
  dateOfRegistration?: string;
  lastLogin?: string;
};

export default function SettingsProfilePage() {
  return (
    <Protected>
      <Inner />
    </Protected>
  );
}

function Inner() {
  const { token, user: authUser, updateUser, logout } = useAuth() as any;

  const [me, setMe] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Editable copies of profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");

  // Therapist fields
  const [bio, setBio] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licensingCouncil, setLicensingCouncil] = useState("");
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [feeOnline, setFeeOnline] = useState<string>("");
  const [feeInPerson, setFeeInPerson] = useState<string>("");
  const [feeCurrency, setFeeCurrency] = useState("PKR");

  // Password change
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdErr, setPwdErr] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  const initialRef = useRef<string>("");

  function hydrate(u: MeUser) {
    setMe(u);
    setName(u.name || "");
    setPhone(u.phone || "");
    setProfilePicture(u.profilePicture || "");
    setGender(u.gender || "");
    setDob(u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().slice(0, 10) : "");
    setEcName(u.emergencyContact?.name || "");
    setEcPhone(u.emergencyContact?.phone || "");
    const ti = u.therapistInfo || {};
    setBio(ti.bio || "");
    setLicenseNumber(ti.licenseNumber || "");
    setLicensingCouncil(ti.licensingCouncil || "");
    setYearsExperience(
      ti.yearsExperience !== undefined && ti.yearsExperience !== null
        ? String(ti.yearsExperience)
        : ""
    );
    setClinicAddress(ti.clinicAddress || "");
    setSpecializations((ti.specializations || []).join(", "));
    setFeeCurrency(ti.fees?.currency || "PKR");
    setFeeOnline(ti.fees?.online !== undefined ? String(ti.fees.online) : "");
    setFeeInPerson(ti.fees?.inPerson !== undefined ? String(ti.fees.inPerson) : "");
    initialRef.current = JSON.stringify({
      name: u.name || "",
      phone: u.phone || "",
      profilePicture: u.profilePicture || "",
      gender: u.gender || "",
      dob: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().slice(0, 10) : "",
      ecName: u.emergencyContact?.name || "",
      ecPhone: u.emergencyContact?.phone || "",
      bio: ti.bio || "",
      licenseNumber: ti.licenseNumber || "",
      licensingCouncil: ti.licensingCouncil || "",
      yearsExperience:
        ti.yearsExperience !== undefined && ti.yearsExperience !== null
          ? String(ti.yearsExperience)
          : "",
      clinicAddress: ti.clinicAddress || "",
      specializations: (ti.specializations || []).join(", "),
      feeCurrency: ti.fees?.currency || "PKR",
      feeOnline: ti.fees?.online !== undefined ? String(ti.fees.online) : "",
      feeInPerson: ti.fees?.inPerson !== undefined ? String(ti.fees.inPerson) : "",
    });
  }

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const u = (await api("api/auth/me", {
          headers: authHeader(token || undefined),
        } as RequestInit)) as MeUser;
        hydrate(u);
      } catch (e: any) {
        if (authUser) hydrate(authUser as MeUser);
        else setErr(e?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const role = me?.role || authUser?.role || "patient";
  const isTherapist = role === "therapist";
  const isPatient = role === "patient";

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name,
        phone,
        profilePicture,
        gender,
        dob,
        ecName,
        ecPhone,
        bio,
        licenseNumber,
        licensingCouncil,
        yearsExperience,
        clinicAddress,
        specializations,
        feeCurrency,
        feeOnline,
        feeInPerson,
      }),
    [
      name,
      phone,
      profilePicture,
      gender,
      dob,
      ecName,
      ecPhone,
      bio,
      licenseNumber,
      licensingCouncil,
      yearsExperience,
      clinicAddress,
      specializations,
      feeCurrency,
      feeOnline,
      feeInPerson,
    ]
  );

  const isDirty = currentSnapshot !== initialRef.current;

  async function save() {
    setErr("");
    setMsg("");
    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        profilePicture: profilePicture.trim(),
      };
      if (isPatient) {
        if (gender) payload.gender = gender;
        if (dob) payload.dateOfBirth = dob;
        payload.emergencyContact = {
          name: ecName.trim(),
          phone: ecPhone.trim(),
        };
      }
      if (isTherapist) {
        payload.therapistInfo = {
          bio: bio,
          licenseNumber: licenseNumber.trim(),
          licensingCouncil: licensingCouncil.trim(),
          yearsExperience: yearsExperience === "" ? undefined : Number(yearsExperience),
          clinicAddress: clinicAddress.trim(),
          specializations: specializations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          fees: {
            currency: feeCurrency.trim() || "PKR",
            online: feeOnline === "" ? undefined : Number(feeOnline),
            inPerson: feeInPerson === "" ? undefined : Number(feeInPerson),
          },
        };
      }

      const res = await api("api/auth/me", {
        method: "PATCH",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify(payload),
      });

      if (res?.user) {
        hydrate(res.user as MeUser);
        if (updateUser) {
          updateUser({
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            profilePicture: res.user.profilePicture,
          });
        }
      }
      setMsg("Profile saved.");
    } catch (e: any) {
      setErr(e?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPwdErr("");
    setPwdMsg("");
    if (!oldPwd || !newPwd) {
      setPwdErr("Fill in both fields.");
      return;
    }
    if (newPwd.length < 8) {
      setPwdErr("New password must be at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdErr("Passwords do not match.");
      return;
    }
    setPwdSaving(true);
    try {
      await api("api/auth/me/password", {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      setPwdMsg("Password changed.");
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e: any) {
      setPwdErr(e?.message || "Could not change password.");
    } finally {
      setPwdSaving(false);
    }
  }

  function discard() {
    if (me) hydrate(me);
    setErr("");
    setMsg("");
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
            Settings
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Your profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account, contact details, and{" "}
            {isTherapist
              ? "practice information"
              : isPatient
                ? "emergency contact"
                : "preferences"}
            .
          </p>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {msg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4b7eff]" />
            <p className="mt-3 text-sm text-gray-500">Loading profile…</p>
          </div>
        ) : (
          <>
            {/* Identity */}
            <Section
              title="Identity"
              description="Basic info shown to other users you interact with."
            >
              <div className="flex flex-wrap items-center gap-4">
                <Avatar src={profilePicture} name={name || me?.email || "User"} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {name || me?.email || "—"}
                  </p>
                  <p className="text-xs text-gray-500">{me?.email || "—"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-[#4b7eff]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4b7eff]">
                      {role}
                    </span>
                    {isPatient && me?.patientId && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                        PT # {me.patientId}
                      </span>
                    )}
                    {me?.isApproved === false && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                        Pending approval
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Field label="Profile picture URL" hint="Paste a hosted image URL.">
                <Input
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </Section>

            {/* Basic info */}
            <Section
              title="Basic info"
              description="Used in appointments, receipts, and communications."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={isPatient ? "Full name (optional)" : "Full name"}>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Email" hint="Email cannot be changed here.">
                  <Input value={me?.email || ""} disabled />
                </Field>
                <Field label="Phone">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                {isPatient && (
                  <>
                    <Field label="Gender">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-[#4b7eff] focus:outline-none focus:ring-2 focus:ring-[#4b7eff]"
                      >
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                    <Field label="Date of birth">
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </Field>
                  </>
                )}
                {!isPatient && me?.cnic && (
                  <Field label="CNIC" hint="Locked after registration.">
                    <Input value={me.cnic} disabled />
                  </Field>
                )}
              </div>
            </Section>

            {/* Emergency contact (patient) */}
            {isPatient && (
              <Section
                title="Emergency contact"
                description="A person we can reach in case of an emergency during a session."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input value={ecName} onChange={(e) => setEcName(e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} />
                  </Field>
                </div>
              </Section>
            )}

            {/* Therapist practice info */}
            {isTherapist && (
              <>
                <Section
                  title="Practice"
                  description="How patients see your services."
                >
                  <Field
                    label="Professional bio"
                    hint="A short description visible in the therapist directory."
                    counter={`${bio.length} / 2000`}
                  >
                    <textarea
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff]"
                      rows={5}
                      value={bio}
                      maxLength={2000}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell patients about your approach, training, and areas of focus…"
                    />
                  </Field>

                  <Field
                    label="Specializations"
                    hint="Comma-separated, e.g., CBT, anxiety, trauma."
                  >
                    <Input
                      value={specializations}
                      onChange={(e) => setSpecializations(e.target.value)}
                      placeholder="CBT, anxiety, trauma"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Currency">
                      <Input
                        value={feeCurrency}
                        onChange={(e) => setFeeCurrency(e.target.value)}
                      />
                    </Field>
                    <Field label="Online fee">
                      <Input
                        type="number"
                        min={0}
                        value={feeOnline}
                        onChange={(e) => setFeeOnline(e.target.value)}
                      />
                    </Field>
                    <Field label="In-person fee">
                      <Input
                        type="number"
                        min={0}
                        value={feeInPerson}
                        onChange={(e) => setFeeInPerson(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Clinic address">
                    <Input
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      placeholder="Street, city, country"
                    />
                  </Field>
                </Section>

                <Section
                  title="Credentials"
                  description="Used for verification and shown to patients."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="License number">
                      <Input
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </Field>
                    <Field label="Licensing council">
                      <Input
                        value={licensingCouncil}
                        onChange={(e) => setLicensingCouncil(e.target.value)}
                      />
                    </Field>
                    <Field label="Years of experience">
                      <Input
                        type="number"
                        min={0}
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                      />
                    </Field>
                  </div>
                </Section>

                <Section
                  title="Specialties & modalities"
                  description="Modalities, concerns, populations, and care settings that help patients find you."
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-amber-900">
                        {me?.therapistInfo?.specialtiesCompleted
                          ? "Specialties profile complete"
                          : "Complete your specialties profile"}
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        Edit modalities, concerns, populations, and care settings in
                        the dedicated dialog on the dashboard.
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
                    >
                      Open dashboard
                    </Link>
                  </div>
                </Section>
              </>
            )}

            {/* Sticky save bar */}
            <div className="sticky bottom-4 z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span
                    className={[
                      "inline-flex h-2 w-2 rounded-full",
                      isDirty ? "bg-amber-400" : "bg-emerald-500",
                    ].join(" ")}
                  />
                  {isDirty ? "Unsaved changes" : "All changes saved"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={discard}
                    disabled={!isDirty || saving}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Discard
                  </button>
                  <Button onClick={save} disabled={saving || !isDirty}>
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Security */}
            <Section
              title="Security"
              description="Change your password. You'll stay signed in on this device."
            >
              {pwdErr && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pwdErr}
                </div>
              )}
              {pwdMsg && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {pwdMsg}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Current password">
                  <Input
                    type="password"
                    value={oldPwd}
                    onChange={(e) => setOldPwd(e.target.value)}
                    autoComplete="current-password"
                  />
                </Field>
                <Field label="New password" hint="Minimum 8 characters.">
                  <Input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm new password">
                  <Input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button onClick={changePassword} disabled={pwdSaving}>
                  {pwdSaving ? "Changing…" : "Change password"}
                </Button>
              </div>
            </Section>

            {/* Account */}
            <Section
              title="Account"
              description="Quick actions on your sign-in."
            >
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Sign out</p>
                  <p className="text-xs text-gray-500">
                    End your session on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => logout?.()}
                  className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
              {me?.dateOfRegistration && (
                <p className="text-xs text-gray-500">
                  Registered{" "}
                  {new Date(me.dateOfRegistration).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}
                </p>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        {counter && <span className="text-[10px] text-gray-400">{counter}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className="h-14 w-14 shrink-0 rounded-full border border-gray-200 bg-gray-100 object-cover"
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4b7eff] to-[#6aa7ff] text-lg font-bold text-white">
      {initial}
    </div>
  );
}
