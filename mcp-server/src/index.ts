import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler } from "agents/mcp";
import { z } from "zod";

const API_BASE = "https://zhouyi.goblin.top/api";

async function fetchJson(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

function buildServer() {
  const server = new McpServer({
    name: "ZhouYi MCP Server",
    version: "1.0.0",
  });

  // --- Tools with annotations ---

  server.tool(
    "lookup_hexagram",
    {
      description: "Query I Ching (易经) hexagram data. Omit id to get a list of all 64 hexagrams with name, pinyin, and palace. Pass id (1-64) to get full hexagram details including guaci (卦辞), general commentary, Takashima divination, and all six lines with classical and modern interpretations.",
      annotations: {
        title: "Lookup I Ching Hexagram",
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    { id: z.number().int().min(1).max(64).optional().describe("Hexagram number (1-64). Omit to get a list of all 64 hexagrams.") },
    async ({ id }) => {
      const data = id
        ? await fetchJson(`/hexagram/${id}.json`)
        : await fetchJson("/hexagram/index.json");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lookup_star",
    {
      description: "Query Zi Wei Dou Shu (紫微斗数) star data. Omit name to get a list of all 53 stars with name, filename, and category. Pass filename (e.g. 'ZiWei', 'TianJi', 'TaiYang') to get full star details including classical references (经典), overview (总述), and interpretations across all 12 palaces (命宫 through 父母宫).",
      annotations: {
        title: "Lookup Zi Wei Dou Shu Star",
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    { name: z.string().optional().describe("Star filename in PinYin, e.g. ZiWei, TianJi, TaiYang, TianTong. Omit to get a list of all 53 stars.") },
    async ({ name }) => {
      const data = name
        ? await fetchJson(`/star/${name}.json`)
        : await fetchJson("/star/index.json");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "lookup_classic",
    {
      description: "Query Zi Wei Dou Shu (紫微斗数) classical texts. Omit id to get a list of all 23 classics with title. Pass id (0-22) to get the full text of a specific classic, including sections if available. Classics include 太微赋, 形性赋, and other foundational treatises.",
      annotations: {
        title: "Lookup Zi Wei Dou Shu Classic Text",
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    { id: z.number().int().min(0).max(22).optional().describe("Classic index (0-22). Omit to get a list of all 23 classics.") },
    async ({ id }) => {
      const data = id !== undefined
        ? await fetchJson(`/classic/${id}.json`)
        : await fetchJson("/classic/index.json");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  // --- Prompts ---

  server.prompt(
    "interpret_hexagram",
    "Get a specific I Ching hexagram and prepare it for divination interpretation",
    { id: z.string().describe("Hexagram number (1-64)") },
    async ({ id }) => {
      const data = await fetchJson(`/hexagram/${Number(id)}.json`);
      return {
        messages: [{
          role: "user" as const,
          content: { type: "text" as const, text: `Here is the I Ching hexagram data:\n\n${JSON.stringify(data, null, 2)}\n\nPlease provide a comprehensive interpretation of this hexagram, including its meaning, the significance of each line, and practical guidance for divination.` },
        }],
      };
    }
  );

  server.prompt(
    "analyze_star",
    "Get a Zi Wei Dou Shu star and prepare it for chart analysis",
    { name: z.string().describe("Star filename, e.g. ZiWei, TianJi") },
    async ({ name }) => {
      const data = await fetchJson(`/star/${name}.json`);
      return {
        messages: [{
          role: "user" as const,
          content: { type: "text" as const, text: `Here is the Zi Wei Dou Shu star data:\n\n${JSON.stringify(data, null, 2)}\n\nPlease analyze this star's characteristics, its influence across the 12 palaces, and key insights for chart reading.` },
        }],
      };
    }
  );

  // --- Resources ---

  server.resource(
    "hexagram-list",
    "zhouyi://hexagram/index",
    { description: "List of all 64 I Ching hexagrams", mimeType: "application/json" },
    async () => ({
      contents: [{ uri: "zhouyi://hexagram/index", text: JSON.stringify(await fetchJson("/hexagram/index.json"), null, 2), mimeType: "application/json" }],
    })
  );

  server.resource(
    "star-list",
    "zhouyi://star/index",
    { description: "List of all 53 Zi Wei Dou Shu stars", mimeType: "application/json" },
    async () => ({
      contents: [{ uri: "zhouyi://star/index", text: JSON.stringify(await fetchJson("/star/index.json"), null, 2), mimeType: "application/json" }],
    })
  );

  server.resource(
    "classic-list",
    "zhouyi://classic/index",
    { description: "List of all 23 Zi Wei Dou Shu classical texts", mimeType: "application/json" },
    async () => ({
      contents: [{ uri: "zhouyi://classic/index", text: JSON.stringify(await fetchJson("/classic/index.json"), null, 2), mimeType: "application/json" }],
    })
  );

  return server;
}

const serverCard = {
  name: "ZhouYi MCP Server",
  displayName: "ZhouYi 周易",
  description: "Chinese traditional divination data — I Ching hexagrams (64), Zi Wei Dou Shu stars (53), and classical texts (23). Query structured data on Chinese metaphysics.",
  homepage: "https://zhouyi.goblin.top",
  icon: "https://zhouyi.goblin.top/favicon.svg",
  url: "https://zhouyi-mcp.goblin.top",
  transport: {
    type: "streamable-http",
    url: "https://zhouyi-mcp.goblin.top/mcp",
  },
  tools: [
    { name: "lookup_hexagram", description: "Query I Ching hexagram data. Omit id for list, pass id (1-64) for details." },
    { name: "lookup_star", description: "Query Zi Wei Dou Shu star data. Omit name for list, pass name (e.g. ZiWei) for details." },
    { name: "lookup_classic", description: "Query classical texts. Omit id for list, pass id (0-22) for full text." },
  ],
};

const mcpHandler = createMcpHandler(buildServer(), {
  route: "/mcp",
  corsOptions: {
    origin: "*",
    methods: "GET, POST, DELETE, OPTIONS",
    headers: "Content-Type, mcp-session-id, mcp-protocol-version",
  },
});

const mcpHandlerSSE = createMcpHandler(buildServer(), {
  route: "/sse",
  corsOptions: {
    origin: "*",
    methods: "GET, POST, DELETE, OPTIONS",
    headers: "Content-Type, mcp-session-id, mcp-protocol-version",
  },
});

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
          "access-control-allow-headers": "Content-Type, mcp-session-id, mcp-protocol-version",
          "access-control-max-age": "86400",
        },
      });
    }

    if (url.pathname === "/.well-known/mcp/server-card.json" || url.pathname === "/") {
      return new Response(JSON.stringify(serverCard, null, 2), {
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }

    if (url.pathname === "/mcp") {
      return mcpHandler(request, env, ctx);
    }

    if (url.pathname === "/sse") {
      return mcpHandlerSSE(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  },
};
