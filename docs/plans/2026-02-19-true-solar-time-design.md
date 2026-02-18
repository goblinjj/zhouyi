# 真太阳时计算工具 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在紫微斗数模块中新增独立的"真太阳时"计算工具页，支持全球城市，使用日出日落不等分时辰体系。

**Architecture:** 纯前端计算，新增一个 Vue 页面组件 + composable 计算模块 + 内置全球城市数据。计算逻辑使用 Spencer 1971 均时差公式和标准天文日出日落算法。

**Tech Stack:** Vue 3 Composition API, Vue Router, 纯 JS 天文计算

---

### Task 1: 创建全球城市数据

**Files:**
- Create: `Astrology/src/data/cities.js`

**Step 1: 创建城市数据文件**

创建 `Astrology/src/data/cities.js`，导出全球城市数组。每个城市包含：
- `name`: 中文名
- `nameEn`: 英文名
- `country`: 国家
- `province`: 省/州（可选）
- `lng`: 经度
- `lat`: 纬度
- `tz`: UTC 偏移（小时）

数据范围：
- 中国：所有省会 + 主要地级市（300+ 个）
- 全球：各国首都 + 主要城市（700+ 个）

格式示例：
```js
export const CITIES = [
  { name: '北京', nameEn: 'Beijing', country: '中国', province: '北京', lng: 116.407, lat: 39.904, tz: 8 },
  { name: '伦敦', nameEn: 'London', country: '英国', province: '', lng: -0.1276, lat: 51.5074, tz: 0 },
  // ...
]
```

**Step 2: Commit**

```bash
git add Astrology/src/data/cities.js
git commit -m "feat: add global cities data for true solar time"
```

---

### Task 2: 创建真太阳时计算模块

**Files:**
- Create: `Astrology/src/composables/useTrueSolarTime.js`

**Step 1: 实现计算函数**

创建 `Astrology/src/composables/useTrueSolarTime.js`，导出以下函数：

1. `equationOfTime(dayOfYear)` - Spencer 1971 均时差公式，返回分钟
2. `geographicTimeDiff(longitude, timezoneOffset)` - 地理时差，返回分钟
3. `trueSolarTime(date, time, longitude, timezoneOffset)` - 真太阳时
4. `sunriseSunset(date, latitude, longitude, timezoneOffset)` - 日出日落时刻
5. `unequalShichen(sunrise, sunset)` - 不等分12时辰起止时间表
6. `findShichen(trueSolarTime, shichenTable)` - 判定真太阳时所属时辰
7. `useTrueSolarTime()` - Vue composable，包装响应式状态和计算

核心公式：

**均时差：**
```js
function equationOfTime(dayOfYear) {
  const B = 2 * Math.PI * (dayOfYear - 1) / 365
  return 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
    - 0.014615 * Math.cos(2 * B) - 0.04089 * Math.sin(2 * B))
}
```

**日出日落：**
```js
function sunriseSunset(date, lat, lng, tz) {
  // 1. 计算 dayOfYear
  // 2. 太阳赤纬 declination
  // 3. 时角 hourAngle = acos(-tan(lat)*tan(decl)) 修正大气折射 -0.833°
  // 4. 日出 = 12 - hourAngle/15 + 均时差修正 + 经度修正
  // 5. 日落 = 12 + hourAngle/15 + 均时差修正 + 经度修正
}
```

**不等分时辰：**
- 日出 = 卯时起点，日落 = 酉时起点
- 白天每个时辰 = (日落 - 日出) / 6
- 夜晚每个时辰 = (24h - 白天时长) / 6
- 时辰顺序：子丑寅 | 卯辰巳午未申 | 酉戌亥
- 注意子时跨午夜需特殊处理

**Step 2: Commit**

```bash
git add Astrology/src/composables/useTrueSolarTime.js
git commit -m "feat: add true solar time calculation module"
```

---

### Task 3: 创建真太阳时页面组件

**Files:**
- Create: `Astrology/src/views/TrueSolarTime.vue`

**Step 1: 创建页面组件**

创建 `Astrology/src/views/TrueSolarTime.vue`，包含：

**输入区域：**
- 日期选择：`<input type="date">`
- 时间输入：`<input type="time">`
- 城市搜索：文本输入框 + 模糊匹配下拉列表（支持中文名/英文名搜索）
- 经度/纬度：数字输入（城市选中后自动填充，也可手动修改）
- 时区选择：下拉框（UTC-12 到 UTC+14）
- "读取位置"按钮：调用 `navigator.geolocation.getCurrentPosition()`
- "计算"按钮

**结果展示区域：**
- 主结果：所属时辰（大号显示）+ 真太阳时
- 详细信息：日出、日落、地理时差、均时差、白天/夜晚时辰时长
- 12时辰对照表：表格显示当日每个时辰的起止时间

**UI风格：**
- 复用现有样式模式：`.form-section`、`.section-title`、`.form-row`、`.label-text`、`.form-input`、`.gender-toggle`、`.btn-generate` 等
- 配色：`#fffcf5` 背景、`#8b2500` 主色调、`#d4c5a9` 边框

**Step 2: Commit**

```bash
git add Astrology/src/views/TrueSolarTime.vue
git commit -m "feat: add true solar time page component"
```

---

### Task 4: 添加路由和导航

**Files:**
- Modify: `Astrology/src/router/index.js`
- Modify: `Astrology/src/App.vue`
- Modify: `Astrology/src/views/Paipan.vue`

**Step 1: 添加路由**

在 `Astrology/src/router/index.js` 的 routes 数组中添加：
```js
{
  path: '/true-solar-time',
  name: '真太阳时',
  component: () => import('../views/TrueSolarTime.vue')
}
```

**Step 2: 更新 App.vue 导航栏**

在 `Astrology/src/App.vue` 的 `<nav>` 中，在"典籍"链接之后添加：
```html
<RouterLink class="routelink" to="/true-solar-time">真太阳时</RouterLink>
```

**Step 3: 更新 Paipan.vue compact 导航**

在 `Astrology/src/views/Paipan.vue` 的 `.compact-nav` 中，在"典籍"链接之后添加：
```html
<RouterLink class="compact-navlink" to="/true-solar-time">真太阳时</RouterLink>
```

**Step 4: Commit**

```bash
git add Astrology/src/router/index.js Astrology/src/App.vue Astrology/src/views/Paipan.vue
git commit -m "feat: add true solar time route and navigation links"
```

---

### Task 5: 验证和调试

**Step 1: 启动开发服务器**

```bash
cd Astrology && pnpm dev
```

**Step 2: 验证功能**

- 导航栏显示"真太阳时"链接
- 点击进入真太阳时页面
- 选择城市、输入日期时间，计算结果正确
- "读取位置"按钮正常工作
- 手动修改经纬度/时区后重新计算
- 从排盘页面的 compact 导航可跳转
- 已知数据验证：北京 2024-03-20 12:00 的真太阳时约为 11:46（地理时差约-14.4分，均时差约-7.5分）

**Step 3: Final commit if any fixes**

```bash
git add -A && git commit -m "fix: true solar time adjustments"
```
