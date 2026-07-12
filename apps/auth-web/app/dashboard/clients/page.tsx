"use client";

import * as React from "react";
import { clientService, type OidcClient, type CreateClientPayload } from "@/services/client.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Settings2,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = React.useState<OidcClient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Sheets state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<OidcClient | null>(null);

  // New Client form state
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [clientType, setClientType] = React.useState<"CONFIDENTIAL" | "PUBLIC" | "MACHINE">("CONFIDENTIAL");
  const [grantTypes, setGrantTypes] = React.useState<string[]>(["authorization_code", "refresh_token"]);
  const [redirectUrisInput, setRedirectUrisInput] = React.useState("");
  const [allowedOriginsInput, setAllowedOriginsInput] = React.useState("");

  // Edit Client form state
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editGrantTypes, setEditGrantTypes] = React.useState<string[]>([]);
  const [editRedirectUrisInput, setEditRedirectUrisInput] = React.useState("");
  const [editAllowedOriginsInput, setEditAllowedOriginsInput] = React.useState("");

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
        redirectUris: uris.length > 0 ? uris : ["http://localhost:3000/callback"], // Fallback default
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
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register and configure OIDC application integrations.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="size-4" />
          Register Client
        </Button>
      </div>

      {/* Secret Reveal Notification Card */}
      {newClientSecret && (
        <Card className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 border-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <Shield className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 dark:text-amber-400">
                  Client Credentials Generated: {newClientSecret.name}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
                  Copy the client secret below now. For security reasons, it will not be shown again.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-800 dark:text-amber-400 hover:bg-amber-100/50"
                onClick={() => setNewClientSecret(null)}
              >
                Dismiss
              </Button>
            </div>
            <Separator className="bg-amber-500/10" />
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">CLIENT ID</span>
                <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
                  <code className="text-xs break-all flex-1">{newClientSecret.clientId}</code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleCopy(newClientSecret.clientId, "reveal-id")}
                  >
                    {copiedId === "reveal-id" ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">CLIENT SECRET</span>
                <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
                  <code className="text-xs break-all flex-1 font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {newClientSecret.clientSecret}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleCopy(newClientSecret.clientSecret, "reveal-secret")}
                  >
                    {copiedId === "reveal-secret" ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main clients content list */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-red-500 font-semibold">{error}</p>
            <Button size="sm" onClick={fetchClients}>Retry</Button>
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="border-dashed border-2 py-16">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/5 p-4 rounded-full">
              <KeyRound className="size-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No clients registered</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Get started by registering a new application to initiate OAuth / OpenID Connect authorization flows.
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="size-4" />
              Register your first client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:border-primary/20 transition-all group flex flex-col justify-between">
              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        client.clientType === "CONFIDENTIAL"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                          : client.clientType === "PUBLIC"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {client.clientType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 h-8 mt-1">
                      {client.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">CLIENT ID</span>
                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded border">
                      <code className="text-xs font-mono truncate flex-1">{client.clientId}</code>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6"
                        onClick={() => handleCopy(client.clientId, client.id)}
                      >
                        {copiedId === client.id ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1.5 flex-wrap">
                      {client.allowedGrantTypes.map((grant) => (
                        <span key={grant} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                          {grant.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleOpenEdit(client)}
                      title="Edit application settings"
                    >
                      <Settings2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* REGISTER CLIENT DRAWERS SHEET */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Register Client Application</SheetTitle>
            <SheetDescription>
              Register an application with Zen to start issuing tokens.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grafana Dashboards"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appDesc">Description</Label>
              <Input
                id="appDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional purpose/details about this app"
              />
            </div>

            <div className="space-y-2">
              <Label>Client Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setClientType("CONFIDENTIAL")}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all ${
                    clientType === "CONFIDENTIAL"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xs font-bold">Confidential</span>
                  <span className="text-[9px] text-muted-foreground">Uses client secret. Secure backends.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientType("PUBLIC")}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all ${
                    clientType === "PUBLIC"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xs font-bold">Public</span>
                  <span className="text-[9px] text-muted-foreground">No client secret. SPAs / Mobile.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientType("MACHINE")}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all ${
                    clientType === "MACHINE"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xs font-bold">Machine</span>
                  <span className="text-[9px] text-muted-foreground">M2M. Uses client credentials.</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allowed Grant Types</Label>
              <div className="space-y-2 bg-muted/40 p-3 rounded-lg border">
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={grantTypes.includes("authorization_code")}
                    onChange={() => toggleGrantType("authorization_code")}
                    className="accent-primary rounded"
                  />
                  <div>
                    <span className="font-semibold text-xs">Authorization Code</span>
                    <p className="text-[10px] text-muted-foreground">Standard grant for web apps (PKCE recommended for Public).</p>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={grantTypes.includes("client_credentials")}
                    onChange={() => toggleGrantType("client_credentials")}
                    className="accent-primary rounded"
                  />
                  <div>
                    <span className="font-semibold text-xs">Client Credentials</span>
                    <p className="text-[10px] text-muted-foreground">Server-to-server daemon requests.</p>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={grantTypes.includes("refresh_token")}
                    onChange={() => toggleGrantType("refresh_token")}
                    className="accent-primary rounded"
                  />
                  <div>
                    <span className="font-semibold text-xs">Refresh Token</span>
                    <p className="text-[10px] text-muted-foreground">Request offline/refresh tokens for persistent login.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="redirects">Allowed Redirect URIs (One per line)</Label>
              <textarea
                id="redirects"
                value={redirectUrisInput}
                onChange={(e) => setRedirectUrisInput(e.target.value)}
                placeholder="https://my-app.com/callback&#10;http://localhost:3000/callback"
                className="w-full h-20 px-3 py-2 text-sm bg-background border rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="origins">Allowed Web Origins (One per line, optional)</Label>
              <textarea
                id="origins"
                value={allowedOriginsInput}
                onChange={(e) => setAllowedOriginsInput(e.target.value)}
                placeholder="https://my-app.com&#10;http://localhost:3000"
                className="w-full h-16 px-3 py-2 text-sm bg-background border rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <Button type="submit" disabled={actionLoading} className="w-full">
              {actionLoading && <Loader2 className="size-4 animate-spin mr-2" />}
              Save Application
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* EDIT/DETAILS SHEET */}
      <Sheet open={selectedClient !== null} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          {selectedClient && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle>Edit Application</SheetTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(selectedClient.clientId)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete App
                  </Button>
                </div>
                <SheetDescription>
                  Modify configurations for client ID: <code className="font-mono text-xs font-bold text-foreground bg-muted p-0.5 rounded">{selectedClient.clientId}</code>
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleUpdate} className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editName">Application Name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editDesc">Description</Label>
                  <Input
                    id="editDesc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Client Type</Label>
                  <Input
                    value={selectedClient.clientType}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground">The client type cannot be changed after registration.</p>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Grant Types</Label>
                  <div className="space-y-2 bg-muted/40 p-3 rounded-lg border">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editGrantTypes.includes("authorization_code")}
                        onChange={() => toggleGrantType("authorization_code", true)}
                        className="accent-primary rounded"
                      />
                      <span className="text-xs">Authorization Code</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editGrantTypes.includes("client_credentials")}
                        onChange={() => toggleGrantType("client_credentials", true)}
                        className="accent-primary rounded"
                      />
                      <span className="text-xs">Client Credentials</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editGrantTypes.includes("refresh_token")}
                        onChange={() => toggleGrantType("refresh_token", true)}
                        className="accent-primary rounded"
                      />
                      <span className="text-xs">Refresh Token</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editRedirects">Allowed Redirect URIs (One per line)</Label>
                  <textarea
                    id="editRedirects"
                    value={editRedirectUrisInput}
                    onChange={(e) => setEditRedirectUrisInput(e.target.value)}
                    placeholder="http://localhost:3000/callback"
                    className="w-full h-20 px-3 py-2 text-sm bg-background border rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editOrigins">Allowed Web Origins (One per line, optional)</Label>
                  <textarea
                    id="editOrigins"
                    value={editAllowedOriginsInput}
                    onChange={(e) => setEditAllowedOriginsInput(e.target.value)}
                    placeholder="http://localhost:3000"
                    className="w-full h-16 px-3 py-2 text-sm bg-background border rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <Button type="submit" disabled={actionLoading} className="w-full">
                  {actionLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
