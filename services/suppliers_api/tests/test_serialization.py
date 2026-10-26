import sys
from pathlib import Path

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from services.JWTauth_api import auth
from services.suppliers_api import database, main
from services.suppliers_api.routes import suppliers as supplier_routes


@pytest.fixture
def client(monkeypatch):
    db = TinyDB(storage=MemoryStorage)
    previous_overrides = main.app.dependency_overrides.copy()
    monkeypatch.setattr(database, "_db", db)
    monkeypatch.setattr(supplier_routes, "utc_now_iso", lambda: "2026-10-26T18:00:00+00:00")
    main.app.dependency_overrides[auth.get_current_user] = lambda: {
        "id": 1,
        "email": "manager@example.com",
        "hashed_password": "internal-hash",
        "role": "admin",
    }

    try:
        with TestClient(main.app) as test_client:
            yield test_client
    finally:
        main.app.dependency_overrides = previous_overrides
        db.close()


def supplier_payload(**updates):
    payload = {
        "name": "Proveedor de prueba",
        "country": "Colombia",
        "categories": ["carne"],
        "rate_per_unit": 28500.0,
        "currency": "COP",
        "status": "active",
        "contact_email": "ventas@example.com",
        "notes": "Proveedor local",
    }
    payload.update(updates)
    return payload


def seed_supplier(**updates):
    payload = supplier_payload(updated_at="2026-10-26T17:00:00+00:00", **updates)
    return database.get_suppliers_table().insert(payload)


def test_every_mounted_endpoint_declares_a_response_model_or_explicit_no_body():
    from services.JWTauth_api.auth import router as auth_router
    from services.suppliers_api.routes.suppliers import router as suppliers_router

    routes = [
        route
        for route in (*suppliers_router.routes, *auth_router.routes, *main.app.routes)
        if isinstance(route, APIRoute)
    ]

    assert len(routes) == 12
    delete_route = next(route for route in routes if "DELETE" in route.methods)
    assert delete_route.status_code == 204
    assert delete_route.response_model is None
    assert all(route.response_model is not None for route in routes if route is not delete_route)


def test_health_response_has_only_status(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_supplier_returns_public_fields_and_rejects_server_fields(client):
    response = client.post("/suppliers", json=supplier_payload())
    created = database.get_suppliers_table().all()[0]
    rejected = client.post(
        "/suppliers",
        json=supplier_payload(id=99, updated_at="client-value"),
    )

    assert response.status_code == 201
    assert set(response.json()) == {
        "id",
        "name",
        "country",
        "categories",
        "rate_per_unit",
        "currency",
        "status",
        "updated_at",
        "contact_email",
        "notes",
    }
    assert response.json()["id"] == created.doc_id
    assert response.json()["updated_at"] == "2026-10-26T18:00:00Z"
    assert rejected.status_code == 422
    assert len(database.get_suppliers_table().all()) == 1


def test_supplier_list_filters_and_excludes_unmodeled_fields(client):
    seed_supplier(internal_note="private")

    response = client.get("/suppliers?country=colombia&category=CARNE")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "name": "Proveedor de prueba",
            "country": "Colombia",
            "categories": ["carne"],
            "rate_per_unit": 28500.0,
            "currency": "COP",
            "status": "active",
            "updated_at": "2026-10-26T17:00:00Z",
            "contact_email": "ventas@example.com",
            "notes": "Proveedor local",
        }
    ]
    assert "internal_note" not in response.text


def test_supplier_detail_response_uses_public_schema_and_404(client):
    supplier_id = seed_supplier(internal_note="private")

    response = client.get(f"/suppliers/{supplier_id}")
    missing = client.get("/suppliers/999")

    assert response.status_code == 200
    assert set(response.json()) == {
        "id",
        "name",
        "country",
        "categories",
        "rate_per_unit",
        "currency",
        "status",
        "updated_at",
        "contact_email",
        "notes",
    }
    assert "internal_note" not in response.text
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Supplier not found"}


def test_rate_update_returns_complete_supplier_and_rejects_extra_fields(client):
    supplier_id = seed_supplier()

    response = client.patch(f"/suppliers/{supplier_id}/rate", json={"rate_per_unit": 31000})
    rejected = client.patch(
        f"/suppliers/{supplier_id}/rate",
        json={"rate_per_unit": 32000, "id": 999},
    )

    assert response.status_code == 200
    assert response.json()["id"] == supplier_id
    assert response.json()["rate_per_unit"] == 31000
    assert response.json()["updated_at"] == "2026-10-26T18:00:00Z"
    assert rejected.status_code == 422


def test_status_update_returns_complete_supplier_and_rejects_extra_fields(client):
    supplier_id = seed_supplier()

    response = client.patch(f"/suppliers/{supplier_id}/status", json={"status": "suspended"})
    rejected = client.patch(
        f"/suppliers/{supplier_id}/status",
        json={"status": "active", "id": 999},
    )

    assert response.status_code == 200
    assert response.json()["id"] == supplier_id
    assert response.json()["status"] == "suspended"
    assert response.json()["updated_at"] == "2026-10-26T18:00:00Z"
    assert rejected.status_code == 422


def test_delete_supplier_returns_no_content(client):
    supplier_id = seed_supplier()

    response = client.delete(f"/suppliers/{supplier_id}")

    assert response.status_code == 204
    assert response.content == b""
    assert database.get_suppliers_table().all() == []
