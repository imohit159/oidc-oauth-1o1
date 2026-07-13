"use client";

import * as React from "react";
import Link from "next/link";
import { type OidcClient } from "@/services/client.service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Copy, Check, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRecentClients } from "./hooks/use-overview";

interface RecentClientsTableProps {
  clients: OidcClient[];
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onDelete: (clientId: string) => void;
}

export function RecentClientsTable({
  clients,
  copiedId,
  onCopy,
  onDelete,
}: RecentClientsTableProps) {
  const router = useRouter();
  const { getRelativeTime, getInitials } = useRecentClients();

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground">
            <User className="size-4" />
          </div>
          <h3 className="text-foreground font-bold">
            Recent Clients
          </h3>
        </div>
        <Link
          href="/dashboard/clients"
          className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/75 text-xs font-bold transition-colors inline-flex items-center gap-0.5"
        >
          View all clients &rarr;
        </Link>
      </div>

      <Table className="w-full text-left text-xs border-collapse">
        <TableHeader>
          <TableRow className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider hover:bg-transparent">
            <TableHead className="pb-3 font-semibold h-auto text-muted-foreground pl-0">Client Name</TableHead>
            <TableHead className="pb-3 font-semibold h-auto text-muted-foreground">Type</TableHead>
            <TableHead className="pb-3 font-semibold h-auto text-muted-foreground">Client ID</TableHead>
            <TableHead className="pb-3 font-semibold h-auto text-muted-foreground">Last Updated</TableHead>
            <TableHead className="pb-3 w-8 h-auto pr-0"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {clients.map((client) => (
            <TableRow key={client.id} className="border-none">
              <TableCell className="py-3.5 flex items-center gap-2.5 font-medium text-foreground pl-0 border-none">
                <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                  {getInitials(client.name)}
                </div>
                <span className="font-semibold truncate max-w-[150px] sm:max-w-none" title={client.name}>
                  {client.name}
                </span>
              </TableCell>
              <TableCell className="py-3.5 border-none">
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${client.clientType === "CONFIDENTIAL"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : client.clientType === "PUBLIC"
                      ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                >
                  {client.clientType}
                </span>
              </TableCell>
              <TableCell className="py-3.5 border-none">
                <div className="flex items-center gap-1.5">
                  <code className="font-mono text-foreground bg-muted/5 border border-border px-1.5 py-0.5 rounded text-[10px] truncate max-w-[150px]">
                    {client.clientId}
                  </code>
                  <button
                    onClick={() => onCopy(client.clientId, client.id)}
                    className="text-muted-foreground/70 hover:text-primary transition-colors cursor-pointer"
                  >
                    {copiedId === client.id ? (
                      <Check className="size-3.5 text-green-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </TableCell>
              <TableCell className="py-3.5 text-muted-foreground font-medium border-none">
                {getRelativeTime(client.updatedAt)}
              </TableCell>
              <TableCell className="py-3.5 text-right pr-0 border-none">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                      />
                    }
                  >
                    <MoreVertical className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/clients/${client.clientId}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <Eye className="size-4 text-muted-foreground" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/clients/${client.clientId}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <Pencil className="size-4 text-muted-foreground" />
                      Edit Client
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(client.clientId)}
                      className="gap-2 cursor-pointer text-red-655 focus:bg-red-50 focus:text-red-655 dark:focus:bg-red-950/20"
                    >
                      <Trash2 className="size-4 text-red-550" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
