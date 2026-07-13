"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { apiClient, setAuthToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CheckCircle, Loader2, Save, ShieldAlert, KeyRound } from "lucide-react";

export function ProfileInfoForm() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Profile details state
  const [givenName, setGivenName] = React.useState(user?.given_name || "");
  const [familyName, setFamilyName] = React.useState(user?.family_name || "");
  const [email, setEmail] = React.useState(user?.email || "");

  // Update profile states
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

  // Security actions state
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = React.useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

  // Synchronize store values
  React.useEffect(() => {
    if (user) {
      setGivenName(user.given_name);
      setFamilyName(user.family_name);
      setEmail(user.email);
    }
  }, [user]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!givenName.trim() || !familyName.trim()) return;

    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const result = await authService.updateProfile({
        givenName: givenName.trim(),
        familyName: familyName.trim(),
      });

      if (result?.user) {
        // Sync to Zustand store state dynamically
        useAuthStore.setState({ user: result.user });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (e: any) {
      alert(e.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Reset Request
  const handleRequestReset = async () => {
    if (!email) return;
    setIsSendingReset(true);
    setResetSuccessMessage(null);
    try {
      await authService.forgotPassword(email);
      setResetSuccessMessage("Password reset link has been dispatched to your email address.");
      setTimeout(() => setResetSuccessMessage(null), 5000);
    } catch (e: any) {
      alert(e.message || "Failed to request password reset.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    const isConfirmed = confirm(
      "WARNING: This action is permanent. Deleting your account will immediately revoke all active sessions, delete all registered applications, and erase your user profile data. Do you wish to continue?"
    );
    if (!isConfirmed) return;

    setIsDeletingAccount(true);
    try {
      await authService.deleteAccount();
      setAuthToken(null);
      useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
      router.push("/login");
    } catch (e: any) {
      alert(e.message || "Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="border-primary/5 flex items-center gap-3 border-b pb-3">
              <div className="bg-primary/5 text-primary rounded-full p-2">
                <User className="size-5" />
              </div>
              <div>
                <h3 className="font-bold">Basic Information</h3>
                <p className="text-muted-foreground text-xs">
                  Modify your first name and last name.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="givenName">First Name</Label>
                <Input
                  id="givenName"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="familyName">Last Name</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profileEmail">Email Address</Label>
              <Input
                id="profileEmail"
                value={email}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed font-semibold"
              />
              <p className="text-muted-foreground text-[10px]">
                Email address cannot be changed currently.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-500">
                  <CheckCircle className="size-4" />
                  Profile updated successfully!
                </span>
              )}
              <div className="flex-1 text-right">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="ml-auto flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* PASSWORD MANAGEMENT CONTAINER */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="border-primary/5 flex items-center gap-3 border-b pb-3">
            <div className="bg-primary/5 text-primary rounded-full p-2">
              <KeyRound className="size-5" />
            </div>
            <div>
              <h3 className="font-bold">Security & Password</h3>
              <p className="text-muted-foreground text-xs">
                Manage your credentials and security keys.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-semibold">Change Password</span>
              <p className="text-muted-foreground mt-0.5 text-xs">
                It is recommended to use a unique password that is at least 12
                characters long.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isSendingReset}
              onClick={handleRequestReset}
              className="min-w-[120px]"
            >
              {isSendingReset && <Loader2 className="mr-2 size-3 animate-spin" />}
              Request Reset
            </Button>
          </div>

          {resetSuccessMessage && (
            <p className="text-xs font-semibold text-green-500 mt-2">
              {resetSuccessMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="border-red-200 dark:border-red-900/30">
        <CardContent className="space-y-4 p-6">
          <div className="border-red-100 dark:border-red-950/20 flex items-center gap-3 border-b pb-3">
            <div className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-full p-2">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-muted-foreground text-xs">
                Irreversible account operations.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Delete Account</span>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Permanently delete your identity profile and all registered OAuth applications.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
              className="min-w-[120px]"
            >
              {isDeletingAccount && <Loader2 className="mr-2 size-3 animate-spin" />}
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
