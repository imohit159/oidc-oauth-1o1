"use client";

import * as React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export function GettingStartedCard() {
  const steps = [
    {
      num: 1,
      title: "Register your application client",
      desc: "Go to the Clients page and create a new client.",
    },
    {
      num: 2,
      title: "Initiate User Authorization Flow",
      desc: "Redirect users to the authorization endpoint.",
    },
    {
      num: 3,
      title: "Exchange Code for Access & ID Tokens",
      desc: "Exchange the authorization code at `/token` endpoint.",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <h3 className="text-foreground font-bold">
            Getting Started
          </h3>
        </div>

        <div className="mt-4 space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-3">
              <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {step.num}
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-foreground/90 text-xs font-bold leading-normal">
                  {step.title}
                </h4>
                <p className="text-muted-foreground text-xs leading-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-3">
        <Link
          href="/dashboard/clients"
          className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/75 inline-flex items-center gap-1 text-xs font-bold transition-colors"
        >
          View full guide
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
