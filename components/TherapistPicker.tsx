"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Therapist = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    shortId?: string;
};

function useDebounced<T>(value: T, ms = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}

export default function TherapistPicker({
    value,
    onChange,
}: {
    value?: string;
    onChange: (id: string, t?: Therapist) => void;
}) {
    const { token } = useAuth();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);
    const debounced = useDebounced(query, 300);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!boxRef.current) return;
            if (!boxRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await api(
                    `/therapists?search=${encodeURIComponent(debounced)}&limit=8`,
                    { headers: authHeader(token || undefined) }
                );
                setItems(
                    (data.items || []).map((u: any) => ({
                        _id: u._id,
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        profilePicture: u.profilePicture,
                    }))
                );
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, [debounced, token]);

    const selected = useMemo(
        () => items.find((i) => i._id === value),
        [items, value]
    );

    return (
        <div className="relative" ref={boxRef}>
            <label className="block text-sm text-gray-700 mb-1">Therapist</label>
            <div className="flex gap-2">
                <input
                    placeholder={selected ? selected.name : "Search therapist by name, email, phone"}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
            </div>

            {open && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                    {loading && (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
                    )}
                    {!loading && items.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">No therapists found</div>
                    )}
                    {!loading &&
                        items.map((t) => (
                            <button
                                key={t._id}
                                type="button"
                                onClick={() => {
                                    onChange(t._id, t);
                                    setQuery(t.name);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                            >
                                <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                    {t.profilePicture ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={t.profilePicture} alt={t.name} className="h-full w-full object-cover" />
                                    ) : null}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">{t.name}</div>
                                    <div className="truncate text-xs text-gray-500">{t.shortId} • {t.email}{t.phone ? ` • ${t.phone}` : ""}</div>
                                </div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}
