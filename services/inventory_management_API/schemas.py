from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class IngredientCreate(BaseModel):
    name: str
    sku: str
    unit: str
    category: str
    country: str


class IngredientResponse(BaseModel):
    id: int
    name: str
    sku: str
    unit: str
    category: str
    country: str
    current_stock: float


class IngredientEntryCreate(BaseModel):
    ingredient_id: int
    quantity: float = Field(ge=0)
    supplier_name: str
    location_id: int


class IngredientExitCreate(BaseModel):
    ingredient_id: int
    quantity: float = Field(ge=0)
    reason: str
    location_id: int

    @model_validator(mode="after")
    def validate_reason(self):
        if self.reason not in {"consumption", "waste"}:
            raise ValueError("reason must be 'consumption' or 'waste'")
        return self


class IngredientEntryResponse(BaseModel):
    id: int
    ingredient_id: int
    quantity: float
    supplier_name: str
    location_id: int
    created_at: datetime
    user_uuid: str

    model_config = ConfigDict(from_attributes=True)


class IngredientExitResponse(BaseModel):
    id: int
    ingredient_id: int
    quantity: float
    reason: str
    location_id: int
    created_at: datetime
    user_uuid: str

    model_config = ConfigDict(from_attributes=True)


class OrderIngredientResponse(BaseModel):
    name: str
    sku: str
    unit: str


class OrderResponse(BaseModel):
    id: int
    movement_type: Literal["inbound", "outbound"]
    quantity: float
    created_at: datetime
    user_uuid: str
    ingredient: OrderIngredientResponse
