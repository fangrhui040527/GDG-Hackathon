"""Real Spanner Graph MCP handler — wires spanner_graph_query to the Spanner client."""
from typing import Any

from nexusai.config import Settings


def spanner_graph_query(settings: Settings, gql: str, parameters: dict[str, Any] | None = None) -> dict:
    """Execute a GQL query against Cloud Spanner Graph and return results."""
    instance_id = settings.spanner_instance_id
    database_id = settings.spanner_database_id

    if not instance_id or not database_id:
        return {"status": "not_configured", "reason": "SPANNER_INSTANCE_ID or SPANNER_DATABASE_ID not set"}

    try:
        from google.cloud import spanner

        client = spanner.Client(project=settings.google_cloud_project)
        instance = client.instance(instance_id)
        database = instance.database(database_id)

        results: list[dict] = []

        def _read(transaction):
            row_iter = transaction.execute_sql(gql, params=parameters or {})
            for row in row_iter:
                results.append(dict(zip([col.name for col in row_iter.fields], row)))

        database.run_in_transaction(_read)
        return {"status": "ok", "rows": results, "count": len(results)}

    except Exception as e:
        return {"status": "error", "error": str(e)}
