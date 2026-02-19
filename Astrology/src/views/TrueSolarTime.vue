<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTrueSolarTime, formatTime } from '../composables/useTrueSolarTime'
import { CITIES } from '../data/cities'

const { dateStr, timeStr, longitude, latitude, timezone, result } = useTrueSolarTime()

const gender = ref('男')

// City search
const cityQuery = ref('')
const selectedCityName = ref('')
const showDropdown = ref(false)
const filteredCities = ref([])

function onCityInput() {
  const q = cityQuery.value.trim()
  if (!q) {
    filteredCities.value = []
    showDropdown.value = false
    return
  }
  const qLower = q.toLowerCase()
  filteredCities.value = CITIES.filter(
    c => c.name.includes(q) || c.nameEn.toLowerCase().includes(qLower)
  ).slice(0, 10)
  showDropdown.value = filteredCities.value.length > 0
}

function selectCity(city) {
  longitude.value = city.lng
  latitude.value = city.lat
  timezone.value = city.tz
  selectedCityName.value = city.name
  cityQuery.value = ''
  showDropdown.value = false
}

function handleClickOutside(e) {
  const el = document.querySelector('.city-search-wrapper')
  if (el && !el.contains(e.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Initialize date to today
  const now = new Date()
  const y = now.getFullYear()
  const mo = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  dateStr.value = `${y}-${mo}-${d}`
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  timeStr.value = `${h}:${m}`
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Timezone options
const timezoneOptions = []
for (let tz = -12; tz <= 14; tz += 0.5) {
  const sign = tz >= 0 ? '+' : ''
  const label = Number.isInteger(tz) ? `UTC${sign}${tz}` : `UTC${sign}${tz}`
  timezoneOptions.push({ value: tz, label })
}

function formatDiff(val) {
  const sign = val >= 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}分钟`
}

// Map shichen to paipan timeIndex
const BRANCH_TO_TIME_INDEX = { '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5, '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11 }

function getPaipanLink() {
  if (!result.value || !result.value.currentShichen) return null
  const sc = result.value.currentShichen
  let timeIndex
  if (sc.subBranch === '晚子') {
    timeIndex = 0
  } else if (sc.subBranch === '早子') {
    timeIndex = 12
  } else {
    timeIndex = BRANCH_TO_TIME_INDEX[sc.branch]
  }
  return `/?date=${dateStr.value}&time=${timeIndex}&gender=${gender.value === '男' ? '1' : '0'}`
}
</script>

<template>
  <div class="tst-page">
    <!-- Input Section -->
    <div class="form-section">
      <h2 class="section-title">真太阳时计算</h2>

      <div class="form-row">
        <span class="label-text">日期</span>
        <input type="date" v-model="dateStr" class="form-input" />
      </div>

      <div class="form-row">
        <span class="label-text">时间</span>
        <input type="time" v-model="timeStr" class="form-input" />
      </div>

      <div class="form-row">
        <span class="label-text">出生地</span>
        <div class="city-search-wrapper">
          <div class="city-input-row">
            <input
              type="text"
              v-model="cityQuery"
              @input="onCityInput"
              @focus="onCityInput"
              placeholder="搜索城市..."
              class="form-input"
            />
            <span v-if="selectedCityName" class="selected-city">{{ selectedCityName }}</span>
          </div>
          <ul v-if="showDropdown" class="city-dropdown">
            <li
              v-for="city in filteredCities"
              :key="city.nameEn + city.lng"
              @mousedown.prevent="selectCity(city)"
            >
              {{ city.name }}
              <span class="city-en">{{ city.nameEn }}</span>
              <span class="city-province" v-if="city.province">{{ city.province }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="form-row">
        <span class="label-text">经度</span>
        <input type="number" v-model.number="longitude" step="0.01" class="form-input coord-input" />
        <span class="label-text">纬度</span>
        <input type="number" v-model.number="latitude" step="0.01" class="form-input coord-input" />
      </div>

      <div class="form-row">
        <span class="label-text">时区</span>
        <select v-model.number="timezone" class="form-input">
          <option v-for="opt in timezoneOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

    </div>

    <!-- Result Section -->
    <div v-if="result" class="form-section result-section">
      <!-- Polar warning -->
      <div v-if="result.polarCondition" class="polar-warning">
        极地区域，无法计算日出日落和不等分时辰
      </div>

      <!-- Main result -->
      <div class="main-result">
        <div class="shichen-name" v-if="result.currentShichen">{{ result.currentShichen.name }}</div>
        <div class="tst-label">真太阳时</div>
        <div class="tst-time">{{ formatTime(result.trueSolarTime.hours, result.trueSolarTime.minutes) }}</div>
        <div v-if="getPaipanLink()" class="paipan-action">
          <div class="gender-row">
            <label class="gender-toggle" :class="{ active: gender === '男' }">
              <input type="radio" v-model="gender" value="男" />♂ 男
            </label>
            <label class="gender-toggle" :class="{ active: gender === '女' }">
              <input type="radio" v-model="gender" value="女" />♀ 女
            </label>
          </div>
          <RouterLink :to="getPaipanLink()" class="btn-paipan">用此时辰排盘</RouterLink>
        </div>
      </div>

      <!-- Detail cards -->
      <div class="detail-grid">
        <div class="detail-card" v-if="result.sunrise">
          <div class="detail-label">日出时间</div>
          <div class="detail-value">{{ formatTime(result.sunrise.h, result.sunrise.m) }}</div>
        </div>
        <div class="detail-card" v-if="result.sunset">
          <div class="detail-label">日落时间</div>
          <div class="detail-value">{{ formatTime(result.sunset.h, result.sunset.m) }}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">地理时差</div>
          <div class="detail-value">{{ formatDiff(result.geoDiff) }}</div>
        </div>
        <div class="detail-card">
          <div class="detail-label">均时差</div>
          <div class="detail-value">{{ formatDiff(result.eot) }}</div>
        </div>
        <div class="detail-card" v-if="result.longestShichenMin != null">
          <div class="detail-label">最长时辰</div>
          <div class="detail-value">约{{ result.longestShichenMin }}分钟</div>
        </div>
        <div class="detail-card" v-if="result.shortestShichenMin != null">
          <div class="detail-label">最短时辰</div>
          <div class="detail-value">约{{ result.shortestShichenMin }}分钟</div>
        </div>
      </div>

      <!-- Shichen table -->
      <div v-if="result.shichenTable" class="shichen-table-wrapper">
        <h3 class="section-title sub-title">十三时辰对照表</h3>
        <table class="shichen-table">
          <thead>
            <tr>
              <th>时辰</th>
              <th>起始</th>
              <th>结束</th>
              <th>时长</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sc in result.shichenTable"
              :key="sc.name"
              :class="{ 'current-row': result.currentShichen && sc.name === result.currentShichen.name }"
            >
              <td class="sc-name">{{ sc.name }}</td>
              <td>{{ formatTime(sc.start.h, sc.start.m) }}</td>
              <td>{{ formatTime(sc.end.h, sc.end.m) }}</td>
              <td>{{ sc.durationMin }}分</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tst-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 0.8em 2em;
}

.form-section {
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
}

.section-title {
  color: #8b2500;
  font-size: 1.3em;
  margin: 0.5em 0;
  padding-left: 0.5em;
  border-left: 3px solid #8b2500;
}

.sub-title {
  font-size: 1.1em;
  margin-top: 1em;
}

.form-row {
  margin: 0.6em 0;
  display: flex;
  align-items: center;
  gap: 0.8em;
}

.label-text {
  color: #3c2415;
  min-width: 3em;
  flex-shrink: 0;
}

.form-input {
  font-family: inherit;
  font-size: 1em;
  padding: 0.4em 0.6em;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  background: #faf6ef;
  color: #3c2415;
  flex: 1;
  max-width: 280px;
}

.coord-input {
  max-width: 120px;
}

/* City search */
.city-search-wrapper {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.city-input-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.city-input-row .form-input {
  max-width: none;
  flex: 1;
}

.selected-city {
  color: #8b2500;
  font-weight: 500;
  white-space: nowrap;
}

.city-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  margin-top: 2px;
  padding: 0;
  list-style: none;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.city-dropdown li {
  padding: 0.5em 0.8em;
  cursor: pointer;
  border-bottom: 1px solid #efe8d8;
  color: #3c2415;
  font-size: 0.95em;
}

.city-dropdown li:last-child {
  border-bottom: none;
}

.city-dropdown li:hover {
  background: #f5ede0;
}

.city-en {
  color: #9a8c7a;
  font-size: 0.85em;
  margin-left: 0.5em;
}

.city-province {
  color: #9a8c7a;
  font-size: 0.85em;
  margin-left: 0.3em;
}

.city-province::before {
  content: '·';
  margin-right: 0.3em;
}

/* Result section */
.result-section {
  text-align: center;
}

.polar-warning {
  background: #fff3e0;
  color: #b36200;
  padding: 0.8em;
  border-radius: 6px;
  margin-bottom: 1em;
  font-size: 0.95em;
}

.main-result {
  padding: 1.2em 0;
  margin-bottom: 0.5em;
}

.shichen-name {
  font-size: 1.8em;
  color: #8b2500;
  font-weight: 700;
  margin-bottom: 0.1em;
}

.tst-label {
  font-size: 0.9em;
  color: #9a8c7a;
}

.tst-time {
  font-size: 2.4em;
  color: #3c2415;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.paipan-action {
  margin-top: 0.8em;
}

.gender-row {
  display: inline-flex;
  gap: 0.5em;
  margin-bottom: 0.6em;
}

.gender-toggle {
  display: inline-block;
  padding: 0.3em 1em;
  border: 1px solid #d4c5a9;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.95em;
  color: #3c2415;
  transition: all 0.2s;
}

.gender-toggle input { display: none; }
.gender-toggle:hover { border-color: #8b2500; }
.gender-toggle.active { background: #8b2500; color: #fff; border-color: #8b2500; }

.btn-paipan {
  display: inline-block;
  background: #8b2500;
  color: #fff;
  border: none;
  padding: 0.5em 1.5em;
  border-radius: 15px;
  font-size: 1em;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
}

.btn-paipan:hover {
  background: #a03000;
}

/* Detail cards */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6em;
  margin: 1em 0;
}

.detail-card {
  background: #faf6ef;
  border: 1px solid #efe8d8;
  border-radius: 6px;
  padding: 0.6em 0.4em;
}

.detail-label {
  font-size: 0.8em;
  color: #9a8c7a;
  margin-bottom: 0.2em;
}

.detail-value {
  font-size: 1em;
  color: #3c2415;
  font-weight: 500;
}

/* Shichen table */
.shichen-table-wrapper {
  margin-top: 1em;
  text-align: left;
}

.shichen-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5em;
  font-size: 0.95em;
}

.shichen-table th {
  background: #faf6ef;
  color: #8b2500;
  padding: 0.5em 0.6em;
  border-bottom: 2px solid #d4c5a9;
  font-weight: 600;
  text-align: center;
}

.shichen-table td {
  padding: 0.45em 0.6em;
  border-bottom: 1px solid #efe8d8;
  text-align: center;
  color: #3c2415;
}

.shichen-table .sc-name {
  font-weight: 500;
}

.shichen-table .current-row {
  background: #fff3e0;
}

.shichen-table .current-row .sc-name {
  color: #8b2500;
  font-weight: 700;
}

/* Mobile responsive */
@media (max-width: 500px) {
  .form-row {
    flex-wrap: wrap;
  }

  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .coord-input {
    max-width: 100px;
  }

  .tst-time {
    font-size: 2em;
  }

  .shichen-name {
    font-size: 1.5em;
  }

  .shichen-table {
    font-size: 0.85em;
  }

  .shichen-table th,
  .shichen-table td {
    padding: 0.4em 0.3em;
  }
}
</style>
