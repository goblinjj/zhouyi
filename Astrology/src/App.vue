<script setup>
import { ref, provide } from 'vue'

const isNavVisible = ref(true)
provide('setNavVisible', (val) => { isNavVisible.value = val })
</script>

<template>
  <div v-show="isNavVisible">
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
      <RouterLink class="routelink" to="/">排盘</RouterLink>
      <RouterLink class="routelink" to="/stars">星耀</RouterLink>
      <RouterLink class="routelink" to="/dianji">典籍</RouterLink>
    </nav>
    <div class="divider"></div>
  </div>
  <RouterView />
  <SpeedInsights/>
</template>

<style scoped>
.nav {
  text-align: center;
  padding-bottom: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
}
.taiji-home {
  display: inline-flex;
  width: 1.6em;
  height: 1.6em;
  flex-shrink: 0;
  transition: transform 0.6s ease;
}
.taiji-home:hover {
  transform: rotate(180deg);
  background: none;
}
.routelink {
  color: #3c2415;
  font-size: x-large;
  padding: 0.3em 0.8em;
  display: inline-block;
  letter-spacing: 0.1em;
}
.router-link-active {
  color: #8b2500;
  border-bottom: 2px solid #8b2500;
}
.divider {
  border: none;
  border-top: 1.5px solid #d4c5a9;
  border-bottom: 1px solid #d4c5a9;
  height: 4px;
  margin-bottom: 1.2em;
}
a {
  outline: none;
  text-decoration: none;

  &:hover, &:active {
    -webkit-tap-highlight-color: transparent;
  }
}
a,
a:hover,
a:active,
a:visited,
a:link,
a:focus {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-tap-highlight-color: transparent;
    outline: none;
    background: none;
    text-decoration: none;
}
</style>
