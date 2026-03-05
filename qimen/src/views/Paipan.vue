<script setup>
import { ref, onMounted } from 'vue'
import { useQimen } from '../composables/useQimen'
import TimeInput from '../components/TimeInput.vue'
import NineGrid from '../components/NineGrid.vue'
import AiInterpret from '../components/AiInterpret.vue'

const { city, inputDate, inputTime, useTrueSolar, chart, initNow, shichenInfo } = useQimen()

const showAi = ref(false)

onMounted(() => {
  initNow()
})
</script>

<template>
  <div class="paipan-page">
    <TimeInput
      v-model:inputDate="inputDate"
      v-model:inputTime="inputTime"
      v-model:city="city"
      v-model:useTrueSolar="useTrueSolar"
      :shichenInfo="shichenInfo"
      @setNow="initNow"
    />

    <div v-if="chart" class="chart-section">
      <!-- 四柱 -->
      <div class="four-pillars">
        <div class="pillar">
          <span class="pillar-label">年柱</span>
          <span class="pillar-value">{{ chart.ganZhi.year.full }}</span>
        </div>
        <div class="pillar">
          <span class="pillar-label">月柱</span>
          <span class="pillar-value">{{ chart.ganZhi.month.full }}</span>
        </div>
        <div class="pillar">
          <span class="pillar-label">日柱</span>
          <span class="pillar-value">{{ chart.ganZhi.day.full }}</span>
        </div>
        <div class="pillar">
          <span class="pillar-label">时柱</span>
          <span class="pillar-value">{{ chart.ganZhi.hour.full }}</span>
        </div>
      </div>

      <!-- 九宫格 -->
      <NineGrid :chart="chart" />

      <!-- AI 解读按钮 -->
      <div class="ai-action">
        <button class="btn-ai" @click="showAi = true">AI 解读</button>
      </div>

      <!-- AI 解读弹窗 -->
      <AiInterpret v-if="showAi" :chart="chart" @close="showAi = false" />
    </div>

    <div v-else class="loading-hint">
      正在计算排盘...
    </div>
  </div>
</template>

<style scoped>
.paipan-page {
  max-width: 700px;
  margin: 0 auto;
}
.chart-section {
  margin-top: 0.5em;
}
.four-pillars {
  display: flex;
  justify-content: center;
  gap: 0.8em;
  margin-bottom: 0.8em;
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 8px;
  padding: 0.6em;
}
.pillar {
  text-align: center;
}
.pillar-label {
  display: block;
  font-size: 0.7em;
  color: #9a8c7a;
}
.pillar-value {
  font-size: 1.1em;
  color: #3c2415;
  font-weight: 600;
  letter-spacing: 0.1em;
}
.ai-action {
  text-align: center;
  margin-top: 1em;
}
.btn-ai {
  background: #8b2500;
  color: #fff;
  border: none;
  padding: 0.5em 2em;
  border-radius: 15px;
  font-size: 1em;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.1em;
}
.btn-ai:hover { background: #a03000; }
.loading-hint {
  text-align: center;
  color: #9a8c7a;
  padding: 2em;
}
</style>
