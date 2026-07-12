"use client";

import * as React from "react";
import { type OidcClient } from "@/services/client.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Settings2 } from "lucide-react";

interface ClientCardProps {
  client: OidcClient;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onOpenEdit: (client: OidcClient) => void;
}

export function ClientCard({
  client,
  copiedId,
  onCopy,
  onOpenEdit,
}: ClientCardProps) {
  return (
    <Card className="hover:border-primary/20 group flex flex-col justify-between transition-all">
      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                client.clientType === "CONFIDENTIAL"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                  : client.clientType === "PUBLIC"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {client.clientType}
            </span>
            <span className="text-muted-foreground text-xs">
              {new Date(client.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <h3 className="group-hover:text-primary truncate text-lg font-bold transition-colors">
              {client.name}
            </h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 h-8 text-xs">
              {client.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider">
              CLIENT ID
            </span>
            <div className="bg-muted/50 flex items-center gap-2 rounded border p-2">
              <code className="flex-1 truncate font-mono text-xs">
                {client.clientId}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6"
                onClick={() => onCopy(client.clientId, client.id)}
              >
                {copiedId === client.id ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1.5">
              {client.allowedGrantTypes.map((grant) => (
                <span
                  key={grant}
                  className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium"
                >
                  {grant.replace("_", " ")}
                </span>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenEdit(client)}
              title="Edit application settings"
            >
              <Settings2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
