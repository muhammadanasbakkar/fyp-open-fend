"use client";

import { useState } from "react";
import Button from "@/components/Button";
import {
  MODALITY_OPTIONS,
  CONCERN_OPTIONS,
  POPULATION_OPTIONS,
  CARE_SETTING_OPTIONS,
} from "./specialtyOptions";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Props = {
  open: boolean;
  onClose: () => void;
  token: string; // JWT from login
};

function TogglePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs mb-1 mr-1
      ${
        selected
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function SpecialtiesModal({ open, onClose, token }: Props) {
  const [modalities, setModalities] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [populations, setPopulations] = useState<string[]>([]);
  const [careSettings, setCareSettings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
    );
  };

  const canSave =
    modalities.length ||
    concerns.length ||
    populations.length ||
    careSettings.length;

  const onSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API}api/auth/therapist/specialties`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modalities,
          concerns,
          populations,
          careSettings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to save");
      onClose();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Tell us more about your practice
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose the modalities you use, the concerns you focus on, the
              populations you serve, and your care settings. You can edit these
              later in your profile.
            </p>
          </div>
          <button
            type="button"
            className="text-sm text-gray-400 hover:text-gray-600"
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Modalities
            </h3>
            <div>
              {MODALITY_OPTIONS.map((m) => (
                <TogglePill
                  key={m}
                  label={m}
                  selected={modalities.includes(m)}
                  onClick={() => toggle(m, modalities, setModalities)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              By concern
            </h3>
            <div>
              {CONCERN_OPTIONS.map((c) => (
                <TogglePill
                  key={c}
                  label={c}
                  selected={concerns.includes(c)}
                  onClick={() => toggle(c, concerns, setConcerns)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              By population
            </h3>
            <div>
              {POPULATION_OPTIONS.map((p) => (
                <TogglePill
                  key={p}
                  label={p}
                  selected={populations.includes(p)}
                  onClick={() => toggle(p, populations, setPopulations)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Care settings
            </h3>
            <div>
              {CARE_SETTING_OPTIONS.map((cs) => (
                <TogglePill
                  key={cs}
                  label={cs}
                  selected={careSettings.includes(cs)}
                  onClick={() => toggle(cs, careSettings, setCareSettings)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={saving}
          >
            Skip for now
          </button>
          <Button
            type="button"
            disabled={saving || !canSave}
            onClick={onSave}
          >
            {saving ? "Saving…" : "Save specialties"}
          </Button>
        </div>
      </div>
    </div>
  );
}
