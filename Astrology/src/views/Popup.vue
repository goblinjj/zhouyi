<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['modelValue'])
const curGong = ref('')
const curTab = ref('info')
const gong = [
    '命宫',
    '兄弟宫',
    '夫妻宫',
    '子女宫',
    '财帛宫',
    '疾厄宫',
    '迁移宫',
    '交友宫',
    '官禄宫',
    '田宅宫',
    '福禄宫',
    '父母宫',
]

const emits = defineEmits(['update:modelValue'])

const hidden = () => {
    curGong.value = ''
    curTab.value = 'info'
    emits('update:modelValue', '')
}

const formatText = (text) => {
    return text.replace(/\/(.*?)\//g, (m, p1) => {
        return '<span style="color: #c41e3a;">' + p1 + '</span>'
    })
}

const handleEsc = (event) => {
    if (event.key === 'Escape') {
        hidden();
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleEsc);
})
</script>

<template>
    <div v-if="props.modelValue.title" class="frame2">
        <div @click="hidden" style="text-align: right; padding: 0.5em"><img src="/close.png" style="width: 30px;"></div>
        <div class="title">{{ props.modelValue.category.title }} -> {{ props.modelValue.title }}</div>

        <div class="tabs" v-if="props.modelValue.经典">
            <span class="tab" :class="{ active: curTab === 'info' }" @click="curTab = 'info'">释义</span>
            <span class="tab" :class="{ active: curTab === 'classic' }" @click="curTab = 'classic'">经典</span>
        </div>

        <div v-if="curTab === 'info'" class="content-area">
            <div class="text" v-html="formatText(props.modelValue.all)" />
            <div class="all">
                <div class="text gong-text" v-if="props.modelValue[curGong]"
                    v-html="formatText(props.modelValue[curGong])" />
                <div class="gong-buttons">
                    <span v-for="g in gong">
                        <span v-if="props.modelValue[g]" class="s" :class="{ select: curGong === g }" @click="curGong = g">{{ g }}</span>
                    </span>
                </div>
            </div>
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

.s {
    padding: 0.5em;
    width: 25%;
    display: inline-block;
    text-align: center;
    border: 1px solid #d4c5a9;
    border-radius: 4px;
    cursor: pointer;
}

.s.select {
    background: #8b2500;
    color: white;
    border-color: #8b2500;
}

.text {
    padding: 0.5em;
    font-size: large;
    margin-top: 1em;
}

.gong-text {
    color: #8b2500;
    margin-bottom: 1em;
}

.all {
    margin-top: auto;
    padding-bottom: 3em;
    width: 100%;
}

.gong-buttons {
    padding-top: 0.5em;
}

.classic-text {
    padding: 1em;
    font-size: medium;
    line-height: 2;
    color: #3c2415;
    white-space: pre-wrap;
}
</style>
