from nexusai.config import Settings
from nexusai.mcp.registry import build_mcp_registry


def make_settings() -> Settings:
    return Settings(
        database_url="postgresql+psycopg://user:pass@host:5432/nexus",
        google_cloud_project="demo-project",
        google_cloud_location="asia-southeast1",
        vertex_gemini_model="gemini-2.5-flash",
        vertex_reasoning_model="gemini-2.5-pro",
        vertex_embedding_model="text-embedding-005",
        vertex_vector_index_endpoint_id="index-endpoint",
        document_ai_processor_id="processor",
    )


def test_registry_registers_allowed_mcp_tools_only():
    registry = build_mcp_registry(make_settings())

    assert set(registry.tool_names()) == {
        "bigquery_query",
        "spanner_graph_query",
        "document_ai_parse",
        "chirp_transcribe",
    }
    assert not registry.has_tool("firestore_upsert")
    assert not registry.has_tool("gmail_send")
    assert not registry.has_tool("drive_attach")
    assert not registry.has_tool("calendar_create")


def test_registry_returns_disabled_result_when_tool_flag_is_off():
    settings = make_settings()
    settings.enable_chirp_stt_mcp = False
    registry = build_mcp_registry(settings)

    assert "chirp_transcribe" not in registry.tool_names()
