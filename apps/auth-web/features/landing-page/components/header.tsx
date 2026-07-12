"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/common/logo";
import { useAuthStore } from "@/store/auth.store";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHref = isAuthenticated ? "/dashboard" : "/login";
  const authLabel = isAuthenticated ? "Dashboard" : "Login";

  return (
    <header className="w-full py-6">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="#"
            className="text-foreground hover:text-primary after:bg-accent relative text-[0.8rem] font-normal transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200 hover:after:w-full"
          >
            Docs
          </Link>
          <Link
            href="#"
            className="text-foreground hover:text-primary after:bg-accent relative text-[0.8rem] font-normal transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200 hover:after:w-full"
          >
            About
          </Link>
          <Link
            href="https://github.com/imohit159/oidc-oauth-1o1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
            aria-label="GitHub"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-5 w-5 fill-current transition-colors"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </Link>
          <Button
            variant="default"
            size="default"
            nativeButton={false}
            className="rounded-md tracking-wide"
            render={<Link href={authHref} />}
          >
            {authLabel}
          </Button>
        </nav>

        {/* Mobile Navigation Drawer */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="bg-background flex w-[280px] flex-col justify-between p-6"
            >
              <div className="mt-8 flex flex-col gap-8">
                <Logo />
                <div className="flex flex-col gap-5 pl-2">
                  <Link
                    href="#"
                    className="text-foreground hover:text-primary text-base font-medium transition-colors"
                  >
                    Docs
                  </Link>
                  <Link
                    href="#"
                    className="text-foreground hover:text-primary text-base font-medium transition-colors"
                  >
                    About
                  </Link>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    className="mt-2 w-full rounded-md tracking-wide"
                    render={<Link href={authHref} />}
                  >
                    {authLabel}
                  </Button>
                </div>
              </div>
              <div>
                <Link
                  href="https://github.com/imohit159/oidc-oauth-1o1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center gap-2 pl-2 text-sm transition-colors"
                >
                  <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  <span>GitHub Repository</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
