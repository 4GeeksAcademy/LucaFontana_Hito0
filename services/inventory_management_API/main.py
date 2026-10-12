import sys
from pathlib import Path

from sqlmodel import SQLModel
from fastapi import FastAPI

if __package__:
	from services.JWTauth_api.auth import router as auth_router
	from services.inventory_management_API.database import engine
	import services.inventory_management_API.models as models
	from services.inventory_management_API.routers.inventory import router as inventory_router
else:
	project_root = Path(__file__).resolve().parents[2]
	if str(project_root) not in sys.path:
		sys.path.insert(0, str(project_root))

	from services.JWTauth_api.auth import router as auth_router
	from database import engine
	import models
	from routers.inventory import router as inventory_router

SQLModel.metadata.create_all(engine)
app = FastAPI()

app.include_router(inventory_router)
app.include_router(auth_router)
