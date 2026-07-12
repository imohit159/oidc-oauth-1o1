"use client";

import * as React from "react";
import { ProfileInfoForm } from "./profile-info-form";
import { ActiveSessionsList } from "./active-sessions-list";

export function ProfileManager() {
  const [activeTab, setActiveTab] = React.useState<"info" | "sessions">("info");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your identity profile and active login sessions.
        </p>
      </div>

      {/* Tabs Toggles */}
      <div className="border-primary/10 flex border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "info"
              ? "border-primary text-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "sessions"
              ? "border-primary text-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          Active Sessions
        </button>
      </div>

      {/* TAB 1: PROFILE INFO */}
      {activeTab === "info" && (
        <div className="max-w-3xl space-y-6">
          <ProfileInfoForm />
        </div>
      )}

      {/* TAB 2: SESSIONS */}
      {activeTab === "sessions" && <ActiveSessionsList />}
    </div>
  );
}
