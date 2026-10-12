from sqlmodel import Session, SQLModel, select

from database import engine
from models import Ingredient, IngredientEntry, IngredientExit


# 1) Crea primero un usuario desde POST /users en JWTauth.
# 2) Copia su id numerico y guardalo como texto en USER_UUID.
USER_UUID = "1"


def seed():
    SQLModel.metadata.create_all(engine)

    with Session(engine) as db:
        existing = db.exec(select(Ingredient)).first()

        if existing:
            print("Ya hay ingredientes cargados. No se ejecutó el seed.")
            return

        ingredients = [
            Ingredient(
                name="Falda de ternera",
                sku="BRS-BEEF-001",
                unit="kg",
                category="meat",
                country="CO",
            ),
            Ingredient(
                name="Costilla de cerdo",
                sku="BRS-PORK-001",
                unit="kg",
                category="meat",
                country="US",
            ),
            Ingredient(
                name="Chimichurri",
                sku="BRS-SAUCE-001",
                unit="litro",
                category="sauce",
                country="CO",
            ),
            Ingredient(
                name="Salsa BBQ de la casa",
                sku="BRS-SAUCE-002",
                unit="litro",
                category="sauce",
                country="US",
            ),
            Ingredient(
                name="Yuca",
                sku="BRS-PROD-001",
                unit="kg",
                category="produce",
                country="CO",
            ),
            Ingredient(
                name="Caja para llevar (M)",
                sku="BRS-PKG-001",
                unit="unidad",
                category="packaging",
                country="CO",
            ),
        ]

        db.add_all(ingredients)
        db.commit()

        for ingredient in ingredients:
            db.refresh(ingredient)

        by_sku = {ingredient.sku: ingredient for ingredient in ingredients}

        entries = [
            IngredientEntry(
                ingredient_id=by_sku["BRS-BEEF-001"].id,
                quantity=50,
                supplier_name="Carnes del Valle S.A.",
                location_id=1,
                user_uuid=USER_UUID,
            ),
            IngredientEntry(
                ingredient_id=by_sku["BRS-BEEF-001"].id,
                quantity=30,
                supplier_name="Carnes del Valle S.A.",
                location_id=1,
                user_uuid=USER_UUID,
            ),
            IngredientEntry(
                ingredient_id=by_sku["BRS-PORK-001"].id,
                quantity=40,
                supplier_name="MiamiMeat Co.",
                location_id=2,
                user_uuid=USER_UUID,
            ),
            IngredientEntry(
                ingredient_id=by_sku["BRS-SAUCE-001"].id,
                quantity=20,
                supplier_name="Salsas Artesanales Ltda.",
                location_id=3,
                user_uuid=USER_UUID,
            ),
        ]

        db.add_all(entries)
        db.commit()

        exits = [
            IngredientExit(
                ingredient_id=by_sku["BRS-BEEF-001"].id,
                quantity=10,
                reason="consumption",
                location_id=1,
                user_uuid=USER_UUID,
            ),
            IngredientExit(
                ingredient_id=by_sku["BRS-BEEF-001"].id,
                quantity=5,
                reason="waste",
                location_id=1,
                user_uuid=USER_UUID,
            ),
            IngredientExit(
                ingredient_id=by_sku["BRS-PORK-001"].id,
                quantity=8,
                reason="consumption",
                location_id=2,
                user_uuid=USER_UUID,
            ),
        ]

        db.add_all(exits)
        db.commit()

        print("Seed de Brasaland cargado correctamente.")


if __name__ == "__main__":
    seed()
