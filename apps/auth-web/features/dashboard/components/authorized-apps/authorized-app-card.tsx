"use client";

import * as React from "react";
import { type UserConsent } from "@/services/consent.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Loader2, Trash2 } from "lucide-react";

interface AuthorizedAppCardProps {
  consent: UserConsent;
  actionLoading: boolean;
  onRevoke: (consentId: string, clientName: string) => void;
}

export function AuthorizedAppCard({
  consent,
  actionLoading,
  onRevoke,
}: AuthorizedAppCardProps) {
  return (
    <Card className="hover:border-primary/10 transition-colors">
      <CardContent className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold">{consent.clientName}</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {consent.clientDescription || "No description provided."}
            </p>
          </div>

          {/* Permissions/Scopes list */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold">
              Granted Permissions:
            </span>
            {consent.scopes.map((scope) => (
              <span
                key={scope}
                className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold"
              >
                {scope}
              </span>
            ))}
          </div>

          {/* Metadata fields */}
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Authorized: {new Date(consent.grantedAt).toLocaleDateString()}
            </span>
            {consent.lastUsedAt && (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="size-3.5" />
                Last Active: {new Date(consent.lastUsedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <Button
            variant="outline"
            className="flex w-full items-center gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 md:w-auto dark:hover:bg-red-950/20"
            disabled={actionLoading}
            onClick={() => onRevoke(consent.id, consent.clientName)}
          >
            {actionLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Revoke Access
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
