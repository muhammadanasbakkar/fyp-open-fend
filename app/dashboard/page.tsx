"use client";
import Protected from "@/components/Protected";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import ReceptionistBookingPage from "@/components/ReceptionistBookingPage";

export default function Dashboard() {
  const { user } = useAuth();

  

  


  // If user is receptionist, only show receptionist content
  if (user?.role === "receptionist") {
    return (
      <Protected>
        <ReceptionistBookingPage />
        {/* <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
          <h1 className="text-2xl font-semibold">Receptionist Dashboard</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Reception booking" href="/receptionist/book" />
            <Card title="My appointments" href="/appointments/my" />
          </div>
          <p className="text-sm text-gray-500">Logged in as <strong>receptionist</strong>.</p>
        </div> */}
      </Protected>
    );
  }

  // All other roles
  return (
    <Protected>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Book an appointment" href="/appointments/book" />
          <Card title="My appointments" href="/appointments/my" />
          <RoleGuard roles={["therapist"]}>
            <Card title="Manage availability" href="/availability" />
          </RoleGuard>
          <RoleGuard roles={["superAdmin"]}>
            <Card title="Pending users" href="/admin/pending-users" />
          </RoleGuard>
        </div>
        <p className="text-sm text-gray-500">Logged in as <strong>{user?.role}</strong>.</p>
      </div>
    </Protected>
  );
}

function Card({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href} className="block rounded-xl border p-6 hover:shadow-sm">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">Open</p>
    </Link>
  );
}
