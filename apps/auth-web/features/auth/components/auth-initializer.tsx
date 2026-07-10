"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Initializes the auth store on mount (runs refresh on app load).
 * Place this component at the root of the app inside the body.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
