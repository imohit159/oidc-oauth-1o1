"use client";

import { TooltipProvider as Provider } from "@/components/ui/tooltip";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
