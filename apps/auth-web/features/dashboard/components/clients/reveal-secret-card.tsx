"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Check, Copy } from "lucide-react";

interface RevealSecretCardProps {
  name: string;
  clientId: string;
  clientSecret: string;
  onDismiss: () => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export function RevealSecretCard({
  name,
  clientId,
  clientSecret,
  onDismiss,
  copiedId,
  onCopy,
}: RevealSecretCardProps) {
  return (
    <Card className="border-2 border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Shield className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800 dark:text-amber-400">
              Client Credentials Generated: {name}
            </h3>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80">
              Copy the client secret below now. For security reasons, it will
              not be shown again.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100/50 dark:text-amber-400"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </div>
        <Separator className="bg-amber-500/10" />
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-semibold">
              CLIENT ID
            </span>
            <div className="bg-background flex items-center gap-2 rounded-md border p-2">
              <code className="flex-1 text-xs break-all">{clientId}</code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onCopy(clientId, "reveal-id")}
              >
                {copiedId === "reveal-id" ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-semibold">
              CLIENT SECRET
            </span>
            <div className="bg-background flex items-center gap-2 rounded-md border p-2">
              <code className="flex-1 font-mono text-xs font-bold break-all text-amber-600 dark:text-amber-400">
                {clientSecret}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onCopy(clientSecret, "reveal-secret")}
              >
                {copiedId === "reveal-secret" ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
