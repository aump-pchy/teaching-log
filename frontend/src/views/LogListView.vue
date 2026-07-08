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
          <option value="">🏢 ทั้งหมดทุกแผนกวิชา</option>
          <option v-for="dept in departments" :key="dept.id || dept.name" :value="dept.name">
            {{ dept.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex items-center justify-start">
      <select 
        v-model="selectedSemester"
        class="bg-gradient-to-r from-[#1e7e34] to-[#145623] text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md hover:opacity-95 transition-all outline-none cursor-pointer border-none"
      >
        <option value="">📌 แสดงทุกภาคเรียน</option>
        <option v-for="term in termOptions" :key="term" :value="term">
          ภาคเรียนที่ {{ term }}
        </option>
      </select>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router' 
import axios from 'axios' 

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const router = useRouter()

// 🟢 [แก้จุดเอ๋อแวบ] บังคับให้โหลดค้างไว้เป็น true ตั้งแต่เกิด!
const isLoading = ref(true) 
const userRole = ref(localStorage.getItem('role') || 'teacher') 
const currentTeacherName = ref(localStorage.getItem('full_name') || '')
const currentUserId = ref(null)

const searchQuery = ref('')
const selectedSemester = ref('') 
const selectedDepartment = ref('') 

const rawLogs = ref([])
const termOptions = ref([])  
const departments = ref([])  

// ฟังก์ชันดักเช็กและแนบ Token (ป้องกัน 401 Unauthorized ขาดลอย)
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('❌ ไม่พบโทเค็นในระบบ กรุณาล็อกอินใหม่')
    return {}
  }
  return { Authorization: `Bearer ${token}` }
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

const fetchSystemSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system/settings`, { headers: getAuthHeader() })
    console.log('⚙️ โหลดเซ็ตติ้งสำเร็จ')
  } catch (error) {
    console.error('โหลดข้อมูลระบบกลางไม่สำเร็จ:', error)
  }
}

// 📥 ดึงข้อมูลตารางพร้อมเคลียร์ทางม้าลายและลิสต์ภาคเรียน
const fetchLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE}/logs`, { headers: getAuthHeader() })
    rawLogs.value = response.data

    // 🟢 [แก้ไขภาคเรียนจาง/หาย] ดึงเฉพาะเลขเทอมล้วนๆ ออกมาทำ List ตัวเลือกไม่ให้พังซ้ำซ้อน
    const terms = rawLogs.value.map(log => {
      return log.semester || log.term || ''
    })
    termOptions.value = [...new Set(terms)].filter(Boolean).sort((a, b) => a - b)
    
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
  // รันคู่ขนานรวดเร็ว
  await Promise.all([fetchSystemSettings(), fetchDepartments(), fetchLogs()])
})

// สมองกลคัดกรองตาราง ทำงานเรียลไทม์ไม่มีดีเลย์
const filteredLogs = computed(() => {
  let result = [...rawLogs.value]
  
  if (userRole.value !== 'admin') {
    if (currentTeacherName.value) {
      result = result.filter(log => log.teacher_name === currentTeacherName.value)
    }
  }
  
  if (selectedDepartment.value) {
    result = result.filter(log => {
      const logDept = log.department_name || log.department || ''
      return logDept.toLowerCase().includes(selectedDepartment.value.toLowerCase().trim())
    })
  }
  
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
  
  return result
})

const viewDetail = (id) => {
  if (!id) return
  router.push(`/logs/${id}`)
} 
</script>

<style scoped>
/* 🟢 จัดแต่งฟอนต์สารบรรณเด่นๆ หนาอ่านง่ายสบายตา */
.app-container, .app-container *,
table, tr, th, td, input, select, button {
  font-family: 'Sarabun', 'Inter', sans-serif !important;
}

:global(html) {
  overflow-y: scroll !important;
}

.custom-styled-table {
  table-layout: fixed; 
  width: 100% !important;
}

/* 🎨 ไล่ระดับเฉดสีหัวตาราง Gradient สวยหรูหราทรงคุณค่า */
.custom-thead {
  background: linear-gradient(135deg, #1e7e34 0%, #145623 100%) !important;
}

.custom-thead th {
  font-size: 14px !important;
  font-weight: 800 !important;
  letter-spacing: 0.5px;
}

/* 🎨 ฟอร์แมตสลับแถวทางม้าลาย */
.table-row-item:nth-child(odd) {
  background-color: #ffffff !important;
}
.table-row-item:nth-child(even) {
  background-color: #f5fcf8 !important; 
}
.table-row-item:hover {
  background-color: #e4f5ea !important; 
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 🌀 แอนิเมชันลูกเล่นขยับหมุนตัวโหลด */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite !important;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
}
</style>