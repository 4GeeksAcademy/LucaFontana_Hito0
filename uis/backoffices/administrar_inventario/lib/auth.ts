const TOKEN_STORAGE_KEY = "auth_token";
const AUTH_API_PATH = "/auth";
export const AUTH_UNAUTHORIZED_EVENT = "inventory:unauthorized";

function getAuthApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  const backendUrl = new URL(
    configuredUrl ?? (typeof window === "undefined" ? "http://127.0.0.1:8000" : window.location.origin),
  );
  if (backendUrl.hostname.endsWith(".app.github.dev")) {
    backendUrl.hostname = backendUrl.hostname.replace(/-\d+(?=\.app\.github\.dev$)/, "-8000");
  } else if (backendUrl.port !== "8000") {
    backendUrl.port = "8000";
  }
  backendUrl.pathname = "/";
  return backendUrl.origin;
}

export type AuthUser = {
  id: number;
  email: string;
  is_active: boolean;
  role: "admin" | "manager" | "user";
  created_at: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function notifyUnauthorized(): void {
  clearStoredToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }
}

async function readError(response: Response): Promise<string> {
  const body = await response.text();
  if (!body) return `La solicitud falló (${response.status}).`;

  try {
    const payload: unknown = JSON.parse(body);
    if (payload && typeof payload === "object" && "detail" in payload) {
      const detail = payload.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in detail[0]) {
        return String(detail[0].msg);
      }
    }
    if (payload && typeof payload === "object" && "message" in payload) {
      return String(payload.message);
    }
  } catch {
    return body;
  }

  return body;
}

async function request(path: string, init: RequestInit = {}, requiresAuth = true): Promise<Response> {
  const headers = new Headers(init.headers);
  if (requiresAuth) {
    const token = getStoredToken();
    if (!token) throw new Error("Tu sesión ha terminado. Inicia sesión de nuevo.");
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getAuthApiBaseUrl()}${AUTH_API_PATH}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error("No se pudo conectar con el servicio de autenticación.");
  }

  if (response.status === 401 && requiresAuth) notifyUnauthorized();
  if (!response.ok) throw new Error(await readError(response));
  return response;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password });
  const response = await request(
    "/login",
    { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    false,
  );
  const token = (await response.json()) as TokenResponse;
  setStoredToken(token.access_token);
  return token;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await request("/me");
  return (await response.json()) as AuthUser;
}
