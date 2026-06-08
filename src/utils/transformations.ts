import { MenuItem, SaleTransaction, Localizacion, WasteRecord, PaymentMethod, CountryMetrics, WasteReason } from "../types/models";

export function calculateDailyRevenue(sales: SaleTransaction[], date: Date, currency: "USD" | "COP"): number {
    let filteredSales = sales.filter(sale => {
        sale.timestamp === date;
    });
    let sum = 0;
    for (let sale of filteredSales) {
        sum += sale.totalPrice[currency];
    }
    return Math.round(sum * 100) / 100;
}

export function calculateLocationMargin(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  locationId: string,
  currency: "USD" | "COP"
): number {
  const locationSales = sales.filter((s) => s.locationId === locationId);
 
  if (locationSales.length === 0) return 0;
 
  const menuItemMap = new Map<string, MenuItem>(
    menuItems.map((item) => [item.id, item])
  );
 
  let totalRevenue = 0;
  let totalIngredientCost = 0;
 
  for (const sale of locationSales) {
    const revenue = sale.totalPrice[currency];
    const menuItem = menuItemMap.get(sale.itemId);
    const ingredientCost = menuItem
      ? menuItem.ingredientCost[currency] * sale.quantity
      : 0;
 
    totalRevenue += revenue;
    totalIngredientCost += ingredientCost;
  }
 
  if (totalRevenue === 0) return 0;
 
  const margin =
    ((totalRevenue - totalIngredientCost) / totalRevenue) * 100;
 
  return Math.round(margin * 100) / 100;
}
 

/**
 * Calcula el costo total de desperdicio para una locación
 * en la moneda especificada.
 * Retorna el total redondeado a 2 decimales.
 */
export function calculateWasteCost(
  wasteRecords: WasteRecord[],
  locationId: string,
  currency: "USD" | "COP"
): number {
  const total = wasteRecords
    .filter((record) => record.locationId === locationId)
    .reduce((sum, record) => sum + record.cost[currency], 0);
 
  return Math.round(total * 100) / 100;
}


/**
 * Convierte entre USD y COP usando una tasa de cambio fija.
 * Tasa: 1 USD = 4000 COP
 */
export function convertCurrency(
  amount: number,
  fromCurrency: "USD" | "COP",
  toCurrency: "USD" | "COP"
): number {
  if (fromCurrency === toCurrency) return amount;
 
  const converted =
    fromCurrency === "USD"
      ? amount * 4000
      : amount / 4000;
 
  return Math.round(converted * 100) / 100;
}


// ─────────────────────────────────────────────────────────────
// scoreLocationPerformance
// ─────────────────────────────────────────────────────────────
 
/**
 * Calcula un puntaje de performance (0–100) para una locación
 * basado en ingresos, eficiencia de asientos, control de
 * desperdicio y margen de ganancia.
 */
export function scoreLocationPerformance(
  location: Localizacion,
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[]
): number {
  const locationSales = sales.filter((s) => s.locationId === location.id);
 
  // ── Ingresos totales en USD ──────────────────────────────
  const totalRevenueUSD = locationSales.reduce(
    (sum, s) => sum + s.totalPrice.USD,
    0
  );
 
  // ── Días operativos (desde openingYear hasta hoy) ────────
  const currentYear = new Date().getFullYear();
  const yearsOpen = Math.max(currentYear - location.openingYear, 1);
  const operativeDays = yearsOpen * 365;
 
  // ── 1. Performance de ingresos (máx 40 pts) ─────────────
  const avgDailyRevenueUSD = totalRevenueUSD / operativeDays;
  const revenueScore = Math.min((avgDailyRevenueUSD / 1000) * 40, 40);
 
  // ── 2. Eficiencia de asientos (máx 30 pts) ───────────────
  const totalSalesCount = locationSales.length;
  const seatScore = Math.min(
    (totalSalesCount / location.seatingCapacity) * 30,
    30
  );
 
  // ── 3. Control de desperdicio (máx 20 pts) ───────────────
  const wasteCostUSD = calculateWasteCost(wasteRecords, location.id, "USD");
  const wastePercentage =
    totalRevenueUSD > 0 ? (wasteCostUSD / totalRevenueUSD) * 100 : 0;
  const wasteScore = Math.max(20 - wastePercentage * 2, 0);
 
  // ── 4. Margen de ganancia (máx 10 pts) ───────────────────
  const margin = calculateLocationMargin(
    sales,
    menuItems,
    location.id,
    "USD"
  );
  const marginScore = Math.min(margin / 10, 10);
 
  const totalScore = revenueScore + seatScore + wasteScore + marginScore;
  return Math.round(totalScore * 100) / 100;
}
 
// ─────────────────────────────────────────────────────────────
// rankLocationsByPerformance
// ─────────────────────────────────────────────────────────────
 
/**
 * Puntúa todas las locaciones y las retorna ordenadas
 * por puntaje (más alto primero).
 */
export function rankLocationsByPerformance(
  locations: Localizacion[],
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[]
): Array<{ location: Localizacion; score: number }> {
  return locations
    .map((location) => ({
      location,
      score: scoreLocationPerformance(location, sales, wasteRecords, menuItems),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Retorna el conteo de ventas por método de pago.
 */
export function countSalesByPaymentMethod(
  sales: SaleTransaction[]
): Record<PaymentMethod, number> {
  const result: Record<PaymentMethod, number> = {
    Cash: 0,
    "Credit card": 0,
    "Debit card": 0,
    "Digital wallet": 0,
  };
 
  for (const sale of sales) {
    result[sale.paymentMethod] += 1;
  }
 
  return result;
}
 
// ─────────────────────────────────────────────────────────────
// calculateAverageTicket
// ─────────────────────────────────────────────────────────────
 
/**
 * Retorna el valor promedio de venta en la moneda especificada,
 * redondeado a 2 decimales.
 */
export function calculateAverageTicket(
  sales: SaleTransaction[],
  currency: "USD" | "COP"
): number {
  if (sales.length === 0) return 0;
 
  const total = sales.reduce((sum, s) => sum + s.totalPrice[currency], 0);
  const avg = total / sales.length;
 
  return Math.round(avg * 100) / 100;
}
 
// ─────────────────────────────────────────────────────────────
// findTopSellingItems
// ─────────────────────────────────────────────────────────────
 
/**
 * Encuentra los N ítems de menú más vendidos, ordenados
 * por cantidad total vendida (más alto primero).
 */
export function findTopSellingItems(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  topN: number
): Array<{ item: MenuItem; totalSold: number }> {
  const menuItemMap = new Map<string, MenuItem>(
    menuItems.map((item) => [item.id, item])
  );
 
  // Acumular unidades vendidas por itemId
  const soldMap = new Map<string, number>();
  for (const sale of sales) {
    soldMap.set(sale.itemId, (soldMap.get(sale.itemId) ?? 0) + sale.quantity);
  }
 
  // Construir resultado solo para ítems que existen en el menú
  const ranked = Array.from(soldMap.entries())
    .filter(([itemId]) => menuItemMap.has(itemId))
    .map(([itemId, totalSold]) => ({
      item: menuItemMap.get(itemId)!,
      totalSold,
    }))
    .sort((a, b) => b.totalSold - a.totalSold);
 
  return ranked.slice(0, topN);
}
 
// ─────────────────────────────────────────────────────────────
// groupWasteByReason
// ─────────────────────────────────────────────────────────────
 
/**
 * Agrupa registros de desperdicio por razón.
 */
export function groupWasteByReason(
  wasteRecords: WasteRecord[]
): Record<WasteReason, WasteRecord[]> {
  const result: Record<WasteReason, WasteRecord[]> = {
    Expired: [],
    "Cooking error": [],
    "Customer return": [],
    Damage: [],
    Other: [],
  };
 
  for (const record of wasteRecords) {
    result[record.reason].push(record);
  }
 
  return result;
}
 
// ─────────────────────────────────────────────────────────────
// calculateCountryComparison
// ─────────────────────────────────────────────────────────────
 
/**
 * Calcula métricas agregadas por país (Colombia y USA).
 */
export function calculateCountryComparison(
  sales: SaleTransaction[],
  locations: Localizacion[],
  menuItems: MenuItem[]
): { Colombia: CountryMetrics; USA: CountryMetrics } {
  const buildMetrics = (country: "Colombia" | "USA"): CountryMetrics => {
    const countryLocations = locations.filter((l) => l.country === country);
    const locationIds = new Set(countryLocations.map((l) => l.id));
    const countrySales = sales.filter((s) => locationIds.has(s.locationId));
 
    const totalLocations = countryLocations.length;
    const totalSales = countrySales.length;
 
    const totalRevenueUSD = countrySales.reduce(
      (sum, s) => sum + s.totalPrice.USD,
      0
    );
    const totalRevenueCOP = countrySales.reduce(
      (sum, s) => sum + s.totalPrice.COP,
      0
    );
 
    const avgRevenueUSD =
      totalLocations > 0 ? totalRevenueUSD / totalLocations : 0;
    const avgRevenueCOP =
      totalLocations > 0 ? totalRevenueCOP / totalLocations : 0;
 
    return {
      totalLocations,
      totalRevenue: {
        USD: Math.round(totalRevenueUSD * 100) / 100,
        COP: Math.round(totalRevenueCOP * 100) / 100,
      },
      averageRevenuePerLocation: {
        USD: Math.round(avgRevenueUSD * 100) / 100,
        COP: Math.round(avgRevenueCOP * 100) / 100,
      },
      totalSales,
    };
  };
 
  return {
    Colombia: buildMetrics("Colombia"),
    USA: buildMetrics("USA"),
  };
}