import { MenuItem, Localizacion } from "../types/models";

// ─────────────────────────────────────────────────────────────
// Búsquedas
// ─────────────────────────────────────────────────────────────

export function findLocationById(locations: Localizacion[], id: string): Localizacion | null{
    for (const location of locations) {
        if (location.id === id) {
            return location;
        }
    }
    return null;
}

export function findMenuItemByName(items: MenuItem[], name: string): MenuItem | null {
    for (const item of items) {
        if (item.name.toLowerCase() === name.toLowerCase()) {
            return item;
        }
    }
    return null;
}

export function binarySearchLocationByCapacity(sortedLocations: Localizacion[], targetCapacity: number): number {
    let left = 0;
    let right = sortedLocations.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midCapacity = sortedLocations[mid].seatingCapacity;

        if (midCapacity === targetCapacity) {
            return mid; // Found the target capacity
        } else if (midCapacity < targetCapacity) {
            left = mid + 1; // Search in the right half
        } else {
            right = mid - 1; // Search in the left half
        }
    }
    return -1; // Target capacity not found
};