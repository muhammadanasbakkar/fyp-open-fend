"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  return (
    <Protected>
      <ProfileInner />
    </Protected>
  );
}

function ProfileInner() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Common fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Role-specific fields
  const [feesCurrency, setFeesCurrency] = useState("PKR");
  const [feesOnline, setFeesOnline] = useState<string>("");
  const [feesInPerson, setFeesInPerson] = useState<string>("");
  const [specializations, setSpecializations] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [licensingCouncil, setLicensingCouncil] = useState("");


  //GEt api calling for profile edit data
  useEffect(() => {
    if (!token || !user) return;
    (async () => {
      setLoading(true); setErr(""); setMsg("");
      try {
        let endpoint = "";
        if (user.role === "therapist") endpoint = "api/therapists/me";
        else if (user.role === "patient") endpoint = "api/patients/me";
        else if (["receptionist", "admin", "superAdmin"].includes(user.role)) endpoint = "api/staff/me";
        else return;

        const data = await api(endpoint, { headers: authHeader(token) as HeadersInit });
        const profile = data?.therapist || data?.patient || data?.staff || {};
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || "");
        console.log(profile?.therapistInfo)
        if (user.role === "therapist") {
          setFeesCurrency(profile?.therapistInfo?.fees?.currency || "PKR"); 
          setFeesInPerson(profile?.therapistInfo?.fees?.inPerson ? String(profile.therapistInfo.fees.inPerson) : "");
          setFeesOnline(profile?.therapistInfo?.fees?.online ? String(profile.therapistInfo.fees.online) : "");
          setSpecializations(profile?.therapistInfo?.specializations || "");
          setBio(profile?.therapistInfo?.bio || "");
          setYearsExperience(String(profile?.therapistInfo?.yearsExperience || ""));
          setLicensingCouncil(profile?.therapistInfo?.licensingCouncil || "");
        }
      } catch (e:any) {
        setErr(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  async function save() {
    if (!token || !user) return;
    setErr(""); setMsg("");
    try {
      let endpoint = "";
      let body: any = { name, phone };

      if (user.role === "therapist") {
        endpoint = "api/therapists/me";
        body = {
          ...body,
          fees: {
            currency: feesCurrency,
            online: feesOnline ? Number(feesOnline) : 0,
            inPerson: feesInPerson ? Number(feesInPerson) : 0,
          },
          specializations,
          bio,
          yearsExperience: yearsExperience ? Number(yearsExperience) : 0,
          licensingCouncil,
        };
      } else if (user.role === "patient") {
        endpoint = "api/patients/me";
        body = { ...body, email };
      } else if (["receptionist", "admin", "superAdmin"].includes(user.role)) {
        endpoint = "api/staff/me";
        body = { ...body, email };
      } else return;

      await api(endpoint, {
        method: "PUT",
        headers: { ...(authHeader(token || undefined) as HeadersInit), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMsg("Saved");
    } catch (e:any) {
      setErr(e.message || "Save failed");
    }
  }

  if (loading) return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4b7eff]" />
        <p className="mt-3 text-sm text-gray-500">Loading profile…</p>
      </div>
    </div>
  );

  console.log(typeof feesInPerson, feesInPerson);


  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
          Settings
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          {user?.role === "therapist" 
            ? "Update your name, contact info, and session pricing." 
            : "Update your personal information and contact details."
          }
        </p>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
      {msg && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{msg}</div>}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <p className="text-sm font-semibold text-gray-800">Personal Info</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Full name</label>
            <Input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
            <Input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
          {user?.role !== "therapist" && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
              <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {user?.role === "therapist" && (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <p className="text-sm font-semibold text-gray-800">Session Pricing</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Currency</label>
                <Select value={feesCurrency} onChange={e=>setFeesCurrency(e.target.value)}>
                  <option>PKR</option><option>USD</option><option>EUR</option><option>GBP</option><option>AED</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Online fee</label>
                <Input type="number" min="0" placeholder="e.g. 3000" value={feesOnline} onChange={e=>setFeesOnline(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">In-person fee</label>
                <Input type="number" min="0" placeholder="e.g. 4000" value={feesInPerson} onChange={e=>setFeesInPerson(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <p className="text-sm font-semibold text-gray-800">Professional Info</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Specializations</label>
                <Input placeholder="e.g. Anxiety, Depression" value={specializations} onChange={e=>setSpecializations(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Years of Experience</label>
                <Input type="number" min="0" placeholder="e.g. 5" value={yearsExperience} onChange={e=>setYearsExperience(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Licensing Council</label>
                <Input placeholder="e.g. PMDC" value={licensingCouncil} onChange={e=>setLicensingCouncil(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">Bio</label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4b7eff] focus:outline-none"
                  rows={3}
                  placeholder="Brief professional bio..."
                  value={bio}
                  onChange={e=>setBio(e.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="pt-2">
        <Button onClick={save}>Save changes</Button>
      </div>
    </div>
    </div>
  );
}
