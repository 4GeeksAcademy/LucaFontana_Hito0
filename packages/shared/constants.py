"""Canonical values used by every incident-management surface."""

BRANCH_LABELS = {
    "central": "Central (Medellín / Miami)",
    "medellin_centro": "Medellín Centro",
    "medellin_laureles": "Medellín Laureles",
    "medellin_envigado": "Medellín Envigado",
    "medellin_bello": "Medellín Bello",
    "medellin_itagui": "Medellín Itagüí",
    "bogota_chapinero": "Bogotá Chapinero",
    "bogota_usaquen": "Bogotá Usaquén",
    "cali_granada": "Cali Granada",
    "barranquilla_norte": "Barranquilla Norte",
    "miami_doral": "Miami Doral",
    "miami_hialeah": "Miami Hialeah",
    "miami_kendall": "Miami Kendall",
    "orlando_international": "Orlando International Drive",
    "fort_lauderdale": "Fort Lauderdale",
}

BRANCHES = tuple(BRANCH_LABELS)
CATEGORIES = (
    "equipment_failure",
    "supply_issue",
    "customer_complaint",
    "staff_issue",
    "facility_issue",
    "pos_system",
    "delivery_issue",
    "other",
)
ORIGINS = ("customer", "branch", "internal")
STATUSES = ("open", "in_progress", "resolved", "discarded")

STATUS_TRANSITIONS = {
    "open": frozenset({"in_progress", "discarded"}),
    "in_progress": frozenset({"resolved", "discarded"}),
    "resolved": frozenset(),
    "discarded": frozenset(),
}