
function validateMenuItem(item: MenuItem): {valid: boolean, errors: string[]}{
    let errores: string[] = []
    let valido: boolean = true; 

    //Validaciones solicitadas
    if (item.basePrice.USD <= 0) errores.push("Precio en dólares es 0 o menor");
    if (item.basePrice.COP <= 0) errores.push("Precio en pesos colombianos es 0 o menor");
    if (item.prepTimeMinutes < 0 || item.prepTimeMinutes > 60) errores.push("Tiempo de preparación supera los límites");
    if (!item.name) errores.push("El nombre no puede estar vacio");
    if (!item.isAvailableInColombia && !item.isAvailableInUSA) errores.push("El producto debe estar disponible en al menos un país");

    if (errores.length > 0) valido = false;

    return {valid: valido, errors: errores};
}

function validateTransaction(sale: SaleTransaction): {valid: boolean, errors: string[]}{
    let errores: string[] = []

    //Validaciones
    if (sale.quantity <= 0) errores.push("Debe haber al menos una cantidad");
    if (sale.totalPrice.USD <= 0 || sale.totalPrice.COP <= 0) errores.push("La cantidad debe ser mayor a 0 en ambas currencias");
    if (!sale.waiterName) errores.push("El nombre del mesero/a no puede estar vacío");

    return {valid: errores.length === 0, errors: errores};
}

function validateLocation(location: Localizacion): { valid: boolean, errors: string[] }{
    let errores: string[] = [];

    //Obtiene el año actual dinamicamente
    const anioActual: number = new Date().getFullYear();

    //Validaciones
    if (location.openingYear <= 0 || location.openingYear > anioActual) errores.push("Año inválido: debe ser mayor a 0 y menor que el actual");
    if (location.seatingCapacity <= 0) errores.push("La capacidad debe ser mayor a 0");
    if (location.staffCount <= 0) errores.push("La cantidad de empleados debe ser mayor a 0");
    if (location.monthlyRentCost.USD <= 0 || location.monthlyRentCost.COP <= 0) errores.push("El costo de renta debe ser positivo en ambas currencias");
    if (location.averageMonthlyUtilities.USD <= 0 || location.averageMonthlyUtilities.COP <= 0) errores.push("El costo de servicios mensuales no puede ser negativo o 0");

    return {valid: errores.length === 0, errors: errores};
}
