from __future__ import annotations

import argparse
from pathlib import Path

from incidents_analysis import (
    analyze_incidents_file,
    render_analysis_report,
    write_results_csv,
)


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Analyze Brasaland customer incident records from a CSV file.",
    )
    parser.add_argument("csv_path", help="Path to incidents CSV file")
    return parser


def should_export_results() -> bool:
    try:
        answer = input("¿Deseas exportar los resultados a CSV? [s / n]: ").strip().lower()
    except EOFError:
        return False
    return answer in {"y", "yes", "s", "si", "sí"}


def main() -> int:
    parser = build_argument_parser()
    args = parser.parse_args()

    csv_path = Path(args.csv_path)
    if not csv_path.exists():
        parser.error(f"File not found: {csv_path}")

    result = analyze_incidents_file(csv_path)
    print(render_analysis_report(result))

    if should_export_results():
        destination = write_results_csv(result, Path("results.csv"))
        print(f"Results exported to {destination.resolve()}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())