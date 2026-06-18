<template>
  <div class="forgot-container">
    <div class="form-card">
      <div class="brand">
        <i class="ti ti-notebook"></i>
        <span>Teaching Log</span>
      </div>
      
      <h2>ลืมรหัสผ่านใช่ไหมอ้าย?</h2>
      <p class="subtitle">กรอกอีเมลที่ใช้อยู่ในระบบ ระบบจะส่งคำขอไปยังผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่านให้ครับ</p>

      <form @submit.prevent="handleSubmit" class="forgot-form">
        <div class="form-group">
          <label>อีเมลของคุณ</label>
          <div class="input-wrapper">
            <i class="ti ti-mail input-icon"></i>
            <input 
              v-model="email" 
              type="email" 
              placeholder="yourname@email.com" 
              required
            />
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <i class="ti ti-send"></i> {{ loading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอรีเซ็ตรหัสผ่าน' }}
        </button>
      </form>

      <div class="form-footer">
        <router-link to="/login"><i class="ti ti-arrow-back-up"></i> กลับไปหน้าเข้าสู่ระบบ</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const email = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    await axios.post(`${API_URL}/auth/forgot-password`, { email: email.value })
    alert('🚀 ส่งคำขอสำเร็จแล้วครับอ้าย! กรุณาติดต่อ Admin หรือหัวหน้าแผนกวิชาเพื่อขอรับรหัสผ่านใหม่ได้เลยครับ')
    email.value = ''
  } catch (err) {
    console.error(err)
    const errorMsg = err.response?.data?.error || 'ไม่พบอีเมลนี้ในระบบคอมพิวเตอร์'
    alert(`เกิดข้อผิดพลาด: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #F9FAFB;
  font-family: 'Sarabun', sans-serif;
  padding: 20px;
}
.form-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #085041;
  font-weight: 600;
  margin-bottom: 24px;
}
h2 {
  color: #085041;
  font-size: 24px;
  margin-bottom: 8px;
}
.subtitle {
  color: #6B7280;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
}
.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  color: #9CA3AF;
}
input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #D1D5DB;
  border-radius: 8px;
  outline: none;
}
input:focus {
  border-color: #085041;
}
.btn-submit {
  background-color: #085041;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-submit:hover {
  background-color: #063C31;
}
.form-footer {
  text-align: center;
  margin-top: 24px;
}
.form-footer a {
  color: #085041;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>