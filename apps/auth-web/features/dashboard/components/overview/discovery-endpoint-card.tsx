"use client";

import * as React from "react";
import { Globe, Copy, Check, ExternalLink, ChevronUp, ChevronDown, Lightbulb } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDiscoveryEndpoint } from "./hooks/use-overview";

interface DiscoveryEndpointCardProps {
  discoveryUrl: string;
}

export function DiscoveryEndpointCard({ discoveryUrl }: DiscoveryEndpointCardProps) {
  const { copied, isOpen, setIsOpen, handleCopy } = useDiscoveryEndpoint(discoveryUrl);

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground">
              <Globe className="size-4" />
            </div>
            <h3 className="text-foreground font-bold">
              OIDC Discovery Endpoint
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-foreground cursor-pointer animate-fade-in"
          >
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Use this endpoint to configure your OpenID Connect client or library.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="bg-muted/5 border border-border rounded-lg p-2.5 flex-1 min-w-0">
                <code className="text-foreground/80 dark:text-foreground/90 font-mono text-xs truncate block select-all">
                  {discoveryUrl}
                </code>
              </div>
              <div className="flex items-stretch gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="gap-1.5 h-10 px-3 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy
                    </>
                  )}
                </Button>
                <a
                  href={discoveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "gap-1.5 h-10 px-3 text-xs font-semibold border-primary/20 text-primary hover:bg-primary/10 dark:border-primary/30 dark:hover:bg-primary/20"
                  })}
                >
                  <ExternalLink className="size-3.5" />
                  Open JSON
                </a>
              </div>
            </div>
            <Separator className="mt-4" />
            <div className="flex items-start gap-2.5 max-w-md" >
              <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-normal">
                This endpoint is publicly accessible and contains metadata required to integrate with Zen OIDC Platform.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
