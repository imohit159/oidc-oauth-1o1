"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-primary/15 overflow-hidden border p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {!success ? (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col justify-center min-h-[340px]">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email address and we will send you a link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-500 dark:border-red-800/30 dark:bg-red-950/20">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>

                <Field className="space-y-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Send Reset Link
                  </Button>

                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="size-4" />
                    Back to login
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[340px] gap-4">
              <div className="rounded-full bg-green-50 dark:bg-green-950/20 p-3 text-green-600 dark:text-green-400">
                <MailCheck className="size-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Check your email</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  We have sent a password reset link to <strong>{email}</strong> if it is associated with a verified account.
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="min-w-[150px] mt-2"
              >
                Return to Login
              </Button>
            </div>
          )}

          <div className="bg-muted relative hidden md:block">
            <img
              src="/login-theme.png"
              alt="Forgot Password Zen Illustration"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
