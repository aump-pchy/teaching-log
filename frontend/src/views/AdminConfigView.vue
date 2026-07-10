<template>
  <div class="max-w-4xl mx-auto my-8 font-sans space-y-8 select-none">
    
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="bg-[#1e7e34] px-6 py-5">
        <h2 class="text-xl font-bold text-white tracking-wide">ข้อมูลรายนามผู้บริหารปัจจุบัน</h2>
        <p class="text-xs text-green-100/80 mt-1 font-medium">ขั้นตอนที่ 1 จาก 2 : กำหนดรายชื่อผู้บริหารสำหรับการลงนามในเอกสารปัจจุบัน</p>
      </div>

      <div class="p-6 space-y-6">
        <div class="bg-emerald-50/50 border border-emerald-200/60 rounded-xl px-4 py-3 text-sm text-emerald-800 font-medium">
          ℹ️ กรุณาตรวจสอบการสะกดชื่อ-นามสกุล และตำแหน่งให้ถูกต้องก่อนดำเนินการบันทึกข้อมูล
        </div>

        <form @submit.prevent="saveExecutiveSettings" class="space-y-6 text-sm font-semibold text-slate-600">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="flex flex-col gap-2">
              <label class="text-slate-500 font-bold">หัวหน้างานพัฒนาหลักสูตรฯ *</label>
              <input 
                type="text" 
                v-model="executives.head_curriculum"
                placeholder="ระบุชื่อ-นามสกุล หัวหน้างานฯ"
                class="border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#1e7e34] font-medium text-slate-700 bg-white transition-all shadow-sm"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-slate-500 font-bold">วิชาการสอน (รองผู้อำนวยการ) *</label>
              <input 
                type="text" 
                v-model="executives.deputy_academic"
                placeholder="ระบุชื่อ-นามสกุล รองผู้อำนวยการ"
                class="border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#1e7e34] font-medium text-slate-700 bg-white transition-all shadow-sm"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-slate-500 font-bold">ผู้อำนวยการวิทยาลัย *</label>
              <input 
                type="text" 
                v-model="executives.director"
                placeholder="ระบุชื่อ-นามสกุล ผู้อำนวยการ"
                class="border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#1e7e34] font-medium text-slate-700 bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-slate-100">
            <button 
              type="submit" 
              :disabled="isSavingExec"
              class="px-6 py-2.5 bg-[#1e7e34] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#145623] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {{ isSavingExec ? 'กำลังบันทึก...' : 'อัปเดตข้อมูล' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="bg-[#1e7e34] px-6 py-5">
        <h2 class="text-xl font-bold text-white tracking-wide">เปิดภาคเรียน / ปีการศึกษาใหม่</h2>
        <p class="text-xs text-green-100/80 mt-1 font-medium">ขั้นตอนที่ 2 จาก 2 : เพิ่มข้อมูลภาคเรียนใหม่เข้าสู่ระบบฐานข้อมูลกลาง</p>
      </div>

      <div class="p-6 space-y-6">
        <form @submit.prevent="addNewSemester" class="space-y-6 text-sm font-semibold text-slate-600">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-2">
              <label class="text-slate-500 font-bold">ภาคเรียน *</label>
              <select 
                v-model="newSemester.current_semester" 
                class="border border-slate-200 rounded-xl py-2.5 px-3 bg-white outline-none focus:border-[#1e7e34] font-medium text-slate-700 cursor-pointer transition-all shadow-sm"
              >
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="summer">ภาคเรียนฤดูร้อน (Summer)</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-slate-500 font-bold">ปีการศึกษา (พ.ศ.) *</label>
              <input 
                type="text" 
                v-model="newSemester.academic_year" 
                placeholder="เช่น 2570" 
                class="border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#1e7e34] font-medium text-slate-700 bg-white transition-all shadow-sm" 
              />
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-slate-100">
            <button 
              type="submit" 
              :disabled="isSavingTerm" 
              class="px-6 py-2.5 bg-[#1e7e34] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#145623] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {{ isSavingTerm ? 'กำลังบันทึก...' : 'บันทึกข้อมูลภาคเรียน' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="border border-slate-200 rounded-2xl shadow-sm bg-white">
      <div class="bg-slate-50 px-6 py-4 border-b border-slate-200/60 rounded-t-2xl">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">รายชื่อภาคเรียนทั้งหมดในระบบปัจจุบัน</h3>
        <p class="text-[11px] text-slate-400 mt-1 font-medium">คลิกที่รายการเพื่อตั้งเป็นภาคเรียนปัจจุบัน หรือลบออกจากประวัติ</p>
      </div>
      <div class="p-6 bg-slate-50/20 rounded-b-2xl">
        <div class="flex flex-wrap gap-2.5">
          <div v-for="item in historyList" :key="item.id" class="relative">
            <button
              type="button"
              @click="toggleTermMenu(item.id)"
              class="flex items-center gap-1.5 border font-medium px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              :class="item.is_current
                ? 'bg-[#1e7e34] border-[#1e7e34] text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#1e7e34] hover:text-[#1e7e34]'"
            >
              <span v-if="item.is_current">✅</span>
              {{ item.term === 'summer' ? 'ภาคเรียนฤดูร้อน (Summer)' : `ภาคเรียนที่ ${item.term}` }} / ปีการศึกษา {{ item.academic_year }}
            </button>

            <!-- 🟢 backdrop โปร่งใส ปิด popover อัตโนมัติเวลาคลิกที่อื่นบนหน้าจอ -->
            <div v-if="openTermMenuId === item.id" class="fixed inset-0 z-10" @click="openTermMenuId = null"></div>

            <div
              v-if="openTermMenuId === item.id"
              class="absolute z-20 top-full mt-1.5 left-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-56"
            >
              <button
                type="button"
                v-if="!item.is_current"
                @click="handleSetCurrent(item)"
                class="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-[#1e7e34] transition-all cursor-pointer flex items-center gap-2"
              >
                📌 ตั้งเป็นภาคเรียนปัจจุบัน
              </button>
              <div v-else class="px-4 py-2.5 text-xs font-semibold text-[#1e7e34] flex items-center gap-2 bg-emerald-50">
                ✅ เป็นภาคเรียนปัจจุบันอยู่แล้ว
              </div>
              <!-- 🟢 [เพิ่มใหม่] ปุ่มลบแยกสี + ต้องกดยืนยันอีกชั้นผ่าน confirm() กันคลิกโดนโดยไม่ตั้งใจ -->
              <button
                type="button"
                @click="handleDeleteTerm(item)"
                class="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer flex items-center gap-2 border-t border-slate-100"
              >
                🗑️ ลบภาคเรียนนี้
              </button>
            </div>
          </div>

          <span v-if="historyList.length === 0" class="text-xs font-medium text-slate-400 py-1">
            ไม่มีข้อมูลภาคเรียนในระบบกลาง (กรุณากรอกข้อมูลเพื่อบันทึกขั้นถัดไป)
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const isSavingExec = ref(false)
const isSavingTerm = ref(false)
// 🟢 [เพิ่มใหม่] เก็บ id ของภาคเรียนที่กำลังเปิดเมนู (ตั้งปัจจุบัน/ลบ) อยู่ ทีละอันเท่านั้น
const openTermMenuId = ref(null)

const executives = ref({
  head_curriculum: '',
  deputy_academic: '',
  director: ''
})

// 🟢 [แก้ไข] เดิม hardcode ปีการศึกษาเริ่มต้นเป็น '2569' ค้างไว้ตายตัว
// ถ้าปีนี้ในระบบเลยไปแล้ว (เช่นตอนนี้เป็น 2570) พอกดบันทึกโดยไม่ได้แก้ค่า
// จะชนกับข้อมูลเดิมที่เคยเพิ่มไปแล้วเสมอ แล้วโดนปฏิเสธว่า "มีในระบบแล้ว" (400) ทุกครั้ง
const newSemester = ref({
  current_semester: '1',
  academic_year: ''
})

const historyList = ref([])

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetchExecutives = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system/settings/executives`, { headers: getAuthHeader() })
    if (response.data && response.data.data) {
      executives.value = response.data.data
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchTermHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE}/system/settings/terms`, { headers: getAuthHeader() })
    if (response.data && response.data.data) {
      historyList.value = response.data.data
    }
  } catch (error) {
    console.error(error)
  }
}

const saveExecutiveSettings = async () => {
  try {
    isSavingExec.value = true
    const response = await axios.post(`${API_BASE}/system/settings/executives`, executives.value, { headers: getAuthHeader() })
    if (response.status === 200 || response.data.success) {
      alert('บันทึกอัปเดตข้อมูลผู้บริหารเรียบร้อยแล้วค่ะ')
      await fetchExecutives()
    }
  } catch (error) {
    alert('บันทึกข้อมูลผู้บริหารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  } finally {
    isSavingExec.value = false
  }
}

// 🟢 [แก้ไข] เดิมพอเพิ่มภาคเรียนใหม่ปุ๊บ backend จะตั้งเป็นภาคเรียนปัจจุบันให้อัตโนมัติทันที
// ตอนนี้แค่เพิ่มเข้าประวัติเฉยๆ ต้องมากดเลือก "ตั้งเป็นภาคเรียนปัจจุบัน" ที่รายการด้านล่างเอง
// เพื่อความชัวร์ว่าไม่ได้ดึงค่าไปใช้แบบเข้าใจผิด
const addNewSemester = async () => {
  try {
    isSavingTerm.value = true
    const response = await axios.post(`${API_BASE}/system/settings/terms`, newSemester.value, { headers: getAuthHeader() })
    if (response.status === 200 || response.data.success) {
      alert('เพิ่มภาคเรียนใหม่เข้าประวัติสำเร็จแล้วค่ะ\n\nอย่าลืมกดเลือกรายการด้านล่าง แล้วเลือก "ตั้งเป็นภาคเรียนปัจจุบัน" ถ้าต้องการให้บันทึกการสอนใหม่ใช้ภาคเรียนนี้')
      await fetchTermHistory()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกภาคเรียนใหม่')
  } finally {
    isSavingTerm.value = false
  }
}

const toggleTermMenu = (id) => {
  openTermMenuId.value = openTermMenuId.value === id ? null : id
}

// 🟢 [เพิ่มใหม่] ตั้งภาคเรียนที่เลือกเป็นภาคเรียนปัจจุบัน — มี confirm() กันกดพลาด เพราะมีผลทันที
// กับบันทึกการสอนใหม่ทุกอันที่จะสร้างต่อจากนี้
const handleSetCurrent = async (item) => {
  openTermMenuId.value = null
  const label = item.term === 'summer' ? 'ภาคเรียนฤดูร้อน (Summer)' : `ภาคเรียนที่ ${item.term}`
  const confirmed = confirm(
    `ยืนยันตั้ง "${label} / ปีการศึกษา ${item.academic_year}" เป็นภาคเรียนปัจจุบันใช่ไหม?\n\nบันทึกการสอนที่สร้างใหม่หลังจากนี้จะถูกฝังภาคเรียนนี้ทันที`
  )
  if (!confirmed) return

  try {
    const response = await axios.post(`${API_BASE}/system/settings/terms/${item.id}/set-current`, {}, { headers: getAuthHeader() })
    alert(response.data?.message || 'ตั้งภาคเรียนปัจจุบันสำเร็จ')
    await fetchTermHistory()
  } catch (error) {
    alert(error.response?.data?.message || 'ตั้งภาคเรียนปัจจุบันไม่สำเร็จ')
  }
}

// 🟢 [เพิ่มใหม่] ลบภาคเรียนออกจากประวัติ — เป็น action ที่ย้อนกลับไม่ได้ เลยบังคับให้ต้องกด
// ยืนยันผ่าน confirm() อีกชั้นเสมอ ป้องกันการคลิกโดนโดยไม่ตั้งใจ (เช่นเผลอกดตอนเลื่อนหน้าจอ)
const handleDeleteTerm = async (item) => {
  openTermMenuId.value = null
  const label = item.term === 'summer' ? 'ภาคเรียนฤดูร้อน (Summer)' : `ภาคเรียนที่ ${item.term}`
  const confirmed = confirm(
    `ยืนยันลบ "${label} / ปีการศึกษา ${item.academic_year}" ออกจากระบบใช่ไหม?\n\n⚠️ การลบนี้ย้อนกลับไม่ได้`
  )
  if (!confirmed) return

  try {
    const response = await axios.delete(`${API_BASE}/system/settings/terms/${item.id}`, { headers: getAuthHeader() })
    alert(response.data?.message || 'ลบภาคเรียนสำเร็จ')
    await fetchTermHistory()
  } catch (error) {
    alert(error.response?.data?.message || 'ลบภาคเรียนไม่สำเร็จ')
  }
}

onMounted(() => {
  fetchExecutives()
  fetchTermHistory()
})
</script>

<style scoped>
* {
  font-family: 'Sarabun', 'Inter', sans-serif !important;
}
</style>