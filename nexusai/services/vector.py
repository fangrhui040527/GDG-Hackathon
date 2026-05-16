from dataclasses import dataclass
from typing import Any

from nexusai.config import Settings


@dataclass(frozen=True)
class VectorCandidate:
    entity_id: str
    score: float


class VertexEmbeddingService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def embed_text(self, text: str) -> list[float]:
        try:
            from vertexai import init
            from vertexai.language_models import TextEmbeddingModel
        except ImportError:
            return []

        init(project=self.settings.google_cloud_project, location=self.settings.google_cloud_location)
        model = TextEmbeddingModel.from_pretrained(self.settings.vertex_embedding_model)
        embeddings = model.get_embeddings([text])
        return list(embeddings[0].values)

    def batch_embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            from vertexai import init
            from vertexai.language_models import TextEmbeddingModel
        except ImportError:
            return [[] for _ in texts]

        init(project=self.settings.google_cloud_project, location=self.settings.google_cloud_location)
        model = TextEmbeddingModel.from_pretrained(self.settings.vertex_embedding_model)
        embeddings = model.get_embeddings(texts)
        return [list(e.values) for e in embeddings]


def build_embedding_text(entity_type: str, bio: str, industries: str = "", stages: str = "") -> str:
    return f"Role: {entity_type}\nBio: {bio}\nIndustries: {industries}\nStages: {stages}"


class VertexVectorSearchService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def find_neighbors(self, embedding: list[float], top_k: int = 20, entity_type_filter: str | None = None) -> list[VectorCandidate]:
        if not embedding:
            return []

        endpoint_id = getattr(self.settings, "vertex_vector_endpoint_id", None)
        deployed_index_id = getattr(self.settings, "vertex_vector_deployed_index_id", None)
        if not endpoint_id or not deployed_index_id:
            # Fall back to empty when no deployed index exists
            return []

        try:
            from google.cloud import aiplatform

            aiplatform.init(
                project=self.settings.google_cloud_project,
                location=self.settings.google_cloud_location,
            )
            endpoint = aiplatform.MatchingEngineIndexEndpoint(endpoint_id)

            restricts = []
            if entity_type_filter:
                restricts.append(
                    aiplatform.matching_engine.matching_engine_index_endpoint.Namespace(
                        name="entity_type",
                        allow_tokens=[entity_type_filter],
                    )
                )

            response = endpoint.find_neighbors(
                deployed_index_id=deployed_index_id,
                queries=[embedding],
                num_neighbors=top_k,
                filter=restricts if restricts else None,
            )

            candidates = []
            if response and response[0]:
                for neighbor in response[0]:
                    candidates.append(
                        VectorCandidate(
                            entity_id=neighbor.id,
                            score=1.0 - neighbor.distance if hasattr(neighbor, "distance") else 0.0,
                        )
                    )
            return candidates
        except Exception:
            return []
