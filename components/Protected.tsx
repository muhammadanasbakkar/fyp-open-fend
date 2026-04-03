// "use client";
// import { ReactNode, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth";
// // import { useAuth } from "@/lib/auth";

// export default function Protected({ children }: { children: ReactNode }) {
//   const { user } = useAuth();
//   const router = useRouter();
//   useEffect(() => { if (!user) router.replace("/login"); }, [user, router]);
//   if (!user) return null;
//   return <>{children}</>;
// }


// /components/Protected.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  // Still loading from localStorage — show nothing to avoid flash redirect
  if (!hydrated) return null;
  if (!token) return null;
  return <>{children}</>;
}
