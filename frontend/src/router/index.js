import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // คนที่ 1: Auth
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/admin/users', component: () => import('../views/UserManageView.vue'), meta: { requiresAuth: true, adminOnly: true } },

  // คนที่ 2: Log Form
  { path: '/logs/new', component: () => import('../views/LogFormView.vue'), meta: { requiresAuth: true } },
  { path: '/logs/:id/edit', component: () => import('../views/LogFormView.vue'), meta: { requiresAuth: true } },

  // คนที่ 3: Log List
  { path: '/logs', component: () => import('../views/LogListView.vue'), meta: { requiresAuth: true } },

  // คนที่ 4: Log Detail
  { path: '/logs/:id', component: () => import('../views/LogDetailView.vue'), meta: { requiresAuth: false } },

  // default
  { path: '/', component: () => import('../views/LandingView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) return next('/login')
  if (to.meta.adminOnly && auth.user?.role !== 'admin') return next('/logs')
  next()
})

export default router
