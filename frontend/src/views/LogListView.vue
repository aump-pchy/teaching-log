<template>
  <div class="min-h-screen bg-[#f3f7f4] text-slate-700 p-6 font-sans tracking-wide antialiased app-container">
    
    <div class="max-w-7xl mx-auto mb-6 bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="bg-gradient-to-br from-[#0f543e] to-[#28a745] text-white p-3 rounded-2xl mt-0.5 hidden sm:block shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span class="text-xs font-bold text-[#1e7e34] tracking-widest block uppercase mb-0.5">วิทยาลัยเทคนิคเลย</span>
            <h1 class="text-xl font-bold text-[#0f543e] tracking-tight">รายการบันทึกการจัดการเรียนการสอน</h1>
            <p class="text-xs text-slate-400 mt-1 font-medium">แสดงผลข้อมูลบันทึกการสอนในสถานประกอบการแยกตามแผนกวิชา</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 bg-[#f8faf8] p-2 rounded-xl border border-slate-200/50 w-full md:w-auto shadow-inner flex-wrap md:flex-nowrap">
          
          <div class="flex items-center gap-1.5 w-full md:w-64 border-r border-slate-200/60 pr-2">
            <span class="text-xs font-bold text-slate-500 pl-2">🔍</span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="ค้นชื่อครู, รหัสวิชา, ชื่อวิชา..." 
              class="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-[#1e7e34] focus:border-[#1e7e34] block w-full p-2 font-medium shadow-sm outline-none"
            />
          </div>

          <div class="flex items-center gap-1.5 w-full md:w-auto">
            <label for="dept-filter" class="text-xs font-bold text-slate-500 whitespace-nowrap pl-2">
              🏢 แผนก:
            </label>
            <div class="relative w-full md:w-44">
              <select
                id="dept-filter"
                v-model="selectedDept"
                class="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-[#1e7e34]/20 focus:border-[#1e7e34] block w-full p-2.5 pr-8 font-semibold shadow-sm transition-all outline-none appearance-none cursor-pointer hover:border-slate-300"
              >
                <option value="">ทั้งหมดทุกแผนกวิชา</option>
                <option v-for="(dept, index) in departments" :key="index" :value="dept">
                  {{ dept }}
                </option>
              </select>
              <span class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] text-slate-400">▼</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto mb-4 flex justify-start">
      <div class="relative flex items-center bg-gradient-to-r from-[#0f543e] to-[#249143] text-white text-xs font-semibold rounded-full custom-select-wrapper">
        <span class="pl-4 text-sm pointer-events-none z-10">📌</span>
        
        <select 
          v-model="selectedSemester" 
          class="bg-transparent text-white font-semibold cursor-pointer pl-2 pr-9 py-2 focus:outline-none appearance-none font-sans rounded-full z-10 w-full project-select-box"
        >
          <option value="1/2569" class="text-slate-700 bg-white font-semibold">ภาคเรียนที่ 1/2569</option>
          <option value="2/2569" class="text-slate-700 bg-white font-semibold">ภาคเรียนที่ 2/2569</option>
          <option value="summer" class="text-slate-700 bg-white font-semibold">ภาคเรียนฤดูร้อน (Summer)</option>
        </select>

        <span class="absolute right-4 pointer-events-none text-[9px] opacity-80 z-10">▼</span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse min-w-[850px]">
          <thead class="bg-gradient-to-r from-[#0f543e] via-[#167053] to-[#1e7e34] text-white text-xs font-bold tracking-wider">
            <tr>
              <th class="py-4 px-4 text-center w-[10%] font-medium">สัปดาห์</th>
              <th class="py-4 px-4 text-center w-[15%] font-medium">รหัสวิชา</th>
              <th class="py-4 px-6 text-left w-[30%] font-medium">ชื่อวิชา</th>
              <th class="py-4 px-4 text-left w-[20%] font-medium">ครูผู้สอน</th>
              <th class="py-4 px-6 text-left w-[15%] font-medium">แผนกวิชา</th>
              <th class="py-4 px-4 text-center w-[10%] font-medium">จัดการ</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-600">
            <template v-if="filteredLogs.length > 0">
              <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-[#f2f9f5]/60 transition-colors">
                
                <td class="py-4 px-4 text-center font-bold text-[#0f543e] truncate text-sm">
                  {{ log.week }}
                </td>
                
                <td class="py-4 px-4 text-center truncate">
                  <span class="font-mono text-xs bg-slate-50 text-slate-500 rounded-md px-2.5 py-1 border border-slate-200/50 font-medium tracking-tight">
                    {{ log.subject_code }}
                  </span>
                </td>
                
                <td class="py-4 px-6 text-slate-800 truncate font-semibold" :title="log.subject_name">
                  {{ log.subject_name }}
                </td>
                
                <td class="py-4 px-4 text-slate-600 truncate font-medium" :title="log.teacher_name">
                  {{ log.teacher_name }}
                </td>

                <td class="py-4 px-6 text-slate-500 truncate" :title="log.department_name">
                  <span class="inline-block px-2.5 py-0.5 bg-[#eaf4ef] text-[#0f543e] rounded-md text-[11px] font-bold border border-[#d6eae0]">
                    {{ log.department_name }}
                  </span>
                </td>
                
                <td class="py-4 px-4 text-center">
                  <button 
                    @click="viewDetail(log.id)" 
                    class="bg-gradient-to-r from-[#0f543e] to-[#1e7e34] text-white text-xs px-3.5 py-1.5 rounded-lg hover:brightness-110 font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95 btn-detail"
                  >
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            </template>
            
            <template v-else>
              <tr>
                <td colspan="6" class="py-16 text-center text-slate-400 font-medium">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <span class="text-2xl">📭</span>
                    <span class="text-xs tracking-normal">ไม่พบข้อมูลรายการบันทึกการสอนในระบบ</span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router' 
import axios from 'axios' 

const router = useRouter()
const rawLogs = ref([])

const selectedSemester = ref('1/2569')
const isOpen = ref(false) // 🌟 เพิ่มตัวนี้เข้าไปเพื่อใช้เปิด-ปิดกล่องจำ
const departments = ["IT", "AI", "EE", "ME"]
const selectedDept = ref("")
const searchQuery = ref('')

// ตัวแปรเก็บข้อมูลครูที่ได้จากการแกะ Token ฝั่งหน้าบ้าน
const currentUserId = ref(null)

// ฟังก์ชันแกะข้อมูลจาก JWT Token ที่เก็บในเครื่อง เพื่อหา ID ของครูที่กำลังล็อกอิน
const getUserIdFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    
    const decoded = JSON.parse(jsonPayload)
    return decoded.id 
  } catch (error) {
    console.error('แกะ Token ไม่สำเร็จ:', error)
    return null
  }
}

const fetchLogs = async () => {
  try {
    const url = selectedDept.value 
      ? `http://localhost:3000/api/logs?dept=${selectedDept.value}` 
      : 'http://localhost:3000/api/logs'
      
    const token = localStorage.getItem('token') 
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    rawLogs.value = response.data
  } catch (error) {
    console.error('ดึงข้อมูลรายการสอนไม่สำเร็จ:', error)
  }
}

onMounted(() => {
  currentUserId.value = getUserIdFromToken()
  fetchLogs()
})

watch(selectedDept, () => {
  fetchLogs()
})

watch(selectedSemester, () => {
  fetchLogs()
})

// ระบบกรองและพิมพ์ค้นหา
const filteredLogs = computed(() => {
  console.log("👉 ID ของครูที่ล็อกอินอยู่ปัจจุบันคือ:", currentUserId.value)
  console.log("📦 ก้อนข้อมูลที่ได้มาจากหลังบ้านแถวแรกคือ:", rawLogs.value[0])
  
  const userRole = localStorage.getItem('role')
  const currentTeacherName = localStorage.getItem('full_name') 
  
  let result = [...rawLogs.value]
  
  // 1. ด่านกรองสิทธิ์: ถ้าเป็นครูทั่วไป (teacher) ให้กรองเอาเฉพาะข้อมูลของตัวเอง
  if (userRole !== 'admin') {
    if (currentTeacherName) {
      result = result.filter(log => log.teacher_name === currentTeacherName)
    }
  }
  
  // 2. ด่านกรองตามเทอม
  if (selectedSemester.value) {
    result = result.filter(log => {
      const logTerm = log.semester || log.term || '1/2569'
      return logTerm === selectedSemester.value
    })
  }
  
  // 3. ด่านพิมพ์ค้นหา รหัสวิชา / ชื่อวิชา / ชื่อครู
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(log => {
      const teacher = (log.teacher_name || '').toLowerCase()
      const subCode = (log.subject_code || '').toLowerCase()
      const subName = (log.subject_name || '').toLowerCase()
      
      return teacher.includes(query) || subCode.includes(query) || subName.includes(query)
    })
  }
  
  return result
})

const viewDetail = (id) => {
  if (!id) return
  router.push(`/logs/${id}`)
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('[v-data-dropdown]')) {
      isOpen.value = false
    }
  })
}
</script>

<style scoped>

/*  บังคับใช้ฟอนต์ Sarabun และฟอนต์ระบบสไตล์ไม่มีหัวโมเดิร์นเคลียร์แบบภาพแรก */
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

/* 🌟 2. เวทมนตร์สั่งกล่องเด้ง (Option) ของเบราว์เซอร์ให้โค้งมน ไม่แข็งทื่อบังเงา! */
.project-select-box option {
  font-family: 'Sarabun', sans-serif !important;
  background-color: #ffffff !important;
  color: #334155 !important;
  padding: 12px 16px !important;
  /* คำสั่งลับบังคับขอบมนที่กล่องเด้งย่อย */
  border-radius: 12px !important; 
}

/* ล้างขอบสีฟ้าน่าเกลียดออกให้หมดเวลาจิ้ม */
select:focus {
  outline: none !important;
  box-shadow: none !important;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ปรับแต่งปุ่มกดดูรายละเอียดให้ฟอนต์หนาคมชัดขึ้น */
.btn-detail {
  font-weight: 600 !important;
}
</style>

<style>
html, body {
  overflow-y: scroll !important; /* บังคับให้เบราว์เซอร์หลักสร้างแถบเลื่อนแนวตั้งค้างไว้ถาวร */
}
</style>