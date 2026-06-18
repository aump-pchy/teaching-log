<template>
  <div class="register-page">
    <div class="register-left">
      <div class="brand">
        <div class="brand-icon">
          <i class="ti ti-notebook"></i>
        </div>
        <span class="brand-name">Teaching Log</span>
      </div>

      <div class="hero-text">
        <h1>เริ่มต้นใช้งาน<br>ระบบบันทึกการสอน</h1>
        <p>สร้างบัญชีผู้ใช้งานใหม่ เพื่อเข้าจัดการแบบบันทึกการเรียนการสอนสำหรับรายวิชาในสถานประกอบการ</p>
      </div>

      <div class="register-guidelines">
        <h3><i class="ti ti-shield-check"></i> ข้อแนะนำการลงทะเบียน</h3>
        <ul>
          <li>กรุณาใช้ <strong>อีเมลของสถาบัน</strong> (@loeitc.ac.th) ในการสมัคร</li>
          <li>เลือกแผนกวิชาต้นสังกัดของอ้ายให้ถูกต้อง เพื่อการจัดกลุ่มรายงาน</li>
          <li>รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป</li>
        </ul>
      </div>

      <div class="left-footer">
        <span>© 2569 วิทยาลัยเทคนิคเลย</span>
      </div>
    </div>

    <div class="register-right">
      <div class="register-card">
        <div class="card-header">
          <h2>สมัครสมาชิกใหม่</h2>
          <p>กรอกข้อมูลรายละเอียดของอ้ายเพื่อเปิดสิทธิ์เข้าใช้งาน</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="field" :class="{ error: errors.full_name }">
            <label for="full_name">ชื่อ - นามสกุล</label>
            <div class="input-wrap">
              <i class="ti ti-user input-icon"></i>
              <input
                id="full_name"
                v-model="form.full_name"
                type="text"
                placeholder="เช่น อ.สมชาย ใจดี"
                @input="clearError('full_name')"
              />
            </div>
            <span v-if="errors.full_name" class="error-msg">{{ errors.full_name }}</span>
          </div>

          <div class="field" :class="{ error: errors.email }">
            <label for="email">อีเมลสถาบัน</label>
            <div class="input-wrap">
              <i class="ti ti-mail input-icon"></i>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="yourname@loeitc.ac.th"
                @input="clearError('email')"
              />
            </div>
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <div class="field" :class="{ error: errors.department_id }">
            <label for="department">แผนกวิชาต้นสังกัด</label>
            <div class="input-wrap">
              <i class="ti ti-building-community input-icon"></i>
              <select
                id="department"
                v-model="form.department_id"
                class="select-control"
                @change="clearError('department_id')"
              >
                <option value="">-- เลือกแผนกวิชาของอ้าย --</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <span v-if="errors.department_id" class="error-msg">{{ errors.department_id }}</span>
          </div>

          <div class="field" :class="{ error: errors.password }">
            <label for="password">รหัสผ่าน</label>
            <div class="input-wrap">
              <i class="ti ti-lock input-icon"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="กำหนดรหัสผ่าน (6 ตัวขึ้นไป)"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
              </button>
            </div>
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <div class="field" :class="{ error: errors.confirm_password }">
            <label for="confirm_password">ยืนยันรหัสผ่านอีกครั้ง</label>
            <div class="input-wrap">
              <i class="ti ti-lock-check input-icon"></i>
              <input
                id="confirm_password"
                v-model="form.confirm_password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่านให้ตรงกัน"
                @input="clearError('confirm_password')"
              />
            </div>
            <span v-if="errors.confirm_password" class="error-msg">{{ errors.confirm_password }}</span>
          </div>

          <input type="hidden" v-model="form.role" />

          <div v-if="errors.global" class="alert-error">
            <i class="ti ti-alert-circle"></i>
            {{ errors.global }}
          </div>

          <button type="submit" class="btn-register" :disabled="submitting">
            <span v-if="!submitting">
              <i class="ti ti-user-plus"></i> ลงทะเบียนสมัครสมาชิก
            </span>
            <span v-else class="loading-wrap">
              <span class="spinner"></span> กำลังส่งข้อมูลไปยัง Supabase...
            </span>
          </button>
        </form>

        <div class="login-hint">
          <span>มีบัญชีผู้ใช้งานอยู่แล้ว?</span>
          <router-link to="/login" class="link-login">กลับไปหน้าเข้าสู่ระบบ</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_URL = 'http://localhost:3000/api'

// เก็บกลุ่มรายชื่อแผนกวิชา
const departments = ref([])
const submitting = ref(false)
const showPassword = ref(false)

// ฟอร์มกรอกข้อมูลสมัครสมาชิก
const form = reactive({
  full_name: '',
  email: '',
  department_id: '',
  password: '',
  confirm_password: '',
  role: 'teacher' // ค่าเริ่มต้นสมัครสมาชิกภายนอกจะให้สิทธิ์เป็น Teacher เสมอ
})

// จัดการจับเออร์เรอร์รายช่อง
const errors = reactive({
  full_name: '',
  email: '',
  department_id: '',
  password: '',
  confirm_password: '',
  global: ''
})

function clearError(field) {
  errors[field] = ''
  errors.global = ''
}

// 1. โหลดข้อมูลแผนกวิชามาโชว์ใน Dropdown ตอนหน้าเปิดใช้งาน
onMounted(async () => {
  try {
    const res = await axios.get(`${API_URL}/departments`)
    departments.value = res.data
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลแผนกวิชาได้:', err)
    // ข้อมูลสำรองไว้แสดงเผื่อเซิร์ฟเวอร์ยังไม่พร้อมรัน
    departments.value = [
      { id: 1, name: 'แผนกวิชาเทคโนโลยีสารสนเทศ' },
      { id: 2, name: 'แผนกวิชาคอมพิวเตอร์ธุรกิจ' },
      { id: 3, name: 'แผนกวิชาช่างยนต์' }
    ]
  }
})

// 2. ฟังก์ชันตรวจสอบความถูกต้อง (Client-side Validation)
function validate() {
  let valid = true
  if (!form.full_name.trim()) {
    errors.full_name = 'กรุณากรอกชื่อ-นามสกุลของอ้าย'
    valid = false
  }
  if (!form.email) {
    errors.email = 'กรุณากรอกอีเมล'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    valid = false
  }
  if (!form.department_id) {
    errors.department_id = 'กรุณาเลือกแผนกวิชาต้นสังกัด'
    valid = false
  }
  if (!form.password) {
    errors.password = 'กรุณากำหนดรหัสผ่าน'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีความยาว 6 ตัวอักษรขึ้นไป'
    valid = false
  }
  if (form.password !== form.confirm_password) {
    errors.confirm_password = 'การยืนยันรหัสผ่านไม่ตรงกัน'
    valid = false
  }
  return valid
}

// 3. ฟังก์ชันส่งข้อมูลสมัครสมาชิกยิงเข้า API หลังบ้าน
async function handleRegister() {
  if (!validate()) return
  submitting.value = true
  try {
    // ยิงข้อมูลไปสมัครที่ Backend ของกลุ่มอ้ายพาร์ทผู้ใช้งาน
    await axios.post(`${API_URL}/users`, {
      full_name: form.full_name,
      email: form.email,
      department_id: Number(form.department_id),
      password: form.password,
      role: form.role
    })
    
    alert('สมัครสมาชิกสำเร็จเรียบร้อยแล้วอ้าย! กำลังพาไปหน้าล็อกอินเพื่อเข้าใช้งานจริง')
    router.push('/login')
  } catch (err) {
    errors.global = err?.response?.data?.error || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap');

* { box-sizing: border-box; }

.register-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  font-family: 'Sarabun', sans-serif;
}

/* ===== LEFT PANEL ===== */
.register-left {
  background: #0F6E56;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.register-left::before {
  content: ''; position: absolute; width: 400px; height: 400px;
  border-radius: 50%; background: rgba(255,255,255,0.04);
  bottom: -100px; right: -100px;
}

.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; }
.brand-icon {
  width: 38px; height: 38px; background: rgba(255,255,255,0.15);
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
}
.brand-icon i { font-size: 20px; color: #fff; }
.brand-name { font-size: 18px; font-weight: 500; color: #fff; }

.hero-text { margin-bottom: 36px; }
.hero-text h1 { font-size: 34px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 12px; }
.hero-text p { font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; }

.register-guidelines {
  background: rgba(255,255,255,0.08);
  padding: 20px; border-radius: 12px;
  color: #fff; flex: 1;
}
.register-guidelines h3 { margin: 0 0 12px 0; font-size: 16px; display: flex; align-items: center; gap: 8px; color: #fcd34d; }
.register-guidelines ul { margin: 0; padding-left: 20px; font-size: 14px; display: flex; flex-direction: column; gap: 8px; line-height: 1.6; color: rgba(255,255,255,0.9); }

.left-footer { margin-top: 32px; font-size: 13px; color: rgba(255,255,255,0.45); }

/* ===== RIGHT PANEL ===== */
.register-right {
  background: #F7F9F7;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 48px;
}
.register-card { width: 100%; max-width: 420px; }
.card-header { margin-bottom: 24px; }
.card-header h2 { font-size: 26px; font-weight: 700; color: #085041; margin-bottom: 4px; }
.card-header p { font-size: 14px; color: #6b7280; }

/* ===== FORM ===== */
.register-form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 14px; font-weight: 500; color: #374151; }
.input-wrap { position: relative; }
.input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 17px; color: #9ca3af; pointer-events: none; }

.input-wrap input, .select-control {
  width: 100%; padding: 10px 40px 10px 38px;
  border: 1.5px solid #d1d5db; border-radius: 10px;
  font-size: 14px; font-family: 'Sarabun', sans-serif;
  color: #111827; background: #fff; outline: none;
}
.select-control { padding-right: 16px; cursor: pointer; appearance: none; -webkit-appearance: none; }
.input-wrap input:focus, .select-control:focus { border-color: #0F6E56; box-shadow: 0 0 0 3px rgba(15, 110, 86, 0.1); }
.field.error .input-wrap input, .field.error .select-control { border-color: #ef4444; }

.toggle-password { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 17px; }
.error-msg { font-size: 12px; color: #ef4444; }

.alert-error { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px; font-size: 13px; color: #b91c1c; }
.btn-register {
  width: 100%; padding: 12px; background: #0F6E56; color: #fff; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 500; font-family: 'Sarabun', sans-serif; cursor: pointer;
  transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;
}
.btn-register:hover:not(:disabled) { background: #085041; }
.btn-register:disabled { opacity: 0.65; cursor: not-allowed; }

.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.login-hint { display: flex; justify-content: center; gap: 6px; margin-top: 16px; font-size: 14px; color: #4b5563; }
.link-login { color: #0F6E56; text-decoration: none; font-weight: 700; }
.link-login:hover { text-decoration: underline; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .register-page { grid-template-columns: 1fr; }
  .register-left { padding: 32px 24px; }
  .register-guidelines { display: none; }
  .register-right { padding: 32px 24px; }
}
</style>