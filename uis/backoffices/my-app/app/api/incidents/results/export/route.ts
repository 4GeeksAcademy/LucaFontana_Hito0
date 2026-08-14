const backendBaseUrl = process.env.INCIDENTS_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  try {
    const response = await fetch(`${backendBaseUrl}/api/incidents/results/export`, {
      method: "GET",
      cache: "no-store",
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "text/csv; charset=utf-8",
        "Content-Disposition":
          response.headers.get("content-disposition") ??
          'attachment; filename="incident-analysis-results.csv"',
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