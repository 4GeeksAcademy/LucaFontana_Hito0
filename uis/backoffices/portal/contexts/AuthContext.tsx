"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  clearStoredToken,
  createAuthApiClient,
  getStoredToken,
  setStoredToken,
  type AuthUser,
  type RegisterPayload,
} from "@shared/auth";
import { getAuthApiBaseUrl } from "@/lib/authApi";

const AUTH_API_BASE_URL = getAuthApiBaseUrl();

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleUnauthorized = useCallback(() => setUser(null), []);
  const apiClient = useMemo(
    () => createAuthApiClient(AUTH_API_BASE_URL, handleUnauthorized),
    [handleUnauthorized],
  );

  const [loading, setLoading] = useState(true);

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
      setUser(await apiClient.getMe());
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
    window.location.assign(new URL("/login", window.location.origin).toString());
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
