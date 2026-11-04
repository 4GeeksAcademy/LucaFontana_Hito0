export const COUNTRY_OPTIONS = ["Colombia", "USA"] as const;

export const CATEGORY_OPTIONS = [
  "carne",
  "verduras_y_hortalizas",
  "salsas_y_condimentos",
  "bebidas",
  "packaging",
  "productos_limpieza",
  "lacteos",
  "carbon_y_combustible",
] as const;

export const STATUS_OPTIONS = ["active", "suspended"] as const;
export const CURRENCY_OPTIONS = ["COP", "USD"] as const;

export type SupplierCountry = (typeof COUNTRY_OPTIONS)[number];
export type SupplierCategory = (typeof CATEGORY_OPTIONS)[number];
export type SupplierStatus = (typeof STATUS_OPTIONS)[number];
export type SupplierCurrency = (typeof CURRENCY_OPTIONS)[number];

export type Supplier = {
  id: number;
  name: string;
  country: SupplierCountry;
  categories: SupplierCategory[];
  rate_per_unit: number;
  currency: SupplierCurrency;
  status: SupplierStatus;
  updated_at: string;
  contact_email?: string | null;
  notes?: string | null;
};

export const CATEGORY_LABELS: Record<SupplierCategory, string> = {
  carne: "Carne",
  verduras_y_hortalizas: "Verduras y hortalizas",
  salsas_y_condimentos: "Salsas y condimentos",
  bebidas: "Bebidas",
  packaging: "Packaging",
  productos_limpieza: "Productos de limpieza",
  lacteos: "Lácteos",
  carbon_y_combustible: "Carbón y combustible",
};

export const STATUS_LABELS: Record<SupplierStatus, string> = {
  active: "Activo",
  suspended: "Suspendido",
};

export const CURRENCY_BY_COUNTRY: Record<SupplierCountry, SupplierCurrency> = {
  Colombia: "COP",
  USA: "USD",
};