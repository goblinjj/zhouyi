<script setup>
import { ref, computed } from 'vue'
import classics from '../data/classics.js'

// 分类定义
const categories = [
  { name: '经典赋文', titles: ['太微赋', '形性赋', '增补太微赋', '斗数骨髓赋', '女命骨髓赋'] },
  { name: '论述篇', titles: ['星垣论', '斗数准绳', '斗数发微论', '重补斗数彀率', '谈星要论', '论人命入格', '论格星数高下', '论男女命同异'] },
  { name: '口诀篇', titles: ['十二宫诸星得地合格诀', '十二宫诸星失陷破格诀', '定富局', '定贵局', '定贫贱局', '定杂局', '定富贵贫贱十等论'] },
  { name: '诸星详论', titles: ['诸星问答论'] },
  { name: '安星法', titles: ['安星法'] },
  { name: '格局详解', titles: ['紫微斗数格局详解'] },
]

const activeCategory = ref(0)
const searchQuery = ref('')
const expanded = ref({})
const expandedSubs = ref({})

// 当前分类的条目
const currentItems = computed(() => {
  const cat = categories[activeCategory.value]
  return classics.filter(item => cat.titles.includes(item.title))
})

// 搜索结果
const searchResults = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return []
  return classics.filter(item => {
    if (item.title.includes(q)) return true
    if (item.content && item.content.includes(q)) return true
    if (item.sections) {
      return item.sections.some(s => s.title.includes(q) || s.content.includes(q))
    }
    return false
  }).map(item => {
    // 对有子章节的条目，过滤匹配的子章节
    if (item.sections) {
      const matchedSections = item.sections.filter(s =>
        s.title.includes(q) || s.content.includes(q) || item.title.includes(q)
      )
      return { ...item, sections: matchedSections.length ? matchedSections : item.sections }
    }
    return item
  })
})

const isSearching = computed(() => searchQuery.value.trim().length > 0)
const displayItems = computed(() => isSearching.value ? searchResults.value : currentItems.value)

const toggle = (key) => {
  expanded.value[key] = !expanded.value[key]
}

const toggleSub = (key) => {
  expandedSubs.value[key] = !expandedSubs.value[key]
}

const switchCategory = (index) => {
  activeCategory.value = index
  expanded.value = {}
  expandedSubs.value = {}
}

const clearSearch = () => {
  searchQuery.value = ''
  expanded.value = {}
  expandedSubs.value = {}
}
</script>

<template>
  <div class="classics">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索典籍内容..."
        class="search-input"
      />
      <span v-if="isSearching" class="search-clear" @click="clearSearch">&times;</span>
    </div>

    <!-- 分类标签 -->
    <div v-if="!isSearching" class="tabs">
      <div
        v-for="(cat, ci) in categories"
        :key="ci"
        class="tab"
        :class="{ active: activeCategory === ci }"
        @click="switchCategory(ci)"
      >
        {{ cat.name }}
      </div>
    </div>

    <!-- 搜索提示 -->
    <div v-if="isSearching" class="search-hint">
      找到 {{ searchResults.length }} 条结果
      <span class="search-back" @click="clearSearch">返回分类浏览</span>
    </div>

    <!-- 内容列表 -->
    <div v-for="(item, index) in displayItems" :key="item.title" class="section">
      <div class="section-title" @click="toggle(item.title)">
        <span class="arrow" :class="{ open: expanded[item.title] }">&#9654;</span>
        {{ item.title }}
        <span v-if="item.sections" class="section-count">{{ item.sections.length }}篇</span>
      </div>
      <div v-if="expanded[item.title]" class="section-content">
        <template v-if="item.sections">
          <div v-for="(sub, si) in item.sections" :key="si" class="subsection">
            <div class="subsection-title" @click="toggleSub(item.title + '-' + si)">
              <span class="sub-arrow" :class="{ open: expandedSubs[item.title + '-' + si] }">&#9654;</span>
              {{ sub.title }}
            </div>
            <div v-if="expandedSubs[item.title + '-' + si]" class="subsection-content">{{ sub.content }}</div>
          </div>
        </template>
        <template v-else>
          <div class="content-text">{{ item.content }}</div>
        </template>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="displayItems.length === 0 && isSearching" class="empty">
      未找到相关内容
    </div>
  </div>
</template>

<style scoped>
.classics {
  padding: 0.5em;
  max-width: 800px;
  margin: 0 auto;
}

.search-bar {
  position: relative;
  margin-bottom: 0.6em;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6em 2em 0.6em 0.8em;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  font-size: 0.95em;
  background: #fffcf5;
  color: #3c2415;
  outline: none;
}

.search-input:focus {
  border-color: #b8860b;
}

.search-input::placeholder {
  color: #b0a08a;
}

.search-clear {
  position: absolute;
  right: 0.6em;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.3em;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin-bottom: 0.6em;
}

.tab {
  padding: 0.4em 0.8em;
  border-radius: 4px;
  font-size: 0.9em;
  color: #8b6914;
  background: #f5f0e8;
  border: 1px solid #e0d5c0;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.tab.active {
  background: #8b2500;
  color: #fff;
  border-color: #8b2500;
}

.tab:active {
  opacity: 0.8;
}

.search-hint {
  padding: 0.5em 0;
  font-size: 0.9em;
  color: #8b6914;
  margin-bottom: 0.4em;
}

.search-back {
  margin-left: 1em;
  color: #8b2500;
  cursor: pointer;
  text-decoration: underline;
}

.section {
  margin-bottom: 0.5em;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  overflow: hidden;
}

.section-title {
  padding: 0.8em;
  font-size: large;
  font-weight: bold;
  color: #8b2500;
  background: #f5f0e8;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.section-title:active {
  background: #ebe5d9;
}

.section-count {
  margin-left: auto;
  font-size: 0.7em;
  font-weight: normal;
  color: #b0a08a;
}

.arrow {
  font-size: 0.7em;
  transition: transform 0.2s;
  display: inline-block;
  flex-shrink: 0;
}

.arrow.open {
  transform: rotate(90deg);
}

.section-content {
  padding: 1em;
  font-size: medium;
  line-height: 1.8;
  color: #3c2415;
  white-space: pre-wrap;
  background: #fffcf5;
}

.subsection {
  margin-bottom: 0.3em;
  border-bottom: 1px solid #efe8d8;
}

.subsection:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.subsection-title {
  font-weight: bold;
  color: #b8860b;
  padding: 0.5em 0;
  font-size: medium;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.4em;
}

.subsection-title:active {
  opacity: 0.7;
}

.sub-arrow {
  font-size: 0.6em;
  transition: transform 0.2s;
  display: inline-block;
  flex-shrink: 0;
}

.sub-arrow.open {
  transform: rotate(90deg);
}

.subsection-content {
  white-space: pre-wrap;
  line-height: 1.8;
  padding: 0.5em 0 1em 1.2em;
}

.content-text {
  white-space: pre-wrap;
}

.empty {
  text-align: center;
  padding: 3em 1em;
  color: #b0a08a;
  font-size: 0.95em;
}
</style>
