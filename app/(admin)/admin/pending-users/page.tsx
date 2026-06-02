"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const CDN = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/+$/, "");

// ── types ────────────────────────────────────────────────────────────────────
type Cert = { name?: string; fileUrl?: string; fileKey?: string };

type HospitalRef = { _id: string; name?: string; city?: string };

type HospitalApprovalEntry = {
  hospital: string | HospitalRef;
  status: "pending" | "approved" | "rejected";
  decidedAt?: string;
  note?: string;
};

type PendingUser = {
  _id: string;
  name: string;
  email: string;
  role: "therapist" | "receptionist" | "supervisor";
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  cnic?: string;
  profilePicture?: string;
  profilePictureKey?: string;
  hospitalApprovals?: HospitalApprovalEntry[];
  therapistInfo?: {
    specializations?: string[];
    yearsExperience?: number;
    licenseNumber?: string;
    licensingCouncil?: string;
    clinicAddress?: string;
    bio?: string;
    certifications?: Cert[];
    modalities?: string[];
    concerns?: string[];
    populations?: string[];
    careSettings?: string[];
    fees?: { currency?: string; online?: number; inPerson?: number };
  };
  supervisorInfo?: {
    specializations?: string[];
    yearsExperience?: number;
    dob?: string;
    organization?: string;
    clinicAddress?: string;
    licenseNumber?: string;
    licensingCouncil?: string;
    certifications?: Cert[];
  };
};

// ── role display helpers ────────────────────────────────────────────────────
const ROLE_LABELS: Record<PendingUser["role"], string> = {
  therapist: "Therapist",
  receptionist: "Receptionist",
  supervisor: "Supervisor",
};
const ROLE_COLORS: Record<PendingUser["role"], "emerald" | "indigo" | "violet"> = {
  therapist: "emerald",
  receptionist: "indigo",
  supervisor: "violet",
};
const ROLE_PILL_CLS: Record<PendingUser["role"], string> = {
  therapist: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  receptionist: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  supervisor: "bg-violet-50 text-violet-700 ring-violet-100",
};

// ── helpers ──────────────────────────────────────────────────────────────────
function isAbsoluteUrl(u?: string) {
  return !!u && /^https?:\/\//i.test(u);
}
function buildCdnUrl(key?: string) {
  if (!key) return "";
  return `${CDN}/${key.replace(/^\/+/, "")}`;
}
function pickImageSrc(key?: string, legacyUrl?: string): string {
  if (key) return buildCdnUrl(key);
  if (isAbsoluteUrl(legacyUrl)) return legacyUrl!;
  if (legacyUrl && /amazonaws\.com\//.test(legacyUrl)) {
    const m = legacyUrl.match(/amazonaws\.com\/(.+)$/);
    if (m?.[1]) return buildCdnUrl(m[1]);
  }
  return legacyUrl || "";
}

// ── small components ─────────────────────────────────────────────────────────
function TagPill({ label, color = "blue" }: { label: string; color?: "blue" | "violet" | "teal" | "amber" | "rose" | "gray" }) {
  const cls: Record<string, string> = {
    blue:   "bg-blue-50   text-blue-700   ring-blue-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    teal:   "bg-teal-50   text-teal-700   ring-teal-100",
    amber:  "bg-amber-50  text-amber-700  ring-amber-100",
    rose:   "bg-rose-50   text-rose-700   ring-rose-100",
    gray:   "bg-gray-100  text-gray-600   ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${cls[color]}`}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 text-gray-400">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt="Certification document"
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function UserDetailDrawer({
  user,
  onClose,
  onAct,
  acting,
}: {
  user: PendingUser;
  onClose: () => void;
  onAct: (id: string, action: "approve" | "reject") => Promise<void>;
  acting: boolean;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const t = user.therapistInfo;
  const sup = user.supervisorInfo;

  const profileSrc = pickImageSrc(user.profilePictureKey, user.profilePicture);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && !lightbox) onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, lightbox]);

  const roleColor = ROLE_COLORS[user.role];
  const roleLabel = ROLE_LABELS[user.role];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">User Details</h2>
            <TagPill label={roleLabel} color={roleColor as any} />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* ── Profile hero ── */}
          <div className="flex items-start gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 ring-gray-200 bg-gray-100">
              {profileSrc ? (
                <Image
                  src={process.env.NEXT_PUBLIC_CDN_BASE + profileSrc}
                  alt={user.name}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-3xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
            </div>
          </div>

          {/* ── Personal details ── */}
          <section>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Personal Information</h4>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
              <InfoRow label="Full name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="CNIC" value={user.cnic} />
              <InfoRow label="Address" value={user.address} />
              <InfoRow label="Date of birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" }) : undefined} />
            </div>
          </section>

          {/* ── Therapist professional info ── */}
          {user.role === "therapist" && t && (
            <>
              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Professional Details</h4>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                  <InfoRow label="Years experience" value={t.yearsExperience} />
                  <InfoRow label="License number" value={t.licenseNumber} />
                  <InfoRow label="Licensing council" value={t.licensingCouncil} />
                  <InfoRow label="Clinic address" value={t.clinicAddress} />
                  {t.fees && (
                    <InfoRow
                      label="Session fees"
                      value={[
                        t.fees.online  != null ? `Online: ${t.fees.currency || "PKR"} ${t.fees.online}` : null,
                        t.fees.inPerson != null ? `In-person: ${t.fees.currency || "PKR"} ${t.fees.inPerson}` : null,
                      ].filter(Boolean).join("  •  ")}
                    />
                  )}
                </div>
              </section>

              {/* Bio */}
              {t.bio && (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Bio</h4>
                  <p className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                    {t.bio}
                  </p>
                </section>
              )}

              {/* Tag groups */}
              {[
                { label: "Specializations",  items: t.specializations,  color: "blue"   },
                { label: "Modalities",        items: t.modalities,       color: "violet" },
                { label: "Concerns treated",  items: t.concerns,         color: "teal"   },
                { label: "Populations served",items: t.populations,      color: "amber"  },
                { label: "Care settings",     items: t.careSettings,     color: "gray"   },
              ].filter(g => g.items?.length).map(g => (
                <section key={g.label}>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{g.label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {g.items!.map(item => (
                      <TagPill key={item} label={item} color={g.color as any} />
                    ))}
                  </div>
                </section>
              ))}

              {/* Certifications grid */}
              {!!t.certifications?.length && (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Certification Documents
                    <span className="ml-2 font-normal normal-case text-gray-400">
                      ({t.certifications.length} file{t.certifications.length > 1 ? "s" : ""})
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {t.certifications.map((c, i) => {
                      const src = pickImageSrc(c.fileKey, c.fileUrl);
                      if (!src) return null;
                      return (
                        <button
                          key={i}
                          onClick={() => setLightbox(src)}
                          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm hover:ring-2 hover:ring-[#4b7eff]/50 transition-all"
                          title={c.name || `Document ${i + 1}`}
                        >
                          <Image
                            src={process.env.NEXT_PUBLIC_CDN_BASE + src}
                            alt={c.name || `Certification ${i + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2">
                            <span className="text-[11px] font-medium text-white truncate">
                              {c.name || `Document ${i + 1}`}
                            </span>
                          </div>
                          {/* Expand icon */}
                          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400">Click any image to view full size</p>
                </section>
              )}
            </>
          )}

          {/* ── Supervisor professional info ── */}
          {user.role === "supervisor" && (
            <>
              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Professional Details</h4>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                  {sup ? (
                    <>
                      <InfoRow label="Years experience" value={sup.yearsExperience} />
                      <InfoRow
                        label="Date of birth"
                        value={sup.dob ? new Date(sup.dob).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" }) : undefined}
                      />
                      <InfoRow label="Organization" value={sup.organization} />
                      <InfoRow label="License number" value={sup.licenseNumber} />
                      <InfoRow label="Licensing council" value={sup.licensingCouncil} />
                      <InfoRow label="Clinic address" value={sup.clinicAddress} />
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No professional details on file.</p>
                  )}
                </div>
              </section>

              {!!sup?.specializations?.length && (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {sup.specializations.map((item) => (
                      <TagPill key={item} label={item} color="violet" />
                    ))}
                  </div>
                </section>
              )}

              {!!sup?.certifications?.length && (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Certification Documents
                    <span className="ml-2 font-normal normal-case text-gray-400">
                      ({sup.certifications.length} file{sup.certifications.length > 1 ? "s" : ""})
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {sup.certifications.map((c, i) => {
                      const src = pickImageSrc(c.fileKey, c.fileUrl);
                      if (!src) return null;
                      return (
                        <button
                          key={i}
                          onClick={() => setLightbox(src)}
                          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm hover:ring-2 hover:ring-[#4b7eff]/50 transition-all"
                          title={c.name || `Document ${i + 1}`}
                        >
                          <Image
                            src={process.env.NEXT_PUBLIC_CDN_BASE + src}
                            alt={c.name || `Certification ${i + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2">
                            <span className="text-[11px] font-medium text-white truncate">
                              {c.name || `Document ${i + 1}`}
                            </span>
                          </div>
                          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400">Click any image to view full size</p>
                </section>
              )}
            </>
          )}
        </div>

        {/* Sticky footer — actions */}
        <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              disabled={acting}
              onClick={() => onAct(user._id, "reject")}
              className="rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reject
            </button>
            <button
              disabled={acting}
              onClick={() => onAct(user._id, "approve")}
              className="rounded-xl bg-gradient-to-r from-[#4b7eff] to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {acting ? "Processing…" : "Approve"}
            </button>
          </div>
        </div>
      </div>

      {/* Cert image lightbox */}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PendingUsersPage() {
  const router = useRouter();
  const { user, token, hydrated } = useAuth();

  const [data, setData]             = useState<PendingUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [q, setQ]                   = useState("");
  const [filterRole, setFilterRole] = useState<"" | "therapist" | "receptionist" | "supervisor">("");
  const [selected, setSelected]     = useState<PendingUser | null>(null);
  const [acting, setActing]         = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "superAdmin") { router.replace("/login"); return; }
    (async () => {
      setErr(""); setLoading(true);
      try {
        const res  = await fetch(`${API}/api/auth/pending-users`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.msg || "Failed to fetch pending users");
        setData(json as PendingUser[]);
      } catch (e: any) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, user, token, router]);

  async function act(id: string, action: "approve" | "reject") {
    if (!token) return;
    setActing(true);
    try {
      const res  = await fetch(`${API}/api/auth/${action}-user/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || `${action} failed`);
      setData((prev) => prev.filter((u) => u._id !== id));
      setSelected(null);
    } catch (e: any) {
      alert(e.message || "Operation failed");
    } finally {
      setActing(false);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((u) => {
      const matchesRole = filterRole ? u.role === filterRole : true;
      if (!term) return matchesRole;
      const hay = [u.name, u.email, u.role, u.phone, u.address, u.cnic, ...(u.therapistInfo?.specializations || []), ...(u.supervisorInfo?.specializations || [])]
        .filter(Boolean).join(" ").toLowerCase();
      return matchesRole && hay.includes(term);
    });
  }, [data, q, filterRole]);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span><span>Admin</span><span>/</span>
          <span className="font-medium text-gray-700">Pending users</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pending Users</h1>
            <p className="mt-1 text-sm text-gray-500">Click a row to review full details, then approve or reject.</p>
          </div>
          <div className="flex items-center gap-3">
            {data.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#4b7eff]/10 px-3 py-1 text-xs font-semibold text-[#4b7eff]">
                {data.length} pending
              </span>
            )}
            <Link href="/dashboard" className="text-sm font-medium text-[#4b7eff] hover:underline">
              ← Dashboard
            </Link>
          </div>
        </div>

        {err && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
        )}

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search name, email, CNIC or specialization"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}>
              <option value="">All roles</option>
              <option value="therapist">Therapist</option>
              <option value="receptionist">Receptionist</option>
              <option value="supervisor">Supervisor</option>
            </Select>
          </div>
          {filtered.length !== data.length && (
            <p className="mt-2 text-xs text-gray-400">Showing {filtered.length} of {data.length}</p>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-gray-100 bg-white/80 shadow-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center">
            <p className="font-medium text-gray-800">No pending users</p>
            <p className="mt-1 text-xs text-gray-400">New requests will appear here for review.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((u) => {
              const profileSrc = pickImageSrc(u.profilePictureKey, u.profilePicture);
              console.log(profileSrc,"profileSrc");
              const certCount  = u.therapistInfo?.certifications?.length ?? 0;
              return (
                <li key={u._id}>
                  <button
                    onClick={() => setSelected(u)}
                    className="group w-full rounded-2xl border border-gray-100 bg-white/90 px-5 py-4 shadow-sm text-left transition hover:-translate-y-[1px] hover:border-[#4b7eff]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-gray-200 bg-gray-100">
                          {profileSrc ? (
                            <Image
                              src={process.env.NEXT_PUBLIC_CDN_BASE + profileSrc}
                              alt={u.name}
                              fill
                              className="object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4b7eff] to-[#7c3aed] text-sm font-bold text-white">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 truncate">{u.name}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ROLE_PILL_CLS[u.role]}`}>
                              {ROLE_LABELS[u.role]}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 truncate">
                            {u.email}
                            {u.cnic && <> · CNIC {u.cnic}</>}
                            {certCount > 0 && <> · {certCount} cert{certCount > 1 ? "s" : ""}</>}
                          </p>
                          {(() => {
                            const specs =
                              u.therapistInfo?.specializations || u.supervisorInfo?.specializations || [];
                            return specs.length > 0 ? (
                              <p className="mt-0.5 text-xs text-gray-400 truncate">
                                {specs.slice(0, 3).join(" · ")}
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {/* Arrow hint */}
                      <div className="flex shrink-0 items-center gap-2 text-gray-300 group-hover:text-[#4b7eff] transition-colors">
                        <span className="hidden text-xs sm:block">View details</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <UserDetailDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onAct={act}
          acting={acting}
        />
      )}
    </div>
  );
}
