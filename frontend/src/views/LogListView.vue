<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-0 space-y-4 my-6">
    
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-[#1e7e34]/10 text-[#1e7e34] rounded-xl text-2xl select-none">
          📖
        </div>
        <div>
          <h1 class="text-xs font-bold text-slate-400 tracking-wide">วิทยาลัยเทคนิคลอยเด่น</h1>
          <p class="text-xl font-black text-[#1e7e34] mt-0.5">รายการบันทึกการจัดการเรียนการสอน</p>
          <p class="text-xs text-slate-400 font-medium mt-0.5">แสดงผลข้อมูลบันทึกการสอนในสถานประกอบการ</p>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <div class="relative flex-1 md:w-64">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="ค้นหารหัสวิชา, ชื่อวิชา..." 
            class="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#1e7e34] focus:ring-1 focus:ring-[#1e7e34] outline-none font-medium"
          />
          <span class="absolute left-3 top-2.5 text-slate-400 text-xs select-none">🔍</span>
        </div>
        
        <select 
          v-model="selectedDepartment"
          class="border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white outline-none focus:border-[#1e7e34] font-bold text-slate-600 cursor-pointer"
        >
          <option value="" style="color:#334155; background-color:#ffffff;">🏢 ทั้งหมดทุกแผนกวิชา</option>
          <option 
            v-for="dept in departments" 
            :key="dept.id || dept.name" 
            :value="dept.name"
            style="color:#334155; background-color:#ffffff;"
          >
            {{ dept.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-start gap-2.5">
      <!-- 🟢 [แก้ไข] เดิม <select> ได้ class text-white ทำให้ตัวเลือกในลิสต์ (dropdown popup)
           ที่ browser render เป็นพื้นขาวปกติ ตัวหนังสือขาวเลยกลืนมองไม่เห็น
           แก้โดยกำหนดสีตัวหนังสือ/พื้นหลังของแต่ละ <option> ตรงๆ ด้วย inline style -->
      <select 
        v-model="selectedSemester"
        class="bg-gradient-to-r from-[#1e7e34] to-[#145623] text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md hover:opacity-95 transition-all outline-none cursor-pointer border-none"
      >
        <option value="" style="color:#1e293b; background-color:#ffffff;">📌 แสดงทุกภาคเรียน</option>
        <option 
          v-for="term in termOptions" 
          :key="term" 
          :value="term"
          style="color:#1e293b; background-color:#ffffff;"
        >
          ภาคเรียนที่ {{ term }}
        </option>
      </select>

      <!-- 🟢 [เพิ่มใหม่] ปุ่มสลับลำดับ ล่าสุด↔เก่าสุด ไม่ต้องเลื่อนหาเอง -->
      <button
        type="button"
        @click="toggleSortOrder"
        class="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm hover:border-[#1e7e34] hover:text-[#1e7e34] transition-all cursor-pointer"
        :title="sortOrder === 'desc' ? 'กำลังเรียง: ล่าสุด → เก่าสุด' : 'กำลังเรียง: เก่าสุด → ล่าสุด'"
      >
        <span>{{ sortOrder === 'desc' ? '⬇️' : '⬆️' }}</span>
        <span>{{ sortOrder === 'desc' ? 'ล่าสุด → เก่าสุด' : 'เก่าสุด → ล่าสุด' }}</span>
      </button>
    </div>


    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div class="relative flex items-center justify-center w-14 h-14">
        <div class="absolute inset-0 rounded-full border-[3.5px] border-emerald-100 border-t-[#1e7e34] animate-spin"></div>
        <span class="text-2xl animate-pulse select-none">🌀</span>
      </div>
      <span class="mt-5 text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 animate-pulse">
        ⏳ กำลังเรียกข้อมูลระบบ กรุณารอสักครู่...
      </span>
    </div>

    <div v-else class="overflow-hidden border border-slate-100 rounded-2xl shadow-md bg-white">
      <table class="custom-styled-table w-full text-left">
        <thead class="custom-thead text-white text-sm font-extrabold select-none">
          <tr>
            <th class="py-4 px-4 w-[10%] text-center">ที่</th>
            <th class="py-4 px-6 w-[55%]">วิชาและรหัสวิชา</th>
            <th class="py-4 px-4 w-[18%] text-center">สัปดาห์สอน</th>
            <th class="py-4 px-4 w-[17%] text-center">จัดการข้อมูล</th>
          </tr>
        </thead>
        
        <tbody class="text-slate-700 font-semibold">
          <tr 
            v-for="(log, index) in filteredLogs" 
            :key="log.id || index"
            class="table-row-item transition-all duration-150"
          >
            <td class="py-3 px-4 text-center font-black text-slate-400 text-base">
              {{ index + 1 }}
            </td>
            
            <td class="py-3 px-6">
              <div class="flex flex-col gap-1.5">
                <div>
                  <span class="inline-block text-[10px] font-bold text-[#1e7e34] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                    {{ log.subject_code || 'ไม่ระบุรหัสวิชา' }}
                  </span>
                </div>
                <span class="font-extrabold text-slate-800 text-base block truncate" :title="log.subject_name">
                  {{ log.subject_name || 'ไม่ระบุชื่อวิชา' }}
                </span>
              </div>
            </td>
            
            <td class="py-3 px-4 text-center">
              <span class="inline-flex items-center justify-center bg-emerald-50 text-[#1e7e34] border border-emerald-100/70 font-bold px-3.5 py-1.5 rounded-full text-xs shadow-sm">
                สัปดาห์ที่ {{ log.week || log.teaching_week || '1' }}
              </span>
            </td>
            
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-4 select-none">
                <button 
                  @click="viewDetail(log.id)" 
                  class="text-xl hover:scale-125 active:scale-95 transition-all transform duration-150 cursor-pointer"
                  title="ดูรายละเอียด"
                >
                  🔍
                </button>
                <button 
                  v-if="userRole === 'admin'" 
                  @click="deleteLog(log.id)" 
                  class="text-xl hover:scale-125 active:scale-95 transition-all transform duration-150 cursor-pointer"
                  title="ลบบันทึกข้อมูล"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          
          <tr v-if="filteredLogs.length === 0">
            <td colspan="4" class="py-20 text-center text-slate-400 font-bold text-sm">
              📭 ไม่พบข้อมูลตารางตามเงื่อนไขที่เลือก
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router' 
import axios from 'axios' 

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const router = useRouter()

// 🔧 [แก้ไข] state ที่ template เรียกใช้จริงแต่ของเดิมไม่เคยประกาศไว้เลย
// (selectedDepartment, termOptions, sortOrder, isLoading, rawLogs)
// นี่คือสาเหตุของ "Property was accessed during render but is not defined on instance"
// และ "ReferenceError: rawLogs is not defined" ใน console
const selectedSemester = ref('') // 🌟 ตัวนี้จะเปลี่ยนค่าอัตโนมัติเมื่อดึงจากฐานข้อมูลสำเร็จ
const selectedDepartment = ref('')
const searchQuery = ref('')
const sortOrder = ref('desc')
const isLoading = ref(true)

const departments = ref([]) // 🔧 เดิมเป็น array ธรรมดา ทำให้ fetchDepartments().value ใช้ไม่ได้
const rawLogs = ref([])
const termOptions = ref([])

const currentUserId = ref(null)
// 🔧 [แก้ไข] template อ้างถึง userRole ในเงื่อนไข v-if="userRole === 'admin'"
// และ computed filteredLogs อ้างถึง currentTeacherName แต่ของเดิมไม่มีตัวแปรนี้เลย
// ⚠️ ตรงนี้ผมอิงจาก key 'role' และ 'name' ที่คาดว่า LoginView.vue เซฟไว้ตอนล็อกอิน
// (จาก log "บันทึกสิทธิ์และชื่อเครื่องสำเร็จ: admin" ใน LoginView.vue:166)
// ช่วยเปิด LoginView.vue เช็ค key ที่ใช้ setItem จริงให้ตรงกันด้วยนะครับ
const userRole = ref(localStorage.getItem('role') || '')
// ✅ [แก้ไข] ยืนยันแล้วจาก LogFormView.vue ว่า key จริงคือ 'full_name' ไม่ใช่ 'name' ตามที่เดาไว้ก่อนหน้า
const currentTeacherName = ref(localStorage.getItem('full_name') || '')

// 🔧 [เพิ่มใหม่] ฟังก์ชันกลางสำหรับสร้าง auth header เพราะเดิมมีการเรียกใช้ getAuthHeader()
// ในหลายจุด (fetchTermHistory, fetchLogs, fetchDepartments, deleteLog) แต่ไม่เคยถูกประกาศไว้
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload).id 
  } catch (error) {
    return null
  }
}

// 🟢 [แก้ไข] ดึงรายชื่อภาคเรียนทั้งหมดจากประวัติภาคเรียนกลาง (academic_terms) ด้วย
// ไม่ใช่พึ่งพาแค่ภาคเรียนที่ปรากฏในบันทึกที่มีอยู่แล้วอย่างเดียว เพราะภาคเรียนที่เพิ่งเปิดใหม่
// อาจยังไม่มีบันทึกการสอนของใครเลยสักรายการ ตัวเลือกจะไม่โผล่ถ้าอิงจาก log เท่านั้น
const fetchTermHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system/settings/terms`, { headers: getAuthHeader() })
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map(t => `${t.term}/${t.academic_year}`)
    }
    return []
  } catch (error) {
    console.error('โหลดประวัติภาคเรียนไม่สำเร็จ:', error)
    return []
  }
}

// 📥 ดึงข้อมูลตารางพร้อมเคลียร์ทางม้าลายและลิสต์ภาคเรียน
const fetchLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE}/logs`, { headers: getAuthHeader() })
    rawLogs.value = response.data

    // 🟢 [แก้ไขภาคเรียนจาง/หาย] ดึงเฉพาะเลขเทอมล้วนๆ ออกมาทำ List ตัวเลือกไม่ให้พังซ้ำซ้อน
    const termsFromLogs = rawLogs.value.map(log => {
      return log.semester || log.term || ''
    })
    const termsFromHistory = await fetchTermHistory()

    termOptions.value = [...new Set([...termsFromLogs, ...termsFromHistory])]
      .filter(Boolean)
      .sort()
    
  } catch (error) {
    console.error('ดึงข้อมูลรายการสอนไม่สำเร็จ:', error)
  } finally {
    // หน่วงเวลาจิ๊ดนึงให้ตาเห็น แล้วค่อยปิดหน้าโหลดอย่างนุ่มนวล
    setTimeout(() => { isLoading.value = false }, 350)
  }
}

const fetchDepartments = async () => {
  try {
    const response = await axios.get(`${API_BASE}/departments`, { headers: getAuthHeader() })
    if (response.data) {
      departments.value = response.data 
    }
  } catch (error) {
    // แผนสำรองหลังบ้านล่ม
    departments.value = [
      { id: 'IT', name: 'เทคโนโลยีสารสนเทศ' },
      { id: 'AI', name: 'เทคโนโลยีปัญญาประดิษฐ์' },
      { id: 'EE', name: 'ไฟฟ้ากำลัง' },
      { id: 'ME', name: 'เทคนิคการผลิต' }
    ]
  }
}

// 🗑️ ฟังก์ชันลบงานที่ปลอดภัย ไม่โดน 401 ดีดกลับ
const deleteLog = async (id) => {
  if (!confirm('📌 แน่ใจใช่ไหมว่าจะลบบันทึกรายการนี้ออกจากระบบจริง?')) return
  try {
    isLoading.value = true // เปิดหน้าโหลดระว่างทำลายข้อมูล
    const response = await axios.delete(`${API_BASE}/logs/${id}`, { headers: getAuthHeader() })
    if (response.status === 200 || response.data.success) {
      alert('ลบข้อมูลบันทึกการสอนสำเร็จ! 🎉')
      await fetchLogs() 
    }
  } catch (error) {
    console.error('ลบข้อมูลไม่สำเร็จ:', error)
    alert('สิทธิ์ในการลบปฏิเสธ หรือเซสชันหมดอายุ กรุณาล็อกอินใหม่อีกครั้งค่ะ!')
    isLoading.value = false
  }
}

onMounted(async () => {
  currentUserId.value = getUserIdFromToken()
  // รันคู่ขนานรวดเร็ว (ตัด fetchSystemSettings ออกเพราะเป็นฟังก์ชันซ้ำกับ fetchLogs
  // ทั้งคู่เขียนทับ rawLogs.value เหมือนกัน เรียกพร้อมกันมีแต่จะแข่งกันเขียนทับข้อมูล)
  await Promise.all([fetchDepartments(), fetchLogs()])
})

const filteredLogs = computed(() => {
  let result = [...rawLogs.value]
  
  if (userRole.value !== 'admin' && currentTeacherName.value) {
    result = result.filter(log => log.teacher_name === currentTeacherName.value)
  }
  
  // 1. ด่านกรองตามแผนกวิชา (เดิมเช็ค selectedSemester.value ผิดจุด ทำให้กรองแผนกไม่ทำงานจริง)
  if (selectedDepartment.value) {
    result = result.filter(log => {
      const logDept = log.department_name || log.department || ''
      return logDept.toLowerCase().includes(selectedDepartment.value.toLowerCase().trim())
    })
  }
  
  // 2. ด่านกรองตามเทอม
  if (selectedSemester.value) {
    result = result.filter(log => {
      const logTerm = log.semester || log.term || ''
      return String(logTerm) === String(selectedSemester.value)
    })
  }
  
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(log => {
      return (log.subject_code || '').toLowerCase().includes(query) || 
             (log.subject_name || '').toLowerCase().includes(query)
    })
  }

  // 🟢 [เพิ่มใหม่] เรียงลำดับตาม id (บันทึกใหม่กว่า = id มากกว่า) ตามปุ่มที่ผู้ใช้เลือก
  result.sort((a, b) => {
    const diff = (a.id || 0) - (b.id || 0)
    return sortOrder.value === 'desc' ? -diff : diff
  })

  return result
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const viewDetail = (id) => {
  if (!id) return
  router.push(`/logs/${id}`)
} 
</script>

<style scoped>

.app-container, 
.app-container *,
table, 
tr, 
th, 
td, 
input, 
select, 
button {
  font-family: 'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}
.custom-select-wrapper {
  overflow: hidden;
  box-shadow: -3px 5px 10px rgba(0, 0, 0, 0.16), -1px 3px 6px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease-in-out;
}
.custom-select-wrapper:hover {
  box-shadow: -4px 7px 14px rgba(0, 0, 0, 0.2), -2px 4px 8px rgba(0, 0, 0, 0.12) !important;
}

.project-select-box option {
  font-family: 'Sarabun', sans-serif !important;
  background-color: #ffffff !important;
  color: #334155 !important;
  padding: 12px 16px !important;
  border-radius: 12px !important; 
}

select:focus {
  outline: none !important;
  box-shadow: none !important;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-detail {
  font-weight: 600 !important;
}
html, body {
  overflow-y: scroll !important;
}
</style>