<template>
  <div class="center-info">
    <div class="ci-group">
      <div class="ci-row ci-main-info">{{ genderLabel }}　{{ astrolabe.fiveElementsClass }}</div>
      <div class="ci-row">{{ astrolabe.lunarDate }}</div>
    </div>
    <div class="ci-group">
      <div class="ci-row">命主：{{ astrolabe.soul }}　身主：{{ astrolabe.body }}</div>
      <div class="ci-row">{{ astrolabe.zodiac }}　{{ astrolabe.sign }}</div>
    </div>
    
    <div class="ci-row pillars-row" v-if="fourPillars">
      <div class="pillars-cols">
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
    </div>

    <!-- Da Yun Display -->
    <EightCharDaYun 
      v-if="astrolabe && astrolabe.solarDate"
      :solarDate="astrolabe.solarDate"
      :timeIndex="timeIndex"
      :gender="gender"
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import EightCharDaYun from './EightCharDaYun.vue'

const props = defineProps({
  astrolabe: { type: Object, required: true },
  gender: { type: String, required: true },
  timeIndex: { type: Number, default: 0 }, // Passed from parent
  fourPillars: { type: Object, default: null },
  horoscopeData: { type: Object, default: null },
  selYear: { default: null },
})

defineEmits(['adjust'])

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
.pillars-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pillar-label { white-space: nowrap; }
.pillars-cols {
  display: flex; flex-direction: row; gap: 4px; justify-content: center;
}
.pillar-col {
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: #c41e3a; font-weight: bold;
  letter-spacing: 2px; line-height: 1.2;
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
</style>
