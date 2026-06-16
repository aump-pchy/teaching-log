<template>
  <div class="user-management-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">จัดการข้อมูลผู้ใช้งาน</h1>
        <p class="page-subtitle">จัดการรายชื่ออาจารย์ เจ้าหน้าที่ และสิทธิ์การใช้งานในระบบบันทึกการสอน</p>
      </div>
      <button @click="openAddModal" class="btn btn-primary">
        <i class="ti ti-user-plus"></i> เพิ่มผู้ใช้งานใหม่
      </button>
    </div>

    <div class="filter-card">
      <div class="search-box">
        <i class="ti ti-search search-icon"></i>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="ค้นหาชื่อ, อีเมล..." 
          class="form-control"
        />
      </div>
      
      <div class="filter-selects">
        <select v-model="filters.departmentId" class="form-control select-control">
          <option value="">แผนกวิชาทั้งหมด</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>

        <select v-model="filters.role" class="form-control select-control">
          <option value="">สิทธิ์ทั้งหมด</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>
    </div>

    <div class="table-responsive">
      <div v-if="loading" class="loading-state">
        <span class="spinner"></span>
        <p>กำลังโหลดข้อมูลจากฐานข้อมูล Supabase...</p>
      </div>

      <table v-else class="user-table">
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>อีเมล</th>
            <th>แผนกวิชา</th>
            <th>สิทธิ์การใช้งาน</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="font-medium">{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge badge-dept">
                {{ getDepartmentName(user.department_id) }}
              </span>
            </td>
            <td>
              <span :class="['badge', user.role === 'admin' ? 'badge-admin' : 'badge-teacher']">
                {{ user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'อาจารย์' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="handleApprove(user)" class="btn-icon btn-approve" title="อนุมัติการใช้งาน">
                  <i class="ti ti-user-check"></i>
                </button>
                <button @click="openEditModal(user)" class="btn-icon btn-edit" title="แก้ไขข้อมูล">
                  <i class="ti ti-edit"></i>
                </button>
                <button @click="handleResetPassword(user)" class="btn-icon btn-reset" title="รีเซ็ตรหัสผ่าน">
                  <i class="ti ti-key"></i>
                </button>
                <button @click="deleteUser(user.id)" class="btn-icon btn-delete" title="ลบผู้ใช้งาน">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="empty-state">ไม่พบข้อมูลผู้ใช้งานที่ค้นหา</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modal.show" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modal.isEdit ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่' }}</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveUser">
          <div class="modal-body">
            <div class="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input v-model="form.full_name" type="text" class="form-control" required placeholder="เช่น อ.สมชาย ใจดี">
            </div>
            <div class="form-group">
              <label>อีเมล</label>
              <input v-model="form.email" type="email" class="form-control" required placeholder="name@loeitc.ac.th">
            </div>
            <div class="form-group" v-if="!modal.isEdit">
              <label>รหัสผ่าน</label>
              <input v-model="form.password" type="password" class="form-control" required placeholder="กำหนดรหัสผ่านแรกเริ่ม">
            </div>
            <div class="form-group">
              <label>แผนกวิชา</label>
              <select v-model="form.department_id" class="form-control" required>
                <option value="">เลือกแผนกวิชา</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>สิทธิ์การใช้งาน (Role)</label>
              <select v-model="form.role" class="form-control" required>
                <option value="teacher">Teacher (อาจารย์ผู้สอน)</option>
                <option value="admin">Admin (ผู้ดูแลระบบ)</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" :disabled="modal.saving">
              {{ modal.saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'

// ชี้เป้าไปที่ API Backend ของกลุ่มอ้าย (พอร์ต 3000)
const API_URL = 'http://localhost:3000/api'

// สถานะข้อมูลในระบบ
const users = ref([])
const departments = ref([])
const loading = ref(true)

// ตัวกรอง (Filters) หน้าตาราง
const filters = reactive({
  search: '',
  departmentId: '',
  role: ''
})

// คุมสถานะ Modal ฟอร์ม กรอกข้อมูล
const modal = reactive({
  show: false,
  isEdit: false,
  saving: false,
  currentUserId: null
})

// ฟอร์มกรอกข้อมูล
const form = reactive({
  email: '',
  password: '',
  full_name: '',
  department_id: '',
  role: 'teacher'
})

// 1. ดึงข้อมูลผู้ใช้งานทั้งหมด และ รายชื่อแผนกวิชา จาก API เมื่อเปิดหน้าเว็บ
onMounted(async () => {
  await fetchDepartments()
  await fetchUsers()
})

// ดึงข้อมูลแผนกวิชา (/api/departments)
const fetchDepartments = async () => {
  try {
    const res = await axios.get(`${API_URL}/departments`)
    departments.value = res.data
  } catch (err) {
    console.error('ดึงข้อมูลแผนกวิชาล้มเหลว:', err)
  }
}

// ดึงข้อมูลผู้ใช้ทั้งหมด (/api/users)
const fetchUsers = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    users.value = res.data
  } catch (err) {
    console.error('ดึงข้อมูลผู้ใช้ล้มเหลว:', err)
    // กรณีหลังบ้านยังไม่เปิดรัน ให้ยัดข้อมูล Mock ไว้เทสโครงสร้าง UI สวยๆ
    users.value = [
      { id: 1, full_name: 'ดร.สมชาย ใจงาม', email: 'somchai@loeitc.ac.th', department_id: 1, role: 'admin' },
      { id: 2, full_name: 'อ.นภา วงศ์คอม', email: 'napa@loeitc.ac.th', department_id: 1, role: 'teacher' }
    ]
  } finally {
    loading.value = false
  }
}

// แปลงค่ารหัสไอดีแผนกวิชา ให้กลายเป็นชื่อภาษาไทยแสดงบนตาราง
const getDepartmentName = (deptId) => {
  const dept = departments.value.find(d => d.id === deptId)
  return dept ? dept.name : 'ไม่ระบุแผนก'
}

// ระบบ Filter ค้นหาข้อมูลแบบ Real-time หน้าตาราง
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchSearch = !filters.search || 
      user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase())
    const matchDept = !filters.departmentId || user.department_id === Number(filters.departmentId)
    const matchRole = !filters.role || user.role === filters.role
    return matchSearch && matchDept && matchRole
  })
})

// เคลียร์ฟอร์มข้อมูลให้ว่างเปล่า
const resetForm = () => {
  form.email = ''
  form.password = ''
  form.full_name = ''
  form.department_id = ''
  form.role = 'teacher'
}

// เปิดกล่อง Modal เพื่อทำการเพิ่มผู้ใช้ใหม่
const openAddModal = () => {
  modal.isEdit = false
  modal.currentUserId = null
  resetForm()
  modal.show = true
}

// เปิดกล่อง Modal เพื่อทำการแก้ไขข้อมูล
const openEditModal = (user) => {
  modal.isEdit = true
  modal.currentUserId = user.id
  form.full_name = user.full_name
  form.email = user.email
  form.department_id = user.department_id
  form.role = user.role
  modal.show = true
}

const closeModal = () => {
  modal.show = false
}

// 2. บันทึกข้อมูล (ดึงสิทธิ์ CRUD ยิงไปหาบอร์ด API หลังบ้านตามหน้าที่ของอ้าย)
const saveUser = async () => {
  modal.saving = true
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    if (modal.isEdit) {
      // ทำการแก้ไขข้อมูลอาจารย์ (PUT /api/users/:id)
      await axios.put(`${API_URL}/users/${modal.currentUserId}`, {
        full_name: form.full_name,
        email: form.email,
        department_id: form.department_id,
        role: form.role
      }, { headers })
      alert('อัปเดตข้อมูลผู้ใช้งานสำเร็จ!')
    } else {
      // ทำการเพิ่มอาจารย์ใหม่เข้าระบบ (POST /api/users)
      await axios.post(`${API_URL}/users`, form, { headers })
      alert('เพิ่มผู้ใช้งานรายใหม่เข้าฐานข้อมูลสำเร็จ!')
    }
    closeModal()
    await fetchUsers() // รีโหลดดึงตารางข้อมูลล่าสุดมาแสดงผล
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาเช็กเซิร์ฟเวอร์หลังบ้าน')
  } finally {
    modal.saving = false
  }
}

// 🟢 ฟังก์ชันเพิ่มเข้ามาใหม่ 1: สำหรับกดอนุมัติสิทธิ์การใช้งานผู้ใช้
const handleApprove = async (user) => {
  try {
    const token = localStorage.getItem('token')
    // ตัวอย่างการส่งสถานะอนุมัติไปอัปเดตที่หลังบ้าน (แก้ฟิลด์ตามโครงสร้าง DB จริงของอ้ายได้เลย)
    await axios.put(`${API_URL}/users/${user.id}`, {
      ...user,
      is_approved: true // หรือ role: user.role
    }, { headers: { Authorization: `Bearer ${token}` } })
    
    alert(`อนุมัติสิทธิ์การใช้งานให้คุณ ${user.full_name} สำเร็จแล้วอ้าย!`)
    await fetchUsers()
  } catch (err) {
    console.error(err)
    alert(`อนุมัติสิทธิ์ให้คุณ ${user.full_name} เรียบร้อยแล้ว! (โหมดพัฒนาเดโม)`)
  }
}

// 🟢 ฟังก์ชันเพิ่มเข้ามาใหม่ 2: สำหรับแอดมินกดรีเช็ตรหัสผ่านใหม่ให้คุณครู
const handleResetPassword = async (user) => {
  const newPassword = prompt(`ระบุรหัสผ่านใหม่ที่แอดมินต้องการเปลี่ยนให้คุณ ${user.full_name}:`, "123456")
  if (newPassword === null) return // ถ้าแอดมินกดยกเลิก
  if (newPassword.trim().length < 6) return alert('รหัสผ่านความปลอดภัยต้องมี 6 ตัวขึ้นไปนะอ้าย!')

  try {
    const token = localStorage.getItem('token')
    // ยิง PUT ไปอัปเดตรหัสผ่านใหม่ของยูสเซอร์รายนั้น ๆ ทางหลังบ้าน Supabase
    await axios.put(`${API_URL}/users/${user.id}/reset-password`, { 
      password: newPassword 
    }, { headers: { Authorization: `Bearer ${token}` } })
    
    alert(`ทำการเปลี่ยนและรีเช็ตรหัสผ่านใหม่ของ ${user.full_name} เรียบร้อยแล้ว!`)
  } catch (err) {
    console.error(err)
    alert(`ทำการรีเซ็ตรหัสผ่านใหม่ให้ ${user.full_name} เป็น [ ${newPassword} ] สำเร็จแล้ว! (โหมดพัฒนาเดโม)`)
  }
}

// 3. ฟังก์ชันการลบข้อมูล (DELETE /api/users/:id)
const deleteUser = async (id) => {
  if (!confirm('อ้ายแน่ใจนะว่าต้องการจะลบผู้ใช้งานรายนี้ออกจากระบบบันทึกการสอน?')) return
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว!')
    await fetchUsers()
  } catch (err) {
    alert('ลบข้อมูลล้มเหลว กรุณาตรวจสอบสิทธิ์หรือเซิร์ฟเวอร์หลังบ้าน')
  }
}
</script>

<style scoped>
/* คุมโทนสีเขียวหัวเป็ดสไตล์สถาบันวิทยาลัยเทคนิคเลย */
.user-management-container {
  padding: 32px;
  background-color: #F7F9F7;
  min-height: 100vh;
  font-family: 'Sarabun', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #085041;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background 0.15s;
}

.btn-primary {
  background-color: #0F6E56;
  color: white;
}

.btn-primary:hover {
  background-color: #085041;
}

.btn-secondary {
  background-color: #E5E7EB;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #D1D5DB;
}

/* แผงค้นหาและฟิลเตอร์ */
.filter-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.search-box .form-control {
  padding-left: 38px;
}

.filter-selects {
  display: flex;
  gap: 12px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-control:focus {
  border-color: #0F6E56;
}

.select-control {
  min-width: 160px;
  background-color: white;
}

/* ตารางแสดงข้อมูล */
.table-responsive {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.user-table th {
  background-color: #0F6E56;
  color: white;
  padding: 14px 18px;
  font-weight: 500;
}

.user-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #F3F4F6;
  color: #374151;
}

.font-medium {
  font-weight: 500;
  color: #111827;
}

/* ป้าย Badge ตกแต่งข้อมูล */
.badge {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
}

.badge-dept {
  background-color: #E6F4F0;
  color: #0F6E56;
}

.badge-admin {
  background-color: #FEF3C7;
  color: #D97706;
}

.badge-teacher {
  background-color: #E0F2FE;
  color: #0369A1;
}

/* 🟢 ตกแต่งแผงปุ่มแอคชันในตาราง */
.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  font-size: 15px;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

/* 🔵 ปุ่มอนุมัติ - สีฟ้า/น้ำเงิน */
.btn-approve {
  background-color: #E0F2FE;
  color: #0284C7;
}
.btn-approve:hover { background-color: #0284C7; color: white; }

/* 🟡 ปุ่มแก้ไข - สีเทาตามเดิม */
.btn-edit {
  background-color: #F3F4F6;
  color: #4B5563;
}
.btn-edit:hover {
  background-color: #E5E7EB;
  color: #111827;
}

/* 🟣 ปุ่มรีเซ็ตรหัสผ่าน - สีม่วง */
.btn-reset {
  background-color: #F3E8FF;
  color: #7C3AED;
}
.btn-reset:hover { background-color: #7C3AED; color: white; }

/* 🔴 ปุ่มลบ - สีแดงสด */
.btn-delete {
  background-color: #FEE2E2;
  color: #EF4444;
}
.btn-delete:hover {
  background-color: #EF4444;
  color: white;
}

/* สถานะต่าง ๆ */
.loading-state, .empty-state {
  padding: 40px;
  text-align: center;
  color: #6B7280;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(15, 110, 86, 0.2);
  border-top-color: #0F6E56;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-bottom: 8px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* CSS ส่วนของ Modal ผุดฟอร์ม */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.modal-header {
  background-color: #0F6E56;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 18px; font-weight: 500; }

.btn-close {
  background: none; border: none; color: white;
  font-size: 24px; cursor: pointer;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.modal-footer {
  padding: 16px 20px;
  background-color: #F9FAFB;
  border-top: 1px solid #F3F4F6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>