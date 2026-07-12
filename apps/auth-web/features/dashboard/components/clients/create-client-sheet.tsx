"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

interface CreateClientSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  actionLoading: boolean;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  clientType: "CONFIDENTIAL" | "PUBLIC" | "MACHINE";
  setClientType: (type: "CONFIDENTIAL" | "PUBLIC" | "MACHINE") => void;
  grantTypes: string[];
  toggleGrantType: (grant: string) => void;
  redirectUrisInput: string;
  setRedirectUrisInput: (input: string) => void;
  allowedOriginsInput: string;
  setAllowedOriginsInput: (input: string) => void;
}

export function CreateClientSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  actionLoading,
  name,
  setName,
  description,
  setDescription,
  clientType,
  setClientType,
  grantTypes,
  toggleGrantType,
  redirectUrisInput,
  setRedirectUrisInput,
  allowedOriginsInput,
  setAllowedOriginsInput,
}: CreateClientSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Register Client Application</SheetTitle>
          <SheetDescription>
            Register an application with Zen to start issuing tokens.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
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
                className={`flex h-20 flex-col justify-between rounded-lg border p-3 text-left transition-all ${
                  clientType === "CONFIDENTIAL"
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xs font-bold">Confidential</span>
                <span className="text-muted-foreground text-[9px]">
                  Uses client secret. Secure backends.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setClientType("PUBLIC")}
                className={`flex h-20 flex-col justify-between rounded-lg border p-3 text-left transition-all ${
                  clientType === "PUBLIC"
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xs font-bold">Public</span>
                <span className="text-muted-foreground text-[9px]">
                  No client secret. SPAs / Mobile.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setClientType("MACHINE")}
                className={`flex h-20 flex-col justify-between rounded-lg border p-3 text-left transition-all ${
                  clientType === "MACHINE"
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xs font-bold">Machine</span>
                <span className="text-muted-foreground text-[9px]">
                  M2M. Uses client credentials.
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allowed Grant Types</Label>
            <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
                <input
                  type="checkbox"
                  checked={grantTypes.includes("authorization_code")}
                  onChange={() => toggleGrantType("authorization_code")}
                  className="accent-primary rounded"
                />
                <div>
                  <span className="text-xs font-semibold">
                    Authorization Code
                  </span>
                  <p className="text-muted-foreground text-[10px]">
                    Standard grant for web apps (PKCE recommended for Public).
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
                <input
                  type="checkbox"
                  checked={grantTypes.includes("client_credentials")}
                  onChange={() => toggleGrantType("client_credentials")}
                  className="accent-primary rounded"
                />
                <div>
                  <span className="text-xs font-semibold">
                    Client Credentials
                  </span>
                  <p className="text-muted-foreground text-[10px]">
                    Server-to-server daemon requests.
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
                <input
                  type="checkbox"
                  checked={grantTypes.includes("refresh_token")}
                  onChange={() => toggleGrantType("refresh_token")}
                  className="accent-primary rounded"
                />
                <div>
                  <span className="text-xs font-semibold">Refresh Token</span>
                  <p className="text-muted-foreground text-[10px]">
                    Request offline/refresh tokens for persistent login.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="redirects">
              Allowed Redirect URIs (One per line)
            </Label>
            <textarea
              id="redirects"
              value={redirectUrisInput}
              onChange={(e) => setRedirectUrisInput(e.target.value)}
              placeholder="https://my-app.com/callback&#10;http://localhost:3000/callback"
              className="bg-background focus-visible:ring-primary h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="origins">
              Allowed Web Origins (One per line, optional)
            </Label>
            <textarea
              id="origins"
              value={allowedOriginsInput}
              onChange={(e) => setAllowedOriginsInput(e.target.value)}
              placeholder="https://my-app.com&#10;http://localhost:3000"
              className="bg-background focus-visible:ring-primary h-16 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
            />
          </div>

          <Button type="submit" disabled={actionLoading} className="w-full">
            {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Application
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
