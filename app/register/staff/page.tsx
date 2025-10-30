"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Fieldset from "@/components/Fieldset";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type Role = "therapist" | "receptionist";

type Hospital = {
  _id: string;
  name: string;
  city?: string;
  address?: string;
};

const MODALITIES = ["CBT","DBT","EMDR","ACT","Mindfulness","Psychodynamic","Solution-Focused"];
const CONCERNS = ["Anxiety","Depression","OCD","ADHD","PTSD & Trauma","Sleep Issues","Grief","Stress"];
const POPULATIONS = ["Individual","Couples","Family","Child & Adolescent","Group Therapy","Geriatric","LGBTQ+ Affirming"];
const CARE = ["Online (Teletherapy)","In-Person","Psych Assessments","Workshops"];

export default function RegisterStaffPage() {
  const [role, setRole] = useState<Role>("therapist");
  const therapist = role === "therapist";

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    cnic: "",
    profileFile: undefined as File | undefined,
    // therapist-only
    specializations: "",
    yearsExperience: 0,
    licenseNumber: "",
    licensingCouncil: "",
    clinicAddress: "",
    bio: "",
    certFiles: undefined as FileList | undefined,
  });

  // hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospLoading, setHospLoading] = useState(false);
  const [hospErr, setHospErr] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [primaryHospital, setPrimaryHospital] = useState<string | null>(null);
  const [hospSearch, setHospSearch] = useState("");

  // therapist skill sets
  const [modalities, setModalities] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [populations, setPopulations] = useState<string[]>([]);
  const [careSettings, setCareSettings] = useState<string[]>([]);

  // pricing
  const [feesCurrency, setFeesCurrency] = useState("PKR");
  const [feesOnline, setFeesOnline] = useState<string>("");
  const [feesInPerson, setFeesInPerson] = useState<string>("");

  // per-hospital fee overrides (key = hospitalId)
  const [hospitalFees, setHospitalFees] = useState<Record<string, string>>({});

  // ui
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const profilePreview = useMemo(
    () => (form.profileFile ? URL.createObjectURL(form.profileFile) : ""),
    [form.profileFile]
  );

  // Load hospitals (only for therapist role)
  useEffect(() => {
    if (!therapist) return;
    (async () => {
      try {
        setHospErr("");
        setHospLoading(true);
        const res = await fetch(`${API}api/public/hospitals`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.msg || "Unable to load hospitals");
        setHospitals(Array.isArray(data) ? data : data?.hospitals || []);
      } catch (e: any) {
        setHospErr(e.message || "Failed to load hospitals");
      } finally {
        setHospLoading(false);
      }
    })();
  }, [therapist]);

  // Keep primaryHospital consistent with selection
  useEffect(() => {
    if (primaryHospital && !selectedHospitals.includes(primaryHospital)) {
      setPrimaryHospital(selectedHospitals[0] || null);
    }
  }, [selectedHospitals, primaryHospital]);

  // If role switches to receptionist, clear therapist-only state
  useEffect(() => {
    if (!therapist) {
      setSelectedHospitals([]);
      setPrimaryHospital(null);
      setModalities([]);
      setConcerns([]);
      setPopulations([]);
      setCareSettings([]);
      setFeesOnline("");
      setFeesInPerson("");
      setHospitalFees({});
    }
  }, [therapist]);

  // Filtered hospitals by search
  const filteredHospitals = useMemo(() => {
    const q = hospSearch.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.city || "").toLowerCase().includes(q) ||
        (h.address || "").toLowerCase().includes(q)
    );
  }, [hospitals, hospSearch]);

  function toggleHospital(id: string) {
    setSelectedHospitals((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        const next = prev.filter((x) => x !== id);
        // clean fee input for unselected hospital
        setHospitalFees((fees) => {
          const { [id]: _, ...rest } = fees;
          return rest;
        });
        return next;
      } else {
        return [...prev, id];
      }
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setLoading(true);

    try {
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.phone ||
        !form.address ||
        !form.dateOfBirth ||
        !form.cnic
      ) {
        throw new Error("Please fill all required fields.");
      }
      if (!form.profileFile) throw new Error("Profile picture is required.");

      if (therapist) {
        if (!form.specializations?.trim())
          throw new Error("Add at least one specialization.");
        if (!form.certFiles?.length)
          throw new Error("Upload at least one certification document.");
        if (selectedHospitals.length > 0 && !primaryHospital) {
          throw new Error("Please choose a primary hospital.");
        }
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
        // therapist details
        fd.set("specializations", form.specializations);
        fd.set("yearsExperience", String(form.yearsExperience || 0));
        fd.set("licenseNumber", form.licenseNumber || "");
        fd.set("licensingCouncil", form.licensingCouncil || "");
        fd.set("clinicAddress", form.clinicAddress || "");
        fd.set("bio", form.bio || "");
        modalities.forEach((v) => fd.append("modalities", v));
        concerns.forEach((v) => fd.append("concerns", v));
        populations.forEach((v) => fd.append("populations", v));
        careSettings.forEach((v) => fd.append("careSettings", v));
        Array.from(form.certFiles || []).forEach((f: any) =>
          fd.append("certificationFiles", f)
        );

        // hospitals
        selectedHospitals.forEach((id) => fd.append("affiliatedHospitals", id));
        if (primaryHospital) fd.set("primaryHospital", primaryHospital);

        // pricing (base)
        fd.set("feesCurrency", feesCurrency);
        if (feesOnline !== "") fd.set("feesOnline", feesOnline);
        if (feesInPerson !== "") fd.set("feesInPerson", feesInPerson);

        // per-hospital overrides
        Object.entries(hospitalFees).forEach(([hid, amt]) => {
          if (selectedHospitals.includes(hid) && amt !== "") {
            fd.set(`hospitalFee[${hid}]`, amt);
          }
        });
      }

      const res = await fetch(`${API}api/auth/register`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Registration failed");

      setInfo(
        data?.message ||
          (role === "receptionist"
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
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
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="therapist">Therapist</option>
                <option value="receptionist">Receptionist</option>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Full name" value={form.name} onChange={(e)=>setForm((f:any)=>({...f,name:e.target.value}))} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm((f:any)=>({...f,email:e.target.value}))} required />
              <Input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm((f:any)=>({...f,password:e.target.value}))} required />
              <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm((f:any)=>({...f,phone:e.target.value}))} required />
              <div className="sm:col-span-2">
                <Input placeholder="Address" value={form.address} onChange={(e)=>setForm((f:any)=>({...f,address:e.target.value}))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Date of birth</label>
                <Input type="date" value={form.dateOfBirth} onChange={(e)=>setForm((f:any)=>({...f,dateOfBirth:e.target.value}))} required />
              </div>
              <Input placeholder="CNIC" value={form.cnic} onChange={(e)=>setForm((f:any)=>({...f,cnic:e.target.value}))} required />
            </div>

            {therapist && (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-900">Pricing</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">Currency</label>
                    <Select value={feesCurrency} onChange={(e)=>setFeesCurrency(e.target.value)}>
                      <option>PKR</option><option>USD</option><option>EUR</option><option>GBP</option><option>AED</option>
                    </Select>
                  </div>
                  <Input type="number" min="0" placeholder="Online fee" value={feesOnline} onChange={(e)=>setFeesOnline(e.target.value)} />
                  <Input type="number" min="0" placeholder="Default in-person fee" value={feesInPerson} onChange={(e)=>setFeesInPerson(e.target.value)} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  You can override in-person fees for individual clinics below.
                </p>
              </div>
            )}

            {therapist && (
              <>
                <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-medium">Therapist details</p>
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                    <Input placeholder="Specializations (comma separated)" value={form.specializations} onChange={(e)=>setForm((f:any)=>({...f,specializations:e.target.value}))} />
                    <Input type="number" min={0} placeholder="Years of experience" value={form.yearsExperience} onChange={(e)=>setForm((f:any)=>({...f,yearsExperience:e.target.value}))} />
                    <Input placeholder="License number" value={form.licenseNumber} onChange={(e)=>setForm((f:any)=>({...f,licenseNumber:e.target.value}))} />
                    <Input placeholder="Licensing council" value={form.licensingCouncil} onChange={(e)=>setForm((f:any)=>({...f,licensingCouncil:e.target.value}))} />
                    <Input placeholder="Clinic address" value={form.clinicAddress} onChange={(e)=>setForm((f:any)=>({...f,clinicAddress:e.target.value}))} />
                  </div>

                  <label className="mt-3 mb-1 block text-sm text-gray-700">Bio</label>
                  <textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} value={form.bio} onChange={(e)=>setForm((f:any)=>({...f,bio:e.target.value}))} />

                  <div className="mt-3 grid gap-4">
                    <Fieldset title="Modalities" items={MODALITIES} values={modalities} onToggle={(v)=>toggle(modalities,setModalities,v)} />
                    <Fieldset title="Concerns" items={CONCERNS} values={concerns} onToggle={(v)=>toggle(concerns,setConcerns,v)} />
                    <Fieldset title="Populations" items={POPULATIONS} values={populations} onToggle={(v)=>toggle(populations,setPopulations,v)} />
                    <Fieldset title="Care Settings" items={CARE} values={careSettings} onToggle={(v)=>toggle(careSettings,setCareSettings,v)} />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm text-gray-700 mb-1">
                      Certification documents <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(e)=>setForm((f:any)=>({...f,certFiles:e.target.files || undefined}))}
                      required
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Hospitals/Clinics + per-hospital pricing */}
                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">Clinics / Hospitals</p>
                    <Input placeholder="Search clinics..." value={hospSearch} onChange={(e)=>setHospSearch(e.target.value)} />
                  </div>

                  {hospErr && <p className="mt-2 text-xs text-red-600">{hospErr}</p>}
                  {hospLoading ? (
                    <div className="mt-3 space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-md bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 max-h-64 overflow-auto rounded-md border">
                      {!filteredHospitals.length ? (
                        <p className="p-3 text-sm text-gray-500">No clinics found.</p>
                      ) : (
                        <ul className="divide-y">
                          {filteredHospitals.map((h) => {
                            const checked = selectedHospitals.includes(h._id);
                            return (
                              <li key={h._id} className="px-3 py-2">
                                <div className="flex items-center justify-between gap-3">
                                  <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={checked} onChange={()=>toggleHospital(h._id)} />
                                    <span className="text-sm">
                                      {h.name}{h.city ? <span className="text-gray-500"> — {h.city}</span> : null}
                                    </span>
                                  </label>

                                  {/* Primary radio (only if selected) */}
                                  <label className="flex items-center gap-2 text-xs text-gray-600">
                                    <input
                                      type="radio"
                                      name="primaryHospital"
                                      disabled={!checked}
                                      checked={primaryHospital === h._id}
                                      onChange={()=>setPrimaryHospital(h._id)}
                                    />
                                    Primary
                                  </label>
                                </div>

                                {/* Per-hospital fee override input */}
                                {checked && (
                                  <div className="mt-2 pl-6 flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder={`Override fee (${feesCurrency})`}
                                      value={hospitalFees[h._id] || ""}
                                      onChange={(e)=>setHospitalFees(prev=>({ ...prev, [h._id]: e.target.value }))}
                                    />
                                    <span className="text-xs text-gray-500">{feesCurrency}</span>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {selectedHospitals.length > 0 && (
                    <p className="mt-2 text-xs text-gray-600">
                      Selected: {selectedHospitals.length}. {primaryHospital ? "Primary set." : "Choose a primary hospital."}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <aside className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-900">
                Profile photo <span className="text-red-600">*</span>
              </p>
              {profilePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePreview} alt="Preview" className="mb-3 h-28 w-28 rounded-xl object-cover ring-1 ring-gray-200" />
              ) : (
                <div className="mb-3 grid h-28 w-28 place-items-center rounded-xl bg-gray-100 text-xs text-gray-500">No photo</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setForm((f:any)=>({ ...f, profileFile: e.target.files?.[0] }))}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">JPG/PNG/WebP up to ~3–5MB.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Button className="w-full" disabled={loading}>
                {loading ? "Submitting…" : "Submit for approval"}
              </Button>
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
