"""Pure validation functions for incident payloads and lifecycle changes."""

from typing import Any

from .constants import BRANCHES, CATEGORIES, ORIGINS, STATUSES, STATUS_TRANSITIONS


def validate_incident_data(data: dict[str, Any]) -> dict[str, str]:
    errors: dict[str, str] = {}

    for field, label in (("title", "Title"), ("description", "Description")):
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            errors[field] = f"{label} is required"

    for field, allowed, label in (
        ("category", CATEGORIES, "category"),
        ("origin", ORIGINS, "origin"),
        ("branch", BRANCHES, "branch"),
    ):
        if data.get(field) not in allowed:
            errors[field] = f"Invalid {label}"

    if "status" in data and data["status"] not in STATUSES:
        errors["status"] = "Invalid status"

    return errors


def validate_status_transition(current_status: str, new_status: str) -> tuple[bool, str]:
    if new_status not in STATUSES:
        return False, f"Invalid status '{new_status}'"
    if current_status not in STATUSES:
        return False, f"Invalid current status '{current_status}'"
    if new_status not in STATUS_TRANSITIONS[current_status]:
        return False, f"Invalid status transition from '{current_status}' to '{new_status}'"
    return True, ""