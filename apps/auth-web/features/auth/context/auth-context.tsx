"use client";

import * as React from "react";
import { apiClient, setAuthToken, setOnTokenExpired } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  role: "USER" | "ADMIN";
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    givenName: string;
    familyName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const logout = React.useCallback(async () => {
    try {
      await apiClient.post("/api/v1/sessions/logout");
    } catch (e) {
      console.error("Logout request failed:", e);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Try to refresh the access token
      const refreshResult = await apiClient.post<{ accessToken: string }>(
        "/api/v1/sessions/refresh",
      );
      if (refreshResult?.accessToken) {
        setAuthToken(refreshResult.accessToken);

        // 2. Fetch the current user's profile
        const profileResult = await apiClient.get<{ user: User }>(
          "/api/v1/identity/users/me",
        );
        setUser(profileResult?.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await apiClient.post<{ user: User; accessToken: string }>(
        "/api/v1/identity/login",
        {
          email,
          password,
        },
      );

      if (result?.accessToken) {
        setAuthToken(result.accessToken);
        setUser(result.user);
      } else {
        throw new Error("No token returned from server");
      }
    } catch (error) {
      setAuthToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = React.useCallback(
    async (payload: {
      givenName: string;
      familyName: string;
      email: string;
      password: string;
    }) => {
      setIsLoading(true);
      try {
        await apiClient.post("/api/v1/identity/register", payload);
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Setup mount behavior and listen to silent-refresh expiration events
  React.useEffect(() => {
    setOnTokenExpired(() => {
      setUser(null);
    });
    refreshUser();
  }, [refreshUser]);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
