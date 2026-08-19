import { NextResponse } from "next/server";
import { buildSuppliersApiUrl, proxyErrorResponse, proxyJsonResponse } from "@/lib/suppliersApi";

export async function PATCH(request: Request) {
  try {
    const incomingUrl = new URL(request.url);
    const supplierId = incomingUrl.searchParams.get("id");

    if (!supplierId) {
      return NextResponse.json({ detail: "Falta el id del proveedor." }, { status: 400 });
    }

    const payload = await request.json();
    const response = await fetch(buildSuppliersApiUrl(`suppliers/${supplierId}/rate`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return proxyJsonResponse(response);
  } catch (error) {
    return proxyErrorResponse(error);
  }
}