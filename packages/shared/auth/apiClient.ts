import { clearStoredToken, getStoredToken } from "./tokenStorage";
import type { AuthUser, ProfileUpdatePayload, RegisterPayload, TokenResponse } from "./types";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

const INVALID_CREDENTIALS_MESSAGE = "Email o contraseña incorrectos. Vuelve a intentarlo.";
const AUTH_SERVICE_ERROR_MESSAGE = "Se produjo un error en nuestros servicios. Inténtalo de nuevo más tarde.";

export function resolveAuthApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/auth";
  }

  const configured = process.env.NEXT_PUBLIC_AUTH_API_URL;
  if (configured) {
    return configured.replace(/\/+$/, "");
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

    let response: Response;
    try {
      response = await fetch(`${normalizedBaseUrl}${path}`, { ...init, headers });
    } catch {
      throw new Error(AUTH_SERVICE_ERROR_MESSAGE);
    }

    if (response.status === 401 && requireAuth) {
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
      if (response.status === 401 || response.status === 422) {
        throw new Error(INVALID_CREDENTIALS_MESSAGE);
      }

      throw new Error(AUTH_SERVICE_ERROR_MESSAGE);
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

  async function forgotPassword(email: string): Promise<void> {
    const response = await request(
      "/auth/forgot-password",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) },
      false,
    );
    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "No se pudo solicitar el restablecimiento");
    }
  }

  async function resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await request(
      "/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      },
      false,
    );
    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "El enlace no es válido o ya expiró");
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await request("/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail ?? "No se pudo cambiar la contraseña");
    }
  }

  return { login, register, getMe, updateProfile, forgotPassword, resetPassword, changePassword };
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
  } catch (error) {
    console.warn("Auth API returned a non-JSON error payload.", error);
  }
  return null;
}
