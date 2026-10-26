import os
import sys
from pathlib import Path

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
os.environ.setdefault("DATABASE_URL", "sqlite://")

from services.JWTauth_api.auth import get_current_user
from services.inventory_management_API import main
from services.inventory_management_API.database import get_db
from services.inventory_management_API.routers.inventory import router as inventory_router


@pytest.fixture
def client():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)
    previous_overrides = main.app.dependency_overrides.copy()

    def override_get_db():
        with Session(test_engine) as session:
            yield session

    main.app.dependency_overrides[get_db] = override_get_db
    main.app.dependency_overrides[get_current_user] = lambda: {"id": 17, "email": "operator@example.com"}

    try:
        with TestClient(main.app) as test_client:
            yield test_client
    finally:
        main.app.dependency_overrides = previous_overrides
        SQLModel.metadata.drop_all(test_engine)
        test_engine.dispose()


def create_ingredient(client):
    response = client.post(
        "/inventory/products",
        json={
            "name": "Harina",
            "sku": "HAR-001",
            "unit": "kg",
            "category": "secos",
            "country": "Colombia",
            "id": 999,
            "current_stock": 100,
        },
    )
    assert response.status_code == 200
    return response.json()


def test_inventory_routes_have_explicit_response_models():
    from services.JWTauth_api.auth import router as auth_router

    routes = [route for route in inventory_router.routes if isinstance(route, APIRoute)]
    auth_routes = [route for route in auth_router.routes if isinstance(route, APIRoute)]

    assert len(routes) == 6
    assert all(route.response_model is not None for route in routes)
    assert len(auth_routes) == 5
    assert all(route.response_model is not None for route in auth_routes)


def test_product_create_and_list_return_public_product_projection(client):
    created = create_ingredient(client)
    listed = client.get("/inventory/products")

    assert set(created) == {
        "id",
        "name",
        "sku",
        "unit",
        "category",
        "country",
        "current_stock",
    }
    assert created["current_stock"] == 0
    assert created["id"] != 999
    assert listed.status_code == 200
    assert listed.json() == [created]


def test_product_detail_returns_stock_projection(client):
    product = create_ingredient(client)

    response = client.get(f"/inventory/products/{product['id']}")

    assert response.status_code == 200
    assert response.json() == product


def test_inbound_creation_uses_authenticated_user_and_returns_typed_confirmation(client):
    product = create_ingredient(client)

    response = client.post(
        "/inventory/orders/inbound",
        json={
            "ingredient_id": product["id"],
            "quantity": 12,
            "supplier_name": "Proveedor Uno",
            "location_id": 4,
            "user_uuid": "spoofed-user",
        },
    )

    assert response.status_code == 200
    assert set(response.json()) == {
        "id",
        "ingredient_id",
        "quantity",
        "supplier_name",
        "location_id",
        "created_at",
        "user_uuid",
    }
    assert response.json()["user_uuid"] == "17"
    assert "spoofed-user" not in response.text


def test_outbound_creation_returns_typed_confirmation_and_rejects_insufficient_stock(client):
    product = create_ingredient(client)
    client.post(
        "/inventory/orders/inbound",
        json={
            "ingredient_id": product["id"],
            "quantity": 10,
            "supplier_name": "Proveedor Uno",
            "location_id": 4,
        },
    )

    response = client.post(
        "/inventory/orders/outbound",
        json={
            "ingredient_id": product["id"],
            "quantity": 3,
            "reason": "consumption",
            "location_id": 4,
        },
    )
    insufficient = client.post(
        "/inventory/orders/outbound",
        json={
            "ingredient_id": product["id"],
            "quantity": 20,
            "reason": "waste",
            "location_id": 4,
        },
    )

    assert response.status_code == 200
    assert set(response.json()) == {
        "id",
        "ingredient_id",
        "quantity",
        "reason",
        "location_id",
        "created_at",
        "user_uuid",
    }
    assert response.json()["user_uuid"] == "17"
    assert insufficient.status_code == 400


def test_order_history_returns_minimal_nested_ingredient_projection(client):
    product = create_ingredient(client)
    inbound_response = client.post(
        "/inventory/orders/inbound",
        json={
            "ingredient_id": product["id"],
            "quantity": 12,
            "supplier_name": "Proveedor Uno",
            "location_id": 4,
        },
    )
    outbound_response = client.post(
        "/inventory/orders/outbound",
        json={
            "ingredient_id": product["id"],
            "quantity": 2,
            "reason": "consumption",
            "location_id": 4,
        },
    )

    response = client.get("/inventory/orders")

    assert response.status_code == 200
    movements = response.json()
    assert len(movements) == 2
    assert {movement["movement_type"] for movement in movements} == {"inbound", "outbound"}
    for movement in movements:
        assert set(movement) == {"id", "movement_type", "quantity", "created_at", "user_uuid", "ingredient"}
        assert movement["user_uuid"] == "17"
        assert movement["ingredient"] == {"name": "Harina", "sku": "HAR-001", "unit": "kg"}
        assert "location_id" not in movement
        assert "ingredient_id" not in movement


def test_response_models_are_distinct_from_write_input_schemas():
    from services.inventory_management_API.schemas import (
        IngredientCreate,
        IngredientEntryCreate,
        IngredientEntryResponse,
        IngredientExitCreate,
        IngredientExitResponse,
        IngredientResponse,
    )

    assert not issubclass(IngredientResponse, IngredientCreate)
    assert not issubclass(IngredientEntryResponse, IngredientEntryCreate)
    assert not issubclass(IngredientExitResponse, IngredientExitCreate)
