<template>
  <div v-if="patterns.length" class="palace-patterns">
    <span
      v-for="item in patterns"
      :key="item.name"
      class="pattern-tag"
      :class="`scope-${item.scope}`"
      @click.stop="openPattern(item.name, item.scope)"
    >{{ item.name }}</span>
  </div>

  <!-- Pattern Detail Popup -->
  <Teleport to="body">
    <div v-if="activePattern" class="pp-overlay" @click.self="activePattern = null">
      <div class="pp-modal">
        <div class="pp-header">
          <span class="pp-title">{{ activePattern.title }}</span>
          <button class="pp-close" @click="activePattern = null">×</button>
        </div>
        <div class="pp-body">
          <p v-if="activePattern.scope !== 'natal'" class="pp-transient-note" :class="`scope-note-${activePattern.scope}`">
            {{ scopeLabel(activePattern.scope) }}
          </p>
          <p v-if="activePattern.conditions" class="pp-section pp-conditions">{{ activePattern.conditions }}</p>
          <p v-if="activePattern.desc" class="pp-section pp-desc">{{ activePattern.desc }}</p>
          <p v-if="!activePattern.conditions && !activePattern.desc" class="pp-nodesc">暂无典籍记载</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePatternDetection } from '../composables/usePatternDetection'
import classicsData from '@/data/classics'

const props = defineProps({
  selectedPalace: { type: Object, default: null },
  allPalaces: { type: Array, default: () => [] },
  horoscopeData: { type: Object, default: null },
  scopeFlags: { type: Object, default: () => ({}) },
})

const { detectPatterns } = usePatternDetection()

const patterns = computed(() =>
  detectPatterns(props.selectedPalace, props.allPalaces, props.horoscopeData, props.scopeFlags)
)

// 从典籍中查找格局详情
const gejuBook = classicsData.find(b => b.title === '紫微斗数格局详解')

function findSection(name) {
  if (!gejuBook?.sections) return null
  // 先精确匹配，再部分匹配（处理"火贪格·铃贪格"等合并条目）
  return gejuBook.sections.find(s => s.title === name) ||
         gejuBook.sections.find(s => s.title.includes(name) || name.includes(s.title))
}

const activePattern = ref(null)

const SCOPE_LABELS = {
  natal: null,
  decadal: '⚡ 此格局由大运星曜共同促成',
  yearly: '⚡ 此格局由大运/流年星曜共同促成',
  monthly: '⚡ 此格局由大运/流年/流月星曜共同促成',
}

function scopeLabel(scope) {
  return SCOPE_LABELS[scope] || null
}

function openPattern(name, scope = 'natal') {
  const section = findSection(name)
  if (!section) {
    activePattern.value = { title: name, conditions: '', desc: '', scope }
    return
  }
  const content = section.content || ''
  const parts = content.split('\n\n')
  const conditions = parts.find(p => p.startsWith('成格条件：')) || ''
  const desc = parts.find(p => p.startsWith('格局说明：')) || ''
  activePattern.value = { title: name, conditions, desc, scope }
}
</script>

<style scoped>
.palace-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 2px 0;
  justify-content: center;
}
.pattern-tag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  color: #8b2500;
  background: rgba(139, 37, 0, 0.07);
  border: 1px solid rgba(139, 37, 0, 0.22);
  border-radius: 10px;
  padding: 1px 6px;
  font-weight: bold;
  white-space: nowrap;
  letter-spacing: 0.05em;
  line-height: 1.5;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.pattern-tag:hover {
  background: rgba(139, 37, 0, 0.14);
  border-color: rgba(139, 37, 0, 0.45);
}
/* 本命格局 — 深红（默认同 .pattern-tag，无需额外声明） */
.pattern-tag.scope-natal { /* inherits base red */ }

/* 大运格局 — 绿色 */
.pattern-tag.scope-decadal {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.07);
  border-color: rgba(46, 125, 50, 0.28);
}
.pattern-tag.scope-decadal:hover {
  background: rgba(46, 125, 50, 0.15);
  border-color: rgba(46, 125, 50, 0.5);
}

/* 流年格局 — 蓝色 */
.pattern-tag.scope-yearly {
  color: #1565c0;
  background: rgba(21, 101, 192, 0.07);
  border-color: rgba(21, 101, 192, 0.28);
}
.pattern-tag.scope-yearly:hover {
  background: rgba(21, 101, 192, 0.15);
  border-color: rgba(21, 101, 192, 0.5);
}

/* 流月格局 — 紫色 */
.pattern-tag.scope-monthly {
  color: #6a1b9a;
  background: rgba(106, 27, 154, 0.07);
  border-color: rgba(106, 27, 154, 0.28);
}
.pattern-tag.scope-monthly:hover {
  background: rgba(106, 27, 154, 0.15);
  border-color: rgba(106, 27, 154, 0.5);
}

/* Popup */
.pp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}
.pp-modal {
  background: #faf6ef;
  border: 1px solid #d4c5a9;
  border-radius: 10px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid #e5d9c5;
  flex-shrink: 0;
}
.pp-title {
  font-size: 1.05em;
  font-weight: bold;
  color: #8b2500;
  letter-spacing: 0.1em;
}
.pp-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
}
.pp-close:hover { color: #555; }
.pp-body {
  padding: 12px 16px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.75;
  color: #3c2415;
}
.pp-section {
  margin: 0 0 10px;
  white-space: pre-wrap;
}
.pp-conditions {
  background: rgba(139, 37, 0, 0.04);
  border-left: 3px solid #c41e3a;
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
}
.pp-desc {
  background: rgba(184, 134, 11, 0.04);
  border-left: 3px solid #b8860b;
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
}
.pp-nodesc {
  color: #aaa;
  text-align: center;
  padding: 12px 0;
  margin: 0;
}
.pp-transient-note {
  font-size: 11px;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 0 0 8px;
}
.scope-note-decadal {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.07);
  border: 1px solid rgba(46, 125, 50, 0.2);
}
.scope-note-yearly {
  color: #1565c0;
  background: rgba(21, 101, 192, 0.07);
  border: 1px solid rgba(21, 101, 192, 0.2);
}
.scope-note-monthly {
  color: #6a1b9a;
  background: rgba(106, 27, 154, 0.07);
  border: 1px solid rgba(106, 27, 154, 0.2);
}
</style>
