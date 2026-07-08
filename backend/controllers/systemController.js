// backend/controllers/systemController.js
const supabase = require('../db/supabase')

// ==========================================
// ZONEที่ 1: จัดการรายนามผู้บริหารปัจจุบัน (ตาราง system_settings)
// ==========================================

// 📥 ดึงข้อมูลรายนามผู้บริหารปัจจุบัน (GET /api/system/settings/executives)
exports.getExecutives = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('head_curriculum, deputy_academic, director')
      .eq('id', 1)
      .single()

    if (error) throw error
    return res.json({ success: true, data: data })
  } catch (error) {
    console.error('Error fetching executives:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลผู้บริหารล้มเหลว' })
  }
}

// 💾 อัปเดตรายนามผู้บริหารปัจจุบัน (POST /api/system/settings/executives)
exports.updateExecutives = async (req, res) => {
  const { head_curriculum, deputy_academic, director } = req.body
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .update({ head_curriculum, deputy_academic, director })
      .eq('id', 1)
      .select()

    if (error) throw error
    return res.json({ success: true, message: 'อัปเดตข้อมูลผู้บริหารสำเร็จ' })
  } catch (error) {
    console.error('Error updating executives:', error)
    return res.status(500).json({ message: 'บันทึกข้อมูลผู้บริหารล้มเหลว' })
  }
}

// ==========================================
// ZONEที่ 2: จัดการเปิดภาคเรียนใหม่ (ตาราง academic_terms สะสมประวัติ)
// ==========================================

// 📥 ดึงประวัติภาคเรียนทั้งหมด (GET /api/system/settings/terms)
exports.getTerms = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('academic_terms')
      .select('*')
      .order('academic_year', { ascending: true })

    if (error) throw error
    return res.json({ success: true, data: data })
  } catch (error) {
    console.error('Error fetching terms:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลภาคเรียนล้มเหลว' })
  }
}

// 💾 เปิดภาคเรียนใหม่แบบเพิ่มแถว (POST /api/system/settings/terms)
exports.addTerm = async (req, res) => {
  const { current_semester, academic_year } = req.body

  if (!current_semester || !academic_year) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุภาคเรียนและปีการศึกษาให้ครบถ้วน' })
  }

  try {
    // ดักเช็กค่าซ้ำก่อนเพิ่มลงฐานข้อมูล
    // 🟢 [แก้ไข] เดิมโค้ดไม่เช็ก error ของคำสั่งนี้เลย ถ้า query พังจริงๆ (เช่น type ไม่ตรง)
    // มันจะเงียบแล้วปล่อยผ่านไป insert ต่อ ทำให้ debug ยากและ error message ที่เห็นไม่ตรงสาเหตุจริง
    const { data: existing, error: existingError } = await supabase
      .from('academic_terms')
      .select('*')
      .eq('term', current_semester)
      .eq('academic_year', academic_year)

    if (existingError) throw existingError

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'ภาคเรียนและปีการศึกษานี้มีในระบบแล้วค่ะ!' })
    }

    // Insert แถวใหม่ สวยๆ สะสมแต้ม (เก็บประวัติ)
    const { data, error } = await supabase
      .from('academic_terms')
      .insert([{ term: current_semester, academic_year: academic_year }])
      .select()

    if (error) throw error

    // 🟢 [แก้ไข] จุดสำคัญที่ขาดไป: ตอนเปิดภาคเรียนใหม่ ต้องอัปเดต "ภาคเรียนปัจจุบัน" ใน
    // system_settings (id = 1) ด้วย ไม่งั้น createLog() จะยังฝัง semester เดิมซ้ำๆ ลงบันทึกใหม่
    // ตลอดไป เพราะมันอ่านค่าจาก system_settings เท่านั้น -> ตัวเลือกภาคเรียนใน LogList เลยไม่ขยับ
    const { error: settingsError } = await supabase
      .from('system_settings')
      .update({ term: current_semester, academic_year: academic_year })
      .eq('id', 1)

    if (settingsError) throw settingsError

    return res.json({ success: true, message: 'เปิดภาคเรียนใหม่สำเร็จ', data: data })
  } catch (error) {
    console.error('Error adding term:', error)
    return res.status(500).json({ success: false, message: 'เปิดภาคเรียนใหม่ล้มเหลว: ' + error.message })
  }
}