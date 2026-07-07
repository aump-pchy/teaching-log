const pool = require('../db/pool')

async function getAllDepartments(req, res) {
  try {
    const result = await pool.query('SELECT id, code, name, "headerName" FROM departments ORDER BY id ASC')
    return res.status(200).json(result.rows)
  } catch (err) {
    console.error('GetAllDepartments Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function createDepartment(req, res) {
  try {
    const { code, name, headerName } = req.body
    if (!code || !name || !headerName) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    const existing = await pool.query('SELECT id FROM departments WHERE code = $1 OR name = $2', [code, name])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    const result = await pool.query(
      'INSERT INTO departments (code, name, "headerName") VALUES ($1, $2, $3) RETURNING *',
      [code, name, headerName]
    )
    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('CreateDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params
    const { code, name, headerName } = req.body
    if (!code || !name || !headerName) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    const result = await pool.query(
      'UPDATE departments SET code = $1, name = $2, "headerName" = $3 WHERE id = $4 RETURNING *',
      [code, name, headerName, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    }
    return res.status(200).json(result.rows[0])
  } catch (err) {
    console.error('UpdateDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params
    const countResult = await pool.query('SELECT COUNT(*) FROM users WHERE department_id = $1', [id])
    if (parseInt(countResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    }
    return res.status(200).json({ message: 'ลบแผนกสำเร็จ' })
  } catch (err) {
    console.error('DeleteDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment }