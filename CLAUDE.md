# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

周易 (ZhouYi) — Chinese traditional divination web app at `https://zhouyi.goblin.top` with two sub-apps:
- **紫微斗数** (Zi Wei Dou Shu) at `/astrology/` — Vue 3 SPA for birth chart calculation
- **六爻占卜** (Liu Yao) at `/hexagram/` — Vanilla JS coin-casting divination

## Build & Deploy

**CRITICAL: Always use `bash build.sh` to build.** Never build sub-projects individually for deployment.

```bash
bash build.sh              # build only
bash build.sh --deploy     # build + git push + deploy to Cloudflare Pages
bash build.sh -d "message" # deploy with custom commit message
```

`build.sh` assembles all sub-projects into `dist/`, creates SPA fallback pages, generates SEO static pages, and copies Cloudflare Functions.

Manual deploy: `npx wrangler pages deploy dist --project-name=zhouyi --branch=main --commit-dirty=true`

## Development

```bash
cd Astrology && npm run dev    # localhost:5173/astrology/
cd hexagram && npm run dev     # localhost:5173/hexagram/
```

MCP server is deployed independently: `cd mcp-server && npm run deploy`

## Architecture

```
zhouyi/
├── index.html, style.css    # Root homepage (太极图 + navigation)
├── build.sh                 # Master build/deploy orchestrator
├── Astrology/               # Vue 3 + Vite SPA (base: /astrology/)
├── hexagram/                # Vanilla JS + Vite multi-page app (base: /hexagram/)
├── functions/api/           # Cloudflare Pages Functions (AI streaming via Gemini)
├── scripts/                 # Build-time scripts (SEO page generation)
├── mcp-server/              # Separate Cloudflare Worker (MCP protocol)
└── dist/                    # Build output (gitignored, assembled by build.sh)
```

### Astrology Sub-Project (Vue 3)

Key routes: `/` (Paipan chart), `/stars` (star index), `/dianji` (classical texts), `/true-solar-time`

Core composables:
- `useHoroscope.js` — horoscope scope state (大限/流年/流月), 三方四正, flying si-hua
- `usePatternDetection.js` — 格局 detection (natal + transient)
- `usePaipanConstants.js` — SIHUA_TABLE, scope colors, grid layout helpers
- `useTrueSolarTime.js` — Spencer 1971 equation of time

Four display scopes with distinct colors: `ben` (red #d32f2f), `da` (green #388e3c), `yi` (blue #1976d2), `yue` (purple #7b1fa2)

Key dependencies: `iztro` (chart engine), `lunar-javascript` (lunar calendar/八字)

### hexagram Sub-Project (Vanilla JS)

Two entry points: `index.html` (divination) and `study.html` (64-hexagram reference)
Core logic in `js/core/divination.js` (coin casting, Na Jia table)

### Cloudflare Functions

`functions/api/ai-interpret.js` and `ai-ziwei.js` — Gemini API streaming with KV-based rate limiting (3 req/IP/hour)

### Static JSON API

Generated at build by `scripts/generate-seo-pages.js`:
- `/api/hexagram/{1-64}.json` — hexagram data
- `/api/star/{filename}.json` — star data
- `/api/classic/{0-22}.json` — classical texts
- Each has an `index.json` listing endpoint

## Design System

Chinese ink-painting aesthetic: background `#f4ece1`, paper `#faf6ef`, text `#3a2e2a`, accent red `#8b2500`, accent gold `#b8860b`, border `#c4a97d`. Font stack: Ma Shan Zheng, Noto Serif SC, serif.
