"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, authHeader } from "@/lib/api";
import Protected from "@/components/Protected";

export default function SharedRecordsPage() {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [err, setErr] = useState("");

  async function loadSharedRecords() {
    try {
      const res = await api("/patient-records/shared", {
        headers: authHeader(token || undefined),
      });
      console.log("Shared records response:", res);
      setRecords(res.records || []);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    loadSharedRecords();
  }, [token]);

  return (
    <Protected>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Shared Patient Records</h1>
        {err && <p className="text-red-500 text-sm mb-4">{err}</p>}
        {records.length === 0 ? (
          <p className="text-gray-500">No shared records available.</p>
        ) : (
          records.map((record, i) => (
            <div key={i} className="border rounded p-4 mb-4 bg-white shadow">
              <p className="text-gray-600 text-sm mb-1">
                Patient: <strong>{record.patient?.name || "Unknown"}</strong>
              </p>
              <p className="text-gray-500 text-xs">
                Date: {new Date(record.date).toLocaleString()}
              </p>
              <p className="mt-2">{record.content}</p>
            </div>
          ))
        )}
      </div>
    </Protected>
  );
}
