import { NextResponse } from "next/server";
import { buildSuppliersApiUrl, proxyErrorResponse, proxyJsonResponse } from "@/lib/suppliersApi";

export async function GET(request: Request) {
  try {
    const incomingUrl = new URL(request.url);
    const supplierId = incomingUrl.searchParams.get("id");

    if (supplierId !== null) {
      const parsedId = Number(supplierId);

      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return NextResponse.json({ detail: "El id del proveedor debe ser un entero positivo." }, { status: 400 });
      }

      const response = await fetch(buildSuppliersApiUrl(`suppliers/${parsedId}`), {
        cache: "no-store",
      });

      return proxyJsonResponse(response);
    }

    const response = await fetch(buildSuppliersApiUrl("suppliers", incomingUrl.searchParams), {
      cache: "no-store",
    });

    return proxyJsonResponse(response);
  } catch (error) {
    return proxyErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await fetch(buildSuppliersApiUrl("suppliers"), {
      method: "POST",
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

export async function DELETE(request: Request) {
  try {
    const incomingUrl = new URL(request.url);
    const supplierId = incomingUrl.searchParams.get("id");

    if (supplierId === null) {
      return NextResponse.json({ detail: "Falta el id del proveedor." }, { status: 400 });
    }

    const parsedId = Number(supplierId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return NextResponse.json({ detail: "El id del proveedor debe ser un entero positivo." }, { status: 400 });
    }

    const response = await fetch(buildSuppliersApiUrl(`suppliers/${parsedId}`), {
      method: "DELETE",
      cache: "no-store",
    });

    return proxyJsonResponse(response);
  } catch (error) {
    return proxyErrorResponse(error);
  }
}