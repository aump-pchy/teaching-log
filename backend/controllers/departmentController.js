const supabase = require('../db/supabase')

/**
 * GET /api/departments
 * ทุกคนเข้าถึงได้ (ใช้ตอนกรอก form dropdown)
 */
async function getAllDepartments(req, res) {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, code, name')
      .order('id', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.json(data || [])
  } catch (err) {
    console.error('getAllDepartments error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /api/departments
 * admin only
 * body: { code, name }
 */
async function createDepartment(req, res) {
  // TODO: 1. รับ code, name จาก req.body
  // TODO: 2. validate ว่าไม่ซ้ำกับที่มีอยู่
  // TODO: 3. insert ลง supabase
  // TODO: 4. return department ที่สร้างใหม่
}

/**
 * PUT /api/departments/:id
 * admin only
 */
async function updateDepartment(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. รับ code, name จาก req.body
  // TODO: 3. update ใน supabase
  // TODO: 4. return department ที่อัปเดตแล้ว
}

/**
 * DELETE /api/departments/:id
 * admin only
 */
async function deleteDepartment(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. เช็คว่ายังมี user อยู่ใน department นี้ไหม → ถ้ามี return 400
  // TODO: 3. delete จาก supabase
  // TODO: 4. return { message: 'Department deleted' }
}

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment }
