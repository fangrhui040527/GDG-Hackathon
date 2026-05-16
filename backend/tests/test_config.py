import pytest

from nexusai.config import Settings


def test_settings_require_postgres_database_url():
    with pytest.raises(ValueError, match="DATABASE_URL"):
        Settings(
            database_url="sqlite:///local.db",
            google_cloud_project="demo-project",
            google_cloud_location="asia-southeast1",
            vertex_gemini_model="gemini-2.5-flash",
            vertex_reasoning_model="gemini-2.5-pro",
            vertex_embedding_model="text-embedding-005",
            vertex_vector_index_endpoint_id="index-endpoint",
            document_ai_processor_id="processor",
        )


def test_settings_keep_only_allowed_mcp_enabled():
    settings = Settings(
        database_url="postgresql+psycopg://user:pass@host:5432/nexus",
        google_cloud_project="demo-project",
        google_cloud_location="asia-southeast1",
        vertex_gemini_model="gemini-2.5-flash",
        vertex_reasoning_model="gemini-2.5-pro",
        vertex_embedding_model="text-embedding-005",
        vertex_vector_index_endpoint_id="index-endpoint",
        document_ai_processor_id="processor",
        enable_bigquery_mcp=True,
        enable_spanner_graph_mcp=True,
        enable_document_ai_mcp=True,
        enable_chirp_stt_mcp=True,
        enable_firestore_mcp=True,
        enable_gmail_mcp=True,
        enable_drive_mcp=True,
        enable_calendar_mcp=True,
    )

    assert settings.enabled_mcp_tools == {
        "bigquery_query",
        "spanner_graph_query",
        "document_ai_parse",
        "chirp_transcribe",
    }
    assert settings.disabled_mcp_tools == {
        "firestore_mcp",
        "gmail_mcp",
        "drive_mcp",
        "calendar_mcp",
    }
