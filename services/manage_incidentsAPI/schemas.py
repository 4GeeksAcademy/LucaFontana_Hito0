from typing import Any

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    status: str


class IncidentCreateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    # Keep values permissive so the shared validator preserves its HTTP 400 errors.
    title: Any = None
    description: Any = None
    category: Any = None
    origin: Any = None
    branch: Any = None
    status: Any = None


class IncidentStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: Any = None


class IncidentCreatedResponse(BaseModel):
    id: str


class IncidentStatusResponse(BaseModel):
    id: str
    status: str


class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: str
    origin: str
    branch: str
    created_at: str


class ErrorResponse(BaseModel):
    detail: str


class ValidationErrorResponse(ErrorResponse):
    errors: dict[str, str]


class StatusCounts(BaseModel):
    open: int
    in_progress: int
    resolved: int
    discarded: int


class CategoryCounts(BaseModel):
    equipment_failure: int
    supply_issue: int
    customer_complaint: int
    staff_issue: int
    facility_issue: int
    pos_system: int
    delivery_issue: int
    other: int


class OriginCounts(BaseModel):
    customer: int
    branch: int
    internal: int


class BranchCounts(BaseModel):
    central: int
    medellin_centro: int
    medellin_laureles: int
    medellin_envigado: int
    medellin_bello: int
    medellin_itagui: int
    bogota_chapinero: int
    bogota_usaquen: int
    cali_granada: int
    barranquilla_norte: int
    miami_doral: int
    miami_hialeah: int
    miami_kendall: int
    orlando_international: int
    fort_lauderdale: int


class IncidentSummaryResponse(BaseModel):
    by_status: StatusCounts
    by_category: CategoryCounts
    by_origin: OriginCounts
    by_branch: BranchCounts
