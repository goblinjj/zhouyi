<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
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

const isSaving = ref(false)
const saveForm = ref({ name: '', note: '' })

function confirmSave() {
  saveHistory(saveForm.value.name, saveForm.value.note)
  isSaving.value = false
  saveForm.value = { name: '', note: '' }
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
          <button class="btn-clear-history-sm" :class="{ 'btn-confirm-danger': clearConfirming }" @click.stop="clearHistory">
            {{ clearConfirming ? '确定清空?' : '清空' }}
          </button>
        </div>
        <TransitionGroup name="list" tag="div" class="history-list-wrapper">
          <div v-for="(item, idx) in history" :key="item.timestamp || idx" class="history-item" @click="editingIndex === idx ? null : (restoreHistory(item), generate())">
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
            <div class="save-inputs h-edit-inline" v-else @click.stop>
              <input v-model="editForm.name" placeholder="姓名(可选)" class="form-input-sm" style="flex:1; min-width:50px" />
              <input v-model="editForm.note" placeholder="备注(可选)" class="form-input-sm" style="flex:2" />
              <button class="btn-sm" @click.stop="saveEdit(idx)">确定</button>
              <button class="btn-sm" style="background:#888" @click.stop="cancelEdit">取消</button>
            </div>

            <div class="h-item-actions" v-if="editingIndex !== idx">
              <button class="btn-item-tag btn-item-edit" @click.stop="startEdit(idx, item)">编辑</button>
              <button class="btn-item-tag btn-item-delete" @click.stop="deleteHistoryItem(idx)">删除</button>
            </div>
          </div>
        </TransitionGroup>
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
           {{ showSettings ? '收起设置 ▲' : '展开设置 ▼' }}
         </button>
         <button class="btn-toggle-settings" style="flex: 1" @click="showHistory = !showHistory">
           临时记录 {{ showHistory ? '▲' : '▼' }}
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
      </div>
      </div>
      
      <!-- History Panel -->
      <div v-show="showHistory" class="history-panel">
        <div class="h-actions">
           <div class="save-inputs" v-if="isSaving">
              <input v-model="saveForm.name" placeholder="姓名(可选)" class="form-input-sm" style="flex:1" />
              <input v-model="saveForm.note" placeholder="备注(可选)" class="form-input-sm" style="flex:1" />
              <button class="btn-sm" @click="confirmSave">确定</button>
              <button class="btn-sm" style="background:#888" @click="isSaving=false">取消</button>
           </div>
           <div v-else style="display:flex; gap:6px; width:100%">
             <button class="btn-save-history" @click="isSaving=true">💾 保存当前</button>
             <button class="btn-clear-history" :class="{ 'btn-confirm-danger': clearConfirming }" @click.stop="clearHistory">
               {{ clearConfirming ? '确定清空?' : '🗑️ 清空' }}
             </button>
             <button class="btn-json-action" @click="openExportModal" title="导出 JSON">导出</button>
             <button class="btn-json-action btn-json-import" @click="openImportModal" title="导入 JSON">导入</button>
           </div>
        </div>
        <div v-if="history.length === 0" class="history-empty">暂无历史记录</div>
        <TransitionGroup name="list" tag="div" class="history-list-wrapper">
          <div v-for="(item, idx) in history" :key="item.timestamp || idx" class="history-item" @click="editingIndex === idx ? null : restoreHistory(item)">
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
            <div class="save-inputs h-edit-inline" v-else @click.stop>
              <input v-model="editForm.name" placeholder="姓名(可选)" class="form-input-sm" style="flex:1; min-width:50px" />
              <input v-model="editForm.note" placeholder="备注(可选)" class="form-input-sm" style="flex:2" />
              <button class="btn-sm" @click.stop="saveEdit(idx)">确定</button>
              <button class="btn-sm" style="background:#888" @click.stop="cancelEdit">取消</button>
            </div>

            <div class="h-item-actions" v-if="editingIndex !== idx">
              <button class="btn-item-tag btn-item-edit" @click.stop="startEdit(idx, item)">编辑</button>
              <button class="btn-item-tag btn-item-delete" @click.stop="deleteHistoryItem(idx)">删除</button>
            </div>
          </div>
        </TransitionGroup>
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
            <button class="btn-sm json-btn-copy" @click="copyJsonToClipboard">{{ jsonCopied ? '已复制 ✓' : '复制' }}</button>
            <button class="btn-sm" style="background:#888" @click="showJsonModal=false">关闭</button>
          </template>
          <template v-else>
            <button class="btn-sm" @click="confirmImportJson">确认导入</button>
            <button class="btn-sm" style="background:#888" @click="showJsonModal=false">取消</button>
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

/* Transition Group CSS for History */
.history-list-wrapper { position: relative; }
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-30px); }
.list-leave-active { position: absolute; width: calc(100% - 24px); } /* prevent layout breaking */

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
}
.history-item:hover { background: #fdfbf7; }
.history-item:last-child { border-bottom: none; }

.h-main { display: flex; flex-direction: column; gap: 4px; font-weight: bold; color: #3c2415; align-items: flex-start; font-size: 0.95em; flex: 1; }
.h-name-note { display: flex; gap: 8px; font-size: 0.9em; color: #8b2500; align-items: center; }
.h-name { font-weight: 900; }
.h-note { font-weight: normal; color: #666; font-size: 0.85em; background: #eee; padding: 0 4px; border-radius: 4px; }
.h-time-info { display: flex; gap: 8px; font-weight: normal; font-size: 0.85em; color: #555; }

.history-empty { padding: 12px; text-align: center; color: #999; font-size: 0.9em; }

.h-actions { 
  padding: 8px; 
  border-bottom: 1px solid #d4c5a9; 
  background: #faf6ef;
  display: flex;
  gap: 8px;
}
.save-inputs { display: flex; gap: 6px; width: 100%; align-items: center; }
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
.btn-confirm-danger { background: #c41e3a !important; color: white !important; }

.h-edit-inline { flex: 1; padding: 4px 0; }
.h-item-actions { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
.btn-item-tag {
  background: transparent;
  border: 1px solid #d4c5a9;
  border-radius: 4px;
  padding: 2px 7px;
  font-family: inherit;
  font-size: 0.75em;
  cursor: pointer;
  color: #aaa;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  white-space: nowrap;
  line-height: 1.6;
}
.btn-item-edit:hover { color: #8b2500; border-color: #8b2500; background: #fdf5ee; }
.btn-item-delete:hover { color: #c41e3a; border-color: #e8b0b8; background: #fff0f2; }


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

/* Import / Export JSON buttons */
.btn-json-action {
  flex: 0;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  font-family: inherit;
  color: #fff;
  background: #5c6e7a;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-json-action:hover { background: #4a5a66; }
.btn-json-import { background: #4a6e5a; }
.btn-json-import:hover { background: #3a5a4a; }

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
