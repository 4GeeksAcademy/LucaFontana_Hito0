from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

VALID_COUNTRIES = {"Colombia", "USA"}
VALID_CATEGORIES = {
    "carne",
    "verduras_y_hortalizas",
    "salsas_y_condimentos",
    "bebidas",
    "packaging",
    "productos_limpieza",
    "lacteos",
    "carbon_y_combustible",
}
VALID_CURRENCIES = {"COP", "USD"}
VALID_STATUSES = {"active", "suspended"}


class SupplierCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    country: Literal["Colombia", "USA"]
    categories: list[str]
    rate_per_unit: float = Field(gt=0)
    currency: Literal["COP", "USD"]
    status: Literal["active", "suspended"]
    contact_email: str | None = None
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("name is required")
        return stripped_value

    @field_validator("categories")
    @classmethod
    def validate_categories(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("categories must contain at least one element")

        invalid_categories = [category for category in value if category not in VALID_CATEGORIES]
        if invalid_categories:
            raise ValueError(
                "invalid categories: " + ", ".join(sorted(set(invalid_categories)))
            )

        return value

    @model_validator(mode="after")
    def validate_country_currency_pair(self) -> "SupplierCreate":
        expected_currency = "COP" if self.country == "Colombia" else "USD"
        if self.currency != expected_currency:
            raise ValueError(
                f"currency must be {expected_currency} when country is {self.country}"
            )

        return self


class Supplier(SupplierCreate):
    id: int
    updated_at: datetime


class SupplierRateUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rate_per_unit: float = Field(gt=0)


class SupplierStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["active", "suspended"]