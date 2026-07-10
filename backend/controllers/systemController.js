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

    // 🟢 [แก้ไข] แนบบอกด้วยว่าแถวไหนคือ "ภาคเรียนปัจจุบัน" อยู่ตอนนี้ (เทียบกับ system_settings)
    // เพื่อให้หน้าบ้านไฮไลต์/ปิดปุ่ม "ตั้งเป็นปัจจุบัน" สำหรับแถวที่เป็นปัจจุบันอยู่แล้วได้
    const currentResult = await pool.query('SELECT term, academic_year FROM system_settings WHERE id = 1')
    const current = currentResult.rows[0] || null

    const data = result.rows.map(row => ({
      ...row,
      is_current: !!(current && String(row.term) === String(current.term) && String(row.academic_year) === String(current.academic_year))
    }))

    return res.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching terms:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลภาคเรียนล้มเหลว' })
  }
}

// 💾 เปิดภาคเรียนใหม่แบบเพิ่มแถว (POST /api/system/settings/terms)
// 🟢 [แก้ไข] เดิมพอเพิ่มภาคเรียนใหม่ปุ๊บ ระบบจะตั้งเป็น "ภาคเรียนปัจจุบัน" ให้ทันทีอัตโนมัติ
// ทำให้ตอนสร้างบันทึกใหม่ ดันไปยึดค่าล่าสุดที่เพิ่ม ทั้งที่ผู้ใช้อาจจะแค่อยาก "เตรียม" ภาคเรียน
// ไว้ล่วงหน้าเฉยๆ ยังไม่อยากให้เป็นภาคเรียนที่ใช้งานจริง ตอนนี้แค่เพิ่มเข้าประวัติ (academic_terms)
// เท่านั้น ไม่แตะ system_settings เลย ต้องกด "ตั้งเป็นภาคเรียนปัจจุบัน" ที่รายการด้านล่างเอง
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

    // Insert แถวใหม่ สวยๆ สะสมแต้ม (เก็บประวัติ) — ไม่แตะ system_settings แล้ว
    const insertResult = await pool.query(
      'INSERT INTO academic_terms (term, academic_year) VALUES ($1, $2) RETURNING *',
      [current_semester, academic_year]
    )

    return res.json({ success: true, message: 'เพิ่มภาคเรียนเข้าประวัติสำเร็จ', data: insertResult.rows })
  } catch (error) {
    console.error('Error adding term:', error)
    return res.status(500).json({ success: false, message: 'เปิดภาคเรียนใหม่ล้มเหลว: ' + error.message })
  }
}

// 🟢 [เพิ่มใหม่] ตั้งภาคเรียนที่เลือกจากประวัติ ให้เป็น "ภาคเรียนปัจจุบัน" ใน system_settings
// (POST /api/system/settings/terms/:id/set-current) — จุดเดียวเท่านั้นที่จะอัปเดตค่าที่ createLog()
// ใช้ฝังลงบันทึกใหม่ ทำให้ผู้ใช้มั่นใจได้ว่าค่าที่ระบบดึงไปใช้ตรงกับที่ "เลือกเอง" จริงๆ ไม่มีดึงมั่ว
exports.setCurrentTerm = async (req, res) => {
  const { id } = req.params
  try {
    const termResult = await pool.query('SELECT * FROM academic_terms WHERE id = $1', [id])
    const term = termResult.rows[0]

    if (!term) {
      return res.status(404).json({ success: false, message: 'ไม่พบภาคเรียนที่ต้องการตั้งค่า' })
    }

    await pool.query(
      'UPDATE system_settings SET term = $1, academic_year = $2 WHERE id = 1',
      [term.term, term.academic_year]
    )

    return res.json({
      success: true,
      message: `ตั้งภาคเรียนที่ ${term.term}/${term.academic_year} เป็นภาคเรียนปัจจุบันสำเร็จ`
    })
  } catch (error) {
    console.error('Error setting current term:', error)
    return res.status(500).json({ success: false, message: 'ตั้งค่าภาคเรียนปัจจุบันล้มเหลว: ' + error.message })
  }
}

// 🟢 [เพิ่มใหม่] ลบภาคเรียนออกจากประวัติ (DELETE /api/system/settings/terms/:id)
exports.deleteTerm = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM academic_terms WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบภาคเรียนที่ต้องการลบ' })
    }
    return res.json({ success: true, message: 'ลบภาคเรียนออกจากประวัติสำเร็จ' })
  } catch (error) {
    console.error('Error deleting term:', error)
    return res.status(500).json({ success: false, message: 'ลบภาคเรียนล้มเหลว: ' + error.message })
  }
}