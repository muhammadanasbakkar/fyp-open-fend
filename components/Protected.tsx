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
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) return null; // or a spinner
  return <>{children}</>;
}
