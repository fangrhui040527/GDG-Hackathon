# NexusAI Debug Report

Repo: GDG-Hackathon | Date: 2026-05-17 | Engineer: AI debug pass

## 1. Project Map

3 subsystems + duplicated backend:

- `backend/app/` — FastAPI, in-mem stores, mock/demo
- `backend/nexusai/` — FastAPI, SQLAlchemy/Postgres, JWT, LangGraph agents (intended prod)
- `frontend/` — Next.js 15 / React 19 / TS
- `web_backend/` — Express/TS auth svc (parallel impl)

Two backends coexist → data drift, ambiguous source of truth.

---

## 2. Bugs by Severity

### CRITICAL (P0 — production blockers / sec)

#### B-1. Missing modules → ImportError on startup
**File:** `backend/nexusai/api.py:33-35,1137,1161,1172`
**Cause:** `nexusai/mcp/` & `nexusai/services/` dirs exist but EMPTY. Imports fail:
```
from nexusai.mcp.registry import build_mcp_registry
from nexusai.services.ai import AIService, VertexAIService
from nexusai.services.mcp import MCPClient
from nexusai.services.graph import FakeGraphService, GraphService
from nexusai.services.bigquery import BigQueryService, FakeBigQueryService
```
**Impact:** `uvicorn nexusai.main:app` crashes immediately. Whole prod backend dead.
**Fix:**
1. Restore from git: `git log --diff-filter=D --summary -- nexusai/mcp/ nexusai/services/`
2. Or create stubs:
   ```python
   # nexusai/services/__init__.py
   class AIService: ...
   class VertexAIService(AIService): ...
   class MCPClient: ...
   ```
3. CI smoke test: `python -c "from nexusai.api import create_app; create_app()"`

#### B-2. Privilege escalation — unauth role update
**File:** `backend/nexusai/api.py:439-452`
```python
@app.patch("/users/{user_id}/role")
def update_user_role(user_id: int, payload: dict[str, str], db: Db):
```
**Cause:** No auth dep. Anonymous caller → promote anyone to SUPER_ADMIN.
**Repro:** `curl -X PATCH /users/1/role -d '{"role":"SUPER_ADMIN"}'`
**Fix:**
```python
def update_user_role(
    user_id: int, payload: dict[str, str], db: Db,
    actor: dict = Depends(require_roles("SUPER_ADMIN")),
):
```

#### B-3. Auth bypass via `/auth/demo-login`
**File:** `backend/nexusai/api.py:454-480`
**Cause:** Any email + role=admin → SUPER_ADMIN user obj created. No password, no token verification.
**Fix:** Gate behind dev env:
```python
if get_settings().environment != "development":
    raise HTTPException(403, "demo-login disabled")
```

#### B-4. Default JWT secret in 2 places
**Files:** `backend/nexusai/config.py:50`, `backend/nexusai/api.py:312,316`
```python
session_jwt_secret: str = Field(default="dev-secret-change-me", ...)
app.state.jwt_secret = "dev-secret-change-me"   # silent fallback
```
**Cause:** Boots fine with default → attacker forges valid JWTs.
**Fix:**
```python
if not _jwt or _jwt == "dev-secret-change-me":
    if get_settings().environment == "production":
        raise RuntimeError("SESSION_JWT_SECRET required")
```

#### B-5. Stack trace leaked to client
**File:** `backend/nexusai/api.py:647-654`
```python
except Exception as exc:
    raise HTTPException(status_code=500, detail=_tb.format_exc()) from exc
```
**Cause:** Traceback (paths, var names, library versions) → response body. Recon vector.
**Fix:**
```python
except Exception:
    logging.getLogger("nexusai").exception("match_programme failed")
    raise HTTPException(500, "Internal error") from None
```

#### B-6. `bootstrap-admin` not single-use
**File:** `backend/nexusai/api.py:418-437`
**Cause:** `SETUP_TOKEN` allows repeated SUPER_ADMIN promotion. Leaked or persisted → backdoor.
**Fix:** DB flag `bootstrap_used_at`. Reject 2nd call. Auto-clear env post-success.

---

### HIGH (P1 — crashes / data integrity)

#### B-7. StopIteration in matching_agent
**File:** `backend/nexusai/agents/nodes/matching_agent.py:69`
```python
mentor_profile = next(m for m in mentors if m.id == rec.entity_id)
```
**Cause:** No default → `StopIteration` if mismatch. FastAPI → 500.
**Fix:**
```python
mentor_profile = next((m for m in mentors if m.id == rec.entity_id), None)
if not mentor_profile:
    continue
```

#### B-8. Naive vs aware datetime mismatch
**Files:** `api.py:378,403,472,1033,1077`
```python
user.last_login_at = datetime.now()      # naive
```
vs `database.py:28` `utcnow()` tz-aware. Mixed writes → `TypeError` on comparison.
**Fix:** Replace all `datetime.now()` w/ `utcnow()`. Cols → `DateTime(timezone=True)`.

#### B-9. Brittle ID extractor
**File:** `backend/nexusai/agents/nodes/matching_agent.py:148-152`
**Cause:** `re.findall(r"\b(\d+)\b", message)` picks first int. "top 5 matches company 7" → company_id=5.
**Fix:**
```python
m = re.search(r"company[_\s#]*(\d+)", message, re.I)
e = re.search(r"event[_\s#]*(\d+)", message, re.I)
return {"company_id": int(m.group(1)) if m else None,
        "event_id":   int(e.group(1)) if e else None}
```

#### B-10. In-mem stores in `backend/app/`
**File:** `backend/app/routes.py:47-110`
**Cause:** `_programmes`/`_actors`/`_submissions`/`_shortlists` = module dicts. Lost on restart. Not thread-safe. `/programmes/{id}/match` uses `random.sample` → non-reproducible.
**Impact:** Two backends on same port → silent data divergence.
**Fix:** Pick one backend. Delete `backend/app/` OR mount under `/mock`.

#### B-11. Requirements missing critical deps
**File:** `backend/requirements.txt`
**Has only:** fastapi, uvicorn, pydantic-settings, gcp-aiplatform, gcp-bigquery, gcp-discoveryengine.
**Missing:** `sqlalchemy`, `psycopg[binary]`, `pg8000`, `pyjwt`, `google-auth`, `cloud-sql-python-connector`, `python-multipart`, `langgraph`, `langchain-core`.
**Fix:** `pip-compile pyproject.toml -o requirements.txt`

#### B-12. Revoked-token blacklist non-persistent
**File:** `web_backend/src/services/auth.service.ts:6`
```ts
const revokedTokens = new Set<string>();
```
**Cause:** In-mem only. Restart → revoked valid again. Horizontal scale → per-instance sets.
**Fix:** Redis:
```ts
await redis.setex(`revoked:${jti}`, ttlSeconds, "1");
```
Include `jti` claim (currently absent).

---

### MEDIUM (P2 — correctness / perf)

#### B-13. `expiresIn` env ignored
**File:** `web_backend/src/services/auth.service.ts:9,41,65`
```ts
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "5h";  // read
expiresIn: "5h",   // hardcoded
```
**Fix:** Use `jwtExpiresIn` in both `login` & `register`.

#### B-14. JWT lacks roles → N+1 RBAC
**File:** `web_backend/src/services/auth.service.ts:36,61`
**Cause:** Payload = `{ email }` only. Every authorized req → `getUserRoles(userId)` DB hit.
**Fix:** Embed roles in JWT (short TTL).

#### B-15. Deprecated `on_event` startup
**File:** `backend/app/main.py:30`
**Fix:** Lifespan ctx mgr.

#### B-16. CORS credentials + wildcards
**Files:** `backend/nexusai/api.py:298-304`, `backend/app/main.py:19-25`
**Cause:** `allow_credentials=True` + `allow_methods=["*"]` + `allow_headers=["*"]` → browsers reject per spec.
**Fix:** Enumerate methods & headers.

#### B-17. Dashboard metrics randomized
**File:** `backend/app/routes.py:347-358`
```python
followups=random.randint(5, 20),
selections=random.randint(10, 50),
```
**Cause:** Per-req random → metrics fluctuate.
**Fix:** Compute from `_submissions` or delete endpoint.

#### B-18. `GEMINI_API_KEY` baked at import
**File:** `frontend/src/app/api/chat/route.ts:3-4`
```ts
const GEMINI_URL = `...?key=${GEMINI_API_KEY}`;
```
**Cause:** Missing env → `key=undefined` in URL. Silent 400.
**Fix:**
```ts
if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY required");
```
Build URL inside handler.

#### B-19. Gemini role validation missing
**File:** `frontend/src/app/api/chat/route.ts:15-18`
**Cause:** First msg role=model → Gemini rejects.
**Fix:**
```ts
if (contents[0]?.role !== "user") contents.unshift({role:"user", parts:[{text:""}]});
```

#### B-20. `get_db` commits every req
**File:** `backend/nexusai/api.py:326-336`
**Cause:** `session.commit()` on GET → wasted IO + accidental writes flushed.
**Fix:**
```python
yield session
if session.new or session.dirty or session.deleted:
    session.commit()
```

---

### LOW (P3 — hygiene)

- **B-21.** `.env` files possibly in VCS — verify `.gitignore`.
- **B-22.** `cloud-sql-proxy.exe` Windows binary committed.
- **B-23.** Enums w/ single value defeat purpose.
- **B-24.** `Selection.approved_by = "admin"` hardcoded (`api.py:1032`).
- **B-25.** Notification created only for `MENTOR` entity_type — inconsistent.
- **B-26.** Tab/space mix in `backend/app/main.py`.
- **B-27.** Bare `except Exception:` swallowing errors at `api.py:1111,1167,1178`.

---

## 3. Architectural Smell

- **Duplicated backends.** `backend/app/` (mock) + `backend/nexusai/` (real) expose overlapping endpoints. Port 8000 collision → whichever runs wins.
- **`web_backend/`** = 3rd auth surface. Consolidate or define boundary.
- **No migrations.** `Base.metadata.create_all()` on startup → drift. Add Alembic.

---

## 4. Repair Plan — Prioritized

### Phase 1 — Stop the bleeding (2-4 h)
1. Restore `nexusai/mcp/` & `nexusai/services/` files (B-1).
2. Add auth dep to `/users/{user_id}/role` (B-2).
3. Disable `/auth/demo-login` outside dev (B-3).
4. Reject default JWT secret in prod (B-4).
5. Strip tracebacks from 500 responses (B-5).
6. Fix `requirements.txt` (B-11).

### Phase 2 — Stabilize (1 day)
7. Fix StopIteration (B-7).
8. `utcnow()` everywhere (B-8).
9. Pick ONE backend (B-10).
10. Persist token blacklist (B-12).
11. Single-use `setup_token` (B-6).
12. Better ID-extraction regex (B-9).

### Phase 3 — Hardening (2-3 days)
13. CORS tightening (B-16).
14. Embed roles in JWT (B-14).
15. Lifespan migration (B-15).
16. Real dashboard metrics (B-17).
17. Gemini validation (B-18, B-19).
18. Conditional commit (B-20).
19. Alembic migrations.
20. CI: lint + smoke import + pytest.

### Phase 4 — Cleanup (ongoing)
- `.env` audit, remove binary, drop dead enums, code style, expand Notification, log not swallow.

---

## 5. Edge Cases to Test

- Concurrent `approve_selection` on same id → row-lock / optimistic version check.
- Mentor deleted between match-load & score-write → AttributeError.
- Empty mentor list → `recommend_mentors([])` returns `[]` ✓.
- Programme `published` → `draft` rollback — no guard exists.
- Transcript >1MB sent to `/events/{id}/followups/from-transcript` → Vertex token limit not caught.
- Frontend offline → no retry/backoff.
- JWT valid sig but `jti` not in `user_sessions` → silent 401 (should be "session revoked").

---

## 6. Performance Notes

- `match_programme` (api.py:647) loads ALL mentors/companies/partners/SPs into memory. O(N) per actor. >10k actors → seconds. Move to SQL:
  ```sql
  SELECT ..., (CASE WHEN industry ILIKE :ti THEN 0.4 ELSE 0 END + ...) AS score
  FROM mentors ORDER BY score DESC LIMIT 50
  ```
- `list_actors` (api.py:805) 4× full-table scans + Python concat. Use `UNION ALL`.
- N+1 in `approve_selection` (line 1039) — bulk-fetch:
  ```python
  mentor_ids = [i.entity_id for i in selection.items if i.entity_type=="MENTOR"]
  mentors = db.scalars(select(Mentor).where(Mentor.mentor_id.in_(mentor_ids))).all()
  ```

---

## 7. Summary Table

| ID | Severity | File | Fix LOC |
|----|----------|------|---------|
| B-1 | CRITICAL | nexusai/api.py imports | restore svc files |
| B-2 | CRITICAL | nexusai/api.py:439 | add Depends |
| B-3 | CRITICAL | nexusai/api.py:454 | env gate |
| B-4 | CRITICAL | config.py:50, api.py:312 | reject default |
| B-5 | CRITICAL | nexusai/api.py:654 | hide traceback |
| B-6 | CRITICAL | nexusai/api.py:418 | single-use flag |
| B-7 | HIGH | matching_agent.py:69 | next(..., None) |
| B-8 | HIGH | api.py mult | utcnow() |
| B-9 | HIGH | matching_agent.py:148 | named regex |
| B-10 | HIGH | backend/app/ entire | dedupe backends |
| B-11 | HIGH | requirements.txt | regenerate |
| B-12 | HIGH | web_backend/auth.service.ts:6 | Redis |
| B-13 | MED | auth.service.ts:41 | use env var |
| B-14 | MED | auth.service.ts:36 | embed roles |
| B-15 | MED | backend/app/main.py:30 | lifespan |
| B-16 | MED | CORS configs | enum methods |
| B-17 | MED | routes.py:347 | real metrics |
| B-18 | MED | chat/route.ts:3 | validate key |
| B-19 | MED | chat/route.ts:15 | role check |
| B-20 | MED | api.py:326 | conditional commit |
| B-21..27 | LOW | various | hygiene |

End of report.
