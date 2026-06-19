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
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#0f543e] text-white text-sm font-medium">
              <th class="py-4 px-4 text-center w-20">สัปดาห์</th>
              <th class="py-4 px-4 w-32 text-center">รหัสวิชา</th>
              <th class="py-4 px-6">ชื่อวิชา</th>
              <th class="py-4 px-4">ครูผู้สอน</th>
              <th class="py-4 px-6">แผนกวิชา</th>
              <th class="py-4 px-4 text-center w-28">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <template v-if="filteredLogs.length > 0">
              <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-[#f9fbf9] transition-colors">
                <td class="py-4 px-4 text-center font-semibold text-[#0f543e]">
                  {{ log.week }}
                </td>
                
                <td class="py-4 px-4 text-center">
                  <span class="font-mono text-xs bg-slate-50 text-slate-600 rounded px-2 py-1 border border-slate-100">
                    {{ log.subject_code }}
                  </span>
                </td>
                
                <td class="py-4 px-6 font-medium text-slate-800">
                  {{ log.subject_name }}
                </td>
                
                <td class="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                  {{ log.teacher_name }}
                </td>

                <td class="py-4 px-6 text-slate-600">
                  {{ log.department_name }}
                </td>
                
                <td class="py-4 px-4 text-center">
                  <button 
                    @click="viewDetail(log.id)"
                    class="bg-[#0f543e] hover:bg-[#13664c] text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            </template>
            
            <tr v-else>
              <td colSpan="6" class="py-10 text-center text-slate-400">
                ไม่พบข้อมูลบันทึกการสอนของแผนกวิชานี้
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' // 🟢 นำเข้าระบบจัดเส้นทางย้ายหน้าจอ

// เรียกใช้งานฟังก์ชัน Router ของ Vue
const router = useRouter()

// 1. ข้อมูลสมมุติ (Mock Data)
const mockLogs = ref([
  {
    id: 1,
    week: 1,
    subject_code: "30204-2001",
    subject_name: "โครงสร้างข้อมูลและอัลกอริทึม",
    teacher_name: "สมชาย สายโค้ด",
    department_name: "แผนกวิชาคอมพิวเตอร์ธุรกิจ/เทคโนโลยีสารสนเทศ"
  },
  {
    id: 2,
    week: 2,
    subject_code: "30204-2001",
    subject_name: "โครงสร้างข้อมูลและอัลกอริทึม",
    teacher_name: "สมชาย สายโค้ด",
    department_name: "แผนกวิชาคอมพิวเตอร์ธุรกิจ/เทคโนโลยีสารสนเทศ"
  },
  {
    id: 3,
    week: 1,
    subject_code: "30105-2104",
    subject_name: "การวิเคราะห์วงจรอิเล็กทรอนิกส์",
    teacher_name: "อัญชลี เรียนดี",
    department_name: "แผนกวิชาอิเล็กทรอนิกส์"
  },
  {
    id: 4,
    week: 1,
    subject_code: "30127-2002",
    subject_name: "ระบบควบคุมอัตโนมัติในงานอุตสาหกรรม",
    teacher_name: "วิโรจน์ ยาบุษดี",
    department_name: "แผนกวิชาช่างไฟฟ้ากำลัง"
  }
])

// 2. รายชื่อแผนกสำหรับตัวกรอง
const departments = [
  "แผนกวิชาคอมพิวเตอร์ธุรกิจ/เทคโนโลยีสารสนเทศ",
  "แผนกวิชาอิเล็กทรอนิกส์",
  "แผนกวิชาช่างไฟฟ้ากำลัง"
]

// 3. State เก็บค่าแผนกที่ถูกเลือก
const selectedDept = ref("")

// 4. Computed สำหรับกรองข้อมูลในตารางอัตโนมัติ
const filteredLogs = computed(() => {
  if (selectedDept.value === "") return mockLogs.value
  return mockLogs.value.filter(log => log.department_name === selectedDept.value)
})

// 🟢 ปรับแก้: สั่งให้ผลักหน้าจอบราวเซอร์ วิ่งไปยังหน้ารายละเอียดของชิ้นงานนั้นทันที
const viewDetail = (id) => {
  router.push(`/logs/${id}`)
}
</script>