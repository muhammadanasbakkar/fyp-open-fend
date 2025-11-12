// "use client";
// import Protected from "@/components/Protected";
// import Button from "@/components/Button";
// import { useAuth } from "@/lib/auth";
// import { api, authHeader } from "@/lib/api";
// import { useEffect, useState } from "react";

// export default function IncomingRequestsPage() {
//     return (
//         <Protected>
//             <RequestList />
//         </Protected>
//     );
// }

// function RequestList() {
//     const { token } = useAuth();
//     const [data, setData] = useState<any[]>([]);

//     async function load() {
//         const res = await api(`/patient-records/requests/incoming`, {
//             headers: authHeader(token || undefined)
//         });
//         setData(res || []);
//     }

//     async function act(id: string, decision: "approve" | "deny") {
//         await api(`/patient-records/requests/${id}/decision`, {
//             method: "PATCH",
//             headers: authHeader(token || undefined),
//             body: JSON.stringify({ decision })
//         });
//         load();
//     }

//     useEffect(() => { load(); }, [token]);

//     return (
//         <div className="max-w-3xl mx-auto p-6 space-y-3">
//             <h1 className="text-xl font-semibold">Incoming Record Requests</h1>
//             {data.map(r => (
//                 <div key={r._id} className="border rounded p-3 bg-white flex justify-between">
//                     <div>
//                         <p className="font-medium">Patient: {r.patient?.name || r.patient}</p>
//                         <p className="text-sm text-gray-500">From Therapist: {r.fromTherapist?.name}</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button onClick={() => act(r._id, "approve")}>Approve</Button>
//                         <Button
//                             // variant="secondary" 
//                             onClick={() => act(r._id, "deny")}>Deny</Button>
//                     </div>
//                 </div>
//             ))}
//             {!data.length && <p className="text-sm text-gray-500">No requests.</p>}
//         </div>
//     );
// }


// app/patient-records/requests/page.tsx (or .../incoming/page.tsx if you prefer)
"use client";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Button from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type Req = {
  _id: string;
  patient?: { _id: string; name: string; email?: string };
  fromTherapist?: { _id: string; name: string; email?: string };
  toTherapist?: { _id: string; name: string };
  reason?: string;
  status: "pending" | "approved" | "denied" | "revoked";
  createdAt?: string;
};

export default function IncomingRequestsPage() {
  return (
    <Protected>
      <RoleGuard roles={["therapist", "superAdmin"]}>
        <RequestList />
      </RoleGuard>
    </Protected>
  );
}

function RequestList() {
  const { token } = useAuth();
  const [data, setData] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api(`/patient-records/requests/incoming`, {
        headers: authHeader(token || undefined),
      } as RequestInit);
      setData(res || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  async function act(id: string, decision: "approve" | "deny") {
    setErr("");
    setMsg("");

    const confirmText =
      decision === "approve"
        ? "Approve this record request?"
        : "Deny this record request?";
    if (!confirm(confirmText)) return;

    setActingId(id);
    try {
      await api(`/patient-records/requests/${id}/decision`, {
        method: "PATCH",
        headers: {
          ...authHeader(token || undefined),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ decision }),
      });
      setMsg(
        decision === "approve"
          ? "Request approved."
          : "Request denied."
      );
      await load();
    } catch (e: any) {
      setErr(e.message || "Failed to update request.");
    } finally {
      setActingId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const pendingFirst = useMemo(() => {
    // Sort: pending at top, then newest first
    const arr = [...data];
    arr.sort((a, b) => {
      const s = (x: Req) => (x.status === "pending" ? 0 : 1);
      const da = a.createdAt ? +new Date(a.createdAt) : 0;
      const db = b.createdAt ? +new Date(b.createdAt) : 0;
      if (s(a) !== s(b)) return s(a) - s(b);
      return db - da;
    });
    return arr;
  }, [data]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Incoming record requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Approve or deny requests from other therapists to access your patients’ notes.
        </p>
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

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-64 rounded bg-gray-200" />
              <div className="mt-4 h-8 w-28 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !pendingFirst.length && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
          No requests right now.
        </div>
      )}

      {/* List */}
      {!loading && !!pendingFirst.length && (
        <div className="space-y-3">
          {pendingFirst.map((r) => (
            <Card
              key={r._id}
              req={r}
              acting={actingId === r._id}
              onApprove={() => act(r._id, "approve")}
              onDeny={() => act(r._id, "deny")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Card({
  req,
  onApprove,
  onDeny,
  acting,
}: {
  req: Req;
  onApprove: () => void;
  onDeny: () => void;
  acting: boolean;
}) {
  const created = req.createdAt ? new Date(req.createdAt) : null;
  const when = created
    ? created.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {req.patient?.name || "Unknown patient"}
            </h3>
            <StatusBadge status={req.status} />
          </div>
          <p className="mt-1 text-xs text-gray-600">
            From therapist:{" "}
            <span className="font-medium">{req.fromTherapist?.name || "—"}</span>
            {req.fromTherapist?.email ? (
              <span className="text-gray-500"> · {req.fromTherapist.email}</span>
            ) : null}
          </p>
          {req.reason ? (
            <p className="mt-2 line-clamp-3 text-sm text-gray-700">
              <span className="text-gray-500">Reason:</span> {req.reason}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-gray-500">Requested: {when}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={onApprove} disabled={acting || req.status !== "pending"}>
            {acting ? "Working…" : "Approve"}
          </Button>
          <button
            onClick={onDeny}
            disabled={acting || req.status !== "pending"}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            title="Deny"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Req["status"] }) {
  const styles: Record<Req["status"], string> = {
    pending:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    approved:
      "bg-green-50 text-green-700 ring-1 ring-green-200",
    denied:
      "bg-red-50 text-red-700 ring-1 ring-red-200",
    revoked:
      "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };
  const label =
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}
