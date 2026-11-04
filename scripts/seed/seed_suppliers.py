#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from tinydb import Query

from services.suppliers_api.database import get_suppliers_table
from services.suppliers_api.models import SupplierCreate

SEED_BATCH = "caching-sprint-v1"
CATEGORY_GROUPS = (
    ["carne"],
    ["verduras_y_hortalizas"],
    ["salsas_y_condimentos", "bebidas"],
    ["packaging"],
    ["productos_limpieza", "lacteos"],
    ["carbon_y_combustible"],
)
NAME_PREFIXES = (
    "Andes Provisions",
    "Harvest Cooperative",
    "Pacific Trade",
    "Mercado Central",
    "Sunrise Foods",
    "Northstar Supply",
    "Valle Verde",
    "Coastal Partners",
)


def generated_supplier(index: int, now: datetime) -> dict[str, object]:
    country = "Colombia" if index % 2 == 0 else "USA"
    currency = "COP" if country == "Colombia" else "USD"
    rate = 1500.0 + (index % 900) * 125.0 if currency == "COP" else 0.75 + (index % 120) * 0.35
    supplier = SupplierCreate.model_validate(
        {
            "name": f"{NAME_PREFIXES[index % len(NAME_PREFIXES)]} {index + 1:04d}",
            "country": country,
            "categories": CATEGORY_GROUPS[index % len(CATEGORY_GROUPS)],
            "rate_per_unit": rate,
            "currency": currency,
            "status": "active" if index % 7 else "suspended",
            "contact_email": f"supplier-{index + 1:04d}@example.invalid",
            "notes": (
                f"Proveedor sintetico de {CATEGORY_GROUPS[index % len(CATEGORY_GROUPS)][0]} "
                f"con calendario de entrega {index % 5 + 1}."
            ),
        }
    ).model_dump()
    supplier["updated_at"] = (
        now - timedelta(days=(index * 13) % 365, hours=index % 24)
    ).isoformat()
    supplier["_seed_batch"] = SEED_BATCH
    supplier["_seed_index"] = index
    return supplier


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed reversible supplier benchmark data.")
    parser.add_argument("--count", type=int, default=1000)
    parser.add_argument("--clean", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.count <= 5000:
        parser.error("--count must be between 1 and 5000")

    table = get_suppliers_table()
    query = Query()
    before = len(table)
    if args.clean:
        removed = table.remove(query._seed_batch == SEED_BATCH)
        print(f"Proveedores antes={before}; eliminados={len(removed)}; despues={len(table)}")
        return 0

    existing_indexes = {
        record["_seed_index"]
        for record in table.search(query._seed_batch == SEED_BATCH)
        if "_seed_index" in record
    }
    now = datetime.now(timezone.utc)
    records = [
        generated_supplier(index, now)
        for index in range(args.count)
        if index not in existing_indexes
    ]
    if records:
        table.insert_multiple(records)
    print(f"Proveedores antes={before}; agregados={len(records)}; despues={len(table)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
