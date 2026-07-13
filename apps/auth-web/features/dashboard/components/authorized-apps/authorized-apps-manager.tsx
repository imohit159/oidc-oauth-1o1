"use client";

import * as React from "react";
import { consentService, type UserConsent } from "@/services/consent.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { AuthorizedAppCard } from "./authorized-app-card";

export function AuthorizedAppsManager() {
  const [consents, setConsents] = React.useState<UserConsent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(
    null,
  );

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

    setActionLoadingId(consentId);
    try {
      await consentService.revokeConsent(consentId);
      setConsents((prev) => prev.filter((c) => c.id !== consentId));
    } catch (e: any) {
      alert(e.message || "Failed to revoke access.");
    } finally {
      setActionLoadingId(null);
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
        <EmptyState
          icon={CheckCircle}
          title="No authorized applications"
          description="When you sign in to external clients using your Zen account, they will request permissions and appear here."
        />
      ) : (
        <div className="space-y-4">
          {consents.map((consent) => (
            <AuthorizedAppCard
              key={consent.id}
              consent={consent}
              actionLoading={actionLoadingId === consent.id}
              onRevoke={handleRevoke}
            />
          ))}
        </div>
      )}
    </div>
  );
}
