<script setup>
import { ref, onMounted } from 'vue'
import { useQimen } from '../composables/useQimen'
import { STEM_ELEMENTS, getWuxingColor } from '../core/constants'
import TimeInput from '../components/TimeInput.vue'
import NineGrid from '../components/NineGrid.vue'
import AiInterpret from '../components/AiInterpret.vue'

const { city, inputDate, inputTime, useTrueSolar, chart, initNow, shichenInfo, submitted, triggerPaipan, paipanKey } = useQimen()

const showAi = ref(false)
const ritualOrigin = ref({ x: 0, y: 0 })

function handlePaipan(event) {
  // 优先用鼠标点击坐标；移动端触摸用按钮中心
  let x, y
  if (event && typeof event.clientX === 'number' && event.clientX > 0) {
    x = event.clientX
    y = event.clientY
  } else if (event?.currentTarget?.getBoundingClientRect) {
    const r = event.currentTarget.getBoundingClientRect()
    x = r.left + r.width / 2
    y = r.top + r.height / 2
  } else {
    x = window.innerWidth / 2
    y = window.innerHeight / 2
  }
  ritualOrigin.value = { x, y }
  triggerPaipan()
}

// 地支五行映射
const BRANCH_ELEMENTS = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

function stemColor(s) { return getWuxingColor(STEM_ELEMENTS[s]) }
function branchColor(b) { return getWuxingColor(BRANCH_ELEMENTS[b]) }

onMounted(() => {
  // 预填当前日期时间，但不自动排盘
  initNow()
})
</script>

<template>
  <div class="paipan-page">
    <!-- 起局仪式水印（每次排盘从点击位置浮现） -->
    <div
      v-if="submitted"
      :key="paipanKey"
      class="ritual-overlay"
      :style="{ left: ritualOrigin.x + 'px', top: ritualOrigin.y + 'px' }"
    >
      <span class="ritual-text">起</span>
    </div>

    <TimeInput
      v-model:inputDate="inputDate"
      v-model:inputTime="inputTime"
      v-model:city="city"
      v-model:useTrueSolar="useTrueSolar"
      :shichenInfo="shichenInfo"
      @setNow="initNow"
      @paipan="handlePaipan"
    />

    <div v-if="submitted && chart" class="chart-section">
      <!-- 四柱 -->
      <div class="four-pillars">
        <div class="pillar" v-for="key in ['year', 'month', 'day', 'hour']" :key="key">
          <span class="pillar-label">{{ {year:'年柱',month:'月柱',day:'日柱',hour:'时柱'}[key] }}</span>
          <span class="pillar-value">
            <span :style="{ color: stemColor(chart.ganZhi[key].stem) }">{{ chart.ganZhi[key].stem }}</span>
            <span :style="{ color: branchColor(chart.ganZhi[key].branch) }">{{ chart.ganZhi[key].branch }}</span>
          </span>
        </div>
      </div>

      <!-- 九宫格 -->
      <NineGrid :chart="chart" :paipanKey="paipanKey" />

      <!-- AI 解读按钮 -->
      <div class="ai-action">
        <button class="btn-ai" @click="showAi = true">AI 解读</button>
      </div>

      <!-- AI 解读弹窗 -->
      <AiInterpret v-if="showAi" :chart="chart" @close="showAi = false" />
    </div>

    <div v-else-if="submitted" class="loading-hint">
      正在计算排盘...
    </div>
    <div v-else class="loading-hint">
      请选择日期时间后点击"奇门起局"按钮
    </div>
  </div>
</template>

<style scoped>
.paipan-page {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}
.ritual-overlay {
  position: fixed;
  pointer-events: none;
  z-index: 60;
  animation: ritual-flash 1.4s ease-out forwards;
}
.ritual-text {
  display: inline-block;
  font-family: 'Ma Shan Zheng', 'Noto Serif SC', serif;
  font-size: 6em;
  color: #8b2500;
  text-shadow:
    0 0 18px rgba(184, 134, 11, 0.6),
    0 0 36px rgba(139, 37, 0, 0.4);
  padding: 0.15em 0.35em;
}
@keyframes ritual-flash {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
    filter: blur(6px);
  }
  25% {
    opacity: 1;
    transform: translate(-50%, -55%) scale(1);
    filter: blur(0);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -90%) scale(1.25);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -140%) scale(1.6);
    filter: blur(3px);
  }
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
