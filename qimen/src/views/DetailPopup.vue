<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['modelValue'])
const curTab = ref('info')

const emits = defineEmits(['update:modelValue'])

const hidden = () => {
    curTab.value = 'info'
    emits('update:modelValue', '')
}

const formatText = (text) => {
    return text.replace(/\/(.*?)\//g, (m, p1) => {
        return '<span style="color: #c41e3a;">' + p1 + '</span>'
    })
}

// 属性字段（排除 title, category, all, 经典）
const attrFields = ['本宫', '五行', '吉凶', '八卦', '方位', '天干', '地支', '人体', '家庭']

const handleEsc = (event) => {
    if (event.key === 'Escape') {
        hidden()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleEsc)
})
</script>

<template>
    <div v-if="props.modelValue.title" class="frame2">
        <div @click="hidden" style="text-align: right; padding: 0.5em; cursor: pointer;">✕</div>
        <div class="title">{{ props.modelValue.category.title }} → {{ props.modelValue.title }}</div>

        <div class="tabs" v-if="props.modelValue.经典">
            <span class="tab" :class="{ active: curTab === 'info' }" @click="curTab = 'info'">释义</span>
            <span class="tab" :class="{ active: curTab === 'classic' }" @click="curTab = 'classic'">经典</span>
        </div>

        <div v-if="curTab === 'info'" class="content-area">
            <div class="attrs">
                <span v-for="field in attrFields" :key="field">
                    <span v-if="props.modelValue[field]" class="attr">
                        <span class="attr-label">{{ field }}</span>
                        <span class="attr-value">{{ props.modelValue[field] }}</span>
                    </span>
                </span>
            </div>
            <div class="text" v-html="formatText(props.modelValue.all)" />
        </div>

        <div v-if="curTab === 'classic'" class="content-area">
            <div class="classic-text">{{ props.modelValue.经典 }}</div>
        </div>
    </div>
</template>

<style scoped>
.frame2 {
    width: 100%;
    height: 100vh;
    background: #faf6ef;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2000;
}

.title {
    font-size: x-large;
    padding: 0.3em;
    color: #8b2500;
}

.tabs {
    display: flex;
    padding: 0 0.5em;
    gap: 0;
    border-bottom: 1px solid #d4c5a9;
}

.tab {
    padding: 0.5em 1.2em;
    cursor: pointer;
    font-size: large;
    color: #666;
    border-bottom: 2px solid transparent;
    user-select: none;
}

.tab.active {
    color: #8b2500;
    border-bottom-color: #8b2500;
}

.content-area {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.attrs {
    display: flex;
    flex-wrap: wrap;
    padding: 0.5em;
    gap: 0.4em;
}

.attr {
    display: inline-flex;
    border: 1px solid #d4c5a9;
    border-radius: 4px;
    overflow: hidden;
}

.attr-label {
    background: #8b2500;
    color: white;
    padding: 0.3em 0.5em;
    font-size: 0.85em;
}

.attr-value {
    padding: 0.3em 0.5em;
    font-size: 0.85em;
    color: #3c2415;
}

.text {
    padding: 0.5em;
    font-size: large;
    margin-top: 0.5em;
    line-height: 1.8;
}

.classic-text {
    padding: 1em;
    font-size: medium;
    line-height: 2;
    color: #3c2415;
    white-space: pre-wrap;
}
</style>
