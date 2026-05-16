from google.cloud import bigquery

from app.config import Settings
from app.models import BigQueryGraphRequest, BigQueryGraphResponse


def run_graph_query(settings: Settings, payload: BigQueryGraphRequest) -> BigQueryGraphResponse:
    client = bigquery.Client(
        project=settings.bigquery_project_id,
        location=settings.bigquery_location,
    )

    job = client.query(payload.sql)
    rows = job.result(max_results=payload.max_rows)

    return BigQueryGraphResponse(rows=[dict(row) for row in rows])
