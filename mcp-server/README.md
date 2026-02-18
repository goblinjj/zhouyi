# ZhouYi MCP Server

A remote [Model Context Protocol](https://modelcontextprotocol.io/) server providing access to Chinese traditional divination data — I Ching hexagrams, Zi Wei Dou Shu (Purple Star Astrology) stars, and classical texts.

## Tools

| Tool | Description |
|------|-------------|
| `lookup_hexagram` | Query I Ching hexagram data. Omit `id` for a list of all 64 hexagrams; pass `id` (1–64) for full details including classical text, modern interpretation, and Takashima line-by-line commentary. |
| `lookup_star` | Query Zi Wei Dou Shu star data. Omit `name` for a list of all 53 stars; pass `name` (e.g. `ZiWei`, `TianJi`) for full details including classical references and 12-palace interpretations. |
| `lookup_classic` | Query Zi Wei Dou Shu classical texts. Omit `id` for a list of all 23 classics; pass `id` (0–22) for the full text. |

## Connect

**Server URL:** `https://zhouyi-mcp.goblin.top/sse`

### Claude Code

```bash
claude mcp add --transport sse zhouyi-mcp https://zhouyi-mcp.goblin.top/sse
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zhouyi": {
      "command": "npx",
      "args": ["mcp-remote", "https://zhouyi-mcp.goblin.top/sse"]
    }
  }
}
```

### Cursor

Settings → MCP Servers → Add:
- Type: `sse`
- URL: `https://zhouyi-mcp.goblin.top/sse`

## Data Source

All data is served from the static JSON API at [zhouyi.goblin.top](https://zhouyi.goblin.top):

- `/api/hexagram/index.json` — 64 hexagrams
- `/api/star/index.json` — 53 stars
- `/api/classic/index.json` — 23 classical texts

See [llms.txt](https://zhouyi.goblin.top/llms.txt) for full API documentation.

## Development

```bash
cd mcp-server
npm install
npm run dev    # local dev server
npm run deploy # deploy to Cloudflare Workers
```

Built with [Cloudflare Workers](https://workers.cloudflare.com/) + [Agents SDK](https://www.npmjs.com/package/agents).
