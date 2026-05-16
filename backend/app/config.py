from pathlib import Path

from pydantic_settings import BaseSettings


ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    gcp_project_id: str
    gcp_location: str

    vertex_search_data_store_id: str
    vertex_search_serving_config_id: str

    vertex_embeddings_model: str
    vertex_embeddings_location: str

    bigquery_project_id: str
    bigquery_location: str
    bigquery_dataset_id: str 
    bigquery_vector_table: str 
    bigquery_vector_index: str 

    class Config:
        env_prefix = "APP_"
        env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
