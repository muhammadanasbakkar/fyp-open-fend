"use client";

import { Suspense, ReactNode } from "react";
import SuspenseFallback from "./SuspenseFallback";

export default function SuspenseWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      {children}
    </Suspense>
  );
}
