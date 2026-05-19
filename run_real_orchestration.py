import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

DEFAULT_BASE_URL = "http://127.0.0.1:8000/api/v1"
DEFAULT_HEADERS = {"Authorization": "Bearer test-token"}
DEFAULT_DESCRIPTION = "Real data orchestration run from local CSV and scenario inputs."


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a scenario, upload real data, run analysis, and print agent traces."
    )
    parser.add_argument(
        "--sensor-csv",
        default="test_download.csv",
        help="Path to the real sensor CSV to upload.",
    )
    parser.add_argument(
        "--inventory-csv",
        help="Optional inventory CSV path.",
    )
    parser.add_argument(
        "--production-csv",
        help="Optional production CSV path.",
    )
    parser.add_argument(
        "--maintenance-csv",
        help="Optional maintenance CSV path.",
    )
    parser.add_argument(
        "--operator-note",
        action="append",
        default=[],
        help="Optional operator note text. Repeat flag to add multiple notes.",
    )
    parser.add_argument(
        "--email",
        action="append",
        default=[],
        help="Optional email text. Repeat flag to add multiple emails.",
    )
    parser.add_argument(
        "--news",
        action="append",
        default=[],
        help="Optional news text. Repeat flag to add multiple news items.",
    )
    parser.add_argument(
        "--policy",
        action="append",
        default=[],
        help="Optional policy text. Repeat flag to add multiple policy items.",
    )
    parser.add_argument(
        "--scenario-name",
        help="Optional scenario name. Defaults to a timestamped real-data name.",
    )
    parser.add_argument(
        "--description",
        default=DEFAULT_DESCRIPTION,
        help="Scenario description.",
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="Backend API base URL.",
    )
    parser.add_argument(
        "--token",
        default="test-token",
        help="Bearer token for the API.",
    )
    parser.add_argument(
        "--poll-attempts",
        type=int,
        default=30,
        help="Maximum polling attempts for analysis completion.",
    )
    parser.add_argument(
        "--poll-interval",
        type=int,
        default=5,
        help="Seconds between polling attempts.",
    )
    return parser.parse_args()


def require_file(path_str: str) -> Path:
    path = Path(path_str)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    return path


def create_scenario(base_url: str, headers: dict, name: str, description: str) -> str:
    response = requests.post(
        f"{base_url}/scenarios/",
        json={"name": name, "description": description},
        headers=headers,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return data["id"]


def upload_sensor_csv(base_url: str, headers: dict, scenario_id: str, csv_path: Path) -> None:
    with csv_path.open("rb") as handle:
        files = {"file": (csv_path.name, handle, "text/csv")}
        response = requests.post(
            f"{base_url}/scenarios/{scenario_id}/ingest/sensor",
            files=files,
            headers=headers,
            timeout=300,
        )
    response.raise_for_status()


def upload_generic_csv(base_url: str, headers: dict, scenario_id: str, csv_path: Path, data_type: str) -> None:
    with csv_path.open("rb") as handle:
        files = {"file": (csv_path.name, handle, "text/csv")}
        response = requests.post(
            f"{base_url}/scenarios/{scenario_id}/ingest/csv",
            params={"type": data_type},
            files=files,
            headers=headers,
            timeout=300,
        )
    response.raise_for_status()


def upload_text_items(base_url: str, headers: dict, scenario_id: str, item_type: str, values: list[str]) -> None:
    for value in values:
        response = requests.post(
            f"{base_url}/scenarios/{scenario_id}/ingest/text",
            json={"type": item_type, "content": value},
            headers=headers,
            timeout=60,
        )
        response.raise_for_status()


def start_analysis(base_url: str, headers: dict, scenario_id: str) -> None:
    response = requests.post(
        f"{base_url}/scenarios/{scenario_id}/analyze",
        headers=headers,
        timeout=60,
    )
    response.raise_for_status()


def get_status(base_url: str, headers: dict, scenario_id: str) -> str:
    response = requests.get(f"{base_url}/scenarios/", headers=headers, timeout=60)
    response.raise_for_status()
    data = response.json()
    if isinstance(data, list):
        match = next((item for item in data if item.get("id") == scenario_id), None)
        return match.get("status", "unknown") if match else "unknown"
    return data.get("status", "unknown")


def wait_for_completion(base_url: str, headers: dict, scenario_id: str, attempts: int, interval: int) -> str:
    for attempt in range(1, attempts + 1):
        time.sleep(interval)
        status = get_status(base_url, headers, scenario_id)
        print(f"   [{attempt}/{attempts}] Current Status: {status}")
        if status in {"complete", "error"}:
            return status
    return "timeout"


def get_results(base_url: str, headers: dict, scenario_id: str) -> dict:
    response = requests.get(
        f"{base_url}/scenarios/{scenario_id}/results",
        headers=headers,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def print_trace_summary(results: dict) -> None:
    traces = results.get("agent_traces", [])
    print("\n--- AGENT TRACE SUMMARY ---")
    if not traces:
        print("No agent traces returned.")
        return

    for index, trace in enumerate(traces, start=1):
        agent_name = trace.get("agent_name") or trace.get("agent") or f"agent_{index}"
        output = trace.get("output", {})
        keys = ", ".join(output.keys()) if isinstance(output, dict) else type(output).__name__
        print(f"{index}. {agent_name}: {keys}")
        print(json.dumps(output, indent=2)[:3000])
        print()


def main() -> int:
    args = parse_args()
    headers = dict(DEFAULT_HEADERS)
    headers["Authorization"] = f"Bearer {args.token}"

    sensor_csv = require_file(args.sensor_csv)
    inventory_csv = require_file(args.inventory_csv) if args.inventory_csv else None
    production_csv = require_file(args.production_csv) if args.production_csv else None
    maintenance_csv = require_file(args.maintenance_csv) if args.maintenance_csv else None

    scenario_name = args.scenario_name or f"Real Data Run {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    try:
        print("Creating scenario...")
        scenario_id = create_scenario(args.base_url, headers, scenario_name, args.description)
        print(f"Scenario created: {scenario_id}")

        print(f"Uploading sensor CSV: {sensor_csv}")
        upload_sensor_csv(args.base_url, headers, scenario_id, sensor_csv)

        if inventory_csv:
            print(f"Uploading inventory CSV: {inventory_csv}")
            upload_generic_csv(args.base_url, headers, scenario_id, inventory_csv, "inventory")
        if production_csv:
            print(f"Uploading production CSV: {production_csv}")
            upload_generic_csv(args.base_url, headers, scenario_id, production_csv, "production")
        if maintenance_csv:
            print(f"Uploading maintenance CSV: {maintenance_csv}")
            upload_generic_csv(args.base_url, headers, scenario_id, maintenance_csv, "maintenance")

        upload_text_items(args.base_url, headers, scenario_id, "operator_note", args.operator_note)
        upload_text_items(args.base_url, headers, scenario_id, "email", args.email)
        upload_text_items(args.base_url, headers, scenario_id, "news", args.news)
        upload_text_items(args.base_url, headers, scenario_id, "policy", args.policy)

        print("Triggering analysis...")
        start_analysis(args.base_url, headers, scenario_id)

        print("Polling for results...")
        status = wait_for_completion(
            args.base_url,
            headers,
            scenario_id,
            args.poll_attempts,
            args.poll_interval,
        )

        if status == "error":
            print("Analysis failed. Check backend logs.")
            return 1
        if status == "timeout":
            print("Timed out waiting for analysis completion.")
            return 1

        results = get_results(args.base_url, headers, scenario_id)
        print("\n--- FINAL RESULTS ---")
        print(json.dumps(results.get("final_results", {}), indent=2)[:8000])
        print_trace_summary(results)
        print(f"Scenario ID: {scenario_id}")
        return 0
    except requests.HTTPError as exc:
        response_text = exc.response.text if exc.response is not None else str(exc)
        print(f"HTTP error: {response_text}")
        return 1
    except Exception as exc:
        print(f"Run failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
