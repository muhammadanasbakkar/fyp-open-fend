"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TherapistProfile() {
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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [feesCurrency, setFeesCurrency] = useState("PKR");
  const [feesOnline, setFeesOnline] = useState<string>("");
  const [feesInPerson, setFeesInPerson] = useState<string>("");

  useEffect(() => {
    if (!token || user?.role !== "therapist") return;
    (async () => {
      setLoading(true); setErr(""); setMsg("");
      try {
        const data = await api("api/therapists/me", { headers: authHeader(token) });
        const t = data?.therapist || {};
        setName(t.name || "");
        setPhone(t.phone || "");
        setFeesCurrency(t.fees?.currency || "PKR");
        setFeesOnline(String(t.fees?.online ?? ""));
        setFeesInPerson(String(t.fees?.inPerson ?? ""));
      } catch (e:any) {
        setErr(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user?.role]);

  async function save() {
    setErr(""); setMsg("");
    try {
      await api("api/therapists/me", {
        method: "PUT",
        headers: { ...authHeader(token || undefined), "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          fees: {
            currency: feesCurrency,
            online: feesOnline ? Number(feesOnline) : 0,
            inPerson: feesInPerson ? Number(feesInPerson) : 0,
          },
        }),
      });
      setMsg("Saved");
    } catch (e:any) {
      setErr(e.message || "Save failed");
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      {err && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
      {msg && <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">{msg}</div>}

      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm font-medium">Profile</p>
        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          <Input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm font-medium">Pricing</p>
        <div className="grid gap-3 sm:grid-cols-3 mt-3">
          <Select value={feesCurrency} onChange={e=>setFeesCurrency(e.target.value)}>
            <option>PKR</option><option>USD</option><option>EUR</option><option>GBP</option><option>AED</option>
          </Select>
          <Input type="number" min="0" placeholder="Online fee" value={feesOnline} onChange={e=>setFeesOnline(e.target.value)} />
          <Input type="number" min="0" placeholder="Default in-person fee" value={feesInPerson} onChange={e=>setFeesInPerson(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
