<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 font-sarabun">

    <!-- ───── Header ───── -->
    <header class="bg-gradient-to-r from-green-900 to-green-700 text-white px-6 py-4 flex items-center gap-3 sticky top-0 z-50 shadow-lg">
      <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
        <i class="fa-solid fa-book-open-reader text-lg"></i>
      </div>
      <div>
        <h1 class="text-base font-bold leading-tight">บันทึกการจัดการเรียนรู้</h1>
        <p class="text-xs text-white/70 mt-0.5">สำหรับสถานประกอบการ ภาคเรียนที่ 1/2569</p>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-8 pb-20">

      <!-- ───── Stepper ───── -->
      <div class="bg-white rounded-2xl shadow-sm px-6 py-5 mb-6 flex items-center">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="flex-1 flex flex-col items-center relative cursor-pointer"
          @click="goStep(i + 1)"
        >
          <!-- connector line -->
          <div
            v-if="i < steps.length - 1"
            class="absolute top-[19px] left-1/2 w-full h-0.5 transition-colors duration-300"
            :class="currentStep > i + 1 ? 'bg-green-400' : 'bg-gray-200'"
          ></div>

          <!-- circle -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 transition-all duration-300"
            :class="{
              'bg-green-500 border-green-500 text-white': currentStep > i + 1,
              'bg-white border-green-600 text-green-700 shadow-[0_0_0_4px_#d1fae5]': currentStep === i + 1,
              'bg-white border-gray-200 text-gray-400': currentStep < i + 1,
            }"
          >
            <i v-if="currentStep > i + 1" class="fa-solid fa-check text-xs"></i>
            <span v-else>{{ i + 1 }}</span>
          </div>

          <!-- label -->
          <span
            class="text-[11px] mt-1.5 text-center leading-tight transition-colors duration-300"
            :class="{
              'text-green-700 font-semibold': currentStep === i + 1,
              'text-green-600': currentStep > i + 1,
              'text-gray-400': currentStep < i + 1,
            }"
          >{{ step.label }}</span>
        </div>
      </div>

      <!-- ───── Panel ───── -->
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">

        <!-- Step content with transition -->
        <Transition name="slide" mode="out-in">

          <!-- ── STEP 1 ── -->
          <div v-if="currentStep === 1" key="step1">
            <StepHeader icon="fa-circle-info" title="ข้อมูลพื้นฐานการสอน" step="1" />
            <div class="p-7 space-y-6">

              <!-- info banner -->
              <div class="flex gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm">
                <i class="fa-solid fa-circle-info text-green-500 mt-0.5 shrink-0"></i>
                กรอกข้อมูลรายวิชาและผู้สอนให้ครบก่อนดำเนินการขั้นถัดไป
              </div>

              <!-- 2-col grid -->
              <div class="grid grid-cols-2 gap-4">
                <FormField icon="fa-user-tie" label="ชื่อ-สกุล ครูผู้สอน" required>
                  <input v-model="form.teacherName" class="form-input" placeholder="ระบุชื่อ-สกุล ครูผู้สอน" />
                </FormField>
                <FormField icon="fa-graduation-cap" label="วิชาสอน" required>
                  <input v-model="form.subject" class="form-input" placeholder="ระบุชื่อวิชา" />
                </FormField>
                <FormField icon="fa-building" label="สถานประกอบการ">
                  <input v-model="form.company" class="form-input" placeholder="ชื่อสถานประกอบการ" />
                </FormField>
                <FormField icon="fa-layer-group" label="ระดับชั้น / กลุ่ม">
                  <input v-model="form.level" class="form-input" placeholder="เช่น ปวช.2/1" />
                </FormField>
              </div>

            </div>
          </div>

          <!-- ── STEP 2 ── -->
          <div v-else-if="currentStep === 2" key="step2">
            <StepHeader icon="fa-chalkboard-user" title="รูปแบบและวิธีการจัดการเรียนรู้" step="2" />
            <div class="p-7 space-y-6">
              <!-- Teaching schedule -->
              <div>
                <SectionTitle icon="fa-calendar-days" label="ตารางการสอน" />
                <div class="overflow-x-auto rounded-lg border border-gray-100">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="bg-green-800 text-white">
                        <th class="px-3 py-2.5 text-left rounded-tl-lg">คาบที่</th>
                        <th class="px-3 py-2.5">วันที่สอน</th>
                        <th class="px-3 py-2.5">เวลา</th>
                        <th class="px-3 py-2.5">ทั้งหมด</th>
                        <th class="px-3 py-2.5">มาเรียน</th>
                        <th class="px-3 py-2.5">ขาด</th>
                        <th class="px-3 py-2.5">คะแนน</th>
                        <th class="px-3 py-2.5 rounded-tr-lg"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(row, i) in form.schedule"
                        :key="i"
                        class="border-b border-gray-50 hover:bg-green-50/50 transition-colors"
                      >
                        <td class="px-3 py-2 text-gray-500 font-medium">{{ i + 1 }}</td>
                        <td class="px-2 py-1.5">
                          <input type="date" v-model="row.date" class="table-input w-32" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="text" v-model="row.time" class="table-input w-24" placeholder="08:00-10:00" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="number" v-model="row.total" class="table-input w-12 text-center" placeholder="0" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="number" v-model="row.present" class="table-input w-12 text-center" placeholder="0" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="number" v-model="row.absent" class="table-input w-12 text-center" placeholder="0" />
                        </td>
                        <td class="px-2 py-1.5">
                          <input type="number" v-model="row.score" class="table-input w-12 text-center" placeholder="0" />
                        </td>
                        <td class="px-2 py-1.5 text-center">
                          <button
                            @click="removeRow(i)"
                            class="text-red-400 hover:text-red-600 transition-colors p-1"
                            :disabled="form.schedule.length === 1"
                          >
                            <i class="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button @click="addRow" class="mt-2.5 btn-dashed">
                  <i class="fa-solid fa-plus text-xs"></i> เพิ่มแถว
                </button>
              </div>

              <!-- Topic -->
              <div>
                <SectionTitle icon="fa-file-lines" label="เรื่อง / หัวข้อที่สอน" />
                <textarea
                  v-model="form.topic"
                  class="form-input min-h-[88px] resize-y"
                  placeholder="ระบุหัวข้อ / เรื่องที่สอนในครั้งนี้..."
                ></textarea>
              </div>

              <div>
                <SectionTitle icon="fa-diagram-project" label="1. รูปแบบการจัดการเรียนรู้" />
                <CheckboxGrid :items="OPTIONS.methods" v-model="form.learningMethods" />
              </div>
              <div>
                <SectionTitle icon="fa-lightbulb" label="2. วิธีการให้เนื้อหา" />
                <CheckboxGrid :items="OPTIONS.teachTechs" v-model="form.teachTechs" />
              </div>
              <div>
                <SectionTitle icon="fa-clipboard-check" label="3. การประเมินผล" />
                <CheckboxGrid :items="OPTIONS.evalTypes" v-model="form.evalTypes" />
              </div>
            </div>
          </div>

          <!-- ── STEP 3 ── -->
          <div v-else-if="currentStep === 3" key="step3">
            <StepHeader icon="fa-laptop-code" title="สื่อการสอน & โปรแกรม/E-Learning" step="3" />
            <div class="p-7 space-y-6">
              <div>
                <SectionTitle icon="fa-photo-film" label="สื่อที่ใช้/แหล่งเรียนรู้" />
                <CheckboxGrid :items="OPTIONS.mediaTypes" v-model="form.media" />
              </div>
              <div>
                <SectionTitle icon="fa-desktop" label="โปรแกรม/E-Learning/Application" />
                <CheckboxGrid :items="OPTIONS.programs" v-model="form.programs" />
              </div>
              <div>
                <SectionTitle icon="fa-chart-bar" label="ผลการจัดการเรียนรู้" />
                <CheckboxGrid :items="OPTIONS.results" v-model="form.results" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <FormField icon="fa-triangle-exclamation" label="ปัญหาที่พบ">
                  <textarea v-model="form.problem" class="form-input min-h-[80px] resize-y" placeholder="ระบุปัญหา..."></textarea>
                </FormField>
                <FormField icon="fa-wand-magic-sparkles" label="แนวทางการแก้ไข">
                  <textarea v-model="form.solution" class="form-input min-h-[80px] resize-y" placeholder="ระบุแนวทางแก้ไข..."></textarea>
                </FormField>
              </div>
            </div>
          </div>

          <!-- ── STEP 4 ── -->
          <div v-else key="step4">
            <StepHeader icon="fa-image" title="อัปโหลดภาพ และเลือกประเภทหลักฐาน" step="4" />
            <div class="p-7 space-y-6">

              <div class="flex gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm">
                <i class="fa-solid fa-star text-green-500 mt-0.5 shrink-0"></i>
                อัปโหลดรูปแล้ว เลือกได้เลยว่าภาพนี้เป็นหลักฐานของหมวดใด เลือกได้มากกว่า 1 หมวด
              </div>

              <!-- Drop Zone -->
              <div
                class="relative border-2 border-dashed rounded-xl py-10 px-5 text-center cursor-pointer transition-all duration-200"
                :class="isDragging
                  ? 'border-green-500 bg-green-100 scale-[1.01]'
                  : 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400'"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="onDrop"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  @change="onFileChange"
                />
                <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-green-200">
                  <i class="fa-solid fa-cloud-arrow-up text-white text-2xl"></i>
                </div>
                <p class="font-bold text-green-800 text-base mb-1">ลากและวางรูปภาพที่นี่</p>
                <p class="text-sm text-gray-500">หรือคลิกเพื่อเลือกไฟล์</p>
                <p class="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP – หลายไฟล์ได้</p>
              </div>

              <!-- Preview -->
              <div v-if="previews.length" class="grid grid-cols-3 gap-3">
                <div
                  v-for="(p, i) in previews"
                  :key="i"
                  class="relative rounded-lg overflow-hidden aspect-[4/3] border-2 border-green-200 shadow-sm"
                >
                  <img :src="p.url" :alt="p.name" class="w-full h-full object-cover" />
                  <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1">
                    <p class="text-white text-[10px] truncate">{{ p.name }}</p>
                  </div>
                  <button
                    @click="removePreview(i)"
                    class="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              <!-- Image categories -->
              <div v-if="previews.length" class="space-y-3">
                <SectionTitle icon="fa-list-check" label="เลือกหัวข้อของแต่ละรูป (5 หัวข้อ)" />
                <div
                  v-for="(p, i) in previews"
                  :key="`cat-${i}`"
                  class="border border-green-100 rounded-xl p-3 bg-green-50/40"
                >
                  <p class="text-xs font-semibold text-green-800 mb-2 truncate">{{ p.name }}</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="category in IMAGE_CATEGORIES"
                      :key="category"
                      type="button"
                      @click="toggleImageCategory(i, category)"
                      class="px-2.5 py-1 rounded-full border text-xs transition-colors"
                      :class="p.categories.includes(category)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-green-200 text-green-700 hover:bg-green-100'"
                    >
                      {{ category }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Signatures -->
              <div>
                <SectionTitle icon="fa-signature" label="ลงนามผู้รับรอง" />
                <div class="grid grid-cols-2 gap-5">
                  <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <p class="text-xs font-bold text-green-700 flex items-center gap-2">
                      <i class="fa-solid fa-user-tie"></i> ครูผู้สอน
                    </p>
                    <input v-model="form.teacherSig" class="form-input" placeholder="ชื่อ-สกุล" />
                    <input type="date" v-model="form.teacherSigDate" class="form-input" />
                  </div>
                  <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <p class="text-xs font-bold text-green-700 flex items-center gap-2">
                      <i class="fa-solid fa-user-shield"></i> หัวหน้างานพัฒนาหลักสูตร
                    </p>
                    <input v-model="form.supervisorSig" class="form-input" placeholder="ชื่อ-สกุล" />
                    <input type="date" v-model="form.supervisorSigDate" class="form-input" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </Transition>

        <!-- ───── Nav Bar ───── -->
        <div class="flex items-center justify-between px-7 py-5 border-t border-gray-100 bg-gray-50/80">
          <button
            v-if="currentStep > 1"
            @click="currentStep--"
            class="btn btn-outline"
          >
            <i class="fa-solid fa-arrow-left text-xs"></i> ย้อนกลับ
          </button>
          <div v-else></div>

          <span class="text-xs text-gray-400">ขั้นที่ {{ currentStep }} จาก {{ steps.length }}</span>

          <button
            v-if="currentStep < steps.length"
            @click="nextStep"
            class="btn btn-primary"
          >
            ถัดไป <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
          <button
            v-else
            @click="submit"
            :disabled="isSubmitting"
            class="btn btn-success"
          >
            <i class="fa-solid fa-floppy-disk text-xs"></i>
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
          </button>
        </div>

      </div>
    </div>

    <!-- ───── Toast ───── -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-green-800 text-white px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold"
      >
        <i class="fa-solid fa-circle-check text-green-300"></i>
        {{ toastMessage }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'

const router    = useRouter()
const isSubmitting = ref(false)
const toastMessage = ref('')

// ── Inline sub-components (avoid extra files) ──────────────────────────────

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

// CheckboxGrid
const CheckboxGrid = defineComponent({
  props: { items: Array, modelValue: Array },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toggle = (val) => {
      const arr = [...props.modelValue]
      const idx = arr.indexOf(val)
      idx === -1 ? arr.push(val) : arr.splice(idx, 1)
      emit('update:modelValue', arr)
    }
    return () => h('div', { class: 'grid grid-cols-2 gap-2' },
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
    )
  }
})

// ── State ──────────────────────────────────────────────────────────────────

const currentStep = ref(1)
const isDragging  = ref(false)
const previews    = ref([])

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
  teacherName: '', subject: '', company: '', level: '', topic: '',
  schedule: [
    { date: '', time: '08:00-10:00', total: '', present: '', absent: '', score: '' },
    { date: '', time: '08:00-10:00', total: '', present: '', absent: '', score: '' },
  ],
  learningMethods: [], teachTechs: [], evalTypes: [],
  media: [], programs: [], results: [],
  problem: '', solution: '',
  teacherSig: '', teacherSigDate: '',
  supervisorSig: '', supervisorSigDate: '',
})

// ── Options ────────────────────────────────────────────────────────────────

const OPTIONS = {
  methods: [
    { value: 'onsite',   label: 'การเรียนแบบปกติ (On-Site)' },
    { value: 'tv',       label: 'ผ่านทาง Digital TV (On-Air)' },
    { value: 'online',   label: 'อินเทอร์เน็ต (On-Line)' },
    { value: 'app',      label: 'แอพพลิเคชัน (On-Demand)' },
    { value: 'handout',  label: 'แจกใบงาน (On-Hand)' },
    { value: 'other',    label: 'อื่นๆ ระบุ...' },
  ],
  teachTechs: [
    { value: 'lecture',    label: 'บรรยาย' },
    { value: 'experiment', label: 'ทดลอง' },
    { value: 'group',      label: 'อภิปรายกลุ่มย่อย' },
    { value: 'center',     label: 'ศูนย์การเรียน' },
    { value: 'pjbl',       label: 'PJBL' },
    { value: 'moral',      label: 'คุณธรรมศึกษา' },
    { value: 'stem',       label: 'STEM' },
    { value: 'other',      label: 'อื่นๆ' },
  ],
  evalTypes: [
    { value: 'situation', label: 'สถานการณ์จำลอง' },
    { value: 'game',      label: 'เกมส์' },
    { value: 'puppet',    label: 'หุ่นจำลอง/ของจริง' },
    { value: 'book',      label: 'หนังสือ' },
    { value: 'other',     label: 'อื่นๆ' },
  ],
  mediaTypes: [
    { value: 'ppt',      label: 'Power Point' },
    { value: 'ebook',    label: 'E-Book' },
    { value: 'notebook', label: 'ใบงาน/ใบความรู้' },
    { value: 'doc',      label: 'เอกสารประกอบการสอน' },
    { value: 'other',    label: 'อื่นๆ' },
  ],
  programs: [
    { value: 'teams',    label: 'Microsoft Team' },
    { value: 'gclass',   label: 'Google Classroom' },
    { value: 'zoom',     label: 'Zoom / Google Meet' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'line',     label: 'Line' },
    { value: 'other',    label: 'อื่นๆ' },
  ],
  results: [
    { value: 'pretest',   label: 'แบบทดสอบก่อนเรียน' },
    { value: 'posttest',  label: 'แบบทดสอบหลังเรียน' },
    { value: 'observe',   label: 'การตรวจงาน' },
    { value: 'activity',  label: 'การสังเกตพฤติกรรม' },
    { value: 'other',     label: 'อื่นๆ' },
  ],
}

// ── Methods ────────────────────────────────────────────────────────────────

const addRow = () =>
  form.schedule.push({ date: '', time: '08:00-10:00', total: '', present: '', absent: '', score: '' })

const removeRow = (i) => {
  if (form.schedule.length > 1) form.schedule.splice(i, 1)
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

const processFiles = (files) => {
  files.forEach(f => {
    const reader = new FileReader()
    reader.onload = (ev) => previews.value.push({ url: ev.target.result, name: f.name, categories: [] })
    reader.readAsDataURL(f)
  })
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
  isSubmitting.value = true
  try {
    const id = Date.now().toString()
    localStorage.setItem(`teaching-log-${id}`, JSON.stringify({ ...form, images: previews.value }))
    toastMessage.value = 'บันทึกข้อมูลเรียบร้อยแล้ว'
    setTimeout(() => {
      router.push(`/logs/${id}`)
    }, 700)
  } finally {
    isSubmitting.value = false
    setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
  }
}
</script>

<style scoped>
/* ── Transitions ── */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-enter-from { opacity: 0; transform: translateX(24px); }
.slide-leave-to  { opacity: 0; transform: translateX(-24px); }

.toast-enter-active,
.toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to  { opacity: 0; transform: translateX(20px); }

/* ── Shared input style (Tailwind @apply) ── */
.form-input {
  @apply w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900
         bg-white outline-none transition-all placeholder:text-gray-400
         focus:border-green-400 focus:ring-2 focus:ring-green-100;
}

.table-input {
  @apply px-2 py-1.5 border-[1.5px] border-gray-200 rounded-md text-xs text-gray-900
         bg-white outline-none transition-all
         focus:border-green-400 focus:ring-1 focus:ring-green-100;
}

.btn {
  @apply inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
         transition-all duration-200 outline-none cursor-pointer;
}
.btn-outline {
  @apply bg-white border-2 border-gray-200 text-gray-700
         hover:border-green-400 hover:text-green-700;
}
.btn-primary {
  @apply bg-gradient-to-r from-green-600 to-green-800 text-white shadow-md shadow-green-200
         hover:-translate-y-px hover:shadow-lg hover:shadow-green-200;
}
.btn-success {
  @apply bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md shadow-green-200
         hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed;
}
.btn-dashed {
  @apply mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 bg-green-50
         border-[1.5px] border-dashed border-green-400 rounded-lg
         text-green-700 text-xs font-semibold cursor-pointer
         hover:bg-green-100 hover:border-green-600 transition-all;
}
</style>