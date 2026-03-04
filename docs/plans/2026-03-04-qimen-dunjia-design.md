# 奇门遁甲排盘模块 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 奇门遁甲 (Qi Men Dun Jia) module to the zhouyi platform with time-based rotating board (时家转盘奇门), true solar time support, and AI interpretation.

**Architecture:** New Vue 3 SPA at `/qimen/` following the same pattern as the Astrology module. True solar time pure functions and city data extracted to `shared/` for reuse across all three sub-apps. Core qimen algorithm implemented from scratch using the 拆补法 (split-complement method). AI interpretation via new Cloudflare Function using Gemini streaming.

**Tech Stack:** Vue 3 + Vite, lunar-javascript (ganzhi calendar), shared true-solar-time module, Cloudflare Pages Functions (Gemini API)

---

### Task 1: Extract shared modules

**Files:**
- Create: `shared/true-solar-time.js`
- Create: `shared/cities.js`
- Modify: `Astrology/src/composables/useTrueSolarTime.js`
- Modify: `Astrology/src/data/cities.js`
- Modify: `Astrology/src/views/TrueSolarTime.vue`
- Modify: `Astrology/vite.config.js`

**Step 1: Create `shared/true-solar-time.js`**

Copy all pure functions from `Astrology/src/composables/useTrueSolarTime.js` (lines 1-243: constants, `dayOfYear`, `equationOfTime`, `geographicTimeDiff`, `calcTrueSolarTime`, `calcSunriseSunset`, `fractionalHoursToHM`, `minutesToHM`, `calcUnequalShichen`, `findShichen`, `formatTime`) into `shared/true-solar-time.js`. Remove the `import { ref, computed } from 'vue'` line. Remove the `useTrueSolarTime()` composable. Export only the pure functions. Also export `SHICHEN_NAMES`, `EARTHLY_BRANCHES`.

**Step 2: Create `shared/cities.js`**

Copy the full content of `Astrology/src/data/cities.js` (755 lines) to `shared/cities.js`.

**Step 3: Update Astrology to import from shared**

Modify `Astrology/vite.config.js` to add alias:
```js
"@shared": fileURLToPath(new URL("../shared", import.meta.url)),
```

Modify `Astrology/src/composables/useTrueSolarTime.js`:
- Remove all pure function definitions (keep only the Vue composable)
- Add: `import { dayOfYear, equationOfTime, geographicTimeDiff, calcTrueSolarTime, calcSunriseSunset, calcUnequalShichen, findShichen, formatTime } from '@shared/true-solar-time'`
- Re-export `formatTime` for use by `TrueSolarTime.vue`

Modify `Astrology/src/data/cities.js` to re-export:
```js
export { CITIES } from '@shared/cities'
```

Modify `Astrology/src/views/TrueSolarTime.vue`: no change needed (it imports from `useTrueSolarTime` and `cities` which still export the same APIs).

**Step 4: Verify Astrology still builds**

Run: `cd /Volumes/T7/work/zhouyi/Astrology && npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add shared/ Astrology/vite.config.js Astrology/src/composables/useTrueSolarTime.js Astrology/src/data/cities.js
git commit -m "refactor: extract true-solar-time and cities to shared module"
```

---

### Task 2: Scaffold qimen Vue 3 project

**Files:**
- Create: `qimen/package.json`
- Create: `qimen/vite.config.js`
- Create: `qimen/index.html`
- Create: `qimen/src/main.js`
- Create: `qimen/src/App.vue`
- Create: `qimen/src/assets/main.css`

**Step 1: Create `qimen/package.json`**

```json
{
  "name": "qimen",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lunar-javascript": "^1.7.7",
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.2.8"
  }
}
```

**Step 2: Create `qimen/vite.config.js`**

```js
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  base: '/qimen/',
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
})
```

**Step 3: Create `qimen/index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <title>奇门遁甲 - 在线排盘</title>
  <meta name="description" content="奇门遁甲在线排盘工具，支持时家转盘奇门，拆补法定局，真太阳时校正，AI智能解读。">
  <meta name="keywords" content="奇门遁甲,排盘,时家奇门,转盘,九宫,八门,九星,八神,拆补法">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 4: Create `qimen/src/main.js`**

```js
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

**Step 5: Create `qimen/src/App.vue`**

Minimal shell with nav (太极图 home link + title), similar pattern to Astrology App.vue but simpler (no router for now, single page).

```vue
<script setup>
</script>

<template>
  <nav class="nav">
    <a class="taiji-home" href="/">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs><clipPath id="tc"><circle cx="100" cy="100" r="100"/></clipPath></defs>
        <g clip-path="url(#tc)">
          <circle cx="100" cy="100" r="100" fill="#faf6ef"/>
          <rect x="100" y="0" width="100" height="200" fill="#3a2e2a"/>
          <circle cx="100" cy="50" r="50" fill="#3a2e2a"/>
          <circle cx="100" cy="150" r="50" fill="#faf6ef"/>
          <circle cx="100" cy="50" r="12" fill="#faf6ef"/>
          <circle cx="100" cy="150" r="12" fill="#3a2e2a"/>
        </g>
        <circle cx="100" cy="100" r="96" fill="none" stroke="#c4a97d" stroke-width="3"/>
      </svg>
    </a>
    <span class="nav-title">奇门遁甲</span>
  </nav>
  <div class="divider"></div>
  <div id="qimen-app">
    <p style="text-align:center;color:#9a8c7a;">排盘模块加载中...</p>
  </div>
</template>

<style scoped>
.nav {
  text-align: center;
  padding-bottom: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
}
.taiji-home {
  display: inline-flex;
  width: 1.6em;
  height: 1.6em;
  flex-shrink: 0;
  transition: transform 0.6s ease;
}
.taiji-home:hover {
  transform: rotate(180deg);
  background: none;
}
.nav-title {
  color: #8b2500;
  font-size: x-large;
  padding: 0.3em 0.8em;
  letter-spacing: 0.1em;
  border-bottom: 2px solid #8b2500;
}
.divider {
  border: none;
  border-top: 1.5px solid #d4c5a9;
  border-bottom: 1px solid #d4c5a9;
  height: 4px;
  margin-bottom: 1.2em;
}
a, a:hover, a:active, a:visited {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  background: none;
  text-decoration: none;
}
</style>
```

**Step 6: Create `qimen/src/assets/main.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Serif SC', 'Ma Shan Zheng', serif;
  background: #f4ece1;
  color: #3a2e2a;
  min-height: 100vh;
}

#app {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0.8em;
}
```

**Step 7: Install deps and verify dev server**

Run: `cd /Volumes/T7/work/zhouyi/qimen && npm install && npm run build`
Expected: Build succeeds, creates `qimen/dist/`

**Step 8: Commit**

```bash
git add qimen/
git commit -m "feat: scaffold qimen Vue 3 project"
```

---

### Task 3: Implement qimen core constants

**Files:**
- Create: `qimen/src/core/constants.js`

**Step 1: Create constants file**

All static data structures from the algorithm spec:

```js
// 九宫环形队列（顺时针：坎艮震巽离坤兑乾）
export const RING_PALACES = [1, 8, 3, 4, 9, 2, 7, 6]

// 九宫顺序 1-9（用于阳遁顺推、阴遁逆推走宫）
export const PALACE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// 三奇六仪序列
export const STEMS_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']

// 十天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 十二地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 六甲旬首映射
export const XUN_SHOU_MAP = {
  '甲子': '戊', '甲戌': '己', '甲申': '庚',
  '甲午': '辛', '甲辰': '壬', '甲寅': '癸'
}

// 地支→宫位映射
export const BRANCH_PALACE = {
  '子': 1, '丑': 8, '未': 8, '寅': 3, '卯': 3,
  '辰': 4, '巳': 4, '午': 9, '申': 2, '酉': 7,
  '戌': 6, '亥': 6
}

// 九星本位
export const STAR_POSITIONS = {
  1: '天蓬', 8: '天任', 3: '天冲', 4: '天辅',
  9: '天英', 2: '天芮', 7: '天柱', 6: '天心', 5: '天禽'
}

// 九星环形顺序（天禽不在环上，跟天芮走）
export const STAR_RING = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心']

// 八门本位
export const GATE_POSITIONS = {
  1: '休门', 8: '生门', 3: '伤门', 4: '杜门',
  9: '景门', 2: '死门', 7: '惊门', 6: '开门'
}

// 八门环形顺序
export const GATE_RING = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']

// 八神环形顺序
export const GOD_RING = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

// 宫位名称
export const PALACE_NAMES = {
  1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫',
  5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫'
}

// 宫位五行
export const PALACE_ELEMENTS = {
  1: '水', 2: '土', 3: '木', 4: '木',
  5: '土', 6: '金', 7: '金', 8: '土', 9: '火'
}

// 九宫格显示位置（CSS grid: row, col）
// 洛书排列：4 9 2 / 3 5 7 / 8 1 6
export const PALACE_GRID = {
  4: { row: 1, col: 1 }, 9: { row: 1, col: 2 }, 2: { row: 1, col: 3 },
  3: { row: 2, col: 1 }, 5: { row: 2, col: 2 }, 7: { row: 2, col: 3 },
  8: { row: 3, col: 1 }, 1: { row: 3, col: 2 }, 6: { row: 3, col: 3 }
}

// 六十甲子表（用于查旬首）
export const JIA_ZI_TABLE = (() => {
  const table = []
  for (let i = 0; i < 60; i++) {
    table.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12])
  }
  return table
})()
```

**Step 2: Commit**

```bash
git add qimen/src/core/constants.js
git commit -m "feat(qimen): add core constants for qimen calculation"
```

---

### Task 4: Implement 节气 calculation and 拆补法定局

**Files:**
- Create: `qimen/src/core/jieqi.js`

**Step 1: Create jieqi.js**

This module must:
1. Calculate the 24 solar terms (节气) for any year using astronomical algorithm
2. Determine 阴遁/阳遁 based on current solar term
3. Implement 拆补法 to determine the 局数 (ju number 1-9)

Key logic:
- Use `lunar-javascript` for precise solar term dates and ganzhi conversion
- 阳遁: 冬至→夏至 (terms 0-11 in: 冬至,小寒,大寒,立春,雨水,惊蛰,春分,清明,谷雨,立夏,小满,芒种)
- 阴遁: 夏至→冬至 (terms 0-11 in: 夏至,小暑,大暑,立秋,处暑,白露,秋分,寒露,霜降,立冬,小雪,大雪)
- 拆补法: 节气上元→中元→下元，每元 5 天（一旬按符头甲/己分）
- 局数表：每个节气三元对应的局数

```js
import { Solar } from 'lunar-javascript'
import { TIAN_GAN, DI_ZHI, JIA_ZI_TABLE } from './constants'

// 24节气对应的局数表（上元/中元/下元）
// 阳遁：冬至→芒种
export const YANG_DUN_JU = {
  '冬至': [1, 7, 4], '小寒': [2, 8, 5], '大寒': [3, 9, 6],
  '立春': [8, 5, 2], '雨水': [9, 6, 3], '惊蛰': [1, 7, 4],
  '春分': [3, 9, 6], '清明': [4, 1, 7], '谷雨': [5, 2, 8],
  '立夏': [4, 1, 7], '小满': [5, 2, 8], '芒种': [6, 3, 9],
}

// 阴遁：夏至→大雪
export const YIN_DUN_JU = {
  '夏至': [9, 3, 6], '小暑': [8, 2, 5], '大暑': [7, 1, 4],
  '立秋': [2, 5, 8], '处暑': [1, 4, 7], '白露': [9, 3, 6],
  '秋分': [7, 1, 4], '寒露': [6, 9, 3], '霜降': [5, 8, 2],
  '立冬': [6, 9, 3], '小雪': [5, 8, 2], '大雪': [4, 7, 1],
}

/**
 * Get ganzhi for a date using lunar-javascript.
 * Returns { year: {stem, branch}, month: {stem, branch}, day: {stem, branch}, hour: {stem, branch} }
 */
export function getGanZhi(date) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  return {
    year: { stem: eightChar.getYear()[0], branch: eightChar.getYear()[1] },
    month: { stem: eightChar.getMonth()[0], branch: eightChar.getMonth()[1] },
    day: { stem: eightChar.getDay()[0], branch: eightChar.getDay()[1] },
    hour: { stem: eightChar.getTime()[0], branch: eightChar.getTime()[1] },
    yearFull: eightChar.getYear(),
    monthFull: eightChar.getMonth(),
    dayFull: eightChar.getDay(),
    hourFull: eightChar.getTime(),
  }
}

/**
 * Find the current and previous solar terms for a given date.
 * Returns { currentTerm, termDate, nextTerm, nextTermDate, isYangDun }
 */
export function findSolarTerm(date) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const jieQi = lunar.getPrevJieQi()
  const nextJieQi = lunar.getNextJieQi()

  const termName = jieQi.getName()
  const termSolar = jieQi.getSolar()
  const termDate = new Date(termSolar.getYear(), termSolar.getMonth() - 1, termSolar.getDay(),
    termSolar.getHour(), termSolar.getMinute(), termSolar.getSecond())

  const nextTermName = nextJieQi.getName()
  const nextTermSolar = nextJieQi.getSolar()
  const nextTermDate = new Date(nextTermSolar.getYear(), nextTermSolar.getMonth() - 1, nextTermSolar.getDay(),
    nextTermSolar.getHour(), nextTermSolar.getMinute(), nextTermSolar.getSecond())

  const isYangDun = termName in YANG_DUN_JU

  return { currentTerm: termName, termDate, nextTerm: nextTermName, nextTermDate, isYangDun }
}

/**
 * 拆补法定局
 *
 * Logic:
 * 1. Find the 符头 (甲/己 day) on or before the solar term date → upper yuan start
 * 2. Each yuan = 5 days: upper(上元), middle(中元), lower(下元)
 * 3. Current date falls into which yuan → look up ju number
 *
 * The 符头 is the nearest 甲 or 己 day on or before the term date.
 * Upper yuan: 符头日 ~ 符头日+4
 * Middle yuan: 符头日+5 ~ 符头日+9
 * Lower yuan: 符头日+10 ~ 符头日+14
 *
 * 拆补法 twist: if the solar term falls mid-yuan, the pre-term portion uses
 * the previous term's ju, and the post-term portion uses the new term's ju.
 * In practice, we determine yuan based on the day's position relative to the
 * 符头 of the current term period.
 */
export function determineJu(date, ganZhi) {
  const { currentTerm, termDate, isYangDun } = findSolarTerm(date)

  const juTable = isYangDun ? YANG_DUN_JU[currentTerm] : YIN_DUN_JU[currentTerm]
  if (!juTable) {
    // Fallback: shouldn't happen, but treat as 阳一局
    return { isYangDun: true, juNum: 1, currentTerm, yuan: '上' }
  }

  // Find 符头: the most recent 甲 or 己 day on or before the term date
  const dayStem = ganZhi.day.stem
  const dayStemIndex = TIAN_GAN.indexOf(dayStem)

  // Day's ganzhi index in 60 jiazi cycle
  const dayGZ = ganZhi.dayFull
  const dayIndex = JIA_ZI_TABLE.indexOf(dayGZ)

  // Find term date's ganzhi
  const termSolar = Solar.fromDate(termDate)
  const termLunar = termSolar.getLunar()
  const termDayGZ = termLunar.getEightChar().getDay()
  const termDayIndex = JIA_ZI_TABLE.indexOf(termDayGZ)

  // 符头: nearest 甲(0) or 己(5) day stem on or before term date
  const termDayStemIndex = TIAN_GAN.indexOf(termDayGZ[0])
  let fuTouOffset = termDayStemIndex % 5 // how many days past the nearest 甲/己
  const fuTouDayIndex = ((termDayIndex - fuTouOffset) % 60 + 60) % 60

  // Days from 符头 to current date
  const diffFromFuTou = ((dayIndex - fuTouDayIndex) % 60 + 60) % 60

  // Determine yuan (0=上, 1=中, 2=下)
  let yuanIndex
  if (diffFromFuTou < 5) yuanIndex = 0
  else if (diffFromFuTou < 10) yuanIndex = 1
  else if (diffFromFuTou < 15) yuanIndex = 2
  else {
    // Past 15 days, next term should have taken over. Use lower yuan as fallback.
    yuanIndex = 2
  }

  const yuanNames = ['上', '中', '下']
  return {
    isYangDun,
    juNum: juTable[yuanIndex],
    currentTerm,
    yuan: yuanNames[yuanIndex],
  }
}
```

**Step 2: Commit**

```bash
git add qimen/src/core/jieqi.js
git commit -m "feat(qimen): implement solar term calculation and 拆补法定局"
```

---

### Task 5: Implement core qimen algorithm (六步排盘)

**Files:**
- Create: `qimen/src/core/qimen.js`

**Step 1: Create the main qimen calculation engine**

This implements the six-step algorithm from the design spec:

```js
import {
  RING_PALACES, STEMS_ORDER, XUN_SHOU_MAP, TIAN_GAN, DI_ZHI,
  STAR_POSITIONS, STAR_RING, GATE_POSITIONS, GATE_RING, GOD_RING,
  PALACE_NAMES, PALACE_ELEMENTS, JIA_ZI_TABLE, BRANCH_PALACE
} from './constants'
import { getGanZhi, determineJu } from './jieqi'

/**
 * Find the 旬首 (xun shou) for a given ganzhi pair.
 * E.g., 壬子 → 甲辰旬 → returns { xunShou: '甲辰', yinStem: '壬' }
 */
function findXunShou(ganZhi) {
  const idx = JIA_ZI_TABLE.indexOf(ganZhi)
  if (idx === -1) return null
  const xunStart = idx - (idx % 10) // index of the 甲X in this 旬
  const xunGZ = JIA_ZI_TABLE[xunStart]
  const yinStem = XUN_SHOU_MAP[xunGZ] // the 六仪 that represents this 甲
  return { xunShou: xunGZ, yinStem }
}

/**
 * Step 2: 排地盘 — Place 三奇六仪 on Earth Plate
 */
function buildEarthPlate(isYangDun, juNum) {
  const plate = {} // palace number → stem
  for (let i = 0; i < 9; i++) {
    let palaceNum
    if (isYangDun) {
      palaceNum = ((juNum - 1 + i) % 9) + 1 // 1→2→...→9→1
    } else {
      palaceNum = ((juNum - 1 - i) % 9 + 9) % 9 + 1 // reverse: 9→8→...→1→9
    }
    plate[palaceNum] = STEMS_ORDER[i]
  }
  return plate
}

/**
 * Find which palace a stem is on in the earth plate.
 */
function findStemPalace(earthPlate, stem) {
  for (const [palace, s] of Object.entries(earthPlate)) {
    if (s === stem) return Number(palace)
  }
  return null
}

/**
 * Rotate a ring array by offset positions.
 * Returns new array with elements shifted.
 */
function rotateRing(ring, offset) {
  const len = ring.length
  const norm = ((offset % len) + len) % len
  return [...ring.slice(norm), ...ring.slice(0, norm)]
}

/**
 * Step 3: Find 值符 (duty star) and 值使 (duty gate)
 */
function findDutyStarAndGate(earthPlate, hourGZ) {
  const xunInfo = findXunShou(hourGZ)
  if (!xunInfo) return null

  // Find 旬首六仪 on earth plate
  const dutyPalace = findStemPalace(earthPlate, xunInfo.yinStem)
  const actualDutyPalace = dutyPalace === 5 ? 2 : dutyPalace // 中五宫寄坤二宫

  const dutyStar = STAR_POSITIONS[actualDutyPalace]
  const dutyGate = GATE_POSITIONS[actualDutyPalace]

  return {
    xunShou: xunInfo.xunShou,
    yinStem: xunInfo.yinStem,
    dutyPalace: actualDutyPalace,
    dutyStar,
    dutyGate,
  }
}

/**
 * Step 4: 排天盘 — Rotate Nine Stars (值符随时干)
 */
function buildHeavenPlate(earthPlate, duty, hourStem, isYangDun) {
  // If hour stem is 甲, use the 旬首六仪 instead
  const targetStem = hourStem === '甲' ? duty.yinStem : hourStem
  let targetPalace = findStemPalace(earthPlate, targetStem)
  if (targetPalace === 5) targetPalace = 2 // 中五宫寄坤二宫

  // Calculate rotation: duty star moves from its home palace to target palace
  const dutyStarIndex = STAR_RING.indexOf(duty.dutyStar)
  const fromRingIndex = RING_PALACES.indexOf(duty.dutyPalace)
  const toRingIndex = RING_PALACES.indexOf(targetPalace)
  const offset = toRingIndex - fromRingIndex

  // Rotate star ring
  const rotatedStars = rotateRing(STAR_RING, -offset + dutyStarIndex)

  // Place stars on palaces
  const starPlate = {}
  const heavenStems = {} // palace → heaven stem (carried from earth plate origin)
  for (let i = 0; i < 8; i++) {
    const palace = RING_PALACES[i]
    const starName = rotatedStars[i]
    starPlate[palace] = starName

    // Find where this star came from (its home palace)
    const homeIndex = STAR_RING.indexOf(starName)
    const homePalace = RING_PALACES[homeIndex]
    heavenStems[palace] = earthPlate[homePalace]
  }

  // 天禽 follows 天芮
  const tianRuiPalace = Object.entries(starPlate).find(([, s]) => s === '天芮')?.[0]
  starPlate[5] = '天禽'
  if (tianRuiPalace) {
    heavenStems[5] = earthPlate[5] || earthPlate[2] // 中五宫地盘干（寄坤二宫）
  }

  return { starPlate, heavenStems, targetPalace }
}

/**
 * Step 5: 排人盘 — Rotate Eight Gates (值使随时支)
 */
function buildHumanPlate(earthPlate, duty, hourBranch, xunShou, isYangDun) {
  // Starting palace: duty gate's home palace (same as duty palace)
  const startPalace = duty.dutyPalace

  // Count steps from 旬首地支 to 时辰地支
  const xunBranch = xunShou[1] // second char of 甲X is the branch
  const xunBranchIndex = DI_ZHI.indexOf(xunBranch)
  const hourBranchIndex = DI_ZHI.indexOf(hourBranch)
  const steps = ((hourBranchIndex - xunBranchIndex) % 12 + 12) % 12

  // Walk N steps through palace number order (1→2→3→...→9, skip 5)
  let currentPalace = startPalace
  const walkOrder = isYangDun
    ? [1, 2, 3, 4, 6, 7, 8, 9] // ascending, skip 5
    : [9, 8, 7, 6, 4, 3, 2, 1] // descending, skip 5

  for (let s = 0; s < steps; s++) {
    const curIdx = walkOrder.indexOf(currentPalace)
    currentPalace = walkOrder[(curIdx + 1) % walkOrder.length]
  }

  const targetGatePalace = currentPalace

  // Rotate gate ring: duty gate moves to target palace
  const dutyGateIndex = GATE_RING.indexOf(duty.dutyGate)
  const fromRingIndex = RING_PALACES.indexOf(duty.dutyPalace)
  const toRingIndex = RING_PALACES.indexOf(targetGatePalace)
  const offset = toRingIndex - fromRingIndex

  // Gates always rotate clockwise regardless of yin/yang dun
  const rotatedGates = rotateRing(GATE_RING, -offset + dutyGateIndex)

  const gatePlate = {}
  for (let i = 0; i < 8; i++) {
    gatePlate[RING_PALACES[i]] = rotatedGates[i]
  }

  return { gatePlate, targetGatePalace }
}

/**
 * Step 6: 排神盘 — Rotate Eight Gods (小值符追大值符)
 */
function buildGodPlate(heavenTargetPalace, isYangDun) {
  // 值符 god goes to same palace as the 值符 star (heaven target)
  const startRingIndex = RING_PALACES.indexOf(heavenTargetPalace)

  const godPlate = {}
  for (let i = 0; i < 8; i++) {
    let ringIndex
    if (isYangDun) {
      ringIndex = (startRingIndex + i) % 8 // clockwise
    } else {
      ringIndex = ((startRingIndex - i) % 8 + 8) % 8 // counter-clockwise
    }
    godPlate[RING_PALACES[ringIndex]] = GOD_RING[i]
  }

  return { godPlate }
}

/**
 * Calculate 空亡 (void) branches for the current hour's 旬
 */
function calcKongWang(hourGZ) {
  const idx = JIA_ZI_TABLE.indexOf(hourGZ)
  if (idx === -1) return []
  const xunStart = idx - (idx % 10)
  // The two branches not covered in this 旬 (10 stems vs 12 branches)
  const branch1 = DI_ZHI[(xunStart + 10) % 12]
  const branch2 = DI_ZHI[(xunStart + 11) % 12]
  return [branch1, branch2]
}

/**
 * Main entry: generate complete qimen chart.
 * @param {Date} date - the datetime for the chart
 * @returns full chart object
 */
export function generateQimenChart(date) {
  const ganZhi = getGanZhi(date)
  const { isYangDun, juNum, currentTerm, yuan } = determineJu(date, ganZhi)

  const hourGZ = ganZhi.hourFull
  const hourStem = ganZhi.hour.stem
  const hourBranch = ganZhi.hour.branch

  // Step 2: Earth plate
  const earthPlate = buildEarthPlate(isYangDun, juNum)

  // Step 3: Duty star and gate
  const duty = findDutyStarAndGate(earthPlate, hourGZ)

  // Step 4: Heaven plate (stars)
  const { starPlate, heavenStems, targetPalace } = buildHeavenPlate(
    earthPlate, duty, hourStem, isYangDun
  )

  // Step 5: Human plate (gates)
  const { gatePlate } = buildHumanPlate(
    earthPlate, duty, hourBranch, duty.xunShou, isYangDun
  )

  // Step 6: God plate
  const { godPlate } = buildGodPlate(targetPalace, isYangDun)

  // 空亡
  const kongWang = calcKongWang(hourGZ)

  // Assemble palace data
  const palaces = {}
  for (let p = 1; p <= 9; p++) {
    palaces[p] = {
      number: p,
      name: PALACE_NAMES[p],
      element: PALACE_ELEMENTS[p],
      earthStem: earthPlate[p],
      heavenStem: heavenStems[p] || null,
      star: starPlate[p] || (p === 5 ? '天禽' : null),
      gate: gatePlate[p] || null,
      god: godPlate[p] || null,
    }
  }

  return {
    // Input info
    dateTime: date,
    ganZhi,
    // Ju info
    isYangDun,
    juNum,
    currentTerm,
    yuan,
    // Duty
    dutyStar: duty.dutyStar,
    dutyGate: duty.dutyGate,
    xunShou: duty.xunShou,
    kongWang,
    // Palaces
    palaces,
  }
}
```

**Step 2: Commit**

```bash
git add qimen/src/core/qimen.js
git commit -m "feat(qimen): implement six-step qimen calculation algorithm"
```

---

### Task 6: Implement Vue composable and TimeInput component

**Files:**
- Create: `qimen/src/composables/useQimen.js`
- Create: `qimen/src/components/TimeInput.vue`

**Step 1: Create `useQimen.js`**

```js
import { ref, computed, watchEffect } from 'vue'
import { generateQimenChart } from '../core/qimen'
import { calcTrueSolarTime, calcSunriseSunset, calcUnequalShichen, findShichen } from '@shared/true-solar-time'

export function useQimen() {
  const city = ref({ name: '北京', lng: 116.41, lat: 39.90, tz: 8 })
  const dateTime = ref(new Date())
  const useTrueSolar = ref(true)

  const chart = computed(() => {
    const dt = dateTime.value
    if (!dt || isNaN(dt.getTime())) return null

    let effectiveDate = dt

    if (useTrueSolar.value) {
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
      const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`

      const tst = calcTrueSolarTime(dateStr, timeStr, city.value.lng, city.value.tz)

      // Create a new date with true solar time
      effectiveDate = new Date(dt)
      effectiveDate.setHours(tst.hours, tst.minutes, 0, 0)
    }

    try {
      return generateQimenChart(effectiveDate)
    } catch (e) {
      console.error('Qimen calculation error:', e)
      return null
    }
  })

  // Initialize with current time
  function setNow() {
    dateTime.value = new Date()
  }

  return { city, dateTime, useTrueSolar, chart, setNow }
}
```

**Step 2: Create `TimeInput.vue`**

City selector + datetime input component. Uses `@shared/cities` for city data. Defaults to current time. City search with dropdown (same pattern as TrueSolarTime.vue).

Key features:
- Date input defaults to today
- Time input defaults to now
- City search with dropdown (reuses CITIES data)
- Shows selected city name and true solar time correction info
- "当前时间" button to reset to now

**Step 3: Commit**

```bash
git add qimen/src/composables/ qimen/src/components/TimeInput.vue
git commit -m "feat(qimen): add useQimen composable and TimeInput component"
```

---

### Task 7: Implement Nine Grid UI components

**Files:**
- Create: `qimen/src/components/PalaceCell.vue`
- Create: `qimen/src/components/CenterCell.vue`
- Create: `qimen/src/components/NineGrid.vue`

**Step 1: Create `PalaceCell.vue`**

Displays a single palace cell with (top to bottom):
- 八神 name (small, muted color)
- 九星 name + 天盘天干 (star in distinct color)
- 八门 name (gate in distinct color)
- 地盘天干 (bottom, earth stem)
- 宫位名 (very small, bottom corner)

Design follows Chinese ink-painting aesthetic: `#faf6ef` bg, `#8b2500` accents, `#d4c5a9` borders.

**Step 2: Create `CenterCell.vue`**

Center palace (中五宫) shows summary info:
- 阳遁/阴遁 X 局
- 节气 + 元（上/中/下）
- 值符星 / 值使门
- 旬首
- 空亡
- 天禽星（寄坤二宫）

**Step 3: Create `NineGrid.vue`**

3x3 CSS grid layout using `PALACE_GRID` for positioning. Renders `PalaceCell` for outer 8 palaces and `CenterCell` for palace 5.

Layout matches 洛书:
```
巽4  离9  坤2
震3  中5  兑7
艮8  坎1  乾6
```

**Step 4: Commit**

```bash
git add qimen/src/components/PalaceCell.vue qimen/src/components/CenterCell.vue qimen/src/components/NineGrid.vue
git commit -m "feat(qimen): add nine grid UI components"
```

---

### Task 8: Assemble Paipan main view

**Files:**
- Create: `qimen/src/views/Paipan.vue`
- Modify: `qimen/src/App.vue`

**Step 1: Create `Paipan.vue`**

Main view that combines:
- `TimeInput` component at top (city selector, date/time, "当前时间" button)
- Display of 四柱 (年柱/月柱/日柱/时柱) in a horizontal bar
- `NineGrid` component showing the full chart
- AI 解读 button at bottom

**Step 2: Update `App.vue`**

Replace placeholder content with `<Paipan />` component.

**Step 3: Verify dev server**

Run: `cd /Volumes/T7/work/zhouyi/qimen && npm run dev`
Test: Open browser, verify chart renders with current time

**Step 4: Commit**

```bash
git add qimen/src/views/Paipan.vue qimen/src/App.vue
git commit -m "feat(qimen): assemble main paipan view"
```

---

### Task 9: Add AI interpretation

**Files:**
- Create: `functions/api/ai-qimen.js`
- Create: `qimen/src/composables/useAiInterpret.js`
- Create: `qimen/src/components/AiInterpret.vue`

**Step 1: Create `functions/api/ai-qimen.js`**

Copy from `functions/api/ai-ziwei.js`, modify:
- Rate limit key: `ratelimit:qimen:${ip}`
- System prompt: 奇门遁甲 specific interpretation prompt covering:
  - 整体格局判断（伏吟、反吟、八门反伏等）
  - 用神分析（根据所问事项）
  - 天地人神四层分析
  - 九星、八门、八神含义解读
  - 三奇六仪组合分析
  - 空亡、入墓等特殊情况

**Step 2: Create `useAiInterpret.js`**

Simplified version of Astrology's `useAiInterpret.js`:
- `collectChartInfo(chart)` — serialize qimen chart to text
- `startAiInterpret(chartInfo, question)` — SSE streaming to `/api/ai-qimen`
- `simpleMarkdown(text)` — reuse same markdown renderer

**Step 3: Create `AiInterpret.vue`**

Modal dialog with:
- Optional question input
- Streaming AI response display
- Loading/error states
- Close button

**Step 4: Wire AI button into Paipan.vue**

Add AI 解读 button that opens the modal.

**Step 5: Commit**

```bash
git add functions/api/ai-qimen.js qimen/src/composables/useAiInterpret.js qimen/src/components/AiInterpret.vue qimen/src/views/Paipan.vue
git commit -m "feat(qimen): add AI interpretation with Gemini streaming"
```

---

### Task 10: Update homepage, build.sh, and SEO

**Files:**
- Modify: `index.html` (add 奇门遁甲 nav link)
- Modify: `style.css` (adjust layout for 3 items if needed)
- Modify: `build.sh` (add qimen build step)
- Modify: `sitemap.xml` (add /qimen/)
- Modify: `llms.txt` (add qimen description)

**Step 1: Update `index.html`**

Add third nav link:
```html
<nav class="entries">
  <a href="/astrology/">紫微斗数</a>
  <a href="/hexagram/">六爻占卜</a>
  <a href="/qimen/">奇门遁甲</a>
</nav>
```

**Step 2: Update `build.sh`**

Add after hexagram build:
```bash
# Build qimen
cd qimen
npm install
npm run build
cd ..
cp -r qimen/dist dist/qimen
```

**Step 3: Update `sitemap.xml`**

Add `<url><loc>https://zhouyi.goblin.top/qimen/</loc></url>`

**Step 4: Update `llms.txt`**

Add qimen module description.

**Step 5: Full build test**

Run: `bash build.sh`
Expected: Build succeeds, `dist/qimen/` contains the built app

**Step 6: Commit**

```bash
git add index.html style.css build.sh sitemap.xml llms.txt
git commit -m "feat: add qimen to homepage, build system, and SEO"
```

---

### Task 11: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

Add qimen module documentation:
- Sub-app entry in overview
- Dev command: `cd qimen && npm run dev`
- Architecture section for qimen
- Shared module documentation

**Step 1: Update and commit**

```bash
git add CLAUDE.md
git commit -m "docs: add qimen module to CLAUDE.md"
```
