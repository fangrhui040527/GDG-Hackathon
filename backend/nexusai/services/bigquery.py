"""BigQuery analytics + BQML reranker service."""
from typing import Any

from nexusai.config import Settings


class BigQueryService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._dataset = settings.bigquery_dataset
        self._location = settings.bigquery_location
        self._reranker_model = settings.bigquery_reranker_model

    def _client(self):
        from google.cloud import bigquery

        return bigquery.Client(
            project=self.settings.google_cloud_project,
            location=self._location,
        )

    def _query(self, sql: str) -> list[dict]:
        from google.cloud import bigquery

        client = self._client()
        timeout = getattr(self.settings, "google_api_timeout_seconds", 10)
        job_config = bigquery.QueryJobConfig(use_query_cache=True)
        job = client.query(sql, job_config=job_config, timeout=timeout)
        return [dict(row) for row in job.result(timeout=timeout)]

    def get_dashboard_metrics(self) -> dict[str, Any]:
        """Real BQ-backed dashboard metrics."""
        sql = f"""
        SELECT
          (SELECT COUNT(*) FROM `{self._dataset}.mentors`) AS mentor_count,
          (SELECT COUNT(*) FROM `{self._dataset}.companies`) AS company_count,
          (SELECT COUNT(*) FROM `{self._dataset}.events`) AS event_count,
          (SELECT COUNT(*) FROM `{self._dataset}.follow_ups`) AS followup_count,
          (SELECT COUNT(*) FROM `{self._dataset}.selections`) AS selection_count,
          (SELECT AVG(sentiment_score) FROM `{self._dataset}.follow_ups` WHERE sentiment_score IS NOT NULL) AS avg_sentiment
        """
        rows = self._query(sql)
        if rows:
            r = rows[0]
            return {
                "mentors": r.get("mentor_count", 0),
                "companies": r.get("company_count", 0),
                "events": r.get("event_count", 0),
                "follow_ups": r.get("followup_count", 0),
                "selections": r.get("selection_count", 0),
                "avg_sentiment": r.get("avg_sentiment"),
                "source": "bigquery",
            }
        return {"source": "bigquery", "error": "no data"}

    def get_outcome_trends(self) -> list[dict]:
        """Outcome trends over time."""
        sql = f"""
        SELECT
          FORMAT_DATE('%Y-%m', follow_up_date) AS month,
          outcome_label,
          COUNT(*) AS count,
          AVG(sentiment_score) AS avg_sentiment
        FROM `{self._dataset}.follow_ups`
        WHERE follow_up_date IS NOT NULL
        GROUP BY month, outcome_label
        ORDER BY month DESC
        LIMIT 50
        """
        return self._query(sql)

    def ml_predict_rerank(self, features: list[dict]) -> list[dict]:
        """Use BQML model to rerank match candidates."""
        if not features:
            return []

        # Build a temporary table of features and run ML.PREDICT
        import json

        features_json = json.dumps(features)
        sql = f"""
        SELECT *
        FROM ML.PREDICT(
          MODEL `{self._reranker_model}`,
          (
            SELECT *
            FROM UNNEST(JSON_EXTRACT_ARRAY('{features_json}'))
            WITH OFFSET AS pos
          )
        )
        ORDER BY predicted_score DESC
        """
        try:
            return self._query(sql)
        except Exception:
            return features  # fallback: return original order


class FakeBigQueryService:
    """Stub for tests / when BigQuery is not configured."""

    def get_dashboard_metrics(self) -> dict[str, Any]:
        return {
            "mentors": 0,
            "companies": 0,
            "events": 0,
            "follow_ups": 0,
            "selections": 0,
            "avg_sentiment": None,
            "source": "fallback",
        }

    def get_outcome_trends(self) -> list[dict]:
        return []

    def ml_predict_rerank(self, features: list[dict]) -> list[dict]:
        return features
