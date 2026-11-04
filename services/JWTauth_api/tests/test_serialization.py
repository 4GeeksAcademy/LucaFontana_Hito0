from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from fastapi.routing import APIRoute

from services.JWTauth_api import auth, profiles, users
from services.JWTauth_api.main import app


@pytest.fixture
def client(isolated_tables):
	previous_overrides = app.dependency_overrides.copy()
	current_user = {
		"id": 7,
		"email": "current@example.com",
		"hashed_password": "internal-hash",
		"is_active": True,
		"role": "admin",
		"created_at": "2026-01-01T00:00:00+00:00",
	}
	app.dependency_overrides[auth.get_current_user] = lambda: current_user

	with TestClient(app) as test_client:
		yield test_client

	app.dependency_overrides = previous_overrides


def test_login_response_contains_only_client_token_fields(client, monkeypatch):
	monkeypatch.setattr(
		auth,
		"get_user_by_email",
		lambda email: {
			"id": 7,
			"email": email,
			"hashed_password": "internal-hash",
			"is_active": True,
		},
	)
	monkeypatch.setattr(auth.bcrypt, "verify", lambda *_: True)
	monkeypatch.setattr(auth, "create_access_token", lambda _user_id: "client-token")

	response = client.post("/auth/login", data={"username": "user@example.com", "password": "password"})

	assert response.status_code == 200
	assert response.json() == {"access_token": "client-token", "token_type": "bearer"}


def test_registration_response_omits_email_and_ignores_mass_assignment(client, monkeypatch):
	created = {}

	def create_user_with_profile(**values):
		created.update(values)
		return (
			{
				"id": 41,
				"email": values["email"],
				"hashed_password": "internal-hash",
				"is_active": True,
				"role": values["role"],
				"created_at": "2026-01-01T00:00:00+00:00",
			},
			{"id": 42, "user_id": 41, "name": values["name"], "phone": None, "address": None},
		)

	monkeypatch.setattr(users, "create_user_with_profile", create_user_with_profile)

	response = client.post(
		"/users",
		json={
			"email": "user@example.com",
			"password": "password",
			"name": "Public name",
			"id": 99,
			"role": "admin",
			"created_at": "client-value",
		},
	)

	assert response.status_code == 201
	assert response.json() == {"id": 41}
	assert created["role"] == users.UserRole.USER


def test_forgot_password_response_is_generic_and_does_not_echo_email(client, monkeypatch):
	monkeypatch.setattr(auth, "get_user_by_email", lambda _email: None)

	response = client.post("/auth/forgot-password", json={"email": "unknown@example.com"})

	assert response.status_code == 200
	assert set(response.json()) == {"message"}
	assert "unknown@example.com" not in response.text


def test_reset_password_response_contains_only_message(client, isolated_tables, monkeypatch):
	raw_token = "one-time-token"
	isolated_tables["password_reset_tokens"].insert(
		{
			"user_id": 7,
			"token_hash": auth._token_hash(raw_token),
			"expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
			"used": False,
		}
	)
	monkeypatch.setattr(auth, "get_user_by_id", lambda _user_id: {"id": 7})
	monkeypatch.setattr(auth, "update_password", lambda *_: {"id": 7, "hashed_password": "internal-hash"})

	response = client.post("/auth/reset-password", json={"token": raw_token, "new_password": "new-password"})

	assert response.status_code == 200
	assert response.json() == {"message": "Password updated successfully"}


def test_change_password_response_contains_only_message(client, monkeypatch):
	monkeypatch.setattr(auth.bcrypt, "verify", lambda *_: True)
	monkeypatch.setattr(auth, "update_password", lambda *_: {"id": 7, "hashed_password": "internal-hash"})

	response = client.post(
		"/auth/change-password",
		json={"current_password": "old-password", "new_password": "new-password"},
	)

	assert response.status_code == 200
	assert response.json() == {"message": "Password updated successfully"}


def test_current_user_response_excludes_credentials_and_internal_tokens(client):
	response = client.get("/auth/me")

	assert response.status_code == 200
	assert set(response.json()) == {"id", "email", "is_active", "role", "created_at", "profile"}
	assert "hashed_password" not in response.text
	assert "internal-hash" not in response.text


def test_user_list_response_contains_only_public_user_fields(client, isolated_tables):
	isolated_tables["users"].insert(
		{
			"email": "listed@example.com",
			"hashed_password": "internal-hash",
			"is_active": True,
			"role": "user",
			"created_at": "2026-01-01T00:00:00+00:00",
			"refresh_token": "internal-token",
		}
	)

	response = client.get("/users")

	assert response.status_code == 200
	assert response.json() == [
		{
			"id": 1,
			"email": "listed@example.com",
			"is_active": True,
			"role": "user",
			"created_at": "2026-01-01T00:00:00+00:00",
		}
	]
	assert "internal-hash" not in response.text
	assert "internal-token" not in response.text


def test_delete_user_response_contains_only_detail(client, monkeypatch):
	monkeypatch.setattr(users, "delete_user_and_profile", lambda _user_id: True)

	response = client.delete("/users/7")

	assert response.status_code == 200
	assert response.json() == {"detail": "User deleted"}


def test_profile_update_ignores_non_writable_fields(client, monkeypatch):
	updated = {}

	def update_profile(_user_id, values):
		updated.update(values)
		return {"id": 42, "user_id": 7, "name": values["name"], "phone": None, "address": None}

	monkeypatch.setattr(profiles, "update_profile", update_profile)

	response = client.put(
		"/profiles/me",
		json={"name": "Updated name", "id": 999, "user_id": 999, "is_admin": True},
	)

	assert response.status_code == 200
	assert response.json() == {
		"id": 42,
		"user_id": 7,
		"name": "Updated name",
		"phone": None,
		"address": None,
	}
	assert updated == {"name": "Updated name"}


def test_every_service_endpoint_declares_a_response_model():
	routes = [
		route
		for router in (auth.router, users.router, profiles.router)
		for route in router.routes
		if isinstance(route, APIRoute)
	]

	assert len(routes) == 12
	assert all(route.response_model is not None for route in routes)
