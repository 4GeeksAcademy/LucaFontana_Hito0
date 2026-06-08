// ============================================================
// test.ts  –  Datos de ejemplo y pruebas de todas las funciones
// ============================================================

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

import type {
  MenuItem,
  MenuCategory,
  SaleTransaction,
  PaymentMethod,
  Localizacion,
  LocationStatus,
  WasteRecord,
  WasteReason,
  CountryMetrics,
} from "./types/models";

// ─────────────────────────────────────────────────────────────
// FUNCIONES
// ─────────────────────────────────────────────────────────────

import {
  findLocationById,
  findMenuItemByName,
  binarySearchLocationByCapacity,
} from "./utils/search";

import {
  filterSalesByLocation,
  filterSalesByDateRange,
  filterMenuItemsByCategory,
  filterActiveLocations,
  filterCustomLocations,
  sortLocationsByCapacity,
  sortMenuItemsByPrice,
} from "./utils/collections";

import {
  validateMenuItem,
  validateTransaction,
  validateLocation,
} from "./utils/businessValidations";

import {
  convertCurrency,
  calculateLocationMargin,
  calculateWasteCost,
  scoreLocationPerformance,
  rankLocationsByPerformance,
  countSalesByPaymentMethod,
  calculateAverageTicket,
  findTopSellingItems,
  groupWasteByReason,
  calculateCountryComparison,
} from "./utils/transformations";

// ─────────────────────────────────────────────────────────────
// DATOS DE EJEMPLO
// ─────────────────────────────────────────────────────────────

// ── Locaciones ───────────────────────────────────────────────
const locations: Localizacion[] = [
  {
    id: "LOC-MED-01",
    name: "El Churrasco – Medellín El Poblado",
    city: "Medellín",
    country: "Colombia",
    openingYear: 2018,
    seatingCapacity: 80,
    staffCount: 12,
    monthlyRentCost:            { USD: 1500,  COP: 6_000_000  },
    averageMonthlyUtilities:    { USD: 300,   COP: 1_200_000  },
    manager: "Daniela Ríos",
    status: "Active",
  },
  {
    id: "LOC-BOG-01",
    name: "El Churrasco – Bogotá Zona Rosa",
    city: "Bogotá",
    country: "Colombia",
    openingYear: 2020,
    seatingCapacity: 120,
    staffCount: 18,
    monthlyRentCost:            { USD: 2200,  COP: 8_800_000  },
    averageMonthlyUtilities:    { USD: 450,   COP: 1_800_000  },
    manager: "Carlos Herrera",
    status: "Active",
  },
  {
    id: "LOC-CAL-01",
    name: "El Churrasco – Cali Granada",
    city: "Cali",
    country: "Colombia",
    openingYear: 2022,
    seatingCapacity: 60,
    staffCount: 9,
    monthlyRentCost:            { USD: 900,   COP: 3_600_000  },
    averageMonthlyUtilities:    { USD: 200,   COP: 800_000    },
    manager: "Valentina Ospina",
    status: "Under renovation",
  },
  {
    id: "LOC-MIA-01",
    name: "El Churrasco – Miami Brickell",
    city: "Miami",
    country: "USA",
    openingYear: 2019,
    seatingCapacity: 100,
    staffCount: 20,
    monthlyRentCost:            { USD: 8000,  COP: 32_000_000 },
    averageMonthlyUtilities:    { USD: 1200,  COP: 4_800_000  },
    manager: "Andrés Molina",
    status: "Active",
  },
  {
    id: "LOC-NYC-01",
    name: "El Churrasco – Nueva York Hell's Kitchen",
    city: "New York",
    country: "USA",
    openingYear: 2021,
    seatingCapacity: 90,
    staffCount: 15,
    monthlyRentCost:            { USD: 12000, COP: 48_000_000 },
    averageMonthlyUtilities:    { USD: 1800,  COP: 7_200_000  },
    manager: "Laura Castillo",
    status: "Temporarily closed",
  },
];

// ── Ítems de menú ────────────────────────────────────────────
const menuItems: MenuItem[] = [
  {
    id: "ITEM-PICANHA-250",
    name: "Picanha 250g",
    category: "Meat",
    basePrice:      { USD: 28,  COP: 112_000 },
    ingredientCost: { USD: 10,  COP: 40_000  },
    prepTimeMinutes: 20,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-RIBEYE-300",
    name: "Rib Eye 300g",
    category: "Meat",
    basePrice:      { USD: 35,  COP: 140_000 },
    ingredientCost: { USD: 14,  COP: 56_000  },
    prepTimeMinutes: 25,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-YUCA-FRITA",
    name: "Yuca Frita",
    category: "Side",
    basePrice:      { USD: 6,   COP: 24_000  },
    ingredientCost: { USD: 1.5, COP: 6_000   },
    prepTimeMinutes: 10,
    isAvailableInColombia: true,
    isAvailableInUSA: false,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-LIMONADA",
    name: "Limonada de Coco",
    category: "Beverage",
    basePrice:      { USD: 5,   COP: 20_000  },
    ingredientCost: { USD: 1,   COP: 4_000   },
    prepTimeMinutes: 5,
    isAvailableInColombia: true,
    isAvailableInUSA: false,
    allergens: ["dairy"],
    status: "Active",
  },
  {
    id: "ITEM-CHEESECAKE",
    name: "Cheesecake de Maracuyá",
    category: "Dessert",
    basePrice:      { USD: 8,   COP: 32_000  },
    ingredientCost: { USD: 2.5, COP: 10_000  },
    prepTimeMinutes: 3,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: ["dairy", "gluten"],
    status: "Seasonal",
  },
  {
    id: "ITEM-COMBO-FAMILIAR",
    name: "Combo Familiar",
    category: "Combo",
    basePrice:      { USD: 65,  COP: 260_000 },
    ingredientCost: { USD: 22,  COP: 88_000  },
    prepTimeMinutes: 35,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-SMASH-BURGER",
    name: "Smash Burger",
    category: "Meat",
    basePrice:      { USD: 18,  COP: 72_000  },
    ingredientCost: { USD: 6,   COP: 24_000  },
    prepTimeMinutes: 15,
    isAvailableInColombia: false,
    isAvailableInUSA: true,
    allergens: ["gluten"],
    status: "Discontinued",
  },
];

// ── Transacciones de venta ───────────────────────────────────
const sales: SaleTransaction[] = [
  // Medellín
  { id: "TXN-2024-001", locationId: "LOC-MED-01", itemId: "ITEM-PICANHA-250",    quantity: 2, totalPrice: { USD: 56,  COP: 224_000 }, paymentMethod: "Credit card",    timestamp: new Date("2024-03-10T12:30:00"), waiterName: "Juan Pérez"      },
  { id: "TXN-2024-002", locationId: "LOC-MED-01", itemId: "ITEM-LIMONADA",        quantity: 3, totalPrice: { USD: 15,  COP: 60_000  }, paymentMethod: "Cash",           timestamp: new Date("2024-03-10T13:00:00"), waiterName: "Juan Pérez"      },
  { id: "TXN-2024-003", locationId: "LOC-MED-01", itemId: "ITEM-YUCA-FRITA",      quantity: 2, totalPrice: { USD: 12,  COP: 48_000  }, paymentMethod: "Debit card",     timestamp: new Date("2024-03-11T19:15:00"), waiterName: "Sofía Gómez"     },
  { id: "TXN-2024-004", locationId: "LOC-MED-01", itemId: "ITEM-COMBO-FAMILIAR",  quantity: 1, totalPrice: { USD: 65,  COP: 260_000 }, paymentMethod: "Digital wallet", timestamp: new Date("2024-03-12T20:00:00"), waiterName: "Juan Pérez"      },
  { id: "TXN-2024-005", locationId: "LOC-MED-01", itemId: "ITEM-RIBEYE-300",      quantity: 1, totalPrice: { USD: 35,  COP: 140_000 }, paymentMethod: "Credit card",    timestamp: new Date("2024-03-13T21:00:00"), waiterName: "Sofía Gómez"     },

  // Bogotá
  { id: "TXN-2024-006", locationId: "LOC-BOG-01", itemId: "ITEM-RIBEYE-300",      quantity: 3, totalPrice: { USD: 105, COP: 420_000 }, paymentMethod: "Credit card",    timestamp: new Date("2024-03-10T13:00:00"), waiterName: "Mariana López"   },
  { id: "TXN-2024-007", locationId: "LOC-BOG-01", itemId: "ITEM-PICANHA-250",     quantity: 4, totalPrice: { USD: 112, COP: 448_000 }, paymentMethod: "Cash",           timestamp: new Date("2024-03-11T20:00:00"), waiterName: "Diego Torres"    },
  { id: "TXN-2024-008", locationId: "LOC-BOG-01", itemId: "ITEM-CHEESECAKE",      quantity: 5, totalPrice: { USD: 40,  COP: 160_000 }, paymentMethod: "Digital wallet", timestamp: new Date("2024-03-12T21:30:00"), waiterName: "Mariana López"   },
  { id: "TXN-2024-009", locationId: "LOC-BOG-01", itemId: "ITEM-LIMONADA",        quantity: 6, totalPrice: { USD: 30,  COP: 120_000 }, paymentMethod: "Debit card",     timestamp: new Date("2024-03-13T12:00:00"), waiterName: "Diego Torres"    },
  { id: "TXN-2024-010", locationId: "LOC-BOG-01", itemId: "ITEM-COMBO-FAMILIAR",  quantity: 2, totalPrice: { USD: 130, COP: 520_000 }, paymentMethod: "Credit card",    timestamp: new Date("2024-03-14T19:00:00"), waiterName: "Mariana López"   },

  // Miami
  { id: "TXN-2024-011", locationId: "LOC-MIA-01", itemId: "ITEM-PICANHA-250",     quantity: 3, totalPrice: { USD: 84,  COP: 336_000 }, paymentMethod: "Credit card",    timestamp: new Date("2024-03-10T20:00:00"), waiterName: "Roberto Vargas"  },
  { id: "TXN-2024-012", locationId: "LOC-MIA-01", itemId: "ITEM-RIBEYE-300",      quantity: 2, totalPrice: { USD: 70,  COP: 280_000 }, paymentMethod: "Digital wallet", timestamp: new Date("2024-03-11T21:00:00"), waiterName: "Roberto Vargas"  },
  { id: "TXN-2024-013", locationId: "LOC-MIA-01", itemId: "ITEM-SMASH-BURGER",    quantity: 4, totalPrice: { USD: 72,  COP: 288_000 }, paymentMethod: "Cash",           timestamp: new Date("2024-03-12T13:00:00"), waiterName: "Camila Restrepo" },
  { id: "TXN-2024-014", locationId: "LOC-MIA-01", itemId: "ITEM-CHEESECAKE",      quantity: 3, totalPrice: { USD: 24,  COP: 96_000  }, paymentMethod: "Credit card",    timestamp: new Date("2024-03-13T14:00:00"), waiterName: "Camila Restrepo" },
  { id: "TXN-2024-015", locationId: "LOC-MIA-01", itemId: "ITEM-COMBO-FAMILIAR",  quantity: 2, totalPrice: { USD: 130, COP: 520_000 }, paymentMethod: "Debit card",     timestamp: new Date("2024-03-14T20:30:00"), waiterName: "Roberto Vargas"  },
];

// ── Registros de desperdicio ─────────────────────────────────
const wasteRecords: WasteRecord[] = [
  { id: "WST-001", locationId: "LOC-MED-01", itemId: "ITEM-PICANHA-250",   quantity: 1, reason: "Expired",        cost: { USD: 10,  COP: 40_000 },  timestamp: new Date("2024-03-10T08:00:00"), reportedBy: "Juan Pérez"      },
  { id: "WST-002", locationId: "LOC-MED-01", itemId: "ITEM-LIMONADA",      quantity: 2, reason: "Cooking error",  cost: { USD: 2,   COP: 8_000  },  timestamp: new Date("2024-03-11T09:00:00"), reportedBy: "Sofía Gómez"     },
  { id: "WST-003", locationId: "LOC-BOG-01", itemId: "ITEM-RIBEYE-300",    quantity: 1, reason: "Customer return", cost: { USD: 14,  COP: 56_000 }, timestamp: new Date("2024-03-11T18:00:00"), reportedBy: "Mariana López"   },
  { id: "WST-004", locationId: "LOC-BOG-01", itemId: "ITEM-CHEESECAKE",    quantity: 3, reason: "Damage",         cost: { USD: 7.5, COP: 30_000 },  timestamp: new Date("2024-03-12T10:00:00"), reportedBy: "Diego Torres"    },
  { id: "WST-005", locationId: "LOC-MIA-01", itemId: "ITEM-SMASH-BURGER",  quantity: 2, reason: "Expired",        cost: { USD: 12,  COP: 48_000 },  timestamp: new Date("2024-03-10T07:30:00"), reportedBy: "Roberto Vargas"  },
  { id: "WST-006", locationId: "LOC-MIA-01", itemId: "ITEM-COMBO-FAMILIAR",quantity: 1, reason: "Other",          cost: { USD: 22,  COP: 88_000 },  timestamp: new Date("2024-03-13T11:00:00"), reportedBy: "Camila Restrepo" },
  { id: "WST-007", locationId: "LOC-BOG-01", itemId: "ITEM-PICANHA-250",   quantity: 2, reason: "Cooking error",  cost: { USD: 20,  COP: 80_000 },  timestamp: new Date("2024-03-14T09:30:00"), reportedBy: "Mariana López"   },
];

// ─────────────────────────────────────────────────────────────
// PRUEBAS
// ─────────────────────────────────────────────────────────────

function section(title: string): void {
  console.log("\n" + "═".repeat(60));
  console.log(`  ${title}`);
  console.log("═".repeat(60));
}

function test(label: string, result: unknown): void {
  console.log(`\n▸ ${label}`);
  console.log(JSON.stringify(result, null, 2));
}

// ─────────────────────────────────────────────────────────────
// PRUEBAS
// ─────────────────────────────────────────────────────────────

// ── 1. BÚSQUEDA ──────────────────────────────────────────────
section("1. BÚSQUEDA");

test(
  "findLocationById('LOC-MED-01')  →  debe encontrar Medellín",
  findLocationById(locations, "LOC-MED-01")
);

test(
  "findLocationById('LOC-XXX-99')  →  debe retornar null",
  findLocationById(locations, "LOC-XXX-99")
);

test(
  "findMenuItemByName('picanha 250g')  →  búsqueda case-insensitive",
  findMenuItemByName(menuItems, "picanha 250g")
);

test(
  "findMenuItemByName('Inexistente')  →  debe retornar null",
  findMenuItemByName(menuItems, "Inexistente")
);

// binarySearch requiere array ordenado por capacidad
const sortedByCapacity = sortLocationsByCapacity(locations, "asc");
test(
  "binarySearchLocationByCapacity(capacity=90)  →  índice en array ordenado",
  {
    index: binarySearchLocationByCapacity(sortedByCapacity, 90),
    location: sortedByCapacity[binarySearchLocationByCapacity(sortedByCapacity, 90)]?.name ?? "No encontrado",
  }
);

test(
  "binarySearchLocationByCapacity(capacity=999)  →  debe retornar -1",
  binarySearchLocationByCapacity(sortedByCapacity, 999)
);

// ── 2. FILTROS ───────────────────────────────────────────────
section("2. FILTROS");

test(
  "filterSalesByLocation('LOC-BOG-01')  →  5 transacciones de Bogotá",
  filterSalesByLocation(sales, "LOC-BOG-01").map(s => s.id)
);

test(
  "filterSalesByDateRange(11-Mar al 12-Mar)  →  ventas en ese rango",
  filterSalesByDateRange(sales, new Date("2024-03-11"), new Date("2024-03-12T23:59:59"))
    .map(s => ({ id: s.id, date: s.timestamp.toISOString().slice(0, 10) }))
);

test(
  "filterMenuItemsByCategory('Meat')  →  ítems de carne",
  filterMenuItemsByCategory(menuItems, "Meat").map(i => i.name)
);

test(
  "filterActiveLocations()  →  solo locaciones activas",
  filterActiveLocations(locations).map(l => `${l.name} (${l.status})`)
);

test(
  "filterCustomLocations('Under renovation')  →  en renovación",
  filterCustomLocations(locations, "Under renovation").map(l => l.name)
);

test(
  "sortLocationsByCapacity('asc')  →  de menor a mayor capacidad",
  sortLocationsByCapacity(locations, "asc").map(l => `${l.name}: ${l.seatingCapacity} asientos`)
);

test(
  "sortMenuItemsByPrice('USD', 'desc')  →  de más caro a más barato",
  sortMenuItemsByPrice(menuItems, "USD", "desc").map(i => `${i.name}: $${i.basePrice.USD}`)
);

// ── 3. VALIDACIONES ──────────────────────────────────────────
section("3. VALIDACIONES");

test(
  "validateMenuItem(Picanha 250g)  →  ítem válido",
  validateMenuItem(menuItems[0])
);

const badItem: MenuItem = {
  ...menuItems[0],
  name: "",
  basePrice: { USD: -5, COP: 0 },
  isAvailableInColombia: false,
  isAvailableInUSA: false,
  prepTimeMinutes: 90,
};
test(
  "validateMenuItem(ítem inválido)  →  múltiples errores",
  validateMenuItem(badItem)
);

test(
  "validateTransaction(TXN-2024-001)  →  transacción válida",
  validateTransaction(sales[0])
);

const badSale: SaleTransaction = { ...sales[0], quantity: 0, waiterName: "", totalPrice: { USD: -10, COP: -40000 } };
test(
  "validateTransaction(transacción inválida)  →  errores",
  validateTransaction(badSale)
);

test(
  "validateLocation(LOC-MED-01)  →  locación válida",
  validateLocation(locations[0])
);

const badLocation: Localizacion = { ...locations[0], openingYear: 2099, seatingCapacity: 0, staffCount: -1 };
test(
  "validateLocation(locación inválida)  →  errores",
  validateLocation(badLocation)
);

// ── 4. CÁLCULOS ──────────────────────────────────────────────
section("4. CÁLCULOS");

test(
  "convertCurrency(100 USD → COP)  →  400000",
  convertCurrency(100, "USD", "COP")
);

test(
  "convertCurrency(400000 COP → USD)  →  100",
  convertCurrency(400_000, "COP", "USD")
);

test(
  "convertCurrency(misma moneda)  →  valor sin cambio",
  convertCurrency(250, "USD", "USD")
);

test(
  "calculateLocationMargin(LOC-MED-01, USD)  →  margen en %",
  calculateLocationMargin(sales, menuItems, "LOC-MED-01", "USD")
);

test(
  "calculateLocationMargin(LOC-BOG-01, COP)  →  margen en %",
  calculateLocationMargin(sales, menuItems, "LOC-BOG-01", "COP")
);

test(
  "calculateLocationMargin(LOC-SIN-VENTAS, USD)  →  0",
  calculateLocationMargin(sales, menuItems, "LOC-CAL-01", "USD")
);

test(
  "calculateWasteCost(LOC-MED-01, USD)",
  calculateWasteCost(wasteRecords, "LOC-MED-01", "USD")
);

test(
  "calculateWasteCost(LOC-BOG-01, COP)",
  calculateWasteCost(wasteRecords, "LOC-BOG-01", "COP")
);

// ── 5. TRANSFORMACIONES ──────────────────────────────────────
section("5. TRANSFORMACIONES");

test(
  "scoreLocationPerformance(LOC-MED-01)",
  scoreLocationPerformance(locations[0], sales, wasteRecords, menuItems)
);

test(
  "scoreLocationPerformance(LOC-MIA-01)",
  scoreLocationPerformance(locations[3], sales, wasteRecords, menuItems)
);

test(
  "scoreLocationPerformance(LOC-CAL-01, sin ventas)  →  score bajo",
  scoreLocationPerformance(locations[2], sales, wasteRecords, menuItems)
);

test(
  "rankLocationsByPerformance()  →  ranking completo",
  rankLocationsByPerformance(locations, sales, wasteRecords, menuItems)
    .map((r, i) => `#${i + 1} ${r.location.name} → ${r.score} pts`)
);

test(
  "countSalesByPaymentMethod()  →  conteo por método",
  countSalesByPaymentMethod(sales)
);

test(
  "calculateAverageTicket(USD)",
  calculateAverageTicket(sales, "USD")
);

test(
  "calculateAverageTicket(COP)",
  calculateAverageTicket(sales, "COP")
);

test(
  "calculateAverageTicket(array vacío)  →  0",
  calculateAverageTicket([], "USD")
);

test(
  "findTopSellingItems(top 3)",
  findTopSellingItems(sales, menuItems, 3)
    .map(r => `${r.item.name}: ${r.totalSold} unidades`)
);

test(
  "groupWasteByReason()  →  agrupado por causa",
  Object.fromEntries(
    Object.entries(groupWasteByReason(wasteRecords))
      .map(([reason, records]) => [reason, records.map(r => r.id)])
  )
);

test(
  "calculateCountryComparison()  →  métricas por país",
  calculateCountryComparison(sales, locations, menuItems)
);