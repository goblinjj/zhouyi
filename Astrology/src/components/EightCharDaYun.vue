<script setup>
import { computed } from 'vue'
import { Solar } from 'lunar-javascript'

const props = defineProps({
  solarDate: { type: String, required: true }, // Format: YYYY-MM-DD
  timeIndex: { type: Number, required: true }, // 0-12
  gender: { type: String, required: true }, // '男' or '女'
})

// Map timeIndex to Hour (approximate for Lunar)
// 0: 23-01 (Early Rat), 1: 01-03 (Ox), ..., 12: 23-01 (Late Rat)
// Lunar-javascript expects valid hour (0-23)
const hourMap = {
  0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 10,
  6: 12, 7: 14, 8: 16, 9: 18, 10: 20,
  11: 22, 12: 23
}

const daYunList = computed(() => {
  if (!props.solarDate) return []
  try {
    const [y, m, d] = props.solarDate.split('-').map(Number)
    const h = hourMap[props.timeIndex] || 12
    
    const solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
    const lunar = solar.getLunar()
    const eightChar = lunar.getEightChar()
    
    // Set gender: 1 for male, 0 for female (Lunar lib expectation)
    // Actually getYun takes gender: 1 male, 0 female
    const gVal = props.gender === '男' ? 1 : 0
    const yun = eightChar.getYun(gVal)
    
    // 1st DaYun is usually start age
    // lunar-javascript returns 10 DaYuns by default usually
    // We want the Start Year, Start Age, and the GanZhi
    const daYuns = yun.getDaYun(11)
    const result = []

    for (const dy of daYuns) {
      // Index is usually 0, 1, 2... representing sequence
      // We only care about valid ones
      if (dy.getIndex() < 1) continue // Skip 0 if it's not a real DaYun? Usually getDaYun returns full list
      
      // dy.getStartYear() -> int year
      // dy.getStartAge() -> int age
      // dy.getGanZhi() -> string
      result.push({
        index: dy.getIndex(),
        startYear: dy.getStartYear(),
        startAge: dy.getStartAge(),
        ganZhi: dy.getGanZhi(),
      })
    }
    
    // Sort just in case
    return result.sort((a, b) => a.startAge - b.startAge)
    
  } catch (e) {
    console.error('DaYun calc error:', e)
    return []
  }
})

// Colors for Gan/Zhi
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

function charColor(c) {
  return WUXING_COLORS[c] || '#333'
}

</script>

<template>
  <div class="dayun-section" v-if="daYunList.length">
    <div class="dy-scroll">
      <div v-for="dy in daYunList" :key="dy.index" class="dy-item">
        <div class="dy-p">
          <span :style="{ color: charColor(dy.ganZhi[0]) }">{{ dy.ganZhi[0] }}</span>
          <span :style="{ color: charColor(dy.ganZhi[1]) }">{{ dy.ganZhi[1] }}</span>
        </div>
        <div class="dy-info">
          <div class="dy-age">{{ dy.startAge }}岁</div>
          <div class="dy-year">{{ dy.startYear }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dayun-section {
  margin-top: 6px;
  border-top: 1px dotted #d4c5a9;
  padding-top: 4px;
}
.dy-header {
  font-size: 11px;
  color: #8b2500;
  font-weight: bold;
  margin-bottom: 2px;
}
.dy-scroll {
  display: flex;
  overflow-x: auto;
  gap: 2px;
  padding-bottom: 2px;
}
/* Hide scrollbar for cleaner look */
.dy-scroll::-webkit-scrollbar { height: 4px; }
.dy-scroll::-webkit-scrollbar-thumb { background: #d4c5a9; border-radius: 2px; }

.dy-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2em;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1px;
}
.dy-p {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  gap: 0;
  margin-bottom: 1px;
  flex: 1;
  line-height: 1;
}
.dy-info {
  text-align: center;
  font-size: 9px;
  color: #8b2500;
  line-height: 1;
}
.dy-age { font-weight: bold; color: #3c2415; margin-bottom: 1px; }
.dy-year { transform: scale(0.85); white-space: nowrap; }
</style>
