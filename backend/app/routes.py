from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models import (
    VertexSearchRequest,
    VertexSearchResponse,
    VertexEmbeddingsRequest,
    VertexEmbeddingsResponse,
    BigQueryGraphRequest,
    BigQueryGraphResponse,
)
from app.services.vertex_search import diagnose_search, search_documents
from app.services.vertex_embeddings import embed_texts
from app.services.bigquery_graph import run_graph_query

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@router.post("/vertex/search", response_model=VertexSearchResponse)
def vertex_search(payload: VertexSearchRequest) -> VertexSearchResponse:
    try:
        return search_documents(settings, payload)
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/vertex/search/diagnose")
def vertex_search_diagnose() -> dict:
    try:
        return diagnose_search(settings)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/vertex/embeddings", response_model=VertexEmbeddingsResponse)
def vertex_embeddings(payload: VertexEmbeddingsRequest) -> VertexEmbeddingsResponse:
    try:
        return embed_texts(settings, payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/bigquery/graph", response_model=BigQueryGraphResponse)
def bigquery_graph(payload: BigQueryGraphRequest) -> BigQueryGraphResponse:
    return run_graph_query(settings, payload)
