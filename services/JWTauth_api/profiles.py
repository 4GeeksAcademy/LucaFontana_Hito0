from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

if __package__:
	from .auth import get_current_user
	from .services import get_profile_by_user_id, update_profile
else:
	from auth import get_current_user
	from services import get_profile_by_user_id, update_profile


class ProfileResponse(BaseModel):
	id: int
	user_id: int
	name: str | None = None
	phone: str | None = None
	address: str | None = None


class ProfileUpdateRequest(BaseModel):
	name: str | None = None
	phone: str | None = None
	address: str | None = None


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
def read_my_profile(current_user: dict = Depends(get_current_user)) -> ProfileResponse:
	profile = get_profile_by_user_id(current_user["id"])
	if profile is None:
		raise HTTPException(status_code=404, detail="Profile not found")
	return ProfileResponse(**profile)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
	payload: ProfileUpdateRequest,
	current_user: dict = Depends(get_current_user),
) -> ProfileResponse:
	profile = update_profile(current_user["id"], payload.model_dump(exclude_unset=True))
	if profile is None:
		raise HTTPException(status_code=404, detail="Profile not found")
	return ProfileResponse(**profile)
