const pool = require('../db/pool')

// ==========================================
// ZONEที่ 1: จัดการรายนามผู้บริหารปัจจุบัน + ข้อมูลระบบกลางทั้งก้อน
// ==========================================

// 📥 ดึงข้อมูลระบบกลางทั้งหมด (GET /api/system/settings) — ใช้โดย LogListView/LogDetailView
exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings WHERE id = 1')
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลระบบกลาง' })
    }
    return res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลระบบกลางล้มเหลว' })
  }
}

// 📥 ดึงข้อมูลรายนามผู้บริหารปัจจุบัน (GET /api/system/settings/executives)
// 🟢 [แก้ไข] เดิมชื่อฟังก์ชันนี้ไม่ตรงกับที่ systemRoutes.js เรียกใช้เลย (route เรียก getExecutives
// แต่ไฟล์นี้เคย export แค่ getSettings) ทำให้ Express ได้ callback เป็น undefined แล้ว crash ทันทีตอน start
exports.getExecutives = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT head_curriculum, deputy_academic, director FROM system_settings WHERE id = 1'
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้บริหาร' })
    }
    return res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching executives:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลผู้บริหารล้มเหลว' })
  }
}

// 💾 อัปเดตรายนามผู้บริหารปัจจุบัน (POST /api/system/settings/executives)
// 🟢 [แก้ไข] เดิมฟังก์ชันนี้ (updateSettings) UPDATE ทั้ง 5 ฟิลด์ทุกครั้ง รวม term/academic_year
// ด้วย ถ้าฟอร์ม "จัดการผู้บริหาร" ส่งมาแค่ head_curriculum/deputy_academic/director (ไม่ส่ง
// term/academic_year มา) จะเผลอเซ็ต term/academic_year เป็น NULL ทับของเดิมทันที — แยกฟังก์ชัน
// นี้ให้อัปเดตเฉพาะฟิลด์ผู้บริหารเท่านั้น ไม่ไปแตะภาคเรียน/ปีการศึกษาเด็ดขาด
exports.updateExecutives = async (req, res) => {
  const { head_curriculum, deputy_academic, director } = req.body
  try {
    await pool.query(
      `UPDATE system_settings SET head_curriculum = $1, deputy_academic = $2, director = $3 WHERE id = 1`,
      [head_curriculum, deputy_academic, director]
    )
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
// 🟢 [แก้ไข] เดิมยังเป็นโค้ด Supabase (supabase.from(...)) ทั้งที่ไฟล์นี้ไม่มี supabase ให้เรียก
// ใช้แล้ว (มีแค่ pool) เรียกใช้งานจริงจะพังทันทีด้วย ReferenceError แปลงเป็น pool.query แทน
exports.getTerms = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM academic_terms ORDER BY academic_year ASC, term ASC'
    )
    return res.json({ success: true, data: result.rows })
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
    const existing = await pool.query(
      'SELECT id FROM academic_terms WHERE term = $1 AND academic_year = $2',
      [current_semester, academic_year]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'ภาคเรียนและปีการศึกษานี้มีในระบบแล้วค่ะ!' })
    }

    // Insert แถวใหม่ สวยๆ สะสมแต้ม (เก็บประวัติ)
    const insertResult = await pool.query(
      'INSERT INTO academic_terms (term, academic_year) VALUES ($1, $2) RETURNING *',
      [current_semester, academic_year]
    )

    // 🟢 จุดสำคัญ: ตอนเปิดภาคเรียนใหม่ ต้องอัปเดต "ภาคเรียนปัจจุบัน" ใน system_settings (id = 1)
    // ด้วย ไม่งั้น createLog() จะยังฝัง semester เดิมซ้ำๆ ลงบันทึกใหม่ตลอดไป เพราะมันอ่านค่าจาก
    // system_settings เท่านั้น -> ตัวเลือกภาคเรียนใน LogList เลยไม่ขยับ (ไม่แตะ head_curriculum/
    // deputy_academic/director เลย เพื่อไม่ให้ชนกับ updateExecutives ด้านบน)
    await pool.query(
      'UPDATE system_settings SET term = $1, academic_year = $2 WHERE id = 1',
      [current_semester, academic_year]
    )

    return res.json({ success: true, message: 'เปิดภาคเรียนใหม่สำเร็จ', data: insertResult.rows })
  } catch (error) {
    console.error('Error adding term:', error)
    return res.status(500).json({ success: false, message: 'เปิดภาคเรียนใหม่ล้มเหลว: ' + error.message })
  }
}