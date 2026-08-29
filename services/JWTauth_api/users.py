from enum import StrEnum
import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, field_validator

from auth import get_current_user
from database import users_table
from services import (
	create_user_with_profile,
	delete_user_and_profile,
	get_profile_by_user_id,
	get_user_by_id,
	update_user,
)


class UserRole(StrEnum):
	ADMIN = "admin"
	MANAGER = "manager"
	USER = "user"


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


class UserWithProfileResponse(UserResponse):
	profile: ProfileResponse | None = None


class UserCreateRequest(BaseModel):
	email: str
	password: str
	name: str | None = None
	phone: str | None = None
	address: str | None = None

	model_config = ConfigDict(use_enum_values=True)

	@field_validator("email")
	@classmethod
	def validate_email(cls, value: str) -> str:
		if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
			raise ValueError("Invalid email format")
		return value


class UserUpdateRequest(BaseModel):
	email: str | None = None
	role: UserRole | None = None

	model_config = ConfigDict(use_enum_values=True)

	@field_validator("email")
	@classmethod
	def validate_email(cls, value: str | None) -> str | None:
		if value is None:
			return None
		if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
			raise ValueError("Invalid email format")
		return value


router = APIRouter(prefix="/users", tags=["users"])


def _public_user(user: dict) -> UserResponse:
	return UserResponse(
		id=user["id"],
		email=user["email"],
		is_active=user.get("is_active", True),
		role=user.get("role", UserRole.USER),
		created_at=user["created_at"],
	)


@router.post("", response_model=UserWithProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreateRequest) -> UserWithProfileResponse:
	try:
		user, profile = create_user_with_profile(
			email=str(payload.email),
			password=payload.password,
			role=UserRole.USER,
			name=payload.name,
			phone=payload.phone,
			address=payload.address,
		)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc))

	return UserWithProfileResponse(**_public_user(user).model_dump(), profile=ProfileResponse(**profile))


@router.get("", response_model=list[UserResponse])
def list_users(current_user: dict = Depends(get_current_user)) -> list[UserResponse]:
	_ = current_user
	users = []
	for row in users_table.all():
		user = dict(row)
		user["id"] = row.doc_id
		users.append(_public_user(user))
	return users


@router.get("/{id}", response_model=UserWithProfileResponse)
def get_user(id: int, current_user: dict = Depends(get_current_user)) -> UserWithProfileResponse:
	_ = current_user
	user = get_user_by_id(id)
	if user is None:
		raise HTTPException(status_code=404, detail="User not found")
	profile = get_profile_by_user_id(id)
	profile_response = ProfileResponse(**profile) if profile else None
	return UserWithProfileResponse(**_public_user(user).model_dump(), profile=profile_response)


@router.put("/{id}", response_model=UserResponse)
def update_user_endpoint(
	id: int,
	payload: UserUpdateRequest,
	current_user: dict = Depends(get_current_user),
) -> UserResponse:
	target_user = get_user_by_id(id)
	if target_user is None:
		raise HTTPException(status_code=404, detail="User not found")

	is_admin = current_user.get("role") == UserRole.ADMIN
	is_self = current_user.get("id") == id
	if not (is_admin or is_self):
		raise HTTPException(status_code=403, detail="Forbidden")

	updates: dict = {}
	if payload.email is not None:
		updates["email"] = str(payload.email)
	if payload.role is not None:
		if not is_admin:
			raise HTTPException(status_code=403, detail="Forbidden")
		updates["role"] = payload.role

	try:
		updated_user = update_user(id, updates)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc))
	if updated_user is None:
		raise HTTPException(status_code=404, detail="User not found")

	return _public_user(updated_user)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_user(id: int, current_user: dict = Depends(get_current_user)) -> dict[str, str]:
	is_admin = current_user.get("role") == UserRole.ADMIN
	is_self = current_user.get("id") == id
	if not (is_admin or is_self):
		raise HTTPException(status_code=403, detail="Forbidden")

	removed = delete_user_and_profile(id)
	if not removed:
		raise HTTPException(status_code=404, detail="User not found")

	return {"detail": "User deleted"}
