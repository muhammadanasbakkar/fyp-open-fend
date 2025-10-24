const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";
export async function publicApi<T=any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error((await res.json().catch(()=>({})))?.msg || "Request failed");
  return res.json();
}