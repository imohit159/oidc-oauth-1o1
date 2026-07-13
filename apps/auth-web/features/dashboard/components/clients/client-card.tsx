"use client";

import * as React from "react";
import { type OidcClient } from "@/services/client.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Eye,
  Pencil,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  FileCode,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CLIENT_TYPE_BADGE, GRANT_TYPE_BADGE } from "./client-badge-config";

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface ClientCardProps {
  client: OidcClient;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onDelete: (clientId: string) => void;
  onRegenerateSecret?: (clientId: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ClientCard({
  client,
  copiedId,
  onCopy,
  onDelete,
  onRegenerateSecret,
}: ClientCardProps) {
  const router = useRouter();
  const [localCopied, setLocalCopied] = React.useState<"id" | "json" | null>(null);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(client.clientId, client.id);
    setLocalCopied("id");
    setTimeout(() => setLocalCopied(null), 2000);
  };

  const handleCopyJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(client, null, 2));
    setLocalCopied("json");
    setTimeout(() => setLocalCopied(null), 2000);
  };

  const typeBadge = CLIENT_TYPE_BADGE[client.clientType];

  return (
    <Card
      onClick={() => router.push(`/dashboard/clients/${client.clientId}`)}
      className="cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all border border-zinc-200 dark:border-zinc-800 rounded-xl bg-card shadow-xs py-0 gap-0"
    >
      {/* ── Header: badge + name + desc on left, ⋮ on right ── */}
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex-1 min-w-0 space-y-1">
          <Badge variant="outline" className={typeBadge.className}>
            <span className={`size-1.5 rounded-full ${typeBadge.dot}`} />
            {typeBadge.label}
          </Badge>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-1.5">
            <span className="truncate">{client.name}</span>
            {client.verificationStatus === "TRUSTED" && (
              <span title="Trusted Client">
                <ShieldCheck className="size-4 text-primary fill-primary/10 shrink-0" />
              </span>
            )}
            {client.verificationStatus === "VERIFIED" && (
              <span title="Verified Client">
                <ShieldCheck className="size-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
              </span>
            )}
          </CardTitle>
          <CardDescription className="line-clamp-1 text-xs">
            {client.description || "No description"}
          </CardDescription>
        </div>

        {/* CardAction: self-aligns to top-right via grid */}
        <CardAction onClick={(e) => e.stopPropagation()}>
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
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/clients/${client.clientId}`)}
                className="gap-2 cursor-pointer"
              >
                <Eye className="size-4 text-zinc-500" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/clients/${client.clientId}`)}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="size-4 text-zinc-500" />
                Edit Client
              </DropdownMenuItem>
              {(client.clientType === "CONFIDENTIAL" || client.clientType === "MACHINE") &&
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
                  setLocalCopied("id");
                  setTimeout(() => setLocalCopied(null), 2000);
                }}
                className="gap-2 cursor-pointer justify-between"
              >
                <span className="flex items-center gap-2">
                  <Copy className="size-4 text-zinc-500" />
                  Copy Client ID
                </span>
                {localCopied === "id" && <Check className="size-3 text-green-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyJson}
                className="gap-2 cursor-pointer justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="size-4 text-zinc-500" />
                  Copy JSON
                </span>
                {localCopied === "json" && <Check className="size-3 text-green-500" />}
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
        </CardAction>
      </CardHeader>

      {/* ── Content: Client ID field ── */}
      <CardContent
        className="px-5 pt-4 pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-muted/5 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between font-mono text-xs text-zinc-500 dark:text-zinc-400">
          <span className="truncate pr-2 select-all" title={client.clientId}>
            {client.clientId.length > 24
              ? `${client.clientId.slice(0, 18)}...`
              : client.clientId}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <Info className="size-3.5" />
                  </button>
                }
              />
              <TooltipContent className="p-2 max-w-[200px] text-center font-sans">
                Unique identifier used for OAuth and OIDC requests.
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              onClick={handleCopyId}
            >
              {localCopied === "id" || copiedId === client.id ? (
                <Check className="size-3 text-green-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* ── Footer: grant badges + updated date ── */}
      <CardFooter className="px-5 py-4 bg-transparent border-t border-zinc-100 dark:border-zinc-800/80 flex-col items-start gap-2">
        <div className="flex flex-wrap gap-1.5">
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
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Updated {formatRelativeTime(client.updatedAt || client.createdAt)}
        </p>
      </CardFooter>
    </Card>
  );
}
