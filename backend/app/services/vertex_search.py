import logging

from google.api_core import exceptions as gax_exceptions
from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine_v1
from google.protobuf.json_format import MessageToDict
from google.cloud import discoveryengine_v1beta

from app.config import Settings
from app.models import VertexSearchRequest, VertexSearchResponse, VertexSearchResult


def _resolve_endpoint(location: str) -> str | None:
    if location and location != "global":
        return f"{location}-discoveryengine.googleapis.com"
    return None


def diagnose_search(settings: Settings) -> dict:
    endpoint = _resolve_endpoint(settings.gcp_location)
    client_options = ClientOptions(api_endpoint=endpoint) if endpoint else None
    if hasattr(discoveryengine_v1, "ServingConfigServiceClient"):
        serving_config_client = discoveryengine_v1.ServingConfigServiceClient(
            client_options=client_options
        )
    elif hasattr(discoveryengine_v1beta, "ServingConfigServiceClient"):
        serving_config_client = discoveryengine_v1beta.ServingConfigServiceClient(
            client_options=client_options
        )
    else:
        raise RuntimeError(
            "ServingConfigServiceClient not available in installed discoveryengine SDK"
        )

    serving_config = (
        f"projects/{settings.gcp_project_id}/locations/{settings.gcp_location}"
        f"/collections/default_collection/dataStores/{settings.vertex_search_data_store_id}"
        f"/servingConfigs/{settings.vertex_search_serving_config_id}"
    )

    try:
        config = serving_config_client.get_serving_config(
            name=serving_config,
            timeout=20,
        )
    except gax_exceptions.GoogleAPICallError as exc:
        logging.exception("Vertex Search diagnose error")
        raise RuntimeError("Vertex Search diagnose error") from exc

    return {
        "serving_config": config.name,
        "display_name": config.display_name,
        "solution_type": str(config.solution_type),
        "engine_config": config.engine_config,
    }


def search_documents(settings: Settings, payload: VertexSearchRequest) -> VertexSearchResponse:
    endpoint = _resolve_endpoint(settings.gcp_location)
    client_options = ClientOptions(api_endpoint=endpoint) if endpoint else None
    client = discoveryengine_v1.SearchServiceClient(client_options=client_options)
    serving_config = (
        f"projects/{settings.gcp_project_id}/locations/{settings.gcp_location}"
        f"/collections/default_collection/dataStores/{settings.vertex_search_data_store_id}"
        f"/servingConfigs/{settings.vertex_search_serving_config_id}"
    )

    request = discoveryengine_v1.SearchRequest(
        serving_config=serving_config,
        query=payload.query,
        page_size=payload.page_size,
    )

    if payload.filter:
        request.filter = payload.filter
    if payload.order_by:
        request.order_by = payload.order_by

    try:
        response = client.search(request=request, timeout=30)
    except gax_exceptions.DeadlineExceeded as exc:
        logging.exception("Vertex Search timed out")
        raise TimeoutError("Vertex Search request timed out") from exc
    except gax_exceptions.GoogleAPICallError as exc:
        logging.exception("Vertex Search API error")
        raise RuntimeError("Vertex Search API error") from exc

    results: list[VertexSearchResult] = []
    for result in response.results:
        document = result.document
        snippet = getattr(result, "document_snippet", None)
        document_dict = MessageToDict(document._pb) if document else None
        results.append(
            VertexSearchResult(
                id=document.id if document else None,
                title=getattr(document, "title", None) if document else None,
                snippet=snippet,
                document=document_dict,
            )
        )

    return VertexSearchResponse(results=results)
