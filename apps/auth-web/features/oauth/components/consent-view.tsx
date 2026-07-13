"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { oauthService } from "@/services/oauth.service";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck, ShieldAlert, Check, Lock, User, Globe, Shield, FileText, ExternalLink, ChevronDown } from "lucide-react";
export function ConsentView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const clientId = searchParams.get("client_id") || "";
  const scope = searchParams.get("scope") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const codeChallenge = searchParams.get("code_challenge") || "";
  const codeChallengeMethod = searchParams.get("code_challenge_method") as "plain" | "S256" || "S256";
  const state = searchParams.get("state") || "";
  const nonce = searchParams.get("nonce") || "";

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [clientName, setClientName] = React.useState<string>("");
  const [clientDescription, setClientDescription] = React.useState<string | null>(null);
  const [clientType, setClientType] = React.useState<string>("CONFIDENTIAL");
  const [clientLogoUrl, setClientLogoUrl] = React.useState<string | null>(null);
  const [clientWebsiteUrl, setClientWebsiteUrl] = React.useState<string | null>(null);
  const [clientPublisherName, setClientPublisherName] = React.useState<string | null>(null);
  const [clientPrivacyPolicyUrl, setClientPrivacyPolicyUrl] = React.useState<string | null>(null);
  const [clientTermsOfServiceUrl, setClientTermsOfServiceUrl] = React.useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = React.useState<"UNVERIFIED" | "VERIFIED" | "TRUSTED">("UNVERIFIED");

  // Validate parameters and fetch client info
  React.useEffect(() => {
    if (!clientId || !redirectUri || !codeChallenge) {
      setError("Invalid OAuth request: Missing client_id, redirect_uri, or code_challenge query parameters.");
      return;
    }

    const fetchClientDetails = async () => {
      try {
        const details = await oauthService.getClientInfo(clientId);
        setClientName(details.name);
        setClientDescription(details.description);
        setClientType(details.clientType);
        setClientLogoUrl(details.logoUrl || null);
        setClientWebsiteUrl(details.websiteUrl || null);
        setClientPublisherName(details.publisherName || null);
        setClientPrivacyPolicyUrl(details.privacyPolicyUrl || null);
        setClientTermsOfServiceUrl(details.termsOfServiceUrl || null);
        setVerificationStatus(details.verificationStatus || "UNVERIFIED");
      } catch (err: any) {
        console.error("Failed to load client details:", err);
        setClientName(clientId); // Fallback to Client ID
      }
    };
    fetchClientDetails();
  }, [clientId, redirectUri, codeChallenge]);

  const requestedScopes = React.useMemo(() => {
    const scopesList = scope ? scope.split(" ") : ["openid"];
    return scopesList.filter(s => s.toLowerCase() !== "openid");
  }, [scope]);

  const getScopeDetails = (s: string) => {
    const name = s.toLowerCase();
    if (name === "openid") {
      return {
        title: "Identity",
        desc: "Verify your identity.",
      };
    }
    if (name === "profile") {
      return {
        title: "Profile Information",
        desc: "Name, profile photo, and basic profile information.",
      };
    }
    if (name === "email") {
      return {
        title: "Email Address",
        desc: "Access your primary verified email address.",
      };
    }
    if (name === "offline_access") {
      return {
        title: "Offline Access",
        desc: "Maintain access to your account even when you are not actively using the application.",
      };
    }
    return {
      title: s,
      desc: "Requested permission access.",
    };
  };

  const handleDecision = async (approved: boolean) => {
    if (!clientId || !redirectUri || !codeChallenge) return;
    setLoading(true);
    setError(null);

    try {
      const response = await oauthService.submitConsent({
        client_id: clientId,
        approved,
        scope,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        state: state || undefined,
        nonce: nonce || undefined,
      });

      if (response && response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else {
        throw new Error("Invalid response received from authentication server.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your consent choice.");
      setLoading(false);
    }
  };

  const getInitials = (givenName?: string, familyName?: string) => {
    const first = givenName ? givenName.charAt(0).toUpperCase() : "";
    const last = familyName ? familyName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || "U";
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full max-w-[900px] mx-auto", className)} {...props}>
      <Card className="border-primary/10 overflow-hidden border shadow-lg bg-neutral-50/10">
        {/* Integrated Brand Header inside the Card */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-border/60">
          <Logo showText={true} />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Lock className="size-3.5" />
            Secure Authorization
          </div>
        </div>

        <CardContent className="grid p-0 md:grid-cols-[45%_55%] divide-y md:divide-y-0 md:divide-x divide-border bg-transparent">
          {error ? (
            <div className="p-8 md:col-span-2 flex flex-col items-center text-center gap-4 min-h-[300px] justify-center">
              <div className="rounded-full bg-red-50 dark:bg-red-950/20 p-3 text-red-600 dark:text-red-400">
                <ShieldAlert className="size-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Authorization Error</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {error}
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full max-w-[200px] mt-2"
              >
                Return to Dashboard
              </Button>
            </div>
          ) : (
            <>
              {/* Left Column: Full Client Info */}
              <div className="p-8 flex flex-col relative overflow-hidden min-h-[520px] bg-transparent">
                {/* Decorative Sun Watermark */}
                <div className="absolute -bottom-10 -left-10 opacity-[0.02] pointer-events-none select-none text-primary">
                  <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="40" />
                  </svg>
                </div>

                <div className="space-y-6 z-10">
                  {clientLogoUrl ? (
                    <img src={clientLogoUrl} alt={clientName} className="h-16 w-16 rounded-2xl object-cover shadow-md shadow-zinc-950/10" />
                  ) : (
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-white font-serif text-2xl font-bold shadow-md shadow-zinc-950/20">
                      {clientName ? clientName.substring(0, 2).toUpperCase() : "APP"}
                    </div>
                  )}

                  <div className="space-y-2.5 mt-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{clientName || "Loading app..."}</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {clientDescription || "No description provided by the developer."}
                    </p>
                  </div>
                </div>

                <div className="z-10 mt-8 pt-6 border-t border-border/40 space-y-6 flex-1">
                  {verificationStatus === "TRUSTED" && (
                    <div className="bg-primary/3 border border-primary/10 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                        <ShieldCheck className="size-4 text-primary fill-primary/10" />
                        <span>Trusted Client</span>
                      </div>
                      <div className="text-xs text-muted-foreground leading-normal">
                        {clientType === "CONFIDENTIAL" ? "Confidential OAuth Client" : "Public OAuth Client"}
                      </div>
                    </div>
                  )}
                  {verificationStatus === "VERIFIED" && (
                    <div className="bg-[#10b981]/3 border border-[#10b981]/10 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-[#1b7a43] font-semibold text-sm">
                        <ShieldCheck className="size-4 text-[#10b981] fill-[#10b981]/5" />
                        <span>Verified Client</span>
                      </div>
                      <div className="text-xs text-muted-foreground leading-normal">
                        {clientType === "CONFIDENTIAL" ? "Confidential OAuth Client" : "Public OAuth Client"}
                      </div>
                    </div>
                  )}
                  {verificationStatus === "UNVERIFIED" && (
                    <div className="bg-zinc-50 border border-zinc-200/50 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-zinc-700 font-semibold text-sm">
                        <ShieldAlert className="size-4 text-zinc-500" />
                        <span>Unverified Client</span>
                      </div>
                      <div className="text-xs text-muted-foreground leading-normal">
                        {clientType === "CONFIDENTIAL" ? "Confidential OAuth Client" : "Public OAuth Client"}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-500/5 flex items-center justify-center shrink-0 text-zinc-700">
                      <User className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Developer</span>
                      <span className="text-xs text-muted-foreground truncate">{clientPublisherName || "Unknown publisher"}</span>
                    </div>
                  </div>

                  {clientWebsiteUrl && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-500/5 flex items-center justify-center shrink-0 text-zinc-700">
                        <Globe className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Website</span>
                        <a
                          href={clientWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline cursor-pointer truncate font-medium"
                        >
                          {clientWebsiteUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}

                  {(clientPrivacyPolicyUrl || clientTermsOfServiceUrl) && (
                    <div className="space-y-3 pt-4 border-t border-border/40">
                      {clientPrivacyPolicyUrl && (
                        <a
                          href={clientPrivacyPolicyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors w-fit font-medium"
                        >
                          <ShieldCheck className="size-4 text-zinc-400" />
                          <span>Privacy Policy</span>
                          <ExternalLink className="size-3 text-zinc-400/80" />
                        </a>
                      )}
                      {clientTermsOfServiceUrl && (
                        <a
                          href={clientTermsOfServiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors w-fit font-medium"
                        >
                          <FileText className="size-4 text-zinc-400" />
                          <span>Terms of Service</span>
                          <ExternalLink className="size-3 text-zinc-400/80" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: User Account & Scopes */}
              <div className="p-8 flex flex-col justify-between min-h-[520px] bg-transparent">
                <div className="space-y-6">
                  {/* User Account Info */}
                  <div className="space-y-3">
                    <div className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">Using account</div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/4 dark:bg-primary/8 border border-primary/8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#7a0f14] text-white font-bold flex items-center justify-center text-sm shadow-md shadow-[#7a0f14]/10">
                          {getInitials(user?.given_name, user?.family_name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {user?.given_name} {user?.family_name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary hover:underline"
                        onClick={() => router.push("/login")}
                      >
                        Switch account
                      </button>
                    </div>
                  </div>

                  {/* Scopes List */}
                  <div className="space-y-3">
                    <div className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                      Permissions requested
                    </div>
                    <div className="space-y-3">
                      {requestedScopes.map((s) => {
                        const details = getScopeDetails(s);
                        return (
                          <div
                            key={s}
                            className="flex items-center justify-between p-3.5 bg-background border border-border/60 rounded-xl"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="h-5 w-5 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="size-3" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                                  {details.title}
                                </span>
                                <span className="text-xs text-muted-foreground leading-normal mt-1">
                                  {details.desc}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-border/40 flex justify-end gap-3 mt-auto">
                  <button
                    onClick={() => handleDecision(false)}
                    type="button"
                    disabled={loading}
                    className="px-8 py-2 rounded-lg border border-zinc-200 bg-background font-semibold text-sm text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => handleDecision(true)}
                    type="button"
                    disabled={loading}
                    className="px-8 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    Authorize
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground px-6 flex items-center justify-center gap-1.5">
        <Lock className="size-3.5" />
        <span>Your password is never shared with this application.</span>
      </div>
    </div>
  );
}
