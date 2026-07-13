"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type OidcClient } from "@/services/client.service";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Check,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  FileCode,
} from "lucide-react";
import { CLIENT_TYPE_BADGE, GRANT_TYPE_BADGE } from "./client-badge-config";

// ─── Props ─────────────────────────────────────────────────────────────────

interface ClientListProps {
  clients: OidcClient[];
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onDelete: (clientId: string) => void;
  onRegenerateSecret?: (clientId: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ClientList({
  clients,
  copiedId,
  onCopy,
  onDelete,
  onRegenerateSecret,
}: ClientListProps) {
  const router = useRouter();
  const [copiedRowId, setCopiedRowId] = React.useState<string | null>(null);
  const [copiedJson, setCopiedJson] = React.useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, clientId: string, id: string) => {
    e.stopPropagation();
    onCopy(clientId, id);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  const handleCopyJson = (e: React.MouseEvent, client: OidcClient) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(client, null, 2));
    setCopiedJson(client.id);
    setTimeout(() => setCopiedJson(null), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800 bg-muted/5">
            <TableHead className="pl-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Application
            </TableHead>
            <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Type
            </TableHead>
            <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Client ID
            </TableHead>
            <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Grant Types
            </TableHead>
            <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Created
            </TableHead>
            <TableHead className="pr-5 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const typeBadge = CLIENT_TYPE_BADGE[client.clientType];
            const isCopied = copiedRowId === client.id || copiedId === client.id;

            return (
              <TableRow
                key={client.id}
                onClick={() => router.push(`/dashboard/clients/${client.clientId}`)}
                className="cursor-pointer border-zinc-100 dark:border-zinc-800/80 hover:bg-muted/5 transition-colors"
              >
                {/* Name + Description */}
                <TableCell className="pl-5 py-4 max-w-[220px]">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                      {client.name}
                    </p>
                    {client.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {client.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Type Badge */}
                <TableCell className="py-4">
                  <Badge variant="outline" className={typeBadge.className}>
                    <span className={`size-1.5 rounded-full ${typeBadge.dot}`} />
                    {typeBadge.label}
                  </Badge>
                </TableCell>

                {/* Client ID + Copy */}
                <TableCell
                  className="py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 bg-muted/5 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-1 w-fit">
                    <code className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[140px] truncate">
                      {client.clientId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-5 shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-transparent"
                      onClick={(e) => handleCopyId(e, client.clientId, client.id)}
                    >
                      {isCopied ? (
                        <Check className="size-3 text-green-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>

                {/* Grant Types */}
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {client.allowedGrantTypes.map((grant) => {
                      const badge = GRANT_TYPE_BADGE[grant] ?? {
                        label: grant.replace(/_/g, " "),
                        variant: "outline" as const,
                        className: "",
                      };
                      return (
                        <Badge
                          key={grant}
                          variant={badge.variant}
                          className={`text-[10px] ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell className="py-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  {new Date(client.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="pr-5 py-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-8 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/clients/${client.clientId}`)
                        }
                        className="gap-2 cursor-pointer"
                      >
                        <Eye className="size-4 text-zinc-500" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/clients/${client.clientId}`)
                        }
                        className="gap-2 cursor-pointer"
                      >
                        <Pencil className="size-4 text-zinc-500" />
                        Edit Client
                      </DropdownMenuItem>
                      {(client.clientType === "CONFIDENTIAL" ||
                        client.clientType === "MACHINE") &&
                        onRegenerateSecret && (
                          <DropdownMenuItem
                            onClick={() => onRegenerateSecret(client.clientId)}
                            className="gap-2 cursor-pointer"
                          >
                            <RefreshCw className="size-4 text-zinc-500" />
                            Regenerate Secret
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(client.clientId, client.id);
                          setCopiedRowId(client.id);
                          setTimeout(() => setCopiedRowId(null), 2000);
                        }}
                        className="gap-2 cursor-pointer justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Copy className="size-4 text-zinc-500" />
                          Copy Client ID
                        </span>
                        {copiedRowId === client.id && (
                          <Check className="size-3 text-green-500" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleCopyJson(e, client)}
                        className="gap-2 cursor-pointer justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <FileCode className="size-4 text-zinc-500" />
                          Copy JSON
                        </span>
                        {copiedJson === client.id && (
                          <Check className="size-3 text-green-500" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(client.clientId)}
                        variant="destructive"
                        className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/20"
                      >
                        <Trash2 className="size-4 text-red-500" />
                        Delete Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
