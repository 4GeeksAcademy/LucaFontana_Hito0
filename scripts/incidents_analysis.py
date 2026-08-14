from __future__ import annotations

import csv
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Mapping

VALID_LOCATIONS = {
    "COL-01",
    "COL-02",
    "COL-03",
    "COL-04",
    "COL-05",
    "COL-06",
    "COL-07",
    "COL-08",
    "COL-09",
    "COL-10",
    "FLA-01",
    "FLA-02",
    "FLA-03",
    "FLA-04",
}

CATEGORY_ORDER = [
    "CUSTOMER_COMPLAINT",
    "EQUIPMENT",
    "SUPPLY",
    "FOOD_QUALITY",
    "STAFF",
]
VALID_CATEGORIES = set(CATEGORY_ORDER)

STATUS_ORDER = ["OPEN", "CLOSED", "DISCARDED"]
VALID_STATUSES = set(STATUS_ORDER)

INVALID_RULE_ORDER = [
    "missing_location_id",
    "invalid_category",
    "empty_description",
    "missing_reporter_id",
    "closed_without_score",
    "score_out_of_range",
    "invalid_status",
]

INVALID_RULE_LABELS = {
    "missing_location_id": "Missing location_id",
    "invalid_category": "Invalid or missing category",
    "empty_description": "Empty description",
    "missing_reporter_id": "Missing reporter_id",
    "closed_without_score": "Closed case, no score",
    "score_out_of_range": "Score outside 1-5",
    "invalid_status": "Invalid or missing status",
}

SATISFACTION_LABELS = {
    1: "Very dissatisfied",
    2: "Dissatisfied",
    3: "Neutral",
    4: "Satisfied",
    5: "Very satisfied",
}


@dataclass(frozen=True)
class IncidentRecord:
    incident_id: str
    date: str
    location_id: str
    category: str
    description: str
    status: str
    customer_id: str | None
    satisfaction_score: int | None
    reporter_id: str


@dataclass
class AnalysisResult:
    source_file: str
    total_records: int = 0
    valid_records: int = 0
    invalid_records: int = 0
    invalid_breakdown: Counter[str] = field(default_factory=Counter)
    category_counts: Counter[str] = field(default_factory=Counter)
    status_counts: Counter[str] = field(default_factory=Counter)
    satisfaction_counts: Counter[int] = field(default_factory=Counter)
    closed_cases: int = 0
    scored_closed_cases: int = 0
    satisfaction_total: int = 0

    @property
    def average_satisfaction(self) -> float:
        if self.scored_closed_cases == 0:
            return 0.0
        return self.satisfaction_total / self.scored_closed_cases


def analyze_incidents_file(csv_path: str | Path) -> AnalysisResult:
    path = Path(csv_path)
    result = AnalysisResult(source_file=path.name)

    with path.open("r", encoding="utf-8", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            result.total_records += 1
            record, invalid_reasons = validate_incident_row(row)

            if invalid_reasons:
                result.invalid_records += 1
                result.invalid_breakdown.update(invalid_reasons)
                continue

            if record is None:
                continue

            result.valid_records += 1
            result.category_counts[record.category] += 1
            result.status_counts[record.status] += 1

            if record.status == "CLOSED":
                result.closed_cases += 1
                if record.satisfaction_score is not None:
                    result.scored_closed_cases += 1
                    result.satisfaction_total += record.satisfaction_score
                    result.satisfaction_counts[record.satisfaction_score] += 1

    return result


def validate_incident_row(row: Mapping[str, str | None]) -> tuple[IncidentRecord | None, list[str]]:
    invalid_reasons: list[str] = []

    incident_id = clean_text(row.get("incident_id"))
    date = clean_text(row.get("date"))
    location_id = clean_text(row.get("location_id"))
    category = clean_text(row.get("category"))
    description = clean_text(row.get("description"))
    status = clean_text(row.get("status"))
    customer_id = clean_text(row.get("customer_id")) or None
    reporter_id = clean_text(row.get("reporter_id"))

    satisfaction_text = clean_text(row.get("satisfaction_score"))
    satisfaction_score = parse_optional_int(satisfaction_text)

    if location_id not in VALID_LOCATIONS:
        invalid_reasons.append("missing_location_id")

    if category not in VALID_CATEGORIES:
        invalid_reasons.append("invalid_category")

    if len(description) < 5:
        invalid_reasons.append("empty_description")

    if not reporter_id:
        invalid_reasons.append("missing_reporter_id")

    if status not in VALID_STATUSES:
        invalid_reasons.append("invalid_status")

    if status == "CLOSED" and satisfaction_score is None:
        invalid_reasons.append("closed_without_score")

    if satisfaction_text and (satisfaction_score is None or satisfaction_score not in SATISFACTION_LABELS):
        invalid_reasons.append("score_out_of_range")

    if invalid_reasons:
        return None, invalid_reasons

    return (
        IncidentRecord(
            incident_id=incident_id,
            date=date,
            location_id=location_id,
            category=category,
            description=description,
            status=status,
            customer_id=customer_id,
            satisfaction_score=satisfaction_score,
            reporter_id=reporter_id,
        ),
        [],
    )


def build_export_rows(result: AnalysisResult) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = [
        {"metric": "total_records", "value": str(result.total_records), "percentage": ""},
        {"metric": "valid_records", "value": str(result.valid_records), "percentage": ""},
        {"metric": "invalid_records", "value": str(result.invalid_records), "percentage": ""},
    ]

    for rule_key in INVALID_RULE_ORDER:
        rows.append(
            {
                "metric": f"invalid_{rule_key}",
                "value": str(result.invalid_breakdown.get(rule_key, 0)),
                "percentage": "",
            }
        )

    for category in CATEGORY_ORDER:
        rows.append(
            {
                "metric": f"category_{category.lower()}",
                "value": str(result.category_counts.get(category, 0)),
                "percentage": format_percentage_value(result.category_counts.get(category, 0), result.valid_records),
            }
        )

    for status in STATUS_ORDER:
        rows.append(
            {
                "metric": f"status_{status.lower()}",
                "value": str(result.status_counts.get(status, 0)),
                "percentage": format_percentage_value(result.status_counts.get(status, 0), result.valid_records),
            }
        )

    rows.extend(
        [
            {"metric": "closed_cases", "value": str(result.closed_cases), "percentage": ""},
            {"metric": "scored_closed_cases", "value": str(result.scored_closed_cases), "percentage": ""},
            {
                "metric": "average_satisfaction_score",
                "value": f"{result.average_satisfaction:.2f}",
                "percentage": "",
            },
        ]
    )

    for score in range(1, 6):
        rows.append(
            {
                "metric": f"satisfaction_score_{score}",
                "value": str(result.satisfaction_counts.get(score, 0)),
                "percentage": format_percentage_value(result.satisfaction_counts.get(score, 0), result.scored_closed_cases),
            }
        )

    return rows


def render_analysis_report(result: AnalysisResult) -> str:
    lines = [
        "=" * 60,
        "  BRASALAND — INCIDENT REPORT ANALYSIS",
        f"  Source file: {result.source_file}",
        "=" * 60,
        "",
        format_summary_line("TOTAL RECORDS IN FILE", result.total_records, label_width=38),
        format_summary_line("  ├─ Valid records", result.valid_records, label_width=38),
        format_summary_line("  └─ Invalid / incomplete", result.invalid_records, label_width=38),
        "",
        "INVALID RECORDS BREAKDOWN",
    ]

    invalid_items = [
        (INVALID_RULE_LABELS[rule_key], result.invalid_breakdown.get(rule_key, 0))
        for rule_key in INVALID_RULE_ORDER
        if result.invalid_breakdown.get(rule_key, 0) > 0
    ]
    lines.extend(format_tree_block(invalid_items, label_width=38))

    lines.extend(
        [
            "",
            "BREAKDOWN BY CATEGORY (valid records)",
        ]
    )
    category_items = [
        (category, result.category_counts.get(category, 0), result.valid_records)
        for category in CATEGORY_ORDER
    ]
    lines.extend(format_tree_block_with_percentage(category_items, label_width=38))

    lines.extend(
        [
            "",
            "BREAKDOWN BY STATUS (valid records)",
        ]
    )
    status_items = [
        (status, result.status_counts.get(status, 0), result.valid_records)
        for status in STATUS_ORDER
    ]
    lines.extend(format_tree_block_with_percentage(status_items, label_width=38))

    lines.extend(
        [
            "",
            "SATISFACTION INDEX (closed cases)",
            f"  Scored cases: {result.scored_closed_cases} of {result.closed_cases}",
            f"  Average score: {result.average_satisfaction:.2f} / 5.00",
        ]
    )
    satisfaction_items = [
        (f"Score {score} ({SATISFACTION_LABELS[score]})", result.satisfaction_counts.get(score, 0))
        for score in range(1, 6)
    ]
    lines.extend(format_tree_block(satisfaction_items, label_width=38))
    lines.append("")
    lines.append("=" * 60)

    return "\n".join(lines)


def write_results_csv(result: AnalysisResult, output_path: str | Path) -> Path:
    destination = Path(output_path)
    with destination.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=["metric", "value", "percentage"])
        writer.writeheader()
        writer.writerows(build_export_rows(result))
    return destination


def clean_text(value: str | None) -> str:
    if value is None:
        return ""
    return value.strip()


def parse_optional_int(value: str) -> int | None:
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def format_percentage_value(count: int, total: int) -> str:
    if total == 0:
        return "0.0"
    return f"{(count / total) * 100:.1f}"


def format_summary_line(label: str, value: int, label_width: int) -> str:
    dots = "." * max(2, label_width - len(label))
    return f"{label} {dots} {value:>3}"


def format_tree_block(items: list[tuple[str, int]], label_width: int) -> list[str]:
    if not items:
        return [format_summary_line("  └─ None", 0, label_width)]

    lines: list[str] = []
    for index, (label, value) in enumerate(items):
        branch = "└─" if index == len(items) - 1 else "├─"
        lines.append(format_summary_line(f"  {branch} {label}", value, label_width))
    return lines


def format_tree_block_with_percentage(
    items: list[tuple[str, int, int]],
    label_width: int,
) -> list[str]:
    lines: list[str] = []
    for index, (label, value, total) in enumerate(items):
        branch = "└─" if index == len(items) - 1 else "├─"
        dots = "." * max(2, label_width - len(f"  {branch} {label}"))
        percentage = format_percentage_value(value, total)
        lines.append(f"  {branch} {label} {dots} {value:>3}  ({percentage:>5}%)")
    return lines