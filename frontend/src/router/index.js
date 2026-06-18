import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // คนที่ 1: Auth
  { path: '/login', component: () => import('../views/LoginView.vue') },
  // 🟢 เส้นทางหน้าสมัครสมาชิก (Register)
  { path: '/register', component: () => import('../views/registerView.vue') }, 
  
  // 🔑 🛠️ เพิ่มหน้าลืมรหัสผ่าน (ForgotPassword) ตรงนี้เลยครับอ้าย!
  { path: '/forgot-password', component: () => import('../views/ForgotPasswordView.vue') },

  { path: '/admin/users', component: () => import('../views/UserManageView.vue'), meta: { requiresAuth: true, adminOnly: true } },

  // 🎯 ดักจับลิงก์เก่า: ถ้าหลุดมาที่ /user-management ให้ดีดส่งต่อไปหน้าปัจจุบันทันที ไม่ค้างจอขาว
  { path: '/user-management', redirect: '/admin/users' },

  // คนที่ 2: Log Form
  { path: '/logs/new', component: () => import('../views/LogFormView.vue'), meta: { requiresAuth: true } },
  { path: '/logs/:id/edit', component: () => import('../views/LogFormView.vue'), meta: { requiresAuth: true } },

  // คนที่ 3: Log List
  { path: '/logs', component: () => import('../views/LogListView.vue'), meta: { requiresAuth: true } },

  // คนที่ 4: Log Detail
  { path: '/logs/:id', component: () => import('../views/LogDetailView.vue'), meta: { requiresAuth: true } },

  // default
  { path: '/', component: () => import('../views/LandingView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) return '/login'
  if (to.meta.adminOnly && auth.user?.role !== 'admin') return '/logs'
})

export default router