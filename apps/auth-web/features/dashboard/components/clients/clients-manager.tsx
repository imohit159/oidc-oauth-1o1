"use client";

import * as React from "react";
import {
  clientService,
  type OidcClient,
  type CreateClientPayload,
} from "@/services/client.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, Plus, Loader2 } from "lucide-react";
import { RevealSecretCard } from "./reveal-secret-card";
import { ClientCard } from "./client-card";
import { CreateClientSheet } from "./create-client-sheet";
import { EditClientSheet } from "./edit-client-sheet";

export function ClientsManager() {
  const [clients, setClients] = React.useState<OidcClient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Sheets state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<OidcClient | null>(
    null,
  );

  // New Client form state
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [clientType, setClientType] = React.useState<
    "CONFIDENTIAL" | "PUBLIC" | "MACHINE"
  >("CONFIDENTIAL");
  const [grantTypes, setGrantTypes] = React.useState<string[]>([
    "authorization_code",
    "refresh_token",
  ]);
  const [redirectUrisInput, setRedirectUrisInput] = React.useState("");
  const [allowedOriginsInput, setAllowedOriginsInput] = React.useState("");

  // Edit Client form state
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editGrantTypes, setEditGrantTypes] = React.useState<string[]>([]);
  const [editRedirectUrisInput, setEditRedirectUrisInput] = React.useState("");
  const [editAllowedOriginsInput, setEditAllowedOriginsInput] =
    React.useState("");

  // Created Client Secret reveal state
  const [newClientSecret, setNewClientSecret] = React.useState<{
    clientId: string;
    clientSecret: string;
    name: string;
  } | null>(null);

  // UI Utilities
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Fetch clients
  const fetchClients = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.listClients();
      setClients(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create Client
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setActionLoading(true);
    try {
      const uris = redirectUrisInput
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      const origins = allowedOriginsInput
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      const payload: CreateClientPayload = {
        name,
        description: description.trim() || undefined,
        clientType,
        allowedGrantTypes: grantTypes,
        redirectUris:
          uris.length > 0 ? uris : ["http://localhost:3000/callback"], // Fallback default
        allowedOrigins: origins.length > 0 ? origins : undefined,
      };

      const result = await clientService.createClient(payload);

      // Reset form
      setName("");
      setDescription("");
      setClientType("CONFIDENTIAL");
      setGrantTypes(["authorization_code", "refresh_token"]);
      setRedirectUrisInput("");
      setAllowedOriginsInput("");
      setIsCreateOpen(false);

      // If confidential or machine, we show the secret reveal panel
      if (result.clientSecret) {
        setNewClientSecret({
          clientId: result.clientId,
          clientSecret: result.clientSecret,
          name: result.name,
        });
      }

      await fetchClients();
    } catch (e: any) {
      alert(e.message || "Failed to register client.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit drawer
  const handleOpenEdit = async (client: OidcClient) => {
    setActionLoading(true);
    try {
      const details = await clientService.getClient(client.clientId);
      setSelectedClient(details);
      setEditName(details.name);
      setEditDescription(details.description || "");
      setEditGrantTypes(details.allowedGrantTypes);
      setEditRedirectUrisInput(details.redirectUris?.join("\n") || "");
      setEditAllowedOriginsInput(details.allowedOrigins?.join("\n") || "");
    } catch (e: any) {
      alert(e.message || "Failed to load client details.");
    } finally {
      setActionLoading(false);
    }
  };

  // Update Client
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setActionLoading(true);
    try {
      const uris = editRedirectUrisInput
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      const origins = editAllowedOriginsInput
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      await clientService.updateClient(selectedClient.clientId, {
        name: editName,
        description: editDescription.trim() || undefined,
        allowedGrantTypes: editGrantTypes,
        redirectUris: uris,
        allowedOrigins: origins,
      });

      setSelectedClient(null);
      await fetchClients();
    } catch (e: any) {
      alert(e.message || "Failed to update client.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Client
  const handleDelete = async (clientId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this application? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await clientService.deleteClient(clientId);
      setSelectedClient(null);
      await fetchClients();
    } catch (e: any) {
      alert(e.message || "Failed to delete client.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle grant type checks
  const toggleGrantType = (grant: string, isEdit = false) => {
    const list = isEdit ? editGrantTypes : grantTypes;
    const setList = isEdit ? setEditGrantTypes : setGrantTypes;

    if (list.includes(grant)) {
      setList(list.filter((g) => g !== grant));
    } else {
      setList([...list, grant]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Client Applications
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Register and configure OIDC application integrations.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          Register Client
        </Button>
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
        <Card className="border-2 border-dashed py-16">
          <CardContent className="flex flex-col items-center space-y-4 text-center">
            <div className="bg-primary/5 rounded-full p-4">
              <KeyRound className="text-primary size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No clients registered</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Get started by registering a new application to initiate OAuth /
                OpenID Connect authorization flows.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Register your first client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              copiedId={copiedId}
              onCopy={handleCopy}
              onOpenEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* REGISTER CLIENT DRAWERS SHEET */}
      <CreateClientSheet
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        actionLoading={actionLoading}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        clientType={clientType}
        setClientType={setClientType}
        grantTypes={grantTypes}
        toggleGrantType={(grant) => toggleGrantType(grant, false)}
        redirectUrisInput={redirectUrisInput}
        setRedirectUrisInput={setRedirectUrisInput}
        allowedOriginsInput={allowedOriginsInput}
        setAllowedOriginsInput={setAllowedOriginsInput}
      />

      {/* EDIT/DETAILS SHEET */}
      <EditClientSheet
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        actionLoading={actionLoading}
        editName={editName}
        setEditName={setEditName}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editGrantTypes={editGrantTypes}
        toggleGrantType={(grant) => toggleGrantType(grant, true)}
        editRedirectUrisInput={editRedirectUrisInput}
        setEditRedirectUrisInput={setEditRedirectUrisInput}
        editAllowedOriginsInput={editAllowedOriginsInput}
        setEditAllowedOriginsInput={setEditAllowedOriginsInput}
      />
    </div>
  );
}
