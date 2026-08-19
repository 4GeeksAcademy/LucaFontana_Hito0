from __future__ import annotations

try:
    from services.suppliers_api.database import get_suppliers_table, utc_now_iso
    from services.suppliers_api.models import SupplierCreate
except ImportError:
    from database import get_suppliers_table, utc_now_iso
    from models import SupplierCreate


SUPPLIERS_SEED = [
    {"name": "Carnes del Valle S.A.S.", "country": "Colombia", "categories": ["carne"], "rate_per_unit": 28500.0, "currency": "COP", "status": "active", "contact_email": "ventas@carnesdelvalle.co", "notes": "Proveedor principal de res y cerdo para Medellín."},
    {"name": "Frigorífico Antioqueño", "country": "Colombia", "categories": ["carne"], "rate_per_unit": 27900.0, "currency": "COP", "status": "active", "contact_email": "pedidos@frigorificoa.co", "notes": "Proveedor secundario."},
    {"name": "Verduras La Cosecha", "country": "Colombia", "categories": ["verduras_y_hortalizas"], "rate_per_unit": 3200.0, "currency": "COP", "status": "active", "contact_email": "lacosecha@gmail.com"},
    {"name": "Condimentos El Sabor", "country": "Colombia", "categories": ["salsas_y_condimentos"], "rate_per_unit": 12400.0, "currency": "COP", "status": "active", "contact_email": "info@elsabor.co"},
    {"name": "Distribuidora RefriCol", "country": "Colombia", "categories": ["bebidas", "lacteos"], "rate_per_unit": 4100.0, "currency": "COP", "status": "active", "contact_email": "refricol.pedidos@gmail.com"},
    {"name": "Empaques y Más", "country": "Colombia", "categories": ["packaging"], "rate_per_unit": 890.0, "currency": "COP", "status": "active", "contact_email": "ventas@empaquesymas.co"},
    {"name": "Limpiahogar Profesional", "country": "Colombia", "categories": ["productos_limpieza"], "rate_per_unit": 7600.0, "currency": "COP", "status": "suspended", "contact_email": "limpiahogar@promail.co"},
    {"name": "CarboCo", "country": "Colombia", "categories": ["carbon_y_combustible"], "rate_per_unit": 45000.0, "currency": "COP", "status": "active", "contact_email": "pedidos@carboco.co"},
    {"name": "Miami Meat Distributors LLC", "country": "USA", "categories": ["carne"], "rate_per_unit": 6.8, "currency": "USD", "status": "active", "contact_email": "orders@miamimeat.com"},
    {"name": "Sunshine Produce FL", "country": "USA", "categories": ["verduras_y_hortalizas"], "rate_per_unit": 2.15, "currency": "USD", "status": "active", "contact_email": "sales@sunshineproduce.com"},
    {"name": "Latin Flavors Inc.", "country": "USA", "categories": ["salsas_y_condimentos", "bebidas"], "rate_per_unit": 4.5, "currency": "USD", "status": "active", "contact_email": "orders@latinflavors.com"},
    {"name": "PackRight USA", "country": "USA", "categories": ["packaging"], "rate_per_unit": 0.35, "currency": "USD", "status": "active", "contact_email": "info@packright.us"},
    {"name": "CleanPro Florida", "country": "USA", "categories": ["productos_limpieza"], "rate_per_unit": 12.9, "currency": "USD", "status": "active", "contact_email": "orders@cleanproflorida.com"},
    {"name": "GrillFuel Supply Co.", "country": "USA", "categories": ["carbon_y_combustible"], "rate_per_unit": 38.5, "currency": "USD", "status": "active", "contact_email": "supply@grillfuel.com"},
    {"name": "Bebidas Andinas", "country": "Colombia", "categories": ["bebidas"], "rate_per_unit": 3800.0, "currency": "COP", "status": "suspended", "contact_email": "ventas@bebidasandinas.co"},
]


def main() -> None:
    answer = input("¿Desea eliminar los registros actuales y agregar los datos de prueba? (y/n): ").strip().lower()
    if answer == "n":
        print("Operación cancelada. No se realizaron cambios.")
        return

    if answer != "y":
        print("Respuesta no válida. Operación cancelada.")
        return

    suppliers_table = get_suppliers_table()
    suppliers_table.truncate()

    inserted_count = 0
    for supplier_seed in SUPPLIERS_SEED:
        validated_supplier = SupplierCreate.model_validate(supplier_seed)
        supplier_payload = validated_supplier.model_dump()
        supplier_payload["updated_at"] = utc_now_iso()
        suppliers_table.insert(supplier_payload)
        inserted_count += 1

    print(f"Se insertaron {inserted_count} proveedores de prueba.")


if __name__ == "__main__":
    main()