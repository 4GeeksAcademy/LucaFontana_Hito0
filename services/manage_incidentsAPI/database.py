from pathlib import Path
from typing import Any

from tinydb import TinyDB

DB_PATH = Path(__file__).resolve().parent / "incidents.json"
_db = TinyDB(DB_PATH)


def get_db() -> TinyDB:
    return _db


def get_incidents() -> list[dict[str, Any]]:
    return [dict(item) for item in _db.table("incidents").all()]