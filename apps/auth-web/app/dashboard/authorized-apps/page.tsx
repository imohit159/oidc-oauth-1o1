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
      `Are you sure you want to revoke access for "${clientName}"? The application will no longer be able to access your profile data or log you in automatically.`
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
        <h1 className="text-3xl font-bold tracking-tight">Authorized Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and revoke access for external applications connected to your Zen identity.
        </p>
      </div>

      <Separator />

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-red-500 font-semibold">{error}</p>
            <Button size="sm" onClick={fetchConsents}>Retry</Button>
          </CardContent>
        </Card>
      ) : consents.length === 0 ? (
        <Card className="border-dashed border-2 py-16">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/5 p-4 rounded-full">
              <CheckCircle className="size-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No authorized applications</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                When you sign in to external clients using your Zen account, they will request permissions and appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consents.map((consent) => (
            <Card key={consent.id} className="hover:border-primary/10 transition-colors">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="font-bold text-lg">{consent.clientName}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {consent.clientDescription || "No description provided."}
                    </p>
                  </div>

                  {/* Permissions/Scopes list */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-semibold">Granted Permissions:</span>
                    {consent.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>

                  {/* Metadata fields */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                    className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 w-full md:w-auto flex items-center gap-2"
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
