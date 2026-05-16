import logging

from google.api_core import exceptions as gax_exceptions
from google.cloud import aiplatform_v1
from google.protobuf.json_format import MessageToDict
from google.api_core.client_options import ClientOptions

from app.config import Settings
from app.models import VertexEmbeddingsRequest, VertexEmbeddingsResponse


def embed_texts(settings: Settings, payload: VertexEmbeddingsRequest) -> VertexEmbeddingsResponse:
    endpoint = f"{settings.vertex_embeddings_location}-aiplatform.googleapis.com"
    client = aiplatform_v1.PredictionServiceClient(
        client_options=ClientOptions(api_endpoint=endpoint)
    )

    model_path = (
        f"projects/{settings.gcp_project_id}/locations/{settings.vertex_embeddings_location}"
        f"/publishers/google/models/{settings.vertex_embeddings_model}"
    )

    instances = [{"content": text} for text in payload.texts]

    try:
        response = client.predict(endpoint=model_path, instances=instances, timeout=30)
    except gax_exceptions.NotFound as exc:
        logging.exception("Vertex Embeddings model not found")
        raise RuntimeError("Vertex Embeddings model not found or wrong location") from exc
    except gax_exceptions.GoogleAPICallError as exc:
        logging.exception("Vertex Embeddings API error")
        raise RuntimeError("Vertex Embeddings API error") from exc

    embeddings: list[list[float]] = []
    for prediction in response.predictions:
        if isinstance(prediction, dict):
            pred_dict = prediction
        elif hasattr(prediction, "_pb") and hasattr(prediction._pb, "DESCRIPTOR"):
            pred_dict = MessageToDict(prediction._pb)
        else:
            pred_dict = dict(prediction)

        values = pred_dict.get("embeddings", {}).get("values")
        if values is None:
            values = pred_dict.get("values")
        embeddings.append(list(values) if values is not None else [])

    return VertexEmbeddingsResponse(embeddings=embeddings)
