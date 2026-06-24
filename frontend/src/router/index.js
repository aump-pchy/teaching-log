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

  { path: '/departments', component: () => import('../views/DepartmentsView.vue'), meta: { requiresAuth: true } },

  // default
  { path: '/', component: () => import('../views/LandingView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🟢 ปรับปรุงการตรวจสอบสิทธิ์ให้ปลอดภัยและแม่นยำขึ้น
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  // เช็กว่าหน้าที่จะไปต้องการ Token ไหม แต่ผู้ใช้ไม่มี Token
  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }
  
  // เช็กสิทธิ์แอดมิน (ป้องกันตัวพิมพ์เล็กพิมพ์ใหญ่ และเช็กสิทธิ์ซ้ำซ้อน)
  if (to.meta.adminOnly) {
    const userRole = auth.user?.role ? auth.user.role.toLowerCase() : ''
    if (userRole !== 'admin') {
      return next('/logs') // ถ้าไม่ใช่แอดมินให้ดีดไปหน้าดูรายการสอนปกติ
    }
  }
  
  // ถ้าผ่านเงื่อนไขทั้งหมด ให้ปล่อยผ่านไปหน้าเป้าหมายได้เลย
  next()
})

export default router