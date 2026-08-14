from __future__ import annotations

from pydantic import BaseModel, Field


class InvalidBreakdownItem(BaseModel):
    rule: str
    label: str
    count: int = Field(ge=0)


class CategoryBreakdownItem(BaseModel):
    category: str
    count: int = Field(ge=0)
    percentage: float = Field(ge=0)


class StatusBreakdownItem(BaseModel):
    status: str
    count: int = Field(ge=0)
    percentage: float = Field(ge=0)


class SatisfactionBreakdownItem(BaseModel):
    score: int = Field(ge=1, le=5)
    label: str
    count: int = Field(ge=0)
    percentage: float = Field(ge=0)


class SatisfactionIndex(BaseModel):
    closed_cases: int = Field(ge=0)
    scored_closed_cases: int = Field(ge=0)
    average_score: float = Field(ge=0)
    breakdown: list[SatisfactionBreakdownItem]


class IncidentAnalysisResponse(BaseModel):
    source_file: str
    total_records: int = Field(ge=0)
    valid_records: int = Field(ge=0)
    invalid_records: int = Field(ge=0)
    invalid_breakdown: list[InvalidBreakdownItem]
    category_breakdown: list[CategoryBreakdownItem]
    status_breakdown: list[StatusBreakdownItem]
    satisfaction_index: SatisfactionIndex