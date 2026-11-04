import type { AuthUser } from "./types";

const USER_CACHE_TTL_MS = 2 * 60 * 1000;
const TOKEN_STORAGE_KEY = "auth_token";

type UserCacheEntry = {
  token: string;
  expiresAt: number;
  user?: AuthUser;
  pending?: Promise<AuthUser>;
};

let cacheEntry: UserCacheEntry | null = null;
let isStorageListenerRegistered = false;

export function invalidateAuthUserCache(): void {
  cacheEntry = null;
}

export function getOrLoadAuthUser(
  token: string,
  load: () => Promise<AuthUser>,
): Promise<AuthUser> {
  registerStorageListener();

  if (cacheEntry?.token === token) {
    if (cacheEntry.pending) {
      return cacheEntry.pending;
    }

    if (cacheEntry.user && cacheEntry.expiresAt > Date.now()) {
      return Promise.resolve(cacheEntry.user);
    }
  }

  const entry: UserCacheEntry = { token, expiresAt: 0 };
  cacheEntry = entry;
  entry.pending = load()
    .then((user) => {
      if (cacheEntry === entry) {
        entry.user = user;
        entry.expiresAt = Date.now() + USER_CACHE_TTL_MS;
        entry.pending = undefined;
      }
      return user;
    })
    .catch((error: unknown) => {
      if (cacheEntry === entry) {
        cacheEntry = null;
      }
      throw error;
    });

  return entry.pending;
}

function registerStorageListener(): void {
  if (isStorageListenerRegistered || typeof window === "undefined") {
    return;
  }

  window.addEventListener("storage", (event) => {
    if (event.key === TOKEN_STORAGE_KEY || event.key === null) {
      invalidateAuthUserCache();
    }
  });
  isStorageListenerRegistered = true;
}
