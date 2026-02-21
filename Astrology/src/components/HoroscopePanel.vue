<template>
  <div class="h-panel">
    <!-- 大限 (Always visible) -->
    <div class="h-row">
      <div class="h-label">大限</div>
      <div class="h-scroll" ref="decadalScrollRef">
        <div v-for="d in decadalList" :key="d.palaceIdx"
          class="h-item" :class="{ active: selDecadal?.palaceIdx === d.palaceIdx, 'is-current-time': currentTimeData?.decadalIdx === d.palaceIdx }"
          @click="$emit('select-decadal', d)">
          <div>{{ d.range[0] }}~{{ d.range[1] }}</div>
          <div class="h-sub">{{ d.stem }}{{ d.branch }}限</div>
        </div>
      </div>
      <div class="h-arrow" @click="scrollRight(decadalScrollRef)">▷</div>
    </div>

    <!-- 流年 (Visible if Decadal selected) -->
    <div class="h-row" v-if="selDecadal">
      <div class="h-label">流年</div>
      <div class="h-scroll" ref="yearScrollRef">
        <div v-for="y in yearList" :key="y.year"
          class="h-item" :class="{ active: selYear === y.year, 'is-current-time': currentTimeData?.year === y.year }"
          @click="$emit('select-year', y)">
          <div>{{ y.year }}年</div>
          <div class="h-sub">{{ y.sb }}{{ y.age }}岁</div>
        </div>
      </div>
      <div class="h-arrow" @click="scrollRight(yearScrollRef)">▷</div>
    </div>

    <!-- 流月 (Visible if Year selected) -->
    <div class="h-row" v-if="selYear">
      <div class="h-label">流月</div>
      <div class="h-scroll">
        <div v-for="m in monthList" :key="m.index"
          class="h-item" :class="{ active: selMonth === m.index, 'is-current-time': selYear === currentTimeData?.year && currentTimeData?.month === m.index }"
          @click="$emit('select-month', m.index)">
          <div>{{ m.lunarName }}</div>
          <div class="h-sub">{{ m.sb }} {{ m.solarMonth }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MONTH_NAMES } from '../composables/usePaipanConstants'

defineProps({
  decadalList: { type: Array, required: true },
  yearList: { type: Array, required: true },
  monthList: { type: Array, default: () => [] },
  selDecadal: { default: null },
  selYear: { default: null },
  selMonth: { default: null },
  currentTimeData: { type: Object, default: () => ({}) },
})

defineEmits(['select-decadal', 'select-year', 'select-month'])

const decadalScrollRef = ref(null)
const yearScrollRef = ref(null)

function scrollRight(refEl) {
  refEl?.scrollBy({ left: 200, behavior: 'smooth' })
}
</script>

<style scoped>
.h-panel {
  border: 2px solid #8b2500;
  margin-top: 4px;
  margin-bottom: 1em;
  background: #fffcf5;
  border-radius: 0;
  overflow: hidden;
}
.h-row { display: flex; border-bottom: 1px solid #d4c5a9; }
.h-row:last-child { border-bottom: none; }
.h-label {
  min-width: 3.2em;
  padding: 4px;
  background: #f5f0e8;
  color: #8b2500;
  font-weight: bold;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 1px solid #d4c5a9;
  flex-shrink: 0;
}
.h-scroll {
  display: flex;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: thin;
}
.h-scroll::-webkit-scrollbar { height: 4px; }
.h-scroll::-webkit-scrollbar-thumb { background: #d4c5a9; border-radius: 2px; }
.h-item {
  padding: 3px 6px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 11px;
  color: #3c2415;
  border-right: 1px solid #eee;
  text-align: center;
  flex-shrink: 0;
  min-width: 3.5em;
}
.h-item:hover { background: rgba(184, 134, 11, 0.1); }
.h-item.is-current-time { background: #ffebd2; } /* Darkened background for current time */
.h-item.active { background: #3366cc; color: #fff; }
.h-sub { font-size: 10px; color: inherit; }
.h-arrow {
  padding: 0 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #8b2500;
  border-left: 1px solid #d4c5a9;
  flex-shrink: 0;
  font-size: 14px;
}
.h-arrow:hover { background: rgba(184, 134, 11, 0.1); }
</style>
