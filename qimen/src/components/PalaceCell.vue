<script setup>
import { STAR_ELEMENTS, GATE_ELEMENTS, GOD_ELEMENTS, STEM_ELEMENTS, PALACE_ELEMENTS, getWuxingColor } from '../core/constants.js'

defineProps({
  palace: Object,
})

function starColor(star) {
  return getWuxingColor(STAR_ELEMENTS[star])
}
function gateColor(gate) {
  return getWuxingColor(GATE_ELEMENTS[gate])
}
function godColor(god) {
  return getWuxingColor(GOD_ELEMENTS[god])
}
function stemColor(stem) {
  return getWuxingColor(STEM_ELEMENTS[stem])
}
function palaceColor(number) {
  return getWuxingColor(PALACE_ELEMENTS[number])
}
</script>

<template>
  <div class="palace-cell">
    <div class="god" v-if="palace.god" :style="{ color: godColor(palace.god) }">{{ palace.god }}</div>
    <div class="star-row">
      <span class="star" :style="{ color: starColor(palace.star) }">{{ palace.star }}</span>
      <span class="heaven-stem" v-if="palace.heavenStem" :style="{ color: stemColor(palace.heavenStem) }">{{ palace.heavenStem }}</span>
    </div>
    <div class="gate" v-if="palace.gate" :style="{ color: gateColor(palace.gate) }">{{ palace.gate }}</div>
    <div class="earth-stem" :style="{ color: stemColor(palace.earthStem) }">{{ palace.earthStem }}</div>
    <div class="palace-name" :style="{ color: palaceColor(palace.number) }">{{ palace.name }}</div>
  </div>
</template>

<style scoped>
.palace-cell {
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  padding: 0.4em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15em;
  min-height: 6em;
  position: relative;
}
.god {
  font-size: 0.7em;
  letter-spacing: 0.05em;
}
.star-row {
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.star {
  font-size: 0.85em;
  font-weight: 600;
}
.heaven-stem {
  font-size: 0.85em;
  font-weight: 600;
}
.gate {
  font-size: 0.85em;
  font-weight: 500;
}
.earth-stem {
  font-size: 0.85em;
  font-weight: 500;
}
.palace-name {
  font-size: 0.6em;
  position: absolute;
  bottom: 0.2em;
  right: 0.3em;
}
</style>
