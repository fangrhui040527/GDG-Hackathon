from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gcp_project_id: str = "yokoyoko"
    gcp_location: str = "global"

    vertex_search_data_store_id: str = "ai-search_1778914536000"
    vertex_search_serving_config_id: str = "default_serving_config"

    vertex_embeddings_model: str = "text-embedding-004"
    vertex_embeddings_location: str = "us-central1"

    bigquery_project_id: str = "yokoyoko"
    bigquery_location: str = "global"

    class Config:
        env_prefix = "APP_"


settings = Settings()
