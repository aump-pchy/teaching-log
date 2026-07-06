<template>
  <!-- Loading -->
  <div v-if="loading" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0fdf4;">
    <p style="color:#166534;font-size:16px;">⏳ กำลังโหลดข้อมูลบันทึกการสอนจาก Supabase API...</p>
  </div>

  <!-- Error -->
  <div v-else-if="fetchError" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f0fdf4;gap:12px;">
    <p style="color:#dc2626;font-size:16px;">❌ {{ fetchError }}</p>
    <button @click="fetchLog" style="padding:8px 20px;background:#16a34a;color:#fff;border:none;border-radius:8px;cursor:pointer;">ลองใหม่</button>
  </div>

  <template v-else>

  <!-- Toast -->
  <Transition name="fade">
    <div v-if="toast.show" class="toast-box print-hidden" :class="toast.type === 'error' ? 'toast-error' : 'toast-success'">
      {{ toast.message }}
    </div>
  </Transition>

  <!-- CONTROL PANEL -->
  <div class="control-panel print-hidden">
    <router-link to="/logs" class="back-btn-primary">
      <i class="fa-solid fa-arrow-left text-xs"></i>
      กลับหน้ารายการ
    </router-link>
    <div class="action-buttons-group">
      <button @click="toggleEditMode" class="edit-toggle-btn" :class="{ 'editing-active': isEditing }">
        {{ isEditing ? '💾 บันทึกข้อมูล' : '📝 แก้ไขข้อมูล' }}
      </button>
      <button @click="exportPDF" class="export-pdf-blue-btn">🖨️ Export PDF </button>
    </div>
  </div>

  <div class="page-wrapper">
  <div class="document-container">

    <div class="pdf-page-sheet">
      <div class="official-header-layout">
        <h2 class="form-main-title">
          <u>แบบบันทึกการจัดการเรียนการสอนสำหรับรายวิชาในสถานประกอบการ ภาคเรียนที่ {{ logData.semester }}/{{ logData.academic_year }}</u>
        </h2>
        
        <div class="header-inline-group">
          <span>ครูผู้สอน <input type="text" v-model="logData.teacher_name" :disabled="!isEditing" class="dotted-input w-250" /></span>
          <span>แผนกวิชา <input type="text" v-model="logData.department" :disabled="!isEditing" class="dotted-input w-220" /></span>
        </div>
        
        <div class="header-inline-group mt-6">
          <span>สัปดาห์ที่ <input type="text" v-model="logData.week" :disabled="!isEditing" class="dotted-input w-60 text-center" /></span>
          <span>ระหว่างวันที่ <input type="text" v-model="logData.start_date" :disabled="!isEditing" class="dotted-input w-60 text-center" /></span>
          <span>เดือน <input type="text" v-model="logData.month" :disabled="!isEditing" class="dotted-input w-150 text-center" /></span>
          <span>พ.ศ. <input type="text" v-model="logData.year" :disabled="!isEditing" class="dotted-input w-80 text-center" /></span>
        </div>

        <div class="header-inline-group mt-6">
          <span>ชื่อวิชา <input type="text" v-model="logData.subject_name" :disabled="!isEditing" class="dotted-input flex-grow" /></span>
          <span>รหัสวิชา <input type="text" v-model="logData.subject_code" :disabled="!isEditing" class="dotted-input w-200" /></span>
        </div>

        <div class="header-inline-group mt-6">
          <span>เรื่อง/หัวข้อที่สอน <input type="text" v-model="logData.topic" :disabled="!isEditing" class="dotted-input flex-grow" /></span>
        </div>
      </div>

      <table class="main-report-table mt-12">
        <thead>
          <tr>
            <th colspan="3" class="w-45p">วัน/เวลาดำเนินการจัดการเรียนรู้</th>
            <th colspan="3" class="w-35p">จำนวนนักเรียน นักศึกษา</th>
            <th rowspan="2" class="w-20p">ปัญหาและข้อเสนอแนะ</th>
          </tr>
          <tr>
            <th class="w-15p">วันที่สอน</th>
            <th class="w-15p">คาบที่</th>
            <th class="w-15p">เวลาที่สอน</th>
            <th class="w-11p">ทั้งหมด</th>
            <th class="w-11p">เข้าเรียน</th>
            <th class="w-13p">ร้อยละ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in logData.attendance_rows" :key="idx">
            <td><input type="text" v-model="row.date" :disabled="!isEditing" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.period" :disabled="!isEditing" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.time_range" :disabled="!isEditing" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.total" :disabled="!isEditing" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.present" :disabled="!isEditing" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.percentage" :disabled="!isEditing" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.remark" :disabled="!isEditing" class="table-cell-input" /></td>
          </tr>
        </tbody>
      </table>

      <div class="details-section mt-15">
        <h3 class="section-main-heading"><u>รายละเอียดวิธีการจัดการเรียนรู้</u></h3>
        
        <div class="checkbox-group-block mt-6">
          <p class="topic-bold-title">1. <u>รูปแบบการจัดการเรียนรู้</u> <i>(แนบภาคผนวก)</i></p>
          <div class="cb-indented-vertical-box mt-4">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_onsite" :disabled="!isEditing" /> การเรียนการสอนรูปแบบปกติ (On-Site)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_onair" :disabled="!isEditing" /> การเรียนการสอนโดย ผ่าน DLTV ผ่านทาง Digital TV (On-Air)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_online" :disabled="!isEditing" /> การเรียนการสอนผ่านอินเตอร์เน็ต (On-Line)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_ondemand" :disabled="!isEditing" /> การเรียนการสอนผ่านแอพพลิเคชั่น (On-Demand)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_onhand" :disabled="!isEditing" /> การเรียนการสอนโดยผ่านหนังสือเรียน แบบฝึกหัด ใบงาน (On-Hand)</label>
            <div class="cb-inline-row">
              <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_other" :disabled="!isEditing" /> อื่นๆ</label>
              <input type="text" v-model="methodsData.format_other_detail" :disabled="!isEditing" class="dotted-input flex-grow ml-5" />
            </div>
          </div>
        </div>

        <div class="checkbox-group-block mt-12">
          <p class="topic-bold-title">2. <u>วิธีการให้เนื้อหา</u> <i>(แนบภาคผนวก)</i></p>
          <div class="cb-indented-grid-box mt-4">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_lecture" :disabled="!isEditing" /> บรรยาย</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_demo" :disabled="!isEditing" /> สาธิต</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_experiment" :disabled="!isEditing" /> ทดลอง</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_simulation" :disabled="!isEditing" /> สถานการณ์จำลอง</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_discussion" :disabled="!isEditing" /> อภิปรายกลุ่มย่อย</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_case" :disabled="!isEditing" /> กรณีศึกษา</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_center" :disabled="!isEditing" /> ศูนย์การเรียน</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_game" :disabled="!isEditing" /> เกมส์</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_pjbl" :disabled="!isEditing" /> PjBL</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_stem" :disabled="!isEditing" /> STEM</label>
            <div class="grid-span-2 cb-inline-row">
              <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_other" :disabled="!isEditing" /> อื่น ๆ</label>
              <input type="text" v-model="methodsData.method_other_detail" :disabled="!isEditing" class="dotted-input flex-grow ml-5" />
            </div>
          </div>
        </div>

        <div class="checkbox-group-block mt-12">
          <p class="topic-bold-title">3. <u>สื่อที่ใช้/แหล่งเรียนรู้</u> <i>(แนบภาคผนวก)</i></p>
          <div class="cb-indented-grid-box mt-4">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_ppt" :disabled="!isEditing" /> Power Point</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_doc" :disabled="!isEditing" /> เอกสารประกอบการสอน</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_book" :disabled="!isEditing" /> หนังสือ</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_real" :disabled="!isEditing" /> หุ่นจำลอง/ของจริง</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_ebook" :disabled="!isEditing" /> E-Book</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_worksheet" :disabled="!isEditing" /> ใบงาน/ใบความรู้</label>
            <div class="grid-span-2 cb-inline-row">
              <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_other" :disabled="!isEditing" /> อื่น ๆ</label>
              <input type="text" v-model="methodsData.media_other_detail" :disabled="!isEditing" class="dotted-input flex-grow ml-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pdf-page-sheet">
      <div class="checkbox-group-block">
        <p class="topic-bold-title">4. <u>โปรแกรม / E-learning / Application ที่ใช้ในการจัดการเรียนการสอน</u> <i>(แนบภาคผนวก)</i></p>
        <div class="cb-indented-grid-box mt-4">
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_classroom" :disabled="!isEditing" /> Google Classroom</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_meet" :disabled="!isEditing" /> Google Meet</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_zoom" :disabled="!isEditing" /> Zoom</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_line" :disabled="!isEditing" /> Line</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_facebook" :disabled="!isEditing" /> Facebook</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_youtube" :disabled="!isEditing" /> YouTube</label>
          <div class="grid-span-2 cb-inline-row">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_other" :disabled="!isEditing" /> อื่น ๆ</label>
            <input type="text" v-model="methodsData.app_other_detail" :disabled="!isEditing" class="dotted-input flex-grow ml-5" />
          </div>
        </div>
      </div>

      <div class="checkbox-group-block mt-12">
        <p class="topic-bold-title">5. <u>การวัดผลและประเมินผลการเรียนรู้</u> <i>(แนบภาคผนวก)</i></p>
        <div class="cb-indented-grid-box mt-4">
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_observe" :disabled="!isEditing" /> การสังเกต</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_test" :disabled="!isEditing" /> การทดสอบ</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_work" :disabled="!isEditing" /> การตรวจชิ้นงาน</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_exercise" :disabled="!isEditing" /> แบบฝึกหัดท้ายหน่วย</label>
          <div class="grid-span-2 cb-inline-row">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_other" :disabled="!isEditing" /> อื่น ๆ</label>
            <input type="text" v-model="methodsData.eval_other_detail" :disabled="!isEditing" class="dotted-input flex-grow ml-5" />
          </div>
        </div>
      </div>

      <div class="results-section mt-12">
        <p class="topic-bold-title">6. <u>ผลการจัดการเรียนรู้</u> (ตามสมรรถนะที่พึงประสงค์)</p>
        <div class="text-row-underlined-box mt-4">
          <p><strong>พุทธิพิสัย:</strong> <textarea v-model="resultsData.knowledge" :disabled="!isEditing" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>ทักษะพิสัย:</strong> <textarea v-model="resultsData.skill" :disabled="!isEditing" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>จิตพิสัย:</strong> <textarea v-model="resultsData.attitude" :disabled="!isEditing" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>การประยุกต์ใช้งาน:</strong> <textarea v-model="resultsData.apply" :disabled="!isEditing" class="dotted-textarea" rows="2"></textarea></p>
        </div>
      </div>

      <div class="results-section mt-12">
        <p class="topic-bold-title">7. <u>ปัญหาในการจัดการเรียนรู้ และ แนวทางการแก้ไขและพัฒนา</u></p>
        <div class="text-row-underlined-box mt-4">
          <p><strong>ปัญหาในการจัดการเรียนรู้:</strong> <textarea v-model="resultsData.problem" :disabled="!isEditing" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>แนวทางการแก้ไขและพัฒนา:</strong> <textarea v-model="resultsData.solution" :disabled="!isEditing" class="dotted-textarea" rows="2"></textarea></p>
        </div>
      </div>

      <div class="signature-layout-grid mt-15">
        <div class="sig-center-block">
          <p>ครูผู้สอน..........................................................</p>
          <p>( <input type="text" v-model="logData.teacher_name" :disabled="!isEditing" class="inline-clean-input text-center w-180" /> )</p>
          <p>ครูผู้สอน</p>
        </div>
        <div class="sig-center-block">
          <p>ผู้รับรอง..........................................................</p>
          <p>( {{ logData.supervisor_name || '...........................' }} )</p>
          <p>หัวหน้าแผนกวิชา{{ logData.department || '............' }}</p>
        </div>
      </div>

    </div>

    <!-- หน้าที่ 3: ตารางบันทึกการตรวจสอบ -->
    <div class="pdf-page-sheet">
      <div class="official-border-review-box mt-12">
        <div class="review-flex-split">
          <div class="split-col border-right-black">
            <p class="title-underline-bold">บันทึกการตรวจสอบ/คำแนะนำ</p>
            <textarea :disabled="!isEditing" class="dotted-textarea mt-4" rows="2"></textarea>
            <div class="text-center mt-6" style="font-size:12px;">
              <p>ลงชื่อ.......................................................... ผู้ตรวจสอบ</p>
              <p>({{ logData?.head_curriculum ||systemSettings?.head_curriculum || 'ยังไม่ได้ระบุ' }})</p>
              <p>หัวหน้างานพัฒนาหลักสูตรและการจัดการเรียนรู้</p>
            </div>
          </div>
          <div class="split-col">
            <p class="title-underline-bold">บันทึกการตรวจสอบ/คำแนะนำ</p>
            <textarea :disabled="!isEditing" class="dotted-textarea mt-4" rows="2"></textarea>
            <div class="text-center mt-6" style="font-size:12px;">
              <p>ลงชื่อ.......................................................... ผู้รับรอง</p>
              <p>({{ logData?.deputy_academic || systemSettings?.deputy_academic || 'ยังไม่ได้ระบุ' }})</p>
              <p>รองผู้อำนวยการฝ่ายวิชาการ</p>
            </div>
          </div>
        </div>
        <div class="director-full-row-block border-top-black">
          <p class="title-underline-bold">บันทึกการอนุมัติจากผู้อำนวยการวิทยาลัย</p>
          <div class="cb-inline-row justify-center mt-4 gap-20">
            <label class="custom-cb"><input type="checkbox" checked :disabled="!isEditing" /> ทราบ/อนุมัติ</label>
            <label class="custom-cb"><input type="checkbox" :disabled="!isEditing" /> อื่นๆ ................................................................</label>
          </div>
          <div class="text-center mt-6" style="font-size:12px;">
            <p>ลงชื่อ........................................................... ผู้อำนวยการ</p>
            <p>({{ logData?.director || systemSettings?.director || 'ยังไม่ได้ระบุ' }})</p>
            <p>ผู้อำนวยการวิทยาลัยเทคนิคเลย</p>
          </div>
        </div>
      </div>
    </div>

    <div class="pdf-page-sheet flex-center-appendix-cover">
      <h1 class="appendix-huge-title">ภาคผนวก</h1>
    </div>

    <div class="pdf-page-sheet">
      <div class="appendix-header-layout">
        <h2 class="appendix-main-header">หลักฐานการจัดการเรียนรู้ วิชาในสถานประกอบการ</h2>
        <div class="appendix-sub-meta mt-6">
          <span>หัวข้อที่สอน: <strong>{{ logData.topic }}</strong></span>
          <span>สัปดาห์ที่: <strong>{{ logData.week }}</strong></span>
        </div>
      </div>
      <div class="appendix-content-body mt-15">
        <div class="appendix-item-block">
          <h4 class="evidence-title-head">1. รูปแบบการจัดการเรียนรู้</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section1" :key="i">
              <div class="mock-image-view">
                <img v-if="img.url" :src="img.url" style="width:100%;height:100%;object-fit:cover;" />
                <span v-else class="mock-photo-icon">ไม่มีรูปภาพในระบบ</span>
              </div>
              <p class="photo-desc-input" style="border:none;">{{ img.desc || '-' }}</p>
            </div>
          </div>
        </div>
        <div class="appendix-item-block mt-15">
          <h4 class="evidence-title-head">2. วิธีการให้เนื้อหา</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section2" :key="i">
              <div class="mock-image-view">
                <img v-if="img.url" :src="img.url" style="width:100%;height:100%;object-fit:cover;" />
                <span v-else class="mock-photo-icon">ไม่มีรูปภาพในระบบ</span>
              </div>
              <p class="photo-desc-input" style="border:none;">{{ img.desc || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pdf-page-sheet">
      <div class="appendix-header-layout">
        <h2 class="appendix-main-header">หลักฐานการจัดการเรียนรู้ วิชาในสถานประกอบการ (ต่อ)</h2>
      </div>
      <div class="appendix-content-body mt-15">
        <div class="appendix-item-block">
          <h4 class="evidence-title-head">3. สื่อที่ใช้/แหล่งเรียนรู้</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section3" :key="i">
              <div class="mock-image-view">
                <img v-if="img.url" :src="img.url" style="width:100%;height:100%;object-fit:cover;" />
                <span v-else class="mock-photo-icon">ไม่มีรูปภาพในระบบ</span>
              </div>
              <p class="photo-desc-input" style="border:none;">{{ img.desc || '-' }}</p>
            </div>
          </div>
        </div>
        <div class="appendix-item-block mt-15">
          <h4 class="evidence-title-head">4. โปรแกรม/แอปพลิเคชัน และ 5. การวัดผล</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section4_5" :key="i">
              <div class="mock-image-view">
                <img v-if="img.url" :src="img.url" style="width:100%;height:100%;object-fit:cover;" />
                <span v-else class="mock-photo-icon">ไม่มีรูปภาพในระบบ</span>
              </div>
              <p class="photo-desc-input" style="border:none;">{{ img.desc || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  </div><!-- end page-wrapper -->

  </template><!-- end v-else -->
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ─── Config ──────────────────────────────────────────
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`

const route  = useRoute()
const router = useRouter()

// ─── State ───────────────────────────────────────────
const loading    = ref(true)
const saving     = ref(false)
const fetchError = ref(null)
const isEditing  = ref(false)
const toast      = ref({ show: false, type: 'success', message: '' })

// ─── Data refs ───────────────────────────────────────
const logData = ref({
  semester: '', academic_year: '',
  teacher_name: '', department: '',
  week: '', start_date: '', month: '', year: '',
  subject_name: '', subject_code: '',
  topic: '', supervisor_name: '',
  attendance_rows: Array(6).fill(null).map(() => ({
    date: '', period: '', time_range: '', total: '', present: '', percentage: '', remark: ''
  }))
})

const methodsData = ref({
  format_onsite: false, format_onair: false, format_online: false,
  format_ondemand: false, format_onhand: false, format_other: false, format_other_detail: '',
  method_lecture: false, method_demo: false, method_experiment: false,
  method_simulation: false, method_discussion: false, method_case: false,
  method_center: false, method_game: false, method_pjbl: false, method_stem: false,
  method_other: false, method_other_detail: '',
  media_ppt: false, media_doc: false, media_book: false, media_real: false,
  media_ebook: false, media_worksheet: false, media_other: false, media_other_detail: '',
  app_classroom: false, app_meet: false, app_zoom: false, app_line: false,
  app_facebook: false, app_youtube: false, app_other: false, app_other_detail: '',
  eval_observe: false, eval_test: false, eval_work: false, eval_exercise: false,
  eval_other: false, eval_other_detail: ''
})

const resultsData = ref({
  knowledge: '', skill: '', attitude: '', apply: '', problem: '', solution: ''
})

// รูปภาพจาก API (GET /api/logs/:id/images)
const appendixImages = ref({
  section1:  [],
  section2:  [],
  section3:  [],
  section4_5: []
})

//  1. สร้างตัวแปรเก็บค่าระบบกลาง
const systemSettings = ref({
  head_curriculum: '',
  deputy_academic: '',
  director: '',
  term: '',
  academic_year: ''
})

//  2. ฟังก์ชันวิ่งไปดึงข้อมูลจากหลังบ้าน
async function fetchSystemSettings() {
  try {
    const res = await fetch(`${API}/system/settings`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      systemSettings.value = data
      console.log('👤 โหลดข้อมูลผู้บริหารสำเร็จ:', systemSettings.value)
    }
  } catch (error) {
    console.error('โหลดข้อมูลระบบกลางไม่สำเร็จ:', error)
  }
}

// ─── Auth helper ─────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Toast helper ────────────────────────────────────
function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 4000)
}

// ─── Map API response → local refs ───────────────────
// logController.getLogById ส่งคืน: { ...teaching_logs fields, users:{...}, images:[...] }
function mapApiToRefs(data) {
  // ── logData ──
  const att = Array.isArray(data.attendance) ? data.attendance : []
  // ทำให้มีครบ 6 แถวเสมอ
  const rows = Array(6).fill(null).map((_, i) => att[i] || {
    date: '', period: '', time_range: '', total: '', present: '', percentage: '', remark: ''
  })

  logData.value = {
    semester:       data.semester       || '',
    academic_year:  data.academic_year  || '',
    teacher_name:   data.users?.full_name || '',
    department:     data.users?.departments?.name || '',
    department_head: data.users?.departments?.headerName || '',
    week:           String(data.week    || ''),
    start_date:     data.date_from      || '',
    month:          data.month          || '',
    year:           data.year           || '',
    subject_name:   data.subject_name   || '',
    subject_code:   data.subject_code   || '',
    topic:          data.topic          || '',
    supervisor_name: data.supervisor_name || '',
    head_curriculum: data.head_curriculum || '',
    deputy_academic: data.deputy_academic || '',
    director:        data.director        || '',
    attendance_rows: rows
  }

  // ── methodsData ──
  const m  = data.methods          || {}
  const cm = data.content_methods  || {}
  const md = data.media            || {}
  const ap = data.apps             || {}
  const ev = data.evaluation       || {}

  methodsData.value = {
    format_onsite:   !!m.format_onsite,   format_onair:  !!m.format_onair,
    format_online:   !!m.format_online,   format_ondemand: !!m.format_ondemand,
    format_onhand:   !!m.format_onhand,   format_other:  !!m.format_other,
    format_other_detail: m.format_other_detail || '',

    method_lecture:    !!cm.lecture,    method_demo:       !!cm.demo,
    method_experiment: !!cm.experiment, method_simulation: !!cm.simulation,
    method_discussion: !!cm.discussion, method_case:       !!cm.case_study,
    method_center:     !!cm.center,     method_game:       !!cm.game,
    method_pjbl:       !!cm.pjbl,       method_stem:       !!cm.stem,
    method_other:      !!cm.other,      method_other_detail: cm.other_detail || '',

    media_ppt:       !!md.ppt,       media_doc:       !!md.doc,
    media_book:      !!md.book,      media_real:      !!md.real,
    media_ebook:     !!md.ebook,     media_worksheet: !!md.worksheet,
    media_other:     !!md.other,     media_other_detail: md.other_detail || '',

    app_classroom: !!ap.classroom, app_meet:    !!ap.meet,
    app_zoom:      !!ap.zoom,      app_line:    !!ap.line,
    app_facebook:  !!ap.facebook,  app_youtube: !!ap.youtube,
    app_other:     !!ap.other,     app_other_detail: ap.other_detail || '',

    eval_observe:  !!ev.observe,  eval_test:     !!ev.test,
    eval_work:     !!ev.work,     eval_exercise: !!ev.exercise,
    eval_other:    !!ev.other,    eval_other_detail: ev.other_detail || ''
  }

  // ── resultsData ──
  resultsData.value = {
    knowledge: data.outcome_cognitive    || '',
    skill:     data.outcome_psychomotor  || '',
    attitude:  data.outcome_affective    || '',
    apply:     data.outcome_application  || '',
    problem:   data.problem  || '',
    solution:  data.solution || ''
  }

  // ── appendixImages — จัด section ตาม field section ที่ backend ส่งมา ──
  const imgs = Array.isArray(data.images) ? data.images : []
  const bySection = (key) => imgs
    .filter(i => i.section === key)
    .map(i => ({ id: i.id, desc: i.caption || '', url: i.signed_url || null }))

  appendixImages.value = {
    section1:   bySection('format'),
    section2:   bySection('method'),
    section3:   bySection('media'),
    section4_5: bySection('app_eval')
  }

  // ถ้า section ไหนไม่มีรูป ให้มี placeholder 2 ช่อง
  const placeholder = () => [{ id: null, desc: '', url: null }, { id: null, desc: '', url: null }]
  if (!appendixImages.value.section1.length)   appendixImages.value.section1   = placeholder()
  if (!appendixImages.value.section2.length)   appendixImages.value.section2   = placeholder()
  if (!appendixImages.value.section3.length)   appendixImages.value.section3   = placeholder()
  if (!appendixImages.value.section4_5.length) appendixImages.value.section4_5 = placeholder()
}

// ─── GET /api/logs/:id ────────────────────────────────
async function fetchLog() {
  loading.value    = true
  fetchError.value = null
  try {
  const res = await fetch(`${API}/logs/${route.params.id}`, {
  headers: authHeaders()
  })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'โหลดข้อมูลไม่สำเร็จ')
    }
    const data = await res.json()
    mapApiToRefs(data)
  } catch (err) {
    fetchError.value = err.message
  } finally {
    loading.value = false
  }
}

// ─── Toggle edit / save ──────────────────────────────
const toggleEditMode = async () => {
  if (isEditing.value) {
    await saveData()
  }
  isEditing.value = !isEditing.value
}

// ─── PUT /api/logs/:id ───────────────────────────────
async function saveData() {
  saving.value = true
  try {
    const payload = {
      semester:      logData.value.semester || systemSettings.value.term,          
      academic_year: logData.value.academic_year || systemSettings.value.academic_year,

      head_curriculum: logData.value.head_curriculum || systemSettings.value.head_curriculum,
      deputy_academic: logData.value.deputy_academic || systemSettings.value.deputy_academic,
      director:        logData.value.director        || systemSettings.value.director,

      week:        Number(logData.value.week) || 1,
      date_from:   logData.value.start_date,
      subject_name: logData.value.subject_name,
      subject_code: logData.value.subject_code,
      topic:        logData.value.topic,
      attendance:   logData.value.attendance_rows,
      methods: {
        format_onsite:       methodsData.value.format_onsite,
        format_onair:        methodsData.value.format_onair,
        format_online:       methodsData.value.format_online,
        format_ondemand:     methodsData.value.format_ondemand,
        format_onhand:       methodsData.value.format_onhand,
        format_other:        methodsData.value.format_other,
        format_other_detail: methodsData.value.format_other_detail
      },
      content_methods: {
        lecture: methodsData.value.method_lecture, demo: methodsData.value.method_demo,
        experiment: methodsData.value.method_experiment, simulation: methodsData.value.method_simulation,
        discussion: methodsData.value.method_discussion, case_study: methodsData.value.method_case,
        center: methodsData.value.method_center, game: methodsData.value.method_game,
        pjbl: methodsData.value.method_pjbl, stem: methodsData.value.method_stem,
        other: methodsData.value.method_other, other_detail: methodsData.value.method_other_detail
      },
      media: {
        ppt: methodsData.value.media_ppt, doc: methodsData.value.media_doc,
        book: methodsData.value.media_book, real: methodsData.value.media_real,
        ebook: methodsData.value.media_ebook, worksheet: methodsData.value.media_worksheet,
        other: methodsData.value.media_other, other_detail: methodsData.value.media_other_detail
      },
      apps: {
        classroom: methodsData.value.app_classroom, meet: methodsData.value.app_meet,
        zoom: methodsData.value.app_zoom, line: methodsData.value.app_line,
        facebook: methodsData.value.app_facebook, youtube: methodsData.value.app_youtube,
        other: methodsData.value.app_other, other_detail: methodsData.value.app_other_detail
      },
      evaluation: {
        observe: methodsData.value.eval_observe, test: methodsData.value.eval_test,
        work: methodsData.value.eval_work, exercise: methodsData.value.eval_exercise,
        other: methodsData.value.eval_other, other_detail: methodsData.value.eval_other_detail
      },
      outcome_cognitive:   resultsData.value.knowledge,
      outcome_psychomotor: resultsData.value.skill,
      outcome_affective:   resultsData.value.attitude,
      outcome_application: resultsData.value.apply,
      problem:  resultsData.value.problem,
      solution: resultsData.value.solution
    }

    const res = await fetch(`${API}/logs/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'บันทึกข้อมูลไม่สำเร็จ')
    }

    showToast('บันทึกข้อมูลสำเร็จแล้วครับ ✓')
  } catch (err) {
    showToast(err.message, 'error')
    isEditing.value = true // คงอยู่ในโหมดแก้ไขถ้า save ไม่ผ่าน
  } finally {
    saving.value = false
  }
}

// ─── รูปภาพเป็น read-only — ดึงมาแสดงจาก GET /api/logs/:id เท่านั้น ───
// (ไม่มีฟังก์ชันอัปโหลด/ลบรูปในหน้านี้ตามที่ต้องการ)

// ─── Export PDF ──────────────────────────────────────
// ─── Export PDF (jsPDF วาด text จริง — ดูรายละเอียดใน pdfBuilder.js) ───
const exportPDF = async () => {
  const { buildLogPDF } = await import('./pdfBuilder.js')

  const pdf = await buildLogPDF({
    logData: logData.value,
    methodsData: methodsData.value,
    resultsData: resultsData.value,
    appendixImages: appendixImages.value
  })

  const blob = pdf.output('blob')
  window.open(URL.createObjectURL(blob), '_blank')
}

// ─── Lifecycle ───────────────────────────────────────
onMounted(async () => {
  await fetchLog()
  await fetchSystemSettings() // สั่งให้โหลดข้อมูลกลางมาสแตนด์บายไว้ตอนเปิดหน้าจอ
})
</script>

<style scoped>
/* =================================================== */
/* 🛠️ สไตล์การจัดวางเลย์เอาต์บนหน้าเว็บ และเพิ่มฟอนต์ TH Sarabun PSK */
/* =================================================== */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');

body, input, textarea, select, button, span, p, div, h1, h2, h3, h4, th, td {
  font-family: 'TH Sarabun PSK', 'Sarabun', sans-serif !important;
}

/* ======= NAVBAR (matches LogFormView header) ======= */
.app-navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: linear-gradient(to right, #14532d, #15803d);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.navbar-title { color: #ffffff; font-size: 16px; font-weight: 700; line-height: 1.2; }
.navbar-subtitle { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 2px; }

/* ======= PAGE WRAPPER ======= */
.page-wrapper {
  background-color: #f0fdf4;
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 48px;
}

/* ======= CONTROL PANEL ======= */
.control-panel {
  position: sticky;
  top: 88px;
  z-index: 90;
  max-width: 210mm;
  margin: 0 auto 16px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  border: 1px solid #d1fae5;
}

.back-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to right, #16a34a, #166534);
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(22,163,74,0.3);
  transition: all 0.2s ease;
}
.back-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(22,163,74,0.35);
}

.action-buttons-group { display: flex; gap: 10px; }

.edit-toggle-btn {
  background-color: #4b5563;
  color: white;
  border: none;
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: background-color 0.2s ease;
}
.edit-toggle-btn:hover { background-color: #374151; }
.edit-toggle-btn.editing-active { background-color: #16a34a !important; }
.edit-toggle-btn.editing-active:hover { background-color: #15803d !important; }

.export-pdf-blue-btn {
  background-color: #0284c7;
  color: white;
  border: none;
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: background-color 0.2s ease;
}
.export-pdf-blue-btn:hover { background-color: #0369a1; }

.document-container {
  width: 210mm;
  margin: 0 auto;
}

/* ปรับฟอร์ม A4 ล็อกหน้าระยะความสูง */
.pdf-page-sheet {
  background: #ffffff;
  width: 210mm;
  min-height: 297mm;
  box-sizing: border-box;
  padding: 8mm 15mm 12mm 15mm;
  color: #000000;
  font-size: 14.5px;
  line-height: 1.35;  
  border: 1px solid #d3d3d3;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 25px;
  text-align: left;
  position: relative;
  page-break-after: always;
  break-after: page;
}

/* เมื่ออินพุตโดนล็อกให้อ่านข้อความชัดเจน ไม่จางเบลอ */
input:disabled, textarea:disabled, select:disabled {
  color: #000000 !important;
  cursor: default;
  background-color: transparent !important;
  opacity: 1 !important;
  -webkit-text-fill-color: #000000 !important;
}

.official-header-layout { text-align: center; margin-bottom: 5px; }
.form-main-title { font-size: 15px; font-weight: bold; margin-bottom: 8px; }
.header-inline-group { display: flex; justify-content: flex-start; gap: 8px; width: 100%; }

.dotted-input {
  border: none;
  background-image: linear-gradient(to right, #000000 2px, transparent 2px);
  background-repeat: repeat-x;
  background-size: 7px 1px;
  background-position: left bottom;
  border-radius: 0;
  padding: 0 4px 2px 4px;
  font-size: 14.5px;
}
.dotted-input:focus { outline: none; background-image: linear-gradient(to right, #000000 100%, transparent 0%); background-size: 100% 1px; }
.dotted-input:disabled { background-image: linear-gradient(to right, #000000 2px, transparent 2px); background-size: 7px 1px; }
.flex-grow { flex-grow: 1; }
.w-60 { width: 60px; } .w-80 { width: 80px; } .w-150 { width: 150px; } 
.w-180 { width: 180px; } .w-200 { width: 200px; } .w-220 { width: 220px; } .w-250 { width: 250px; }
.text-center { text-align: center; }

/* ตาราง */
.main-report-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.main-report-table th, .main-report-table td { border: 1px solid #000000; padding: 3px 4px; font-size: 13.5px; }
.main-report-table th { font-weight: bold; text-align: center; background: #fafafa; }
.table-cell-input { width: 100%; border: none; background: transparent; font-size: 13.5px; }
.table-cell-input:focus { outline: none; }

.w-45p { width: 45%; } .w-35p { width: 35%; } .w-20p { width: 20%; }
.w-15p { width: 15%; } .w-11p { width: 11%; } .w-13p { width: 13%; }

.section-main-heading { font-size: 14.5px; font-weight: bold; text-align: center; margin-bottom: 4px; }
.topic-bold-title { font-weight: bold; }

/* โครงสร้างกล่องย่อหน้าข้อ 1 */
.cb-indented-vertical-box {
  padding-left: 25px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 🎯 โครงสร้างกล่องย่อหน้าข้อ 2, 3, 4, 5 บังคับดิ่งเรียงแถวตรงแนวตั้งตามที่คุยกันรอบก่อน */
.cb-indented-grid-box {
  padding-left: 25px;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px;
  margin-top: 6px;
}

.cb-inline-row { display: flex; align-items: center; width: 100%; }
.custom-cb { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; color: #000000; }
.custom-cb input { cursor: pointer; }
.custom-cb input:disabled { cursor: default; }
.ml-5 { margin-left: 5px; }

/* กล่องข้อความความเห็น */
.text-row-underlined-box { font-size: 14px; }
.dotted-textarea {
  width: 100%; border: 1px solid #9ca3af; border-radius: 4px; padding: 4px;
  font-size: 14px; line-height: 1.3; resize: none; background: transparent;
}

/* ลายเซ็นและการตรวจสอบ */
.signature-layout-grid { display: grid; grid-template-cols: 1fr 1fr; text-align: center; font-size: 14px; margin-top: 8px; }
.sig-center-block { line-height: 1.6; }
.inline-clean-input { border: none; border-bottom: 1px solid #000; background: transparent; font-size: 14px; }
.inline-clean-input:focus { outline: none; }

.official-border-review-box { border: 1px solid #000000; font-size: 13px; margin-top: 8px; }
.review-flex-split { display: flex; }
.split-col { flex: 1; padding: 5px; line-height: 1.4; }
.border-right-black { border-right: 1px solid #000000; }
.border-top-black { border-top: 1px solid #000000; }
.title-underline-bold { font-weight: bold; text-decoration: underline; }
.director-full-row-block { padding: 5px; text-align: center; line-height: 1.4; }
.justify-center { justify-content: center; }
.gap-20 { gap: 20px; }

/* หน้าคั่นภาคผนวก */
.flex-center-appendix-cover { display: flex; align-items: center; justify-content: center; height: 297mm; }
.appendix-huge-title { font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 3px; }

/* หน้าหลักฐานรูปภาพ */
.appendix-header-layout { border-bottom: 1px dashed #000; padding-bottom: 4px; text-align: center; }
.appendix-main-header { font-size: 15px; font-weight: bold; margin: 0; }
.appendix-sub-meta { display: flex; justify-content: space-between; font-size: 13px; }
.evidence-title-head { font-size: 13.5px; font-weight: bold; text-decoration: underline; }
.image-double-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; }
.photo-card-box { border: 1px solid #ccc; padding: 6px; background: #fff; }
.mock-image-view { width: 100%; height: 135px; background: #f3f4f6; border: 1px dashed #9ca3af; display: flex; align-items: center; justify-content: center; }
.mock-photo-icon { font-size: 11px; color: #6b7280; font-style: italic; text-align: center; }
.photo-desc-input { width: 100%; border: none; border-bottom: 1px solid #777; margin-top: 4px; font-size: 13px; text-align: center; }
.toast-box { position:fixed;bottom:24px;right:24px;z-index:999;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15); }
.toast-success { background:#dcfce7;color:#166534;border:1px solid #86efac; }
.toast-error   { background:#fee2e2;color:#dc2626;border:1px solid #fca5a5; }
.fade-enter-active,.fade-leave-active{transition:opacity .3s}
.fade-enter-from,.fade-leave-to{opacity:0}

.mt-6 { margin-top: 5px; }
.mt-12 { margin-top: 8px; }
.mt-15 { margin-top: 10px; }

/* =================================================== */
/* 🖨️ CSS PRINT CONTROL */
/* =================================================== */
@media print {
  @page { size: A4 portrait; margin: 0; }

  body { 
    background: #ffffff; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
  }

  .print-hidden { display: none !important; }

  /* ✅ เพิ่ม reset page-wrapper */
  .page-wrapper {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    background: #ffffff !important;
    min-height: unset !important;
  }

  .document-container { 
    width: 210mm !important; 
    margin: 0 !important; 
    padding: 0 !important; 
  }

  /* ✅ เปลี่ยน height → min-height และเพิ่ม overflow: hidden */
  .pdf-page-sheet { 
    width: 210mm !important; 
    height: 297mm !important;
    overflow: hidden !important;        /* ← ตัดเนื้อหาที่ล้นออก */
    border: none !important; 
    box-shadow: none !important;
    margin-bottom: 0 !important;
    padding: 8mm 15mm 12mm 15mm !important;
    page-break-after: always !important; 
    break-after: page !important;
  }

  .pdf-page-sheet:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
}
</style>