from functools import lru_cache

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
    cloud_sql_connection_name: str | None = Field(default=None, alias="CLOUD_SQL_CONNECTION_NAME")
    database_name: str | None = Field(default=None, alias="DATABASE_NAME")
    database_user: str | None = Field(default=None, alias="DATABASE_USER")
    database_password: str | None = Field(default=None, alias="DATABASE_PASSWORD")
    database_host: str | None = Field(default=None, alias="DATABASE_HOST")
    database_port: int = Field(default=5432, alias="DATABASE_PORT")
    database_connector_mode: str = Field(default="direct", alias="DATABASE_CONNECTOR_MODE")
    db_connect_timeout_seconds: int = Field(default=10, alias="DB_CONNECT_TIMEOUT_SECONDS")
    db_pool_size: int = Field(default=5, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=10, alias="DB_MAX_OVERFLOW")
    db_pool_timeout_seconds: int = Field(default=10, alias="DB_POOL_TIMEOUT_SECONDS")
    google_cloud_project: str = Field(alias="GOOGLE_CLOUD_PROJECT")
    google_cloud_location: str = Field(default="asia-southeast1", alias="GOOGLE_CLOUD_LOCATION")
    google_application_credentials: str | None = Field(default=None, alias="GOOGLE_APPLICATION_CREDENTIALS")
    google_api_timeout_seconds: int = Field(default=10, alias="GOOGLE_API_TIMEOUT_SECONDS")

    vertex_gemini_model: str = Field(default="gemini-2.5-flash", alias="VERTEX_GEMINI_MODEL")
    vertex_reasoning_model: str = Field(default="gemini-2.5-pro", alias="VERTEX_REASONING_MODEL")
    vertex_embedding_model: str = Field(default="text-embedding-005", alias="VERTEX_EMBEDDING_MODEL")
    vertex_vector_index_endpoint_id: str | None = Field(default=None, alias="VERTEX_VECTOR_INDEX_ENDPOINT_ID")

    document_ai_processor_id: str | None = Field(default=None, alias="DOCUMENT_AI_PROCESSOR_ID")

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

    # Auth
    google_oauth_client_id: str | None = Field(default=None, alias="GOOGLE_OAUTH_CLIENT_ID")
    google_oauth_client_secret: str | None = Field(default=None, alias="GOOGLE_OAUTH_CLIENT_SECRET")
    session_jwt_secret: str = Field(default="dev-secret-change-me", alias="SESSION_JWT_SECRET")
    session_jwt_ttl_hours: int = Field(default=168, alias="SESSION_JWT_TTL_HOURS")
    setup_token: str | None = Field(default=None, alias="SETUP_TOKEN")

    # Vector Search
    vertex_vector_endpoint_id: str | None = Field(default=None, alias="VERTEX_VECTOR_ENDPOINT_ID")
    vertex_vector_deployed_index_id: str | None = Field(default=None, alias="VERTEX_VECTOR_DEPLOYED_INDEX_ID")

    # Spanner Graph
    spanner_instance_id: str | None = Field(default=None, alias="SPANNER_INSTANCE_ID")
    spanner_database_id: str | None = Field(default=None, alias="SPANNER_DATABASE_ID")
    spanner_graph_name: str = Field(default="EcosystemGraph", alias="SPANNER_GRAPH_NAME")

    # BigQuery
    bigquery_dataset: str = Field(default="nexusai_dw", alias="BIGQUERY_DATASET")
    bigquery_reranker_model: str = Field(default="nexusai_dw.match_reranker", alias="BIGQUERY_RERANKER_MODEL")
    bigquery_location: str = Field(default="us-central1", alias="BIGQUERY_LOCATION")

    # Email
    email_provider: str = Field(default="smtp", alias="EMAIL_PROVIDER")
    smtp_host: str = Field(default="smtp.gmail.com", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str | None = Field(default=None, alias="SMTP_USER")
    smtp_password: str | None = Field(default=None, alias="SMTP_PASSWORD")
    smtp_from_name: str = Field(default="NexusAI", alias="SMTP_FROM_NAME")
    smtp_from_email: str | None = Field(default=None, alias="SMTP_FROM_EMAIL")
    email_outbox_dry_run: bool = Field(default=True, alias="EMAIL_OUTBOX_DRY_RUN")

    next_public_api_url: str = Field(default="http://localhost:8000", alias="NEXT_PUBLIC_API_URL")

    @field_validator("database_url")
    @classmethod
    def require_cloud_postgres_url(cls, value: str) -> str:
        if not value.startswith(("postgresql://", "postgresql+")):
            raise ValueError("DATABASE_URL must point to Cloud PostgreSQL/PostgreSQL")
        return value

    @field_validator("database_connector_mode")
    @classmethod
    def require_known_database_connector_mode(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"direct", "cloud_sql_connector"}:
            raise ValueError("DATABASE_CONNECTOR_MODE must be 'direct' or 'cloud_sql_connector'")
        return normalized

    @property
    def enabled_mcp_tools(self) -> set[str]:
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
    def disabled_mcp_tools(self) -> set[str]:
        return {
            "firestore_mcp",
            "gmail_mcp",
            "drive_mcp",
            "calendar_mcp",
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
