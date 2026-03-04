<script setup>
defineProps({
  palace: Object,
})
</script>

<template>
  <div class="palace-cell">
    <div class="god" v-if="palace.god">{{ palace.god }}</div>
    <div class="star-row">
      <span class="star">{{ palace.star }}</span>
      <span class="heaven-stem" v-if="palace.heavenStem">{{ palace.heavenStem }}</span>
    </div>
    <div class="gate" v-if="palace.gate">{{ palace.gate }}</div>
    <div class="earth-stem">{{ palace.earthStem }}</div>
    <div class="palace-name">{{ palace.name }}</div>
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
  color: #7b1fa2;
  letter-spacing: 0.05em;
}
.star-row {
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.star {
  font-size: 0.85em;
  color: #1976d2;
  font-weight: 600;
}
.heaven-stem {
  font-size: 0.85em;
  color: #d32f2f;
  font-weight: 600;
}
.gate {
  font-size: 0.85em;
  color: #388e3c;
  font-weight: 500;
}
.earth-stem {
  font-size: 0.85em;
  color: #3c2415;
  font-weight: 500;
}
.palace-name {
  font-size: 0.6em;
  color: #9a8c7a;
  position: absolute;
  bottom: 0.2em;
  right: 0.3em;
}
</style>
