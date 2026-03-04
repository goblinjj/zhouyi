<script setup>
import { ref } from 'vue'
import DetailPopup from './DetailPopup.vue'
import formatData from '@/data/formatData'

const curItem = ref({})
</script>

<template>
    <main style="margin: 0 auto; max-width: 760px">
        <div v-for="(items, category) in formatData" class="frame">
            <div class="title">{{ category }}</div>
            <div class="parent">
                <span v-for="item in items" class="item" @click="curItem = item">{{ item.title }}</span>
            </div>
        </div>
        <DetailPopup v-model="curItem" />
    </main>
</template>

<style scoped>
.frame {
    padding: 0.6em 0.8em;
    margin-bottom: 0.5em;
    background: #fffcf5;
    border-radius: 6px;
}

.title {
    font-size: large;
    margin-bottom: 0.5em;
    white-space: nowrap;
    color: #b8860b;
    padding-left: 0.6em;
    border-left: 3px solid #8b2500;
}

.item {
    padding: 0.4em 0.7em;
    display: inline-block;
    white-space: nowrap;
    border: 1px solid #d4c5a9;
    border-radius: 4px;
    margin: 0.2em;
    cursor: pointer;
    transition: background 0.2s;
}

.item:hover {
    background: rgba(184, 134, 11, 0.1);
}
</style>
