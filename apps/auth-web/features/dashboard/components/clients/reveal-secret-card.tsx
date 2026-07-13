"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RevealSecretCardProps {
  name: string;
  clientId: string;
  clientSecret?: string;
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
    <Dialog open={true} onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
              <Shield className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="font-bold text-amber-800 dark:text-amber-400">
                Credentials Generated
              </DialogTitle>
              <DialogDescription className="text-xs text-amber-700 dark:text-amber-300/80">
                Copy the credentials for <strong>{name}</strong> below now. For security reasons, the secret will not be shown again.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-border" />

        <div className="space-y-4 py-2">
          {/* Client ID */}
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              Client ID
            </span>
            <div className="bg-muted/5 flex items-center gap-2 rounded-md border p-2">
              <code className="flex-1 text-xs break-all select-all">{clientId}</code>
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

          {/* Client Secret */}
          {clientSecret && (
            <div className="space-y-1">
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                Client Secret
              </span>
              <div className="bg-muted/5 flex items-center gap-2 rounded-md border p-2">
                <code className="flex-1 font-mono text-xs font-bold break-all text-amber-600 dark:text-amber-400 select-all">
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
          )}
        </div>

        <DialogFooter showCloseButton={true} />
      </DialogContent>
    </Dialog>
  );
}
