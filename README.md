# NexusAI MVP

NexusAI is a Vertex AI + MCP ecosystem matching MVP for hackathon demos.

This implementation follows the design document with the requested changes:

- Vertex AI is the AI runtime for Gemini, profile cleanup, rationale generation, and embeddings.
- Cloud SQL PostgreSQL replaces Firestore for operational data and agent checkpoints.
- MCP architecture is kept for BigQuery, Spanner Graph, Document AI, and Chirp STT.
- Firestore MCP, Gmail MCP, Drive MCP, and Calendar MCP are not registered.
- Document AI is used through the allowed MCP boundary for mentor CV parsing.
- Cloud Translation is a direct Google Cloud service boundary.

## Project Shape

```text
nexusai/                 FastAPI backend package
  api.py                 REST API and demo workflow
  config.py              Vertex, PostgreSQL, and MCP settings
  database.py            SQLAlchemy models for PostgreSQL
  matching.py            Deterministic base scorer
  mcp/registry.py        Allowed MCP tool registry
  services/              Vertex AI, MCP, vector, translation boundaries
app/                     Next.js app router frontend
components/              Admin dashboard UI
lib/api.ts               Frontend API client
scripts/init_db.py       Create PostgreSQL tables
scripts/seed_demo.py     Seed demo mentor/company/event
tests/                   Backend contract tests
```

## Environment

Copy `.env.example` to `.env` and fill these values:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
APP_ENV=development
DATABASE_CONNECTOR_MODE=direct
GOOGLE_API_TIMEOUT_SECONDS=10

GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=asia-southeast1
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json

VERTEX_GEMINI_MODEL=gemini-2.5-flash
VERTEX_REASONING_MODEL=gemini-2.5-pro
VERTEX_EMBEDDING_MODEL=text-embedding-005
VERTEX_VECTOR_INDEX_ENDPOINT_ID=your_index_endpoint_id

DOCUMENT_AI_PROCESSOR_ID=your_processor_id

ENABLE_BIGQUERY_MCP=true
ENABLE_SPANNER_GRAPH_MCP=true
ENABLE_DOCUMENT_AI_MCP=true
ENABLE_CHIRP_STT_MCP=true

ENABLE_FIRESTORE_MCP=false
ENABLE_GMAIL_MCP=false
ENABLE_DRIVE_MCP=false
ENABLE_CALENDAR_MCP=false

NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run Backend

```bash
python scripts/init_db.py
python scripts/seed_demo.py
uvicorn nexusai.main:app --reload --port 8000
```

Useful endpoints:

- `GET /health`
- `POST /profiles/mentors`
- `POST /profiles/companies`
- `POST /mentors/{mentor_id}/cv`
- `POST /matches/recommend`
- `POST /selections`
- `POST /selections/{selection_id}/approve`
- `POST /followups`
- `GET /analytics/dashboard`

## Run Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
python -m pytest -q
```

The test suite verifies:

- PostgreSQL config rejects non-PostgreSQL URLs.
- Only allowed MCP tools are registered.
- Firestore/Gmail/Drive/Calendar MCP tools are excluded.
- Matching ranks mentors deterministically.
- The API demo flow creates profiles, recommends matches, approves a selection, records follow-up, and updates metrics.
