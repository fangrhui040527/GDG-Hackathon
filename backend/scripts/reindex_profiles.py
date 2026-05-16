"""Re-embed all mentor/company/partner/SP profiles and upsert to Vector Search index."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from nexusai.config import get_settings
from nexusai.database import (
    Company,
    Mentor,
    Partner,
    ServiceProvider,
    create_database_engine,
    create_session_factory,
    session_scope,
)
from nexusai.services.vector import VertexEmbeddingService, build_embedding_text


def main():
    settings = get_settings()
    engine = create_database_engine(settings)
    SessionFactory = create_session_factory(engine)
    embed_svc = VertexEmbeddingService(settings)

    records: list[tuple[str, int, str]] = []  # (entity_type, entity_id, text)

    with session_scope(SessionFactory) as db:
        for m in db.query(Mentor).all():
            text = build_embedding_text(
                "MENTOR",
                m.short_bio or "",
                m.preferred_industry or "",
                m.preferred_company_stage or "",
            )
            records.append(("MENTOR", m.mentor_id, text))

        for c in db.query(Company).all():
            text = build_embedding_text(
                "COMPANY",
                c.description or "",
                c.industry or "",
                c.stage or "",
            )
            records.append(("COMPANY", c.company_id, text))

        for p in db.query(Partner).all():
            text = build_embedding_text(
                "PARTNER",
                getattr(p, "description", "") or "",
                getattr(p, "industry_focus", "") or "",
                "",
            )
            records.append(("PARTNER", p.partner_id, text))

        for sp in db.query(ServiceProvider).all():
            text = build_embedding_text(
                "SP",
                getattr(sp, "description", "") or "",
                getattr(sp, "industry_focus", "") or "",
                "",
            )
            records.append(("SP", sp.sp_id, text))

    if not records:
        print("No records to embed.")
        return

    print(f"Embedding {len(records)} profiles...")
    texts = [r[2] for r in records]

    # Batch in chunks of 250 (Vertex AI limit)
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), 250):
        chunk = texts[i : i + 250]
        embs = embed_svc.batch_embed(chunk)
        all_embeddings.extend(embs)
        print(f"  Embedded {min(i + 250, len(texts))}/{len(texts)}")

    # Build datapoints for upsert
    datapoints = []
    for (entity_type, entity_id, _), embedding in zip(records, all_embeddings):
        if not embedding:
            continue
        datapoints.append({
            "datapoint_id": f"{entity_type}:{entity_id}",
            "feature_vector": embedding,
            "restricts": [{"namespace": "entity_type", "allow_list": [entity_type]}],
        })

    print(f"Prepared {len(datapoints)} datapoints for Vector Search index.")
    print("To upsert, deploy a Matching Engine Index and use aiplatform.MatchingEngineIndex.upsert_datapoints().")
    print("Datapoint IDs:", [dp["datapoint_id"] for dp in datapoints])


if __name__ == "__main__":
    main()
