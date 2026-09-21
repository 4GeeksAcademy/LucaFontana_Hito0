import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from services.JWTauth_api import auth


def run_login(email: str, password: str):
	return asyncio.run(auth.login(SimpleNamespace(username=email, password=password)))


def test_login_returns_bearer_token_for_valid_credentials(seeded_user):
	response = run_login("test.user@example.com", "Correct horse battery staple!")

	assert response.token_type == "bearer"
	assert response.access_token


@pytest.mark.parametrize("email,password", [
	("missing@example.com", "Correct horse battery staple!"),
	("test.user@example.com", "wrong-password"),
	("", "Correct horse battery staple!"),
	("test.user@example.com", ""),
	("test.user@example.com", "   "),
])
def test_login_rejects_invalid_credentials(seeded_user, email, password):
	with pytest.raises(HTTPException) as error:
		run_login(email, password)

	assert error.value.status_code in {401, 422}


def test_login_rejects_inactive_user(isolated_tables):
	from services.JWTauth_api.services import create_user_with_profile

	create_user_with_profile("inactive@example.com", "valid-password", is_active=False)

	with pytest.raises(HTTPException) as error:
		run_login("inactive@example.com", "valid-password")

	assert error.value.status_code == 401