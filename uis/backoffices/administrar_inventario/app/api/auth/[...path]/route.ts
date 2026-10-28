const backendBaseUrl = process.env.AUTH_API_BASE_URL ?? "http://127.0.0.1:8000";

async function proxyAuthRequest(request: Request, path: string[]) {
  const endpoint = path.join("/");
  if (endpoint !== "login" && endpoint !== "me") {
    return Response.json({ detail: "Ruta de autenticación no encontrada." }, { status: 404 });
  }

  const headers = new Headers();
  for (const name of ["authorization", "content-type", "accept"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const targetUrl = new URL(`${backendBaseUrl.replace(/\/+$/, "")}/auth/${endpoint}`);
  targetUrl.search = new URL(request.url).search;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
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
    return Response.json({ detail: "No se pudo conectar con el servicio de autenticación." }, { status: 502 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAuthRequest(request, (await context.params).path);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAuthRequest(request, (await context.params).path);
}
