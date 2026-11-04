from __future__ import annotations

import logging
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path

from fastapi import FastAPI, Request


def add_timing_middleware(app: FastAPI, service_name: str, log_path: Path) -> None:
    logger = logging.getLogger(f"api.timing.{service_name}")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    resolved_log_path = log_path.resolve()
    resolved_log_path.parent.mkdir(parents=True, exist_ok=True)
    if not any(
        isinstance(handler, RotatingFileHandler)
        and Path(handler.baseFilename) == resolved_log_path
        for handler in logger.handlers
    ):
        handler = RotatingFileHandler(
            resolved_log_path,
            maxBytes=1_000_000,
            backupCount=3,
            encoding="utf-8",
        )
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)

    @app.middleware("http")
    async def timing_middleware(request: Request, call_next):
        started = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration_ms = (time.perf_counter() - started) * 1000
            cache_status = getattr(request.state, "cache_status", None)
            cache_error = getattr(request.state, "cache_error", None)
            suffix = f" | cache={cache_status}" if cache_status else ""
            logger.info(
                "%s %s → %s | %.1fms%s",
                request.method,
                request.url.path,
                status_code,
                duration_ms,
                suffix,
            )
            if cache_error:
                logger.warning(
                    "Cache bypass for %s %s: %s",
                    request.method,
                    request.url.path,
                    cache_error,
                )
