import asyncio
import hashlib
import json
import logging
import os
import re
import secrets
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.hash import bcrypt
from pydantic import BaseModel, ConfigDict, ValidationError, field_validator
from tinydb import Query

load_dotenv(Path(__file__).resolve().parent / ".env")

logger = logging.getLogger(__name__)

if __package__:
	from .database import password_reset_tokens_table
	from .services import authenticate_user, get_profile_by_user_id, get_user_by_id, get_user_by_email, update_password
else:
	from database import password_reset_tokens_table
	from services import authenticate_user, get_profile_by_user_id, get_user_by_id, get_user_by_email, update_password


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


class ForgotPasswordPayload(BaseModel):
	email: str

	@field_validator("email")
	@classmethod
	def validate_email(cls, value: str) -> str:
		if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
			raise ValueError("Invalid email format")
		return value


class ResetPasswordPayload(BaseModel):
	token: str
	new_password: str

	@field_validator("new_password")
	@classmethod
	def validate_password(cls, value: str) -> str:
		if len(value) < 8:
			raise ValueError("Password must be at least 8 characters long")
		return value


class ChangePasswordPayload(BaseModel):
	current_password: str
	new_password: str

	@field_validator("new_password")
	@classmethod
	def validate_password(cls, value: str) -> str:
		if len(value) < 8:
			raise ValueError("Password must be at least 8 characters long")
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

JWT_SECRET = os.getenv("JWT_SECRET", "")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
JWT_ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "30"))
RESET_URL = os.getenv("PASSWORD_RESET_URL", "http://localhost:3000/reset-password")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")


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


def _token_hash(token: str) -> str:
	return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _send_reset_email(email: str, reset_url: str) -> None:
	if not RESEND_API_KEY:
		logger.warning("Password reset email skipped: RESEND_API_KEY is not configured")
		return

	body = json.dumps(
		{
			"from": RESEND_FROM_EMAIL,
			"to": [email],
			"subject": "Restablece tu contraseña",
			"html": (
				"<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;"
				"color:#18181b'><h1>Restablece tu contraseña</h1>"
				f"<p>Este enlace será válido durante {RESET_TOKEN_EXPIRE_MINUTES} minutos.</p>"
				f"<p><a href='{reset_url}' style='display:inline-block;padding:12px 18px;"
				"background:#f97316;color:#fff;text-decoration:none;border-radius:8px'>"
				"Crear nueva contraseña</a></p>"
				"<p>Si no solicitaste este cambio, puedes ignorar este correo.</p></div>"
			),
		}
	).encode("utf-8")
	request = urllib.request.Request(
		"https://api.resend.com/emails",
		data=body,
		headers={
			"Authorization": f"Bearer {RESEND_API_KEY}",
			"Content-Type": "application/json",
			# Cloudflare blocks urllib's default "Python-urllib/x.y" UA with error 1010.
			"User-Agent": "JWTauth-api/1.0 (+https://resend.com)",
		},
		method="POST",
	)
	with urllib.request.urlopen(request, timeout=10):
		pass


async def _send_reset_email_safely(email: str, reset_url: str) -> bool:
	try:
		await asyncio.to_thread(_send_reset_email, email, reset_url)
		return True
	except urllib.error.HTTPError as error:
		logger.error("Resend rejected password reset email: status=%s", error.code)
		return False
	except (urllib.error.URLError, TimeoutError) as error:
		logger.warning("Password reset email provider unavailable: %s", type(error).__name__)
		return False


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
	try:
		payload = LoginFormPayload.model_validate(
			{
				"username": form.username,
				"password": form.password,
			}
		)
	except ValidationError:
		raise HTTPException(status_code=422, detail="Correo electrónico o contraseña inválidos.")

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


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordPayload) -> dict[str, str]:
	user = get_user_by_email(payload.email)
	if user:
		raw_token = secrets.token_urlsafe(32)
		expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
		doc_id = password_reset_tokens_table.insert(
			{
				"user_id": user["id"],
				"token_hash": _token_hash(raw_token),
				"expires_at": expires_at.isoformat(),
				"used": False,
			}
		)
		password_reset_tokens_table.update({"id": doc_id}, doc_ids=[doc_id])
		reset_url = f"{RESET_URL}?token={raw_token}"
		_ = await _send_reset_email_safely(user["email"], reset_url)

	return {"message": "If that email address is registered, you will receive a reset link shortly."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload) -> dict[str, str]:
	query = Query()
	token_doc = password_reset_tokens_table.get(query.token_hash == _token_hash(payload.token))
	if token_doc is None or token_doc.get("used", False):
		raise HTTPException(status_code=400, detail="Invalid or expired reset token")

	try:
		expires_at = datetime.fromisoformat(token_doc["expires_at"])
		if expires_at <= datetime.now(timezone.utc):
			raise ValueError
	except (KeyError, TypeError, ValueError):
		raise HTTPException(status_code=400, detail="Invalid or expired reset token")

	user = get_user_by_id(token_doc["user_id"])
	if user is None or update_password(user["id"], payload.new_password) is None:
		raise HTTPException(status_code=400, detail="Invalid or expired reset token")

	password_reset_tokens_table.update({"used": True}, doc_ids=[token_doc.doc_id])
	return {"message": "Password updated successfully"}


@router.post("/change-password")
def change_password(
	payload: ChangePasswordPayload,
	current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
	if not bcrypt.verify(payload.current_password, current_user["hashed_password"]):
		raise HTTPException(status_code=400, detail="Current password is incorrect")
	if update_password(current_user["id"], payload.new_password) is None:
		raise HTTPException(status_code=400, detail="Could not update password")
	return {"message": "Password updated successfully"}


@router.get("/me", response_model=AuthenticatedUserResponse)
def read_me(current_user: dict[str, Any] = Depends(get_current_user)) -> AuthenticatedUserResponse:
	profile = get_profile_by_user_id(current_user["id"])
	profile_response = ProfileResponse(**profile) if profile else None
	return AuthenticatedUserResponse(**_public_user(current_user).model_dump(), profile=profile_response)
