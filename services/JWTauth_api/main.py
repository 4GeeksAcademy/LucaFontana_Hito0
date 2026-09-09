import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

if __package__:
	from .auth import router as auth_router
	from .profiles import router as profiles_router
	from .users import router as users_router
else:
	from auth import router as auth_router
	from profiles import router as profiles_router
	from users import router as users_router


app = FastAPI(title="JWT Auth API")

allowed_origins = [
	origin.strip()
	for origin in os.getenv(
		"CORS_ALLOWED_ORIGINS",
		"http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://*.app.github.dev",
	).split(",")
	if origin.strip()
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=allowed_origins,
	allow_origin_regex=r"https://.*\.app\.github\.dev$",
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
