<template>
  <div class="control-panel print-hidden">
    <router-link to="/logs" class="back-btn-green">⬅ กลับหน้ารายการ</router-link>
    <div class="action-buttons-group">
      <button @click="toggleEditMode" class="edit-toggle-btn" :class="{ 'editing-active': isEditing }">
        {{ isEditing ? '💾 บันทึกข้อมูล' : '📝 แก้ไขข้อมูล' }}
      </button>
      <button @click="exportPDF" class="export-pdf-blue-btn">🖨️ Export PDF (A4 ครบ 5 หน้า)</button>
    </div>
  </div>

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
          <p>( <input type="text" v-model="logData.supervisor_name" :disabled="!isEditing" class="inline-clean-input text-center w-180" /> )</p>
          <p>หัวหน้าแผนกวิชา{{ logData.department || '............' }}</p>
        </div>
      </div>

      <div class="official-border-review-box mt-12">
        <div class="review-flex-split">
          <div class="split-col border-right-black">
            <p class="title-underline-bold">บันทึกการตรวจสอบ/คำแนะนำ</p>
            <textarea :disabled="!isEditing" class="dotted-textarea mt-4" rows="2"></textarea>
            <div class="text-center mt-6" style="font-size:12px;">
              <p>ลงชื่อ.......................................................... ผู้ตรวจสอบ</p>
              <p>( ว่าที่ ร.ต. ชัชวาลย์ ป้อมสุวรรณ )</p>
              <p>หัวหน้างานพัฒนาหลักสูตรและการจัดการเรียนรู้</p>
            </div>
          </div>
          <div class="split-col">
            <p class="title-underline-bold">บันทึกการตรวจสอบ/คำแนะนำ</p>
            <textarea :disabled="!isEditing" class="dotted-textarea mt-4" rows="2"></textarea>
            <div class="text-center mt-6" style="font-size:12px;">
              <p>ลงชื่อ.......................................................... ผู้รับรอง</p>
              <p>( นายวิโรจน์ ยาบุษดี )</p>
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
            <p>ลงชื่อ................................................................................ ผู้อำนวยการ</p>
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
              <div class="mock-image-view"><span class="mock-photo-icon">📸 รูปถ่ายกิจกรรม On-Site</span></div>
              <input type="text" v-model="img.desc" :disabled="!isEditing" class="photo-desc-input" />
            </div>
          </div>
        </div>
        <div class="appendix-item-block mt-15">
          <h4 class="evidence-title-head">2. วิธีการให้เนื้อหา</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section2" :key="i">
              <div class="mock-image-view"><span class="mock-photo-icon">📸 รูปถ่ายสาธิตการเรียนการสอน</span></div>
              <input type="text" v-model="img.desc" :disabled="!isEditing" class="photo-desc-input" />
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
              <div class="mock-image-view"><span class="mock-photo-icon">📸 สื่อคอมพิวเตอร์ / สไลด์</span></div>
              <input type="text" v-model="img.desc" :disabled="!isEditing" class="photo-desc-input" />
            </div>
          </div>
        </div>
        <div class="appendix-item-block mt-15">
          <h4 class="evidence-title-head">4. โปรแกรม/แอปพลิเคชัน และ 5. การวัดผล</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section4_5" :key="i">
              <div class="mock-image-view"><span class="mock-photo-icon">📸 ระบบ Google Classroom / การให้คะแนน</span></div>
              <input type="text" v-model="img.desc" :disabled="!isEditing" class="photo-desc-input" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

// 🔥 เพิ่มตัวแปรสถานะเปิด/ปิดล็อกแบบฟอร์ม (เริ่มต้นเป็น false คือ ล็อกข้อมูลอยู่)
const isEditing = ref(false);

// 🔥 ฟังก์ชันปุ่มสลับร่าง แก้ไข และ บันทึกข้อมูลในปุ่มเดียวกัน
const toggleEditMode = () => {
  if (isEditing.value) {
    // จังหวะที่เปิดแก้อยู่ แล้วผู้ใช้กดปุ่ม (ซึ่งตอนนี้กลายเป็นคำว่า "บันทึกข้อมูล")
    saveData();
  }
  isEditing.value = !isEditing.value;
};

const logData = ref({
  semester: '1', academic_year: '2569',
  teacher_name: 'นายสมชาย สายโค้ด', department: 'เทคโนโลยีสารสนเทศ',
  week: '12', start_date: '15 มิ.ย. 69', month: 'มิถุนายน', year: '2569',
  subject_name: 'การพัฒนาเว็บแอปพลิเคชันเชิงรุกขั้นสูง', subject_code: '30901-2005',
  topic: 'โครงสร้างข้อมูลสถาปัตยกรรมระบบ Front-end', supervisor_name: 'นายวิโรจน์ ยาบุษดี',
  attendance_rows: [
    { date: '15 มิ.ย. 69', period: '1-4', time_range: '08.30-12.30', total: '25', present: '25', percentage: '100%', remark: 'นักเรียนเข้าครบและส่งแล็บทันเวลา' },
    { date: '16 มิ.ย. 69', period: '5-8', time_range: '13.30-17.30', total: '25', present: '24', percentage: '96%', remark: 'ลากิจ 1 คน (มีใบลาถูกต้อง)' },
    { date: '17 มิ.ย. 69', period: '1-4', time_range: '08.30-12.30', total: '25', present: '25', percentage: '100%', remark: 'ปฏิบัติงานกลุ่มในสถานประกอบการดีเยี่ยม' },
    { date: '', period: '', time_range: '', total: '', present: '', percentage: '', remark: '' },
    { date: '', period: '', time_range: '', total: '', present: '', percentage: '', remark: '' },
    { date: '', period: '', time_range: '', total: '', present: '', percentage: '', remark: '' }
  ]
});

const methodsData = ref({
  format_onsite: true, format_onair: false, format_online: true, format_ondemand: false, format_onhand: false, format_other: false, format_other_detail: '',
  method_lecture: true, method_demo: true, method_experiment: false, method_simulation: false, method_discussion: true, method_case: true, method_center: false, method_game: false, method_pjbl: true, method_stem: false, method_other: false, method_other_detail: '',
  media_ppt: true, media_doc: true, media_book: false, media_real: true, media_ebook: false, media_worksheet: true, media_other: false, media_other_detail: '',
  app_classroom: true, app_meet: false, app_zoom: false, app_line: true, app_facebook: false, app_youtube: true, app_other: false, app_other_detail: '',
  eval_observe: true, eval_test: true, eval_work: true, eval_exercise: true, eval_other: false, eval_other_detail: ''
});

const resultsData = ref({
  knowledge: 'นักศึกษาเข้าใจความแตกต่างโครงสร้างสถาปัตยกรรมแบบ Component และเชื่อมต่อบริการ API ได้',
  skill: 'นักศึกษาสามารถเขียนโค้ดสคริปต์เชื่อมต่อกล่องข้อมูล และการทำ Data Binding ได้ถูกต้อง',
  attitude: 'ผู้เรียนมีความรับผิดชอบต่องานกลุ่ม เข้าเรียนตรงเวลา',
  apply: 'สามารถนำเทคนิคการทำแอปพลิเคชันนี้ไปต่อยอดทำระบบในรายวิชาโครงการได้',
  problem: 'นักศึกษาบางคนยังสับสนเรื่องการสลับความสอดคล้อง Async/Await ในสคริปต์',
  solution: 'เพิ่มการอธิบายจำลองสถานการณ์ Timeline Flowchart และให้เพื่อนช่วยติวคู่ประกบ'
});

const appendixImages = ref({
  section1: [{ desc: 'ภาพที่ 1: บรรยายการทำงานของระบบแอปพลิเคชัน' }, { desc: 'ภาพที่ 2: นิเทศการเรียนการสอนกลุ่ม' }],
  section2: [{ desc: 'ภาพที่ 3: ครูผู้สอนสาธิตโค้ดโครงสร้างงาน' }, { desc: 'ภาพที่ 4: นักศึกษาลงมือปฏิบัติ' }],
  section3: [{ desc: 'ภาพที่ 5: สื่อสไลด์ประกอบการสอนประจำหน่วย' }, { desc: 'ภาพที่ 6: คู่มือปฏิบัติการประมวลผล' }],
  section4_5: [{ desc: 'ภาพที่ 7: มอบหมายงานผ่าน Google Classroom' }, { desc: 'ภาพที่ 8: บันทึกคะแนนประเมินผล' }]
});

const saveData = () => { alert('💾 บันทึกข้อมูลสำเร็จ!'); };
const exportPDF = () => { window.print(); };
</script>

<style scoped>
/* =================================================== */
/* 🛠️ สไตล์การจัดวางเลย์เอาต์บนหน้าเว็บ และเพิ่มฟอนต์ TH Sarabun PSK */
/* =================================================== */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');

body, input, textarea, select, button, span, p, div, h1, h2, h3, h4, th, td {
  font-family: 'TH Sarabun PSK', 'Sarabun', sans-serif !important;
}

.control-panel {
  max-width: 210mm;
  margin: 10px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f3f4f6;
  border-radius: 6px;
}

/* 🟢 ปุ่มย้อนกลับปรับเปลี่ยนสีเขียวตามสั่ง */
.back-btn-green {
  display: inline-flex;
  align-items: center;
  background-color: #e8f5e9;
  color: #166534;
  text-decoration: none;
  font-weight: bold;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
  transition: all 0.2s ease;
}
.back-btn-green:hover {
  background-color: #c8e6c9;
  color: #1b5e20;
}

.action-buttons-group { display: flex; gap: 10px; }

/* 📝/💾 ปุ่มแก้ไขและบันทึก (แชร์ปุ่มสลับสีสลับร่างร่วมกัน) */
.edit-toggle-btn {
  background-color: #4b5563; /* ค่าเริ่มต้นโหมดล็อกเป็นสีเทา (แก้ไขข้อมูล) */
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: background-color 0.2s ease;
}
.edit-toggle-btn:hover { background-color: #374151; }

/* เมื่อเปิดโหมดแก้ไข (isEditing = true) คลาสนี้จะทำงาน ปุ่มจะสลับเป็นสีส้มบันทึกข้อมูลทันที */
.edit-toggle-btn.editing-active {
  background-color: #d97706 !important;
}
.edit-toggle-btn.editing-active:hover {
  background-color: #b45309 !important;
}

/* 🔵 ปุ่ม Export PDF ตกแต่งด้วยดีไซน์สีฟ้าตามสั่ง */
.export-pdf-blue-btn {
  background-color: #0284c7;
  color: white;
  border: none;
  padding: 8px 15px;
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
  height: 297mm;
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
  border-bottom: 1px dotted #000000;
  background: transparent;
  padding: 0 4px;
  font-size: 14.5px;
}
.dotted-input:focus { outline: none; border-bottom-style: solid; }
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

.mt-6 { margin-top: 5px; }
.mt-12 { margin-top: 8px; }
.mt-15 { margin-top: 10px; }

/* =================================================== */
/* 🖨️ CSS PRINT CONTROL */
/* =================================================== */
@media print {
  @page { size: A4 portrait; margin: 0; }
  body { background: #ffffff; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print-hidden { display: none !important; }
  .document-container { width: 210mm !important; margin: 0 !important; padding: 0 !important; }
  .pdf-page-sheet { width: 210mm !important; height: 297mm !important; border: none !important; box-shadow: none !important; page-break-after: always !important; break-after: page !important; }
}
</style>