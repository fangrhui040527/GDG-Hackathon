# YokoYoko AI

> Vertex AI + MCP ecosystem matching MVP for hackathon demos.

## Architecture

| Layer | Technology |
|-------|-----------|
| AI runtime | Vertex AI (Gemini 2.5 Flash/Pro, text-embedding-005) |
| Operational DB | Cloud SQL – PostgreSQL (via SQLAlchemy async + psycopg 3) |
| Agent checkpoints | `agent_checkpoints` table (PostgreSQL) |
| MCP – analytics | BigQuery MCP |
| MCP – graph | Spanner Graph MCP |
| MCP – CV parsing | Document AI MCP |
| MCP – voice | Chirp STT MCP |
| Translation | Cloud Translation API (direct) |
| Frontend | Next.js 14 (App Router) |

**Disabled MCP servers:** Firestore, Gmail, Drive, Calendar  
(enforced at runtime via `MCPRegistry` – attempting to register these raises `ValueError`)

## Project Structure

```
yokoyoko/               FastAPI backend package
  main.py               FastAPI app + startup
  api.py                REST routes and demo workflow
  config.py             Pydantic-settings (Vertex, PostgreSQL, MCP flags)
  database.py           SQLAlchemy async models
  matching.py           Deterministic base scorer (tag overlap + cosine)
  mcp/registry.py       Allowed MCP tool registry with allowlist enforcement
  services/
    vertex.py           Gemini + embedding + vector search boundary
    translation.py      Cloud Translation boundary
app/                    Next.js frontend
  app/                  App Router pages
  components/           Admin dashboard UI
  lib/api.ts            Typed API client
scripts/
  init_db.py            Create PostgreSQL tables
  seed_demo.py          Seed demo mentor + company
tests/
  test_yokoyoko.py      Contract + integration tests
```

## Quickstart

```bash
# 1. Install backend
pip install -e ".[dev]"

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, GOOGLE_CLOUD_PROJECT, GOOGLE_APPLICATION_CREDENTIALS, etc.

# 3. Init DB and seed demo data
python scripts/init_db.py
python scripts/seed_demo.py

# 4. Run backend
uvicorn yokoyoko.main:app --reload --port 8000

# 5. Run frontend (separate terminal)
cd app && npm install && npm run dev
# → http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| POST | `/profiles/mentors` | Create mentor profile |
| POST | `/profiles/companies` | Create company profile |
| POST | `/mentors/{id}/cv` | Upload and parse mentor CV |
| POST | `/matches/recommend` | Recommend ranked mentors for a company |
| POST | `/selections` | Record a mentor selection |
| POST | `/selections/{id}/approve` | Approve a selection |
| POST | `/followups` | Record a follow-up action |
| GET | `/analytics/dashboard` | Aggregated metrics |

## Tests

```bash
python -m pytest -q
```

Verifies:
- PostgreSQL URL validation (non-PostgreSQL URLs rejected)
- MCP allowlist (Firestore/Gmail/Drive/Calendar raise `ValueError`)
- Matching determinism and `top_k` behaviour
- End-to-end demo flow (skipped if `DATABASE_URL` not in environment)
