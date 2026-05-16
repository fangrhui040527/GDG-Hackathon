import logging

from google.api_core import exceptions as gax_exceptions
from google.cloud import bigquery

from app.config import Settings
from app.models import (
    VectorSearchRequest,
    VectorSearchResponse,
    VectorSearchMatch,
    VertexEmbeddingsRequest,
)
from app.services.vertex_embeddings import embed_texts


_ALLOWED_DISTANCE_TYPES = {"COSINE"}


def _resolve_query_vector(settings: Settings, payload: VectorSearchRequest) -> list[float]:
    if payload.query_vector:
        return payload.query_vector
    if payload.query_text:
        embeddings = embed_texts(settings, VertexEmbeddingsRequest(texts=[payload.query_text]))
        if embeddings.embeddings and embeddings.embeddings[0]:
            return embeddings.embeddings[0]
    raise ValueError("query_text or query_vector is required")


def vector_search(settings: Settings, payload: VectorSearchRequest) -> VectorSearchResponse:
    distance_type = payload.distance_type.upper()
    if distance_type not in _ALLOWED_DISTANCE_TYPES:
        raise ValueError("distance_type must be COSINE")

    query_vector = _resolve_query_vector(settings, payload)

    table_ref = (
        f"`{settings.bigquery_project_id}.{settings.bigquery_dataset}."
        f"{settings.bigquery_vector_table}`"
    )

    query = f"""
        WITH query_vec AS (SELECT @query_vector AS qvec)
        SELECT
            doc_id,
            content,
            ANY_VALUE(metadata) AS metadata,
            1 - SAFE_DIVIDE(
                SUM(qv * dv),
                SQRT(SUM(qv * qv)) * SQRT(SUM(dv * dv))
            ) AS distance
        FROM {table_ref}, query_vec,
            UNNEST(query_vec.qvec) AS qv WITH OFFSET q_off
        JOIN UNNEST(embedding) AS dv WITH OFFSET d_off
            ON q_off = d_off
        GROUP BY doc_id, content
        ORDER BY distance ASC
        LIMIT @top_k
        """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ArrayQueryParameter("query_vector", "FLOAT64", query_vector),
            bigquery.ScalarQueryParameter("top_k", "INT64", payload.top_k),
        ]
    )

    client = bigquery.Client(
        project=settings.bigquery_project_id,
        location=settings.bigquery_location,
    )

    try:
        results = client.query(query, job_config=job_config).result()
    except gax_exceptions.GoogleAPICallError as exc:
        logging.exception("BigQuery vector search error")
        raise RuntimeError(f"BigQuery vector search error: {exc}") from exc

    matches: list[VectorSearchMatch] = []
    for row in results:
        matches.append(
            VectorSearchMatch(
                doc_id=row.get("doc_id"),
                content=row.get("content"),
                metadata=row.get("metadata"),
                distance=row.get("distance"),
            )
        )

    return VectorSearchResponse(matches=matches)
