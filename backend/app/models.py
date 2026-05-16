from pydantic import BaseModel, Field


class VertexSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    page_size: int = Field(10, ge=1, le=100)
    filter: str | None = None
    order_by: str | None = None


class VertexSearchResult(BaseModel):
    id: str | None = None
    title: str | None = None
    snippet: str | None = None
    document: dict | None = None


class VertexSearchResponse(BaseModel):
    results: list[VertexSearchResult]


class VertexEmbeddingsRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1)


class VertexEmbeddingsResponse(BaseModel):
    embeddings: list[list[float]]


class BigQueryGraphRequest(BaseModel):
    sql: str = Field(..., min_length=1)
    max_rows: int = Field(100, ge=1, le=1000)


class BigQueryGraphResponse(BaseModel):
    rows: list[dict]


class VectorSearchRequest(BaseModel):
    query_text: str | None = None
    query_vector: list[float] | None = None
    top_k: int = Field(10, ge=1, le=100)
    distance_type: str = "COSINE"


class VectorSearchMatch(BaseModel):
    doc_id: str | None = None
    content: str | None = None
    metadata: dict | None = None
    distance: float | None = None


class VectorSearchResponse(BaseModel):
    matches: list[VectorSearchMatch]
