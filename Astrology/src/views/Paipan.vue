<script setup>
import { ref, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { astro } from 'iztro'

const setNavVisible = inject('setNavVisible')

onBeforeRouteLeave(() => { setNavVisible(true); document.title = '紫微斗数' })
onUnmounted(() => { setNavVisible(true) })

import { TIME_OPTIONS, SCOPE_COLORS, gridStyle } from '../composables/usePaipanConstants'
import { useHoroscope } from '../composables/useHoroscope'
import PalaceCell from '../components/PalaceCell.vue'
import CenterInfo from '../components/CenterInfo.vue'
import HoroscopePanel from '../components/HoroscopePanel.vue'
import Popup from '../views/Popup.vue'
import starData from '@/data/index'

const route = useRoute()
const router = useRouter()

// ===== Form State =====
const date = ref('')
const timeIndex = ref(0)
const gender = ref('男')
const config = ref({
  yearDivide: 'exact',
  fixLeap: true,
})
const astrolabe = ref(null)
const showSettings = ref(false)

// ===== Horoscope Composable =====
const {
  horoscopeData, selectedPalaceIdx,
  selDecadal, selYear, selMonth,
  fourPillars, derivedNames, flyingSihuaBg,
  decadalList, yearList, flowStarsByPalace,
  getStarMutagens, resetSelections, clickPalace,
  isSanfang, isSelected, autoSelectLifePalace,
  selectDecadal, selectYear, selectMonth,
} = useHoroscope(astrolabe)

// ===== Methods =====
function generate() {
  if (!date.value) return
  astrolabe.value = astro.withOptions({
    type: 'solar',
    dateStr: date.value,
    timeIndex: timeIndex.value,
    gender: gender.value,
    config: { yearDivide: config.value.yearDivide, horoscopeDivide: config.value.yearDivide },
    fixLeap: config.value.fixLeap,
  })
  resetSelections()
  autoSelectLifePalace()
  router.replace({ query: { date: date.value, time: String(timeIndex.value), gender: gender.value === '男' ? '1' : '0' } })
  const timeLabel = TIME_OPTIONS.find(t => t.value === timeIndex.value)?.label.split(' ')[0] || ''
  document.title = `${date.value} ${timeLabel} ${gender.value} - 紫微斗数`
}

const history = ref([])
const showHistory = ref(false)

function loadHistory() {
  try {
    const saved = localStorage.getItem('paipan_history')
    if (saved) {
      history.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load history', e)
  }
}

function saveHistory() {
  const newItem = {
    date: date.value,
    timeIndex: timeIndex.value,
    gender: gender.value,
    config: { ...config.value },
    timestamp: Date.now(),
  }
  
  // Deduplicate: Check if latest is same
  if (history.value.length > 0) {
    const latest = history.value[0]
    if (latest.date === newItem.date && 
        latest.timeIndex === newItem.timeIndex && 
        latest.gender === newItem.gender &&
        JSON.stringify(latest.config) === JSON.stringify(newItem.config)) {
      return
    }
  }

  history.value.unshift(newItem)
  if (history.value.length > 10) {
    history.value.pop()
  }
  
  try {
    localStorage.setItem('paipan_history', JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history', e)
  }
}

function deleteHistoryItem(index) {
  history.value.splice(index, 1)
  saveHistoryToStorage()
}

const clearConfirming = ref(false)

function clearHistory() {
  if (clearConfirming.value) {
    history.value = []
    localStorage.removeItem('paipan_history')
    clearConfirming.value = false
  } else {
    clearConfirming.value = true
    setTimeout(() => {
      clearConfirming.value = false
    }, 3000)
  }
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem('paipan_history', JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history', e)
  }
}

function restoreHistory(item) {
  date.value = item.date
  timeIndex.value = item.timeIndex
  gender.value = item.gender
  if (item.config) {
    config.value = { ...item.config }
  }
  showHistory.value = false
  // generate() will be triggered by watcher
}

function formatHistoryTime(ts) {
  return new Date(ts).toLocaleString()
}

// ===== Auto-generate from URL query params =====
// Usage: /?date=2026-02-15&time=0&gender=男
onMounted(() => {
  loadHistory()
  const q = route.query
  if (q.date) {
    date.value = q.date
    if (q.time != null) timeIndex.value = Number(q.time)
    if (q.gender != null) {
      const g = q.gender
      gender.value = (g === '女' || g === '0') ? '女' : '男'
    }
    generate()
  }
})

watch([date, timeIndex, gender, config], () => {
  if (astrolabe.value) {
    generate()
    router.replace({ query: { date: date.value, time: String(timeIndex.value), gender: gender.value === '男' ? '1' : '0' } })
  }
}, { deep: true })

// Hide App nav when chart is shown
watch(astrolabe, (val) => {
  if (val) setNavVisible(false)
})

function adjustDate(field, delta) {
  if (!date.value) return
  if (field === 'hour') {
    // Cycle timeIndex 0-12
    timeIndex.value = ((timeIndex.value + delta) % 13 + 13) % 13
  } else {
    const d = new Date(date.value)
    if (field === 'year') d.setFullYear(d.getFullYear() + delta)
    else if (field === 'month') d.setMonth(d.getMonth() + delta)
    else if (field === 'day') d.setDate(d.getDate() + delta)
    date.value = d.toISOString().slice(0, 10)
  }
  generate()
}

function getPalaceScopes(p) {
  return {
    decadal: selDecadal.value && horoscopeData.value?.decadal?.palaceNames
      ? horoscopeData.value.decadal.palaceNames[p.index] : '',
    yearly: selYear.value && horoscopeData.value?.yearly?.palaceNames
      ? horoscopeData.value.yearly.palaceNames[p.index] : '',
    monthly: selMonth.value && horoscopeData.value?.monthly?.palaceNames
      ? horoscopeData.value.monthly.palaceNames[p.index] : '',
  }
}

const currentStar = ref({})

// Mapping for paired stars that are stored together in data
const STAR_MAPPING = {
  '左辅': '辅弼',
  '右弼': '辅弼',
  '文昌': '昌曲',
  '文曲': '昌曲',
  '天魁': '魁钺',
  '天钺': '魁钺',
}

function handleStarClick(name) {
  let searchName = name
  if (STAR_MAPPING[name]) {
    searchName = STAR_MAPPING[name]
  }
  
  const found = starData.find(s => s.title === searchName)
  if (found) {
    currentStar.value = found
  }
}
</script>

<template>
  <div class="paipan-page">
    <!-- Full Form -->
    <div class="form-section" v-if="!astrolabe">
      <h2 class="section-title">紫微斗数排盘</h2>
      <div class="form-row">
        <span class="label-text">出生日期</span>
        <input type="date" v-model="date" class="form-input" />
      </div>
      <div class="form-row">
        <span class="label-text">出生时辰</span>
        <select v-model="timeIndex" class="form-input">
          <option v-for="t in TIME_OPTIONS" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div class="form-row">
        <span class="label-text">性别</span>
        <label class="gender-toggle" :class="{ active: gender === '男' }">
          <input type="radio" v-model="gender" value="男" />♂ 男
        </label>
        <label class="gender-toggle" :class="{ active: gender === '女' }">
          <input type="radio" v-model="gender" value="女" />♀ 女
        </label>
      </div>
      <div class="form-row">
        <span class="label-text">年分界</span>
        <label class="gender-toggle" :class="{ active: config.yearDivide === 'normal' }">
          <input type="radio" v-model="config.yearDivide" value="normal" />按除夕
        </label>
        <label class="gender-toggle" :class="{ active: config.yearDivide === 'exact' }">
          <input type="radio" v-model="config.yearDivide" value="exact" />按立春
        </label>
      </div>
      <div class="form-row">
        <span class="label-text">闰月分界</span>
        <label class="gender-toggle" :class="{ active: config.fixLeap === false }">
          <input type="radio" v-model="config.fixLeap" :value="false" />算上月
        </label>
        <label class="gender-toggle" :class="{ active: config.fixLeap === true }">
          <input type="radio" v-model="config.fixLeap" :value="true" />月中分界
        </label>
      </div>
      <div class="form-row" style="justify-content: center; margin-top: 3.2em;">
        <button class="btn-generate" @click="generate">排盘</button>
      </div>
      <!-- History on home page -->
      <div v-if="history.length > 0" class="home-history">
        <div class="home-history-header">
          <span class="label-text">历史记录</span>
          <button class="btn-clear-history-sm" :class="{ 'btn-confirm-danger': clearConfirming }" @click.stop="clearHistory">
            {{ clearConfirming ? '确定清空?' : '清空' }}
          </button>
        </div>
        <div v-for="(item, idx) in history" :key="idx" class="history-item" @click="restoreHistory(item); generate()">
          <div class="h-main">
            <span class="h-date">{{ item.date }}</span>
            <span class="h-time">{{ TIME_OPTIONS.find(t => t.value === item.timeIndex)?.label }}</span>
            <span class="h-gender">{{ item.gender }}</span>
          </div>
          <button class="btn-delete-item" @click.stop="deleteHistoryItem(idx)" title="删除">×</button>
        </div>
      </div>
    </div>

    <!-- Compact Form -->
    <div v-if="astrolabe" class="compact-bar">
       <div style="display: flex; gap: 8px;">
         <button class="btn-toggle-settings" style="flex: 1" @click="showSettings = !showSettings">
           {{ showSettings ? '收起设置 ▲' : '展开设置 ▼' }}
         </button>
         <button class="btn-toggle-settings" style="flex: 1" @click="showHistory = !showHistory">
           历史记录 (临时) {{ showHistory ? '▲' : '▼' }}
         </button>
       </div>
       
       <!-- Settings Panel -->
       <div v-show="showSettings" class="form-compact">
      <nav class="compact-nav">
        <RouterLink class="compact-navlink" to="/">排盘</RouterLink>
        <RouterLink class="compact-navlink" to="/stars">星耀</RouterLink>
        <RouterLink class="compact-navlink" to="/dianji">典籍</RouterLink>
      </nav>
      <div class="fc-row" style="flex-wrap: wrap; gap: 6px;">
        <input type="date" v-model="date" class="form-input-sm" />
        <select v-model="timeIndex" class="form-input-sm">
          <option v-for="t in TIME_OPTIONS" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div class="fc-row" style="flex-wrap: wrap; gap: 6px;">
        <label class="gender-toggle" :class="{ active: gender === '男' }">
          <input type="radio" v-model="gender" value="男" />♂
        </label>
        <label class="gender-toggle" :class="{ active: gender === '女' }">
          <input type="radio" v-model="gender" value="女" />♀
        </label>
        
        <span class="fc-divider">|</span>
        
        <span class="label-text-sm">年分界:</span>
        <label class="gender-toggle" :class="{ active: config.yearDivide === 'normal' }">
          <input type="radio" v-model="config.yearDivide" value="normal" />除夕
        </label>
        <label class="gender-toggle" :class="{ active: config.yearDivide === 'exact' }">
          <input type="radio" v-model="config.yearDivide" value="exact" />立春
        </label>
        
        <span class="fc-divider">|</span>
        
        <span class="label-text-sm">闰月:</span>
        <label class="gender-toggle" :class="{ active: config.fixLeap === false }">
          <input type="radio" v-model="config.fixLeap" :value="false" />上月
        </label>
        <label class="gender-toggle" :class="{ active: config.fixLeap === true }">
          <input type="radio" v-model="config.fixLeap" :value="true" />中分
        </label>
      </div>
      </div>
      
      <!-- History Panel -->
      <div v-show="showHistory" class="history-panel">
        <div class="h-actions">
           <button class="btn-save-history" @click="saveHistory">💾 保存当前</button>
           <button class="btn-clear-history" :class="{ 'btn-confirm-danger': clearConfirming }" @click.stop="clearHistory">
             {{ clearConfirming ? '确定清空?' : '🗑️ 清空' }}
           </button>
        </div>
        <div v-if="history.length === 0" class="history-empty">暂无历史记录</div>
        <div v-for="(item, idx) in history" :key="idx" class="history-item" @click="restoreHistory(item)">
          <div class="h-main">
            <span class="h-date">{{ item.date }}</span>
            <span class="h-time">{{ TIME_OPTIONS.find(t => t.value === item.timeIndex)?.label }}</span>
            <span class="h-gender">{{ item.gender }}</span>
          </div>
          <button class="btn-delete-item" @click.stop="deleteHistoryItem(idx)" title="删除">×</button>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="astrolabe" class="chart-section">
      <div class="chart-grid">
        <!-- 12 Palaces -->
        <PalaceCell
          v-for="p in astrolabe.palaces" :key="p.index"
          :palace="p"
          :isSelected="isSelected(p)"
          :isSanfang="isSanfang(p)"
          :flyingSihuaBg="flyingSihuaBg"
          :flowStars="flowStarsByPalace[p.index]"
          :derivedName="derivedNames[p.index] || ''"
          :getStarMutagens="getStarMutagens"
          :decadalPalaceName="getPalaceScopes(p).decadal"
          :yearlyPalaceName="getPalaceScopes(p).yearly"
          :monthlyPalaceName="getPalaceScopes(p).monthly"
          @click="clickPalace"
          @click-star="handleStarClick"
        />

        <!-- Center Info -->
        <CenterInfo
          :astrolabe="astrolabe"
          :gender="gender"
          :timeIndex="timeIndex"
          :fourPillars="fourPillars"
          :horoscopeData="horoscopeData"
          :selYear="selYear"
          @adjust="adjustDate"
        />
      </div>

      <!-- Horoscope Bottom Panel -->
      <HoroscopePanel
        :decadalList="decadalList"
        :yearList="yearList"
        :selDecadal="selDecadal"
        :selYear="selYear"
        :selMonth="selMonth"
        @select-decadal="selectDecadal"
        @select-year="selectYear"
        @select-month="selectMonth"
      />
    </div>

    <!-- Star Details Popup -->
    <Popup v-model="currentStar" />
  </div>
</template>

<style scoped>
.paipan-page { max-width: 1080px; margin: 0 auto; padding: 0 0.3em; }

/* === Form === */
.form-section { background: #fffcf5; border: 1px solid #d4c5a9; border-radius: 8px; padding: 1em; margin-bottom: 1em; }
.section-title { color: #8b2500; font-size: 1.3em; margin: 0.5em 0; padding-left: 0.5em; border-left: 3px solid #8b2500; }
.form-row { margin: 0.6em 0; display: flex; align-items: center; gap: 0.8em; }
.label-text { color: #3c2415; min-width: 4.5em; }
.form-input { font-family: inherit; font-size: 1em; padding: 0.4em 0.6em; border: 1px solid #d4c5a9; border-radius: 6px; background: #faf6ef; color: #3c2415; flex: 1; max-width: 280px; }
.radio-label { color: #3c2415; cursor: pointer; }
.btn-generate { background: #8b2500; color: #fff; border: none; padding: 0.5em 2em; border-radius: 15px; font-size: 1.1em; font-family: inherit; cursor: pointer; }

/* Home history */
.home-history { margin-top: 1.5em; border-top: 1px solid #d4c5a9; padding-top: 0.8em; }
.home-history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5em; }
.btn-clear-history-sm {
  background: none; border: none; color: #999; cursor: pointer; font-size: 0.85em; font-family: inherit;
}
.btn-clear-history-sm:hover { color: #c41e3a; }
.btn-clear-history-sm.btn-confirm-danger { background: #c41e3a; color: #fff; font-weight: bold; padding: 0.2em 0.6em; border-radius: 4px; }

/* Compact nav inside settings */
.compact-nav {
  text-align: center;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d4c5a9;
  margin-bottom: 0.2em;
}
.compact-navlink {
  color: #3c2415;
  font-size: 1em;
  padding: 0.2em 0.6em;
  display: inline-block;
  letter-spacing: 0.1em;
  text-decoration: none;
}
.compact-navlink.router-link-active {
  color: #8b2500;
  border-bottom: 2px solid #8b2500;
}

/* Compact form */
.form-compact { display: flex; flex-direction: column; gap: 0.4em; padding: 0.4em; background: #fffcf5; border: 1px solid #d4c5a9; border-radius: 6px; margin-bottom: 0.5em; }
.fc-row { display: flex; align-items: center; gap: 0.4em; }
.fc-spacer { flex: 1; }
.form-input-sm { font-family: inherit; font-size: 0.85em; padding: 0.3em; border: 1px solid #d4c5a9; border-radius: 4px; background: #faf6ef; color: #3c2415; }
.gender-toggle {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 0.25em 0.7em; border: 1px solid #d4c5a9; border-radius: 14px;
  font-size: 0.85em; color: #3c2415; cursor: pointer;
  background: #faf6ef; transition: all 0.15s;
}
.gender-toggle input { display: none; }
.gender-toggle:hover { border-color: #8b2500; }
.gender-toggle.active { background: #8b2500; color: #fff; border-color: #8b2500; }
.btn-sm { background: #8b2500; color: #fff; border: none; padding: 0.3em 1em; border-radius: 10px; font-family: inherit; cursor: pointer; font-size: 0.85em; }
.label-text-sm { font-size: 0.85em; color: #3c2415; white-space: nowrap; margin-right: 0; }
.fc-divider { color: #d4c5a9; margin: 0 2px; }

/* Toggle Bar */
.compact-bar { margin-bottom: 0.5em; display: flex; flex-direction: column; align-items: stretch; }
.btn-toggle-settings {
  background: #faf6ef; border: 1px dashed #d4c5a9;
  color: #8b2500; cursor: pointer;
  padding: 0.3em; border-radius: 6px;
  font-size: 0.85em; text-align: center;
  transition: all 0.2s;
}
.btn-toggle-settings:hover { background: #fdfbf7; border-color: #8b2500; }

.history-panel {
  background: var(--color-background-soft);
  border: 1px solid #d4c5a9;
  border-top: none;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.history-item {
  padding: 8px 12px;
  border-bottom: 1px solid #d4c5a9;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}
.history-item:hover { background: var(--color-background-mute); }
.history-item:last-child { border-bottom: none; }
.h-main { display: flex; gap: 8px; font-weight: bold; color: #3c2415; align-items: center; font-size: 0.95em; }
.history-empty { padding: 12px; text-align: center; color: #999; font-size: 0.9em; }

.h-actions { 
  padding: 8px; 
  border-bottom: 1px solid #d4c5a9; 
  background: var(--color-background-mute);
  display: flex;
  gap: 8px;
}
.btn-save-history, .btn-clear-history {
  flex: 1;
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  color: #fff;
}
.btn-save-history { background: #8b2500; }
.btn-save-history:hover { background: #a03000; }
.btn-clear-history { background: #888; }
.btn-clear-history:hover { background: #666; }
.btn-confirm-danger { background: #c41e3a !important; color: white; }

.btn-delete-item {
  background: transparent;
  border: none;
  font-size: 1.2em;
  color: #c0c0c0;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  margin-left: auto;
}
.btn-delete-item:hover { color: #c41e3a; }


/* === Chart Grid === */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, auto);
  border: 2px solid #8b2500;
  background: #faf6ef;
}
</style>
