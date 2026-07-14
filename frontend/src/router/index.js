import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // คนที่ 1: Auth
  { path: '/login', component: () => import('../views/LoginView.vue') },
  // 🟢 เส้นทางหน้าสมัครสมาชิก (Register)
  { path: '/register', component: () => import('../views/registerView.vue') }, 
  
  // 🔑 🛠️ เพิ่มหน้าลืมรหัสผ่าน (ForgotPassword) ตรงนี้เลยครับอ้าย!
  { path: '/forgot-password', component: () => import('../views/ForgotPasswordView.vue') },

  { path: '/admin/users', component: () => import('../views/UserManageView.vue'), meta: { requiresAuth: true } },

  // 🎯 ดักจับลิงก์เก่า: ถ้าหลุดมาที่ /user-management ให้ดีดส่งต่อไปหน้าปัจจุบันทันที ไม่ค้างจอขาว
  { path: '/user-management', redirect: '/admin/users' },

  // คนที่ 2: Log Form
  { path: '/logs/new', component: () => import('../views/LogFormView.vue'), meta: { requiresAuth: true } },
  { path: '/logs/:id/edit', component: () => import('../views/LogFormView.vue'), meta: { requiresAuth: true } },

  // คนที่ 3: Log List
  { path: '/logs', component: () => import('../views/LogListView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/config', component: () => import('../views/AdminConfigView.vue'), meta: { requiresAuth: true, adminOnly: true } },

  // คนที่ 4: Log Detail
  { path: '/logs/:id', component: () => import('../views/LogDetailView.vue'), meta: { requiresAuth: true } },

  { path: '/departments', component: () => import('../views/DepartmentsView.vue'), meta: { requiresAuth: true } },

  // 👥 หน้าผู้จัดทำ — ดูได้ทั้งคนที่ล็อกอินและยังไม่ล็อกอิน
  { path: '/credits', component: () => import('../views/CreditsView.vue') },

  // 🟢 default: เปลี่ยนจากหน้า Landing ให้เข้าหน้า Login ทันทีที่เข้าเว็บ
  { path: '/', component: () => import('../views/LoginView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🟢 ปรับปรุงการตรวจสอบสิทธิ์ให้ปลอดภัยและแม่นยำขึ้น
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  // 🏠 ถ้าล็อกอินอยู่แล้ว แล้วกดกลับมาที่ '/' (เช่นปุ่ม "กลับหน้าหลัก")
  //    อย่าโชว์หน้า Login ซ้ำ ให้เด้งไปหน้าบันทึกการสอนแทน
  if (to.path === '/' && token) {
    return '/logs'
  }

  // เช็กว่าหน้าที่จะไปต้องการ Token ไหม แต่ผู้ใช้ไม่มี Token
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }
  
  // เช็กสิทธิ์แอดมิน (ป้องกันตัวพิมพ์เล็กพิมพ์ใหญ่ และเช็กสิทธิ์ซ้ำซ้อน)
  if (to.meta.adminOnly) {
    const userRole = localStorage.getItem('role')
    if (userRole !== 'admin') {
      return '/logs' // ถ้าไม่ใช่แอดมินให้ดีดไปหน้าดูรายการสอนปกติ
    }
  }
  
  // ถ้าผ่านเงื่อนไขทั้งหมด ให้ปล่อยผ่านไปหน้าเป้าหมายได้เลย
  return true
})

export default router