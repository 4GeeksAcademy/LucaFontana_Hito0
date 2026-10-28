export function getAuthApiBaseUrl(): string {
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