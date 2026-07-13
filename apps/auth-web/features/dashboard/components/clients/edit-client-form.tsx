"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  type OidcClient,
  type UpdateClientPayload,
} from "@/services/client.service";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Shield,
  Check,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useClients, useClientDetails } from "./hooks/use-clients";

interface EditClientFormProps {
  clientId: string;
}

interface ClientFormValues {
  name: string;
  description: string;
  clientType: "CONFIDENTIAL" | "PUBLIC" | "MACHINE";
  grantTypes: string[];
  redirectUris: string[];
  allowedOrigins: string[];
  logoUrl: string;
  websiteUrl: string;
  publisherName: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export function EditClientForm({ clientId }: EditClientFormProps) {
  const { client, loading, error } = useClientDetails(clientId);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center">
          <Link
            href="/dashboard/clients"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <ArrowLeft className="size-4" />
            </span>
            <span className="text-sm font-semibold">Back to Clients</span>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="space-y-4 p-6 text-center">
            <p className="font-semibold text-red-500">
              {error || "Application not found"}
            </p>
            <Link
              href="/dashboard/clients"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Back to Applications
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EditClientFormInner client={client} />;
}

function EditClientFormInner({ client }: { client: OidcClient }) {
  const router = useRouter();
  const { updateClient, rotateSecret, actionLoading } = useClients();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Success secret rotation reveal state
  const [credentials, setCredentials] = React.useState<{
    clientId: string;
    clientSecret?: string;
    name: string;
  } | null>(null);

  // TanStack Form Setup
  const form = useForm({
    defaultValues: {
      name: client.name,
      description: client.description || "",
      clientType: client.clientType,
      grantTypes: client.allowedGrantTypes as string[],
      redirectUris: (client.redirectUris && client.redirectUris.length > 0
        ? client.redirectUris
        : ["http://localhost:3000/callback"]) as string[],
      allowedOrigins: (client.allowedOrigins && client.allowedOrigins.length > 0
        ? client.allowedOrigins
        : ["http://localhost:3000"]) as string[],
      logoUrl: client.logoUrl || "",
      websiteUrl: client.websiteUrl || "",
      publisherName: client.publisherName || "",
      privacyPolicyUrl: client.privacyPolicyUrl || "",
      termsOfServiceUrl: client.termsOfServiceUrl || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const uris = value.redirectUris
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        const origins = value.allowedOrigins
          .map((o) => o.trim())
          .filter((o) => o.length > 0);

        const payload: UpdateClientPayload = {
          name: value.name,
          description: value.description.trim() || undefined,
          allowedGrantTypes: value.grantTypes,
          redirectUris: uris,
          allowedOrigins: origins.length > 0 ? origins : [],
          logoUrl: value.logoUrl.trim() || undefined,
          websiteUrl: value.websiteUrl.trim() || undefined,
          publisherName: value.publisherName.trim() || undefined,
          privacyPolicyUrl: value.privacyPolicyUrl.trim() || undefined,
          termsOfServiceUrl: value.termsOfServiceUrl.trim() || undefined,
        };

        await updateClient(client.clientId, payload);
        router.push("/dashboard/clients");
      } catch (e: any) {
        alert(e.message || "Failed to update client application.");
      }
    },
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRotateSecret = async () => {
    if (
      !confirm(
        "Are you sure you want to rotate the client secret? The old secret will be deactivated immediately.",
      )
    ) {
      return;
    }

    try {
      const result = await rotateSecret(client.clientId);
      setCredentials({
        clientId: result.clientId,
        clientSecret: result.clientSecret,
        name: result.name,
      });
    } catch (e: any) {
      alert(e.message || "Failed to rotate secret.");
    }
  };

  // SUCCESS / SECRET ROTATED REVEAL SCREEN
  if (credentials) {
    return (
      <div className="w-full space-y-6">
        <Card className="border-2 border-amber-500/20 bg-amber-50/30 p-2 dark:bg-amber-950/10">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Shield className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl text-amber-800 dark:text-amber-400">
                  Secret Rotated Successfully!
                </CardTitle>
                <CardDescription className="text-amber-700/80 dark:text-amber-300/60">
                  Please copy your new client secret now. It will not be shown
                  again.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-background space-y-4 rounded-lg border p-5">
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Application Name
                </span>
                <div className="text-sm font-semibold">{credentials.name}</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Client ID
                </span>
                <div className="bg-muted/5 flex items-center gap-2 rounded-md border p-2.5">
                  <code className="flex-1 text-xs break-all">
                    {credentials.clientId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      handleCopy(credentials.clientId, "reveal-id")
                    }
                  >
                    {copiedId === "reveal-id" ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {credentials.clientSecret && (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    New Client Secret
                  </span>
                  <div className="bg-muted/5 flex items-center gap-2 rounded-md border p-2.5">
                    <code className="flex-1 font-mono text-xs font-bold break-all text-amber-600 dark:text-amber-400">
                      {credentials.clientSecret}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        handleCopy(credentials.clientSecret!, "reveal-secret")
                      }
                    >
                      {copiedId === "reveal-secret" ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => setCredentials(null)} className="w-full">
              Close & Continue Editing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // STANDARD EDIT FORM VIEW
  return (
    <div className="w-full space-y-6">
      {/* Back navigation */}
      <div className="flex items-center">
        <Link
          href="/dashboard/clients"
          className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
            <ArrowLeft className="size-4" />
          </span>
          <span className="text-sm font-medium">Back to Clients</span>
        </Link>
      </div>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Edit Application
          </CardTitle>
          <CardDescription>
            Modify OIDC and OAuth 2.1 integration settings for Client ID:{" "}
            <code className="bg-muted/10 text-foreground rounded px-1.5 py-0.5 font-mono text-xs font-bold">
              {client.clientId}
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name Field */}
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length < 2
                      ? "Application name must be at least 2 characters"
                      : undefined,
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Application Name</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Grafana Dashboards"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs font-semibold text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Description Field */}
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Description</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Optional purpose/details about this app"
                    />
                  </div>
                )}
              />
            </div>

            {/* Client Type Field (Disabled / Read-Only) */}
            <div className="space-y-1.5">
              <Label>Client Type</Label>
              <Input
                value={client.clientType}
                disabled
                className="bg-muted/10 text-muted-foreground cursor-not-allowed font-bold"
              />
              <p className="text-muted-foreground text-[10px]">
                The client type cannot be modified after registration.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column: Grant Types */}
              <form.Field
                name="grantTypes"
                validators={{
                  onChange: ({ value }) =>
                    value.length === 0
                      ? "At least one grant type must be selected"
                      : undefined,
                }}
                children={(field) => {
                  const values = field.state.value;
                  const toggle = (grant: string) => {
                    if (values.includes(grant)) {
                      field.handleChange(values.filter((v) => v !== grant));
                    } else {
                      field.handleChange([...values, grant]);
                    }
                  };

                  return (
                    <div className="space-y-2">
                      <Label>Allowed Grant Types</Label>
                      <div className="bg-muted/5 space-y-3 rounded-lg border p-3">
                        <label className="flex cursor-pointer items-start gap-2.5 text-sm select-none">
                          <input
                            type="checkbox"
                            checked={values.includes("authorization_code")}
                            onChange={() => toggle("authorization_code")}
                            className="accent-primary mt-0.5 rounded"
                          />
                          <div>
                            <span className="text-xs font-semibold">
                              Authorization Code
                            </span>
                            <p className="text-muted-foreground text-[10px] leading-tight">
                              Standard flow for web apps (PKCE recommended for
                              Public).
                            </p>
                          </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-2.5 text-sm select-none">
                          <input
                            type="checkbox"
                            checked={values.includes("client_credentials")}
                            onChange={() => toggle("client_credentials")}
                            className="accent-primary mt-0.5 rounded"
                          />
                          <div>
                            <span className="text-xs font-semibold">
                              Client Credentials
                            </span>
                            <p className="text-muted-foreground text-[10px] leading-tight">
                              Server-to-server machine integrations.
                            </p>
                          </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-2.5 text-sm select-none">
                          <input
                            type="checkbox"
                            checked={values.includes("refresh_token")}
                            onChange={() => toggle("refresh_token")}
                            className="accent-primary mt-0.5 rounded"
                          />
                          <div>
                            <span className="text-xs font-semibold">
                              Refresh Token
                            </span>
                            <p className="text-muted-foreground text-[10px] leading-tight">
                              Requests offline tokens for persistent user
                              logins.
                            </p>
                          </div>
                        </label>
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-xs font-semibold text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              {/* Right Column: Redirect URIs & Web Origins */}
              <div className="space-y-6">
                {/* Redirect URIs Field */}
                <form.Field
                  name="redirectUris"
                  validators={{
                    onChange: ({ value }) =>
                      value.filter((val) => val.trim().length > 0).length === 0
                        ? "At least one redirect URI is required"
                        : undefined,
                  }}
                  children={(field) => {
                    const uris = field.state.value;
                    const addUri = () => field.handleChange([...uris, ""]);
                    const removeUri = (index: number) => {
                      const updated = uris.filter((_, i) => i !== index);
                      field.handleChange(updated.length > 0 ? updated : [""]);
                    };
                    const updateUri = (index: number, val: string) => {
                      const updated = [...uris];
                      updated[index] = val;
                      field.handleChange(updated);
                    };

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Redirect URIs</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={addUri}
                            className="hover:bg-primary/5 hover:text-primary flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Plus className="size-3" /> Add URI
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {uris.map((uri, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={uri}
                                onChange={(e) =>
                                  updateUri(index, e.target.value)
                                }
                                placeholder="https://example.com/callback"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeUri(index)}
                                disabled={uris.length <= 1}
                                className="text-red-500 hover:bg-red-50/50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-xs font-semibold text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />

                {/* Allowed Origins Field */}
                <form.Field
                  name="allowedOrigins"
                  validators={{
                    onChange: ({ value }) =>
                      value.filter((val) => val.trim().length > 0).length === 0
                        ? "At least one web origin is required"
                        : undefined,
                  }}
                  children={(field) => {
                    const origins = field.state.value;
                    const addOrigin = () =>
                      field.handleChange([...origins, ""]);
                    const removeOrigin = (index: number) => {
                      const updated = origins.filter((_, i) => i !== index);
                      field.handleChange(updated.length > 0 ? updated : [""]);
                    };
                    const updateOrigin = (index: number, val: string) => {
                      const updated = [...origins];
                      updated[index] = val;
                      field.handleChange(updated);
                    };

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Allowed Web Origins (CORS)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={addOrigin}
                            className="hover:bg-primary/5 hover:text-primary flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Plus className="size-3" /> Add Origin
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {origins.map((origin, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={origin}
                                onChange={(e) =>
                                  updateOrigin(index, e.target.value)
                                }
                                placeholder="https://example.com"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeOrigin(index)}
                                disabled={origins.length <= 1}
                                className="text-red-500 hover:bg-red-50/50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-xs font-semibold text-red-500">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </div>

            {/* App Branding & Verification */}
            <div className="mt-2 space-y-4 border-t pt-4">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                App Branding & Verification
              </Label>
              <p className="text-muted-foreground text-[10px] leading-normal">
                Supplying Website URL, Privacy Policy URL, Terms of Service URL, and Publisher Name will automatically verify this client.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <form.Field
                  name="logoUrl"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Logo URL</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. https://example.com/logo.png"
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="publisherName"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Publisher Name</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Mohit Labs"
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="websiteUrl"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Website URL</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. https://example.com"
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="privacyPolicyUrl"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Privacy Policy URL</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. https://example.com/privacy"
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="termsOfServiceUrl"
                  children={(field) => (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={field.name}>Terms of Service URL</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. https://example.com/terms"
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Secret Rotation */}
            {(client.clientType === "CONFIDENTIAL" ||
              client.clientType === "MACHINE") && (
              <div className="mt-2 space-y-2 border-t pt-4">
                <Label className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  Security Credentials
                </Label>
                <div className="flex flex-col justify-between gap-3 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3.5 sm:flex-row sm:items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">
                      Rotate Client Secret
                    </span>
                    <p className="text-muted-foreground text-[10px] leading-normal">
                      This invalidates the current secret immediately and
                      generates a new one.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                    onClick={handleRotateSecret}
                  >
                    Rotate Secret
                  </Button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={actionLoading} className="w-full">
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
