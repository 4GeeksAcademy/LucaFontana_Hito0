import pytest
from pydantic import ValidationError

from services.JWTauth_api import services
from services.JWTauth_api.users import UserCreateRequest, create_user


def test_registration_creates_normalized_user_and_profile(isolated_tables):
	payload = UserCreateRequest(
		email="  New.User+tag@example.com ",
		password="p@ssword-with-specials!",
		name="New User",
	)

	result = create_user(payload)

	assert result.email == "new.user+tag@example.com"
	assert result.profile is not None
	assert services.authenticate_user(result.email, payload.password)["id"] == result.id


def test_registration_rejects_duplicate_email_after_normalization(seeded_user):
	payload = UserCreateRequest(email="TEST.USER@EXAMPLE.COM", password="another-valid-password")

	with pytest.raises(Exception) as error:
		create_user(payload)

	assert getattr(error.value, "status_code", None) == 400
	assert "already registered" in str(error.value.detail)


@pytest.mark.parametrize("email", ["", "not-an-email", "name @example.com"])
def test_registration_rejects_invalid_email(email):
	with pytest.raises(ValidationError):
		UserCreateRequest(email=email, password="valid-password")


@pytest.mark.parametrize("password", ["", "        "])
def test_registration_rejects_empty_or_whitespace_password(password):
	with pytest.raises(ValidationError):
		UserCreateRequest(email="valid@example.com", password=password)


def test_registration_rolls_back_user_when_profile_creation_fails(monkeypatch, isolated_tables):
	def fail_profile_insert(*args, **kwargs):
		raise RuntimeError("profile storage unavailable")

	monkeypatch.setattr(services.profiles_table, "insert", fail_profile_insert)

	with pytest.raises(RuntimeError, match="User/profile creation failed"):
		services.create_user_with_profile("rollback@example.com", "valid-password")

	assert services.get_user_by_email("rollback@example.com") is None