#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv

load_dotenv(PROJECT_ROOT / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "")
TARGET_HOST = urlparse(DATABASE_URL).hostname or "unknown"
parsed_url = urlparse(DATABASE_URL)
PROJECT_REF = None
if TARGET_HOST.endswith(".supabase.co"):
    PROJECT_REF = TARGET_HOST.split(".", 1)[0]
elif TARGET_HOST.endswith(".pooler.supabase.com"):
    username = unquote(parsed_url.username or "")
    if username.startswith("postgres."):
        PROJECT_REF = username.partition(".")[2]

from sqlmodel import Session, SQLModel, delete, func, select

from services.inventory_management_API.database import engine
from services.inventory_management_API.models import Ingredient, IngredientEntry, IngredientExit

SEED_SKU_PREFIX = "SEED-CACHE-"
SEED_USER_UUID = "seed-caching-sprint-v1"
CATEGORIES = (
    ("meat", "kg"),
    ("produce", "kg"),
    ("sauce", "litro"),
    ("packaging", "unidad"),
    ("beverage", "litro"),
)
PRODUCT_NAMES = (
    "Res Angus",
    "Cerdo de granja",
    "Tomate chonto",
    "Yuca fresca",
    "Chimichurri artesanal",
    "Salsa BBQ",
    "Agua mineral",
    "Caja compostable",
    "Queso campesino",
    "Carbon vegetal",
)
COUNTRIES = ("CO", "US")


def require_development_confirmation(args: argparse.Namespace) -> bool:
    print(f"Target host: {TARGET_HOST}; project: {PROJECT_REF or 'not identifiable'}")
    if not DATABASE_URL:
        print("DATABASE_URL is not configured.", file=sys.stderr)
        return False
    if not args.yes:
        print("No writes performed; pass --yes after confirming the development target.")
        return False
    if not PROJECT_REF or not re.fullmatch(r"[a-z0-9]{6,30}", PROJECT_REF):
        print("Cannot identify a Supabase project reference; refusing to connect.", file=sys.stderr)
        return False
    dev_project_ref = args.dev_project_ref or os.getenv("SUPABASE_DEV_PROJECT_REF")
    if dev_project_ref != PROJECT_REF:
        print(
            "Development project confirmation does not match the target; refusing to connect.",
            file=sys.stderr,
        )
        return False
    return True


def table_count(session: Session, model: type[SQLModel]) -> int:
    return int(session.exec(select(func.count()).select_from(model)).one())


def seeded_products(session: Session) -> list[Ingredient]:
    return session.exec(
        select(Ingredient).where(Ingredient.sku.startswith(SEED_SKU_PREFIX))
    ).all()


def clean() -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    with Session(engine) as session:
        before = (
            table_count(session, Ingredient),
            table_count(session, IngredientEntry),
            table_count(session, IngredientExit),
        )
        session.exec(
            delete(IngredientEntry).where(IngredientEntry.user_uuid == SEED_USER_UUID)
        )
        session.exec(
            delete(IngredientExit).where(IngredientExit.user_uuid == SEED_USER_UUID)
        )
        for product in seeded_products(session):
            session.delete(product)
        session.commit()
        after = (
            table_count(session, Ingredient),
            table_count(session, IngredientEntry),
            table_count(session, IngredientExit),
        )
    return before, after


def seed(count: int) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        before = (
            table_count(session, Ingredient),
            table_count(session, IngredientEntry),
            table_count(session, IngredientExit),
        )
        current_products = seeded_products(session)
        current_skus = {product.sku for product in current_products}
        new_products = []
        for index in range(count):
            sku = f"{SEED_SKU_PREFIX}{index + 1:05d}"
            if sku in current_skus:
                continue
            category, unit = CATEGORIES[index % len(CATEGORIES)]
            new_products.append(
                Ingredient(
                    name=f"{PRODUCT_NAMES[index % len(PRODUCT_NAMES)]} lote {index + 1:05d}",
                    sku=sku,
                    unit=unit,
                    category=category,
                    country=COUNTRIES[index % len(COUNTRIES)],
                )
            )
        session.add_all(new_products)
        session.flush()
        products = seeded_products(session)
        movements_exist = session.exec(
            select(IngredientEntry.id)
            .where(IngredientEntry.user_uuid == SEED_USER_UUID)
            .limit(1)
        ).first()
        if not movements_exist:
            entries = []
            exits = []
            for index, product in enumerate(products):
                created_at = now - timedelta(days=(index * 11) % 730, hours=index % 24)
                entries.append(
                    IngredientEntry(
                        ingredient_id=product.id,
                        quantity=20 + index % 81,
                        supplier_name=f"Proveedor regional {index % 37 + 1:02d}",
                        location_id=index % 15 + 1,
                        created_at=created_at,
                        user_uuid=SEED_USER_UUID,
                    )
                )
                exits.append(
                    IngredientExit(
                        ingredient_id=product.id,
                        quantity=1 + index % 20,
                        reason=("consumption", "waste", "transfer")[index % 3],
                        location_id=index % 15 + 1,
                        created_at=created_at + timedelta(hours=index % 12),
                        user_uuid=SEED_USER_UUID,
                    )
                )
            session.add_all(entries + exits)
        session.commit()
        after = (
            table_count(session, Ingredient),
            table_count(session, IngredientEntry),
            table_count(session, IngredientExit),
        )
    return before, after


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Seed reversible inventory benchmarks; requires an explicitly verified dev project."
    )
    parser.add_argument("--count", type=int, default=5000)
    parser.add_argument("--clean", action="store_true")
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--dev-project-ref")
    args = parser.parse_args()
    if not 1 <= args.count <= 20000:
        parser.error("--count must be between 1 and 20000")
    if not require_development_confirmation(args):
        return 2

    SQLModel.metadata.create_all(engine)
    if args.clean:
        before, after = clean()
    else:
        before, after = seed(args.count)
    print(f"Filas antes (productos, entradas, salidas): {before}")
    print(f"Filas despues (productos, entradas, salidas): {after}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
