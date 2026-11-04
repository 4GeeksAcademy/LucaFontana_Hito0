#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from tinydb import Query

from services.manage_incidentsAPI.database import get_db
from packages.shared.constants import BRANCHES, CATEGORIES, ORIGINS, STATUSES

SEED_BATCH = "caching-sprint-v1"
TITLES = (
    "Falla en equipo de cocina",
    "Demora en abastecimiento",
    "Reporte de cliente",
    "Incidente en turno operativo",
    "Mantenimiento de instalaciones",
    "Interrupcion de punto de venta",
    "Retraso de entrega",
    "Revision general de operacion",
)


def generated_incident(index: int, now: datetime) -> dict[str, object]:
    branch = BRANCHES[index % len(BRANCHES)]
    category = CATEGORIES[index % len(CATEGORIES)]
    created_at = now - timedelta(days=(index * 37) % 730, hours=index % 24)
    return {
        "id": str(uuid5(NAMESPACE_URL, f"brasaland-caching-incident-{index}")),
        "title": f"{TITLES[index % len(TITLES)]} #{index + 1:04d}",
        "description": (
            f"Registro sintetico para {category.replace('_', ' ')} en {branch.replace('_', ' ')}. "
            f"Seguimiento operativo {index % 19 + 1}."
        ),
        "category": category,
        "status": STATUSES[index % len(STATUSES)],
        "origin": ORIGINS[index % len(ORIGINS)],
        "branch": branch,
        "created_at": created_at.isoformat(),
        "_seed_batch": SEED_BATCH,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed reversible incident benchmark data.")
    parser.add_argument("--count", type=int, default=1000)
    parser.add_argument("--clean", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.count <= 5000:
        parser.error("--count must be between 1 and 5000")

    table = get_db().table("incidents")
    query = Query()
    before = len(table)
    if args.clean:
        removed = table.remove(query._seed_batch == SEED_BATCH)
        print(f"Incidentes antes={before}; eliminados={len(removed)}; despues={len(table)}")
        return 0

    existing_ids = {
        record["id"]
        for record in table.search(query._seed_batch == SEED_BATCH)
        if "id" in record
    }
    now = datetime.now(timezone.utc)
    records = [
        generated_incident(index, now)
        for index in range(args.count)
        if str(uuid5(NAMESPACE_URL, f"brasaland-caching-incident-{index}")) not in existing_ids
    ]
    if records:
        table.insert_multiple(records)
    print(f"Incidentes antes={before}; agregados={len(records)}; despues={len(table)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
