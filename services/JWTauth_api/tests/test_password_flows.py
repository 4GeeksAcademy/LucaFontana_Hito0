import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from services.JWTauth_api import auth, services


def test_forgot_password_creates_a_hashed_expiring_reset_token(seeded_user, isolated_tables, monkeypatch):
	monkeypatch.setattr(auth, "RESEND_API_KEY", None)

	response = asyncio.run(auth.forgot_password(auth.ForgotPasswordPayload(email="test.user@example.com")))
	token_doc = isolated_tables["password_reset_tokens"].all()[0]

	assert response["message"].startswith("If that email address")
	assert token_doc["used"] is False
	assert token_doc["user_id"] == seeded_user[0]["id"]
	assert token_doc["token_hash"] != ""
	assert datetime.fromisoformat(token_doc["expires_at"]) > datetime.now(timezone.utc)


def test_forgot_password_does_not_disclose_unknown_email(isolated_tables):
	response = asyncio.run(auth.forgot_password(auth.ForgotPasswordPayload(email="missing@example.com")))

	assert response["message"].startswith("If that email address")
	assert isolated_tables["password_reset_tokens"].all() == []


def test_reset_password_updates_password_and_consumes_token(seeded_user, isolated_tables):
	raw_token = "one-time-reset-token"
	doc_id = isolated_tables["password_reset_tokens"].insert(
		{
			"user_id": seeded_user[0]["id"],
			"token_hash": auth._token_hash(raw_token),
			"expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
			"used": False,
		}
	)

	response = auth.reset_password(auth.ResetPasswordPayload(token=raw_token, new_password="new-valid-password"))

	assert response["message"] == "Password updated successfully"
	assert isolated_tables["password_reset_tokens"].get(doc_id=doc_id)["used"] is True
	assert services.authenticate_user(seeded_user[0]["email"], "new-valid-password") is not None


@pytest.mark.parametrize("token", ["wrong-token", ""])
def test_reset_password_rejects_invalid_or_expired_token(seeded_user, isolated_tables, token):
	isolated_tables["password_reset_tokens"].insert(
		{
			"user_id": seeded_user[0]["id"],
			"token_hash": auth._token_hash("valid-token"),
			"expires_at": (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat(),
			"used": False,
		}
	)

	with pytest.raises(HTTPException) as error:
		auth.reset_password(auth.ResetPasswordPayload(token=token, new_password="new-valid-password"))

	assert error.value.status_code == 400


def test_change_password_requires_current_password(seeded_user):
	current_user = seeded_user[0]
	payload = auth.ChangePasswordPayload(current_password="Correct horse battery staple!", new_password="changed-password")

	response = auth.change_password(payload, current_user)

	assert response["message"] == "Password updated successfully"
	assert services.authenticate_user(current_user["email"], "changed-password") is not None


def test_change_password_rejects_wrong_current_password(seeded_user):
	payload = auth.ChangePasswordPayload(current_password="wrong-password", new_password="changed-password")

	with pytest.raises(HTTPException) as error:
		auth.change_password(payload, seeded_user[0])

	assert error.value.status_code == 400