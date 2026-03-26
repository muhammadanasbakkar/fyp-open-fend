// components/PatientCard.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import QRCode from "qrcode";

export type PatientCardProps = {
  name?: string | null;
  ptNumber?: string | null;        // e.g. PT-2025-000123
  patientId?: string | null;       // db _id (for QR route)
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  // If you want the QR to link somewhere specific, pass a full URL; otherwise we build one.
  qrUrlOverride?: string | null;
};

const PatientCard = forwardRef<HTMLDivElement, PatientCardProps>(function PatientCard(
  { name, ptNumber, patientId, phone, email, avatarUrl, qrUrlOverride },
  ref
) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Expose inner ref outwards for printing/exporting
  useEffect(() => {
    if (typeof ref === "function") ref(cardRef.current!);
    else if (ref && "current" in ref) (ref as any).current = cardRef.current;
  }, [ref]);

  const displayName = name || email || phone || "Patient";
  // Build a verification URL for the QR (adjust to your domain)
  const qrPayload = useMemo(() => {
    if (qrUrlOverride) return qrUrlOverride;
    if (!patientId) return ptNumber || displayName;
    // e.g., a verify page in your app: /p/[id]
    if (typeof window !== "undefined") {
      const base = window?.location?.origin || "";
      return `${base}/p/${patientId}`;
    }
    return `/p/${patientId}`;
  }, [qrUrlOverride, patientId, ptNumber, displayName]);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: "M",
          width: 240,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (alive) setQrDataUrl(url);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [qrPayload]);

  return (
    <div
      ref={cardRef}
      className="w-[340px] rounded-2xl border border-gray-200 bg-white p-4 shadow-md print:shadow-none"
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      {/* Header / Brand strip */}
      <div
        className="rounded-xl px-3 py-2.5 text-white"
        style={{ background: "linear-gradient(to right, #4b7eff, #6aa7ff)" }}
      >
        <div className="text-xs font-medium opacity-90">TheraKonnect</div>
        <div className="text-sm font-bold">Patient ID Card</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt={displayName}
          className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200"
        />
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{displayName}</div>
          <div className="text-xs text-gray-500">
            {ptNumber ? `PT#: ${ptNumber}` : "PT#: —"}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 p-2">
          <div className="text-[10px] text-gray-500">Phone</div>
          <div className="truncate text-sm">{phone || "—"}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-2">
          <div className="text-[10px] text-gray-500">Email</div>
          <div className="truncate text-sm">{email || "—"}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-[10px] text-gray-500">
          Scan QR at reception <span className="block">for quick lookup</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl || "/qr-placeholder.png"}
          alt="QR"
          className="h-24 w-24 rounded-md border border-gray-200 bg-white p-1"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
        <span>ID: {patientId || "—"}</span>
        <span>Valid: {new Date().getFullYear()}</span>
      </div>
    </div>
  );
});

export default PatientCard;
