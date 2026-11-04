import csv
import io
import sys
from pathlib import Path

from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from starlette.responses import Response

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from services.api.app.main import app
from services.api.app.routers import incidents as incidents_router


CSV_CONTENT = (
    "incident_id,date,location_id,category,description,status,customer_id,satisfaction_score,reporter_id\n"
    "INC-PRIVATE-1,2026-10-25,COL-01,CUSTOMER_COMPLAINT,"
    "Customer reported a delayed order,CLOSED,CUSTOMER-PRIVATE-1,5,REPORTER-PRIVATE-1\n"
)


def test_analysis_service_routes_have_explicit_response_contracts():
    analysis_routes = [route for route in incidents_router.router.routes if isinstance(route, APIRoute)]
    health_route = next(route for route in app.routes if getattr(route, "path", None) == "/health")
    export_route = next(route for route in analysis_routes if route.path.endswith("/results/export"))

    assert len(analysis_routes) == 2
    assert all(route.response_model is not None for route in analysis_routes if route is not export_route)
    assert health_route.response_model is not None
    assert export_route.response_model is None
    assert export_route.response_class is Response


def test_openapi_documents_json_analysis_and_csv_export():
    paths = app.openapi()["paths"]
    export_response = paths["/api/incidents/results/export"]["get"]["responses"]["200"]

    assert "IncidentAnalysisResponse" in str(paths["/api/incidents/analyze"]["post"]["responses"]["200"])
    assert export_response["content"]["text/csv"]["schema"] == {"type": "string"}
    assert "404" in paths["/api/incidents/results/export"]["get"]["responses"]


def test_health_response_contains_only_status():
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analysis_returns_only_aggregate_fields_and_preserves_ui_shape(monkeypatch):
    monkeypatch.setattr(incidents_router, "LATEST_ANALYSIS_RESULT", None)
    client = TestClient(app)

    response = client.post(
        "/api/incidents/analyze",
        files={"file": ("sample.csv", CSV_CONTENT.encode(), "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload) == {
        "source_file",
        "total_records",
        "valid_records",
        "invalid_records",
        "invalid_breakdown",
        "category_breakdown",
        "status_breakdown",
        "satisfaction_index",
    }
    assert payload["source_file"] == "sample.csv"
    assert payload["total_records"] == 1
    assert payload["valid_records"] == 1
    assert payload["invalid_records"] == 0
    assert payload["invalid_breakdown"] == []
    assert set(payload["category_breakdown"][0]) == {"category", "count", "percentage"}
    assert set(payload["status_breakdown"][0]) == {"status", "count", "percentage"}
    assert set(payload["satisfaction_index"]) == {
        "closed_cases",
        "scored_closed_cases",
        "average_score",
        "breakdown",
    }
    assert payload["satisfaction_index"]["average_score"] == 5.0
    assert set(payload["satisfaction_index"]["breakdown"][0]) == {
        "score",
        "label",
        "count",
        "percentage",
    }
    assert "INC-PRIVATE-1" not in response.text
    assert "CUSTOMER-PRIVATE-1" not in response.text
    assert "REPORTER-PRIVATE-1" not in response.text
    assert "Customer reported a delayed order" not in response.text


def test_analysis_rejects_non_utf8_file_with_existing_400_shape():
    response = TestClient(app).post(
        "/api/incidents/analyze",
        files={"file": ("invalid.csv", b"\xff", "text/csv")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "The CSV file must be UTF-8 encoded."}


def test_analysis_rejects_missing_required_columns_with_existing_422_shape():
    response = TestClient(app).post(
        "/api/incidents/analyze",
        files={"file": ("missing-columns.csv", b"title,description\nitem,details", "text/csv")},
    )

    assert response.status_code == 422
    assert "Missing required columns:" in response.json()["detail"]


def test_export_requires_a_completed_analysis(monkeypatch):
    monkeypatch.setattr(incidents_router, "LATEST_ANALYSIS_RESULT", None)

    response = TestClient(app).get("/api/incidents/results/export")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "No analysis result is available yet. Run /api/incidents/analyze first."
    }


def test_export_returns_aggregate_csv_without_raw_incident_values(monkeypatch):
    monkeypatch.setattr(incidents_router, "LATEST_ANALYSIS_RESULT", None)
    client = TestClient(app)
    analyzed = client.post(
        "/api/incidents/analyze",
        files={"file": ("sample.csv", CSV_CONTENT.encode(), "text/csv")},
    )

    response = client.get("/api/incidents/results/export")
    rows = list(csv.DictReader(io.StringIO(response.text)))

    assert analyzed.status_code == 200
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert response.headers["content-disposition"] == 'attachment; filename="incident-analysis-results.csv"'
    assert response.text.splitlines()[0] == "metric,value,percentage"
    assert {row["metric"] for row in rows} >= {
        "total_records",
        "valid_records",
        "invalid_records",
        "closed_cases",
        "average_satisfaction_score",
    }
    assert "INC-PRIVATE-1" not in response.text
    assert "CUSTOMER-PRIVATE-1" not in response.text
    assert "REPORTER-PRIVATE-1" not in response.text
    assert "Customer reported a delayed order" not in response.text
