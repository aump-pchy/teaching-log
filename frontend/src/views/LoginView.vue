<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand">
        <div class="brand-icon">
          <i class="ti ti-notebook"></i>
        </div>
        <span class="brand-name">Teaching Log</span>
      </div>

      <div class="hero-text">
        <h1>บันทึกการสอน<br>ครบ จบ ในที่เดียว</h1>
        <p>ระบบจัดการแบบบันทึกการจัดการเรียนการสอน<br>สำหรับรายวิชาในสถานประกอบการ ภาคเรียนที่ 1/2569</p>
      </div>

      <div class="feature-list">
        <div class="feature-item">
          <div class="feature-icon"><i class="ti ti-forms"></i></div>
          <span>กรอกแบบฟอร์มออนไลน์ครบถ้วน</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon"><i class="ti ti-photo-up"></i></div>
          <span>อัปโหลดรูปหลักฐานประกอบการสอน</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon"><i class="ti ti-file-type-pdf"></i></div>
          <span>Export PDF พร้อมพิมพ์ทันที</span>
        </div>
      </div>

      <div class="left-footer">
        <span>© 2569 วิทยาลัยเทคนิคเลย</span>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="card-header">
          <h2>เข้าสู่ระบบ</h2>
          <p>ใช้บัญชีที่ได้รับจากผู้ดูแลระบบ</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field" :class="{ error: errors.email }">
            <label for="email">อีเมล</label>
            <div class="input-wrap">
              <i class="ti ti-mail input-icon"></i>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="yourname@loeitc.ac.th"
                autocomplete="email"
                @input="clearError('email')"
              />
            </div>
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <div class="field" :class="{ error: errors.password }">
            <label for="password">รหัสผ่าน</label>
            <div class="input-wrap">
              <i class="ti ti-lock input-icon"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="รหัสผ่านของคุณ"
                autocomplete="current-password"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
              >
                <i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
              </button>
            </div>
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <div v-if="errors.global" class="alert-error">
            <i class="ti ti-alert-circle"></i>
            {{ errors.global }}
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="!loading">
              <i class="ti ti-login"></i> เข้าสู่ระบบ
            </span>
            <span v-else class="loading-wrap">
              <span class="spinner"></span> กำลังเข้าสู่ระบบ...
            </span>
          </button>
        </form>

        <div class="card-footer">
          <p>หากลืมรหัสผ่าน กรุณาติดต่อ<br><strong>ผู้ดูแลระบบหรือหัวหน้าแผนกวิชา</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '', global: '' })
const loading = ref(false)
const showPassword = ref(false)

function clearError(field) {
  errors[field] = ''
  errors.global = ''
}

function validate() {
  let valid = true
  if (!form.email) {
    errors.email = 'กรุณากรอกอีเมล'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    valid = false
  }
  if (!form.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน'
    valid = false
  }
  return valid
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    router.push('/logs')
  } catch (err) {
    errors.global = err?.response?.data?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap');

* { box-sizing: border-box; }

.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  font-family: 'Sarabun', sans-serif;
}

/* ===== LEFT PANEL ===== */
.login-left {
  background: #0F6E56;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: -100px;
  right: -100px;
}

.login-left::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  top: 80px;
  right: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 64px;
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon i {
  font-size: 20px;
  color: #fff;
}

.brand-name {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.hero-text {
  margin-bottom: 48px;
}

.hero-text h1 {
  font-size: 34px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 16px;
}

.hero-text p {
  font-size: 15px;
  color: rgba(255,255,255,0.75);
  line-height: 1.7;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.9);
  font-size: 14px;
}

.feature-icon {
  width: 34px;
  height: 34px;
  background: rgba(255,255,255,0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  font-size: 17px;
  color: #fff;
}

.left-footer {
  margin-top: 48px;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
}

/* ===== RIGHT PANEL ===== */
.login-right {
  background: #F7F9F7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.card-header {
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: #085041;
  margin-bottom: 6px;
}

.card-header p {
  font-size: 14px;
  color: #6b7280;
}

/* ===== FORM ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 17px;
  color: #9ca3af;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 11px 40px 11px 38px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 15px;
  font-family: 'Sarabun', sans-serif;
  color: #111827;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.input-wrap input:focus {
  border-color: #0F6E56;
  box-shadow: 0 0 0 3px rgba(15, 110, 86, 0.1);
}

.field.error .input-wrap input {
  border-color: #ef4444;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  font-size: 17px;
  display: flex;
  align-items: center;
}

.toggle-password:hover { color: #4b5563; }

.error-msg {
  font-size: 12px;
  color: #ef4444;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #b91c1c;
}

.alert-error i { font-size: 16px; }

.btn-login {
  width: 100%;
  padding: 12px;
  background: #0F6E56;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Sarabun', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) { background: #085041; }
.btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

.loading-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.card-footer {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
}

.card-footer strong {
  color: #0F6E56;
  font-weight: 500;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    padding: 32px 24px;
    gap: 0;
  }

  .brand { margin-bottom: 32px; }
  .hero-text { margin-bottom: 28px; }
  .hero-text h1 { font-size: 26px; }
  .feature-list { gap: 12px; }
  .left-footer { margin-top: 32px; }

  .login-right {
    padding: 32px 24px;
  }
}
</style>