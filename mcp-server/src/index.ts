import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const API_BASE = "https://zhouyi.goblin.top/api";

async function fetchJson(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

export class ZhouYiMCP extends McpAgent {
  server = new McpServer({
    name: "ZhouYi MCP Server",
    version: "1.0.0",
  });

  async init() {
    this.server = new McpServer({
      name: "ZhouYi MCP Server",
      version: "1.0.0",
    });

    this.server.tool(
      "lookup_hexagram",
      "Query I Ching hexagram data. Omit id to get a list of all 64 hexagrams. Pass id (1-64) to get full hexagram details including classical text, modern interpretation, and line-by-line commentary.",
      { id: z.number().int().min(1).max(64).optional().describe("Hexagram number (1-64)") },
      async ({ id }) => {
        const data = id
          ? await fetchJson(`/hexagram/${id}.json`)
          : await fetchJson("/hexagram/index.json");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }
    );

    this.server.tool(
      "lookup_star",
      "Query Zi Wei Dou Shu (Purple Star Astrology) star data. Omit name to get a list of all 53 stars. Pass name (e.g. 'ZiWei', 'TianJi', 'TaiYang') to get full star details including classical text and 12-palace interpretations.",
      { name: z.string().optional().describe("Star filename, e.g. ZiWei, TianJi, TaiYang") },
      async ({ name }) => {
        const data = name
          ? await fetchJson(`/star/${name}.json`)
          : await fetchJson("/star/index.json");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }
    );

    this.server.tool(
      "lookup_classic",
      "Query Zi Wei Dou Shu classical texts. Omit id to get a list of all 23 classics. Pass id (0-22) to get the full text of a specific classic.",
      { id: z.number().int().min(0).max(22).optional().describe("Classic index (0-22)") },
      async ({ id }) => {
        const data = id !== undefined
          ? await fetchJson(`/classic/${id}.json`)
          : await fetchJson("/classic/index.json");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }
    );
  }
}

const mcpHandler = ZhouYiMCP.serveSSE("/sse");

export default {
  fetch(request: Request, env: Record<string, any>, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return new Response(
        JSON.stringify({
          name: "ZhouYi MCP Server",
          description: "I Ching hexagrams, Zi Wei Dou Shu stars & classics",
          tools: ["lookup_hexagram", "lookup_star", "lookup_classic"],
          mcp_endpoint: "/sse",
        }),
        { headers: { "content-type": "application/json" } }
      );
    }

    return mcpHandler.fetch(request, env, ctx);
  },
};
