<script setup>
import { ref } from 'vue'
import { CITIES } from '@shared/cities'

const props = defineProps({
  inputDate: String,
  inputTime: String,
  city: Object,
  useTrueSolar: Boolean,
  shichenInfo: Object,
})

const emit = defineEmits(['update:inputDate', 'update:inputTime', 'update:city', 'update:useTrueSolar', 'setNow'])

const cityQuery = ref('')
const showDropdown = ref(false)
const filteredCities = ref([])

function onCityInput() {
  const q = cityQuery.value.trim()
  if (!q) {
    filteredCities.value = []
    showDropdown.value = false
    return
  }
  const qLower = q.toLowerCase()
  filteredCities.value = CITIES.filter(
    c => c.name.includes(q) || c.nameEn.toLowerCase().includes(qLower)
  ).slice(0, 10)
  showDropdown.value = filteredCities.value.length > 0
}

function selectCity(city) {
  emit('update:city', { name: city.name, lng: city.lng, lat: city.lat, tz: city.tz })
  cityQuery.value = ''
  showDropdown.value = false
}

function handleClickOutside(e) {
  const el = document.querySelector('.city-search-wrapper')
  if (el && !el.contains(e.target)) {
    showDropdown.value = false
  }
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="time-input">
    <div class="input-row">
      <span class="label">城市</span>
      <div class="city-search-wrapper">
        <div class="city-input-row">
          <input
            type="text"
            v-model="cityQuery"
            @input="onCityInput"
            @focus="onCityInput"
            placeholder="搜索城市..."
            class="input"
          />
          <span v-if="city.name" class="selected-city">{{ city.name }}</span>
        </div>
        <ul v-if="showDropdown" class="city-dropdown">
          <li
            v-for="c in filteredCities"
            :key="c.nameEn + c.lng"
            @mousedown.prevent="selectCity(c)"
          >
            {{ c.name }}
            <span class="city-en">{{ c.nameEn }}</span>
            <span class="city-province" v-if="c.province">{{ c.province }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="input-row">
      <span class="label">日期</span>
      <input type="date" :value="inputDate" @input="emit('update:inputDate', $event.target.value)" class="input" />
      <span class="label">时间</span>
      <input type="time" :value="inputTime" @input="emit('update:inputTime', $event.target.value)" class="input" />
    </div>

    <div class="input-row">
      <label class="checkbox-label">
        <input type="checkbox" :checked="useTrueSolar" @change="emit('update:useTrueSolar', $event.target.checked)" />
        真太阳时
      </label>
      <span v-if="useTrueSolar && shichenInfo" class="tst-value">{{ shichenInfo.tstText }} · {{ shichenInfo.shichen.name }} · {{ shichenInfo.hourGZ }}时</span>
      <button class="btn-now" @click="emit('setNow')">当前时间</button>
    </div>
  </div>
</template>

<style scoped>
.time-input {
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 8px;
  padding: 0.8em 1em;
  margin-bottom: 1em;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin: 0.5em 0;
  flex-wrap: wrap;
}
.label {
  color: #3c2415;
  min-width: 2.5em;
  flex-shrink: 0;
  font-size: 0.95em;
}
.input {
  font-family: inherit;
  font-size: 0.95em;
  padding: 0.35em 0.5em;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  background: #faf6ef;
  color: #3c2415;
  flex: 1;
  max-width: 200px;
}
.city-search-wrapper {
  position: relative;
  flex: 1;
  max-width: 280px;
}
.city-input-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.city-input-row .input {
  max-width: none;
  flex: 1;
}
.selected-city {
  color: #8b2500;
  font-weight: 500;
  white-space: nowrap;
  font-size: 0.95em;
}
.city-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fffcf5;
  border: 1px solid #d4c5a9;
  border-radius: 6px;
  margin-top: 2px;
  padding: 0;
  list-style: none;
  z-index: 100;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.city-dropdown li {
  padding: 0.45em 0.7em;
  cursor: pointer;
  border-bottom: 1px solid #efe8d8;
  color: #3c2415;
  font-size: 0.9em;
}
.city-dropdown li:last-child { border-bottom: none; }
.city-dropdown li:hover { background: #f5ede0; }
.city-en { color: #9a8c7a; font-size: 0.85em; margin-left: 0.4em; }
.city-province { color: #9a8c7a; font-size: 0.85em; margin-left: 0.3em; }
.city-province::before { content: '·'; margin-right: 0.3em; }
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.3em;
  color: #3c2415;
  font-size: 0.9em;
  cursor: pointer;
}
.btn-now {
  background: #8b2500;
  color: #fff;
  border: none;
  padding: 0.35em 1em;
  border-radius: 15px;
  font-size: 0.9em;
  font-family: inherit;
  cursor: pointer;
  margin-left: auto;
}
.btn-now:hover { background: #a03000; }
.tst-value {
  color: #8b2500;
  font-size: 0.9em;
  font-weight: 500;
}
</style>
