import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email, password) {
    // const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password })
    // token.value = data.token
    // user.value  = data.user
    // localStorage.setItem('token', data.token)
    // localStorage.setItem('user',  JSON.stringify(data.user))
    // axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
  }

  function logout() {
    // token.value = null
    // user.value  = null
    // localStorage.removeItem('token')
    // localStorage.removeItem('user')
    // delete axios.defaults.headers.common['Authorization']
  }

  // set token on app load
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return { token, user, isAdmin, login, logout }
})
