"use client";

import { useEffect, useState } from "react";
import { api, authHeader } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Protected from "@/components/Protected";
import Image from "next/image";
import Button from "@/components/Button";

export default function ReceptionistBookingPage() {
    const { token } = useAuth();
    const [therapists, setTherapists] = useState<any[]>([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!token) return;

        async function fetchTherapists() {
            try {
                const res = await api("/therapists/available", {
                    headers: authHeader(token || undefined),
                });
                setTherapists(res);
            } catch (e: any) {
                setErr(e.message);
            }
        }

        fetchTherapists();
    }, [token]);

    return (
        <Protected>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Available Therapists</h1>
                {err && <p className="text-red-500 text-sm">{err}</p>}
                <div className="grid sm:grid-cols-2 gap-6">
                    {therapists.map((t) => (
                        <div
                            key={t._id}
                            className="border rounded-lg p-4 bg-white shadow-sm flex flex-col items-center text-center"
                        >
                            <Image
                                src={t.profilePicture || "/default-avatar.png"}
                                alt={t.name}
                                width={80}
                                height={80}
                                className="rounded-full"
                            />
                            <h3 className="font-semibold text-lg mt-2">{t.name}</h3>
                            <p className="text-sm text-gray-600">{t.email}</p>
                            <p className="text-sm text-gray-600">{t.specialization || "General Therapist"}</p>
                            {/* Optional availability or action */}
                            <a href={`/appointments/book?therapistId=${t._id}`} className="mt-3">
                                <Button>
                                    Book Appointment
                                </Button>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Protected>
    );
}
