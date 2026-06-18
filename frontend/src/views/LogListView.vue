<template>
  <div class="min-h-screen bg-[#f4f7f4] text-slate-800 p-6 font-sans">
    
    <div class="max-w-7xl mx-auto mb-4">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
        <div>
          <span class="text-sm font-bold text-[#0f543e] tracking-wide">
            วิทยาลัยเทคนิคเลย
          </span>
          <h1 class="text-2xl font-bold text-[#0f543e] mt-1">
            รายการบันทึกการจัดการเรียนการสอน
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            แสดงผลข้อมูลบันทึกการสอนในสถานประกอบการแยกตามแผนกวิชา
          </p>
        </div>

        <div class="mt-4 md:mt-0 flex items-center gap-3">
          <label for="dept-filter" class="text-sm font-medium text-slate-600 whitespace-nowrap">
            กรองตามแผนกวิชา:
          </label>
          <select
            id="dept-filter"
            v-model="selectedDept"
            class="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-[#0f543e] focus:border-[#0f543e] block w-full md:w-72 p-2.5 shadow-sm transition-all"
          >
            <option value="">ทั้งหมดทุกแผนกวิชา</option>
            <option v-for="(dept, index) in departments" :key="index" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto mb-3 flex justify-start">
      <span class="bg-[#e2ebe2] text-[#0f543e] text-xl font-semibold px-3 py-1.5 rounded-md border border-[#c8dec8]/50 shadow-sm">
        📌 ภาคเรียนที่ 1/2569
      </span>
    </div>

    <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse">
  <thead class="bg-[#0f543e] text-white text-sm">
    <tr>
      <th class="py-3 px-4 text-center w-[10%]">สัปดาห์</th>
      <th class="py-3 px-4 text-center w-[15%]">รหัสวิชา</th>
      <th class="py-3 px-6 text-left w-[30%]">ชื่อวิชา</th>
      <th class="py-3 px-4 text-left w-[20%]">ครูผู้สอน</th>
      <th class="py-3 px-6 text-left w-[15%]">แผนกวิชา</th>
      <th class="py-3 px-4 text-center w-[10%]">จัดการ</th>
    </tr>
  </thead>

  <tbody class="divide-y divide-slate-100 text-sm">
    <template v-if="filteredLogs.length > 0">
      <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-[#f9fbf9] transition-colors">
        
        <td class="py-4 px-4 text-center font-semibold text-[#0f543e] truncate">
          {{ log.week }}
        </td>
        
        <td class="py-4 px-4 text-center truncate">
          <span class="font-mono text-xs bg-slate-50 text-slate-600 rounded px-2 py-1 border border-slate-100">
            {{ log.subject_code }}
          </span>
        </td>
        
        <td class="py-4 px-6 font-medium text-slate-800 truncate" :title="log.subject_name">
          {{ log.subject_name }}
        </td>
        
        <td class="py-4 px-4 font-medium text-slate-700 truncate" :title="log.teacher_name">
          {{ log.teacher_name }}
        </td>

        <td class="py-4 px-6 text-slate-600 truncate" :title="log.department_name">
          {{ log.department_name }}
        </td>
        
        <td class="py-4 px-4 text-center">
          <button @click="viewDetail(log.id)" class="bg-[#0f543e] text-white text-xs px-3 py-1.5 rounded hover:bg-[#0c4331] transition-colors whitespace-nowrap">
            ดูรายละเอียด
          </button>
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
import { useRouter } from 'vue-router' // 🟢 นำเข้าระบบจัดเส้นทางย้ายหน้าจอ
import axios from 'axios' // ยิงเรียกข้อมูลจากหลังบ้าน

// เรียกใช้งานฟังก์ชัน Router ของ Vue
const router = useRouter()

// 1. เปลี่ยนตัวแปรหลักให้กลายเป็นกล่องเปล่า เพื่อรอรับข้อมูลจริงจาก Supabase
const rawLogs = ref([])

// 2. รายชื่อโค้ดแผนกวิชาสำหรับตัวกรอง (อิงตามฟิลด์ code ในตาราง Supabase ของจริง)
const departments = ["IT", "AI", "EE", "ME"]
const selectedDept = ref("")

// 3. ฟังก์ชันสำหรับยิงไปเอาข้อมูลรายการบันทึกการสอนจากหลังบ้าน
const fetchLogs = async () => {
  try {
    // ตรวจสอบเงื่อนไข: ถ้าเลือกแผนกวิชา ให้ส่ง ?dept= ไปด้วยตามเงื่อนไขของหนู
    const url = selectedDept.value 
      ? `/api/logs?dept=${selectedDept.value}` 
      : '/api/logs'
      
    // ดึงรหัสความปลอดภัย (JWT Token) ที่เก็บไว้ในเครื่องหลังจากเข้าสู่ระบบ
    const token = localStorage.getItem('token') 
    
    // ยิง Request ไปเรียกข้อมูลหลังบ้านพร้อมแนบสิทธิ์การเข้าถึง
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // เอาข้อมูลจริงมาใส่ในตัวแปรตาราง
    rawLogs.value = response.data
  } catch (error) {
    console.error('ดึงข้อมูลรายการสอนไม่สำเร็จ:', error)
  }
}

// 4. สั่งให้ฟังก์ชันทำงานทันทีที่เปิดเข้าหน้านี้มา (หน้าเว็บเปิดปุ๊บ ข้อมูลเด้งปั๊บ)
onMounted(() => {
  fetchLogs()
})

// 5. เมื่อกดคลิกเปลี่ยนแผนกวิชาในหน้าเว็บ ให้สั่งวิ่งไปดึงข้อมูลใหม่ตามตัวกรองทันที
watch(selectedDept, () => {
  fetchLogs()
})

// 6. ปล่อยฟังก์ชันนี้ไว้ทำงานร่วมกับตาราง Vue เดิม
const filteredLogs = computed(() => {
  return rawLogs.value
})

// 🟢 ปรับแก้: สั่งให้ผลักหน้าจอบราวเซอร์ วิ่งไปยังหน้ารายละเอียดของชิ้นงานนั้นทันที
const viewDetail = (id) => {
  router.push(`/logs/${id}`)
}
</script>