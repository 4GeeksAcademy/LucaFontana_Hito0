import os
from pathlib import Path
from typing import Any

from tinydb import TinyDB

DB_PATH = Path(os.getenv("INCIDENTS_DB_PATH", str(Path(__file__).resolve().parent / "incidents.json")))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
_db = TinyDB(DB_PATH)


def get_db() -> TinyDB:
    return _db


def get_incidents() -> list[dict[str, Any]]:
    return [dict(item) for item in _db.table("incidents").all()]