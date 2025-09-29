// lib/auth.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "patient" | "therapist" | "receptionist" | "admin" | "superAdmin";
export type User = {
  id?: string | number;
  role: UserRole;
  patientId?: string;
  name?: string;
  email?: string;
} | null;

type Ctx = {
  user: User;
  token: string | null;
  hydrated: boolean;
  // Patients
  registerPatient: (gender: string, dateOfBirth: string, password: string) => Promise<{patientId:string}>;
  loginPatient: (patientId: string, password: string) => Promise<void>;
  // Staff
  loginStaff: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const AuthContext = createContext<Ctx>({} as Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    } catch {}
  }, [token]);

  function setSession(t: string, u: any) {
    setToken(t);
    setUser(u);
    try {
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));
    } catch {}
  }

  // PATIENT register
  async function registerPatient(gender: string, dateOfBirth: string, password: string) {
    const res = await fetch(`${API}api/auth/register-patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender, dateOfBirth, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || "Registration failed");
    if (data?.token && data?.user) setSession(data.token, data.user);
    return { patientId: data.patientId as string };
  }

  // PATIENT login (patientId + password)
  async function loginPatient(patientId: string, password: string) {
    const res = await fetch(`${API}api/auth/login-patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || "Invalid credentials");
    setSession(data.token, data.user);
  }

  // STAFF login (email + password)
  async function loginStaff(email: string, password: string) {
    const res = await fetch(`${API}api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || "Invalid credentials");
    setSession(data.token, data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, token, hydrated, registerPatient, loginPatient, loginStaff, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
