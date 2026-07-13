"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { type CreateClientPayload } from "@/services/client.service";
import { useClients } from "./hooks/use-clients";
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
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ClientFormValues {
  name: string;
  description: string;
  clientType: "CONFIDENTIAL" | "PUBLIC" | "MACHINE";
  grantTypes: string[];
  redirectUris: string[];
  allowedOrigins: string[];
}

export function RegisterClientForm() {
  const router = useRouter();
  const { createClient, actionLoading } = useClients();

  // TanStack Form Setup
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      clientType: "CONFIDENTIAL" as "CONFIDENTIAL" | "PUBLIC" | "MACHINE",
      grantTypes: ["authorization_code", "refresh_token"] as string[],
      redirectUris: ["http://localhost:3000/callback"] as string[],
      allowedOrigins: ["http://localhost:3000"] as string[],
    },
    onSubmit: async ({ value }) => {
      try {
        const uris = value.redirectUris
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        const origins = value.allowedOrigins
          .map((o) => o.trim())
          .filter((o) => o.length > 0);

        const payload: CreateClientPayload = {
          name: value.name,
          description: value.description.trim() || undefined,
          clientType: value.clientType,
          allowedGrantTypes: value.grantTypes,
          redirectUris: uris,
          allowedOrigins: origins.length > 0 ? origins : undefined,
        };

        const result = await createClient(payload);

        sessionStorage.setItem("pending_client_reveal", JSON.stringify({
          clientId: result.clientId,
          clientSecret: result.clientSecret || undefined,
          name: result.name,
        }));
        router.push("/dashboard/clients");
      } catch (e: any) {
        alert(e.message || "Failed to create client application.");
      }
    },
  });

  // STANDARD FORM VIEW
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
            Register Application
          </CardTitle>
          <CardDescription>
            Register a new client application to configure OIDC and OAuth 2.1
            integration settings.
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

            {/* Client Type Field */}
            <form.Field
              name="clientType"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        field.handleChange("CONFIDENTIAL");
                        // Pre-populate standard grant types
                        form.setFieldValue("grantTypes", [
                          "authorization_code",
                          "refresh_token",
                        ]);
                      }}
                      className={`flex h-20 flex-col justify-between rounded-lg border p-3 text-left transition-all ${field.state.value === "CONFIDENTIAL"
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "hover:bg-primary/5 hover:text-primary"
                        }`}
                    >
                      <span className="text-xs font-bold">Confidential</span>
                      <span className="text-muted-foreground text-[9px] leading-tight">
                        Uses secret credentials. Secure server backends.
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        field.handleChange("PUBLIC");
                        // Pre-populate public standard grant types
                        form.setFieldValue("grantTypes", [
                          "authorization_code",
                        ]);
                      }}
                      className={`flex h-20 flex-col justify-between rounded-lg border p-3 text-left transition-all ${field.state.value === "PUBLIC"
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "hover:bg-primary/5 hover:text-primary"
                        }`}
                    >
                      <span className="text-xs font-bold">Public</span>
                      <span className="text-muted-foreground text-[9px] leading-tight">
                        No client secret. SPA Web Apps / Mobile.
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        field.handleChange("MACHINE");
                        // Machine to machine grant type
                        form.setFieldValue("grantTypes", [
                          "client_credentials",
                        ]);
                      }}
                      className={`flex h-20 flex-col justify-between rounded-lg border p-3 text-left transition-all ${field.state.value === "MACHINE"
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "hover:bg-primary/5 hover:text-primary"
                        }`}
                    >
                      <span className="text-xs font-bold">Machine</span>
                      <span className="text-muted-foreground text-[9px] leading-tight">
                        M2M integrations. Uses client credentials.
                      </span>
                    </button>
                  </div>
                </div>
              )}
            />

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

            {/* Submit Button */}
            <Button type="submit" disabled={actionLoading} className="w-full">
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Register Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
