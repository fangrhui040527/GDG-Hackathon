from nexusai.mcp.registry import MCPRegistry


class MCPClient:
    def __init__(self, registry: MCPRegistry) -> None:
        self.registry = registry

    def bigquery_query(self, sql: str, parameters: dict | None = None):
        return self.registry.call("bigquery_query", sql=sql, parameters=parameters or {})

    def spanner_graph_query(self, gql: str, parameters: dict | None = None):
        return self.registry.call("spanner_graph_query", gql=gql, parameters=parameters or {})

    def document_ai_parse(self, filename: str, content: bytes, content_type: str) -> str:
        result = self.registry.call(
            "document_ai_parse",
            filename=filename,
            content_type=content_type,
            byte_count=len(content),
        )
        if isinstance(result, dict) and result.get("text"):
            return str(result["text"])
        return "Document AI MCP returned no text. Configure the external MCP server to parse CV files."

    def chirp_transcribe(self, filename: str, content: bytes, language_code: str | None = None) -> str:
        result = self.registry.call(
            "chirp_transcribe",
            filename=filename,
            language_code=language_code,
            byte_count=len(content),
        )
        if isinstance(result, dict) and result.get("text"):
            return str(result["text"])
        return ""


class FakeMCPClient:
    def __init__(self) -> None:
        self.calls: list[str] = []

    def bigquery_query(self, sql: str, parameters: dict | None = None):
        self.calls.append("bigquery_query")
        return {"rows": []}

    def spanner_graph_query(self, gql: str, parameters: dict | None = None):
        self.calls.append("spanner_graph_query")
        return {"paths": []}

    def document_ai_parse(self, filename: str, content: bytes, content_type: str) -> str:
        self.calls.append("document_ai_parse")
        return (
            "Asha Tan is a fintech mentor focused on payments, fundraising, GTM, "
            "seed companies, English and Malay."
        )

    def chirp_transcribe(self, filename: str, content: bytes, language_code: str | None = None) -> str:
        self.calls.append("chirp_transcribe")
        return "Pitch transcript placeholder."
