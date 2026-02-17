<script setup>
import { ref, watch } from 'vue'
import { useAiInterpret } from '../composables/useAiInterpret'

const props = defineProps({
  visible: { type: Boolean, default: false },
  chartInfo: { type: String, default: '' },
  scopeDesc: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const { aiLoading, aiContent, aiError, aiDone, startAiInterpret, simpleMarkdown, reset } = useAiInterpret()

const question = ref('')
const showResult = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    question.value = ''
    showResult.value = false
    reset()
  }
})

function submit() {
  if (!props.chartInfo) return
  showResult.value = true
  startAiInterpret(props.chartInfo, question.value)
}

function retry() {
  if (!showResult.value) return
  reset()
  startAiInterpret(props.chartInfo, question.value)
}

function backToInput() {
  showResult.value = false
  reset()
}

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="ai-modal-overlay" @click.self="close">
      <div class="ai-modal">
        <button class="ai-close-btn" @click="close">&times;</button>
        <h2 class="ai-modal-title">AI 解盘</h2>

        <div class="ai-modal-body">
          <!-- Input Area -->
          <div v-if="!showResult" class="ai-input-area">
            <label class="ai-label">想特别了解哪方面？（可选）</label>
            <textarea
              v-model="question"
              class="ai-textarea"
              rows="3"
              maxlength="200"
              placeholder="例如：事业发展、感情婚姻、财运走向、健康状况..."
            ></textarea>
            <p class="ai-scope-hint" v-if="scopeDesc">本次解盘范围：{{ scopeDesc }}</p>
            <p class="ai-hint">初筮告，再三渎，渎则不告。心诚则灵，每日解盘次数有限，望珍惜每次问盘机缘。</p>
            <button class="ai-submit-btn" @click="submit" :disabled="aiLoading">开始解盘</button>
          </div>

          <!-- Result Area -->
          <div v-else class="ai-result-area">
            <!-- Loading -->
            <div v-if="aiLoading && !aiContent" class="ai-loading">
              <span class="ai-loading-dot"></span>
              <span class="ai-loading-dot"></span>
              <span class="ai-loading-dot"></span>
              <span class="ai-loading-text">正在解盘中，请稍候...</span>
            </div>

            <!-- Content -->
            <div
              v-if="aiContent"
              class="ai-content"
              v-html="simpleMarkdown(aiContent) + (aiLoading ? '<span class=\'ai-cursor\'></span>' : '')"
            ></div>

            <!-- Error -->
            <div v-if="aiError" class="ai-error">{{ aiError }}</div>

            <!-- Actions -->
            <div v-if="!aiLoading" class="ai-actions">
              <button v-if="aiError" class="ai-retry-btn" @click="retry">重试</button>
              <button class="ai-back-btn" @click="backToInput">重新提问</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ai-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.ai-modal {
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.ai-close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  z-index: 1;
}
.ai-close-btn:hover { color: #8b2500; }

.ai-modal-title {
  color: #8b2500;
  font-size: 1.2em;
  text-align: center;
  padding: 16px 16px 12px;
  margin: 0;
  border-bottom: 1px solid #d4c5a9;
  letter-spacing: 0.1em;
}

.ai-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}

/* Input area */
.ai-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #3c2415;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.ai-textarea {
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border: 1px solid #d4c5a9;
  border-radius: 4px;
  background: #faf6ef;
  color: #3c2415;
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
}
.ai-textarea:focus {
  outline: none;
  border-color: #b8860b;
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.15);
}

.ai-scope-hint {
  font-size: 12px;
  color: #b8860b;
  background: rgba(184, 134, 11, 0.08);
  border: 1px dashed rgba(184, 134, 11, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 10px 0 0;
  line-height: 1.6;
  text-align: center;
}
.ai-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin: 10px 0 0;
  line-height: 1.7;
  letter-spacing: 0.05em;
}

.ai-submit-btn {
  display: block;
  margin: 14px auto 0;
  background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%);
  color: #fff;
  border: none;
  padding: 8px 28px;
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.08em;
}
.ai-submit-btn:hover { background: linear-gradient(135deg, #c99b1e 0%, #b8860b 100%); }
.ai-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Result area */
.ai-content {
  line-height: 1.9;
  font-size: 14px;
  color: #3c2415;
  letter-spacing: 0.03em;
  min-height: 60px;
}

.ai-content :deep(h1),
.ai-content :deep(h2),
.ai-content :deep(h3),
.ai-content :deep(h4) {
  color: #8b2500;
  margin: 16px 0 8px;
  font-size: 1.05em;
  letter-spacing: 0.08em;
}

.ai-content :deep(h1:first-child),
.ai-content :deep(h2:first-child),
.ai-content :deep(h3:first-child) {
  margin-top: 0;
}

.ai-content :deep(strong) {
  color: #3c2415;
  font-weight: 700;
}

.ai-content :deep(ul),
.ai-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.ai-content :deep(li) {
  margin-bottom: 4px;
}

.ai-content :deep(p) {
  margin: 8px 0;
}

.ai-content :deep(.ai-cursor) {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #8b2500;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s step-end infinite;
}

/* Loading */
.ai-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px 0;
  color: #999;
}

.ai-loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #b8860b;
  animation: loadingBounce 1.2s ease-in-out infinite;
}
.ai-loading-dot:nth-child(2) { animation-delay: 0.2s; }
.ai-loading-dot:nth-child(3) { animation-delay: 0.4s; }

.ai-loading-text {
  font-size: 14px;
  letter-spacing: 0.05em;
  margin-left: 4px;
}

/* Error */
.ai-error {
  padding: 10px 14px;
  background: rgba(194, 54, 22, 0.06);
  border: 1px solid rgba(194, 54, 22, 0.2);
  border-radius: 4px;
  color: #8b2500;
  font-size: 13px;
  margin-top: 12px;
}

/* Actions */
.ai-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.ai-retry-btn, .ai-back-btn {
  font-size: 13px;
  padding: 6px 20px;
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.05em;
}

.ai-retry-btn {
  background: transparent;
  color: #b8860b;
  border: 1px solid #b8860b;
}
.ai-retry-btn:hover { background: #b8860b; color: #fff; }

.ai-back-btn {
  background: transparent;
  color: #999;
  border: 1px solid #d4c5a9;
}
.ai-back-btn:hover { background: #faf6ef; color: #3c2415; }

@keyframes blink {
  50% { opacity: 0; }
}

@keyframes loadingBounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}
</style>
