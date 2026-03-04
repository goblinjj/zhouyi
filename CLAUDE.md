# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

周易 (ZhouYi) — Chinese traditional divination web app at `https://zhouyi.goblin.top` with three sub-apps:
- **紫微斗数** (Zi Wei Dou Shu) at `/astrology/` — Vue 3 SPA for birth chart calculation
- **六爻占卜** (Liu Yao) at `/hexagram/` — Vanilla JS coin-casting divination
- **奇门遁甲** (Qi Men Dun Jia) at `/qimen/` — Vue 3 SPA for time-based rotating board divination

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
cd qimen && npm run dev        # localhost:5173/qimen/
```

MCP server is deployed independently: `cd mcp-server && npm run deploy`

## Architecture

```
zhouyi/
├── index.html, style.css    # Root homepage (太极图 + navigation)
├── build.sh                 # Master build/deploy orchestrator
├── shared/                  # Shared modules (true-solar-time, cities)
├── Astrology/               # Vue 3 + Vite SPA (base: /astrology/)
├── hexagram/                # Vanilla JS + Vite multi-page app (base: /hexagram/)
├── qimen/                   # Vue 3 + Vite SPA (base: /qimen/)
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

### qimen Sub-Project (Vue 3)

Single-page app for 时家转盘奇门 (time-based rotating board Qi Men Dun Jia).

Core modules:
- `core/constants.js` — 九星/八门/八神/三奇六仪/九宫环形队列
- `core/jieqi.js` — 节气 calculation + 拆补法定局
- `core/qimen.js` — Six-step qimen algorithm (地盘→值符值使→天盘→人盘→神盘)
- `composables/useQimen.js` — Vue reactive state with true solar time support

Features: city-based true solar time, 拆补法 ju determination, nine-palace grid display, AI interpretation

Key dependencies: `lunar-javascript` (ganzhi calendar), `@shared/true-solar-time`, `@shared/cities`

### Shared Modules (`shared/`)

Framework-independent modules used by multiple sub-apps:
- `shared/true-solar-time.js` — Spencer 1971 equation of time, sunrise/sunset, unequal shichen
- `shared/cities.js` — Global cities dataset with longitude/latitude/timezone

Sub-apps reference via Vite alias: `"@shared": "../shared"`

### Cloudflare Functions

`functions/api/ai-interpret.js`, `ai-ziwei.js`, and `ai-qimen.js` — Gemini API streaming with KV-based rate limiting (3 req/IP/hour)

### Static JSON API

Generated at build by `scripts/generate-seo-pages.js`:
- `/api/hexagram/{1-64}.json` — hexagram data
- `/api/star/{filename}.json` — star data
- `/api/classic/{0-22}.json` — classical texts
- Each has an `index.json` listing endpoint

## Design System

Chinese ink-painting aesthetic: background `#f4ece1`, paper `#faf6ef`, text `#3a2e2a`, accent red `#8b2500`, accent gold `#b8860b`, border `#c4a97d`. Font stack: Ma Shan Zheng, Noto Serif SC, serif.
