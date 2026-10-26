import sys
from pathlib import Path

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from services.manage_incidentsAPI import database, main


@pytest.fixture
def client(monkeypatch):
    db = TinyDB(storage=MemoryStorage)
    monkeypatch.setattr(database, "_db", db)
    monkeypatch.setattr(main, "now_iso", lambda: "2026-10-26T18:00:00+00:00")

    with TestClient(main.app) as test_client:
        yield test_client

    db.close()


def seed_incident(client, **updates):
    incident = {
        "id": "incident-1",
        "title": "POS terminal down",
        "description": "The register cannot process transactions.",
        "category": "equipment_failure",
        "status": "open",
        "origin": "branch",
        "branch": "central",
        "created_at": "2026-10-26T17:00:00+00:00",
        "updated_at": "2026-10-26T17:00:00+00:00",
    }
    incident.update(updates)
    database.get_db().table("incidents").insert(incident)
    return incident


def test_every_incident_route_has_an_explicit_response_model():
    routes = [route for route in main.app.routes if isinstance(route, APIRoute)]

    assert len(routes) == 6
    assert all(route.response_model is not None for route in routes)


def test_health_response_has_only_status(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_response_is_minimal_and_ignores_server_managed_fields(client):
    response = client.post(
        "/api/incidents",
        json={
            "title": "POS terminal down",
            "description": "The register cannot process transactions.",
            "category": "equipment_failure",
            "origin": "branch",
            "branch": "central",
            "status": "resolved",
            "id": "client-id",
            "created_at": "client-created-at",
            "updated_at": "client-updated-at",
        },
    )

    created = database.get_db().table("incidents").all()[0]
    assert response.status_code == 201
    assert set(response.json()) == {"id"}
    assert response.json()["id"] != "client-id"
    assert created["status"] == "open"
    assert created["created_at"] == "2026-10-26T18:00:00+00:00"
    assert created["updated_at"] == "2026-10-26T18:00:00+00:00"


def test_create_validation_error_keeps_400_shape(client):
    response = client.post(
        "/api/incidents",
        json={
            "title": "POS terminal down",
            "description": "Description",
            "category": "not-a-category",
            "origin": "branch",
            "branch": "central",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Validation failed", "errors": {"category": "Invalid category"}}


def test_incident_list_filters_internal_fields_and_preserves_public_fields(client):
    seed_incident(client, updated_at="internal-update-time", internal_note="internal")

    response = client.get("/api/incidents?status=open")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": "incident-1",
            "title": "POS terminal down",
            "description": "The register cannot process transactions.",
            "category": "equipment_failure",
            "status": "open",
            "origin": "branch",
            "branch": "central",
            "created_at": "2026-10-26T17:00:00+00:00",
        }
    ]
    assert "updated_at" not in response.text
    assert "internal_note" not in response.text


def test_summary_response_contains_explicit_count_groups(client):
    seed_incident(client)

    response = client.get("/api/incidents/summary")
    summary = response.json()

    assert response.status_code == 200
    assert set(summary) == {"by_status", "by_category", "by_origin", "by_branch"}
    assert summary["by_status"] == {"open": 1, "in_progress": 0, "resolved": 0, "discarded": 0}
    assert summary["by_category"]["equipment_failure"] == 1
    assert summary["by_origin"]["branch"] == 1
    assert summary["by_branch"]["central"] == 1


def test_incident_detail_is_projected_and_not_found_is_typed(client):
    seed_incident(client, updated_at="internal-update-time")

    response = client.get("/api/incidents/incident-1")
    missing = client.get("/api/incidents/missing")

    assert response.status_code == 200
    assert set(response.json()) == {
        "id",
        "title",
        "description",
        "category",
        "status",
        "origin",
        "branch",
        "created_at",
    }
    assert "updated_at" not in response.json()
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Incident not found"}


def test_status_update_returns_only_id_and_status_and_ignores_extra_fields(client):
    seed_incident(client, updated_at="before")

    response = client.patch(
        "/api/incidents/incident-1/status",
        json={"status": "in_progress", "id": "client-id", "updated_at": "client-time"},
    )

    assert response.status_code == 200
    assert response.json() == {"id": "incident-1", "status": "in_progress"}
    assert database.get_db().table("incidents").all()[0]["updated_at"] == "2026-10-26T18:00:00+00:00"


def test_status_update_validation_and_not_found_errors_keep_their_status_codes(client):
    seed_incident(client)

    invalid = client.patch("/api/incidents/incident-1/status", json={"status": "resolved"})
    missing = client.patch("/api/incidents/missing/status", json={"status": "in_progress"})

    assert invalid.status_code == 400
    assert invalid.json()["detail"] == "Validation failed"
    assert "status" in invalid.json()["errors"]
    assert missing.status_code == 404
    assert missing.json() == {"detail": "Incident not found"}
