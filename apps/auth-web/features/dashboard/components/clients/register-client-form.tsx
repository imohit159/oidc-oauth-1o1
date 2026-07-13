"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { type CreateClientPayload } from "@/services/client.service";
import { useClients } from "./hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CLIENT_TYPES, GRANT_TYPES_BY_CLIENT } from "@/constants/clients";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ClientFormValues {
  name: string;
  description: string;
  clientType: "CONFIDENTIAL" | "PUBLIC" | "MACHINE";
  grantTypes: string[];
  redirectUris: string[];
  allowedOrigins: string[];
}

// ─── Sub-components ─────────────────────────────────────────────────────────

/** A titled section inside the single form card, optionally separated by a top divider. */
function FormSection({
  title,
  description,
  children,
  divider = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <>
      {divider && <div className="h-px bg-border/50" />}
      <div className="px-5 py-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {children}
      </div>
    </>
  );
}

/** Reusable inline URI / origin list with add-below pattern. */
function UriListField({
  label,
  sublabel,
  values,
  placeholder,
  addLabel,
  onAdd,
  onRemove,
  onUpdate,
  error,
}: {
  label: string;
  sublabel?: string;
  values: string[];
  placeholder: string;
  addLabel: string;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}{" "}
        {sublabel && (
          <span className="text-muted-foreground font-normal text-xs">{sublabel}</span>
        )}
      </Label>
      <div className="space-y-1.5">
        {values.map((val, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/5 px-3 py-1.5"
          >
            <input
              className="flex-1 min-w-0 bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/40"
              value={val}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              disabled={values.length <= 1}
              className="flex-none text-muted-foreground/50 hover:text-red-500 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              aria-label="Remove"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus className="size-3" />
        {addLabel}
      </button>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function RegisterClientForm() {
  const router = useRouter();
  const { createClient, actionLoading } = useClients();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      clientType: "CONFIDENTIAL" as ClientFormValues["clientType"],
      grantTypes: ["authorization_code", "refresh_token"] as string[],
      redirectUris: ["http://localhost:3000/callback"] as string[],
      allowedOrigins: ["http://localhost:3000"] as string[],
    },
    onSubmit: async ({ value }) => {
      try {
        const uris = value.redirectUris.map((u) => u.trim()).filter(Boolean);
        const origins = value.allowedOrigins.map((o) => o.trim()).filter(Boolean);

        const payload: CreateClientPayload = {
          name: value.name,
          description: value.description.trim() || undefined,
          clientType: value.clientType,
          allowedGrantTypes: value.grantTypes,
          redirectUris: uris,
          allowedOrigins: origins.length > 0 ? origins : undefined,
        };

        const result = await createClient(payload);
        sessionStorage.setItem(
          "pending_client_reveal",
          JSON.stringify({
            clientId: result.clientId,
            clientSecret: result.clientSecret || undefined,
            name: result.name,
          })
        );
        router.push("/dashboard/clients");
      } catch (e: any) {
        alert(e.message || "Failed to create client application.");
      }
    },
  });

  return (
    <div className="w-full max-w-[860px] mx-auto space-y-5">

      {/* Back */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Register Application</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create an OAuth / OIDC client for your application.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* ── Single card container ───────────────────────────────────── */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">

          {/* ── 1. Basic Information ──────────────────────────────────── */}
          <FormSection
            title="Basic Information"
            description="Identify your application with a name and optional description."
            divider={false}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length < 2 ? "At least 2 characters" : undefined,
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Application Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Grafana Dashboards"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Description{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Purpose or details about this app"
                    />
                  </div>
                )}
              />
            </div>
          </FormSection>

          {/* ── 2. Client Type ────────────────────────────────────────── */}
          <FormSection
            title="Client Type"
            description="Choose how your application authenticates."
          >
            <form.Field
              name="clientType"
              children={(field) => (
                <div className="grid grid-cols-3 gap-2">
                  {CLIENT_TYPES.map((type) => {
                    const isSelected = field.state.value === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          field.handleChange(type.value);
                          form.setFieldValue("grantTypes", type.defaultGrants as string[]);
                        }}
                        className={cn(
                          "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border/60 hover:border-border hover:bg-muted/5"
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold leading-snug",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {type.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          {type.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </FormSection>

          {/* ── 3. Grant Types ────────────────────────────────────────── */}
          <form.Subscribe
            selector={(state) => state.values.clientType}
            children={(clientType) => {
              const availableGrants = GRANT_TYPES_BY_CLIENT[clientType] ?? [];
              return (
                <FormSection
                  title="Grant Types"
                  description="Select the OAuth flows this client is allowed to use."
                >
                  <form.Field
                    name="grantTypes"
                    validators={{
                      onChange: ({ value }) =>
                        value.length === 0
                          ? "Select at least one grant type"
                          : undefined,
                    }}
                    children={(field) => {
                      const values = field.state.value;
                      const toggle = (grant: string) => {
                        field.handleChange(
                          values.includes(grant)
                            ? values.filter((v) => v !== grant)
                            : [...values, grant]
                        );
                      };
                      return (
                        <div>
                          {availableGrants.map((grant, idx) => {
                            const checked = values.includes(grant.value);
                            return (
                              <React.Fragment key={grant.value}>
                                <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(grant.value)}
                                    className="accent-primary flex-none mt-0.5"
                                  />
                                  <span>
                                    <span className="block text-sm font-medium text-foreground leading-snug">
                                      {grant.label}
                                    </span>
                                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                                      {grant.description}
                                    </span>
                                  </span>
                                </label>
                                {idx < availableGrants.length - 1 && (
                                  <div className="h-px bg-border/40" />
                                )}
                              </React.Fragment>
                            );
                          })}
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-xs text-red-500 pt-1">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                </FormSection>
              );
            }}
          />

          {/* ── 4. Application URLs (hidden for MACHINE) ──────────────── */}
          <form.Subscribe
            selector={(state) => state.values.clientType}
            children={(clientType) =>
              clientType !== "MACHINE" ? (
                <FormSection
                  title="Application URLs"
                  description="Where users are redirected and which origins are allowed for CORS."
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <form.Field
                      name="redirectUris"
                      validators={{
                        onChange: ({ value }) =>
                          value.filter((v) => v.trim().length > 0).length === 0
                            ? "At least one redirect URI is required"
                            : undefined,
                      }}
                      children={(field) => {
                        const uris = field.state.value;
                        return (
                          <UriListField
                            label="Redirect URIs"
                            values={uris}
                            placeholder="https://example.com/callback"
                            addLabel="Add another URI"
                            onAdd={() => field.handleChange([...uris, ""])}
                            onRemove={(i) => {
                              const updated = uris.filter((_, idx) => idx !== i);
                              field.handleChange(updated.length > 0 ? updated : [""]);
                            }}
                            onUpdate={(i, v) => {
                              const updated = [...uris];
                              updated[i] = v;
                              field.handleChange(updated);
                            }}
                            error={field.state.meta.errors.join(", ") || undefined}
                          />
                        );
                      }}
                    />
                    <form.Field
                      name="allowedOrigins"
                      children={(field) => {
                        const origins = field.state.value;
                        return (
                          <UriListField
                            label="Allowed Origins"
                            sublabel="(CORS)"
                            values={origins}
                            placeholder="https://example.com"
                            addLabel="Add another origin"
                            onAdd={() => field.handleChange([...origins, ""])}
                            onRemove={(i) => {
                              const updated = origins.filter((_, idx) => idx !== i);
                              field.handleChange(updated.length > 0 ? updated : [""]);
                            }}
                            onUpdate={(i, v) => {
                              const updated = [...origins];
                              updated[i] = v;
                              field.handleChange(updated);
                            }}
                            error={field.state.meta.errors.join(", ") || undefined}
                          />
                        );
                      }}
                    />
                  </div>
                </FormSection>
              ) : null
            }
          />
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/clients")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={actionLoading}
            className="min-w-[150px] h-10"
          >
            {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Register Client
          </Button>
        </div>
      </form>
    </div>
  );
}
