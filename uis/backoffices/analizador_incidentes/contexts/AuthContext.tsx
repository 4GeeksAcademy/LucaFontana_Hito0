"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearStoredToken,
  createAuthApiClient,
  getStoredToken,
  resolveAuthApiBaseUrl,
  setStoredToken,
  type AuthUser,
  type ProfileUpdatePayload,
  type RegisterPayload,
} from "@shared/auth";

const AUTH_API_BASE_URL = resolveAuthApiBaseUrl();

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    router.push("/login");
  }, [router]);

  const apiClient = useMemo(
    () => createAuthApiClient(AUTH_API_BASE_URL, handleUnauthorized),
    [handleUnauthorized],
  );

  useEffect(() => {
    const token = getStoredToken();
    const bootstrap = token ? apiClient.getMe() : Promise.resolve(null);

    bootstrap
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [apiClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await apiClient.login(email, password);
      setStoredToken(token.access_token);
      const me = await apiClient.getMe();
      setUser(me);
    },
    [apiClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await apiClient.register(payload);
      await login(payload.email, payload.password);
    },
    [apiClient, login],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateProfile = useCallback(
    async (payload: ProfileUpdatePayload) => {
      const profile = await apiClient.updateProfile(payload);
      setUser((current) => (current ? { ...current, profile } : current));
    },
    [apiClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
