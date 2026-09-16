from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from tinydb import Query as TinyQuery

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from packages.shared.constants import BRANCHES, CATEGORIES, ORIGINS, STATUSES
from packages.shared.validators import validate_incident_data, validate_status_transition
from services.manage_incidentsAPI.database import get_db, get_incidents

app = FastAPI(title="Brasaland Digital Incident Manager", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "An internal server error occurred."})


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def validation_response(errors: dict[str, str]) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": "Validation failed", "errors": errors})


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/incidents", status_code=status.HTTP_201_CREATED, response_model=None)
def create_incident(payload: dict[str, Any]) -> dict[str, Any] | JSONResponse:
    data = dict(payload)
    data.setdefault("status", "open")
    data.setdefault("branch", "central")
    errors = validate_incident_data(data)
    if errors:
        return validation_response(errors)

    timestamp = now_iso()
    incident = {
        "id": str(uuid4()),
        "title": data["title"].strip(),
        "description": data["description"].strip(),
        "category": data["category"],
        "status": "open",
        "origin": data["origin"],
        "branch": data["branch"],
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    get_db().table("incidents").insert(incident)
    return incident


@app.get("/api/incidents", response_model=None)
def list_incidents(
    status_filter: str | None = Query(None, alias="status"),
    origin: str | None = None,
    branch: str | None = None,
    category: str | None = None,
) -> list[dict[str, Any]] | JSONResponse:
    filters = {"status": status_filter, "origin": origin, "branch": branch, "category": category}
    errors = {
        field: f"Invalid {field}"
        for field, value, allowed in (
            ("status", status_filter, STATUSES),
            ("origin", origin, ORIGINS),
            ("branch", branch, BRANCHES),
            ("category", category, CATEGORIES),
        )
        if value is not None and value not in allowed
    }
    if errors:
        return validation_response(errors)
    return [incident for incident in get_incidents() if all(value is None or incident.get(field) == value for field, value in filters.items())]


@app.get("/api/incidents/summary")
def incident_summary() -> dict[str, dict[str, int]]:
    incidents = get_incidents()
    return {
        "by_status": {key: sum(item.get("status") == key for item in incidents) for key in STATUSES},
        "by_category": {key: sum(item.get("category") == key for item in incidents) for key in CATEGORIES},
        "by_origin": {key: sum(item.get("origin") == key for item in incidents) for key in ORIGINS},
        "by_branch": {key: sum(item.get("branch") == key for item in incidents) for key in BRANCHES},
    }


@app.get("/api/incidents/{incident_id}", response_model=None)
def get_incident(incident_id: str) -> dict[str, Any] | JSONResponse:
    incident = next((item for item in get_incidents() if item.get("id") == incident_id), None)
    if incident is None:
        return JSONResponse(status_code=404, content={"detail": "Incident not found"})
    return incident


@app.patch("/api/incidents/{incident_id}/status", response_model=None)
def update_status(incident_id: str, payload: dict[str, Any]) -> dict[str, Any] | JSONResponse:
    new_status = payload.get("status")
    table = get_db().table("incidents")
    incident = next((item for item in table.all() if item.get("id") == incident_id), None)
    if incident is None:
        return JSONResponse(status_code=404, content={"detail": "Incident not found"})
    valid, message = validate_status_transition(incident["status"], new_status)
    if not valid:
        return validation_response({"status": message})
    table.update({"status": new_status, "updated_at": now_iso()}, TinyQuery().id == incident_id)
    updated = next(item for item in table.all() if item.get("id") == incident_id)
    return dict(updated)