<script setup>
import { STAR_ELEMENTS, GATE_ELEMENTS, getWuxingColor } from '../core/constants.js'

defineProps({
  chart: Object,
})

function starColor(star) {
  return getWuxingColor(STAR_ELEMENTS[star])
}
function gateColor(gate) {
  return getWuxingColor(GATE_ELEMENTS[gate])
}
</script>

<template>
  <div class="center-cell">
    <div class="ju-info">
      <span class="dun-type">{{ chart.isYangDun ? '阳遁' : '阴遁' }}</span>
      <span class="ju-num">{{ chart.juNum }}局</span>
    </div>
    <div class="term-info">{{ chart.currentTerm }} · {{ chart.yuan }}元</div>
    <div class="duty-info">
      <div>值符 <span class="duty-star" :style="{ color: starColor(chart.dutyStar) }">{{ chart.dutyStar }}</span></div>
      <div>值使 <span class="duty-gate" :style="{ color: gateColor(chart.dutyGate) }">{{ chart.dutyGate }}</span></div>
    </div>
    <div class="xun-info">{{ chart.xunShou }}旬</div>
    <div class="kong-info" v-if="chart.kongWang">空亡：{{ chart.kongWang.join(' ') }}</div>
  </div>
</template>

<style scoped>
.center-cell {
  background: #faf6ef;
  border: 2px solid #c4a97d;
  border-radius: 6px;
  padding: 0.4em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2em;
  min-height: 6em;
}
.ju-info {
  display: flex;
  gap: 0.3em;
  align-items: center;
}
.dun-type {
  font-size: 0.9em;
  color: #8b2500;
  font-weight: 700;
}
.ju-num {
  font-size: 1.1em;
  color: #8b2500;
  font-weight: 700;
}
.term-info {
  font-size: 0.75em;
  color: #b8860b;
}
.duty-info {
  font-size: 0.7em;
  color: #3c2415;
  text-align: center;
}
.duty-star {
  font-weight: 500;
}
.duty-gate {
  font-weight: 500;
}
.xun-info {
  font-size: 0.7em;
  color: #9a8c7a;
}
.kong-info {
  font-size: 0.65em;
  color: #d32f2f;
}
</style>
