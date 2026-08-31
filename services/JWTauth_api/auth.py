import os
import re
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.hash import bcrypt
from pydantic import BaseModel, ConfigDict, ValidationError, field_validator

if __package__:
	from .services import authenticate_user, get_profile_by_user_id, get_user_by_id, get_user_by_email
else:
	from services import authenticate_user, get_profile_by_user_id, get_user_by_id, get_user_by_email


class UserRole(StrEnum):
	ADMIN = "admin"
	MANAGER = "manager"
	USER = "user"


class LoginPayload(BaseModel):
	email: str
	password: str

	@field_validator("email")
	@classmethod
	def validate_email(cls, value: str) -> str:
		if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
			raise ValueError("Invalid email format")
		return value


class LoginFormPayload(BaseModel):
	username: str
	password: str

	@field_validator("username")
	@classmethod
	def validate_username(cls, value: str) -> str:
		if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
			raise ValueError("Invalid email format")
		return value


class TokenResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"


class ProfileResponse(BaseModel):
	id: int
	user_id: int
	name: str | None = None
	phone: str | None = None
	address: str | None = None


class UserResponse(BaseModel):
	id: int
	email: str
	is_active: bool
	role: UserRole
	created_at: str

	model_config = ConfigDict(use_enum_values=True)


class AuthenticatedUserResponse(UserResponse):
	profile: ProfileResponse | None = None


router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-env")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
JWT_ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
	expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	payload = {"sub": str(user_id), "user_id": user_id, "exp": expire}
	return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _public_user(user: dict[str, Any]) -> UserResponse:
	return UserResponse(
		id=user["id"],
		email=user["email"],
		is_active=user.get("is_active", True),
		role=user.get("role", UserRole.USER),
		created_at=user["created_at"],
	)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict[str, Any]:
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Invalid or expired token",
		headers={"WWW-Authenticate": "Bearer"},
	)

	try:
		payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
		subject = payload.get("sub")
		if subject is None:
			raise credentials_exception
		user_id = int(subject)
	except (JWTError, ValueError):
		raise credentials_exception

	user = get_user_by_id(user_id)
	if user is None:
		raise credentials_exception
	return user


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
	try:
		payload = LoginFormPayload.model_validate(
			{
				"username": form.username,
				"password": form.password,
			}
		)
	except ValidationError as exc:
		raise HTTPException(status_code=422, detail=exc.errors())

	email = payload.username
	password = payload.password

	user = get_user_by_email(email)
	if not user or not bcrypt.verify(password, user["hashed_password"]):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Incorrect email or password",
			headers={"WWW-Authenticate": "Bearer"},
		)

	if not user.get("is_active", True):
		raise HTTPException(status_code=401, detail="Inactive user")

	return TokenResponse(access_token=create_access_token(user["id"]))



@router.get("/me", response_model=AuthenticatedUserResponse)
def read_me(current_user: dict[str, Any] = Depends(get_current_user)) -> AuthenticatedUserResponse:
	profile = get_profile_by_user_id(current_user["id"])
	profile_response = ProfileResponse(**profile) if profile else None
	return AuthenticatedUserResponse(**_public_user(current_user).model_dump(), profile=profile_response)
