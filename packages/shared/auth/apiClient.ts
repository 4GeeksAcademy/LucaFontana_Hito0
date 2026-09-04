import { clearStoredToken, getStoredToken } from "./tokenStorage";
import type { AuthUser, ProfileUpdatePayload, RegisterPayload, TokenResponse } from "./types";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export function resolveAuthApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_AUTH_API_URL;
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.endsWith(".app.github.dev")) {
      const baseHost = hostname.replace(/-\d+\.app\.github\.dev$/, "");
      return `https://${baseHost}-8001.app.github.dev`;
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://127.0.0.1:8001";
    }
  }

  return "http://127.0.0.1:8001";
}

export type AuthApiClient = ReturnType<typeof createAuthApiClient>;

/**
 * Fetch wrapper that attaches the Bearer token to protected calls and
 * clears the session + notifies on any 401 response.
 */
export function createAuthApiClient(baseUrl: string, onUnauthorized: () => void) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  async function request(path: string, init: RequestInit = {}, requireAuth = true): Promise<Response> {
    const headers = new Headers(init.headers);
    if (requireAuth) {
      const token = getStoredToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(`${normalizedBaseUrl}${path}`, { ...init, headers });

    if (response.status === 401) {
      clearStoredToken();
      onUnauthorized();
      throw new UnauthorizedError();
    }

    return response;
  }

  async function login(email: string, password: string): Promise<TokenResponse> {
    const body = new URLSearchParams({ username: email, password });
    const response = await request(
      "/auth/login",
      { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      false,
    );

    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "Credenciales inválidas");
    }

    return response.json();
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const response = await request(
      "/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      false,
    );

    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "No se pudo completar el registro");
    }
  }

  async function getMe(): Promise<AuthUser> {
    const response = await request("/auth/me");
    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "No se pudo obtener el usuario");
    }
    return response.json();
  }

  async function updateProfile(payload: ProfileUpdatePayload) {
    const response = await request("/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "No se pudo actualizar el perfil");
    }

    return response.json();
  }

  return { login, register, getMe, updateProfile };
}

async function extractErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      return data.detail[0].msg;
    }
  } catch {
    // response body was not JSON
  }
  return null;
}
