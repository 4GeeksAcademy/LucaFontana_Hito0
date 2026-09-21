import pytest
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from services.JWTauth_api import auth, database, services, users


@pytest.fixture
def isolated_tables(monkeypatch):
	db = TinyDB(storage=MemoryStorage)
	tables = {
		"users": db.table("users"),
		"profiles": db.table("profiles"),
		"password_reset_tokens": db.table("password_reset_tokens"),
	}
	monkeypatch.setattr(database, "users_table", tables["users"])
	monkeypatch.setattr(database, "profiles_table", tables["profiles"])
	monkeypatch.setattr(database, "password_reset_tokens_table", tables["password_reset_tokens"])
	monkeypatch.setattr(services, "users_table", tables["users"])
	monkeypatch.setattr(services, "profiles_table", tables["profiles"])
	monkeypatch.setattr(users, "users_table", tables["users"])
	monkeypatch.setattr(auth, "password_reset_tokens_table", tables["password_reset_tokens"])
	yield tables
	db.close()


@pytest.fixture
def seeded_user(isolated_tables):
	user, profile = services.create_user_with_profile(
		" Test.User@example.com ",
		"Correct horse battery staple!",
		name="Test User",
	)
	return user, profile