const BASE = process.env.NEXT_PUBLIC_API_URL!;
// export function authHeader(token?: string): Record<string, string> {
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export async function api(path: string, opts: RequestInit = {}) {
//   const res = await fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: {
//       "Content-Type": "application/json",
//       ...(opts.headers || {})
//     },
//     cache: "no-store"
//   });
//   if (!res.ok) {
//     let msg = "Request failed";
//     try { const j = await res.json(); msg = j.msg || msg; } catch {}
//     throw new Error(msg);
//   }
//   return res.json();
// }

export async function api(path: string, init: RequestInit = {}, base = "") {
  // Auto-inject stored token so callers never silently omit Authorization
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const existingHeaders = (init.headers as Record<string, string>) || {};
  const authorizationHeader: Record<string, string> =
    storedToken && !existingHeaders["Authorization"]
      ? { Authorization: `Bearer ${storedToken}` }
      : {};

  const res = await fetch(`${BASE}${path.startsWith("/") ? path : path}`, {
    credentials: "include",
    ...init,
    headers: { ...authorizationHeader, ...existingHeaders },
  });

  if (res.status === 401) {
    // tell AuthProvider to logout & redirect
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    const body = await safeJson(res);
    throw new Error(body?.msg || "Unauthorized");
  }

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.msg || res.statusText);
  }
  return safeJson(res);
}

async function safeJson(res: Response) {
  const txt = await res.text();
  try { return JSON.parse(txt || "{}"); } catch { return { raw: txt }; }
}

export function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}