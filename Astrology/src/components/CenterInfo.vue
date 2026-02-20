<template>
  <div class="center-info">
    <div class="ci-group">
      <div class="ci-row ci-main-info">{{ genderLabel }}　{{ astrolabe.fiveElementsClass }}</div>
      <div class="ci-row">{{ astrolabe.lunarDate }}</div>
    </div>
    <div class="ci-group">
      <div class="ci-row">命主：{{ astrolabe.soul }}　身主：{{ astrolabe.body }}</div>
    </div>

    <!-- 四柱 + 大运 横向滚动 -->
    <div class="pillars-dayun-scroll">
      <div v-if="fourPillars" class="pillars-group">
        <div class="pillar-col">
          <span v-for="char in fourPillars.year" :key="'y'+char" :style="{ color: pillarColor(char) }">{{ char }}</span>
        </div>
        <div class="pillar-col">
          <span v-for="char in fourPillars.month" :key="'m'+char" :style="{ color: pillarColor(char) }">{{ char }}</span>
        </div>
        <div class="pillar-col">
          <span v-for="char in fourPillars.day" :key="'d'+char" :style="{ color: pillarColor(char) }">{{ char }}</span>
        </div>
        <div class="pillar-col">
          <span v-for="char in fourPillars.hour" :key="'h'+char" :style="{ color: pillarColor(char) }">{{ char }}</span>
        </div>
      </div>
      <div v-if="fourPillars" class="pillars-dayun-sep"></div>
      <EightCharDaYun
        v-if="astrolabe && astrolabe.solarDate"
        :solarDate="astrolabe.solarDate"
        :timeIndex="timeIndex"
        :gender="gender"
      />
    </div>

    <!-- 格局 -->
    <PalacePatterns
      v-if="selectedPalace"
      :selectedPalace="selectedPalace"
      :allPalaces="astrolabe.palaces"
      :horoscopeData="horoscopeData"
    />


    <!-- Date/Time Adjustor -->
    <div class="ci-adjust">
      <div class="adj-group" v-for="field in adjustFields" :key="field.key">
        <button class="adj-btn" @click="$emit('adjust', field.key, -1)">−</button>
        <span class="adj-label">{{ field.label }}</span>
        <button class="adj-btn" @click="$emit('adjust', field.key, 1)">+</button>
      </div>
    </div>

    <!-- Progressive Info Display -->
    <div class="ci-row ci-small" v-if="yearlyInfo">
      流年：{{ yearlyInfo.stem }}{{ yearlyInfo.branch }}年
      <span v-if="age">　虚岁{{ age }}</span>
    </div>

    <div v-if="savedRecord" class="ci-saved-badge">
      <span class="ci-saved-icon">✓</span>
      <span class="ci-saved-text">{{ savedRecord.name ? savedRecord.name : '已保存' }}</span>
    </div>

    <div v-if="saving" class="ci-save-form" @click.stop>
      <input ref="saveInput" v-model="saveName" placeholder="名称(可空)" class="ci-save-input" @keyup.enter="confirmSave" @keyup.esc="saving = false" />
      <button class="ci-save-confirm" @click="confirmSave">保存</button>
      <button class="ci-save-cancel" @click="saving = false">×</button>
    </div>
    <button v-else-if="!savedRecord" class="ci-save-btn" @click="startSave">保存当前命盘</button>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import EightCharDaYun from './EightCharDaYun.vue'
import PalacePatterns from './PalacePatterns.vue'

const props = defineProps({
  astrolabe: { type: Object, required: true },
  gender: { type: String, required: true },
  timeIndex: { type: Number, default: 0 }, // Passed from parent
  fourPillars: { type: Object, default: null },
  horoscopeData: { type: Object, default: null },
  selYear: { default: null },
  savedRecord: { type: Object, default: null },
  selectedPalace: { type: Object, default: null },
})

const emit = defineEmits(['adjust', 'save-chart'])

const saving = ref(false)
const saveName = ref('')
const saveInput = ref(null)

async function startSave() {
  saving.value = true
  saveName.value = ''
  await nextTick()
  saveInput.value?.focus()
}

function confirmSave() {
  emit('save-chart', saveName.value.trim())
  saving.value = false
  saveName.value = ''
}

const adjustFields = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'day', label: '日' },
  { key: 'hour', label: '时' },
]
const genderLabel = computed(() => props.gender === '男' ? '阳男' : '阴女')

const yearlyInfo = computed(() => {
  if (!props.selYear || !props.horoscopeData?.yearly) return null
  return {
    stem: props.horoscopeData.yearly.heavenlyStem,
    branch: props.horoscopeData.yearly.earthlyBranch,
  }
})

const age = computed(() => props.horoscopeData?.age?.nominalAge || null)

// 五行 colors by heavenly stem
const WUXING_COLORS = {
  // Heavenly Stems
  '甲': '#2e7d32', '乙': '#2e7d32', // Wood
  '丙': '#c62828', '丁': '#c62828', // Fire
  '戊': '#8d6e27', '己': '#8d6e27', // Earth
  '庚': '#b8860b', '辛': '#b8860b', // Metal
  '壬': '#1565c0', '癸': '#1565c0', // Water
  // Earthly Branches
  '寅': '#2e7d32', '卯': '#2e7d32', // Wood
  '巳': '#c62828', '午': '#c62828', // Fire
  '辰': '#8d6e27', '戌': '#8d6e27', '丑': '#8d6e27', '未': '#8d6e27', // Earth
  '申': '#b8860b', '酉': '#b8860b', // Metal
  '子': '#1565c0', '亥': '#1565c0', // Water
}
function pillarColor(char) {
  return WUXING_COLORS[char] || '#3c2415'
}
</script>

<style scoped>
.center-info {
  grid-row: 2 / 4;
  grid-column: 2 / 4;
  border: 1px solid #d4c5a9;
  padding: 8px;
  background: #fffcf5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 13px;
}
.ci-group {
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ci-main-info {
  font-weight: bold;
  color: #8b2500; /* Dark red/brown for emphasis */
  font-size: 1.05em;
}
.ci-title { color: #8b2500; font-weight: bold; font-size: 1.2em; text-align: center; margin-bottom: 4px; }
.ci-row { color: #3c2415; margin: 2px 0; text-align: center; }
.ci-small { font-size: 0.9em; }
/* 四柱 + 大运 横向滚动容器 */
.pillars-dayun-scroll {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow-x: auto;
  gap: 6px;
  padding: 4px 2px;
  border-top: 1px dotted #d4c5a9;
  border-bottom: 1px dotted #d4c5a9;
  margin: 4px 0;
}
.pillars-dayun-scroll::-webkit-scrollbar { height: 3px; }
.pillars-dayun-scroll::-webkit-scrollbar-thumb { background: #d4c5a9; border-radius: 2px; }
.pillars-group {
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-shrink: 0;
}
.pillar-col {
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: #c41e3a; font-weight: bold;
  letter-spacing: 2px; line-height: 1.2;
}
.pillars-dayun-sep {
  width: 1px;
  align-self: stretch;
  background: #d4c5a9;
  flex-shrink: 0;
}
/* Override EightCharDaYun internal separator when inline */
.pillars-dayun-scroll :deep(.dayun-section) {
  margin-top: 0;
  border-top: none;
  padding-top: 0;
  flex-shrink: 0;
}
.pillars-dayun-scroll :deep(.dy-scroll) {
  overflow-x: visible;
}
.ci-divider { border-top: 1px dotted #d4c5a9; margin: 4px 0; }

/* Date/Time Adjustor */
.ci-adjust {
  display: flex; flex-wrap: wrap; gap: 4px 8px; justify-content: center; align-items: center;
  padding: 4px 0; margin: 6px 0;
  border-top: 1px dotted #d4c5a9;
  border-bottom: 1px dotted #d4c5a9;
}
.adj-group {
  display: inline-flex; align-items: center; gap: 0;
  min-width: 38%;
  justify-content: center;
}
.adj-btn {
  background: none; border: none;
  color: #b8860b; cursor: pointer;
  font-size: 16px; font-weight: bold;
  width: 20px; height: 20px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: all 0.15s;
  line-height: 1;
}
.adj-btn:hover { color: #8b2500; background: rgba(139,37,0,0.08); }
.adj-btn:active { background: rgba(139,37,0,0.18); }
.adj-label {
  font-size: 13px; color: #8b2500; font-weight: bold;
  user-select: none;
}
.ci-saved-badge {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 0;
  border-radius: 5px;
  background: #f0f7f0;
  border: 1px solid #b8dab8;
}
.ci-saved-icon { color: #2c6e49; font-size: 12px; font-weight: bold; }
.ci-saved-text { color: #2c6e49; font-size: 12px; font-weight: bold; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ci-save-btn {
  margin-top: 8px;
  width: 100%;
  padding: 5px 0;
  background: transparent;
  border: 1px solid #d4c5a9;
  border-radius: 5px;
  color: #8b2500;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.ci-save-btn:hover { background: #fdf5ee; border-color: #8b2500; }
.ci-save-form {
  margin-top: 8px;
  display: flex;
  gap: 4px;
  align-items: center;
}
.ci-save-input {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid #8b2500;
  border-radius: 5px;
  background: #fffcf5;
  color: #3c2415;
  outline: none;
}
.ci-save-confirm {
  font-family: inherit;
  font-size: 12px;
  padding: 4px 8px;
  background: #8b2500;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
}
.ci-save-confirm:hover { background: #a03000; }
.ci-save-cancel {
  font-family: inherit;
  font-size: 14px;
  padding: 2px 5px;
  background: transparent;
  color: #aaa;
  border: none;
  cursor: pointer;
  line-height: 1;
}
.ci-save-cancel:hover { color: #666; }
</style>
