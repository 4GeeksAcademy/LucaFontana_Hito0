import { NextResponse } from "next/server";

const FALLBACK_API_BASE_URL = "http://127.0.0.1:8000";

export function getSuppliersApiBaseUrl() {
  return process.env.SUPPLIERS_API_BASE_URL ?? process.env.NEXT_PUBLIC_SUPPLIERS_API_URL ?? FALLBACK_API_BASE_URL;
}

export function buildSuppliersApiUrl(pathname: string, searchParams?: URLSearchParams) {
  const url = new URL(pathname, ensureTrailingSlash(getSuppliersApiBaseUrl()));

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url;
}

export function forwardAuthorization(request: Request, headers: HeadersInit = {}) {
  const nextHeaders = new Headers(headers);
  const authorization = request.headers.get("authorization");
  if (authorization) {
    nextHeaders.set("Authorization", authorization);
  }
  return nextHeaders;
}

export async function proxyJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as unknown;
    return NextResponse.json(payload, { status: response.status });
  }

  const payload = await response.text();
  return new NextResponse(payload || null, {
    status: response.status,
    headers: contentType ? { "content-type": contentType } : undefined,
  });
}

export function proxyErrorResponse(error: unknown) {
  const detail = error instanceof Error && error.message ? error.message : "No se pudo contactar la API de proveedores.";
  const message = detail.includes("fetch") || detail.includes("Failed to fetch") || detail.includes("network")
    ? "No se pudo contactar la API de proveedores. Reintenta más tarde."
    : "No se pudo completar la operación con el directorio de proveedores.";
  return NextResponse.json({ detail: message }, { status: 502 });
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}