import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthInitializer } from "@/features/auth/components/auth-initializer";
import { TooltipProvider } from "@/providers/tooltip-provider";

export const metadata: Metadata = {
  title: "Zen - OIDC Platform",
  description: "OAuth 2.1 & OpenID Connect 1.0 Identity Provider",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full scroll-smooth antialiased")}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans antialiased">
        <TooltipProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </TooltipProvider>
      </body>
    </html>
  );
}
