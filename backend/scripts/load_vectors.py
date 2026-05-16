import argparse
import json
from pathlib import Path

from google.cloud import bigquery


def load_jsonl(project_id: str, dataset: str, table: str, source: Path) -> None:
    client = bigquery.Client(project=project_id)
    rows = []
    with source.open("r", encoding="utf-8") as handle:
        for line in handle:
            row = json.loads(line)
            metadata = row.get("metadata")
            if isinstance(metadata, (dict, list)):
                row["metadata"] = json.dumps(metadata)
            rows.append(row)

    errors = client.insert_rows_json(f"{project_id}.{dataset}.{table}", rows)
    if errors:
        raise RuntimeError(f"BigQuery insert errors: {errors}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Load vector rows into BigQuery")
    parser.add_argument("--project", required=True)
    parser.add_argument("--dataset", required=True)
    parser.add_argument("--table", required=True)
    parser.add_argument("--source", required=True)
    args = parser.parse_args()

    source = Path(args.source)
    if not source.exists():
        raise FileNotFoundError(source)

    load_jsonl(args.project, args.dataset, args.table, source)


if __name__ == "__main__":
    main()
