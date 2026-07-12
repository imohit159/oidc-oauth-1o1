"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { clientService } from "@/services/client.service";
import { consentService } from "@/services/consent.service";
import { sessionService } from "@/services/session.service";
import {
  KeyRound,
  ShieldCheck,
  Activity,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const { user } = useAuthStore();
  const [copied, setCopied] = React.useState(false);
  const [stats, setStats] = React.useState({
    clients: 0,
    consents: 0,
    sessions: 0,
    loading: true,
  });

  const apiBaseUrl =
    typeof window !== "undefined"
      ? (window as any).env?.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      : "http://localhost:8000";

  const discoveryUrl = `${apiBaseUrl}/.well-known/openid-configuration`;

  React.useEffect(() => {
    async function loadStats() {
      try {
        const [clients, consents, sessions] = await Promise.all([
          clientService.listClients(),
          consentService.listConsents(),
          sessionService.listSessions(),
        ]);
        setStats({
          clients: clients.length,
          consents: consents.length,
          sessions: sessions.length,
          loading: false,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setStats((s) => ({ ...s, loading: false }));
      }
    }
    loadStats();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(discoveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Welcome Banner */}
      <div className="from-primary/10 via-background/50 to-background relative overflow-hidden rounded-2xl border bg-linear-to-r p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="bg-primary text-primary-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            <span>Zen OIDC Platform</span>
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            {getGreeting()}
            {user?.given_name ? `, ${user.given_name}` : ""}!
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            Welcome to your developer console. Configure secure OAuth 2.1
            authentication and OpenID Connect identity provider layers for your
            projects.
          </p>
        </div>
        {/* Elegant Background decoration */}
        <div className="bg-primary/5 pointer-events-none absolute top-[-50%] right-[-10%] bottom-[-50%] w-[350px] rounded-full blur-[120px]" />
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Clients Card */}
        <div className="group bg-card hover:border-primary relative rounded-xl border p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Registered Clients
            </span>
            <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-lg p-2.5 transition-colors">
              <KeyRound className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-bold tracking-tight">
              {stats.loading ? (
                <span className="bg-muted inline-block h-8 w-12 animate-pulse rounded" />
              ) : (
                stats.clients
              )}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              Applications & API Consumers
            </span>
            <Link
              href="/dashboard/clients"
              className="text-accent inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              Manage Clients
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Authorized Apps Card */}
        <div className="group bg-card hover:border-primary relative rounded-xl border p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Authorized Applications
            </span>
            <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-lg p-2.5 transition-colors">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-bold tracking-tight">
              {stats.loading ? (
                <span className="bg-muted inline-block h-8 w-12 animate-pulse rounded" />
              ) : (
                stats.consents
              )}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              Granted permissions & scopes
            </span>
            <Link
              href="/dashboard/authorized-apps"
              className="text-accent inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              View Authorizations
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Active Sessions Card */}
        <div className="group bg-card hover:border-primary relative rounded-xl border p-5 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Active Sessions
            </span>
            <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-lg p-2.5 transition-colors">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-bold tracking-tight">
              {stats.loading ? (
                <span className="bg-muted inline-block h-8 w-12 animate-pulse rounded" />
              ) : (
                stats.sessions
              )}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              Active sessions across devices
            </span>
            <Link
              href="/dashboard/profile"
              className="text-accent inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              Manage Sessions
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Info Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* OIDC Discovery Endpoint Widget */}
        <div className="bg-card flex flex-col gap-4 rounded-xl border p-5 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <ExternalLink className="size-4" />
            </div>
            <h3 className="text-foreground font-semibold">
              Discovery Endpoint
            </h3>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Standard client libraries use this discovery configuration to
            auto-load key endpoints, supported grant types, and scopes.
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            <label className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              OIDC CONFIGURATION URL
            </label>
            <div className="bg-background flex items-center gap-1.5 rounded-lg border p-2 pr-1.5">
              <code className="text-foreground flex-1 truncate text-xs select-all">
                {discoveryUrl}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground size-7 shrink-0"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="animate-in fade-in size-3.5 text-green-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 border-t pt-4">
            <a
              href={discoveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-center text-xs font-medium transition-colors"
            >
              Explore JSON Endpoint
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-card flex flex-col gap-5 rounded-xl border p-6 md:col-span-2">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-lg p-2">
                <BookOpen className="size-4" />
              </div>
              <h3 className="text-foreground font-semibold">
                OIDC Integration Guide
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                1
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-foreground text-sm font-semibold">
                  Register your application Client
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Go to the{" "}
                  <Link
                    href="/dashboard/clients"
                    className="text-accent hover:underline"
                  >
                    Clients page
                  </Link>{" "}
                  and create a new client. Note the generated Client ID and
                  Client Secret (for Confidential clients).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                2
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-foreground text-sm font-semibold">
                  Initiate User Authorization Flow
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Redirect users to the authorization endpoint:
                </p>
                <div className="bg-background text-muted-foreground overflow-x-auto rounded-lg border p-3 font-mono text-[11px] whitespace-pre">
                  {`${apiBaseUrl}/authorize?\n  response_type=code&\n  client_id=your_client_id&\n  redirect_uri=your_redirect_uri&\n  scope=openid profile email`}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                3
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-foreground text-sm font-semibold">
                  Exchange Code for Access & ID Tokens
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Exchange the temporary authorization code at `/token` to
                  retrieve ID and Access tokens for user profiling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
