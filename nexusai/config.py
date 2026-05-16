from functools import lru_cache
from typing import Set

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    database_url: str = Field(alias="DATABASE_URL")
    google_cloud_project: str = Field(alias="GOOGLE_CLOUD_PROJECT")
    google_cloud_location: str = Field(default="asia-southeast1", alias="GOOGLE_CLOUD_LOCATION")
    google_application_credentials: str | None = Field(default=None, alias="GOOGLE_APPLICATION_CREDENTIALS")

    vertex_gemini_model: str = Field(default="gemini-2.5-flash", alias="VERTEX_GEMINI_MODEL")
    vertex_reasoning_model: str = Field(default="gemini-2.5-pro", alias="VERTEX_REASONING_MODEL")
    vertex_embedding_model: str = Field(default="text-embedding-005", alias="VERTEX_EMBEDDING_MODEL")
    vertex_vector_index_endpoint_id: str = Field(alias="VERTEX_VECTOR_INDEX_ENDPOINT_ID")

    document_ai_processor_id: str = Field(alias="DOCUMENT_AI_PROCESSOR_ID")

    enable_bigquery_mcp: bool = Field(default=True, alias="ENABLE_BIGQUERY_MCP")
    enable_spanner_graph_mcp: bool = Field(default=True, alias="ENABLE_SPANNER_GRAPH_MCP")
    enable_document_ai_mcp: bool = Field(default=True, alias="ENABLE_DOCUMENT_AI_MCP")
    enable_chirp_stt_mcp: bool = Field(default=True, alias="ENABLE_CHIRP_STT_MCP")

    enable_firestore_mcp: bool = Field(default=False, alias="ENABLE_FIRESTORE_MCP")
    enable_gmail_mcp: bool = Field(default=False, alias="ENABLE_GMAIL_MCP")
    enable_drive_mcp: bool = Field(default=False, alias="ENABLE_DRIVE_MCP")
    enable_calendar_mcp: bool = Field(default=False, alias="ENABLE_CALENDAR_MCP")

    enable_cloud_translation: bool = Field(default=True, alias="ENABLE_CLOUD_TRANSLATION")
    cloud_translation_target_language: str = Field(default="en", alias="CLOUD_TRANSLATION_TARGET_LANGUAGE")

    next_public_api_url: str = Field(default="http://localhost:8000", alias="NEXT_PUBLIC_API_URL")

    @field_validator("database_url")
    @classmethod
    def require_cloud_postgres_url(cls, value: str) -> str:
        if not value.startswith(("postgresql://", "postgresql+")):
            raise ValueError("DATABASE_URL must point to Cloud PostgreSQL/PostgreSQL")
        return value

    @property
    def enabled_mcp_tools(self) -> Set[str]:
        tools: set[str] = set()
        if self.enable_bigquery_mcp:
            tools.add("bigquery_query")
        if self.enable_spanner_graph_mcp:
            tools.add("spanner_graph_query")
        if self.enable_document_ai_mcp:
            tools.add("document_ai_parse")
        if self.enable_chirp_stt_mcp:
            tools.add("chirp_transcribe")
        return tools

    @property
    def disabled_mcp_tools(self) -> Set[str]:
        return {
            "firestore_mcp",
            "gmail_mcp",
            "drive_mcp",
            "calendar_mcp",
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
