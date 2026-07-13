<template>
  <div class="user-management-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isAdmin ? 'จัดการข้อมูลผู้ใช้งาน' : 'ข้อมูลบัญชีของฉัน' }}</h1>
        <p class="page-subtitle">
          {{ isAdmin ? 'จัดการรายชื่อครูผู้สอน เจ้าหน้าที่ และสิทธิ์การใช้งานในระบบบันทึกการสอน' : 'ดูและแก้ไขข้อมูลส่วนตัวของคุณ' }}
        </p>
      </div>
      <button v-if="isAdmin" @click="openAddModal" class="btn btn-primary">
        <i class="fa-solid fa-user-plus"></i> เพิ่มผู้ใช้งานใหม่
      </button>
    </div>

    <div v-if="isAdmin" class="filter-card">
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
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
          <option v-for="dept in departmentsList" :key="dept.id" :value="dept.id">
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
        <p>กำลังโหลดข้อมูลผู้ใช้งาน...</p>
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
                {{ getDepartmentName(user) }}
              </span>
            </td>
            <td>
              <span :class="['badge', user.role === 'admin' ? 'badge-admin' : 'badge-teacher']">
                {{ user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครูผู้สอน' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <template v-if="isAdmin">
                  <button 
                    v-if="!user.is_approved" 
                    @click="handleApprove(user)" 
                    class="btn-icon btn-approve" 
                    title="อนุมัติการใช้งาน"
                  >
                    <i class="fa-solid fa-user-check"></i>
                  </button>
                  <span v-else class="approved-status-badge" title="อนุมัติการใช้งานเรียบร้อยแล้ว">
                    <i class="fa-solid fa-circle-check"></i>
                  </span>

                  <button @click="openEditModal(user)" class="btn-icon btn-edit" title="แก้ไขข้อมูล">
                    <i class="fa-solid fa-user-pen"></i>
                  </button>
                  
                  <button 
                    @click="handleResetPassword(user)" 
                    class="btn-icon btn-reset" 
                    title="รีเซ็ตรหัสผ่าน"
                  >
                    <i class="fa-solid fa-key"></i>
                  </button>

                  <button @click="deleteUser(user.id)" class="btn-icon btn-delete" title="ลบผู้ใช้งาน">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </template>

                <button v-else @click="openEditModal(user)" class="btn-icon btn-edit" title="แก้ไขข้อมูลของฉัน">
                  <i class="fa-solid fa-user-pen"></i> แก้ไขข้อมูล
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
          <h3>
            {{ modal.isResetPassword ? '🔒 รีเซ็ตรหัสผ่านใหม่' : (modal.isEdit ? '📝 แก้ไขข้อมูล' : '➕ เพิ่มผู้ใช้งานใหม่') }}
          </h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveUser">
          <div class="modal-body">
            
            <div v-if="modal.isResetPassword">
              <p style="margin-bottom: 14px; color: #4B5563;">
                กำลังเปลี่ยนรหัสผ่านความปลอดภัยให้คุณครู: <strong>{{ form.full_name }}</strong>
              </p>
              <div class="form-group">
                <label>กำหนดรหัสผ่านใหม่</label>
                <input 
                  v-model="form.password" 
                  type="text" 
                  class="form-control" 
                  required 
                  placeholder="อย่างน้อย 6 ตัวขึ้นไป เช่น 123456"
                >
              </div>
            </div>

            <div v-else style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
              <div class="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input v-model="form.full_name" type="text" class="form-control" required placeholder="เช่น อ.สมชาย ใจดี">
              </div>
              <div class="form-group">
                <label>อีเมล</label>
                <input v-model="form.email" type="email" class="form-control" required placeholder="name@loeitc.ac.th">
              </div>
              <div class="form-group" v-if="!modal.isEdit">
                <label>รหัสผ่านแรกเริ่ม</label>
                <input v-model="form.password" type="password" class="form-control" required placeholder="กำหนดรหัสผ่านแรกเริ่ม">
              </div>
              <div class="form-group" v-if="modal.isEdit">
                <label>รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</label>
                <input v-model="form.password" type="password" class="form-control" placeholder="อย่างน้อย 6 ตัวอักษร">
              </div>
              <div class="form-group" v-if="isAdmin">
                <label>แผนกวิชา</label>
                <select v-model="form.department_id" class="form-control" required>
                  <option value="">เลือกแผนกวิชา</option>
                  <option v-for="dept in departmentsList" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="form-group" v-if="isAdmin">
                <label>สิทธิ์การใช้งาน (Role)</label>
                <select v-model="form.role" class="form-control" required>
                  <option value="teacher">Teacher (ครูผู้สอน)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>
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
import { useAuthStore } from '../stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const authStore = useAuthStore()

const users = ref([])
const departments = ref([])
const loading = ref(true)

const filters = reactive({
  search: '',
  departmentId: '',
  role: ''
})

const modal = reactive({
  show: false,
  isEdit: false,
  isResetPassword: false, 
  saving: false,
  currentUserId: null
})

const form = reactive({
  email: '',
  password: '',
  full_name: '',
  department_id: '',
  role: 'teacher'
})

const currentUser = computed(() => authStore.user?.value || authStore.user)
const isAdmin = computed(() => currentUser.value?.role === 'admin')

const departmentsList = computed(() => {
  if (!departments.value) return []
  if (Array.isArray(departments.value)) return departments.value
  if (departments.value.data && Array.isArray(departments.value.data)) return departments.value.data
  return []
})

const filteredUsers = computed(() => {
  const rawUsers = users.value?.data || users.value
  if (!Array.isArray(rawUsers)) return []

  // ครูเห็นแค่ของตัวเอง ไม่ต้องกรองอะไรเพิ่ม
  if (!isAdmin.value) return rawUsers.filter(u => u)

  return rawUsers.filter(user => {
    if (!user) return false
    const matchSearch = !filters.search || 
      (user.full_name && user.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(filters.search.toLowerCase()))
    
    const matchDept = !filters.departmentId || Number(user.department_id) === Number(filters.departmentId)
    const matchRole = !filters.role || user.role === filters.role
    
    return matchSearch && matchDept && matchRole
  })
})

onMounted(async () => {
  await fetchDepartments()
  await fetchUsers()
})

const fetchDepartments = async () => {
  try {
    const res = await axios.get(`${API_URL}/departments`)
    departments.value = res.data
  } catch (err) {
    console.error('ดึงข้อมูลแผนกวิชาล้มเหลว:', err)
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const endpoint = isAdmin.value
      ? `${API_URL}/users`
      : `${API_URL}/users/${currentUser.value?.id}`

    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })

    users.value = isAdmin.value ? res.data : [res.data]
  } catch (err) {
    console.error('ดึงข้อมูลผู้ใช้ล้มเหลวจริง ๆ:', err)
    users.value = [] 
  } finally {
    loading.value = false
  }
}

const getDepartmentName = (user) => {
  if (user.departments?.name) return user.departments.name
  if (user.department?.name) return user.department.name
  
  const dept = departmentsList.value.find(d => Number(d.id) === Number(user.department_id))
  return dept ? dept.name : 'ไม่ระบุแผนก'
}

const resetForm = () => {
  form.email = ''
  form.password = ''
  form.full_name = ''
  form.department_id = ''
  form.role = 'teacher'
}

const openAddModal = () => {
  modal.isEdit = false
  modal.isResetPassword = false
  modal.currentUserId = null
  resetForm()
  modal.show = true
}

const openEditModal = (user) => {
  modal.isEdit = true
  modal.isResetPassword = false
  modal.currentUserId = user.id
  form.full_name = user.full_name
  form.email = user.email
  form.department_id = user.department_id
  form.role = user.role
  form.password = ''
  modal.show = true
}

const closeModal = () => {
  modal.show = false
}

const handleResetPassword = async (user) => {
  modal.isEdit = false
  modal.isResetPassword = true
  modal.currentUserId = user.id
  
  form.full_name = user.full_name
  form.email = user.email
  form.department_id = user.department_id
  form.role = user.role
  form.password = '123456' 
  
  modal.show = true
}

const saveUser = async () => {
  if (form.password && form.password.trim().length > 0 && form.password.trim().length < 6) {
    return alert('รหัสผ่านความปลอดภัยต้องมีความยาว 6 ตัวอักษรขึ้นไปนะ !')
  }

  modal.saving = true
  try {
    if (modal.isResetPassword) {
      await axios.put(`${API_URL}/users/${modal.currentUserId}`, {
        email: form.email,
        full_name: form.full_name,
        department_id: Number(form.department_id),
        role: form.role,
        password: form.password
      })
      alert(`🎉 สำเร็จ! ทำการเปลี่ยนและรีเซ็ตรหัสผ่านใหม่ของ ${form.full_name} เรียบร้อยแล้วครับ!`)
    } else if (modal.isEdit) {
      const payload = { full_name: form.full_name, email: form.email }

      if (isAdmin.value) {
        payload.department_id = Number(form.department_id)
        payload.role = form.role
      }
      // ทั้ง admin และ teacher ส่ง password ได้ถ้ากรอกไว้
      if (form.password && form.password.trim() !== '') {
        payload.password = form.password
      }

      await axios.put(`${API_URL}/users/${modal.currentUserId}`, payload)
      alert('อัปเดตข้อมูลสำเร็จ!')
    } else {
      await axios.post(`${API_URL}/users`, {
        ...form,
        department_id: Number(form.department_id)
      })
      alert('เพิ่มผู้ใช้งานรายใหม่เข้าฐานข้อมูลสำเร็จ!')
    }
    closeModal()
    await fetchUsers()
  } catch (err) {
    console.error(err)
    const errorMsg = err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาเช็กเซิร์ฟเวอร์หลังบ้าน'
    alert(`เกิดข้อผิดพลาด: ${errorMsg}`)
  } finally {
    modal.saving = false
  }
}

const handleApprove = async (user) => {
  try {
    await axios.put(`${API_URL}/users/${user.id}`, {
      full_name: user.full_name,
      email: user.email,
      department_id: Number(user.department_id),
      role: user.role,
      is_approved: true
    })
    alert(`อนุมัติสิทธิ์การใช้งานให้คุณ ${user.full_name} สำเร็จแล้ว!`)
    await fetchUsers()
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการอนุมัติสิทธิ์')
  }
}

const deleteUser = async (id) => {
  if (currentUser.value && currentUser.value.id === id) {
    return alert('ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ตอนนี้ได้! 😂')
  }

  if (!confirm('ลบผู้ใช้งานออกจากระบบ?\r\nข้อมูลบันทึกการสอนจะถูกลบด้วย')) return
  try {
    await axios.delete(`${API_URL}/users/${id}`)
    alert('ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว!')
    await fetchUsers()
  } catch (err) {
    alert(err.response?.data?.error || 'ลบข้อมูลล้มเหลว กรุณาตรวจสอบสิทธิ์หรือเซิร์ฟเวอร์หลังบ้าน')
  }
}
</script>

<style scoped>
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
  font-size: 14px;
  transition: all 0.15s ease;
}

.btn-icon:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.btn-approve {
  background-color: #E0F2FE;
  color: #0284C7;
}
.btn-approve:hover { background-color: #0284C7; color: white; }

.approved-status-badge {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10B981;
  font-size: 18px;
}

.btn-edit {
  background-color: #F3F4F6;
  color: #4B5563;
}
.btn-edit:hover {
  background-color: #E5E7EB;
  color: #111827;
}

.btn-reset {
  background-color: #F3E8FF;
  color: #7C3AED;
}
.btn-reset:hover { background-color: #7C3AED; color: white; }

.btn-delete {
  background-color: #FEE2E2;
  color: #EF4444;
}
.btn-delete:hover {
  background-color: #EF4444;
  color: white;
}

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