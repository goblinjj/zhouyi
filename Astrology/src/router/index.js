import { createRouter, createWebHistory } from 'vue-router'
import Paipan from '../views/Paipan.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '排盘',
      component: Paipan
    },
    {
      path: '/stars',
      name: '星耀',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/dianji',
      name: '典籍',
      component: () => import('../views/Classics.vue')
    }
  ]
})

export default router
