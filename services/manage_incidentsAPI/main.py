from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
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
from services.manage_incidentsAPI.schemas import (
    BranchCounts,
    CategoryCounts,
    ErrorResponse,
    HealthResponse,
    IncidentCreateRequest,
    IncidentCreatedResponse,
    IncidentResponse,
    IncidentStatusResponse,
    IncidentStatusUpdateRequest,
    IncidentSummaryResponse,
    OriginCounts,
    StatusCounts,
    ValidationErrorResponse,
)

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


@app.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post(
    "/api/incidents",
    status_code=status.HTTP_201_CREATED,
    response_model=IncidentCreatedResponse,
    responses={400: {"model": ValidationErrorResponse}},
)
def create_incident(payload: IncidentCreateRequest) -> IncidentCreatedResponse | JSONResponse:
    data = payload.model_dump(exclude_unset=True)
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
    return IncidentCreatedResponse(id=incident["id"])


@app.get(
    "/api/incidents",
    response_model=list[IncidentResponse],
    responses={400: {"model": ValidationErrorResponse}},
)
def list_incidents(
    status_filter: str | None = Query(None, alias="status"),
    origin: str | None = None,
    branch: str | None = None,
    category: str | None = None,
) -> list[IncidentResponse] | JSONResponse:
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
    incidents = [
        incident
        for incident in get_incidents()
        if all(value is None or incident.get(field) == value for field, value in filters.items())
    ]
    return [IncidentResponse.model_validate(incident) for incident in incidents]


@app.get("/api/incidents/summary", response_model=IncidentSummaryResponse)
def incident_summary() -> IncidentSummaryResponse:
    incidents = get_incidents()
    return IncidentSummaryResponse(
        by_status=StatusCounts(**{key: sum(item.get("status") == key for item in incidents) for key in STATUSES}),
        by_category=CategoryCounts(
            **{key: sum(item.get("category") == key for item in incidents) for key in CATEGORIES}
        ),
        by_origin=OriginCounts(**{key: sum(item.get("origin") == key for item in incidents) for key in ORIGINS}),
        by_branch=BranchCounts(**{key: sum(item.get("branch") == key for item in incidents) for key in BRANCHES}),
    )


@app.get(
    "/api/incidents/{incident_id}",
    response_model=IncidentResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_incident(incident_id: str) -> IncidentResponse | JSONResponse:
    incident = next((item for item in get_incidents() if item.get("id") == incident_id), None)
    if incident is None:
        return JSONResponse(status_code=404, content={"detail": "Incident not found"})
    return IncidentResponse.model_validate(incident)


@app.patch(
    "/api/incidents/{incident_id}/status",
    response_model=IncidentStatusResponse,
    responses={400: {"model": ValidationErrorResponse}, 404: {"model": ErrorResponse}},
)
def update_status(
    incident_id: str,
    payload: IncidentStatusUpdateRequest,
) -> IncidentStatusResponse | JSONResponse:
    new_status = payload.status
    table = get_db().table("incidents")
    incident = next((item for item in table.all() if item.get("id") == incident_id), None)
    if incident is None:
        return JSONResponse(status_code=404, content={"detail": "Incident not found"})
    valid, message = validate_status_transition(incident["status"], new_status)
    if not valid:
        return validation_response({"status": message})
    table.update({"status": new_status, "updated_at": now_iso()}, TinyQuery().id == incident_id)
    updated = next(item for item in table.all() if item.get("id") == incident_id)
    return IncidentStatusResponse(id=updated["id"], status=updated["status"])