<script setup>
import { ref } from 'vue'
import pop from './Popup.vue'
import formatStar from '@/data/formatStar'

const curTitle = ref({})
</script>

<template>
    <main style="margin: 0 auto; max-width: 760px">
        <div v-for="(c, k) in formatStar" class="frame">
            <div class="title">{{ k }}</div>
            <div class="parent">
                <span v-for="s in c" class="star" @click="curTitle = s">{{ s.title }}</span>
            </div>
        </div>
        <pop v-model="curTitle"></pop>
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

.star {
    padding: 0.4em 0.7em;
    display: inline-block;
    white-space: nowrap;
    border: 1px solid #d4c5a9;
    border-radius: 4px;
    margin: 0.2em;
    cursor: pointer;
    transition: background 0.2s;
}

.star:hover {
    background: rgba(184, 134, 11, 0.1);
}
</style>
