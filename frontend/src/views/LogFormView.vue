<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 font-sarabun">

    <header
      class="bg-gradient-to-r from-green-900 to-green-700 text-white px-6 py-4 flex items-center gap-3 sticky top-0 z-50 shadow-lg">
      <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
        <i class="fa-solid fa-book-open-reader text-lg"></i>
      </div>
      <div>
        <h1 class="text-base font-bold leading-tight">บันทึกการจัดการเรียนรู้</h1>
        <p class="text-xs text-white/70 mt-0.5">สำหรับสถานประกอบการ ภาคเรียนที่ {{ currentSemester }}</p>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 py-8 pb-20">

      <div class="bg-white rounded-2xl shadow-sm px-6 py-5 mb-6 flex items-center">
        <div v-for="(step, i) in steps" :key="i" class="flex-1 flex flex-col items-center relative cursor-pointer"
          @click="goStep(i + 1)">
          <div v-if="i < steps.length - 1"
            class="absolute top-[19px] left-1/2 w-full h-0.5 transition-colors duration-300"
            :class="currentStep > i + 1 ? 'bg-green-400' : 'bg-gray-200'"></div>

          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 transition-all duration-300"
            :class="{
              'bg-green-500 border-green-500 text-white': currentStep > i + 1,
              'bg-white border-green-600 text-green-700 shadow-[0_0_0_4px_#d1fae5]': currentStep === i + 1,
              'bg-white border-gray-200 text-gray-400': currentStep < i + 1,
            }">
            <i v-if="currentStep > i + 1" class="fa-solid fa-check text-xs"></i>
            <span v-else>{{ i + 1 }}</span>
          </div>

          <span class="text-[11px] mt-1.5 text-center leading-tight transition-colors duration-300" :class="{
            'text-green-700 font-semibold': currentStep === i + 1,
            'text-green-600': currentStep > i + 1,
            'text-gray-400': currentStep < i + 1,
          }">{{ step.label }}</span>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md overflow-hidden">

        <Transition name="slide" mode="out-in">

          <div v-if="currentStep === 1" key="step1">
            <StepHeader icon="fa-circle-info" title="ข้อมูลพื้นฐานการสอน" step="1" />
            <div class="p-7 space-y-6">

              <div class="flex gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm">
                <i class="fa-solid fa-circle-info text-green-500 mt-0.5 shrink-0"></i>
                กรอกข้อมูลให้ครบก่อนดำเนินการขั้นถัดไป
              </div>

              <div class="grid grid-cols-2 gap-4">
                <FormField icon="fa-hashtag" label="สัปดาห์ที่" required>
                  <input type="number" min="1" max="18" v-model="form.week" class="form-input" placeholder="เช่น 1" />
                </FormField>

                <FormField icon="fa-calendar-week" label="เลือกวันที่ทำการสอนที่ต้องการบันทึก">
                  <input type="date" v-model="form.weekPickerDate" @change="calcWeekRange" class="form-input" />
                  <p v-if="form.weekPickerDate" class="text-xs text-gray-400 mt-1">{{
                    formatThaiDate(form.weekPickerDate) }}</p>
                </FormField>

                <FormField icon="fa-calendar-day" label="ระหว่างวันที่ (วันจันทร์)">
                  <input type="text" :value="formatThaiDate(form.dateFrom)" class="form-input bg-gray-50" readonly />
                </FormField>

                <FormField icon="fa-calendar-day" label="ถึงวันที่ (วันศุกร์)">
                  <input type="text" :value="formatThaiDate(form.dateTo)" class="form-input bg-gray-50" readonly />
                </FormField>

                <FormField icon="fa-user-tie" label="ชื่อ-สกุล ครูผู้สอน" required>
                  <input v-model="form.teacherName" class="form-input bg-gray-50 cursor-not-allowed"
                    placeholder="กำลังดึงชื่อจากบัญชีผู้ใช้..." readonly />
                  <p class="text-xs text-gray-400 mt-1">ดึงมาจากบัญชีผู้ใช้ที่เข้าสู่ระบบอัตโนมัติ</p>
                </FormField>
                <FormField icon="fa-graduation-cap" label="วิชาสอน" required>
                  <input v-model="form.subject" class="form-input" placeholder="ระบุชื่อวิชา" />
                </FormField>
                <FormField icon="fa-hashtag" label="รหัสวิชา">
                  <input v-model="form.subjectCode" class="form-input" placeholder="เช่น 30000-1234" />
                </FormField>
                <FormField icon="fa-layer-group" label="ระดับชั้น / กลุ่ม">
                  <input v-model="form.level" class="form-input" placeholder="เช่น ปวช.2/1" />
                </FormField>


              </div>

            </div>
          </div>

          <div v-else-if="currentStep === 2" key="step2">

            <StepHeader icon="fa-chalkboard-user" title="รูปแบบและวิธีการจัดการเรียนรู้" step="2" />
            <div class="p-7 space-y-6">
              <div>
                <SectionTitle icon="fa-calendar-days" label="ตารางการสอน" />
                <div class="overflow-x-auto rounded-lg border border-gray-100">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="bg-green-800 text-white">
                        <th class="px-3 py-2.5">วันที่สอน</th>
                        <th class="px-3 py-2.5">คาบที่</th>
                        <th class="px-3 py-2.5">เวลาที่สอน</th>
                        <th class="px-3 py-2.5">ทั้งหมด</th>
                        <th class="px-3 py-2.5">เข้าเรียน</th>
                        <th class="px-3 py-2.5">ร้อยละ</th>
                        <th class="px-2 py-2.5 rounded-tr-lg w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in form.schedule" :key="i"
                        class="border-b border-gray-50 hover:bg-green-50/50 transition-colors">
                        <td class="px-2 py-1.5">
                          <input type="date" v-model="row.date" class="table-input w-36" />
                          <p v-if="row.date" class="text-[10px] text-gray-400 mt-0.5">{{ formatThaiDate(row.date) }}</p>
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="text" v-model="row.period" class="table-input w-16 text-center"
                            placeholder="เช่น 1-2" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="text" v-model="row.time" class="table-input w-28" placeholder="08:00-10:00" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="number" v-model="row.total" class="table-input w-16 text-center"
                            placeholder="0" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="number" v-model="row.present" class="table-input w-16 text-center"
                            placeholder="0" />
                        </td>
                        <td class="px-3 py-2 text-gray-500 font-medium text-center">
                          {{ rowPercentage(row) }}
                        </td>
                        <td class="px-2 py-1.5 text-center">
                          <button type="button" @click="removeRow(i)"
                            class="w-6 h-6 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <i class="fa-solid fa-xmark text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button type="button" @click="addRow" class="btn-dashed">
                  <i class="fa-solid fa-plus"></i> เพิ่มแถว
                </button>
              </div>

              <div>
                <SectionTitle icon="fa-file-lines" label="เรื่อง / หัวข้อที่สอน" />
                <textarea v-model="form.topic" class="form-input min-h-[88px] resize-y"
                  placeholder="ระบุหัวข้อ / เรื่องที่สอนในครั้งนี้..."></textarea>
              </div>

              <div>
                <SectionTitle icon="fa-diagram-project" label="1. รูปแบบการจัดการเรียนรู้" />
                <CheckboxGrid :items="OPTIONS.methods" v-model="form.learningMethods"
                  v-model:otherText="form.otherDetails.methods" />
              </div>
              <div>
                <SectionTitle icon="fa-lightbulb" label="2. วิธีการให้เนื้อหา" />
                <CheckboxGrid :items="OPTIONS.teachTechs" v-model="form.teachTechs"
                  v-model:otherText="form.otherDetails.teachTechs" />
              </div>
              <!-- -------------- -->
              <div>
                <SectionTitle icon="fa-photo-film" label="3. สื่อที่ใช้/แหล่งเรียนรู้" />
                <CheckboxGrid :items="OPTIONS.mediaTypes" v-model="form.media"
                  v-model:otherText="form.otherDetails.media" />
              </div>

              <!-- ------------- -->
            </div>
          </div>

          <div v-else-if="currentStep === 3" key="step3">
            <StepHeader icon="fa-laptop-code" title="สื่อการสอน & โปรแกรม/E-Learning" step="3" />
            <div class="p-7 space-y-6">
              <!-- ---------- -->
              <div>
                <SectionTitle icon="fa-clipboard-check" label="การประเมินผล" />
                <CheckboxGrid :items="OPTIONS.evalTypes" v-model="form.evalTypes"
                  v-model:otherText="form.otherDetails.evalTypes" />
              </div>
              <!-- ------- -->
              <div>
                <SectionTitle icon="fa-desktop" label="โปรแกรม/E-Learning/Application" />
                <CheckboxGrid :items="OPTIONS.programs" v-model="form.programs"
                  v-model:otherText="form.otherDetails.programs" />
              </div>
              <div>
                <SectionTitle icon="fa-chart-bar" label="ผลการจัดการเรียนรู้ (ตามสมรรถนะที่พึงประสงค์)" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField icon="fa-brain" label="พุทธิพิสัย">
                    <textarea v-model="form.outcomeCognitive" class="form-input min-h-[80px] resize-y"
                      placeholder="ระบุผลลัพธ์ด้านพุทธิพิสัย..."></textarea>
                  </FormField>
                  <FormField icon="fa-hand-sparkles" label="ทักษะพิสัย">
                    <textarea v-model="form.outcomePsychomotor" class="form-input min-h-[80px] resize-y"
                      placeholder="ระบุผลลัพธ์ด้านทักษะพิสัย..."></textarea>
                  </FormField>
                  <FormField icon="fa-heart" label="จิตพิสัย">
                    <textarea v-model="form.outcomeAffective" class="form-input min-h-[80px] resize-y"
                      placeholder="ระบุผลลัพธ์ด้านจิตพิสัย..."></textarea>
                  </FormField>
                  <FormField icon="fa-arrows-spin" label="การประยุกต์">
                    <textarea v-model="form.outcomeApplication" class="form-input min-h-[80px] resize-y"
                      placeholder="ระบุผลลัพธ์ด้านการประยุกต์..."></textarea>
                  </FormField>
                </div>
              </div>
              <div>
                <SectionTitle icon="fa-triangle-exclamation"
                  label="ปัญหาในการจัดการเรียนรู้ และแนวทางการแก้ไขและพัฒนา" />
                <div class="grid grid-cols-2 gap-4">
                  <FormField icon="fa-triangle-exclamation" label="ปัญหาในการจัดการเรียนรู้">
                    <textarea v-model="form.problem" class="form-input min-h-[80px] resize-y"
                      placeholder="ระบุปัญหา..."></textarea>
                  </FormField>
                  <FormField icon="fa-wand-magic-sparkles" label="แนวทางการแก้ไขและพัฒนา">
                    <textarea v-model="form.solution" class="form-input min-h-[80px] resize-y"
                      placeholder="ระบุแนวทางแก้ไข..."></textarea>
                  </FormField>
                </div>
              </div>
            </div>
          </div>

          <div v-else key="step4">
            <StepHeader icon="fa-image" title="อัปโหลดภาพ และเลือกประเภทหลักฐาน" step="4" />
            <div class="p-7 space-y-6">

              <div v-if="previews.length" class="flex gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm">
                <i class="fa-solid fa-star text-green-500 mt-0.5 shrink-0"></i>
                อัปโหลดรูปแล้ว เลือกได้เลยว่าภาพนี้เป็นหลักฐานของหมวดใด เลือกได้มากกว่า 1 หมวด
              </div>
              <div v-else class="flex gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                <i class="fa-solid fa-triangle-exclamation text-red-500 mt-0.5 shrink-0"></i>
                ต้องอัปโหลดรูปภาพอย่างน้อย 1 รูปก่อนจึงจะบันทึกข้อมูลได้
              </div>

              <div
                class="relative border-2 border-dashed rounded-xl py-10 px-5 text-center cursor-pointer transition-all duration-200"
                :class="isDragging
                  ? 'border-green-500 bg-green-100 scale-[1.01]'
                  : 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400'"
                @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop">
                <input type="file" accept="image/*" multiple
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" @change="onFileChange" />
                <div
                  class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-green-200">
                  <i class="fa-solid fa-cloud-arrow-up text-white text-2xl"></i>
                </div>
                <p class="font-bold text-green-800 text-base mb-1">ลากและวางรูปภาพที่นี่</p>
                <p class="text-sm text-gray-500">หรือคลิกเพื่อเลือกไฟล์</p>
                <p class="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP – หลายไฟล์ได้ (ไม่เกิน 10MB ต่อไฟล์)</p>
              </div>

              <div v-if="previews.length" class="grid grid-cols-4 gap-3">
                <div v-for="(p, i) in previews" :key="i"
                  class="relative rounded-lg overflow-hidden aspect-[4/3] border-2 border-green-200 shadow-sm">
                  <img :src="p.url" :alt="p.name" class="w-full h-full object-cover" />
                  <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1">
                    <p class="text-white text-[10px] truncate">{{ p.name }}</p>
                  </div>
                  <button @click="removePreview(i)"
                    class="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              <div v-if="previews.length" class="space-y-3">
                <SectionTitle icon="fa-list-check" label="เลือกหัวข้อของแต่ละรูป (5 หัวข้อ)" />
                <div v-for="(p, i) in previews" :key="`cat-${i}`"
                  class="border border-green-100 rounded-xl p-3 bg-green-50/40">
                  <p class="text-xs font-semibold text-green-800 mb-2 truncate">{{ p.name }}</p>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="category in IMAGE_CATEGORIES" :key="category" type="button"
                      @click="toggleImageCategory(i, category)"
                      class="px-2.5 py-1 rounded-full border text-xs transition-colors" :class="p.categories.includes(category)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-green-200 text-green-700 hover:bg-green-100'">
                      {{ category }}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </Transition>

        <div class="flex items-center justify-between px-7 py-5 border-t border-gray-100 bg-gray-50/80">
          <button v-if="currentStep > 1" @click="currentStep--" class="btn btn-outline">
            <i class="fa-solid fa-arrow-left text-xs"></i> ย้อนกลับ
          </button>
          <div v-else></div>

          <span class="text-xs text-gray-400">ขั้นที่ {{ currentStep }} จาก {{ steps.length }}</span>

          <button v-if="currentStep < steps.length" @click="nextStep" class="btn btn-primary">
            ถัดไป <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
          <button v-else @click="submit" :disabled="isSubmitting || !previews.length" class="btn btn-success">
            <i class="fa-solid fa-floppy-disk text-xs"></i>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
          </button>
        </div>

      </div>
    </div>

    <Transition name="toast">
      <div v-if="toastMessage"
        class="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-green-800 text-white px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold">
        <i class="fa-solid fa-circle-check text-green-300"></i>
        {{ toastMessage }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, defineComponent, h, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const isSubmitting = ref(false)
const toastMessage = ref('')

// 🎯 ภาคเรียน/ปีการศึกษาปัจจุบัน — ดึงจาก system_settings (ข้อมูลพื้นฐาน) แทนการ hardcode
const currentSemester = ref('1/2569') // ค่า fallback เผื่อ fetch ไม่สำเร็จ

// 🎯 ดึงชื่อ-สกุลผู้ใช้ที่ login อยู่มาเติมในช่อง "ชื่อ-สกุล ครูผู้สอน" อัตโนมัติ
onMounted(async () => {
  // 1. ใช้ค่าที่เก็บไว้ตอน login ก่อน (แสดงผลได้ทันทีไม่ต้องรอ API)
  const cachedName = localStorage.getItem('full_name')
  if (cachedName) {
    form.teacherName = cachedName
  }

  // 2. ยิงไปดึงข้อมูลล่าสุดจาก backend ซ้อนอีกที เผื่อชื่อในระบบถูกแก้ไขหลัง login
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (data?.full_name) {
      form.teacherName = data.full_name
      localStorage.setItem('full_name', data.full_name)
    }
  } catch (err) {
    console.warn('ดึงชื่อผู้ใช้ปัจจุบันจาก backend ไม่สำเร็จ ใช้ค่าที่แคชไว้แทน', err)
  }

  // 3. ดึงภาคเรียน/ปีการศึกษาปัจจุบันจากข้อมูลพื้นฐาน (system_settings)
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/system/settings`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (data?.term && data?.academic_year) {
      currentSemester.value = `${data.term}/${data.academic_year}`
    }
  } catch (err) {
    console.warn('ดึงข้อมูลภาคเรียนปัจจุบันไม่สำเร็จ ใช้ค่า fallback แทน', err)
  }
})

const SECTION_KEY_MAP = {
  'รูปแบบจัดการเรียนรู้': 'format',
  'วิธีการให้เนื้อหา': 'method',
  'สื่อที่ใช้ / แหล่งเรียนรู้': 'media',
  'โปรแกรม / E-Learning / Application': 'app_eval',
  'โปรแกรม / E-learning / Application': 'app_eval',
  'การประเมินผล': 'app_eval'
}

// แปลง key ของฟอร์ม (เช่น 'onsite','lecture','ppt'...) ให้ตรงกับ key ที่ LogDetailView.vue ต้องการ
// เช่น methods: ['onsite','online'] → { format_onsite:true, format_onair:false, format_online:true, ... }
const KEY_MAPS = {
  methods: {
    onsite: 'format_onsite', tv: 'format_onair', online: 'format_online',
    app: 'format_ondemand', handout: 'format_onhand', other: 'format_other',
  },
  teachTechs: {
    lecture: 'lecture', experiment: 'experiment', group: 'discussion',
    center: 'center', pjbl: 'pjbl', moral: 'case_study', stem: 'stem',
    game: 'game', situation: 'situation', other: 'other',
  },
  mediaTypes: {
    ppt: 'ppt', ebook: 'ebook', notebook: 'worksheet', doc: 'doc',
    book: 'book', model: 'model', other: 'other',
  },
  programs: {
    teams: 'classroom', gclass: 'classroom', zoom: 'zoom',
    facebook: 'facebook', line: 'line', other: 'other',
  },
}

// แปลง array ของ key ที่ติ๊กเลือก → object { key: true/false, other_detail: '...' } ตาม key ที่ LogDetailView.vue ต้องการ
// เช่น ['lecture', 'experiment'] → { lecture: true, experiment: true, demo: false, other_detail: '' }
const toBooleanObject = (selectedKeys, optionsList, mapKey, otherDetailText = '') => {
  const keyMap = KEY_MAPS[mapKey] || {}
  const result = {}
  // ตั้งค่าเริ่มต้นทุก key ที่ map ไว้เป็น false ก่อน
  Object.values(keyMap).forEach(k => { result[k] = false })
  // ตั้งค่า true เฉพาะที่ติ๊กเลือก
  selectedKeys.forEach(key => {
    const mapped = keyMap[key]
    if (mapped) result[mapped] = true
  })
  result.other_detail = otherDetailText || ''
  return result
}

const normalizeSection = (categories) => {
  if (!categories?.length) return ['other']
  const mapped = categories
    .map((label) => SECTION_KEY_MAP[label])
    .filter(Boolean)
  const uniqueMapped = [...new Set(mapped)]
  return uniqueMapped.length ? uniqueMapped : ['other']
}

// ── Inline sub-components ──────────────────────────────────────────────

// StepHeader
const StepHeader = defineComponent({
  props: { icon: String, title: String, step: String },
  setup(props) {
    return () => h('div', {
      class: 'flex items-center gap-3 px-7 py-5 bg-gradient-to-r from-green-800 to-green-600 text-white'
    }, [
      h('div', { class: 'w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center' },
        [h('i', { class: `fa-solid ${props.icon} text-sm` })]
      ),
      h('div', {}, [
        h('h2', { class: 'font-bold text-base leading-tight' }, props.title),
        h('small', { class: 'text-white/70 text-xs' }, `ขั้นที่ ${props.step} จาก 4`)
      ])
    ])
  }
})

// FormField
const FormField = defineComponent({
  props: { icon: String, label: String, required: Boolean },
  setup(props, { slots }) {
    return () => h('div', { class: 'flex flex-col gap-1.5' }, [
      h('label', { class: 'text-xs font-semibold text-gray-700 flex items-center gap-1.5' }, [
        h('i', { class: `fa-solid ${props.icon} text-green-500 text-xs` }),
        props.label,
        props.required ? h('span', { class: 'text-red-400 text-xs' }, '*') : null
      ]),
      slots.default?.()
    ])
  }
})

// SectionTitle
const SectionTitle = defineComponent({
  props: { icon: String, label: String },
  setup(props) {
    return () => h('div', { class: 'flex items-center gap-2 text-sm font-bold text-green-800 mb-3' }, [
      h('i', { class: `fa-solid ${props.icon} text-green-500` }),
      props.label,
      h('div', { class: 'flex-1 h-px bg-gray-200' })
    ])
  }
})

// CheckboxGrid (ปรับให้แสดงเป็น 3 คอลัมน์ md:grid-cols-3 บนจอที่กว้างขึ้น)
const CheckboxGrid = defineComponent({
  props: { items: Array, modelValue: Array, otherText: String },
  emits: ['update:modelValue', 'update:otherText'],
  setup(props, { emit }) {
    const toggle = (val) => {
      const arr = [...props.modelValue]
      const idx = arr.indexOf(val)
      idx === -1 ? arr.push(val) : arr.splice(idx, 1)
      emit('update:modelValue', arr)

      if (val === 'other' && idx !== -1) {
        emit('update:otherText', '')
      }
    }
    return () => h('div', { class: 'space-y-2' }, [
      h('div', { class: 'grid grid-cols-2 md:grid-cols-3 gap-2' },
        props.items.map(item =>
          h('label', {
            key: item.value,
            class: [
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border-[1.5px] cursor-pointer text-sm transition-all',
              props.modelValue.includes(item.value)
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
            ],
            onClick: () => toggle(item.value)
          }, [
            h('div', {
              class: [
                'w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all',
                props.modelValue.includes(item.value)
                  ? 'bg-green-500 border-green-500'
                  : 'border-2 border-gray-300'
              ]
            }, props.modelValue.includes(item.value)
              ? [h('i', { class: 'fa-solid fa-check text-white', style: 'font-size:9px' })]
              : []
            ),
            item.label
          ])
        )
      ),
      props.modelValue.includes('other')
        ? h('div', { class: 'pt-1' }, [
          h('input', {
            type: 'text',
            class: 'form-input border-green-300 focus:border-green-500 focus:ring-green-100',
            placeholder: 'โปรดระบุข้อมูลเพิ่มเติม...',
            value: props.otherText,
            onInput: (e) => emit('update:otherText', e.target.value)
          })
        ])
        : null
    ])
  }
})

// ── State ──────────────────────────────────────────────────────────────────

const currentStep = ref(1)
const isDragging = ref(false)
const previews = ref([])

// ── คำนวณวันจันทร์-ศุกร์ของสัปดาห์ จากวันที่ผู้ใช้เลือก ──────────────────
function formatDateISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function calcWeekRange() {
  if (!form.weekPickerDate) return
  const picked = new Date(form.weekPickerDate + 'T00:00:00')
  const day = picked.getDay() // 0=อาทิตย์, 1=จันทร์, ... 6=เสาร์
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(picked)
  monday.setDate(picked.getDate() + diffToMonday)

  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)

  form.dateFrom = formatDateISO(monday)
  form.dateTo = formatDateISO(friday)
}


const steps = [
  { label: 'ข้อมูลทั่วไป' },
  { label: 'วิธีการสอน' },
  { label: 'สื่อ & เครื่องมือ' },
  { label: 'อัปโหลดภาพ' },
]

const IMAGE_CATEGORIES = [
  'รูปแบบจัดการเรียนรู้',
  'วิธีการให้เนื้อหา',
  'สื่อที่ใช้ / แหล่งเรียนรู้',
  'โปรแกรม / E-learning / Application',
  'การประเมินผล',
]

const form = reactive({
  teacherName: '', subject: '', subjectCode: '', level: '',
  week: '', dateFrom: '', dateTo: '', weekPickerDate: '',
  topic: '',
  schedule: [
    { week: '1', date: '', dateTo: '', period: '1', time: '08:00-10:00', total: '', present: '' },
  ],
  learningMethods: [], teachTechs: [], evalTypes: [],
  media: [], programs: [],
  outcomeCognitive: '', outcomePsychomotor: '', outcomeAffective: '', outcomeApplication: '',
  problem: '', solution: '',
  teacherSig: '', teacherSigDate: '',
  supervisorSig: '', supervisorSigDate: '',
  otherDetails: {
    methods: '',
    teachTechs: '',
    evalTypes: '',
    media: '',
    programs: ''
  }
})

// ── Options ────────────────────────────────────────────────────────────────

const OPTIONS = {
  methods: [
    { value: 'onsite', label: 'การเรียนแบบปกติ (On-Site)' },
    { value: 'tv', label: 'ผ่านทาง Digital TV (On-Air)' },
    { value: 'online', label: 'อินเทอร์เน็ต (On-Line)' },
    { value: 'app', label: 'แอปพลิเคชัน (On-Demand)' },
    { value: 'handout', label: 'ผ่านหนังสือ แบบฝึกหัด' },
    { value: 'other', label: 'อื่นๆ ระบุ...' },
  ],
  teachTechs: [
    { value: 'lecture', label: 'บรรยาย' },
    { value: 'experiment', label: 'ทดลอง' },
    { value: 'group', label: 'อภิปรายกลุ่มย่อย' },
    { value: 'center', label: 'ศูนย์การเรียน' },
    { value: 'pjbl', label: 'PJBL' },
    { value: 'moral', label: 'คุณธรรมศึกษา' },
    { value: 'stem', label: 'STEM' },
    { value: 'game', label: 'เกมส์' },
    { value: 'situation', label: 'สถานการณ์จำลอง' },
    { value: 'other', label: 'อื่นๆ ระบุ...' },
  ],
  evalTypes: [
    { value: 'pretest', label: 'แบบทดสอบก่อนเรียน' },
    { value: 'posttest', label: 'แบบทดสอบหลังเรียน' },
    { value: 'exercise', label: 'แบบฝึกหัดท้ายหน่วย' },
    { value: 'test', label: 'การทดสอบ' },
    { value: 'checkwork', label: 'การตรวจชิ้นงาน' },
    { value: 'other', label: 'อื่นๆ ระบุ...' },
  ],
  mediaTypes: [
    { value: 'ppt', label: 'Power Point' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'notebook', label: 'ใบงาน/ใบความรู้' },
    { value: 'doc', label: 'เอกสารประกอบการสอน' },
    { value: 'book', label: 'หนังสือ' },
    { value: 'model', label: 'หุ่นจำลอง/ของจริง' },
    { value: 'other', label: 'อื่นๆ ระบุ...' },
  ],
  programs: [
    { value: 'teams', label: 'Microsoft Team' },
    { value: 'gclass', label: 'Google Classroom' },
    { value: 'zoom', label: 'Zoom / Google Meet' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'line', label: 'Line' },
    { value: 'other', label: 'อื่นๆ ระบุ...' },
  ],
}

// ── Methods ────────────────────────────────────────────────────────────────

const addRow = () =>
  form.schedule.push({
    date: '', dateTo: '', period: '', time: '', total: '', present: ''
  })

const removeRow = (i) => {
  if (form.schedule.length > 1) form.schedule.splice(i, 1)
}

// คำนวณ "ร้อยละ" ของแต่ละแถวสำหรับแสดงผล (เข้าเรียน / ทั้งหมด x 100)
const rowPercentage = (row) => {
  const total = Number(row.total) || 0
  const present = Number(row.present) || 0
  if (!total) return '0.00'
  return (Math.round((present / total) * 1000) / 10).toString()
}

const goStep = (n) => {
  if (n <= currentStep.value) currentStep.value = n
}

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const onFileChange = (e) => {
  processFiles(Array.from(e.target.files))
  e.target.value = ''
}

const onDrop = (e) => {
  isDragging.value = false
  processFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')))
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const processFiles = (files) => {
  const oversized = []

  files.forEach(f => {
    if (f.size > MAX_FILE_SIZE) {
      oversized.push(f.name)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => previews.value.push({ file: markRaw(f), url: ev.target.result, name: f.name, categories: [] })
    reader.readAsDataURL(f)
  })

  if (oversized.length) {
    toastMessage.value = `ไฟล์ขนาดเกิน 10MB จึงไม่ถูกเพิ่ม: ${oversized.join(', ')}`
    setTimeout(() => {
      toastMessage.value = ''
    }, 3000)
  }
}

const removePreview = (i) => previews.value.splice(i, 1)

const toggleImageCategory = (previewIndex, category) => {
  const selected = previews.value[previewIndex]?.categories
  if (!selected) return
  const idx = selected.indexOf(category)
  if (idx === -1) {
    selected.push(category)
  } else {
    selected.splice(idx, 1)
  }
}

const submit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const currentWeek = Number(form.week) || 1
    
    const payload = {
      semester: currentSemester.value,
      week: currentWeek,
      teaching_date: form.weekPickerDate, 
      date_from: form.dateFrom, 
      date_to: form.dateTo,
      subject_name: form.subject,
      subject_code: form.subjectCode,
      topic: form.topic,
      attendance: form.schedule.map((row, i) => {
        const total = Number(row.total) || 0
        const present = Number(row.present) || 0
        return {
          week: currentWeek,
          date: row.date || '',
          date_to: row.dateTo || '',
          period: row.period || String(i + 1),
          time_range: row.time || '',
          total,
          present,
          percentage: total ? Math.round((present / total) * 1000) / 10 : 0
        }
      }),
      methods: toBooleanObject(form.learningMethods, OPTIONS.methods, 'methods', form.otherDetails.methods),
      content_methods: toBooleanObject(form.teachTechs, OPTIONS.teachTechs, 'teachTechs', form.otherDetails.teachTechs),
      media: toBooleanObject(form.media, OPTIONS.mediaTypes, 'mediaTypes', form.otherDetails.media),
      apps: toBooleanObject(form.programs, OPTIONS.programs, 'programs', form.otherDetails.programs),
      outcome_cognitive: form.outcomeCognitive || '',
      outcome_psychomotor: form.outcomePsychomotor || '',
      outcome_affective: form.outcomeAffective || '',
      outcome_application: form.outcomeApplication || '',
      problem: form.problem || '',
      solution: form.solution || '',
      other_details: form.otherDetails
    }

    const hasValidRow = form.schedule.some(row => row.week && row.date)
    if (!form.subject.trim() || !form.topic.trim() || !hasValidRow) {
      toastMessage.value = 'กรุณากรอกชื่อวิชา, หัวข้อ และตารางการสอน (สัปดาห์ที่และวันที่สอน) อย่างน้อย 1 แถวก่อนบันทึก'
      isSubmitting.value = false
      setTimeout(() => {
        toastMessage.value = ''
      }, 2200)
      return
    }

    if (!previews.value.length) {
      toastMessage.value = 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูปก่อนบันทึก'
      isSubmitting.value = false
      currentStep.value = 4
      setTimeout(() => {
        toastMessage.value = ''
      }, 2200)
      return
    }

    const { data: logData } = await axios.post(`${API_URL}/logs`, payload)
    const logId = logData?.id
    if (!logId) {
      throw new Error('ไม่สามารถสร้าง log ใหม่ได้')
    }
    if (previews.value.length) {
      for (const preview of previews.value) {
        if (!preview.file) {
          throw new Error('ไม่มีไฟล์ภาพสำหรับอัปโหลด')
        }

        const formData = new FormData()
        console.log('DEBUG file:', preview.file, 'is File?', preview.file instanceof File, 'size:', preview.file?.size)
        formData.append('file', preview.file)
        formData.append('caption', preview.name)
        formData.append('sections', JSON.stringify(normalizeSection(preview.categories)))

        await axios.post(`${API_URL}/logs/${logId}/images`, formData)
      }
    }

    toastMessage.value = 'บันทึกข้อมูลเรียบร้อยแล้ว'
    setTimeout(() => router.push(`/logs/${logId}`), 700)
  } catch (err) {
    console.error('LogForm submit error', err)
    const serverMessage = err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'
    toastMessage.value = serverMessage
  } finally {
    isSubmitting.value = false
    setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
  }
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
]

function formatThaiDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate + 'T00:00:00')
  if (isNaN(d.getTime())) return ''
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`
}
</script>

<style scoped>
/* ── Transitions ── */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ── Shared input style ── */
.form-input {
  @apply w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none transition-all placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100;
}

.table-input {
  @apply px-2 py-1.5 border-[1.5px] border-gray-200 rounded-md text-xs text-gray-900 bg-white outline-none transition-all focus:border-green-400 focus:ring-1 focus:ring-green-100;
}

.btn {
  @apply inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none cursor-pointer;
}

.btn-outline {
  @apply bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700;
}

.btn-primary {
  @apply bg-gradient-to-r from-green-600 to-green-800 text-white shadow-md shadow-green-200 hover:-translate-y-px hover:shadow-lg hover:shadow-green-200;
}

.btn-success {
  @apply bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md shadow-green-200 hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed;
}

.btn-dashed {
  @apply mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 border-[1.5px] border-dashed border-green-400 rounded-lg text-green-700 text-xs font-semibold cursor-pointer hover:bg-green-100 hover:border-green-600 transition-all;
}
</style>