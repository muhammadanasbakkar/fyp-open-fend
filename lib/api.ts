const BASE = process.env.NEXT_PUBLIC_API_URL!;
export function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    let msg = "Request failed";
    try { const j = await res.json(); msg = j.msg || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}
