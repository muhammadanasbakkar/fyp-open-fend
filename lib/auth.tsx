// // lib/auth.tsx
// "use client";
// import React, { createContext, useContext, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";

// export type UserRole = "patient" | "therapist" | "receptionist" | "admin" | "superAdmin";
// export type User = {
//   id?: string | number;
//   role: UserRole;
//   patientId?: string;
//   name?: string;
//   email?: string;
// } | null;

// type Ctx = {
//   user: User;
//   token: string | null;
//   hydrated: boolean;
//   // Patients
//   registerPatient: (gender: string, dateOfBirth: string, password: string) => Promise<{ patientId: string }>;
//   loginPatient: (patientId: string, password: string) => Promise<void>;
//   // Staff
//   loginStaff: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// };

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/"; // note trailing slash
// export const AuthContext = createContext<Ctx>({} as Ctx);

// /** ---- helpers ---- */
// function decodeJWT(token: string): { exp?: number } | null {
//   try {
//     const [, payload] = token.split(".");
//     const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const router = useRouter();

//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<User>(null);
//   const [hydrated, setHydrated] = useState(false);

//   // single place to hold the timer id so we can clear it reliably
//   const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   /** schedule logout when token expires */
//   const scheduleAutoLogout = (t: string | null) => {
//     // clear any previous timer
//     if (logoutTimerRef.current) {
//       clearTimeout(logoutTimerRef.current);
//       logoutTimerRef.current = null;
//     }
//     if (!t) return;

//     const decoded = decodeJWT(t);
//     if (!decoded?.exp) return;

//     const msUntilExpiry = decoded.exp * 1000 - Date.now();
//     if (msUntilExpiry <= 0) {
//       // already expired
//       handleLogout();
//       return;
//     }
//     logoutTimerRef.current = setTimeout(() => {
//       handleLogout();
//     }, msUntilExpiry);
//   };

//   /** load from storage on boot */
//   useEffect(() => {
//     try {
//       const t = localStorage.getItem("token");
//       const u = localStorage.getItem("user");
//       if (t) setToken(t);
//       if (u) setUser(JSON.parse(u));
//       // schedule logout for existing session
//       scheduleAutoLogout(t);
//     } catch {}
//     setHydrated(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /** persist token changes */
//   useEffect(() => {
//     try {
//       if (token) localStorage.setItem("token", token);
//       else localStorage.removeItem("token");
//     } catch {}
//     // re-schedule every time token changes
//     scheduleAutoLogout(token);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   function setSession(t: string, u: any) {
//     setToken(t);
//     setUser(u);
//     try {
//       localStorage.setItem("token", t);
//       localStorage.setItem("user", JSON.stringify(u));
//     } catch {}
//     scheduleAutoLogout(t);
//   }

//   /** ---- API calls ---- */

//   // PATIENT register
//   async function registerPatient(gender: string, dateOfBirth: string, password: string) {
//     const res = await fetch(`${API}api/auth/register-patient`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ gender, dateOfBirth, password }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data?.msg || "Registration failed");
//     if (data?.token && data?.user) setSession(data.token, data.user);
//     return { patientId: data.patientId as string };
//   }

//   // PATIENT login (patientId + password)
//   async function loginPatient(patientId: string, password: string) {
//     const res = await fetch(`${API}api/auth/login-patient`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ patientId, password }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data?.msg || "Invalid credentials");
//     setSession(data.token, data.user);
//   }

//   // STAFF login (email + password)
//   async function loginStaff(email: string, password: string) {
//     const res = await fetch(`${API}api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data?.msg || "Invalid credentials");
//     setSession(data.token, data.user);
//   }

//   function handleLogout() {
//     // clear timer
//     if (logoutTimerRef.current) {
//       clearTimeout(logoutTimerRef.current);
//       logoutTimerRef.current = null;
//     }
//     setToken(null);
//     setUser(null);
//     try {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     } catch {}
//     // optional: force user to login page
//     router.replace("/login");
//   }

//   function logout() {
//     handleLogout();
//   }

//   return (
//     <AuthContext.Provider
//       value={{ user, token, hydrated, registerPatient, loginPatient, loginStaff, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
// lib/auth.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "patient" | "therapist" | "receptionist" | "admin" | "superAdmin" | "supervisor" | "hospitalAdmin";
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
  loginStaff: (email: string, password: string) => Promise<{ role: string }>;
  logout: () => void;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/"; // note trailing slash
export const AuthContext = createContext<Ctx>({} as Ctx);

/** ---- helpers ---- */
function base64UrlDecode(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  const str = input + "=".repeat(pad);
  try {
    return typeof window === "undefined"
      ? Buffer.from(str, "base64").toString("utf8")
      : atob(str);
  } catch {
    return "";
  }
}

function decodeJWT(token: string | null): { exp?: number } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = base64UrlDecode(parts[1]);
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

  /** schedule logout slightly before token expires */
  const scheduleAutoLogout = (t: string | null) => {
    // clear any previous timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (!t) return;

    const decoded = decodeJWT(t);
    if (!decoded?.exp) return;

    // 3s early safety buffer so UI doesn't race with backend
    const msUntilExpiry = decoded.exp * 1000 - Date.now() - 3000;
    if (msUntilExpiry <= 0) {
      // already expired
      handleLogout(true);
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      handleLogout(true);
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

  /** listen for global 401s dispatched by api() */
  useEffect(() => {
    const onExpired = () => handleLogout(true);
    if (typeof window !== "undefined") {
      window.addEventListener("auth:expired", onExpired as EventListener);
      return () => window.removeEventListener("auth:expired", onExpired as EventListener);
    }
  }, []);

  /** listen for external setSession (e.g. hospital login page) */
  useEffect(() => {
    const onSet = (e: Event) => {
      const { token: t, user: u } = (e as CustomEvent).detail || {};
      if (t && u) setSession(t, u);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("auth:setSession", onSet as EventListener);
      return () => window.removeEventListener("auth:setSession", onSet as EventListener);
    }
  }, []);

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
  async function loginStaff(email: string, password: string): Promise<{ role: string }> {
    const res = await fetch(`${API}api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || "Invalid credentials");
    setSession(data.token, data.user);
    return { role: data.user?.role as string };
  }

  function handleLogout(redirect = false) {
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
    if (redirect) router.replace("/login");
  }

  function logout() {
    handleLogout(true);
  }

  const value = useMemo(
    () => ({ user, token, hydrated, registerPatient, loginPatient, loginStaff, logout }),
    [user, token, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
