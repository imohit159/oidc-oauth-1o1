"use client";

import * as React from "react";
import { type OidcClient } from "@/services/client.service";
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
import { Loader2, Trash2 } from "lucide-react";

interface EditClientSheetProps {
  client: OidcClient | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (clientId: string) => void;
  actionLoading: boolean;
  editName: string;
  setEditName: (name: string) => void;
  editDescription: string;
  setEditDescription: (desc: string) => void;
  editGrantTypes: string[];
  toggleGrantType: (grant: string) => void;
  editRedirectUrisInput: string;
  setEditRedirectUrisInput: (input: string) => void;
  editAllowedOriginsInput: string;
  setEditAllowedOriginsInput: (input: string) => void;
}

export function EditClientSheet({
  client,
  onClose,
  onSubmit,
  onDelete,
  actionLoading,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editGrantTypes,
  toggleGrantType,
  editRedirectUrisInput,
  setEditRedirectUrisInput,
  editAllowedOriginsInput,
  setEditAllowedOriginsInput,
}: EditClientSheetProps) {
  return (
    <Sheet open={client !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {client && (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle>Edit Application</SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDelete(client.clientId)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete App
                </Button>
              </div>
              <SheetDescription>
                Modify configurations for client ID:{" "}
                <code className="text-foreground bg-muted rounded p-0.5 font-mono text-xs font-bold">
                  {client.clientId}
                </code>
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={onSubmit} className="space-y-4 py-4">
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
                  value={client.clientType}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed font-bold"
                />
                <p className="text-muted-foreground text-[10px]">
                  The client type cannot be changed after registration.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Allowed Grant Types</Label>
                <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
                    <input
                      type="checkbox"
                      checked={editGrantTypes.includes("authorization_code")}
                      onChange={() => toggleGrantType("authorization_code")}
                      className="accent-primary rounded"
                    />
                    <span className="text-xs">Authorization Code</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
                    <input
                      type="checkbox"
                      checked={editGrantTypes.includes("client_credentials")}
                      onChange={() => toggleGrantType("client_credentials")}
                      className="accent-primary rounded"
                    />
                    <span className="text-xs">Client Credentials</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
                    <input
                      type="checkbox"
                      checked={editGrantTypes.includes("refresh_token")}
                      onChange={() => toggleGrantType("refresh_token")}
                      className="accent-primary rounded"
                    />
                    <span className="text-xs">Refresh Token</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editRedirects">
                  Allowed Redirect URIs (One per line)
                </Label>
                <textarea
                  id="editRedirects"
                  value={editRedirectUrisInput}
                  onChange={(e) => setEditRedirectUrisInput(e.target.value)}
                  placeholder="http://localhost:3000/callback"
                  className="bg-background focus-visible:ring-primary h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editOrigins">
                  Allowed Web Origins (One per line, optional)
                </Label>
                <textarea
                  id="editOrigins"
                  value={editAllowedOriginsInput}
                  onChange={(e) => setEditAllowedOriginsInput(e.target.value)}
                  placeholder="http://localhost:3000"
                  className="bg-background focus-visible:ring-primary h-16 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-hidden"
                />
              </div>

              <Button type="submit" disabled={actionLoading} className="w-full">
                {actionLoading && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
