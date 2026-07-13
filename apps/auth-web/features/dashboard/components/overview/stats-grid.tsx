"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck, Activity, ArrowRight } from "lucide-react";

interface StatsGridProps {
  stats: {
    clients: number;
    consents: number;
    sessions: number;
  };
  loading: boolean;
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
  const cards = [
    {
      title: "Registered Clients",
      value: stats.clients,
      subtext: "Applications & API Consumers",
      link: "/dashboard/clients",
      linkLabel: "Manage Clients",
      icon: <KeyRound className="size-5" />,
      sparklineId: "sparkline-clients",
      sparklinePath: "M 0 25 C 20 25, 40 10, 60 15 C 70 17, 75 5, 80 2",
    },
    {
      title: "Authorized Applications",
      value: stats.consents,
      subtext: "Granted permissions & scopes",
      link: "/dashboard/authorized-apps",
      linkLabel: "View Authorizations",
      icon: <ShieldCheck className="size-5" />,
      sparklineId: "sparkline-consents",
      sparklinePath: "M 0 25 C 20 25, 30 12, 45 12 C 55 12, 65 24, 80 5",
    },
    {
      title: "Active Sessions",
      value: stats.sessions,
      subtext: "Active sessions across devices",
      link: "/dashboard/profile",
      linkLabel: "Manage Sessions",
      icon: <Activity className="size-5" />,
      sparklineId: "sparkline-sessions",
      sparklinePath: "M 0 20 C 15 20, 30 10, 45 15 C 60 20, 70 5, 80 2",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 dark:hover:border-primary/10 hover:shadow-xs"
        >
          {/* Main content: Icon + Text Column left side, Sparkline right side */}
          <div className="flex items-start justify-between gap-2">
            {/* Left side: Icon & Title/Value/Desc Column */}
            <div className="flex gap-3.5 items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground">
                {card.icon}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-muted-foreground text-xs font-semibold tracking-tight">
                  {card.title}
                </span>
                <span className="text-foreground text-2xl font-bold tracking-tight">
                  {loading ? (
                    <span className="bg-muted inline-block h-8 w-12 animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </span>
                <span className="text-muted-foreground/80 text-[10px] leading-tight font-medium truncate">
                  {card.subtext}
                </span>
              </div>
            </div>

            {/* Right side: Sparkline graph */}
            <div className="shrink-0 pt-1.5">
              {loading ? (
                <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
              ) : (
                <svg className="h-10 w-20 overflow-visible" viewBox="0 0 80 30">
                  <defs>
                    <linearGradient id={card.sparklineId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Gradient Area under trend line */}
                  <path
                    d={`${card.sparklinePath} L 80 30 L 0 30 Z`}
                    fill={`url(#${card.sparklineId})`}
                  />
                  {/* Trend line stroke */}
                  <path
                    d={card.sparklinePath}
                    stroke="var(--primary)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Footer action link */}
          <div className="mt-5 flex items-center justify-between">
            <Link
              href={card.link}
              className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/75 inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
            >
              {card.linkLabel}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
