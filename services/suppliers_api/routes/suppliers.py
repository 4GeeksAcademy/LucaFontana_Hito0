from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Response, status

try:
    from services.suppliers_api.database import (
        document_to_supplier_payload,
        get_suppliers_table,
        utc_now_iso,
    )
    from services.suppliers_api.models import (
        Supplier,
        SupplierCreate,
        SupplierRateUpdate,
        SupplierStatusUpdate,
    )
except ImportError:
    from database import document_to_supplier_payload, get_suppliers_table, utc_now_iso
    from models import Supplier, SupplierCreate, SupplierRateUpdate, SupplierStatusUpdate


router = APIRouter(prefix="/suppliers", tags=["suppliers"])


def get_supplier_or_404(supplier_id: int) -> Supplier:
    document = get_suppliers_table().get(doc_id=supplier_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    return Supplier.model_validate(document_to_supplier_payload(document))


@router.post("", response_model=Supplier, status_code=status.HTTP_201_CREATED)
def create_supplier(payload: SupplierCreate) -> Supplier:
    suppliers_table = get_suppliers_table()

    supplier_payload = payload.model_dump()
    supplier_payload["updated_at"] = utc_now_iso()

    supplier_id = suppliers_table.insert(supplier_payload)
    supplier_payload["id"] = supplier_id

    return Supplier.model_validate(supplier_payload)


@router.get("", response_model=list[Supplier])
def list_suppliers(
    country: str | None = Query(default=None),
    category: str | None = Query(default=None),
) -> list[Supplier]:
    suppliers = [
        Supplier.model_validate(document_to_supplier_payload(document))
        for document in get_suppliers_table().all()
    ]

    if country is not None:
        country_filter = country.strip().lower()
        suppliers = [supplier for supplier in suppliers if supplier.country.lower() == country_filter]

    if category is not None:
        category_filter = category.strip().lower()
        suppliers = [
            supplier
            for supplier in suppliers
            if any(item.lower() == category_filter for item in supplier.categories)
        ]

    return suppliers


@router.get("/{supplier_id}", response_model=Supplier)
def get_supplier(supplier_id: int) -> Supplier:
    return get_supplier_or_404(supplier_id)


@router.patch("/{supplier_id}/rate", response_model=Supplier)
def update_supplier_rate(supplier_id: int, payload: SupplierRateUpdate) -> Supplier:
    supplier = get_supplier_or_404(supplier_id)
    updated_payload = supplier.model_dump(mode="json")
    updated_payload["rate_per_unit"] = payload.rate_per_unit
    updated_payload["updated_at"] = utc_now_iso()

    get_suppliers_table().update(
        {
            "rate_per_unit": updated_payload["rate_per_unit"],
            "updated_at": updated_payload["updated_at"],
        },
        doc_ids=[supplier_id],
    )

    return Supplier.model_validate(updated_payload)


@router.patch("/{supplier_id}/status", response_model=Supplier)
def update_supplier_status(supplier_id: int, payload: SupplierStatusUpdate) -> Supplier:
    supplier = get_supplier_or_404(supplier_id)
    updated_payload = supplier.model_dump(mode="json")
    updated_payload["status"] = payload.status
    updated_payload["updated_at"] = utc_now_iso()

    get_suppliers_table().update(
        {
            "status": updated_payload["status"],
            "updated_at": updated_payload["updated_at"],
        },
        doc_ids=[supplier_id],
    )

    return Supplier.model_validate(updated_payload)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int) -> Response:
    supplier = get_supplier_or_404(supplier_id)
    get_suppliers_table().remove(doc_ids=[supplier.id])
    return Response(status_code=status.HTTP_204_NO_CONTENT)