from dataclasses import dataclass

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


class VertexVectorSearchService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def find_neighbors(self, embedding: list[float], top_k: int = 20) -> list[VectorCandidate]:
        if not embedding:
            return []
        # The concrete MatchingEngineIndexEndpoint call depends on the deployed endpoint and index IDs.
        # Keep this boundary narrow so deployment-specific details stay out of matching logic.
        return []
