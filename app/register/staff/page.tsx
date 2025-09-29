// app/register/staff/page.tsx  (STAFF REGISTRATION WITH ADMIN APPROVAL)
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Fieldset from "@/components/Fieldset";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type Role = "therapist" | "receptionist";

const MODALITIES = ["CBT","DBT","EMDR","ACT","Mindfulness","Psychodynamic","Solution-Focused"];
const CONCERNS   = ["Anxiety","Depression","OCD","ADHD","PTSD & Trauma","Sleep Issues","Grief","Stress"];
const POPULATIONS= ["Individual","Couples","Family","Child & Adolescent","Group Therapy","Geriatric","LGBTQ+ Affirming"];
const CARE       = ["Online (Teletherapy)","In-Person","Psych Assessments","Workshops"];

export default function RegisterStaffPage() {
  const [role, setRole] = useState<Role>("therapist");
  const therapist = role === "therapist";

  const [form, setForm] = useState<any>({
    name: "", email: "", password: "",
    phone: "", address: "", dateOfBirth: "", cnic: "",
    profileFile: undefined as File | undefined,
    // therapist-only
    specializations: "",
    yearsExperience: 0,
    licenseNumber: "", licensingCouncil: "", clinicAddress: "", bio: "",
    certFiles: undefined as FileList | undefined,
  });

  const [modalities, setModalities] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [populations, setPopulations] = useState<string[]>([]);
  const [careSettings, setCareSettings] = useState<string[]>([]);
  const [err, setErr] = useState(""); const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const profilePreview = useMemo(
    () => (form.profileFile ? URL.createObjectURL(form.profileFile) : ""),
    [form.profileFile]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setLoading(true);

    try {
      if (!form.name || !form.email || !form.password || !form.phone || !form.address || !form.dateOfBirth || !form.cnic) {
        throw new Error("Please fill all required fields.");
      }
      if (!form.profileFile) throw new Error("Profile picture is required.");
      if (therapist) {
        if (!form.specializations?.trim()) throw new Error("Add at least one specialization.");
        if (!form.certFiles?.length) throw new Error("Upload at least one certification document.");
      }

      const fd = new FormData();
      fd.set("role", role);
      fd.set("name", form.name);
      fd.set("email", form.email);
      fd.set("password", form.password);
      fd.set("phone", form.phone);
      fd.set("address", form.address);
      fd.set("dateOfBirth", form.dateOfBirth);
      fd.set("cnic", form.cnic);
      fd.append("profilePicture", form.profileFile);

      if (therapist) {
        fd.set("specializations", form.specializations);
        fd.set("yearsExperience", String(form.yearsExperience || 0));
        fd.set("licenseNumber", form.licenseNumber || "");
        fd.set("licensingCouncil", form.licensingCouncil || "");
        fd.set("clinicAddress", form.clinicAddress || "");
        fd.set("bio", form.bio || "");
        modalities.forEach(v => fd.append("modalities", v));
        concerns.forEach(v => fd.append("concerns", v));
        populations.forEach(v => fd.append("populations", v));
        careSettings.forEach(v => fd.append("careSettings", v));
        Array.from(form.certFiles || []).forEach((f: any) => fd.append("certificationFiles", f));
      }

      const res = await fetch(`${API}api/auth/register`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Registration failed");

      setInfo(
        data?.message || (role === "receptionist"
          ? "Receptionist account submitted. Awaiting admin approval."
          : "Therapist account submitted. Awaiting admin approval.")
      );
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:underline">Home</Link> <span>›</span> <span>Register (Staff)</span>
        </div>

        <h1 className="text-2xl font-semibold mb-2">Register staff account</h1>
        <p className="text-sm text-gray-600 mb-6">Admin approval is required before you can sign in.</p>

        {err && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
        {info && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{info}</div>}

        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Role</label>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="therapist">Therapist</option>
                <option value="receptionist">Receptionist</option>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Full name" value={form.name} onChange={e => setForm((f:any)=>({...f,name:e.target.value}))} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm((f:any)=>({...f,email:e.target.value}))} required />
              <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm((f:any)=>({...f,password:e.target.value}))} required />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm((f:any)=>({...f,phone:e.target.value}))} required />
              <Input placeholder="Address" value={form.address} onChange={e => setForm((f:any)=>({...f,address:e.target.value}))} required />
              <div>
                <label className="mb-1 block text-sm text-gray-700">Date of birth</label>
                <Input type="date" value={form.dateOfBirth} onChange={e => setForm((f:any)=>({...f,dateOfBirth:e.target.value}))} required />
              </div>
              <Input placeholder="CNIC" value={form.cnic} onChange={e => setForm((f:any)=>({...f,cnic:e.target.value}))} required />
            </div>

            {therapist && (
              <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-medium">Therapist details</p>
                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <Input placeholder="Specializations (comma separated)" value={form.specializations} onChange={e => setForm((f:any)=>({...f,specializations:e.target.value}))} />
                  <Input type="number" min={0} placeholder="Years of experience" value={form.yearsExperience} onChange={e => setForm((f:any)=>({...f,yearsExperience:e.target.value}))} />
                  <Input placeholder="License number" value={form.licenseNumber} onChange={e => setForm((f:any)=>({...f,licenseNumber:e.target.value}))} />
                  <Input placeholder="Licensing council" value={form.licensingCouncil} onChange={e => setForm((f:any)=>({...f,licensingCouncil:e.target.value}))} />
                  <Input placeholder="Clinic address" value={form.clinicAddress} onChange={e => setForm((f:any)=>({...f,clinicAddress:e.target.value}))} />
                </div>

                <label className="mt-3 mb-1 block text-sm text-gray-700">Bio</label>
                <textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} value={form.bio} onChange={e => setForm((f:any)=>({...f,bio:e.target.value}))} />

                <div className="mt-3 grid gap-4">
                  <Fieldset title="Modalities" items={MODALITIES} values={modalities} onToggle={(v) => toggle(modalities, setModalities, v)} />
                  <Fieldset title="Concerns" items={CONCERNS} values={concerns} onToggle={(v) => toggle(concerns, setConcerns, v)} />
                  <Fieldset title="Populations" items={POPULATIONS} values={populations} onToggle={(v) => toggle(populations, setPopulations, v)} />
                  <Fieldset title="Care Settings" items={CARE} values={careSettings} onToggle={(v) => toggle(careSettings, setCareSettings, v)} />
                </div>

                <div className="mt-3">
                  <label className="block text-sm text-gray-700 mb-1">Certification documents <span className="text-red-600">*</span></label>
                  <input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setForm((f:any)=>({...f,certFiles:e.target.files||undefined}))} required className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white" />
                </div>
              </div>
            )}
          </div>

          <aside className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-900">Profile photo <span className="text-red-600">*</span></p>
              {profilePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePreview} alt="Preview" className="mb-3 h-28 w-28 rounded-xl object-cover ring-1 ring-gray-200" />
              ) : (
                <div className="mb-3 grid h-28 w-28 place-items-center rounded-xl bg-gray-100 text-xs text-gray-500">No photo</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setForm((f:any)=>({...f,profileFile:e.target.files?.[0]}))} required className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-gray-500">JPG/PNG/WebP up to ~3–5MB.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Button className="w-full" disabled={loading}>{loading ? "Submitting…" : "Submit for approval"}</Button>
              <p className="mt-3 text-center text-sm text-gray-600">
                Already approved?{" "}
                <Link href="/login" className="text-[var(--brand,#4b7eff)] hover:underline">Log in</Link>
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
