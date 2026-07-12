"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth.store";
import { sessionService, type UserSession } from "@/services/session.service";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Save,
  Laptop,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<"info" | "sessions">("info");

  // Profile details state
  const [givenName, setGivenName] = React.useState(user?.given_name || "");
  const [familyName, setFamilyName] = React.useState(user?.family_name || "");
  const [email, setEmail] = React.useState(user?.email || "");

  // Update profile states
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

  // Sessions state
  const [sessions, setSessions] = React.useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(false);
  const [sessionsError, setSessionsError] = React.useState<string | null>(null);
  const [revokeLoadingId, setRevokeLoadingId] = React.useState<string | null>(
    null,
  );
  const [revokeAllLoading, setRevokeAllLoading] = React.useState(false);

  // Synchronize store values
  React.useEffect(() => {
    if (user) {
      setGivenName(user.given_name);
      setFamilyName(user.family_name);
      setEmail(user.email);
    }
  }, [user]);

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

  // Fetch sessions on tab switch
  React.useEffect(() => {
    if (activeTab === "sessions") {
      fetchSessions();
    }
  }, [activeTab, fetchSessions]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!givenName.trim() || !familyName.trim()) return;

    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const result = await apiClient.patch<{ user: any }>(
        "/api/v1/identity/users/me",
        {
          givenName: givenName.trim(),
          familyName: familyName.trim(),
        },
      );

      if (result?.user) {
        // Sync to Zustand store state dynamically
        useAuthStore.setState({ user: result.user });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (e: any) {
      alert(e.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your identity profile and active login sessions.
        </p>
      </div>

      {/* Tabs Toggles */}
      <div className="border-primary/10 flex border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "info"
              ? "border-primary text-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "sessions"
              ? "border-primary text-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          Active Sessions
        </button>
      </div>

      {/* TAB 1: PROFILE INFO */}
      {activeTab === "info" && (
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="border-primary/5 flex items-center gap-3 border-b pb-3">
                  <div className="bg-primary/5 text-primary rounded-full p-2">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Basic Information</h3>
                    <p className="text-muted-foreground text-xs">
                      Modify your first name and last name.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="givenName">First Name</Label>
                    <Input
                      id="givenName"
                      value={givenName}
                      onChange={(e) => setGivenName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="familyName">Last Name</Label>
                    <Input
                      id="familyName"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profileEmail">Email Address</Label>
                  <Input
                    id="profileEmail"
                    value={email}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed font-semibold"
                  />
                  <p className="text-muted-foreground text-[10px]">
                    Email address cannot be changed currently.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {profileSuccess && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-500">
                      <CheckCircle className="size-4" />
                      Profile updated successfully!
                    </span>
                  )}
                  <div className="flex-1 text-right">
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="ml-auto flex items-center gap-2"
                    >
                      {isUpdatingProfile ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* MOCK PASSWORD MANAGEMENT CONTAINER */}
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="border-primary/5 flex items-center gap-3 border-b pb-3">
                <div className="bg-primary/5 text-primary rounded-full p-2">
                  <User className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold">Security & Password</h3>
                  <p className="text-muted-foreground text-xs">
                    Manage your credentials and security keys.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <span className="text-sm font-semibold">Change Password</span>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    It is recommended to use a unique password that is at least
                    12 characters long.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    alert(
                      "Password reset link has been dispatched to your email address.",
                    )
                  }
                >
                  Request Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <span className="text-sm font-bold">Revoke Sessions</span>
                <p className="text-muted-foreground mt-0.5 max-w-xl text-xs">
                  This terminates any other device's refresh token. If you
                  notice an unrecognized device or IP address, revoke the
                  session immediately.
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
              {revokeAllLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Revoke All Others
            </Button>
          </div>

          {sessionsLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="text-muted-foreground size-8 animate-spin" />.
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
                                  {new Date(
                                    session.lastActiveAt,
                                  ).toLocaleString()}
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
      )}
    </div>
  );
}
