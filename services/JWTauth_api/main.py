from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from auth import router as auth_router
from profiles import router as profiles_router
from users import router as users_router


app = FastAPI(title="JWT Auth API")

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
