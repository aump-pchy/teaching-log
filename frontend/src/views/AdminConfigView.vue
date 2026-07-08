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

    <div class="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <div class="bg-slate-50 px-6 py-4 border-b border-slate-200/60">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">รายชื่อภาคเรียนทั้งหมดในระบบปัจจุบัน</h3>
      </div>
      <div class="p-6 bg-slate-50/20">
        <div class="flex flex-wrap gap-2.5">
          <span 
            v-for="(item, idx) in historyList" 
            :key="idx" 
            class="bg-white border border-slate-200 text-slate-600 font-medium px-4 py-2 rounded-xl text-xs shadow-sm hover:border-[#1e7e34] hover:text-[#1e7e34] transition-all cursor-default"
          >
            {{ item.term === 'summer' ? 'ภาคเรียนฤดูร้อน (Summer)' : `ภาคเรียนที่ ${item.term}` }} / ปีการศึกษา {{ item.academic_year }}
          </span>
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

// ใช้ VITE_API_URL จาก .env (ตอน build ผ่าน Docker จะถูกกำหนดเป็น /api ให้ผ่าน nginx proxy)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// 1. ดึงข้อมูลล่าสุดผ่าน API ของหลังบ้านเราเอง
const fetchCurrentSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/system/settings`)
    if (response.data) {
      formData.value = response.data
    }
  } catch (error) {
    console.error(error)
  }
}

// 2. เซฟข้อมูลยิงผ่านหลังบ้าน Node.js เอาไปบันทึกลง Postgres อีกทอดหนึ่ง
const handleSave = async () => {
  isSubmitting.value = true
  try {
    const response = await axios.post(`${API_URL}/system/settings`, formData.value)
    if (response.data.success) {
      alert('บันทึกข้อมูลระบบกลางขึ้นฐานข้อมูลสำเร็จ')
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

const addNewSemester = async () => {
  try {
    isSavingTerm.value = true
    const response = await axios.post(`${API_BASE}/system/settings/terms`, newSemester.value, { headers: getAuthHeader() })
    if (response.status === 200 || response.data.success) {
      alert('บันทึกเปิดภาคเรียนใหม่สำเร็จแล้วค่ะ')
      await fetchTermHistory()
    }
  } catch (error) {
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกภาคเรียนใหม่')
  } finally {
    isSavingTerm.value = false
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