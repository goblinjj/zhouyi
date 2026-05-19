<script setup>
import PalaceCell from './PalaceCell.vue'
import CenterCell from './CenterCell.vue'

defineProps({
  chart: Object,
  paipanKey: { type: Number, default: 0 },
})

// 洛书排列：4 9 2 / 3 5 7 / 8 1 6
const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6]
// 起局顺序：中宫起戊 → 坎一 → 坤二 → 震三 → 巽四 → 乾六 → 兑七 → 艮八 → 离九
const revealOrder = { 5: 0, 1: 1, 2: 2, 3: 3, 4: 4, 6: 5, 7: 6, 8: 7, 9: 8 }
</script>

<template>
  <div class="nine-grid" :key="paipanKey">
    <div
      v-for="p in gridOrder"
      :key="p"
      class="palace-slot"
      :style="{ '--reveal-delay': (revealOrder[p] * 100) + 'ms' }"
    >
      <CenterCell v-if="p === 5" :chart="chart" />
      <PalaceCell v-else :palace="chart.palaces[p]" />
    </div>
  </div>
</template>

<style scoped>
.nine-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3em;
  max-width: 600px;
  margin: 0 auto;
}
.palace-slot {
  animation: palace-reveal 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  animation-delay: var(--reveal-delay, 0ms);
  transform-origin: center center;
}
@keyframes palace-reveal {
  0% {
    opacity: 0;
    transform: scale(0.6) rotate(-4deg);
    filter: blur(3px);
  }
  60% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
    filter: blur(0);
  }
}
</style>
