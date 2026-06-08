# 📚 Documentación de Funciones

Este documento describe todas las funciones disponibles en los módulos `src/utils/`. El proyecto está organizado en 4 módulos principales de utilidad.

---

## 📑 Tabla de Contenidos

1. [Transformations](#transformations--cálculos-y-análisis)
2. [Search](#search--búsquedas)
3. [Collections](#collections--filtros-y-ordenamiento)
4. [Business Validations](#businessvalidations--validaciones-de-datos)

---

## 🔄 Transformations – Cálculos y análisis

**Archivo:** `src/utils/transformations.ts`

Módulo encargado de cálculos financieros, análisis de rendimiento y transformación de datos.

### `calculateDailyRevenue(sales, date, currency)`

Calcula los ingresos totales de un día específico.

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas
- `date` (Date): Fecha a filtrar
- `currency` ("USD" | "COP"): Moneda de cálculo

**Retorna:** `number` - Total de ingresos redondeado a 2 decimales

**Ejemplo:**
```typescript
const revenue = calculateDailyRevenue(sales, new Date('2024-03-11'), 'USD');
// Retorna: 1250.50
```

---

### `calculateLocationMargin(sales, menuItems, locationId, currency)`

Calcula el margen de ganancia (utilidad bruta) de una locación.

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas
- `menuItems` (MenuItem[]): Catálogo de ítems del menú
- `locationId` (string): ID de la locación
- `currency` ("USD" | "COP"): Moneda de cálculo

**Retorna:** `number` - Porcentaje de margen (0-100%)

**Fórmula:** `((ingresos - costo_ingredientes) / ingresos) * 100`

**Ejemplo:**
```typescript
const margin = calculateLocationMargin(sales, menuItems, 'LOC-MED-01', 'USD');
// Retorna: 65.75 (margen del 65.75%)
```

---

### `calculateWasteCost(wasteRecords, locationId, currency)`

Suma el costo total de desperdicio en una locación.

**Parámetros:**
- `wasteRecords` (WasteRecord[]): Registro de desperdicios
- `locationId` (string): ID de la locación
- `currency` ("USD" | "COP"): Moneda de cálculo

**Retorna:** `number` - Costo total redondeado a 2 decimales

**Ejemplo:**
```typescript
const wasteCost = calculateWasteCost(wasteRecords, 'LOC-BOG-01', 'COP');
// Retorna: 125000 (pesos colombianos)
```

---

### `convertCurrency(amount, fromCurrency, toCurrency)`

Convierte entre USD y COP usando tasa fija.

**Parámetros:**
- `amount` (number): Cantidad a convertir
- `fromCurrency` ("USD" | "COP"): Moneda de origen
- `toCurrency` ("USD" | "COP"): Moneda de destino

**Retorna:** `number` - Cantidad convertida redondeada a 2 decimales

**Tasa:** 1 USD = 4000 COP

**Ejemplo:**
```typescript
const cop = convertCurrency(100, 'USD', 'COP');
// Retorna: 400000

const usd = convertCurrency(4000, 'COP', 'USD');
// Retorna: 1
```

---

### `scoreLocationPerformance(location, sales, wasteRecords, menuItems)`

Calcula un puntaje de rendimiento (0-100) para una locación basado en 4 criterios.

**Parámetros:**
- `location` (Localizacion): Datos de la locación
- `sales` (SaleTransaction[]): Ventas de la locación
- `wasteRecords` (WasteRecord[]): Registros de desperdicio
- `menuItems` (MenuItem[]): Catálogo del menú

**Retorna:** `number` - Puntaje total (0-100)

**Criterios de Puntuación:**
| Criterio | Puntos Máx | Descripción |
|----------|-----------|-------------|
| Ingresos | 40 | Ingresos promedio diarios en USD |
| Eficiencia de Asientos | 30 | Proporción: ventas / capacidad |
| Control de Desperdicio | 20 | Penalización según % de desperdicio |
| Margen de Ganancia | 10 | Porcentaje de utilidad |

**Ejemplo:**
```typescript
const score = scoreLocationPerformance(location, sales, wasteRecords, menuItems);
// Retorna: 78.5
```

---

### `rankLocationsByPerformance(locations, sales, wasteRecords, menuItems)`

Ordena todas las locaciones por puntaje de rendimiento (mayor a menor).

**Parámetros:**
- `locations` (Localizacion[]): Array de locaciones
- `sales` (SaleTransaction[]): Todas las ventas
- `wasteRecords` (WasteRecord[]): Registros de desperdicio
- `menuItems` (MenuItem[]): Catálogo del menú

**Retorna:** `Array<{ location: Localizacion; score: number }>` - Locaciones ordenadas

**Ejemplo:**
```typescript
const ranking = rankLocationsByPerformance(locations, sales, wasteRecords, menuItems);
// Retorna:
// [
//   { location: {...}, score: 85.2 },
//   { location: {...}, score: 72.1 },
//   { location: {...}, score: 68.9 }
// ]
```

---

### `countSalesByPaymentMethod(sales)`

Cuenta las ventas por método de pago.

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas

**Retorna:** `Record<PaymentMethod, number>` - Conteo por método

**Métodos disponibles:** Cash, Credit card, Debit card, Digital wallet

**Ejemplo:**
```typescript
const counts = countSalesByPaymentMethod(sales);
// Retorna:
// {
//   Cash: 25,
//   "Credit card": 45,
//   "Debit card": 18,
//   "Digital wallet": 12
// }
```

---

### `calculateAverageTicket(sales, currency)`

Calcula el valor promedio de cada venta.

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas
- `currency` ("USD" | "COP"): Moneda de cálculo

**Retorna:** `number` - Ticket promedio redondeado a 2 decimales

**Ejemplo:**
```typescript
const avgTicket = calculateAverageTicket(sales, 'USD');
// Retorna: 45.80
```

---

### `findTopSellingItems(sales, menuItems, topN)`

Encuentra los N ítems de menú más vendidos por cantidad.

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas
- `menuItems` (MenuItem[]): Catálogo del menú
- `topN` (number): Cantidad de ítems a retornar

**Retorna:** `Array<{ item: MenuItem; totalSold: number }>` - Top N ítems

**Ejemplo:**
```typescript
const topItems = findTopSellingItems(sales, menuItems, 5);
// Retorna:
// [
//   { item: {..., name: "Picanha 250g"}, totalSold: 156 },
//   { item: {..., name: "Bife de Costilla"}, totalSold: 142 },
//   ...
// ]
```

---

### `groupWasteByReason(wasteRecords)`

Agrupa registros de desperdicio por razón.

**Parámetros:**
- `wasteRecords` (WasteRecord[]): Array de registros

**Retorna:** `Record<WasteReason, WasteRecord[]>` - Agrupado por razón

**Razones disponibles:** Expired, Cooking error, Customer return, Damage, Other

**Ejemplo:**
```typescript
const grouped = groupWasteByReason(wasteRecords);
// Retorna:
// {
//   Expired: [{...}, {...}],
//   "Cooking error": [{...}],
//   "Customer return": [],
//   Damage: [{...}],
//   Other: [{...}, {...}]
// }
```

---

### `calculateCountryComparison(sales, locations, menuItems)`

Compara métricas entre Colombia y USA.

**Parámetros:**
- `sales` (SaleTransaction[]): Todas las ventas
- `locations` (Localizacion[]): Todas las locaciones
- `menuItems` (MenuItem[]): Catálogo del menú

**Retorna:** `{ Colombia: CountryMetrics; USA: CountryMetrics }`

**Métricas por país:**
- `totalLocations`: Número de locaciones
- `totalRevenue`: Ingresos totales (USD y COP)
- `averageRevenuePerLocation`: Promedio por locación (USD y COP)
- `totalSales`: Cantidad de transacciones

**Ejemplo:**
```typescript
const comparison = calculateCountryComparison(sales, locations, menuItems);
// Retorna:
// {
//   Colombia: {
//     totalLocations: 3,
//     totalRevenue: { USD: 5240.50, COP: 20962000 },
//     averageRevenuePerLocation: { USD: 1746.83, COP: 6987333.33 },
//     totalSales: 45
//   },
//   USA: { ... }
// }
```

---

## 🔍 Search – Búsquedas

**Archivo:** `src/utils/search.ts`

Módulo para buscar elementos específicos en arrays.

### `findLocationById(locations, id)`

Busca una locación por su ID.

**Parámetros:**
- `locations` (Localizacion[]): Array de locaciones
- `id` (string): ID a buscar

**Retorna:** `Localizacion | null` - La locación o null si no existe

**Complejidad:** O(n) - Búsqueda lineal

**Ejemplo:**
```typescript
const location = findLocationById(locations, 'LOC-MED-01');
// Retorna: { id: 'LOC-MED-01', name: "El Churrasco – Medellín...", ... }
```

---

### `findMenuItemByName(items, name)`

Busca un ítem de menú por nombre (sin importar mayúsculas/minúsculas).

**Parámetros:**
- `items` (MenuItem[]): Array de ítems del menú
- `name` (string): Nombre a buscar

**Retorna:** `MenuItem | null` - El ítem o null si no existe

**Características:**
- Búsqueda **case-insensitive** (ignora mayúsculas)
- Match exacto (no parcial)

**Complejidad:** O(n)

**Ejemplo:**
```typescript
const item = findMenuItemByName(menuItems, 'picanha 250g');
// Retorna: { id: 'ITEM-PICANHA-250', name: "Picanha 250g", ... }

const item2 = findMenuItemByName(menuItems, 'PICANHA 250G');
// Retorna lo mismo (case-insensitive)
```

---

### `binarySearchLocationByCapacity(sortedLocations, targetCapacity)`

Búsqueda binaria para encontrar una locación con capacidad exacta.

**Parámetros:**
- `sortedLocations` (Localizacion[]): Array **ordenado** por capacidad
- `targetCapacity` (number): Capacidad a buscar

**Retorna:** `number` - Índice en el array, o -1 si no existe

**⚠️ Requisito:** El array debe estar ordenado por `seatingCapacity`

**Complejidad:** O(log n) - Búsqueda binaria

**Ejemplo:**
```typescript
const sorted = sortLocationsByCapacity(locations, 'asc');
const index = binarySearchLocationByCapacity(sorted, 90);
// Retorna: 2 (índice de la locación con capacidad 90)

const notFound = binarySearchLocationByCapacity(sorted, 999);
// Retorna: -1 (no existe locación con esa capacidad)
```

---

## 🗂️ Collections – Filtros y Ordenamiento

**Archivo:** `src/utils/collections.ts`

Módulo para filtrar, buscar y ordenar colecciones de datos.

### `filterSalesByLocation(sales, locationId)`

Retorna todas las ventas de una locación específica.

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas
- `locationId` (string): ID de la locación

**Retorna:** `SaleTransaction[]` - Ventas de esa locación

**Ejemplo:**
```typescript
const bogotaSales = filterSalesByLocation(sales, 'LOC-BOG-01');
// Retorna: [{ id: 'TXN-2024-006', locationId: 'LOC-BOG-01', ... }, ...]
```

---

### `filterSalesByDateRange(sales, startDate, endDate)`

Retorna ventas entre dos fechas (inclusive).

**Parámetros:**
- `sales` (SaleTransaction[]): Array de ventas
- `startDate` (Date): Fecha de inicio (inclusive)
- `endDate` (Date): Fecha de fin (inclusive)

**Retorna:** `SaleTransaction[]` - Ventas en el rango de fechas

**Ejemplo:**
```typescript
const start = new Date('2024-03-11');
const end = new Date('2024-03-12');
const filtered = filterSalesByDateRange(sales, start, end);
// Retorna ventas del 11 y 12 de marzo
```

---

### `filterMenuItemsByCategory(items, category)`

Retorna ítems de menú de una categoría específica.

**Parámetros:**
- `items` (MenuItem[]): Array de ítems del menú
- `category` (MenuCategory): Categoría a filtrar

**Retorna:** `MenuItem[]` - Ítems de esa categoría

**Categorías disponibles:** Meat, Appetizer, Beverage, Dessert, etc.

**Ejemplo:**
```typescript
const meatItems = filterMenuItemsByCategory(menuItems, 'Meat');
// Retorna: [{ name: "Picanha 250g", category: "Meat", ... }, ...]
```

---

### `filterActiveLocations(locations)`

Retorna solo las locaciones con estado "Active".

**Parámetros:**
- `locations` (Localizacion[]): Array de locaciones

**Retorna:** `Localizacion[]` - Locaciones activas

**Ejemplo:**
```typescript
const active = filterActiveLocations(locations);
// Retorna: [{ id: 'LOC-MED-01', status: 'Active', ... }, ...]
```

---

### `filterCustomLocations(locations, estado)`

Retorna locaciones con un estado específico (customizable).

**Parámetros:**
- `locations` (Localizacion[]): Array de locaciones
- `estado` (LocationStatus): Estado a filtrar

**Retorna:** `Localizacion[]` - Locaciones con ese estado

**Estados disponibles:** Active, Inactive, Maintenance

**Ejemplo:**
```typescript
const maintenance = filterCustomLocations(locations, 'Maintenance');
// Retorna: [{ id: 'LOC-NYC-02', status: 'Maintenance', ... }]
```

---

### `sortLocationsByCapacity(locations, order)`

Ordena locaciones por capacidad de asientos.

**Parámetros:**
- `locations` (Localizacion[]): Array de locaciones
- `order` ("asc" | "desc"): Orden ascendente o descendente

**Retorna:** `Localizacion[]` - Locaciones ordenadas

**Nota:** Retorna un nuevo array (no modifica el original)

**Ejemplo:**
```typescript
const ascending = sortLocationsByCapacity(locations, 'asc');
// Retorna: [
//   { name: "...", seatingCapacity: 40 },
//   { name: "...", seatingCapacity: 80 },
//   { name: "...", seatingCapacity: 100 }
// ]

const descending = sortLocationsByCapacity(locations, 'desc');
// Orden inverso
```

---

### `sortMenuItemsByPrice(items, currency, order)`

Ordena ítems del menú por precio en una moneda específica.

**Parámetros:**
- `items` (MenuItem[]): Array de ítems
- `currency` ("USD" | "COP"): Moneda para ordenar
- `order` ("asc" | "desc"): Orden ascendente o descendente

**Retorna:** `MenuItem[]` - Ítems ordenados

**Ejemplo:**
```typescript
const sortedByUSD = sortMenuItemsByPrice(menuItems, 'USD', 'asc');
// Retorna: [
//   { name: "Agua", basePrice: { USD: 2, ... } },
//   { name: "Picanha 250g", basePrice: { USD: 28, ... } }
// ]

const sortedByCOP = sortMenuItemsByPrice(menuItems, 'COP', 'desc');
// Ordenado por COP de mayor a menor
```

---

## ✅ BusinessValidations – Validaciones de Datos

**Archivo:** `src/utils/businessValidations.ts`

Módulo para validar integridad de datos según reglas de negocio.

Todas las funciones retornan: `{ valid: boolean; errors: string[] }`

---

### `validateMenuItem(item)`

Valida un ítem del menú según reglas de negocio.

**Parámetros:**
- `item` (MenuItem): Ítem a validar

**Retorna:** `{ valid: boolean; errors: string[] }`

**Validaciones:**
| Regla | Mensaje de Error |
|------|-----------------|
| Precio USD > 0 | "Precio en dólares es 0 o menor" |
| Precio COP > 0 | "Precio en pesos colombianos es 0 o menor" |
| Tiempo prep: 0-60 min | "Tiempo de preparación supera los límites" |
| Nombre no vacío | "El nombre no puede estar vacio" |
| Disponible en ≥1 país | "El producto debe estar disponible en al menos un país" |

**Ejemplo:**
```typescript
const item = { 
  name: "Picanha 250g",
  basePrice: { USD: 28, COP: 112000 },
  prepTimeMinutes: 20,
  isAvailableInColombia: true,
  isAvailableInUSA: false
};

const result = validateMenuItem(item);
// Retorna: { valid: true, errors: [] }

const invalidItem = { 
  name: "",
  basePrice: { USD: 0, COP: 0 },
  prepTimeMinutes: 90,
  isAvailableInColombia: false,
  isAvailableInUSA: false
};

const invalidResult = validateMenuItem(invalidItem);
// Retorna: { valid: false, errors: [
//   "Precio en dólares es 0 o menor",
//   "Precio en pesos colombianos es 0 o menor",
//   "Tiempo de preparación supera los límites",
//   "El nombre no puede estar vacio",
//   "El producto debe estar disponible en al menos un país"
// ]}
```

---

### `validateTransaction(sale)`

Valida una transacción de venta según reglas de negocio.

**Parámetros:**
- `sale` (SaleTransaction): Transacción a validar

**Retorna:** `{ valid: boolean; errors: string[] }`

**Validaciones:**
| Regla | Mensaje de Error |
|------|-----------------|
| Cantidad ≥ 1 | "Debe haber al menos una cantidad" |
| Precio USD > 0 | "La cantidad debe ser mayor a 0 en ambas currencias" |
| Precio COP > 0 | "La cantidad debe ser mayor a 0 en ambas currencias" |
| Nombre del mesero no vacío | "El nombre del mesero/a no puede estar vacío" |

**Ejemplo:**
```typescript
const validSale = { 
  quantity: 2,
  totalPrice: { USD: 56, COP: 224000 },
  waiterName: "Carlos"
};

const result = validateTransaction(validSale);
// Retorna: { valid: true, errors: [] }

const invalidSale = { 
  quantity: 0,
  totalPrice: { USD: 0, COP: 0 },
  waiterName: ""
};

const invalidResult = validateTransaction(invalidSale);
// Retorna: { valid: false, errors: [
//   "Debe haber al menos una cantidad",
//   "La cantidad debe ser mayor a 0 en ambas currencias",
//   "El nombre del mesero/a no puede estar vacío"
// ]}
```

---

### `validateLocation(location)`

Valida datos de una locación según reglas de negocio.

**Parámetros:**
- `location` (Localizacion): Locación a validar

**Retorna:** `{ valid: boolean; errors: string[] }`

**Validaciones:**
| Regla | Mensaje de Error |
|------|-----------------|
| Año apertura: 1 < año ≤ actual | "Año inválido: debe ser mayor a 0 y menor que el actual" |
| Capacidad > 0 | "La capacidad debe ser mayor a 0" |
| Personal > 0 | "La cantidad de empleados debe ser mayor a 0" |
| Renta USD > 0 | "El costo de renta debe ser positivo en ambas currencias" |
| Renta COP > 0 | "El costo de renta debe ser positivo en ambas currencias" |
| Servicios USD > 0 | "El costo de servicios mensuales no puede ser negativo o 0" |
| Servicios COP > 0 | "El costo de servicios mensuales no puede ser negativo o 0" |

**Ejemplo:**
```typescript
const validLocation = { 
  openingYear: 2018,
  seatingCapacity: 80,
  staffCount: 12,
  monthlyRentCost: { USD: 1500, COP: 6000000 },
  averageMonthlyUtilities: { USD: 300, COP: 1200000 }
};

const result = validateLocation(validLocation);
// Retorna: { valid: true, errors: [] }

const invalidLocation = { 
  openingYear: 2030,
  seatingCapacity: 0,
  staffCount: -5,
  monthlyRentCost: { USD: 0, COP: -100000 },
  averageMonthlyUtilities: { USD: -50, COP: 0 }
};

const invalidResult = validateLocation(invalidLocation);
// Retorna: { valid: false, errors: [
//   "Año inválido: debe ser mayor a 0 y menor que el actual",
//   "La capacidad debe ser mayor a 0",
//   "La cantidad de empleados debe ser mayor a 0",
//   "El costo de renta debe ser positivo en ambas currencias",
//   "El costo de servicios mensuales no puede ser negativo o 0"
// ]}
```

---

## 📋 Resumen Rápido

| Módulo | Función Principal | Cantidad de Funciones |
|--------|-------------------|----------------------|
| **Transformations** | Cálculos y análisis de datos | 11 |
| **Search** | Búsqueda de elementos | 3 |
| **Collections** | Filtros y ordenamiento | 7 |
| **BusinessValidations** | Validación de datos | 3 |
| **TOTAL** | — | **24 funciones** |

---

## 🚀 Cómo Usar

### Instalación

```bash
cd src
npm install
```

### Ejecución de Tests

```bash
# Compilar TypeScript
npx tsc

# Ejecutar tests
node test.js

# O directamente con tsx (recomendado)
npx tsx test.ts
```

### Importar Funciones

```typescript
import {
  findLocationById,
  findMenuItemByName,
} from './utils/search';

import {
  calculateLocationMargin,
  scoreLocationPerformance,
} from './utils/transformations';

// Usar funciones...
```

---

**Última actualización:** 2026-06-08
