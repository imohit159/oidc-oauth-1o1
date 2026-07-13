"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { setAuthToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

export function VerifyEmailView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const verify = React.useCallback(async (verToken: string) => {
    setStatus("verifying");
    setErrorMessage(null);
    try {
      const result = await authService.verifyEmail(verToken);
      if (result?.accessToken) {
        setAuthToken(result.accessToken);
        useAuthStore.setState({
          user: result.user,
          accessToken: result.accessToken,
          isAuthenticated: true,
        });
        setStatus("success");
      } else {
        throw new Error("Invalid response received from server.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Email verification failed. The link may have expired or is invalid.");
    }
  }, []);

  React.useEffect(() => {
    if (token) {
      verify(token);
    } else {
      setStatus("error");
      setErrorMessage("Verification token is missing. Please request a new verification link.");
    }
  }, [token, verify]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-primary/15 overflow-hidden border p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[340px] gap-4">
            {status === "verifying" && (
              <>
                <Loader2 className="size-10 animate-spin text-primary" />
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Verifying Email</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Please wait while we confirm your email address and secure your session...
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="rounded-full bg-green-50 dark:bg-green-950/20 p-3 text-green-600 dark:text-green-400">
                  <ShieldCheck className="size-10" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Verification Successful</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Thank you! Your email address has been verified. You are now automatically signed in.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="min-w-[185px] mt-2"
                >
                  Go to Dashboard
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="rounded-full bg-red-50 dark:bg-red-950/20 p-3 text-red-600 dark:text-red-400">
                  <ShieldAlert className="size-10" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Verification Failed</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {errorMessage}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[200px] mt-2">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/login-theme.png"
              alt="Email Verification Zen Illustration"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
