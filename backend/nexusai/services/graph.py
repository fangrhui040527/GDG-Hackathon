"""Spanner Graph service — real GQL queries against Cloud Spanner."""
from typing import Any

from nexusai.config import Settings


class GraphService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._instance_id = settings.spanner_instance_id
        self._database_id = settings.spanner_database_id
        self._graph_name = settings.spanner_graph_name

    def _get_database(self):
        from google.cloud import spanner

        client = spanner.Client(project=self.settings.google_cloud_project)
        instance = client.instance(self._instance_id)
        return instance.database(self._database_id)

    def _run_gql(self, gql: str, params: dict[str, Any] | None = None) -> list[dict]:
        if not self._instance_id or not self._database_id:
            return []

        database = self._get_database()
        results = []

        def _read(transaction):
            row_iter = transaction.execute_sql(gql, params=params or {})
            for row in row_iter:
                results.append(dict(zip([col.name for col in row_iter.fields], row)))

        database.run_in_transaction(_read)
        return results

    def find_mentors_with_positive_history(
        self,
        industry: str,
        country: str | None = None,
        stage: str | None = None,
        min_outcome: float = 0.7,
    ) -> list[dict]:
        """Find mentors who have positive past mentoring outcomes via graph traversal."""
        gql = f"""
        GRAPH {self._graph_name}
        MATCH (m:Mentor)-[r:MENTORED]->(c:Company)
        WHERE r.outcome_score >= @min_outcome
          AND c.industry = @industry
        """
        params: dict[str, Any] = {"min_outcome": min_outcome, "industry": industry}

        if country:
            gql += " AND m.country = @country"
            params["country"] = country
        if stage:
            gql += " AND c.stage = @stage"
            params["stage"] = stage

        gql += """
        RETURN m.mentor_id AS mentor_id,
               m.name AS mentor_name,
               AVG(r.outcome_score) AS avg_outcome,
               COUNT(*) AS mentored_count
        ORDER BY avg_outcome DESC
        """

        try:
            return self._run_gql(gql, params)
        except Exception:
            return []

    def expand_neighborhood(
        self,
        entity_type: str,
        entity_id: int,
        depth: int = 2,
    ) -> dict[str, Any]:
        """Return a subgraph around an entity for UI visualization."""
        VALID_ENTITY_TYPES = {"Mentor", "Company", "Event", "Partner", "ServiceProvider"}
        if entity_type not in VALID_ENTITY_TYPES:
            return {"nodes": [], "edges": [], "total": 0, "error": f"Invalid entity_type: {entity_type}"}

        gql = f"""
        GRAPH {self._graph_name}
        MATCH path = (source:{entity_type} {{id: @entity_id}})-[*1..{min(depth, 3)}]-(target)
        RETURN source, target, path
        LIMIT 100
        """
        params = {"entity_id": entity_id}

        try:
            rows = self._run_gql(gql, params)
            nodes: list[dict] = []
            edges: list[dict] = []
            seen_nodes: set[str] = set()

            for row in rows:
                for key in ("source", "target"):
                    node = row.get(key)
                    if node and isinstance(node, dict):
                        node_id = f"{node.get('label', 'Unknown')}:{node.get('id', '')}"
                        if node_id not in seen_nodes:
                            seen_nodes.add(node_id)
                            nodes.append({"id": node_id, **node})

            return {"nodes": nodes, "edges": edges, "total": len(nodes)}
        except Exception:
            return {"nodes": [], "edges": [], "total": 0}

    def get_mentor_graph_score(self, mentor_id: int, company_industry: str) -> float:
        """Get a graph-based boost score for a mentor based on past outcomes in the same industry."""
        gql = f"""
        GRAPH {self._graph_name}
        MATCH (m:Mentor {{id: @mentor_id}})-[r:MENTORED]->(c:Company)
        WHERE c.industry = @industry
        RETURN AVG(r.outcome_score) AS avg_score, COUNT(*) AS cnt
        """
        params = {"mentor_id": mentor_id, "industry": company_industry}

        try:
            rows = self._run_gql(gql, params)
            if rows and rows[0].get("avg_score") is not None:
                return float(rows[0]["avg_score"])
        except Exception:
            pass
        return 0.0


class FakeGraphService:
    """Stub for tests and when Spanner is not configured."""

    def find_mentors_with_positive_history(self, industry: str, **kwargs) -> list[dict]:
        return []

    def expand_neighborhood(self, entity_type: str, entity_id: int, depth: int = 2) -> dict:
        return {"nodes": [], "edges": [], "total": 0}

    def get_mentor_graph_score(self, mentor_id: int, company_industry: str) -> float:
        return 0.0
