from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from tinydb import TinyDB
from tinydb.table import Document, Table

DB_PATH = Path(__file__).resolve().parent / "db.json"
_db = TinyDB(DB_PATH)


def get_db() -> TinyDB:
    return _db


def get_suppliers_table() -> Table:
    return _db.table("suppliers")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def document_to_supplier_payload(document: Document) -> dict[str, Any]:
    payload = dict(document)
    payload["id"] = document.doc_id
    return payload