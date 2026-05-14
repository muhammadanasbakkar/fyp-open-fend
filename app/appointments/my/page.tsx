

// app/appointments/my/page.tsx
"use client";
import Protected from "@/components/Protected";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Appt = {
  _id: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | string;
  mode?: "in-person" | "online" | string;
  meetingLink?: string;
  therapist?: { _id: string; name: string } | string;
  patient?: { _id: string; name: string; patientId?: string } | string;
  createdAt?: string;
  // Set by the backend so we know which of the three icons (Notes / Assessment /
  // Treatment Plan) to surface. If none are true, no icons are shown.
  hasNotes?: boolean;
  hasAssessment?: boolean;
  hasTreatmentPlan?: boolean;
};

export default function MyAppointmentsPage() {
  return (
    <Protected>
      <List />
    </Protected>
  );
}

function fmt(dt: string | Date) {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtTime(dt: string | Date) {
  const d = new Date(dt);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Appt["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    confirmed: "bg-green-50 text-green-700 ring-1 ring-green-200",
    cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
    completed: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };
  const klass =
    map[status] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${klass}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ModeBadge({ mode }: { mode?: Appt["mode"] }) {
  if (!mode) return null;
  const isOnline = mode === "online";
  const klass = isOnline
    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
    : "bg-sky-50 text-sky-700 ring-1 ring-sky-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${klass}`}
    >
      {isOnline ? "💻 Online" : "🏥 In person"}
    </span>
  );
}

function generateReceiptNo(apptId: string, createdAt?: string): string {
  const base = createdAt ? new Date(createdAt) : new Date();
  const datePart = base.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = apptId.slice(-5).toUpperCase();
  return `RCT-${datePart}-${suffix}`;
}

function ReceiptModal({ appt, onClose }: { appt: Appt; onClose: () => void }) {
  const therapistName =
    typeof appt.therapist === "string" ? appt.therapist : appt.therapist?.name ?? "—";
  const patientObj = typeof appt.patient === "object" ? appt.patient : null;
  const patientName = patientObj?.name ?? (typeof appt.patient === "string" ? appt.patient : "—");
  const ptNumber = patientObj?.patientId ?? null;
  const receiptNo = generateReceiptNo(appt._id, appt.createdAt);
  const printedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #therakonnect-receipt-overlay { display: flex !important; }
          #therakonnect-receipt-overlay > div { box-shadow: none !important; }
          #therakonnect-receipt-close-btn { display: none !important; }
          #therakonnect-receipt-print-btn { display: none !important; }
        }
      `}</style>
      <div
        id="therakonnect-receipt-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
          {/* Receipt header */}
          <div className="rounded-t-2xl bg-gradient-to-br from-[#3a5bef] to-[#7c3aed] px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">TheraKonnect</p>
            <h2 className="mt-1 text-xl font-bold">Appointment Receipt</h2>
            <p className="mt-0.5 text-xs opacity-70">{receiptNo}</p>
          </div>

          {/* Receipt body */}
          <div className="px-6 py-5 space-y-3 text-sm">
            <Row label="Patient" value={patientName} />
            {ptNumber && <Row label="Patient ID" value={ptNumber} />}
            <Row label="Therapist" value={therapistName} />
            <div className="border-t border-dashed border-gray-200 pt-3 space-y-3">
              <Row
                label="Date & Time"
                value={`${fmt(appt.start)} → ${fmtTime(appt.end)}`}
              />
              <Row
                label="Mode"
                value={appt.mode === "online" ? "Online" : appt.mode === "in-person" ? "In Person" : appt.mode ?? "—"}
              />
              <Row
                label="Status"
                value={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              />
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3">
              <Row label="Printed on" value={printedOn} />
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-3 text-center text-[10px] text-gray-400">
            Generated by TheraKonnect · Keep this receipt for your records.
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-6 py-4">
            {/* <button
              id="therakonnect-receipt-print-btn"
              onClick={() => window.print()}
              className="flex-1 rounded-xl bg-[#4b7eff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6bef] transition-colors"
            >
              🖨️ Print
            </button> */}
            <button
              id="therakonnect-receipt-close-btn"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

function List() {
  const { token, user } = useAuth();

  const role = user?.role;
  const [data, setData] = useState<Appt[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [receiptAppt, setReceiptAppt] = useState<Appt | null>(null);

  // Records are auto-shared with the therapist's supervisor — no per-patient
  // opt-in flow lives here anymore.

  async function load() {
    setErr("");
    setMsg("");
    setLoadingList(true);
    try {
      const res = await api("api/appointments/my", {
        headers: authHeader(token || undefined),
      } as RequestInit);
      setData(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setErr(e.message || "Failed to load appointments.");
    } finally {
      setLoadingList(false);
    }
  }

  async function sendVideoLink(id: string) {
    if (!token) {
      setErr("Session expired. Please log in again.");
      return;
    }

    setErr("");
    setMsg("");

    const link = window.prompt(
      "Enter video meeting link (leave blank to auto generate):"
    );

    setActingId(id);
    try {
      const res = await api(`api/appointments/${id}/send-link`, {
        method: "POST",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({
          meetingLink: link && link.trim() ? link.trim() : undefined,
        }),
      });

      setData((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, meetingLink: res.meetingLink } : a
        )
      );

      setMsg("Video link sent to patient.");
    } catch (e: any) {
      setErr(e.message || "Could not send video link.");
    } finally {
      setActingId(null);
    }
  }

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function updateStatus(id: string, status: "confirmed" | "cancelled") {
    if (!token) {
      setErr("Session expired. Please log in again.");
      return;
    }

    setErr("");
    setMsg("");
    setActingId(id);

    try {
      const res = await api(`api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          ...(token ? authHeader(token) : {}),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ status }),
      });

      const newStatus = res?.appointment?.status || res?.status || status;

      setData((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );

      setMsg(
        newStatus === "confirmed"
          ? "Appointment confirmed. Patient will receive an email."
          : "Appointment cancelled. Patient will receive an email."
      );
    } catch (e: any) {
      setErr(e.message || "Could not update appointment status.");
    } finally {
      setActingId(null);
    }
  }

  async function confirmAppt(id: string) {
    await updateStatus(id, "confirmed");
  }

  async function cancelAppt(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    await updateStatus(id, "cancelled");
  }

  // search and sort
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;

    return data.filter((a: any) => {
      let tName = "";
      if (typeof a.therapist === "string") {
        tName = a.therapist;
      } else if (a.therapist && typeof a.therapist === "object") {
        tName = a.therapist.name || "";
      }

      let pName = "";
      if (typeof a.patient === "string") {
        pName = a.patient;
      } else if (a.patient && typeof a.patient === "object") {
        pName = a.patient.name || "";
      }

      return (
        tName.toLowerCase().includes(term) ||
        pName.toLowerCase().includes(term)
      );
    });
  }, [q, data]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => +new Date(b.start) - +new Date(a.start)
      ),
    [filtered]
  );

  // Group by patient for therapist/receptionist views so we can show a
  // stacked, PT# wise queue. Patient role sees only their own appts so
  // grouping isn't applied — they get the flat list.
  const patientGroups = useMemo(() => {
    if (role !== "therapist" && role !== "receptionist") return null;
    const map = new Map<
      string,
      {
        key: string;
        id: string;
        name: string;
        patientId: string; // PT-XXXX human code
        appts: Appt[];
        lastStart: number;
      }
    >();
    for (const a of sorted) {
      const patientObj = typeof a.patient === "object" ? a.patient : null;
      const id = patientObj?._id || (typeof a.patient === "string" ? a.patient : "");
      const name =
        patientObj?.name ||
        (typeof a.patient === "string" ? a.patient : "Unknown patient");
      const patientId = patientObj?.patientId || "";
      const key = id || `name:${name}`;
      const existing = map.get(key);
      const t = +new Date(a.start);
      if (existing) {
        existing.appts.push(a);
        if (t > existing.lastStart) existing.lastStart = t;
        if (!existing.patientId && patientId) existing.patientId = patientId;
      } else {
        map.set(key, { key, id, name, patientId, appts: [a], lastStart: t });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastStart - a.lastStart);
  }, [sorted, role]);

  const now = Date.now();

  // Tracks which PT# sections are currently collapsed. Default expanded
  // (key absent from set = open), so a key in the set means "collapsed".
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function renderApptCard(a: Appt) {
    const isPending = a.status === "pending";
    const isActing = actingId === a._id;
    const startTime = new Date(a.start).getTime();
    const isPast = startTime < now;

    const therapistName =
      typeof a.therapist === "string" ? a.therapist : a.therapist?.name;
    const patientName =
      typeof a.patient === "string" ? a.patient : a.patient?.name;

    const patientIdForLink =
      (a.patient as any)?._id || String(a.patient || "");

    return (
      <div
        key={a._id}
        className={[
          "relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
          isPast ? "border-gray-100" : "border-[#4b7eff]/30",
        ].join(" ")}
      >
        {/* Accent bar */}
        <div
          className={[
            "absolute inset-y-3 left-0 w-1 rounded-full",
            isPast ? "bg-gray-200" : "bg-[#4b7eff]",
          ].join(" ")}
        />

        <div className="pl-3 sm:pl-4">
          {/* Top row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {fmt(a.start)} <span className="text-gray-400">→</span> {fmtTime(a.end)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Created {a.createdAt ? fmt(a.createdAt) : "recently"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {a.mode && <ModeBadge mode={a.mode} />}
              <StatusBadge status={a.status} />
            </div>
          </div>

          {/* Middle row: people */}
          <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <span className="text-gray-500">Therapist</span>{" "}
              <span className="font-medium">{therapistName}</span>
            </p>
            <p>
              <span className="text-gray-500">Patient</span>{" "}
              <span className="font-medium">{patientName}</span>
            </p>
            {a.mode && (
              <p className="text-xs text-gray-500 sm:col-span-2">
                Mode{" "}
                <span className="capitalize">
                  {a.mode === "online" ? "online" : "in person"}
                </span>
              </p>
            )}
          </div>

          {/* Therapist quick-access — always show all three forms.
              A ✓ marker appears on whichever ones already have saved
              content so the therapist can spot what's been filled,
              while still being able to open any of them at any time. */}
          {role !== "therapist" || !a.patient ? (
            a.meetingLink && a.mode === "online" && role !== "therapist" ? (
              <div className="mt-2">
                <a
                  href={a.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#4b7eff] underline"
                >
                  Join video session
                </a>
              </div>
            ) : null
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href={`/appointments/my/${a._id}/assessment?patientId=${encodeURIComponent(patientIdForLink)}`}
                className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs text-purple-700 hover:bg-purple-100"
                title={a.hasAssessment ? "Open saved session notes" : "Open session notes form"}
                prefetch={false}
              >
                🧾 Session Notes{a.hasAssessment ? " ✓" : ""}
              </Link>
              <Link
                href={`/patient-records/${patientIdForLink}/treatment-plan`}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                title={a.hasTreatmentPlan ? "Open saved treatment plan" : "Open treatment plan"}
                prefetch={false}
              >
                📋 Treatment Plan{a.hasTreatmentPlan ? " ✓" : ""}
              </Link>
              <Link
                href={`/patient-records/${patientIdForLink}`}
                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100"
                title={a.hasNotes ? "Open saved assessment / SOAP notes" : "Open patient assessment / SOAP notes"}
                prefetch={false}
              >
                📝 Assessment{a.hasNotes ? " ✓" : ""}
              </Link>
            </div>
          )}

          {/* Pending actions */}
          {isPending && role === "therapist" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => confirmAppt(a._id)} disabled={isActing}>
                {isActing ? "Working..." : "Confirm"}
              </Button>
              <button
                onClick={() => cancelAppt(a._id)}
                disabled={isActing}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Receipt row */}
          {(a.status === "confirmed" || a.status === "completed") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setReceiptAppt(a)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#4b7eff]/40 hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] transition-colors"
              >
                🖨️ See Receipt
              </button>
            </div>
          )}

          {/* Video link action for therapist on confirmed online appts */}
          {role === "therapist" &&
            a.status === "confirmed" &&
            a.mode === "online" && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={() => sendVideoLink(a._id)} disabled={isActing}>
                  {a.meetingLink
                    ? isActing
                      ? "Sending..."
                      : "Resend video link"
                    : isActing
                      ? "Sending..."
                      : "Send video link"}
                </Button>

                {a.meetingLink && (
                  <a
                    href={a.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#4b7eff] underline"
                  >
                    Open current link
                  </a>
                )}
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#4b7eff]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#4b7eff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4b7eff]" />
              Appointments
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              My appointments
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review upcoming and past sessions. manage status and video links.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Search
            </label>
            <Input
              placeholder="Search by therapist or patient"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Alerts */}
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

        {/* Skeleton */}
        {loadingList && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
              >
                <div className="h-4 w-52 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-72 rounded bg-gray-200" />
                <div className="mt-3 h-8 w-40 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loadingList && !sorted.length && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-600">
            <p className="font-medium text-gray-800">
              You do not have any appointments yet.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              New bookings will appear here. including status and video details.
            </p>
          </div>
        )}

        {/* PT#-wise stacked sections (therapist/receptionist) — each patient
            becomes a collapsible section with their PT# as the heading and
            their queue of appointments listed underneath. */}
        {!loadingList && !!sorted.length && patientGroups && (
          <div className="space-y-4">
            {patientGroups.map((g) => {
              const collapsed = collapsedGroups.has(g.key);
              return (
                <section
                  key={g.key}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.key)}
                    aria-expanded={!collapsed}
                    className={[
                      "flex w-full flex-wrap items-center justify-between gap-2 text-left",
                      collapsed ? "" : "mb-3 border-b border-gray-100 pb-3",
                    ].join(" ")}
                    title={collapsed ? "Expand queue" : "Collapse queue"}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold tracking-wide text-gray-900">
                        {g.patientId || "PT — not assigned"}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        {g.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#4b7eff]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#4b7eff]">
                        {g.appts.length} appointment{g.appts.length === 1 ? "" : "s"}
                      </span>
                      <svg
                        className={[
                          "h-4 w-4 text-gray-500 transition-transform",
                          collapsed ? "" : "rotate-180",
                        ].join(" ")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="space-y-3">
                      {g.appts.map((a) => renderApptCard(a))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Flat list — used when grouping is not applicable (e.g., patient
            viewing their own appointments). */}
        {!loadingList && !!sorted.length && !patientGroups && (
          <div className="space-y-3">{sorted.map((a) => renderApptCard(a))}</div>
        )}
      </div>

      {receiptAppt && (
        <ReceiptModal appt={receiptAppt} onClose={() => setReceiptAppt(null)} />
      )}
    </div >
  );
}
