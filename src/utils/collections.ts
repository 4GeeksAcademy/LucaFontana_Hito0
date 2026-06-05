
//Retorna todas las ventas de la locación especificada
function filterSalesByLocation(sales: SaleTransaction[], locationId: string): SaleTransaction[]{
    return sales.filter(sale => sale.locationId === locationId);
}

//Retorna ventas que ocurrieron entre las fechas de inicio y fin (inclusive)
function filterSalesByDateRange(sales: SaleTransaction[], startDate: Date, endDate: Date): SaleTransaction[]{
    return sales.filter(sale => sale.timestamp >= startDate && sale.timestamp <= endDate);
}

// Retorna ítems de menú en la categoría especificada
function filterMenuItemsByCategory(items: MenuItem[], category: MenuCategory): MenuItem[]{
    return items.filter(item => item.category === category);
}

//Retorna todas las localizaciones que están activas
function filterActiveLocations(locations: Localizacion[]): Localizacion[]{
    return locations.filter(location => location.status === "Active");
}
//Retorna todas las localizaciones según un estado específico (Función customizada)
function filterCustomLocations(locations: Localizacion[], estado: LocationStatus): Localizacion[]{
    return locations.filter(location => location.status === estado);
}

//Retorna las localizaciones con mas asientos, ya sea en ascendente o descendente
function sortLocationsByCapacity(locations: Localizacion[], order: "asc" | "desc"): Localizacion[]{
    if (order === "asc") {
        return [...locations].sort((a, b) => a.seatingCapacity - b.seatingCapacity);
    } else {
        return [...locations].sort((a, b) => b.seatingCapacity - a.seatingCapacity);
    }
}

//Retornar items del menu ordenados por precio (Ascendente o descendente) segun la moneda especificada
function sortMenuItemsByPrice(items: MenuItem[], currency: "USD" | "COP", order: "asc" | "desc"): MenuItem[]{
    if (order === "asc") {
        return items.sort((a, b) => a.basePrice[currency] - b.basePrice[currency]);
    } else {
        return items.sort((a, b) => b.basePrice[currency] - a.basePrice[currency]);
    }
}
