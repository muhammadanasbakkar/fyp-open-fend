// /lib/jwt.ts
export type DecodedJwt = { exp?: number; [k: string]: any };

function base64UrlDecode(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  const str = input + "=".repeat(pad);
  if (typeof window === "undefined") {
    return Buffer.from(str, "base64").toString("utf8");
  }
  return decodeURIComponent(
    atob(str)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function decodeJwt(token: string | undefined | null): DecodedJwt | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function getJwtExpiryMs(token?: string | null) {
  const d = decodeJwt(token || "");
  if (!d?.exp) return null;
  return d.exp * 1000; // seconds -> ms
}
