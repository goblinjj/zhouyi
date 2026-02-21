<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue'
import Sortable from 'sortablejs'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
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
import AiInterpretModal from '../components/AiInterpretModal.vue'
import starData from '@/data/index'
import { useAiInterpret } from '../composables/useAiInterpret'

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

const savedRecord = computed(() => {
  if (!astrolabe.value) return null
  return history.value.find(item =>
    item.date === date.value &&
    item.timeIndex === timeIndex.value &&
    item.gender === gender.value &&
    item.config?.yearDivide === config.value.yearDivide &&
    item.config?.fixLeap === config.value.fixLeap
  ) ?? null
})
const showAdjStars = ref(localStorage.getItem('showAdjStars') !== 'false')
watch(showAdjStars, v => localStorage.setItem('showAdjStars', v))

// ===== Horoscope Composable =====
const {
  horoscopeData, selectedPalaceIdx,
  selDecadal, selYear, selMonth,
  fourPillars, derivedNames, flyingSihuaBg,
  decadalList, yearList, monthList, flowStarsByPalace,
  getStarMutagens, resetSelections, clickPalace,
  isSanfang, isSelected, autoSelectLifePalace,
  selectDecadal, selectYear, selectMonth,
} = useHoroscope(astrolabe)

const currentScopeIndices = computed(() => {
  if (!astrolabe.value) return {}
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  try {
    const currentHoro = astrolabe.value.horoscope(dateStr, 0)
    const getLifeIdx = (data) => (data?.index > -1 && data?.palaceNames) ? data.palaceNames.indexOf('命宫') : -1
    return {
      decadal: getLifeIdx(currentHoro.decadal),
      yearly: getLifeIdx(currentHoro.yearly),
      monthly: getLifeIdx(currentHoro.monthly)
    }
  } catch(e) {
    return {}
  }
})

const currentTimeData = computed(() => {
  if (!astrolabe.value) return {}
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  try {
    // Current year is straightforward calendar year
    const currentYear = now.getFullYear()
    
    // For lunar month, getting it exactly for today
    const todayAstrolabe = astro.bySolar(dateStr, 0, '男', true)
    const currentMonth = todayAstrolabe.rawDates?.lunarDate?.lunarMonth

    return {
      decadalIdx: currentScopeIndices.value.decadal,
      year: currentYear,
      month: currentMonth
    }
  } catch(e) {
    return {}
  }
})

const selectedPalace = computed(() =>
  astrolabe.value?.palaces?.find(p => p.index === selectedPalaceIdx.value) ?? null
)

const scopeFlags = computed(() => ({
  decadal: !!selDecadal.value,
  yearly: !!selYear.value,
  monthly: !!selMonth.value,
}))

// ===== Methods =====
function generate() {
  if (!date.value) return
  astrolabe.value = astro.withOptions({
    type: 'solar',
    dateStr: date.value,
    timeIndex: timeIndex.value,
    gender: gender.value,
    config: {
      yearDivide: config.value.yearDivide,
      horoscopeDivide: config.value.yearDivide,
      brightness: {
        '太阴': ['旺', '陷', '陷', '陷', '不', '不', '利', '旺', '旺', '庙', '庙', '庙'],
      },
    },
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


function saveHistory(name = '', note = '') {
  const newItem = {
    name,
    note,
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
        JSON.stringify(latest.config) === JSON.stringify(newItem.config) &&
        latest.name === newItem.name && latest.note === newItem.note) {
      return
    }
  }

  history.value.unshift(newItem)
  if (history.value.length > 30) {
    history.value.pop()
  }
  
  try {
    localStorage.setItem('paipan_history', JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history', e)
  }
}

const showJsonModal = ref(false)
const jsonModalMode = ref('export') // 'export' | 'import'
const jsonText = ref('')
const jsonImportError = ref('')
const jsonCopied = ref(false)

function openExportModal() {
  jsonText.value = JSON.stringify(history.value, null, 2)
  jsonModalMode.value = 'export'
  jsonImportError.value = ''
  jsonCopied.value = false
  showJsonModal.value = true
}

function openImportModal() {
  jsonText.value = ''
  jsonModalMode.value = 'import'
  jsonImportError.value = ''
  showJsonModal.value = true
}

async function copyJsonToClipboard() {
  try {
    await navigator.clipboard.writeText(jsonText.value)
    jsonCopied.value = true
    setTimeout(() => { jsonCopied.value = false }, 2000)
  } catch {
    // fallback: select text
    const ta = document.querySelector('.json-textarea')
    if (ta) { ta.select(); document.execCommand('copy') }
  }
}

function confirmImportJson() {
  try {
    const imported = JSON.parse(jsonText.value)
    if (Array.isArray(imported)) {
      history.value = imported
      saveHistoryToStorage()
      showJsonModal.value = false
    } else {
      jsonImportError.value = '格式不正确，请粘贴有效的历史记录 JSON 数组'
    }
  } catch {
    jsonImportError.value = '解析失败，JSON 格式有误'
  }
}

const editingIndex = ref(-1)
const editForm = ref({ name: '', note: '' })

function startEdit(idx, item) {
  editingIndex.value = idx
  editForm.value = { name: item.name || '', note: item.note || '' }
}

function saveEdit(idx) {
  history.value[idx].name = editForm.value.name
  history.value[idx].note = editForm.value.note
  editingIndex.value = -1
  saveHistoryToStorage()
}

function cancelEdit() {
  editingIndex.value = -1
}

// ===== Drag-to-sort =====
const homeListEl = ref(null)
const panelListEl = ref(null)
let _homeSort = null
let _panelSort = null

function makeSortable(el) {
  return Sortable.create(el, {
    animation: 150,
    delay: 400,         // 长按 400ms 触发拖动
    delayOnTouchOnly: false,
    ghostClass: 'h-item-ghost',
    chosenClass: 'h-item-chosen',
    onEnd(evt) {
      if (evt.oldIndex === evt.newIndex) return
      const arr = [...history.value]
      const [moved] = arr.splice(evt.oldIndex, 1)
      arr.splice(evt.newIndex, 0, moved)
      history.value = arr
      saveHistoryToStorage()
    }
  })
}

watch(homeListEl, (el) => {
  _homeSort?.destroy(); _homeSort = null
  if (el) _homeSort = makeSortable(el)
}, { flush: 'post' })

watch([panelListEl, showHistory], async ([el, visible]) => {
  _panelSort?.destroy(); _panelSort = null
  if (el && visible) {
    await nextTick()
    _panelSort = makeSortable(el)
  }
}, { flush: 'post' })

const deletingIndex = ref(-1)

function deleteHistoryItem(index) {
  if (deletingIndex.value === index) {
    history.value.splice(index, 1)
    saveHistoryToStorage()
    deletingIndex.value = -1
  } else {
    deletingIndex.value = index
    setTimeout(() => {
      if (deletingIndex.value === index) deletingIndex.value = -1
    }, 3000)
  }
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

// ===== AI Interpret =====
const showAiModal = ref(false)
const { collectChartInfo } = useAiInterpret()
const aiChartInfo = ref('')
const aiScopeDesc = ref('')

function openAiModal() {
  const result = collectChartInfo(
    astrolabe.value,
    horoscopeData.value,
    selDecadal.value,
    selYear.value,
    gender.value
  )
  aiChartInfo.value = result.chartInfo
  aiScopeDesc.value = result.scopeDesc
  showAiModal.value = true
}

// Smooth zoom for wide screens
const { width: winWidth } = useWindowSize()
const chartZoom = computed(() => {
  const w = winWidth.value
  if (w <= 1080) return 1
  // Linear from 1.0 at 1080px to 1.7 at 1920px
  return Math.min(1 + (w - 1080) * 0.7 / 840, 2.0)
})

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
          <button class="h-btn h-btn-ghost h-btn-sm" :class="{ 'h-btn-danger': clearConfirming }" @click.stop="clearHistory">
            {{ clearConfirming ? '确定清空?' : '清空' }}
          </button>
        </div>
        <div ref="homeListEl" class="history-list-wrapper">
          <div v-for="(item, idx) in history" :key="item.timestamp || idx" class="history-item" :class="{ 'history-item-active': savedRecord && item.timestamp === savedRecord.timestamp }" @click="editingIndex === idx ? null : (restoreHistory(item), generate())">
            <div class="h-main" v-if="editingIndex !== idx">
              <div v-if="item.name || item.note" class="h-name-note">
                <span v-if="item.name" class="h-name">{{ item.name }}</span>
                <span v-if="item.note" class="h-note">{{ item.note }}</span>
              </div>
              <div class="h-time-info">
                <span class="h-date">{{ item.date }}</span>
                <span class="h-time">{{ TIME_OPTIONS.find(t => t.value === item.timeIndex)?.label }}</span>
                <span class="h-gender">{{ item.gender }}</span>
              </div>
            </div>
            <div class="h-edit-mode" v-else @click.stop>
              <div class="h-edit-inputs">
                <input v-model="editForm.name" placeholder="姓名（可选）" class="form-input-sm" />
                <input v-model="editForm.note" placeholder="备注（可选）" class="form-input-sm" />
              </div>
              <div class="h-edit-btns">
                <button class="h-btn h-btn-primary h-btn-sm" @click.stop="saveEdit(idx)">确定</button>
                <button class="h-btn h-btn-ghost h-btn-sm" @click.stop="cancelEdit">取消</button>
              </div>
            </div>
            <div class="h-item-actions" v-if="editingIndex !== idx">
              <button class="h-btn h-btn-ghost h-btn-sm" @click.stop="startEdit(idx, item)">编</button>
              <button class="h-btn h-btn-sm h-btn-del" :class="deletingIndex === idx ? 'h-btn-danger' : 'h-btn-ghost'" @click.stop="deleteHistoryItem(idx)">{{ deletingIndex === idx ? '确认' : '删' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Form -->
    <div v-if="astrolabe" class="compact-bar">
       <div style="display: flex; gap: 8px; align-items: center;">
         <a href="/" class="btn-home" title="回到首页">
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
             <defs><clipPath id="tj"><circle cx="100" cy="100" r="100"/></clipPath></defs>
             <g clip-path="url(#tj)">
               <circle cx="100" cy="100" r="100" fill="#faf6ef"/>
               <rect x="100" y="0" width="100" height="200" fill="#3a2e2a"/>
               <circle cx="100" cy="50" r="50" fill="#3a2e2a"/>
               <circle cx="100" cy="150" r="50" fill="#faf6ef"/>
               <circle cx="100" cy="50" r="12" fill="#faf6ef"/>
               <circle cx="100" cy="150" r="12" fill="#3a2e2a"/>
             </g>
           </svg>
         </a>
         <button class="btn-toggle-settings" style="flex: 1" @click="showSettings = !showSettings">
           导航&设置 {{ showSettings ? '▲' : '▼' }}
         </button>
         <button class="btn-toggle-settings" style="flex: 1" @click="showHistory = !showHistory">
           本地记录 {{ showHistory ? '▲' : '▼' }}
         </button>
         <button class="btn-ai-interpret" @click="openAiModal">AI 解盘</button>
       </div>
       
       <!-- Settings Panel -->
       <div v-show="showSettings" class="form-compact">
      <nav class="compact-nav">
        <RouterLink class="compact-navlink" to="/">排盘</RouterLink>
        <RouterLink class="compact-navlink" to="/stars">星耀</RouterLink>
        <RouterLink class="compact-navlink" to="/dianji">典籍</RouterLink>
        <RouterLink class="compact-navlink" to="/true-solar-time">真太阳时</RouterLink>
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

        <span class="fc-divider">|</span>

        <span class="label-text-sm">杂曜:</span>
        <label class="gender-toggle" :class="{ active: showAdjStars }">
          <input type="checkbox" v-model="showAdjStars" style="display:none" />{{ showAdjStars ? '显示' : '隐藏' }}
        </label>
      </div>
      </div>
      
      <!-- History Panel -->
      <div v-show="showHistory" class="history-panel">
        <div class="h-actions">
          <div class="h-action-btns">
            <button class="h-btn h-btn-ghost" :class="{ 'h-btn-danger': clearConfirming }" @click.stop="clearHistory">
              {{ clearConfirming ? '确定清空?' : '清空' }}
            </button>
            <button class="h-btn h-btn-ghost" @click="openExportModal">导出</button>
            <button class="h-btn h-btn-ghost" @click="openImportModal">导入</button>
          </div>
        </div>
        <div class="h-storage-tip">
          <span>⚠ 记录仅存于本浏览器，清除缓存或换浏览器将全部丢失</span>
          <button class="h-tip-export" @click="openExportModal">导出备份</button>
        </div>
        <div v-if="history.length === 0" class="history-empty">暂无历史记录</div>
        <div ref="panelListEl" class="history-list-wrapper">
          <div v-for="(item, idx) in history" :key="item.timestamp || idx" class="history-item" :class="{ 'history-item-active': savedRecord && item.timestamp === savedRecord.timestamp }" @click="editingIndex === idx ? null : restoreHistory(item)">
            <div class="h-main" v-if="editingIndex !== idx">
              <div v-if="item.name || item.note" class="h-name-note">
                <span v-if="item.name" class="h-name">{{ item.name }}</span>
                <span v-if="item.note" class="h-note">{{ item.note }}</span>
              </div>
              <div class="h-time-info">
                <span class="h-date">{{ item.date }}</span>
                <span class="h-time">{{ TIME_OPTIONS.find(t => t.value === item.timeIndex)?.label }}</span>
                <span class="h-gender">{{ item.gender }}</span>
              </div>
            </div>
            <div class="h-edit-mode" v-else @click.stop>
              <div class="h-edit-inputs">
                <input v-model="editForm.name" placeholder="姓名（可选）" class="form-input-sm" />
                <input v-model="editForm.note" placeholder="备注（可选）" class="form-input-sm" />
              </div>
              <div class="h-edit-btns">
                <button class="h-btn h-btn-primary h-btn-sm" @click.stop="saveEdit(idx)">确定</button>
                <button class="h-btn h-btn-ghost h-btn-sm" @click.stop="cancelEdit">取消</button>
              </div>
            </div>
            <div class="h-item-actions" v-if="editingIndex !== idx">
              <button class="h-btn h-btn-ghost h-btn-sm" @click.stop="startEdit(idx, item)">编</button>
              <button class="h-btn h-btn-sm h-btn-del" :class="deletingIndex === idx ? 'h-btn-danger' : 'h-btn-ghost'" @click.stop="deleteHistoryItem(idx)">{{ deletingIndex === idx ? '确认' : '删' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="astrolabe" class="chart-section" :style="{ zoom: chartZoom }">
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
          :showAdjStars="showAdjStars"
          :currentScopeIndices="currentScopeIndices"
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
          :savedRecord="savedRecord"
          :selectedPalace="selectedPalace"
          :scopeFlags="scopeFlags"
          @adjust="adjustDate"
          @save-chart="(name) => { saveHistory(name, ''); showHistory = true }"
        />
      </div>

      <!-- Horoscope Bottom Panel -->
      <HoroscopePanel
        :decadalList="decadalList"
        :yearList="yearList"
        :monthList="monthList"
        :selDecadal="selDecadal"
        :selYear="selYear"
        :selMonth="selMonth"
        :currentTimeData="currentTimeData"
        @select-decadal="selectDecadal"
        @select-year="selectYear"
        @select-month="selectMonth"
      />
    </div>

    <!-- Star Details Popup -->
    <Popup v-model="currentStar" />

    <!-- AI Interpret Modal -->
    <AiInterpretModal
      :visible="showAiModal"
      :chartInfo="aiChartInfo"
      :scopeDesc="aiScopeDesc"
      @close="showAiModal = false"
    />

    <!-- JSON Import/Export Modal -->
    <div v-if="showJsonModal" class="json-modal-overlay" @click.self="showJsonModal=false">
      <div class="json-modal">
        <div class="json-modal-title">{{ jsonModalMode === 'export' ? '导出历史记录' : '导入历史记录' }}</div>
        <p class="json-modal-hint">
          {{ jsonModalMode === 'export' ? '复制下方 JSON，可粘贴到其他设备的「导入」功能中恢复记录。' : '将导出的 JSON 粘贴到下方，点击「确认导入」覆盖当前记录。' }}
        </p>
        <textarea class="json-textarea" v-model="jsonText" :readonly="jsonModalMode === 'export'"
          :placeholder="jsonModalMode === 'import' ? '请粘贴历史记录 JSON 数据...' : ''"></textarea>
        <div v-if="jsonImportError" class="json-error">{{ jsonImportError }}</div>
        <div class="json-modal-actions">
          <template v-if="jsonModalMode === 'export'">
            <button class="h-btn h-btn-primary json-btn-copy" @click="copyJsonToClipboard">{{ jsonCopied ? '已复制 ✓' : '复制' }}</button>
            <button class="h-btn h-btn-ghost" @click="showJsonModal=false">关闭</button>
          </template>
          <template v-else>
            <button class="h-btn h-btn-primary" @click="confirmImportJson">确认导入</button>
            <button class="h-btn h-btn-ghost" @click="showJsonModal=false">取消</button>
          </template>
        </div>
      </div>
    </div>
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
.label-text-sm { font-size: 0.85em; color: #3c2415; white-space: nowrap; margin-right: 0; }
.fc-divider { color: #d4c5a9; margin: 0 2px; }

/* Toggle Bar */
.compact-bar { margin-bottom: 0.5em; display: flex; flex-direction: column; align-items: stretch; }
.btn-home {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; flex-shrink: 0;
  border-radius: 50%;
  transition: background 0.2s;
}
.btn-home:hover { background: rgba(139, 37, 0, 0.08); }
.btn-toggle-settings {
  background: #faf6ef; border: 1px dashed #d4c5a9;
  color: #8b2500; cursor: pointer;
  padding: 0.3em; border-radius: 6px;
  font-size: 0.85em; text-align: center;
  transition: all 0.2s;
}
.btn-toggle-settings:hover { background: #fdfbf7; border-color: #8b2500; }

.btn-ai-interpret {
  background: linear-gradient(135deg, #2c6e49 0%, #1a4731 100%);
  border: none; color: #fff; cursor: pointer;
  padding: 0.3em 0.8em; border-radius: 6px;
  font-size: 0.85em; font-family: inherit;
  letter-spacing: 0.08em; white-space: nowrap;
  transition: all 0.2s;
}
.btn-ai-interpret:hover { background: linear-gradient(135deg, #3a8f5f 0%, #2c6e49 100%); }

.history-list-wrapper { position: relative; }
.h-item-ghost { opacity: 0.4; background: #fdf5ee !important; }
.h-item-chosen { background: #fefaf4 !important; box-shadow: 0 2px 8px rgba(139,37,0,0.12); }

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
  background: #fffcf5;
  user-select: none;
  -webkit-user-select: none;
}
.history-item:hover { background: #fdfbf7; }
.history-item:last-child { border-bottom: none; }
.history-item-active { background: #f0f7f0 !important; border-left: 3px solid #2c6e49; }

.h-main { display: flex; flex-direction: column; gap: 4px; font-weight: bold; color: #3c2415; align-items: flex-start; font-size: 0.95em; flex: 1; }
.h-name-note { display: flex; gap: 8px; font-size: 0.9em; color: #8b2500; align-items: center; }
.h-name { font-weight: 900; }
.h-note { font-weight: normal; color: #666; font-size: 0.85em; background: #eee; padding: 0 4px; border-radius: 4px; }
.h-time-info { display: flex; gap: 8px; font-weight: normal; font-size: 0.85em; color: #555; }

.h-storage-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 10px;
  background: #fdf8ee;
  border-bottom: 1px solid #e8dfc0;
  font-size: 0.75em;
  color: #8a6a20;
}
.h-tip-export {
  font-family: inherit;
  font-size: inherit;
  color: #8b2500;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  white-space: nowrap;
  padding: 0;
}
.h-tip-export:hover { color: #a03000; }
.history-empty { padding: 12px; text-align: center; color: #999; font-size: 0.9em; }

/* === Unified history button system === */
.h-btn {
  font-family: inherit;
  font-size: 0.84em;
  padding: 5px 11px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  white-space: nowrap;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.h-btn-sm { font-size: 0.78em; padding: 3px 9px; }
.h-btn-primary { background: #8b2500; color: #fff; border-color: #8b2500; }
.h-btn-primary:hover { background: #a03000; border-color: #a03000; }
.h-btn-ghost { background: transparent; color: #888; border-color: #d4c5a9; }
.h-btn-ghost:hover { color: #8b2500; border-color: #8b2500; background: #fdf5ee; }
.h-btn-danger { background: #c41e3a !important; color: #fff !important; border-color: #c41e3a !important; }
.h-btn-del:hover { color: #c41e3a !important; border-color: #e8b0b8 !important; background: #fff0f2 !important; }

/* Action bar */
.h-actions { padding: 8px; border-bottom: 1px solid #d4c5a9; background: #faf6ef; }
.h-action-btns { display: flex; gap: 6px; }
.h-action-btns .h-btn { flex: 1; }


/* Edit mode in history item — two-row, no overflow */
.h-edit-mode { flex: 1; display: flex; flex-direction: column; gap: 5px; overflow: hidden; min-width: 0; }
.h-edit-inputs { display: flex; gap: 5px; }
.h-edit-inputs .form-input-sm { flex: 1; min-width: 0; }
.h-edit-btns { display: flex; gap: 5px; justify-content: flex-end; }

.h-item-actions { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }


/* === Chart Grid === */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, auto);
  border: 2px solid #8b2500;
  background: #faf6ef;
}

/* PC wide screen: widen container to accommodate zoomed chart */
@media (min-width: 1200px) {
  .paipan-page { max-width: 90vw; }
}


/* JSON Modal */
.json-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.json-modal {
  background: #faf6ef;
  border: 1px solid #d4c5a9;
  border-radius: 10px;
  padding: 20px;
  width: 90%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.json-modal-title {
  font-size: 1em;
  font-weight: bold;
  color: #3c2415;
}
.json-modal-hint {
  font-size: 0.82em;
  color: #666;
  margin: 0;
}
.json-textarea {
  width: 100%;
  height: 200px;
  font-family: monospace;
  font-size: 0.78em;
  padding: 8px;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  background: #fff;
  color: #333;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
}
.json-textarea:focus { border-color: #8b2500; }
.json-error {
  color: #c41e3a;
  font-size: 0.82em;
}
.json-modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.json-btn-copy { transition: background 0.2s; }
</style>
