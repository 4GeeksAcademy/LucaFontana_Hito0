from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

from services.JWTauth_api import auth


@pytest.fixture
def jwt_secret(monkeypatch):
	monkeypatch.setattr(auth, "JWT_SECRET", "unit-test-secret")
	return "unit-test-secret"


def test_fresh_token_resolves_user(seeded_user, jwt_secret):
	user, _ = seeded_user

	resolved = auth.get_current_user(auth.create_access_token(user["id"]))

	assert resolved["id"] == user["id"]


@pytest.mark.parametrize("token_factory", [
	lambda secret: jwt.encode({"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)}, secret, algorithm="HS256"),
	lambda secret: jwt.encode({"sub": "1", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)}, "wrong-secret", algorithm="HS256"),
	lambda secret: "not-a-jwt",
	lambda secret: jwt.encode({"exp": datetime.now(timezone.utc) + timedelta(minutes=5)}, secret, algorithm="HS256"),
])
def test_current_user_rejects_expired_tampered_malformed_or_incomplete_tokens(
	isolated_tables, jwt_secret, token_factory
):
	with pytest.raises(HTTPException) as error:
		auth.get_current_user(token_factory(jwt_secret))

	assert error.value.status_code == 401


def test_current_user_rejects_token_for_unknown_user(isolated_tables, jwt_secret):
	token = jwt.encode(
		{"sub": "999", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
		jwt_secret,
		algorithm="HS256",
	)

	with pytest.raises(HTTPException) as error:
		auth.get_current_user(token)

	assert error.value.status_code == 401