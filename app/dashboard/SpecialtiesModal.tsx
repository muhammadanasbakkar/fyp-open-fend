"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import {
  MODALITY_OPTIONS,
  CONCERN_OPTIONS,
  POPULATION_OPTIONS,
  CARE_SETTING_OPTIONS,
} from "./specialtyOptions";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

type Props = {
  open: boolean;
  onClose: () => void;
  token: string;
};

type Specialties = {
  modalities: string[];
  concerns: string[];
  populations: string[];
  careSettings: string[];
};

function TogglePill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all mr-1.5 mb-1.5 ${
        selected
          ? "bg-[#4b7eff] text-white border-[#4b7eff] shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:border-[#4b7eff] hover:text-[#4b7eff]"
      }`}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  );
}

function Section({
  title, options, selected, onToggle, color,
}: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h3>
        {selected.length > 0 && (
          <span className="rounded-full bg-[#4b7eff]/15 px-2 py-0.5 text-[10px] font-semibold text-[#4b7eff]">
            {selected.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap">
        {options.map((opt) => (
          <TogglePill
            key={opt}
            label={opt}
            selected={selected.includes(opt)}
            onClick={() => onToggle(opt)}
          />
        ))}
      </div>
    </div>
  );
}

export default function SpecialtiesModal({ open, onClose, token }: Props) {
  const [modalities, setModalities] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [populations, setPopulations] = useState<string[]>([]);
  const [careSettings, setCareSettings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing specialties whenever modal opens
  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    setError("");

    fetch(`${API}/api/therapists/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        // Backend may nest under data.therapist or return flat
        const t = data?.therapist ?? data;
        const m = t?.modalities ?? t?.therapistInfo?.modalities ?? [];
        const c = t?.concerns ?? t?.therapistInfo?.concerns ?? [];
        const p = t?.populations ?? t?.therapistInfo?.populations ?? [];
        const cs = t?.careSettings ?? t?.therapistInfo?.careSettings ?? [];

        setModalities(Array.isArray(m) ? m : []);
        setConcerns(Array.isArray(c) ? c : []);
        setPopulations(Array.isArray(p) ? p : []);
        setCareSettings(Array.isArray(cs) ? cs : []);

        const any = m.length || c.length || p.length || cs.length;
        setHasPrevious(!!any);
      })
      .catch(() => {
        // Keep empty state on error — user can still fill in
      })
      .finally(() => setLoading(false));
  }, [open, token]);

  if (!open) return null;

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const canSave = modalities.length || concerns.length || populations.length || careSettings.length;
  const totalSelected = modalities.length + concerns.length + populations.length + careSettings.length;

  const onSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/auth/therapist/specialties`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ modalities, concerns, populations, careSettings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to save");
      onClose();
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b7eff]/10 text-[#4b7eff]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {hasPrevious ? "Review your specialties profile" : "Tell us about your practice"}
              </h2>
            </div>
            <p className="text-sm text-gray-500 ml-10">
              {hasPrevious
                ? "Your current selections are shown below. Update anything that has changed this month."
                : "Select the modalities you use, concerns you treat, populations you serve, and your care settings."}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            onClick={onClose}
            disabled={saving}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status bar */}
        {hasPrevious && !loading && (
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-6 py-2.5">
            <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Previously saved profile loaded.</span>{" "}
              Review and update if your practice has changed — we ask monthly so your profile stays accurate.
            </p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Section
                title="Modalities"
                options={MODALITY_OPTIONS}
                selected={modalities}
                onToggle={(v) => toggle(v, modalities, setModalities)}
              />
              <Section
                title="By concern"
                options={CONCERN_OPTIONS}
                selected={concerns}
                onToggle={(v) => toggle(v, concerns, setConcerns)}
              />
              <Section
                title="By population"
                options={POPULATION_OPTIONS}
                selected={populations}
                onToggle={(v) => toggle(v, populations, setPopulations)}
              />
              <Section
                title="Care settings"
                options={CARE_SETTING_OPTIONS}
                selected={careSettings}
                onToggle={(v) => toggle(v, careSettings, setCareSettings)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            {totalSelected > 0 && (
              <span className="rounded-full bg-[#4b7eff]/10 px-3 py-1 text-xs font-semibold text-[#4b7eff]">
                {totalSelected} item{totalSelected !== 1 ? "s" : ""} selected
              </span>
            )}
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
              disabled={saving}
            >
              Skip for now
            </button>
          </div>
          <Button
            type="button"
            disabled={saving || loading || !canSave}
            onClick={onSave}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Saving…
              </span>
            ) : hasPrevious ? "Update specialties" : "Save specialties"}
          </Button>
        </div>
      </div>
    </div>
  );
}
