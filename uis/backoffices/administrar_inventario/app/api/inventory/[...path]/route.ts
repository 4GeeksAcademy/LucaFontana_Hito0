const backendBaseUrl = process.env.INVENTORY_API_BASE_URL ?? "http://127.0.0.1:8000";

function isAllowedEndpoint(path: string[]): boolean {
  const endpoint = path.join("/");
  return endpoint === "products"
    || /^products\/\d+$/.test(endpoint)
    || endpoint === "orders"
    || endpoint === "orders/inbound"
    || endpoint === "orders/outbound";
}

async function proxyInventoryRequest(request: Request, path: string[]) {
  if (!isAllowedEndpoint(path)) {
    return Response.json({ detail: "Ruta de inventario no encontrada." }, { status: 404 });
  }

  const authorization = request.headers.get("authorization");
  if (request.method === "POST" && !authorization) {
    return Response.json({ detail: "Inicia sesión para registrar movimientos." }, { status: 401 });
  }

  const headers = new Headers();
  if (authorization) headers.set("Authorization", authorization);
  if (request.headers.has("content-type")) {
    headers.set("Content-Type", request.headers.get("content-type") as string);
  }

  const targetUrl = new URL(`${backendBaseUrl.replace(/\/+$/, "")}/inventory/${path.join("/")}`);
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
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json({ detail: "No se pudo conectar con el servicio de inventario." }, { status: 502 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyInventoryRequest(request, (await context.params).path);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyInventoryRequest(request, (await context.params).path);
}
