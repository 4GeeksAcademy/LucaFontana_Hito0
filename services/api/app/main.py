from __future__ import annotations

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

load_dotenv()

from services.api.app.config import get_settings
from services.api.app.routers.incidents import router as incidents_router
from services.api.app.schemas import HealthResponse
from services.JWTauth_api.auth import router as auth_router
from services.JWTauth_api.profiles import router as profiles_router
from services.JWTauth_api.users import router as users_router
from services.inventory_management_API.database import engine
from services.inventory_management_API.routers.inventory import router as inventory_router
from services.manage_incidentsAPI.main import internal_error_handler
from services.manage_incidentsAPI.main import router as incident_management_router
from services.suppliers_api.routes.suppliers import router as suppliers_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Unified HTTP API for Brasaland services.",
    lifespan=lifespan,
)

app.add_exception_handler(Exception, internal_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"https://.*\.app\.github\.dev$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok")


app.include_router(incidents_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(inventory_router)
app.include_router(incident_management_router)
app.include_router(suppliers_router)