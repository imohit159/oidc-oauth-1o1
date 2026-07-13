"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldAlert, KeyRound } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Password reset token is missing. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired or is invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-primary/15 overflow-hidden border p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {!token ? (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[340px] gap-4">
              <div className="rounded-full bg-red-50 dark:bg-red-950/20 p-3 text-red-600 dark:text-red-400">
                <ShieldAlert className="size-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Invalid Link</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  The password reset token is missing. Please request a new reset link from the login page.
                </p>
              </div>
              <Button
                onClick={() => router.push("/forgot-password")}
                className="min-w-[180px] mt-2"
              >
                Request Reset Link
              </Button>
            </div>
          ) : !success ? (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col justify-center min-h-[340px]">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Create a strong, new password for your account.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-500 dark:border-red-800/30 dark:bg-red-950/20">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save New Password
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[340px] gap-4">
              <div className="rounded-full bg-green-50 dark:bg-green-950/20 p-3 text-green-600 dark:text-green-400">
                <KeyRound className="size-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Password Reset Successfully</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Your password has been successfully updated. You can now use your new password to sign in.
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="min-w-[150px] mt-2"
              >
                Sign In
              </Button>
            </div>
          )}

          <div className="bg-muted relative hidden md:block">
            <img
              src="/login-theme.png"
              alt="Reset Password Zen Illustration"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
