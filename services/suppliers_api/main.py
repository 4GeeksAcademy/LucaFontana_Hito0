from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from services.suppliers_api.routes.suppliers import router as suppliers_router
except ImportError:
    from routes.suppliers import router as suppliers_router


app = FastAPI(
    title="Brasaland Digital Suppliers API",
    version="0.1.0",
    description="Suppliers directory backend powered by FastAPI and TinyDB.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(suppliers_router)