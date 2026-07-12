import type { Metadata } from "next";
import { Inter, Noto_Serif_JP, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthInitializer } from "@/features/auth/components/auth-initializer";
import { TooltipProvider } from "@/providers/tooltip-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        notoSerifJp.variable,
        geistMono.variable,
      )}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans antialiased">
        <TooltipProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </TooltipProvider>
      </body>
    </html>
  );
}
