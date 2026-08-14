const backendBaseUrl = process.env.INCIDENTS_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const response = await fetch(`${backendBaseUrl}/api/incidents/analyze`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return Response.json(
      {
        detail: "No se pudo conectar con el backend de incidencias.",
      },
      { status: 502 },
    );
  }
}