from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

if __package__:
    from services.JWTauth_api.auth import router as auth_router
    from services.suppliers_api.routes.suppliers import router as suppliers_router
else:
    project_root = Path(__file__).resolve().parents[2]
    if str(project_root) not in sys.path:
        sys.path.append(str(project_root))

    from services.JWTauth_api.auth import router as auth_router
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
app.include_router(auth_router)