from datetime import datetime, timezone
from typing import Any

from passlib.hash import bcrypt
from tinydb import Query

if __package__:
	from .database import profiles_table, users_table
else:
	from database import profiles_table, users_table


def _normalize_email(email: str) -> str:
	return email.strip().lower()


def _serialize_user(doc: dict[str, Any] | None, doc_id: int | None = None) -> dict[str, Any] | None:
	if doc is None:
		return None
	user = dict(doc)
	if doc_id is not None:
		user["id"] = doc_id
	user.setdefault("id", user.get("id"))
	return user


def _serialize_profile(doc: dict[str, Any] | None, doc_id: int | None = None) -> dict[str, Any] | None:
	if doc is None:
		return None
	profile = dict(doc)
	if doc_id is not None:
		profile["id"] = doc_id
	profile.setdefault("id", profile.get("id"))
	return profile


def create_user_with_profile(
	email: str,
	password: str,
	role: str = "user",
	is_active: bool = True,
	name: str | None = None,
	phone: str | None = None,
	address: str | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
	normalized_email = _normalize_email(email)
	if get_user_by_email(normalized_email):
		raise ValueError("Email already registered")

	now_iso = datetime.now(timezone.utc).isoformat()
	user_data = {
		"email": normalized_email,
		"hashed_password": bcrypt.hash(password),
		"is_active": is_active,
		"role": role,
		"created_at": now_iso,
	}

	user_id = users_table.insert(user_data)
	users_table.update({"id": user_id}, doc_ids=[user_id])

	try:
		profile_data = {
			"user_id": user_id,
			"name": name,
			"phone": phone,
			"address": address,
		}
		profile_id = profiles_table.insert(profile_data)
		profiles_table.update({"id": profile_id}, doc_ids=[profile_id])
	except Exception:
		users_table.remove(doc_ids=[user_id])
		raise

	user = get_user_by_id(user_id)
	profile = get_profile_by_user_id(user_id)
	if user is None or profile is None:
		raise RuntimeError("User/profile creation failed")
	return user, profile


def get_user_by_email(email: str) -> dict[str, Any] | None:
	query = Query()
	normalized_email = _normalize_email(email)
	doc = users_table.get(query.email == normalized_email)
	if doc is None:
		return None
	return _serialize_user(doc, doc.doc_id)


def get_user_by_id(user_id: int) -> dict[str, Any] | None:
	doc = users_table.get(doc_id=user_id)
	if doc is None:
		return None
	return _serialize_user(doc, user_id)


def update_user(user_id: int, updates: dict[str, Any]) -> dict[str, Any] | None:
	safe_updates = dict(updates)
	safe_updates.pop("id", None)
	safe_updates.pop("hashed_password", None)
	safe_updates.pop("created_at", None)

	if "email" in safe_updates and safe_updates["email"] is not None:
		safe_updates["email"] = _normalize_email(safe_updates["email"])
		existing = get_user_by_email(safe_updates["email"])
		if existing is not None and existing["id"] != user_id:
			raise ValueError("Email already registered")

	if not safe_updates:
		return get_user_by_id(user_id)

	updated = users_table.update(safe_updates, doc_ids=[user_id])
	if not updated:
		return None
	return get_user_by_id(user_id)


def delete_user_and_profile(user_id: int) -> bool:
	query = Query()
	profiles_table.remove(query.user_id == user_id)
	removed_users = users_table.remove(doc_ids=[user_id])
	return bool(removed_users)


def get_profile_by_user_id(user_id: int) -> dict[str, Any] | None:
	query = Query()
	doc = profiles_table.get(query.user_id == user_id)
	if doc is None:
		return None
	return _serialize_profile(doc, doc.doc_id)


def update_profile(user_id: int, updates: dict[str, Any]) -> dict[str, Any] | None:
	profile = get_profile_by_user_id(user_id)
	if profile is None:
		return None

	safe_updates = {
		key: value
		for key, value in updates.items()
		if key in {"name", "phone", "address"}
	}
	if safe_updates:
		profiles_table.update(safe_updates, doc_ids=[profile["id"]])
	return get_profile_by_user_id(user_id)


def authenticate_user(email: str, password: str) -> dict[str, Any] | None:
	user = get_user_by_email(email)
	if user is None:
		return None
	if not bcrypt.verify(password, user["hashed_password"]):
		return None
	return user
