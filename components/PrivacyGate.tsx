"use client";

import { useEffect, useMemo, useState } from "react";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import PolicyConsent from "@/components/PolicyConsent";

// Mirror of backend `shared/privacyPolicy.js`. Bump in lockstep with the server.
const PRIVACY_POLICY_VERSION = "2025-11";

type ConsentRole = Parameters<typeof PolicyConsent>[0]["role"];

// Map app roles to the four PolicyConsent role variants.
function roleForConsent(role?: string | null): ConsentRole {
  switch (role) {
    case "patient": return "patient";
    case "therapist": return "therapist";
    case "supervisor": return "supervisor";
    case "receptionist": return "receptionist";
    // SuperAdmin / hospitalAdmin / admin all see the clinic-staff variant.
    case "hospitalAdmin":
    case "superAdmin":
    case "admin":
    default:
      return "receptionist";
  }
}

/**
 * Globally mounted modal. After a user logs in (or on hydrate if a session is
 * already present), it checks whether they've accepted the current privacy
 * policy version. If not, it blocks the page until they do.
 *
 * Legacy users (no version stored on the account) will see this exactly once
 * on their next login.
 */
export default function PrivacyGate() {
  const { user, token, hydrated, updateUser, logout } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const needsConsent = useMemo(() => {
    if (!hydrated || !user || !token) return false;
    const v = user.privacyPolicy?.version;
    return !v || v !== PRIVACY_POLICY_VERSION;
  }, [hydrated, user, token]);

  // Reset the local consent state every time the gate opens (don't carry stale).
  useEffect(() => {
    if (needsConsent) {
      setAgreed(false);
      setErr("");
    }
  }, [needsConsent]);

  if (!needsConsent || !user) return null;

  const role = roleForConsent(user.role);

  async function submit() {
    if (!agreed || submitting) return;
    setErr("");
    setSubmitting(true);
    try {
      const res: any = await api("api/auth/accept-privacy", {
        method: "POST",
        headers: {
          ...(authHeader(token || undefined) as HeadersInit),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version: PRIVACY_POLICY_VERSION }),
      });
      // Update cached user so the gate dismisses.
      updateUser({
        privacyPolicy: res?.privacyPolicy ?? {
          version: PRIVACY_POLICY_VERSION,
          acceptedAt: new Date().toISOString(),
        },
      });
    } catch (e: any) {
      setErr(e?.message || "Could not record acceptance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-[#3a5bef] to-[#7c3aed] px-5 py-4 text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Updated Privacy Policy</p>
            <p className="text-[11px] text-white/80">
              Please review and accept to continue using TheraKonnect.
            </p>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">
            Hi <span className="font-semibold text-slate-900">{user.name || "there"}</span>,
            we&apos;ve updated the TheraKonnect Privacy Policy. To keep using your account
            you need to confirm you&apos;ve read and agree to the policy as it applies to your role.
          </p>

          <PolicyConsent
            role={role}
            agreed={agreed}
            onChange={setAgreed}
          />

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              if (confirm("You'll be logged out. Continue?")) logout();
            }}
            disabled={submitting}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Decline &amp; sign out
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!agreed || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3a5bef] to-[#4b7eff] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                Accept &amp; Continue
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
