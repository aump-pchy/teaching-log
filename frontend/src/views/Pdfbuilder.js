// ============================================
// pdfBuilder.js
// สร้าง PDF บันทึกการจัดการเรียนรู้ด้วย jsPDF วาด text จริง
// (ไม่ใช้ html2canvas เลย — แก้ปัญหาฟอนต์ไทยเบลอ/ซ้อนกันแบบเด็ดขาด
//  เพราะ jsPDF วาดตัวอักษรเป็น vector text จริง ไม่ใช่การแปลงภาพหน้าจอ)
// ============================================
import jsPDF from 'jspdf'
import { SARABUN_REGULAR_BASE64, SARABUN_BOLD_BASE64 } from './sarabunFont.js'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN_L = 15
const MARGIN_R = 15
const MARGIN_T = 10
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

function setupFonts(pdf) {
  pdf.addFileToVFS('Sarabun-Regular.ttf', SARABUN_REGULAR_BASE64)
  pdf.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal')
  pdf.addFileToVFS('Sarabun-Bold.ttf', SARABUN_BOLD_BASE64)
  pdf.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold')
  pdf.setFont('Sarabun', 'normal')
}

// ── helper: เส้นประใต้ค่าที่กรอก (จำลอง dotted-input) ──
function dottedField(pdf, label, value, x, y, lineWidth, fontSize = 10.5) {
  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(fontSize)
  const labelW = pdf.getTextWidth(label + ' ')
  pdf.text(label, x, y)

  const lineStartX = x + labelW
  const lineEndX = x + lineWidth
  // เส้นประ
  pdf.setLineDashPattern([0.5, 0.7], 0)
  pdf.setDrawColor(0, 0, 0)
  pdf.line(lineStartX, y + 1, lineEndX, y + 1)
  pdf.setLineDashPattern([], 0)

  // ค่า
  if (value) {
    pdf.text(String(value), lineStartX + 1.5, y)
  }
  return lineEndX
}

// ── helper: checkbox + label ──
function checkbox(pdf, x, y, checked, label, fontSize = 10) {
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.25)
  pdf.rect(x, y - 3, 3.2, 3.2)
  if (checked) {
    pdf.setLineWidth(0.4)
    pdf.line(x + 0.5, y - 1.5, x + 1.3, y - 0.4)
    pdf.line(x + 1.3, y - 0.4, x + 2.7, y - 2.8)
  }
  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(fontSize)
  pdf.text(label, x + 4.5, y)
}

// ── helper: ขึ้นหน้าใหม่ ──
function newPage(pdf) {
  pdf.addPage()
  pdf.setFont('Sarabun', 'normal')
}

// ── helper: wrap ข้อความยาวให้พอดีความกว้าง ──
function wrapText(pdf, text, maxWidth, fontSize) {
  pdf.setFontSize(fontSize)
  return pdf.splitTextToSize(text || '', maxWidth)
}

// ════════════════════════════════════════════
// หน้า 1: ข้อมูลทั่วไป + ตารางการสอน + รูปแบบ/วิธีการ/สื่อ
// ════════════════════════════════════════════
function drawPage1(pdf, logData, methodsData) {
  let y = MARGIN_T + 5
console.log('logData:', logData)
  // หัวเรื่อง
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(13)
  const title = `แบบบันทึกการจัดการเรียนการสอนสำหรับรายวิชาในสถานประกอบการ ภาคเรียนที่ ${logData.semester}/${logData.academic_year}`
  const titleLines = pdf.splitTextToSize(title, CONTENT_W)
  titleLines.forEach((line, i) => {
    const w = pdf.getTextWidth(line)
    const x = (PAGE_W - w) / 2
    pdf.text(line, x, y)
    pdf.setLineWidth(0.2)
    pdf.line(x, y + 0.8, x + w, y + 0.8)
    y += 5.5
  })
  y += 2

  // แถวข้อมูล
  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(10.5)
  dottedField(pdf, 'ครูผู้สอน', logData.teacher_name, MARGIN_L, y, 75)
  dottedField(pdf, 'แผนกวิชา', logData.department, MARGIN_L + 80, y, CONTENT_W - 80)
  y += 6.5

  dottedField(pdf, 'สัปดาห์ที่', logData.week, MARGIN_L, y, 18)
  dottedField(pdf, 'ระหว่างวันที่', logData.date_from_full, MARGIN_L + 22, y, 75)
  dottedField(pdf, 'ถึง', logData.date_to_full, MARGIN_L + 100, y, CONTENT_W - 100)
  y += 6.5

  dottedField(pdf, 'ชื่อวิชา', logData.subject_name, MARGIN_L, y, 95)
  dottedField(pdf, 'รหัสวิชา', logData.subject_code, MARGIN_L + 100, y, CONTENT_W - 100)
  y += 6.5

  dottedField(pdf, 'เรื่อง/หัวข้อที่สอน', logData.topic, MARGIN_L, y, CONTENT_W)
  y += 8

  // ตารางการสอน
  const colW = [22, 18, 24, 17, 17, 17, CONTENT_W - 22 - 18 - 24 - 17 - 17 - 17]
  const colX = [MARGIN_L]
  for (let i = 0; i < colW.length; i++) colX.push(colX[i] + colW[i])

  const headerH1 = 5.5
  const headerH2 = 5.5
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(9)
  pdf.setLineWidth(0.25)

  // หัวตารางแถวบน (merge cells)
  pdf.rect(colX[0], y, colW[0] + colW[1] + colW[2], headerH1)
  centerText(pdf, 'วัน/เวลาดำเนินการจัดการเรียนรู้', colX[0], colX[0] + colW[0] + colW[1] + colW[2], y + 3.8)
  pdf.rect(colX[3], y, colW[3] + colW[4] + colW[5], headerH1)
  centerText(pdf, 'จำนวนนักเรียน นักศึกษา', colX[3], colX[3] + colW[3] + colW[4] + colW[5], y + 3.8)
  pdf.rect(colX[6], y, colW[6], headerH1 + headerH2)
  centerTextMultiline(pdf, ['ปัญหาและข้อเสนอ', 'แนะ'], colX[6], colX[6] + colW[6], y + 4, 3.6)

  y += headerH1

  const headers2 = ['วันที่สอน', 'คาบที่', 'เวลาที่สอน', 'ทั้งหมด', 'เข้าเรียน', 'ร้อยละ']
  for (let i = 0; i < 6; i++) {
    pdf.rect(colX[i], y, colW[i], headerH2)
    centerText(pdf, headers2[i], colX[i], colX[i] + colW[i], y + 3.8)
  }
  y += headerH2

  // แถวข้อมูล
  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(8.5)
  const rowH = 6
  const rows = logData.attendance_rows || []
  for (let r = 0; r < 6; r++) {
    const row = rows[r] || {}
    const vals = [row.date, row.period, row.time_range, row.total, row.present, row.percentage]
    for (let i = 0; i < 6; i++) {
      pdf.rect(colX[i], y, colW[i], rowH)
      if (vals[i]) centerText(pdf, String(vals[i]), colX[i], colX[i] + colW[i], y + 4)
    }
    pdf.rect(colX[6], y, colW[6], rowH)
    if (row.remark) {
      const lines = pdf.splitTextToSize(row.remark, colW[6] - 2)
      pdf.text(lines[0] || '', colX[6] + 1, y + 4)
    }
    y += rowH
  }
  y += 6

  // รายละเอียดวิธีการจัดการเรียนรู้
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(11)
  const headTitle = 'รายละเอียดวิธีการจัดการเรียนรู้'
  const headW = pdf.getTextWidth(headTitle)
  pdf.text(headTitle, (PAGE_W - headW) / 2, y)
  pdf.setLineWidth(0.2)
  pdf.line((PAGE_W - headW) / 2, y + 0.8, (PAGE_W + headW) / 2, y + 0.8)
  y += 6

  // ข้อ 1: รูปแบบการจัดการเรียนรู้
  y = sectionTitle(pdf, '1. รูปแบบการจัดการเรียนรู้ (แนบภาคผนวก)', MARGIN_L, y)
  const indent = MARGIN_L + 6
  checkbox(pdf, indent, y, methodsData.format_onsite, 'การเรียนการสอนรูปแบบปกติ (On-Site)'); y += 5
  checkbox(pdf, indent, y, methodsData.format_onair, 'การเรียนการสอนโดย ผ่าน DLTV ผ่านทาง Digital TV (On-Air)'); y += 5
  checkbox(pdf, indent, y, methodsData.format_online, 'การเรียนการสอนผ่านอินเตอร์เน็ต (On-Line)'); y += 5
  checkbox(pdf, indent, y, methodsData.format_ondemand, 'การเรียนการสอนผ่านแอพพลิเคชั่น (On-Demand)'); y += 5
  checkbox(pdf, indent, y, methodsData.format_onhand, 'การเรียนการสอนโดยผ่านหนังสือเรียน แบบฝึกหัด ใบงาน (On-Hand)'); y += 5
  checkbox(pdf, indent, y, methodsData.format_other, 'อื่นๆ'); 
  dottedField(pdf, '', methodsData.format_other_detail, indent + 12, y, CONTENT_W - 12 - (indent - MARGIN_L), 9)
  y += 7

  // ข้อ 2: วิธีการให้เนื้อหา
  y = sectionTitle(pdf, '2. วิธีการให้เนื้อหา (แนบภาคผนวก)', MARGIN_L, y)
  const m2 = [
    ['method_lecture', 'บรรยาย'], ['method_demo', 'สาธิต'], ['method_experiment', 'ทดลอง'],
    ['method_simulation', 'สถานการณ์จำลอง'], ['method_discussion', 'อภิปรายกลุ่มย่อย'], ['method_case', 'กรณีศึกษา'],
    ['method_center', 'ศูนย์การเรียน'], ['method_game', 'เกมส์'], ['method_pjbl', 'PjBL'], ['method_stem', 'STEM']
  ]
  m2.forEach(([key, label]) => { checkbox(pdf, indent, y, methodsData[key], label); y += 5 })
  checkbox(pdf, indent, y, methodsData.method_other, 'อื่น ๆ')
  dottedField(pdf, '', methodsData.method_other_detail, indent + 12, y, CONTENT_W - 12 - (indent - MARGIN_L), 9)
  y += 7

  // ข้อ 3: สื่อที่ใช้
  y = sectionTitle(pdf, '3. สื่อที่ใช้/แหล่งเรียนรู้ (แนบภาคผนวก)', MARGIN_L, y)
  const m3 = [
    ['media_ppt', 'Power Point'], ['media_doc', 'เอกสารประกอบการสอน'], ['media_book', 'หนังสือ'],
    ['media_real', 'หุ่นจำลอง/ของจริง'], ['media_ebook', 'E-Book'], ['media_worksheet', 'ใบงาน/ใบความรู้']
  ]
  m3.forEach(([key, label]) => { checkbox(pdf, indent, y, methodsData[key], label); y += 5 })
  checkbox(pdf, indent, y, methodsData.media_other, 'อื่น ๆ')
  dottedField(pdf, '', methodsData.media_other_detail, indent + 12, y, CONTENT_W - 12 - (indent - MARGIN_L), 9)
}

// ════════════════════════════════════════════
// หน้า 2: โปรแกรม/แอป + การวัดผล + ผลการเรียนรู้ + ปัญหา + ลายเซ็น
// ════════════════════════════════════════════
function drawPage2(pdf, logData, methodsData, resultsData) {
  let y = MARGIN_T + 5
  const indent = MARGIN_L + 6

  y = sectionTitle(pdf, '4. โปรแกรม / E-learning / Application ที่ใช้ในการจัดการเรียนการสอน (แนบภาคผนวก)', MARGIN_L, y)
  const m4 = [
    ['app_classroom', 'Google Classroom'], ['app_meet', 'Google Meet'], ['app_zoom', 'Zoom'],
    ['app_line', 'Line'], ['app_facebook', 'Facebook'], ['app_youtube', 'YouTube']
  ]
  m4.forEach(([key, label]) => { checkbox(pdf, indent, y, methodsData[key], label); y += 5 })
  checkbox(pdf, indent, y, methodsData.app_other, 'อื่น ๆ')
  dottedField(pdf, '', methodsData.app_other_detail, indent + 12, y, CONTENT_W - 12 - (indent - MARGIN_L), 9)
  y += 8

  y = sectionTitle(pdf, '5. การวัดผลและประเมินผลการเรียนรู้ (แนบภาคผนวก)', MARGIN_L, y)
  const m5 = [
    ['eval_observe', 'การสังเกต'], ['eval_test', 'การทดสอบ'],
    ['eval_work', 'การตรวจชิ้นงาน'], ['eval_exercise', 'แบบฝึกหัดท้ายหน่วย']
  ]
  m5.forEach(([key, label]) => { checkbox(pdf, indent, y, methodsData[key], label); y += 5 })
  checkbox(pdf, indent, y, methodsData.eval_other, 'อื่น ๆ')
  dottedField(pdf, '', methodsData.eval_other_detail, indent + 12, y, CONTENT_W - 12 - (indent - MARGIN_L), 9)
  y += 9

  // ข้อ 6: ผลการจัดการเรียนรู้
  y = sectionTitle(pdf, '6. ผลการจัดการเรียนรู้ (ตามสมรรถนะที่พึงประสงค์)', MARGIN_L, y)
  y = labeledTextBox(pdf, 'พุทธิพิสัย:', resultsData.knowledge, MARGIN_L, y)
  y = labeledTextBox(pdf, 'ทักษะพิสัย:', resultsData.skill, MARGIN_L, y)
  y = labeledTextBox(pdf, 'จิตพิสัย:', resultsData.attitude, MARGIN_L, y)
  y = labeledTextBox(pdf, 'การประยุกต์ใช้งาน:', resultsData.apply, MARGIN_L, y)
  y += 3

  // ข้อ 7: ปัญหา
  y = sectionTitle(pdf, '7. ปัญหาในการจัดการเรียนรู้ และ แนวทางการแก้ไขและพัฒนา', MARGIN_L, y)
  y = labeledTextBox(pdf, 'ปัญหาในการจัดการเรียนรู้:', resultsData.problem, MARGIN_L, y)
  y = labeledTextBox(pdf, 'แนวทางการแก้ไขและพัฒนา:', resultsData.solution, MARGIN_L, y)
  y += 8

  // ลายเซ็น
  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(10.5)
  const colCenter1 = MARGIN_L + CONTENT_W * 0.25
  const colCenter2 = MARGIN_L + CONTENT_W * 0.75

  centerTextAt(pdf, 'ครูผู้สอน..........................................................', colCenter1, y)
  centerTextAt(pdf, 'ผู้รับรอง..........................................................', colCenter2, y)
  y += 5.5
  centerTextAt(pdf, `( ${logData.teacher_name || '...........................'} )`, colCenter1, y)
  centerTextAt(pdf, `( ${logData.supervisor_name || '...........................'} )`, colCenter2, y)
  y += 5.5
  centerTextAt(pdf, 'ครูผู้สอน', colCenter1, y)
  centerTextAt(pdf, `หัวหน้าแผนกวิชา${logData.department || '............'}`, colCenter2, y)
}

// ════════════════════════════════════════════
// หน้า 3: ตารางบันทึกการตรวจสอบ
// ════════════════════════════════════════════
function drawPage3(pdf) {
  let y = MARGIN_T + 8
  const colW = CONTENT_W / 2

  pdf.setLineWidth(0.3)
  const boxTop = y
  pdf.rect(MARGIN_L, boxTop, CONTENT_W, 55)
  pdf.line(MARGIN_L + colW, boxTop, MARGIN_L + colW, boxTop + 55)

  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(10.5)
  pdf.text('บันทึกการตรวจสอบ/คำแนะนำ', MARGIN_L + 3, y + 5)
  pdf.text('บันทึกการตรวจสอบ/คำแนะนำ', MARGIN_L + colW + 3, y + 5)
  pdf.setLineWidth(0.2)
  pdf.line(MARGIN_L + 3, y + 5.6, MARGIN_L + 3 + pdf.getTextWidth('บันทึกการตรวจสอบ/คำแนะนำ'), y + 5.6)
  pdf.line(MARGIN_L + colW + 3, y + 5.6, MARGIN_L + colW + 3 + pdf.getTextWidth('บันทึกการตรวจสอบ/คำแนะนำ'), y + 5.6)

  pdf.setLineWidth(0.2)
  pdf.rect(MARGIN_L + 3, y + 8, colW - 6, 14)
  pdf.rect(MARGIN_L + colW + 3, y + 8, colW - 6, 14)

  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(9)
  let sigY = y + 26
  centerTextAt(pdf, 'ลงชื่อ.......................................................... ผู้ตรวจสอบ', MARGIN_L + colW / 2, sigY)
  centerTextAt(pdf, 'ลงชื่อ.......................................................... ผู้รับรอง', MARGIN_L + colW + colW / 2, sigY)
  sigY += 4.5
  centerTextAt(pdf, '( ว่าที่ ร.ต. ชัชวาลย์ ป้อมสุวรรณ )', MARGIN_L + colW / 2, sigY)
  centerTextAt(pdf, '( นายวิโรจน์ ยาบุษดี )', MARGIN_L + colW + colW / 2, sigY)
  sigY += 4.5
  centerTextAt(pdf, 'หัวหน้างานพัฒนาหลักสูตรและการจัดการเรียนรู้', MARGIN_L + colW / 2, sigY)
  centerTextAt(pdf, 'รองผู้อำนวยการฝ่ายวิชาการ', MARGIN_L + colW + colW / 2, sigY)

  y = boxTop + 55
  pdf.setLineWidth(0.3)
  pdf.rect(MARGIN_L, y, CONTENT_W, 32)
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(10.5)
  centerTextAt(pdf, 'บันทึกการอนุมัติจากผู้อำนวยการวิทยาลัย', PAGE_W / 2, y + 5)
  pdf.setLineWidth(0.2)
  const t = 'บันทึกการอนุมัติจากผู้อำนวยการวิทยาลัย'
  const tw = pdf.getTextWidth(t)
  pdf.line((PAGE_W - tw) / 2, y + 5.6, (PAGE_W + tw) / 2, y + 5.6)

  checkbox(pdf, PAGE_W / 2 - 35, y + 12, true, 'ทราบ/อนุมัติ', 9.5)
  checkbox(pdf, PAGE_W / 2 + 5, y + 12, false, 'อื่นๆ ................................................................', 9.5)

  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(9)
  centerTextAt(pdf, 'ลงชื่อ................................................................................ ผู้อำนวยการ', PAGE_W / 2, y + 20)
  centerTextAt(pdf, 'ผู้อำนวยการวิทยาลัยเทคนิคเลย', PAGE_W / 2, y + 24.5)
}

// ════════════════════════════════════════════
// หน้า 4: หน้าคั่นภาคผนวก
// ════════════════════════════════════════════
function drawPage4(pdf) {
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(32)
  const t = 'ภาคผนวก'
  const w = pdf.getTextWidth(t)
  pdf.text(t, (PAGE_W - w) / 2, PAGE_H / 2, { charSpace: 1.2 })
}

// ════════════════════════════════════════════
// หน้า 5-6: หลักฐานรูปภาพ (ดึงจากฐานข้อมูลจริง)
// ════════════════════════════════════════════
async function drawAppendixPage(pdf, logData, sectionsInPage, appendixImages) {
  let y = MARGIN_T + 3
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(11.5)
  const title = sectionsInPage.title
  centerTextAt(pdf, title, PAGE_W / 2, y)
  y += 4

  if (sectionsInPage.showMeta) {
    pdf.setFont('Sarabun', 'normal')
    pdf.setFontSize(9)
    pdf.text(`หัวข้อที่สอน: ${logData.topic || '-'}`, MARGIN_L, y)
    pdf.text(`สัปดาห์ที่: ${logData.week || '-'}`, PAGE_W - MARGIN_R - 30, y)
  }
  pdf.setLineWidth(0.2)
  pdf.setLineDashPattern([1, 1], 0)
  pdf.line(MARGIN_L, y + 2, PAGE_W - MARGIN_R, y + 2)
  pdf.setLineDashPattern([], 0)
  y += 8

  const imgBoxW = (CONTENT_W - 6) / 2
  const imgBoxH = 60

  for (const block of sectionsInPage.blocks) {
    pdf.setFont('Sarabun', 'bold')
    pdf.setFontSize(10)
    pdf.text(block.heading, MARGIN_L, y)
    pdf.setLineWidth(0.2)
    pdf.line(MARGIN_L, y + 0.7, MARGIN_L + pdf.getTextWidth(block.heading), y + 0.7)
    y += 5

    const images = block.images || []
    for (let col = 0; col < 2; col++) {
      const img = images[col]
      const x = MARGIN_L + col * (imgBoxW + 6)
      pdf.setDrawColor(180, 180, 180)
      pdf.setLineWidth(0.2)
      pdf.rect(x, y, imgBoxW, imgBoxH)

      if (img && img.url) {
        try {
          const imgData = await loadImageAsDataURL(img.url)
          if (imgData) {
            pdf.addImage(imgData, 'JPEG', x + 1, y + 1, imgBoxW - 2, imgBoxH - 2)
          }
        } catch (e) {
          drawNoImagePlaceholder(pdf, x, y, imgBoxW, imgBoxH)
        }
      } else {
        drawNoImagePlaceholder(pdf, x, y, imgBoxW, imgBoxH)
      }

      // คำอธิบายใต้รูป
      pdf.setFont('Sarabun', 'normal')
      pdf.setFontSize(8.5)
      const desc = (img && img.desc) ? img.desc : '-'
      centerTextAt(pdf, desc, x + imgBoxW / 2, y + imgBoxH + 4)
    }
    y += imgBoxH + 10
  }
}

function drawNoImagePlaceholder(pdf, x, y, w, h) {
  pdf.setFillColor(245, 245, 245)
  pdf.rect(x, y, w, h, 'F')
  pdf.setFont('Sarabun', 'normal')
  pdf.setFontSize(8.5)
  pdf.setTextColor(120, 120, 120)
  centerTextAt(pdf, 'ไม่มีรูปภาพในระบบ', x + w / 2, y + h / 2)
  pdf.setTextColor(0, 0, 0)
}

// โหลดรูปจาก URL (Supabase signed URL) แปลงเป็น dataURL เพื่อฝังใน PDF
function loadImageAsDataURL(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (e) {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// ── helpers สำหรับจัดข้อความ ──
function centerText(pdf, text, xStart, xEnd, y) {
  const w = pdf.getTextWidth(text)
  pdf.text(text, xStart + ((xEnd - xStart) - w) / 2, y)
}
function centerTextAt(pdf, text, centerX, y) {
  const w = pdf.getTextWidth(text)
  pdf.text(text, centerX - w / 2, y)
}
function centerTextMultiline(pdf, lines, xStart, xEnd, yStart, lineH) {
  lines.forEach((line, i) => centerText(pdf, line, xStart, xEnd, yStart + i * lineH))
}
function sectionTitle(pdf, text, x, y) {
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(10.5)
  pdf.text(text, x, y)
  return y + 5.5
}
function labeledTextBox(pdf, label, value, x, y) {
  pdf.setFont('Sarabun', 'bold')
  pdf.setFontSize(10)
  pdf.text(label, x, y)
  const labelW = pdf.getTextWidth(label + ' ')
  pdf.setFont('Sarabun', 'normal')
  const lines = wrapText(pdf, value || '-', CONTENT_W - labelW - 2, 10)
  pdf.text(lines, x + labelW + 1, y)
  // เส้นประใต้แทนกรอบ
  pdf.setLineWidth(0.2)
  pdf.setLineDashPattern([0.5, 0.7], 0)
  pdf.setDrawColor(0, 0, 0)
  pdf.line(x, y + 1.5, x + CONTENT_W, y + 1.5)
  pdf.setLineDashPattern([], 0)
  return y + Math.max(7, lines.length * 4.2 + 2) + 2
}

// ════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ════════════════════════════════════════════
export async function buildLogPDF({ logData, methodsData, resultsData, appendixImages }) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  setupFonts(pdf)

  // หน้า 1
  drawPage1(pdf, logData, methodsData)

  // หน้า 2
  newPage(pdf)
  drawPage2(pdf, logData, methodsData, resultsData)

  // หน้า 3
  newPage(pdf)
  drawPage3(pdf)

  // หน้า 4 — คั่นภาคผนวก
  newPage(pdf)
  drawPage4(pdf)

  // หน้า 5 — ภาคผนวก ข้อ 1-2
  newPage(pdf)
  await drawAppendixPage(pdf, logData, {
    title: 'หลักฐานการจัดการเรียนรู้ วิชาในสถานประกอบการ',
    showMeta: true,
    blocks: [
      { heading: '1. รูปแบบการจัดการเรียนรู้', images: appendixImages.section1 },
      { heading: '2. วิธีการให้เนื้อหา', images: appendixImages.section2 }
    ]
  }, appendixImages)

  // หน้า 6 — ภาคผนวก ข้อ 3-5
  newPage(pdf)
  await drawAppendixPage(pdf, logData, {
    title: 'หลักฐานการจัดการเรียนรู้ วิชาในสถานประกอบการ (ต่อ)',
    showMeta: false,
    blocks: [
      { heading: '3. สื่อที่ใช้/แหล่งเรียนรู้', images: appendixImages.section3 },
      { heading: '4. โปรแกรม/แอปพลิเคชัน และ 5. การวัดผล', images: appendixImages.section4_5 }
    ]
  }, appendixImages)

  return pdf
}