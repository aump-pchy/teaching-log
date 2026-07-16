const pool = require('../db/pool')
const bcrypt = require('bcrypt')

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.full_name, u.role, u.department_id, u.is_approved,
             d.id AS dept_id, d.name AS dept_name
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      ORDER BY u.id ASC
    `)

    const cleanData = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      role: row.role,
      department_id: row.department_id,
      is_approved: row.is_approved,
      departments: row.dept_id ? { id: row.dept_id, name: row.dept_name } : { id: null, name: 'ยังไม่ระบุแผนก' }
    }))

    return res.status(200).json(cleanData)
  } catch (error) {
    console.error('Backend Error (getAllUsers):', error.message)
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้งานจากระบบได้' })
  }
}

// ⚠️ เช็คสิทธิ์ในนี้: admin ดูใครก็ได้, คนอื่นดูได้แค่ id ของตัวเอง
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const requester = req.user

    if (requester.role !== 'admin' && requester.id !== Number(id)) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้งานรายนี้' })
    }

    const result = await pool.query(`
      SELECT u.id, u.email, u.full_name, u.role, u.department_id, u.is_approved, u.created_at,
             d.name AS department_name
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' })
    }
    return res.status(200).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' })
  }
}

// ⚠️ เช็คสิทธิ์ในนี้: admin แก้ได้ทุก field, คนอื่นแก้ได้แค่ของตัวเอง และแก้ได้แค่ full_name/email/password เท่านั้น
// (ต่อให้ frontend ถูก bypass ส่ง role หรือ department_id มา ก็จะถูกเมิน ไม่กระทบข้อมูลจริง)
exports.updateUser = async (req, res) => {
  const { id } = req.params
  const requester = req.user
  const isAdmin = requester.role === 'admin'
  const isSelf = requester.id === Number(id)

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้งานรายนี้' })
  }

  const { full_name, email, department_id, role, is_approved, password } = req.body

  try {
    const fields = []
    const values = []
    let i = 1

    if (full_name !== undefined) { fields.push(`full_name = $${i++}`); values.push(full_name) }
    if (email !== undefined) { fields.push(`email = $${i++}`); values.push(email) }

    // ฟิลด์เหล่านี้แก้ได้เฉพาะ admin เท่านั้น (ป้องกันครูยกระดับสิทธิ์ตัวเอง)
    if (isAdmin) {
      if (role !== undefined) { fields.push(`role = $${i++}`); values.push(role) }
      if (is_approved !== undefined) { fields.push(`is_approved = $${i++}`); values.push(is_approved) }
      if (department_id) { fields.push(`department_id = $${i++}`); values.push(Number(department_id)) }
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10)
      fields.push(`password_hash = $${i++}`)
      values.push(hashedPassword)
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลให้แก้ไข' })
    }

    values.push(id)
    const result = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values)

    return res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จแล้วครับ', data: result.rows })
  } catch (error) {
    console.error('Backend Error (updateUser):', error.message)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', details: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id])
    return res.status(200).json({ message: 'ลบข้อมูลผู้ใช้งานออกจากระบบเรียบร้อยแล้ว' })
  } catch (error) {
    console.error('Backend Error (deleteUser):', error.message)
    return res.status(500).json({ error: 'ไม่สามารถลบข้อมูลผู้ใช้งานรายนี้ได้' })
  }
}

exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, department_id } = req.body
    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, department_id, is_approved)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [email, hashedPassword, full_name, role, Number(department_id)]
    )
    return res.status(201).json(result.rows)
  } catch (error) {
    console.error('Backend Error (createUser):', error.message)
    return res.status(500).json({ error: 'ไม่สามารถสร้างผู้ใช้งานได้' })
  }
}