<template>
  <div v-if="patterns.length" class="palace-patterns">
    <span
      v-for="name in patterns"
      :key="name"
      class="pattern-tag"
    >{{ name }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePatternDetection } from '../composables/usePatternDetection'

const props = defineProps({
  selectedPalace: { type: Object, default: null },
  allPalaces: { type: Array, default: () => [] },
})

const { detectPatterns } = usePatternDetection()

const patterns = computed(() => detectPatterns(props.selectedPalace, props.allPalaces))
</script>

<style scoped>
.palace-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 3px 0;
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
}
</style>
