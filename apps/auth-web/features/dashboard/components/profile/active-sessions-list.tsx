"use client";

import * as React from "react";
import { sessionService, type UserSession } from "@/services/session.service";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  AlertTriangle,
  Loader2,
  Laptop,
} from "lucide-react";

export function ActiveSessionsList() {
  const [sessions, setSessions] = React.useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(false);
  const [sessionsError, setSessionsError] = React.useState<string | null>(null);
  const [revokeLoadingId, setRevokeLoadingId] = React.useState<string | null>(
    null,
  );
  const [revokeAllLoading, setRevokeAllLoading] = React.useState(false);

  // Fetch active sessions
  const fetchSessions = React.useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await sessionService.listSessions();
      setSessions(data || []);
    } catch (e: any) {
      setSessionsError(e.message || "Failed to load active sessions.");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Revoke Specific Session
  const handleRevokeSession = async (sessionId: string) => {
    const isConfirmed = confirm(
      "Are you sure you want to log out of this session/device?",
    );
    if (!isConfirmed) return;

    setRevokeLoadingId(sessionId);
    try {
      await sessionService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      alert(e.message || "Failed to terminate session.");
    } finally {
      setRevokeLoadingId(null);
    }
  };

  // Revoke All Other Sessions
  const handleRevokeAllOtherSessions = async () => {
    const isConfirmed = confirm(
      "Are you sure you want to log out of ALL other devices? This will terminate all active OIDC refresh tokens except this browser.",
    );
    if (!isConfirmed) return;

    setRevokeAllLoading(true);
    try {
      await apiClient.post("/api/v1/sessions/logout-all");
      // Keep only current session
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      alert("Successfully logged out of all other devices.");
    } catch (e: any) {
      alert(e.message || "Failed to revoke all other sessions.");
    } finally {
      setRevokeAllLoading(false);
    }
  };

  // Helper to pick an icon from the raw User-Agent string
  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return Globe;

    const uaLower = ua.toLowerCase();

    if (
      uaLower.includes("mobi") ||
      uaLower.includes("android") ||
      uaLower.includes("iphone")
    ) {
      return Smartphone;
    } else if (uaLower.includes("postman") || uaLower.includes("curl")) {
      return Monitor;
    }
    return Laptop;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <span className="text-sm font-bold">Revoke Sessions</span>
            <p className="text-muted-foreground mt-0.5 max-w-xl text-xs">
              This terminates any other device's refresh token. If you notice an
              unrecognized device or IP address, revoke the session immediately.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={
            revokeAllLoading ||
            sessions.filter((s) => !s.isCurrent).length === 0
          }
          onClick={handleRevokeAllOtherSessions}
          className="border-primary font-semibold"
        >
          {revokeAllLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Revoke All Others
        </Button>
      </div>

      {sessionsLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : sessionsError ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="space-y-2 p-6 text-center">
            <p className="font-semibold text-red-500">{sessionsError}</p>
            <Button size="sm" onClick={fetchSessions}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.userAgent);
            const displayLabel = session.deviceName || "Unknown Device";
            return (
              <Card
                key={session.id}
                className={
                  session.isCurrent
                    ? "border-primary/25 bg-primary/5 border-2"
                    : ""
                }
              >
                <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-lg p-2.5 ${session.isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <DeviceIcon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {displayLabel}
                        </span>
                        {session.isCurrent && (
                          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-bold">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                        <span>
                          Created:{" "}
                          {new Date(session.createdAt).toLocaleString()}
                        </span>
                        {session.lastActiveAt && (
                          <>
                            <span>•</span>
                            <span>
                              Last Active:{" "}
                              {new Date(session.lastActiveAt).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {!session.isCurrent && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex w-full items-center gap-1 md:w-auto"
                        disabled={revokeLoadingId === session.id}
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        {revokeLoadingId === session.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Log Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
