import { create } from "zustand";
import { authService, type User } from "@/services/auth.service";
import { setAuthToken, setOnTokenExpired } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { givenName: string; familyName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });
    // Register callback so apiClient can clear auth on 401 cascade
    setOnTokenExpired(() => {
      set({ user: null, accessToken: null, isAuthenticated: false });
    });

    try {
      // Attempt to refresh via httpOnly cookie
      const result = await authService.refresh();
      if (result?.accessToken) {
        setAuthToken(result.accessToken);
        set({ accessToken: result.accessToken });

        const profileResult = await authService.getMe();
        if (profileResult?.user) {
          set({ user: profileResult.user, isAuthenticated: true });
        }
      }
    } catch {
      setAuthToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await authService.login({ email, password });
      setAuthToken(result.accessToken);
      set({
        user: result.user,
        accessToken: result.accessToken,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      await authService.register(payload);
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    } finally {
      setAuthToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
