# Test-2 Backend (FastAPI)

This backend exposes endpoints for:
- Vertex AI Search
- Vertex AI Embeddings
- BigQuery Graph queries

## Setup

Create or update your env vars (placeholders in code):
- APP_GCP_PROJECT_ID
- APP_GCP_LOCATION
- APP_VERTEX_SEARCH_DATA_STORE_ID
- APP_VERTEX_SEARCH_SERVING_CONFIG_ID
- APP_VERTEX_EMBEDDINGS_MODEL
- APP_BIGQUERY_PROJECT_ID
- APP_BIGQUERY_LOCATION

Make sure your Google credentials are available (for example with `GOOGLE_APPLICATION_CREDENTIALS`).

## Install

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- GET /health
- POST /vertex/search
- POST /vertex/embeddings
- POST /bigquery/graph
