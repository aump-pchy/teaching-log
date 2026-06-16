<template>
  <!-- แผงควบคุมด้านบน (ซ่อนเมื่อสั่งพิมพ์) -->
  <div class="control-panel print-hidden">
    <router-link to="/logs" class="back-btn">← กลับหน้ารายการ</router-link>
    <div class="action-buttons-group">
      <button @click="saveData" class="save-data-btn">💾 บันทึกข้อมูล</button>
      <button @click="exportPDF" class="print-btn">🖨️ Export PDF (A4 ครบ 5 หน้า)</button>
    </div>
  </div>

  <!-- กล่องครอบเอกสารทั้งหมด -->
  <div class="document-container">

    <!-- ==================== หน้าที่ 1: บันทึกข้อมูล & รูปแบบการสอน ==================== -->
    <div class="pdf-page-sheet">
      <div class="official-header-layout">
        <h2 class="form-main-title">
          <u>แบบบันทึกการจัดการเรียนการสอนสำหรับรายวิชาในสถานประกอบการ ภาคเรียนที่ {{ logData.semester }}/{{ logData.academic_year }}</u>
        </h2>
        
        <div class="header-inline-group">
          <span>ครูผู้สอน <input type="text" v-model="logData.teacher_name" class="dotted-input w-250" /></span>
          <span>แผนกวิชา <input type="text" v-model="logData.department" class="dotted-input w-220" /></span>
        </div>
        
        <div class="header-inline-group mt-6">
          <span>สัปดาห์ที่ <input type="text" v-model="logData.week" class="dotted-input w-60 text-center" /></span>
          <span>ระหว่างวันที่ <input type="text" v-model="logData.start_date" class="dotted-input w-60 text-center" /></span>
          <span>เดือน <input type="text" v-model="logData.month" class="dotted-input w-150 text-center" /></span>
          <span>พ.ศ. <input type="text" v-model="logData.year" class="dotted-input w-80 text-center" /></span>
        </div>

        <div class="header-inline-group mt-6">
          <span>ชื่อวิชา <input type="text" v-model="logData.subject_name" class="dotted-input flex-grow" /></span>
          <span>รหัสวิชา <input type="text" v-model="logData.subject_code" class="dotted-input w-200" /></span>
        </div>

        <div class="header-inline-group mt-6">
          <span>เรื่อง/หัวข้อที่สอน <input type="text" v-model="logData.topic" class="dotted-input flex-grow" /></span>
        </div>
      </div>

      <!-- ตารางลงบันทึกเวลาเรียน -->
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
            <td><input type="text" v-model="row.date" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.period" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.time_range" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.total" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.present" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.percentage" class="table-cell-input text-center" /></td>
            <td><input type="text" v-model="row.remark" class="table-cell-input" /></td>
          </tr>
        </tbody>
      </table>

      <!-- รายละเอียดวิธีการจัดการเรียนรู้ -->
      <div class="details-section mt-15">
        <h3 class="section-main-heading"><u>รายละเอียดวิธีการจัดการเรียนรู้</u></h3>
        
        <!-- ข้อ 1 แบบย่อหน้าตามรูปฝั่งซ้าย -->
        <div class="checkbox-group-block mt-6">
          <p class="topic-bold-title">1. <u>รูปแบบการจัดการเรียนรู้</u> <i>(แนบภาคผนวก)</i></p>
          <div class="cb-indented-box mt-4">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_onsite" /> การเรียนการสอนรูปแบบปกติ (On-Site)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_onair" /> การเรียนการสอนโดย ผ่าน DLTV ผ่านทาง Digital TV (On-Air)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_online" /> การเรียนการสอนผ่านอินเตอร์เน็ต (On-Line)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_ondemand" /> การเรียนการสอนผ่านแอพพลิเคชั่น (On-Demand)</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_onhand" /> การเรียนการสอนโดยผ่านหนังสือเรียน แบบฝึกหัด ใบงาน (On-Hand)</label>
            <div class="cb-inline-row">
              <label class="custom-cb"><input type="checkbox" v-model="methodsData.format_other" /> อื่นๆ</label>
              <input type="text" v-model="methodsData.format_other_detail" class="dotted-input flex-grow ml-5" />
            </div>
          </div>
        </div>

        <!-- ข้อ 2 แบบย่อหน้าตามรูปฝั่งซ้าย -->
        <div class="checkbox-group-block mt-12">
          <p class="topic-bold-title">2. <u>วิธีการให้เนื้อหา</u> <i>(แนบภาคผนวก)</i></p>
          <div class="cb-indented-box cb-grid-layout-2 mt-4">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_lecture" /> บรรยาย</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_demo" /> สาธิต</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_experiment" /> ทดลอง</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_simulation" /> สถานการณ์จำลอง</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_discussion" /> อภิปรายกลุ่มย่อย</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_case" /> กรณีศึกษา</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_center" /> ศูนย์การเรียน</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_game" /> เกมส์</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_pjbl" /> PjBL</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_stem" /> STEM</label>
            <div class="grid-span-2 cb-inline-row">
              <label class="custom-cb"><input type="checkbox" v-model="methodsData.method_other" /> อื่น ๆ</label>
              <input type="text" v-model="methodsData.method_other_detail" class="dotted-input flex-grow ml-5" />
            </div>
          </div>
        </div>

        <!-- ข้อ 3 แบบย่อหน้าตามรูปฝั่งซ้าย -->
        <div class="checkbox-group-block mt-12">
          <p class="topic-bold-title">3. <u>สื่อที่ใช้/แหล่งเรียนรู้</u> <i>(แนบภาคผนวก)</i></p>
          <div class="cb-indented-box cb-grid-layout-2 mt-4">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_ppt" /> Power Point</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_doc" /> เอกสารประกอบการสอน</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_book" /> หนังสือ</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_real" /> หุ่นจำลอง/ของจริง</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_ebook" /> E-Book</label>
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_worksheet" /> ใบงาน/ใบความรู้</label>
            <div class="grid-span-2 cb-inline-row">
              <label class="custom-cb"><input type="checkbox" v-model="methodsData.media_other" /> อื่น ๆ</label>
              <input type="text" v-model="methodsData.media_other_detail" class="dotted-input flex-grow ml-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== หน้าที่ 2: ส่วนประเมินผลและฟอร์มเซ็นชื่ออนุมัติ ==================== -->
    <div class="pdf-page-sheet">
      <div class="checkbox-group-block">
        <p class="topic-bold-title">4. <u>โปรแกรม / E-learning / Application ที่ใช้ในการจัดการเรียนการสอน</u> <i>(แนบภาคผนวก)</i></p>
        <div class="cb-indented-box cb-grid-layout-2 mt-4">
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_classroom" /> Google Classroom</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_meet" /> Google Meet</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_zoom" /> Zoom</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_line" /> Line</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_facebook" /> Facebook</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_youtube" /> YouTube</label>
          <div class="grid-span-2 cb-inline-row">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.app_other" /> อื่น ๆ</label>
            <input type="text" v-model="methodsData.app_other_detail" class="dotted-input flex-grow ml-5" />
          </div>
        </div>
      </div>

      <div class="checkbox-group-block mt-12">
        <p class="topic-bold-title">5. <u>การวัดผลและประเมินผลการเรียนรู้</u> <i>(แนบภาคผนวก)</i></p>
        <div class="cb-indented-box cb-grid-layout-2 mt-4">
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_observe" /> การสังเกต</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_test" /> การทดสอบ</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_work" /> การตรวจชิ้นงาน</label>
          <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_exercise" /> แบบฝึกหัดท้ายหน่วย</label>
          <div class="grid-span-2 cb-inline-row">
            <label class="custom-cb"><input type="checkbox" v-model="methodsData.eval_other" /> อื่น ๆ</label>
            <input type="text" v-model="methodsData.eval_other_detail" class="dotted-input flex-grow ml-5" />
          </div>
        </div>
      </div>

      <div class="results-section mt-12">
        <p class="topic-bold-title">6. <u>ผลการจัดการเรียนรู้</u> (ตามสมรรถนะที่พึงประสงค์)</p>
        <div class="text-row-underlined-box mt-4">
          <p><strong>พุทธิพิสัย:</strong> <textarea v-model="resultsData.knowledge" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>ทักษะพิสัย:</strong> <textarea v-model="resultsData.skill" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>จิตพิสัย:</strong> <textarea v-model="resultsData.attitude" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>การประยุกต์ใช้งาน:</strong> <textarea v-model="resultsData.apply" class="dotted-textarea" rows="2"></textarea></p>
        </div>
      </div>

      <div class="results-section mt-12">
        <p class="topic-bold-title">7. <u>ปัญหาในการจัดการเรียนรู้ และ แนวทางการแก้ไขและพัฒนา</u></p>
        <div class="text-row-underlined-box mt-4">
          <p><strong>ปัญหาในการจัดการเรียนรู้:</strong> <textarea v-model="resultsData.problem" class="dotted-textarea" rows="2"></textarea></p>
          <p class="mt-4"><strong>แนวทางการแก้ไขและพัฒนา:</strong> <textarea v-model="resultsData.solution" class="dotted-textarea" rows="2"></textarea></p>
        </div>
      </div>

      <div class="signature-layout-grid mt-15">
        <div class="sig-center-block">
          <p>ครูผู้สอน..........................................................</p>
          <p>( <input type="text" v-model="logData.teacher_name" class="inline-clean-input text-center w-180" /> )</p>
          <p>ครูผู้สอน</p>
        </div>
        <div class="sig-center-block">
          <p>ผู้รับรอง..........................................................</p>
          <p>( <input type="text" v-model="logData.supervisor_name" class="inline-clean-input text-center w-180" /> )</p>
          <p>หัวหน้าแผนกวิชา{{ logData.department || '............' }}</p>
        </div>
      </div>

      <div class="official-border-review-box mt-12">
        <div class="review-flex-split">
          <div class="split-col border-right-black">
            <p class="title-underline-bold">บันทึกการตรวจสอบ/คำแนะนำ</p>
            <textarea class="dotted-textarea mt-4" rows="2"></textarea>
            <div class="text-center mt-6" style="font-size:12px;">
              <p>ลงชื่อ.......................................................... ผู้ตรวจสอบ</p>
              <p>( ว่าที่ ร.ต. ชัชวาลย์ ป้อมสุวรรณ )</p>
              <p>หัวหน้างานพัฒนาหลักสูตรและการจัดการเรียนรู้</p>
            </div>
          </div>
          <div class="split-col">
            <p class="title-underline-bold">บันทึกการตรวจสอบ/คำแนะนำ</p>
            <textarea class="dotted-textarea mt-4" rows="2"></textarea>
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
            <label class="custom-cb"><input type="checkbox" checked /> ทราบ/อนุมัติ</label>
            <label class="custom-cb"><input type="checkbox" /> อื่นๆ ................................................................</label>
          </div>
          <div class="text-center mt-6" style="font-size:12px;">
            <p>ลงชื่อ................................................................................ ผู้อำนวยการ</p>
            <p>ผู้อำนวยการวิทยาลัยเทคนิคเลย</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== หน้าที่ 3: หน้าคั่นภาคผนวกกลางเล่ม ==================== -->
    <div class="pdf-page-sheet flex-center-appendix-cover">
      <h1 class="appendix-huge-title">ภาคผนวก</h1>
    </div>

    <!-- ==================== หน้าที่ 4: หลักฐานภาคผนวกหน้าแรก ==================== -->
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
              <input type="text" v-model="img.desc" class="photo-desc-input" />
            </div>
          </div>
        </div>
        <div class="appendix-item-block mt-15">
          <h4 class="evidence-title-head">2. วิธีการให้เนื้อหา</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section2" :key="i">
              <div class="mock-image-view"><span class="mock-photo-icon">📸 รูปถ่ายสาธิตการเรียนการสอน</span></div>
              <input type="text" v-model="img.desc" class="photo-desc-input" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== หน้าที่ 5: หลักฐานภาคผนวกหน้าสุดท้าย ==================== -->
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
              <input type="text" v-model="img.desc" class="photo-desc-input" />
            </div>
          </div>
        </div>
        <div class="appendix-item-block mt-15">
          <h4 class="evidence-title-head">4. โปรแกรม/แอปพลิเคชัน และ 5. การวัดผล</h4>
          <div class="image-double-grid mt-6">
            <div class="photo-card-box" v-for="(img, i) in appendixImages.section4_5" :key="i">
              <div class="mock-image-view"><span class="mock-photo-icon">📸 ระบบ Google Classroom / การให้คะแนน</span></div>
              <input type="text" v-model="img.desc" class="photo-desc-input" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

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
/* 🌐 เลย์เอาต์แผงควบคุมด้านบน */
.control-panel {
  width: 100%;
  max-width: 1200px;
  margin: 10px auto;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f3f4f6;
  border-radius: 6px;
  font-family: 'Sarabun', sans-serif;
  box-sizing: border-box;
}
.back-btn { color: #4b5563; text-decoration: none; font-weight: bold; }
.action-buttons-group { display: flex; gap: 10px; }
.save-data-btn { background: #e67e22; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.print-btn { background: #27ae60; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; }

/* 🖥️ 💻 หน้าจอเว็บปกติ: ปรับให้กางเต็มหน้าจอ (Full Width) ตามบรีฟรูปฝั่งซ้าย */
.document-container {
  width: 100%;
  max-width: 1200px; /* ขยายความกว้างเต็มตาตามแบบฝั่งซ้าย */
  margin: 0 auto;
  padding: 0 15px 40px 15px;
  box-sizing: border-box;
}

.pdf-page-sheet {
  background: #ffffff;
  width: 100%; /* แผ่กว้างเต็มพื้นที่กล่องหุ้มด้านบน */
  min-height: 297mm;
  padding: 8mm 20mm; /* 🎯 แก้ไข: ลด padding ด้านบนสุดเหลือเพียง 8mm ป้องกันปัญหากินหน้าถัดไป */
  box-sizing: border-box;
  font-family: 'Sarabun', sans-serif;
  color: #000000;
  font-size: 14.5px;
  line-height: 1.4;
  border: 1px solid #d3d3d3;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  margin-bottom: 25px;
  text-align: left;
}

/* 🎯 สไตล์การทำย่อหน้าสำหรับกลุ่มกล่องเลือกคำตอบ (Checkbox Indentation) */
.cb-indented-box {
  padding-left: 28px; /* 🎯 สั่งขยับย่อหน้าเยื้องเข้าด้านในตามตัวอย่างรูปภาพ image_083da9.png */
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* ส่วนหัวข้อและจัดเรียงเนื้อหาทั่วไป */
.official-header-layout { text-align: center; margin-bottom: 8px; }
.form-main-title { font-size: 15px; font-weight: bold; margin-bottom: 10px; }
.header-inline-group { display: flex; justify-content: flex-start; gap: 8px; width: 100%; }

.dotted-input {
  border: none;
  border-bottom: 1px dotted #000000;
  background: transparent;
  padding: 0 4px;
  font-family: 'Sarabun', sans-serif;
  font-size: 14.5px;
}
.dotted-input:focus { outline: none; border-bottom-style: solid; }
.flex-grow { flex-grow: 1; }
.w-60 { width: 60px; } .w-80 { width: 80px; } .w-150 { width: 150px; } 
.w-180 { width: 180px; } .w-200 { width: 200px; } .w-220 { width: 220px; } .w-250 { width: 250px; }
.text-center { text-align: center; }
.ml-5 { margin-left: 5px; }

/* จัดแต่งองค์ประกอบตาราง */
.main-report-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.main-report-table th, .main-report-table td { border: 1px solid #000000; padding: 4px; font-size: 13.5px; }
.main-report-table th { font-weight: bold; text-align: center; background: #fafafa; }
.table-cell-input { width: 100%; border: none; background: transparent; font-family: 'Sarabun', sans-serif; font-size: 13.5px; }
.table-cell-input:focus { outline: none; }

.w-45p { width: 45%; } .w-35p { width: 35%; } .w-20p { width: 20%; }
.w-15p { width: 15%; } .w-11p { width: 11%; } .w-13p { width: 13%; }

.section-main-heading { font-size: 14.5px; font-weight: bold; text-align: center; margin-bottom: 4px; }
.topic-bold-title { font-weight: bold; }
.cb-inline-row { display: flex; align-items: center; }

/* แบ่งคอลัมน์ของช่อง Checkbox ภายในย่อหน้า */
.cb-grid-layout-2 {
  display: grid;
  grid-template-cols: repeat(2, 1fr);
  gap: 4px;
}
.grid-span-2 { grid-column: span 2; }
.custom-cb { display: flex; align-items: center; gap: 8px; font-size: 13.5px; cursor: pointer; }

.text-row-underlined-box { font-size: 13.5px; }
.dotted-textarea {
  width: 100%; border: 1px solid #9ca3af; border-radius: 4px; padding: 4px;
  font-size: 13.5px; font-family: 'Sarabun', sans-serif; line-height: 1.3; resize: none;
}

.signature-layout-grid { display: grid; grid-template-cols: 1fr 1fr; text-align: center; font-size: 13.5px; margin-top: 10px; }
.sig-center-block { line-height: 1.8; }
.inline-clean-input { border: none; border-bottom: 1px solid #000; background: transparent; font-family: 'Sarabun', sans-serif; font-size: 13.5px; }

.official-border-review-box { border: 1px solid #000000; font-size: 12.5px; }
.review-flex-split { display: flex; }
.split-col { flex: 1; padding: 6px; line-height: 1.5; }
.border-right-black { border-right: 1px solid #000000; }
.border-top-black { border-top: 1px solid #000000; }
.title-underline-bold { font-weight: bold; text-decoration: underline; }
.director-full-row-block { padding: 6px; text-align: center; line-height: 1.5; }

.flex-center-appendix-cover { display: flex; align-items: center; justify-content: center; height: 297mm; }
.appendix-huge-title { font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 3px; }

.appendix-header-layout { border-bottom: 1px dashed #000; padding-bottom: 5px; text-align: center; }
.appendix-main-header { font-size: 15px; font-weight: bold; margin: 0; }
.appendix-sub-meta { display: flex; justify-content: space-between; font-size: 12.5px; }
.evidence-title-head { font-size: 13.5px; font-weight: bold; text-decoration: underline; }
.image-double-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 12px; }
.photo-card-box { border: 1px solid #ccc; padding: 8px; background: #fff; }
.mock-image-view { width: 100%; height: 145px; background: #f3f4f6; border: 1px dashed #9ca3af; display: flex; align-items: center; justify-content: center; }
.mock-photo-icon { font-size: 11px; color: #6b7280; font-style: italic; text-align: center; }
.photo-desc-input { width: 100%; border: none; border-bottom: 1px solid #777; margin-top: 4px; font-size: 12.5px; text-align: center; font-family: 'Sarabun', sans-serif; }

.mt-4 { margin-top: 4px; }
.mt-6 { margin-top: 6px; }
.mt-12 { margin-top: 12px; }
.mt-15 { margin-top: 15px; }

/* =================================================== */
/* 🖨️ CSS PRINT CONTROL: บังคับตัดและล็อกความกว้างตอนสั่งพิมพ์เล่มเด็ดขาด */
/* =================================================== */
@media print {
  @page { size: A4 portrait; margin: 0; }
  body { background: #ffffff; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print-hidden { display: none !important; }
  
  /* บังคับสเกลให้กลับมาที่ความกว้างมาตรฐานกระดาษ A4 วิ่งตรงเข้าเครื่องพิมพ์ */
  .document-container { width: 210mm !important; margin: 0 !important; padding: 0 !important; }
  
  .pdf-page-sheet {
    width: 210mm !important;
    min-height: 297mm !important;
    padding: 8mm 15mm 12mm 15mm !important; /* บีบระยะขอบบน-ล่างให้กระชับ เพื่อรวบรวมหน้าได้ครบ 5 แผ่นพอดี */
    border: none !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    page-break-after: always !important;
    break-after: page !important;
  }
  
  .flex-center-appendix-cover {
    page-break-before: always !important;
    break-before: page !important;
    height: 297mm !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}
</style>