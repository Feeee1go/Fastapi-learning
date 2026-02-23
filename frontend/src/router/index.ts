import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Feed from '@/views/Feed.vue'

const routes = [
  { path: '/', redirect: '/posts' },
  { path: '/login', name: 'login', component: Login },
  { path: '/posts', name: 'feed', component: Feed, meta: { requiresAuth: true } },
  { path: '/register', name: 'register', component: Register },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Simple auth guard based on presence of token in localStorage
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const token = localStorage.getItem('token')
  if (requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
