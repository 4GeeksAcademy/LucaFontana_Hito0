import { clearStoredToken, getStoredToken } from "@shared/auth";

const API_PATH = "/api/inventory";

export type Ingredient = {
  id: number;
  name: string;
  sku: string;
  unit: string;
  category: string;
  country: string;
  current_stock: number;
};

export type InboundOrderPayload = {
  ingredient_id: number;
  quantity: number;
  supplier_name: string;
  location_id: number;
};

export type OutboundOrderPayload = {
  ingredient_id: number;
  quantity: number;
  reason: "consumption" | "waste";
  location_id: number;
};

export type InventoryOrder = {
  id: number;
  movement_type: "inbound" | "outbound";
  quantity: number;
  created_at: string;
  user_uuid: string;
  ingredient: Omit<Ingredient, "current_stock">;
};

export class InventoryApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "InventoryApiError";
  }
}

async function errorMessage(response: Response): Promise<string> {
  const body = await response.text();
  if (!body) return `La solicitud falló (${response.status}).`;

  try {
    const payload: unknown = JSON.parse(body);
    if (payload && typeof payload === "object" && "detail" in payload) {
      const detail = payload.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in detail[0]) {
        return String(detail[0].msg);
      }
    }
    if (payload && typeof payload === "object" && "message" in payload) {
      return String(payload.message);
    }
  } catch {
    return body;
  }

  return body;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_PATH}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new InventoryApiError("No se pudo conectar con el servicio de inventario.", 0);
  }

  if (response.status === 401) {
    clearStoredToken();
    window.location.assign(new URL("/login", window.location.origin).toString());
  }
  if (!response.ok) throw new InventoryApiError(await errorMessage(response), response.status);
  return (await response.json()) as T;
}

export function getProducts(): Promise<Ingredient[]> {
  return request("/products");
}

export function getProduct(productId: number): Promise<Ingredient> {
  return request(`/products/${productId}`);
}

export function getOrders(): Promise<InventoryOrder[]> {
  return request("/orders");
}

export function createInboundOrder(payload: InboundOrderPayload): Promise<unknown> {
  return request("/orders/inbound", { method: "POST", body: JSON.stringify(payload) });
}

export function createOutboundOrder(payload: OutboundOrderPayload): Promise<unknown> {
  return request("/orders/outbound", { method: "POST", body: JSON.stringify(payload) });
}
