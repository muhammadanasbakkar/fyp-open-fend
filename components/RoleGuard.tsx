"use client";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";
// import { useAuth } from "@/lib/auth";

export default function RoleGuard({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}
