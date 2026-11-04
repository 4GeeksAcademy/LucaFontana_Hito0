#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

LOG_PATTERN = re.compile(
    r"^(?P<method>[A-Z]+) (?P<path>/\S*) (?:→|->) (?P<status>\d{3}) "
    r"\| (?P<duration>\d+(?:\.\d+)?)ms(?: \| cache=(?P<cache>[A-Z]+))?$"
)


def percentile_95(samples: list[float]) -> float:
    ordered = sorted(samples)
    return ordered[max(0, math.ceil(len(ordered) * 0.95) - 1)]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Rank API timing logs by latency and total time consumed."
    )
    parser.add_argument(
        "logs",
        nargs="*",
        type=Path,
        help="Timing log paths (defaults to services/*/logs/timing.log).",
    )
    parser.add_argument("--min-calls", type=int, default=10)
    parser.add_argument("--min-average-ms", type=float, default=100)
    args = parser.parse_args()

    log_paths = args.logs or sorted(Path("services").glob("*/logs/timing.log"))
    if not log_paths:
        print("No timing logs found; send requests to the services first.", file=sys.stderr)
        return 2

    observations: dict[tuple[str, str], list[tuple[float, str | None]]] = defaultdict(list)
    malformed_lines = 0
    for path in log_paths:
        if not path.is_file():
            print(f"Timing log not found: {path}", file=sys.stderr)
            return 2
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            match = LOG_PATTERN.fullmatch(line)
            if match is None:
                malformed_lines += 1
                continue
            key = (match["method"], match["path"])
            observations[key].append((float(match["duration"]), match["cache"]))

    if not observations:
        print("No timing entries found in the supplied logs.", file=sys.stderr)
        return 2

    rows = []
    for (method, path), events in observations.items():
        durations = [duration for duration, _ in events]
        call_count = len(durations)
        average = sum(durations) / call_count
        total = sum(durations)
        candidate = (
            call_count >= args.min_calls
            and average >= args.min_average_ms
            and total >= args.min_calls * args.min_average_ms
        )
        hits = sum(cache == "HIT" for _, cache in events)
        misses = sum(cache == "MISS" for _, cache in events)
        rows.append(
            (
                total,
                method,
                path,
                call_count,
                average,
                percentile_95(durations),
                hits,
                misses,
                "candidate" if candidate else "-",
            )
        )

    print("METHOD PATH CALLS AVG_MS P95_MS TOTAL_MS CACHE_HITS CACHE_MISSES TRIAGE")
    for total, method, path, calls, average, p95, hits, misses, triage in sorted(
        rows, reverse=True
    ):
        print(
            f"{method} {path} {calls} {average:.1f} {p95:.1f} "
            f"{total:.1f} {hits} {misses} {triage}"
        )
    if malformed_lines:
        print(f"Ignored {malformed_lines} non-timing or malformed lines.", file=sys.stderr)
    print(
        "Triage flags require repeated calls, average latency at/above the threshold, "
        "and corresponding total time; confirm read-only stability before caching."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
