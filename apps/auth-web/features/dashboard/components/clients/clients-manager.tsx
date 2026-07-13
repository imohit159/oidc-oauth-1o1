"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, Plus, Loader2, LayoutGrid, List } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { RevealSecretCard } from "./reveal-secret-card";
import { ClientCard } from "./client-card";
import { ClientList } from "./client-list";
import { useClientsManager } from "./hooks/use-clients-manager";

export function ClientsManager() {
  const {
    router,
    clients,
    loading,
    error,
    viewMode,
    setViewMode,
    newClientSecret,
    setNewClientSecret,
    copiedId,
    handleCopy,
    handleDelete,
    handleRegenerateSecret,
    fetchClients,
  } = useClientsManager();

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="border-none pb-0 text-3xl font-bold tracking-tight">
            Client Applications
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Register and configure OIDC application integrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted/5 flex shrink-0 items-center gap-1 rounded-lg border p-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`size-7 transition-all ${viewMode === "grid"
                ? "text-foreground border bg-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
                }`}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode("list")}
              title="List View"
              className={`size-7 transition-all ${viewMode === "list"
                ? "text-foreground border bg-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
                }`}
            >
              <List className="size-4" />
            </Button>
          </div>
          <Button
            onClick={() => router.push("/dashboard/clients/new")}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Register Client
          </Button>
        </div>
      </div>

      {/* Secret Reveal Notification Card */}
      {newClientSecret && (
        <RevealSecretCard
          name={newClientSecret.name}
          clientId={newClientSecret.clientId}
          clientSecret={newClientSecret.clientSecret}
          onDismiss={() => setNewClientSecret(null)}
          copiedId={copiedId}
          onCopy={handleCopy}
        />
      )}

      {/* Main clients content list */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="space-y-2 p-6 text-center">
            <p className="font-semibold text-red-500">{error}</p>
            <Button size="sm" onClick={fetchClients}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No clients registered"
          description="Get started by registering a new application to initiate OAuth / OpenID Connect authorization flows."
          action={{
            label: "Register your first client",
            onClick: () => router.push("/dashboard/clients/new"),
            icon: Plus,
          }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              copiedId={copiedId}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onRegenerateSecret={handleRegenerateSecret}
            />
          ))}
        </div>
      ) : (
        <ClientList
          clients={clients}
          copiedId={copiedId}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onRegenerateSecret={handleRegenerateSecret}
        />
      )}
    </div>
  );
}
