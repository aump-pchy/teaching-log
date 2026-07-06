import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(null)

  // 🔄 ดักจับการแปลง JSON เพื่อไม่ให้ระบบพังถ้าข้อมูลใน LocalStorage บิดเบี้ยว
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser && savedUser !== 'undefined') {
      user.value = JSON.parse(savedUser)
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e)
    localStorage.removeItem('user')
  }

  // ⭐ ใช้ตัวนี้เช็กสิทธิ์หน้าบ้านได้เลย ยืดหยุ่นและปลอดภัยกว่า
  const isAdmin = computed(() => {
    const u = user.value?.value || user.value
    return u?.role === 'admin'
  })

  async function login(email, password) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const { data } = await axios.post(`${baseUrl}/auth/login`, { email, password })
    
    token.value = data.token
    user.value  = data.user
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    // 🎯 [สำคัญ] คืนค่าข้อมูล user กลับไปให้ฟังก์ชัน handleLogin ใน LoginView.vue นำไปใช้งานต่อได้ทันที
    return data.user
  }

  // 🟢 เปิดใช้งานระบบ Logout ให้สามารถล้างค่าในเครื่องได้จริงเวลาอาจารย์ใช้งานเสร็จ
  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')       // ล้างค่าสิทธิ์เสริมที่หน้าบ้านเซ็ตไว้
    localStorage.removeItem('full_name')  // ล้างชื่อเสริมที่หน้าบ้านเซ็ตไว้
    delete axios.defaults.headers.common['Authorization']
  }

  // set token on app load
  if (token.value) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return { token, user, isAdmin, login, logout }
})