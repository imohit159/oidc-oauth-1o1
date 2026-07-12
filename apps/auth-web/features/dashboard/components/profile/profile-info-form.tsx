"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CheckCircle, Loader2, Save } from "lucide-react";

export function ProfileInfoForm() {
  const { user } = useAuthStore();

  // Profile details state
  const [givenName, setGivenName] = React.useState(user?.given_name || "");
  const [familyName, setFamilyName] = React.useState(user?.family_name || "");
  const [email, setEmail] = React.useState(user?.email || "");

  // Update profile states
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

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
      const result = await apiClient.patch<{ user: any }>(
        "/api/v1/identity/users/me",
        {
          givenName: givenName.trim(),
          familyName: familyName.trim(),
        },
      );

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

      {/* MOCK PASSWORD MANAGEMENT CONTAINER */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="border-primary/5 flex items-center gap-3 border-b pb-3">
            <div className="bg-primary/5 text-primary rounded-full p-2">
              <User className="size-5" />
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
              onClick={() =>
                alert(
                  "Password reset link has been dispatched to your email address.",
                )
              }
            >
              Request Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
