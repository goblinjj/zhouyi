<script setup>
import { ref } from 'vue'
import { useAiInterpret } from '../composables/useAiInterpret'

const props = defineProps({
  chart: Object,
})

const emit = defineEmits(['close'])

const { aiLoading, aiContent, aiError, aiDone, collectChartInfo, startAiInterpret, simpleMarkdown, reset } = useAiInterpret()

const question = ref('')

function handleStart() {
  const chartInfo = collectChartInfo(props.chart)
  startAiInterpret(chartInfo, question.value)
}

function handleClose() {
  reset()
  emit('close')
}
</script>

<template>
  <div class="ai-overlay" @click.self="handleClose">
    <div class="ai-modal">
      <div class="ai-header">
        <h3>AI 解读</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div v-if="!aiContent && !aiLoading" class="ai-input-section">
        <div class="question-row">
          <input
            v-model="question"
            type="text"
            placeholder="想占问什么事项？（可选）"
            class="question-input"
            maxlength="200"
            @keyup.enter="handleStart"
          />
        </div>
        <button class="btn-start" @click="handleStart" :disabled="aiLoading">开始解读</button>
      </div>

      <div v-if="aiLoading && !aiContent" class="ai-loading">
        正在分析盘局...
      </div>

      <div v-if="aiContent" class="ai-content" v-html="simpleMarkdown(aiContent)"></div>

      <div v-if="aiError" class="ai-error">{{ aiError }}</div>
    </div>
  </div>
</template>

<style scoped>
.ai-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
}
.ai-modal {
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 10px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.2em;
}
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8em;
}
.ai-header h3 {
  color: #8b2500;
  font-size: 1.2em;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #9a8c7a;
  cursor: pointer;
  padding: 0 0.3em;
}
.close-btn:hover { color: #3c2415; }
.ai-input-section {
  text-align: center;
}
.question-row {
  margin-bottom: 0.8em;
}
.question-input {
  width: 100%;
  font-family: inherit;
  font-size: 0.95em;
  padding: 0.5em 0.7em;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  background: #faf6ef;
  color: #3c2415;
}
.btn-start {
  background: #8b2500;
  color: #fff;
  border: none;
  padding: 0.5em 2em;
  border-radius: 15px;
  font-size: 1em;
  font-family: inherit;
  cursor: pointer;
}
.btn-start:hover { background: #a03000; }
.btn-start:disabled { opacity: 0.6; cursor: not-allowed; }
.ai-loading {
  text-align: center;
  color: #9a8c7a;
  padding: 2em;
}
.ai-content {
  color: #3c2415;
  line-height: 1.7;
  font-size: 0.95em;
}
.ai-content :deep(h1),
.ai-content :deep(h2),
.ai-content :deep(h3),
.ai-content :deep(h4) {
  color: #8b2500;
  margin: 0.8em 0 0.4em;
}
.ai-content :deep(strong) { color: #8b2500; }
.ai-content :deep(ul) {
  padding-left: 1.2em;
  margin: 0.5em 0;
}
.ai-content :deep(li) {
  margin: 0.3em 0;
}
.ai-error {
  color: #d32f2f;
  background: #fff3e0;
  padding: 0.6em;
  border-radius: 6px;
  margin-top: 0.8em;
  font-size: 0.9em;
  text-align: center;
}
</style>
