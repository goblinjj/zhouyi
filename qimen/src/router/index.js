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
      path: '/knowledge',
      name: '知识库',
      component: () => import('../views/Knowledge.vue')
    }
  ]
})

export default router
