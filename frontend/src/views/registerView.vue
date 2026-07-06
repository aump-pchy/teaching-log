<template>
  <div class="register-container">
    <!-- ฝั่งซ้าย: แผงข้อความแนะนำ -->
    <div class="info-sidebar">
      <div class="brand">
        <i class="ti ti-notebook"></i>
        <span>Teaching Log</span>
      </div>
      
      <div class="welcome-text">
        <h1>เริ่มต้นใช้งาน<br>ระบบบันทึกการสอน</h1>
        <p>สร้างบัญชีผู้ใช้งานใหม่ เพื่อเข้าจัดการแบบบันทึกการเรียนการสอนสำหรับรายวิชาในสถานประกอบการ</p>
      </div>

      <div class="guide-card">
        <h3><i class="ti ti-bulb"></i> ข้อแนะนำการลงทะเบียน</h3>
        <ul>
          <!-- 🎯 ปรับแก้ตรงนี้: ปลดล็อกคำว่าอีเมลสถาบันออก -->
          <li>กรุณาใช้ <strong>อีเมลที่ใช้งานจริง</strong> ในการสมัครสมาชิก</li>
          <li>เลือกแผนกวิชาต้นสังกัดของคุณให้ถูกต้อง เพื่อการจัดกลุ่มรายงาน</li>
          <li>รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป</li>
        </ul>
      </div>

      <div class="footer-credit">
        © 2569 วิทยาลัยเทคนิคเลย
      </div>
    </div>

    <!-- ฝั่งขวา: แบบฟอร์มสมัครสมาชิก -->
    <div class="form-section">
      <div class="form-wrapper">
        <div class="form-header">
          <h2>สมัครสมาชิกใหม่</h2>
          <p>กรอกข้อมูลรายละเอียดของคุณเพื่อเปิดสิทธิ์เข้าใช้งาน</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label>ชื่อ - นามสกุล</label>
            <div class="input-wrapper">
              <i class="ti ti-user input-icon"></i>
              <input 
                v-model="form.full_name" 
                type="text" 
                placeholder="เช่น อ.สมชาย ใจดี" 
                required
              />
            </div>
          </div>

          <div class="form-group">
            <!-- 🎯 ปรับแก้ตรงนี้: เปลี่ยนจาก อีเมลสถาบัน เป็น อีเมลใช้งาน -->
            <label>อีเมล</label>
            <div class="input-wrapper">
              <i class="ti ti-mail input-icon"></i>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="yourname@email.com" 
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>แผนกวิชาต้นสังกัด</label>
            <div class="input-wrapper">
              <i class="ti ti-school input-icon"></i>
              <select v-model="form.department_id" required>
                <option value="">-- เลือกแผนกวิชา --</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>รหัสผ่าน</label>
            <div class="input-wrapper">
              <i class="ti ti-lock input-icon"></i>
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="กำหนดรหัสผ่าน (6 ตัวขึ้นไป)" 
                required
              />
              <i 
                @click="showPassword = !showPassword" 
                :class="['ti', showPassword ? 'ti-eye-off' : 'ti-eye', 'toggle-password']"
              ></i>
            </div>
          </div>

          <div class="form-group">
            <label>ยืนยันรหัสผ่านอีกครั้ง</label>
            <div class="input-wrapper">
              <i class="ti ti-lock-check input-icon"></i>
              <input 
                v-model="form.confirmPassword" 
                type="password" 
                placeholder="กรอกรหัสผ่านให้ตรงกัน" 
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-register" :disabled="loading">
            <i class="ti ti-user-plus"></i> {{ loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนสมัครสมาชิก' }}
          </button>
        </form>

        <div class="form-footer">
          มีบัญชีผู้ใช้งานอยู่แล้ว? <router-link to="/login">กลับไปหน้าเข้าสู่ระบบ</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const router = useRouter()

const showPassword = ref(false)
const loading = ref(false)
const departments = ref([])

const form = reactive({
  full_name: '',
  email: '',
  department_id: '',
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
  try {
    const res = await axios.get(`${API_URL}/departments`)
    departments.value = res.data
  } catch (err) {
    console.error('โหลดข้อมูลแผนกวิชาล้มเหลว:', err)
    // ข้อมูลสำรองกรณีหลังบ้านหลุด
    departments.value = [
      { id: 1, name: 'เทคโนโลยีสารสนเทศ' },
      { id: 2, name: 'ช่างยนต์' },
      { id: 3, name: 'เทคโนโลยี AI' }
    ]
  }
})

const handleRegister = async () => {
  // 🎯 เพิ่มระบบเช็ครหัสผ่านให้ตรงกันก่อนส่ง (แถมความปลอดภัยให้ครับ)
  if (form.password !== form.confirmPassword) {
    alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับอ้าย!')
    return
  }

  loading.value = true
  try {
    // 🎯 ดึงค่าผ่าน form.xxxx ให้ตรงกับตระกูล reactive ด้านบน
    const payload = {
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      department_id: Number(form.department_id) // แปลงเป็นตัวเลข int4 ให้หลังบ้าน
    }

    // ยิงไปหาหลังบ้านพอร์ต 3000 เส้นทางสมัครสมาชิก
    const res = await axios.post(`${API_URL}/auth/register`, payload)
    
    alert(res.data.message) // แจ้งเตือนสมัครสำเร็จ รออนุมัติ
    router.push('/login')    // เตะหน้าจอกลับไปรอหน้าล็อกอิน
  } catch (err) {
    console.error('สมัครสมาชิกฟรอนต์เอนด์ล้มเหลว:', err)
    alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* สไตล์ตกแต่งหน้าจอจัดให้คล้ายเดิมตามที่ออกแบบไว้ครับ */
.register-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Sarabun', sans-serif;
  background-color: #ffffff;
}

.info-sidebar {
  flex: 4.5;
  background-color: #085041;
  color: #ffffff;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 500;
}

.welcome-text h1 {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 16px;
}

.welcome-text p {
  font-size: 16px;
  color: #A3CBC2;
  max-width: 440px;
  line-height: 1.6;
}

.guide-card {
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  max-width: 460px;
}

.guide-card h3 {
  margin-top: 0;
  font-size: 16px;
  font-weight: 600;
  color: #FCD34D;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-card ul {
  padding-left: 20px;
  margin: 12px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  color: #E2EFA0;
}

.footer-credit {
  font-size: 14px;
  color: #619C8F;
}

.form-section {
  flex: 5.5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #F9FAFB;
}

.form-wrapper {
  width: 100%;
  max-width: 440px;
}

.form-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #085041;
  margin: 0 0 8px 0;
}

.form-header p {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 32px 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
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
  font-size: 18px;
}

.input-wrapper input, .input-wrapper select {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: #ffffff;
  transition: border-color 0.2s;
}

.input-wrapper input:focus, .input-wrapper select:focus {
  border-color: #085041;
  box-shadow: 0 0 0 3px rgba(8, 80, 65, 0.1);
}

.toggle-password {
  position: absolute;
  right: 14px;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 18px;
}

.btn-register {
  margin-top: 10px;
  background-color: #085041;
  color: #ffffff;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-register:hover {
  background-color: #063C31;
}

.btn-register:disabled {
  background-color: #9CA3AF;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #4B5563;
}

.form-footer a {
  color: #085041;
  font-weight: 600;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .register-container { flex-direction: column; }
  .info-sidebar { display: none; }
}
</style>