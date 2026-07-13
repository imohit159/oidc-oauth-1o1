"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { adminService, type AuditLog, type PaginationMeta } from "@/services/admin.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Copy,
  Check,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export function AuditLogsView() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [pagination, setPagination] = React.useState<PaginationMeta | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  // Copy helpers
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Metadata inspect dialog state
  const [activeMetaLog, setActiveMetaLog] = React.useState<AuditLog | null>(null);

  // Restrict access to administrators only
  React.useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const fetchLogs = React.useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.listAuditLogs({ page: pageNum, limit: 12 });
      if (response) {
        setLogs(response.items || []);
        setPagination(response.pagination || null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load system audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchLogs(page);
    }
  }, [page, user, fetchLogs]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("VERIFY")) {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    }
    if (act.includes("SUSPEND") || act.includes("DELETE") || act.includes("REVOKE")) {
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    }
    if (act.includes("REGISTER") || act.includes("CREATE")) {
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
    }
    return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20";
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="border-none pb-0 text-3xl font-bold tracking-tight">
          System Audit Logs
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time records of security, authorization, and administration events.
        </p>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="border-red-200 bg-red-50 dark:bg-red-950/10 p-6 rounded-lg text-center space-y-2">
          <p className="font-semibold text-red-500">{error}</p>
          <Button size="sm" onClick={() => fetchLogs(page)}>
            Retry
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center space-y-3 bg-card">
          <div className="bg-muted inline-flex p-3 rounded-full text-muted-foreground">
            <Activity className="size-6" />
          </div>
          <h3 className="font-bold text-lg">No logs found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            No administrative or security events have been logged in the system yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800 bg-muted/5">
                  <TableHead className="pl-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Timestamp
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Action
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actor User ID
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Target Entity
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    IP / Agent
                  </TableHead>
                  <TableHead className="pr-5 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const dateStr = new Date(log.createdAt).toLocaleString();
                  const isCopied = copiedId === log.id;

                  return (
                    <TableRow
                      key={log.id}
                      className="border-zinc-100 dark:border-zinc-800/80 hover:bg-muted/5 transition-colors text-sm"
                    >
                      {/* Timestamp */}
                      <TableCell className="pl-5 py-4 font-medium whitespace-nowrap">
                        {dateStr}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-bold tracking-wider whitespace-nowrap uppercase py-0.5", getActionBadgeColor(log.action))}
                        >
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      {/* Actor ID */}
                      <TableCell className="py-4">
                        {log.actorUserId ? (
                          <div className="flex items-center gap-1.5 bg-muted/5 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-0.5 w-fit">
                            <code className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 max-w-[80px] truncate">
                              {log.actorUserId}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-4 shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-transparent"
                              onClick={() => handleCopy(log.actorUserId!, log.id)}
                            >
                              {isCopied ? (
                                <Check className="size-2.5 text-green-500" />
                              ) : (
                                <Copy className="size-2.5" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs italic">System</span>
                        )}
                      </TableCell>

                      {/* Target Entity */}
                      <TableCell className="py-4 whitespace-nowrap">
                        {log.entityType && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              {log.entityType}
                            </span>
                            {log.entityId && (
                              <code className="font-mono text-[9px] text-muted-foreground truncate max-w-[100px]" title={log.entityId}>
                                {log.entityId}
                              </code>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          {isSuccess ? (
                            <ShieldCheck className="size-4 text-emerald-500" />
                          ) : (
                            <ShieldAlert className="size-4 text-rose-500" />
                          )}
                          <span
                            className={cn(
                              "text-xs font-bold",
                              isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {log.status || "UNKNOWN"}
                          </span>
                        </div>
                      </TableCell>

                      {/* IP / User Agent */}
                      <TableCell className="py-4 max-w-[150px]">
                        <div className="flex flex-col gap-0.5 truncate text-[11px] text-muted-foreground">
                          <span className="font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                            {log.ipAddress || "0.0.0.0"}
                          </span>
                          <span className="truncate" title={log.userAgent || "Unknown Agent"}>
                            {log.userAgent || "Unknown Agent"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Metadata Inspector */}
                      <TableCell className="pr-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-8 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ml-auto"
                          disabled={!log.metadata}
                          onClick={() => setActiveMetaLog(log)}
                          title="Inspect Metadata"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <span className="text-xs text-muted-foreground">
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalItems} events logged)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 gap-1 font-semibold"
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 gap-1 font-semibold"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metadata Inspector Dialog */}
      {activeMetaLog && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setActiveMetaLog(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Inspect Log Metadata
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detailed runtime values saved for log reference <strong>{activeMetaLog.id}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-zinc-950 text-zinc-50 border border-zinc-800 dark:border-zinc-800 rounded-lg p-4 overflow-auto max-h-[400px]">
              <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
                {JSON.stringify(activeMetaLog.metadata, null, 2)}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
