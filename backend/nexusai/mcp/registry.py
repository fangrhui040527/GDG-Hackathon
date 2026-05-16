from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from nexusai.config import Settings


MCPHandler = Callable[..., Any]


@dataclass(frozen=True)
class MCPTool:
    name: str
    handler: MCPHandler


class MCPRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, MCPTool] = {}

    def register(self, name: str, handler: MCPHandler) -> None:
        self._tools[name] = MCPTool(name=name, handler=handler)

    def has_tool(self, name: str) -> bool:
        return name in self._tools

    def tool_names(self) -> list[str]:
        return sorted(self._tools)

    def call(self, name: str, **kwargs):
        if name not in self._tools:
            raise KeyError(f"MCP tool is not registered: {name}")
        return self._tools[name].handler(**kwargs)


def _not_configured_tool(name: str):
    def handler(**kwargs):
        return {
            "tool": name,
            "status": "not_configured",
            "arguments": kwargs,
            "message": f"{name} MCP boundary is configured but no external server is attached.",
        }

    return handler


def build_mcp_registry(settings: Settings) -> MCPRegistry:
    registry = MCPRegistry()
    for tool_name in settings.enabled_mcp_tools:
        registry.register(tool_name, _not_configured_tool(tool_name))
    return registry
