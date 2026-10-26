const backendBaseUrl = process.env.AUTH_API_BASE_URL ?? "http://127.0.0.1:8001";
const authEndpoints = new Set(["login", "me", "forgot-password", "reset-password", "change-password"]);
const rootEndpoints = new Set(["users", "profiles/me"]);

function resolveBackendPath(path: string[]): string | null {
  const normalizedPath = path[0] === "auth" ? path.slice(1) : path;
  const endpoint = normalizedPath.join("/");

  if (authEndpoints.has(endpoint)) return `/auth/${endpoint}`;
  if (rootEndpoints.has(endpoint)) return `/${endpoint}`;
  return null;
}

const forwardedHeaders = (request: Request) => {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);

  return headers;
};

async function proxyAuthRequest(request: Request, path: string[]) {
  const backendPath = resolveBackendPath(path);
  if (!backendPath) {
    return Response.json({ detail: "Ruta de autenticación no encontrada." }, { status: 404 });
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${backendBaseUrl.replace(/\/+$/, "")}${backendPath}`);
  targetUrl.search = incomingUrl.search;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardedHeaders(request),
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        ...(response.headers.get("www-authenticate")
          ? { "WWW-Authenticate": response.headers.get("www-authenticate") as string }
          : {}),
      },
    });
  } catch {
    return Response.json(
      { detail: "No se pudo conectar con el servicio de autenticación." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAuthRequest(request, (await context.params).path);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAuthRequest(request, (await context.params).path);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAuthRequest(request, (await context.params).path);
}