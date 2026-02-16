<script setup>
import { ref, provide } from 'vue'

const isNavVisible = ref(true)
provide('setNavVisible', (val) => { isNavVisible.value = val })
</script>

<template>
  <div v-show="isNavVisible">
    <nav class="nav">
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
