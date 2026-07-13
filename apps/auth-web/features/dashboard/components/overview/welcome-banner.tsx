"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWelcomeBanner } from "./hooks/use-overview";

export function WelcomeBanner({ userName }: { userName?: string }) {
  const { getGreeting } = useWelcomeBanner();

  return (
    <div className="bg-linear-to-r from-primary/10 to-accent/5 dark:from-primary/20 dark:to-accent/10 rounded-2xl py-3.5 px-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
      {/* Content */}
      <div className="flex flex-col gap-1.5 relative z-10 flex-1">
        <Badge
          variant="outline"
          className="h-5 px-2.5 py-1 text-[8px] font-bold uppercase text-primary tracking-wider rounded-full"
        >
          <Sparkles className="size-2.5" />
          <span>Zen OIDC Platform</span>
        </Badge>
        <h1 className="text-foreground/90 text-lg md:text-xl font-bold tracking-tight">
          {getGreeting()}, {userName || "Developer"}!
        </h1>
        <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
          Welcome to your developer console. Configure secure OAuth 2.1 authentication and OpenID Connect identity provider layers for your projects.
        </p>
      </div>

      {/* Background glow decoration */}
      <div className="absolute top-[-50%] right-[-10%] bottom-[-50%] w-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
    </div>
  );
}
