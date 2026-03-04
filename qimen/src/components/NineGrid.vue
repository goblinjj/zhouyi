<script setup>
import PalaceCell from './PalaceCell.vue'
import CenterCell from './CenterCell.vue'
import { PALACE_GRID } from '../core/constants'

defineProps({
  chart: Object,
})

// Ordered for the 3x3 洛书 grid: 4 9 2 / 3 5 7 / 8 1 6
const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6]
</script>

<template>
  <div class="nine-grid">
    <template v-for="p in gridOrder" :key="p">
      <CenterCell v-if="p === 5" :chart="chart" />
      <PalaceCell v-else :palace="chart.palaces[p]" />
    </template>
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
</style>
