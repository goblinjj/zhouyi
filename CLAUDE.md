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

`build.sh` assembles all sub-projects into `dist/`, creates SPA fallback pages (e.g. `astrology/{dianji,stars,true-solar-time}`, `qimen/knowledge`), generates SEO static pages, copies Cloudflare Functions and `_headers`, and injects `__BUILD_VER__` (unix timestamp) into root and hexagram HTML for cache-busting.

**Adding a Vue route requires editing `build.sh` too.** Cloudflare Pages serves static files; a new route in `Astrology/src/router/index.js` or `qimen/src/router/index.js` 404s on direct navigation unless `build.sh` copies `index.html` into a matching `dist/<app>/<route>/` directory.

`_headers` sets site-wide `Cache-Control: no-store`. This is deliberate: cached HTML referencing content-hashed assets deleted by a later deploy 404s and breaks the page. Don't "optimize" it back to long-lived caching without replacing the whole invalidation strategy.

Manual deploy: `npx wrangler pages deploy dist --project-name=zhouyi --branch=main --commit-dirty=true`

## Development

```bash
cd Astrology && npm run dev    # localhost:5173/astrology/
cd hexagram && npm run dev     # localhost:5173/hexagram/
cd qimen && npm run dev        # localhost:5173/qimen/
```

MCP server is deployed independently as a Cloudflare Worker (TypeScript; `createMcpHandler` from `agents/mcp` + `@modelcontextprotocol/sdk`, which arrives transitively — it is not in `mcp-server/package.json` dependencies): `cd mcp-server && npm run deploy` (dev: `npm run dev` via wrangler).

## Architecture

```
zhouyi/
├── index.html, style.css    # Root homepage (太极图 + navigation)
├── llms.txt                 # LLM-readable index of the static JSON API
├── build.sh                 # Master build/deploy orchestrator
├── shared/                  # Shared modules (true-solar-time, cities)
├── Astrology/               # Vue 3 + Vite SPA (base: /astrology/)
├── hexagram/                # Vanilla JS + Vite multi-page app (base: /hexagram/)
├── qimen/                   # Vue 3 + Vite SPA (base: /qimen/)
├── functions/api/           # Cloudflare Pages Functions (AI streaming via Gemini)
├── scripts/                 # Build-time scripts (SEO page generation)
├── mcp-server/              # Separate Cloudflare Worker (MCP protocol)
├── docs/plans/              # Dated design docs (true-solar-time, qimen, ...)
└── dist/                    # Build output (gitignored, assembled by build.sh)
```

No automated test suite and no linter/formatter config exist anywhere in the repo. `hexagram/` has a stub `npm test` that just exits 1. Verification is manual: run the relevant `npm run dev` and check the page, or `bash build.sh` and inspect `dist/`.

### Astrology Sub-Project (Vue 3)

Key routes: `/` (Paipan chart), `/stars` (star index), `/dianji` (classical texts), `/true-solar-time`. Vite aliases: `@` → `./src`, `@shared` → `../shared`.

Core composables:
- `useHoroscope.js` — horoscope scope state (大限/流年/流月), 三方四正, flying si-hua
- `usePatternDetection.js` — 格局 detection (natal + transient)
- `usePaipanConstants.js` — SIHUA_TABLE, scope colors, grid layout helpers
- `useTrueSolarTime.js` — Spencer 1971 equation of time

Four display scopes with distinct colors: `ben` (red #d32f2f), `da` (green #388e3c), `yi` (blue #1976d2), `yue` (purple #7b1fa2)

Key dependencies: `iztro` (chart engine), `lunar-javascript` (lunar calendar/八字)

**晚子时 (23:00–00:00) day-boundary convention.** A 23:xx birth is mapped to the *next* day's 早子时 before chart calculation. Three sites must stay in sync; if you touch one, audit the others:
- `views/Paipan.vue` passes `dayDivide: 'forward'` to `iztro.astro.bySolar`.
- `composables/usePaipanConstants.js#normalizeLateZi(dateStr, timeIndex)` pre-advances the date when `timeIndex === 12` (handles lunar month-end crossings like 1962-04-04 that iztro's own `forward` mishandles).
- `components/EightCharDaYun.vue` calls `eightChar.setSect(1)` and `getYun(gender, 1)` so lunar-javascript's 八字/大运 agree with the紫微 day pillar.

### hexagram Sub-Project (Vanilla JS)

No framework, no build-time templating — plain ES modules bundled by Vite. Two entry points declared in `vite.config.js` rollup input: `index.html` (divination) and `study.html` (64-hexagram reference).

- `js/core/divination.js` — `Divination` class: coin casting (6/7/8/9), 本卦/变卦 derivation, Na Jia
- `js/data/constants.js` — NA_JIA_TABLE, TRIGRAM_PALACE_MAP, PALACE/BRANCH_ELEMENTS
- `js/main.js` — ~1400 lines of direct DOM manipulation driving the whole divination page (casting UI, board rendering, 高岛 modal, AI panel, localStorage history). Expect imperative code; there is no component layer.
- `js/modules/takashima.js` — lazily fetches hexagram text, keyed by **6-bit binary code** (`"111111"` → hex id) via `data/takashima_index.json`

Uses `@shared` too (true solar time / cities in `js/main.js`).

**高岛易断 text data is generated by Python scripts, not by npm.** Pipeline: `gaodao.txt` → `parse_gaodao.py` (+ `hexagram_constants.py` for pinyin/code/palace metadata) → `takashima.json` → `split_json.py` → `public/data/takashima/{1..64}.json` + `takashima_index.json` (`verify_json.py` checks the result). Run these manually from `hexagram/` when the source text changes; the split JSON files are committed and are the single source of truth for hexagram text everywhere else.

### qimen Sub-Project (Vue 3)

Single-page app for 时家转盘奇门 (time-based rotating board Qi Men Dun Jia). Routes: `/` (paipan), `/knowledge`. Vite aliases: `@` → `./src`, `@shared` → `../shared`.

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

All three sub-apps reference these via the Vite alias `"@shared": "../shared"` (defined in each `vite.config.js`, including hexagram's). Note `Astrology/src/data/cities.js` is a thin re-export of `@shared/cities` — edit the shared file, not the copy.

**True-solar-time scope differs per sub-app — don't unify them blindly.**

In **Astrology** and **qimen** the correction adjusts the *hour pillar only*; month/day/year pillars use the user-entered civil date. The conversion is a time offset (not a datetime substitution) so midnight crossings don't shift the day pillar.

**hexagram is deliberately different** (`js/main.js#initDate`): it divines for *now*, so the day pillar follows the true-solar-time clock. Three rules, all interlocking — changing one alone desynchronizes the others:

- **Year/month pillars** come from `bazi.getYear()/getMonth()`, which switch at the *exact* 交节 instant. Never use `lunar.getMonthZhi()` — that flips at midnight of the 交节 day, so the whole 立秋-day daytime would carry the wrong 月建 (and wrong 月破).
- **Day boundary is 子时, 晚子 belonging to the next day.** With true solar time off, that's civil 23:00. With it on, it's the 晚子时 start from `calcUnequalShichen` *in true-solar-time coordinates*, plus a `dayShift` for the offset itself crossing midnight (Xinjiang runs ~2.5h behind civil time, so civil 01:00 there is still the previous solar day).
- **日柱, 日支, 旬空 must all come from the same shifted `Lunar`**, and the hour pillar from the already-shifted day stem (`calcHourGanZhi(..., isLateZi = false)` — the carry is in the day stem, passing `true` double-counts it). `saveToHistory` reuses `currentGanZhiText` for the same reason.

Note the 时辰 table is anchored on midnight as 子时's center and only varies with day *length*, so building it from civil-time sunrise/sunset and querying it with true-solar-time is correct, not a unit mismatch.

### Cloudflare Functions

Three near-identical handlers, one per sub-app — `ai-interpret.js` (六爻), `ai-ziwei.js` (紫微), `ai-qimen.js` (奇门). Each does Gemini streaming plus input length caps and KV rate limiting (3 req/IP/hour) against the `RATE_LIMIT_KV` binding, with a per-app key prefix (`ratelimit:qimen:<ip>`, …). Fix a bug in one and check the other two — they were copied, not shared.

### SEO Pages + Static JSON API

`scripts/generate-seo-pages.js` runs after the sub-builds and writes directly into `dist/`. It reads source data **out of the sub-projects**, so those files double as a content API contract:

| Output | Source |
|---|---|
| `dist/hexagram/gua/{1-64}.html`, `/api/hexagram/*.json` | `hexagram/public/data/takashima/*.json` |
| `dist/astrology/star/*.html`, `/api/star/*.json` | `Astrology/src/data/stars/*.js` (`模板.js` excluded) |
| `dist/astrology/classic/*.html`, `/api/classic/*.json` | `Astrology/src/data/classics.js` |

Star and classics files are read with a hand-rolled `parseJsExport()` (strip `export default`, evaluate via `new Function`), not `import` — keep those data files as a plain `export default {…}` object literal with no imports or computed values, or generation silently skips them. Adding a star file is enough to publish a new SEO page and API endpoint; the script also rewrites `sitemap.xml`.

Each API directory has an `index.json` listing endpoint; `llms.txt` documents the whole API for LLM consumers.

### MCP Server

`mcp-server/` deploys separately (`npm run deploy`) to its own custom domain `zhouyi-mcp.goblin.top` — **not** part of `build.sh`. Its three tools (`lookup_hexagram`, `lookup_star`, `lookup_classic`) `fetch()` the *production* `https://zhouyi.goblin.top/api/*` JSON, so new data only reaches MCP clients after the main site is deployed; the MCP worker itself usually needs no redeploy.

## Design System

Chinese ink-painting aesthetic: background `#f4ece1`, paper `#faf6ef`, text `#3a2e2a`, accent red `#8b2500`, accent gold `#b8860b`, border `#c4a97d`. Font stack: Ma Shan Zheng, Noto Serif SC, serif.

**五行 palette** (`hexagram/css/style.css` `:root`, applied to 纳甲 via `.wx-{Wood|Fire|Earth|Metal|Water}`): wood `#1f6b2e`, fire `#a82f21`, earth `#7d5e12`, metal `#5f6569`, water `#1c2b33`. These are deliberately *not* the literal 五行 colors — metal's white and earth's yellow are unreadable on the paper background, so they land on 银灰 and 赭石 while keeping the light-to-dark ordering of the original five. All clear 4.7:1 on `#f4ece1`; re-check contrast before adjusting any of them. Only 纳甲 is tinted — 六亲, 爻符, and 世应 stay ink-colored so each row carries one colored token.
