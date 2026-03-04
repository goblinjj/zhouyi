<script setup>
import Paipan from './views/Paipan.vue'
</script>

<template>
  <nav class="nav">
    <a class="taiji-home" href="/">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs><clipPath id="tc"><circle cx="100" cy="100" r="100"/></clipPath></defs>
        <g clip-path="url(#tc)">
          <circle cx="100" cy="100" r="100" fill="#faf6ef"/>
          <rect x="100" y="0" width="100" height="200" fill="#3a2e2a"/>
          <circle cx="100" cy="50" r="50" fill="#3a2e2a"/>
          <circle cx="100" cy="150" r="50" fill="#faf6ef"/>
          <circle cx="100" cy="50" r="12" fill="#faf6ef"/>
          <circle cx="100" cy="150" r="12" fill="#3a2e2a"/>
        </g>
        <circle cx="100" cy="100" r="96" fill="none" stroke="#c4a97d" stroke-width="3"/>
      </svg>
    </a>
    <span class="nav-title">奇门遁甲</span>
  </nav>
  <div class="divider"></div>
  <Paipan />
</template>

<style scoped>
.nav {
  text-align: center;
  padding-bottom: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.taiji-home {
  display: inline-flex;
  width: 1.6em;
  height: 1.6em;
  flex-shrink: 0;
  transition: transform 0.6s ease;
  outline: none;
  text-decoration: none;
}

.taiji-home:hover {
  transform: rotate(180deg);
  background: none;
}

.nav-title {
  font-family: 'Ma Shan Zheng', 'Noto Serif SC', serif;
  font-size: 1.6em;
  color: #8b2500;
  letter-spacing: 0.15em;
}

.divider {
  border: none;
  border-top: 1.5px solid #d4c5a9;
  border-bottom: 1px solid #d4c5a9;
  height: 4px;
  margin-bottom: 1.2em;
}

.content {
  min-height: 60vh;
}
</style>
