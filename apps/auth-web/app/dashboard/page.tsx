"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth.store";
import { clientService, type OidcClient } from "@/services/client.service";
import { consentService } from "@/services/consent.service";
import { sessionService } from "@/services/session.service";
import { config } from "@/lib/config";
import {
  WelcomeBanner,
  StatsGrid,
  DiscoveryEndpointCard,
  GettingStartedCard,
  RecentClientsTable,
} from "@/features/dashboard/components/overview";

export default function Page() {
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState({
    clients: 0,
    consents: 0,
    sessions: 0,
    loading: true,
  });
  const [recentClients, setRecentClients] = React.useState<OidcClient[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const discoveryUrl = `${config.API_URL}/.well-known/openid-configuration`;

  const loadDashboardData = React.useCallback(async () => {
    try {
      const [clientsList, consentsList, sessionsList] = await Promise.all([
        clientService.listClients(),
        consentService.listConsents(),
        sessionService.listSessions(),
      ]);

      setStats({
        clients: clientsList.length,
        consents: consentsList.length,
        sessions: sessionsList.length,
        loading: false,
      });

      // Sort recent clients by creation time descending and take top 3
      const sorted = [...clientsList]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setRecentClients(sorted);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setStats((s) => ({ ...s, loading: false }));
    }
  }, []);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this application? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await clientService.deleteClient(clientId);
      await loadDashboardData();
    } catch (e: any) {
      alert(e.message || "Failed to delete client.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Welcome Banner */}
      <WelcomeBanner userName={user?.given_name} />

      {/* Statistics Cards */}
      <StatsGrid stats={stats} loading={stats.loading} />

      {/* Interactive Info Section: Discovery Endpoint & Getting Started */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DiscoveryEndpointCard discoveryUrl={discoveryUrl} />
        </div>
        <div className="lg:col-span-2">
          <GettingStartedCard />
        </div>
      </div>

      {/* Recent Clients Section */}
      {!stats.loading && recentClients.length > 0 && (
        <RecentClientsTable
          clients={recentClients}
          copiedId={copiedId}
          onCopy={handleCopy}
          onDelete={handleDeleteClient}
        />
      )}
    </div>
  );
}
