from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str
    allowed_origins: list[str]


def get_settings() -> Settings:
    raw_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    return Settings(
        app_name="Brasaland Incidents API",
        allowed_origins=allowed_origins,
    )