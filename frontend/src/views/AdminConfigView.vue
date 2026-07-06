<template>
  <div class="min-h-screen bg-[#f3f7f4] text-slate-700 p-8 font-sans tracking-wide antialiased">
    
    <div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_6px_25px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden mt-6">
      
      <div class="bg-gradient-to-r from-[#0f543e] via-[#167053] to-[#1e7e34] p-8 text-white">
        <div class="flex items-center gap-4">
          <span class="text-4xl">⚙️</span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">ตั้งค่าข้อมูลระบบกลาง</h1>
            <p class="text-sm text-emerald-100/80 font-medium mt-1.5">กำหนดภาคเรียน ปีการศึกษา และรายชื่อผู้บริหารสำหรับรายงาน</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="p-8 space-y-6 text-base">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              📌 ภาคเรียนที่
            </label>
            <div class="grid grid-cols-3 gap-3">
              <label v-for="t in ['1', '2', 'Summer']" :key="t" 
                :class="[
                  'text-center py-3.5 border rounded-xl font-bold text-sm cursor-pointer transition-all active:scale-95 flex items-center justify-center',
                  formData.term === t 
                    ? 'border-[#1e7e34] bg-[#eaf4ef] text-[#0f543e] shadow-sm' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                ]"
              >
                <input type="radio" v-model="formData.term" :value="t" class="hidden" />
                {{ t }}
              </label>
            </div>
          </div>

          <div>
            <label for="academic-year" class="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              📅 ปีการศึกษา
            </label>
            <input 
              id="academic-year"
              type="text" 
              v-model="formData.academic_year" 
              placeholder="เช่น 2569"
              class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-[#1e7e34] focus:border-[#1e7e34] p-3.5 font-semibold shadow-sm transition-all outline-none"
              required
            />
          </div>
        </div>

        <hr class="border-slate-100 my-3" />

        <div class="space-y-5">
          <div>
            <label for="head-curriculum" class="block text-sm font-bold text-slate-600 mb-2">
              👤 หัวหน้างานพัฒนาหลักสูตร และจัดการเรียนรู้
            </label>
            <input 
              id="head-curriculum"
              type="text" 
              v-model="formData.head_curriculum" 
              placeholder="ระบุชื่อ-นามสกุล"
              class="w-full bg-[#f8faf8] border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-[#1e7e34] focus:border-[#1e7e34] p-4 font-medium shadow-inner transition-all outline-none"
              required
            />
          </div>

          <div>
            <label for="deputy-academic" class="block text-sm font-bold text-slate-600 mb-2">
              👤 รองผู้อำนวยการฝ่ายวิชาการ
            </label>
            <input 
              id="deputy-academic"
              type="text" 
              v-model="formData.deputy_academic" 
              placeholder="ระบุชื่อ-นามสกุล"
              class="w-full bg-[#f8faf8] border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-[#1e7e34] focus:border-[#1e7e34] p-4 font-medium shadow-inner transition-all outline-none"
              required
            />
          </div>

          <div>
            <label for="director" class="block text-sm font-bold text-slate-600 mb-2">
              👤 ผู้อำนวยการ
            </label>
            <input 
              id="director"
              type="text" 
              v-model="formData.director" 
              placeholder="ระบุชื่อ-นามสกุล"
              class="w-full bg-[#f8faf8] border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-[#1e7e34] focus:border-[#1e7e34] p-4 font-medium shadow-inner transition-all outline-none"
              required
            />
          </div>
        </div>

        <div class="pt-3">
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full bg-gradient-to-r from-[#0f543e] to-[#1e7e34] text-white text-sm font-bold py-4 px-5 rounded-xl hover:brightness-110 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="isSubmitting">กำลังบันทึกข้อมูล...</span>
            <span v-else>💾 SAVE DATA</span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios' //  ใช้ axios ยิงเข้าหลังบ้าน Node.js ของเราเอง ชัวร์สุดปลอดภัยสุด

const formData = ref({
  term: '1',
  academic_year: '2569',
  head_curriculum: '',
  deputy_academic: '',
  director: ''
})

const isSubmitting = ref(false)

//  1. ดึงข้อมูลล่าสุดผ่าน API ของหลังบ้านเราเอง
const fetchCurrentSettings = async () => {
  try {
    // ปรับ Port ตัวเลขหลัง localhost ให้ตรงกับเซิร์ฟเวอร์หลังบ้าน Node.js ของหนูน้า (เช่น 3000 หรือ 5000)
    const response = await axios.get('http://localhost:3000/api/system/settings')
    if (response.data) {
      formData.value = response.data
    }
  } catch (error) {
    console.error('ดึงข้อมูลตั้งค่ากลางไม่สำเร็จ:', error)
  }
}

//  2. เซฟข้อมูลยิงผ่านหลังบ้าน Node.js เอาไปบันทึกลง Supabase อีกทอดหนึ่ง
const handleSave = async () => {
  isSubmitting.value = true
  try {
    const response = await axios.post('http://localhost:3000/api/system/settings', formData.value)
    if (response.data.success) {
      alert('บันทึกข้อมูลระบบกลางขึ้นฐานข้อมูลสำเร็จ')
    }
  } catch (error) {
    console.error('บันทึกข้อมูลล้มเหลว:', error)
    alert('เกิดข้อผิดพลาด กรุณาเช็กการเชื่อมต่อเซิร์ฟเวอร์หลังบ้าน')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchCurrentSettings()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700&display=swap');

.font-sans {
  font-family: 'Anuphan', 'Noto Sans Thai', sans-serif !important;
}
</style>