// lib/auth.tsx
"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  registerPatient: (gender: string, dateOfBirth: string, password: string) => Promise<{ patientId: string }>;
  loginPatient: (patientId: string, password: string) => Promise<void>;
  // Staff
  loginStaff: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/"; // note trailing slash
export const AuthContext = createContext<Ctx>({} as Ctx);

/** ---- helpers ---- */
function decodeJWT(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [hydrated, setHydrated] = useState(false);

  // single place to hold the timer id so we can clear it reliably
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** schedule logout when token expires */
  const scheduleAutoLogout = (t: string | null) => {
    // clear any previous timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (!t) return;

    const decoded = decodeJWT(t);
    if (!decoded?.exp) return;

    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      // already expired
      handleLogout();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, msUntilExpiry);
  };

  /** load from storage on boot */
  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      // schedule logout for existing session
      scheduleAutoLogout(t);
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** persist token changes */
  useEffect(() => {
    try {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    } catch {}
    // re-schedule every time token changes
    scheduleAutoLogout(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function setSession(t: string, u: any) {
    setToken(t);
    setUser(u);
    try {
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));
    } catch {}
    scheduleAutoLogout(t);
  }

  /** ---- API calls ---- */

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

  function handleLogout() {
    // clear timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    // optional: force user to login page
    router.replace("/login");
  }

  function logout() {
    handleLogout();
  }

  return (
    <AuthContext.Provider
      value={{ user, token, hydrated, registerPatient, loginPatient, loginStaff, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
