"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Route protection logic
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show a full-screen loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="bg-background flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            Loading Zen Console...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of unauthenticated content before redirection occurs
  if (!isAuthenticated) {
    return null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
          } as React.CSSProperties
        }
      >
        <div className="bg-background text-foreground flex min-h-screen w-full">
          {/* Dashboard Left Sidebar */}
          <AppSidebar />

          {/* Right Content Area */}
          <SidebarInset className="flex min-h-screen flex-col">
            {/* Top header bar */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Developer Portal
                </span>
              </div>
            </header>

            {/* Inner Dashboard Page Content */}
            <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
