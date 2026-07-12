"use client";

import * as React from "react";
import { consentService, type UserConsent } from "@/services/consent.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldAlert,
  Calendar,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";

export default function AuthorizedAppsPage() {
  const [consents, setConsents] = React.useState<UserConsent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchConsents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await consentService.listConsents();
      setConsents(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load authorized applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  const handleRevoke = async (consentId: string, clientName: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to revoke access for "${clientName}"? The application will no longer be able to access your profile data or log you in automatically.`,
    );
    if (!isConfirmed) return;

    setActionLoading(consentId);
    try {
      await consentService.revokeConsent(consentId);
      setConsents((prev) => prev.filter((c) => c.id !== consentId));
    } catch (e: any) {
      alert(e.message || "Failed to revoke access.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Authorized Applications
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and revoke access for external applications connected to your
          Zen identity.
        </p>
      </div>

      <Separator />

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="space-y-2 p-6 text-center">
            <p className="font-semibold text-red-500">{error}</p>
            <Button size="sm" onClick={fetchConsents}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : consents.length === 0 ? (
        <Card className="border-2 border-dashed py-16">
          <CardContent className="flex flex-col items-center space-y-4 text-center">
            <div className="bg-primary/5 rounded-full p-4">
              <CheckCircle className="text-primary size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                No authorized applications
              </h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                When you sign in to external clients using your Zen account,
                they will request permissions and appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consents.map((consent) => (
            <Card
              key={consent.id}
              className="hover:border-primary/10 transition-colors"
            >
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
                      Authorized:{" "}
                      {new Date(consent.grantedAt).toLocaleDateString()}
                    </span>
                    {consent.lastUsedAt && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="size-3.5" />
                        Last Active:{" "}
                        {new Date(consent.lastUsedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    className="flex w-full items-center gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 md:w-auto dark:hover:bg-red-950/20"
                    disabled={actionLoading === consent.id}
                    onClick={() => handleRevoke(consent.id, consent.clientName)}
                  >
                    {actionLoading === consent.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Revoke Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
