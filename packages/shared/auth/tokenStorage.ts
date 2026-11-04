import { invalidateAuthUserCache } from "./userCache";

const TOKEN_STORAGE_KEY = "auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  invalidateAuthUserCache();
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  invalidateAuthUserCache();
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
