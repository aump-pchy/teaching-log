const supabase = require('../db/supabase')

/**
 * GET /api/departments
 * ทุกคนเข้าถึงได้ (ใช้ตอนกรอก form dropdown)
 */
async function getAllDepartments(req, res) {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, code, name, headerName')
      .order('id', { ascending: true })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json(departments)
  } catch (err) {
    console.error('GetAllDepartments Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * POST /api/departments
 * admin only
 * body: { code, name, headerName }
 */
async function createDepartment(req, res) {
  try {
    const { code, name, headerName } = req.body

    if (!code || !name || !headerName) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    // validate ว่าไม่ซ้ำ (code หรือ name)
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('id')
      .or(`code.eq.${code},name.eq.${name}`)

    if (checkError) {
      return res.status(400).json({ error: checkError.message })
    }

    if (existingDept && existingDept.length > 0) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' }) // (แผนกวิชาหรือโค้ดนี้มีอยู่ในระบบแล้ว)
    }

    const { data: newDept, error } = await supabase
      .from('departments')
      .insert([{ code, name, headerName }])
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json(newDept)
  } catch (err) {
    console.error('CreateDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * PUT /api/departments/:id
 * admin only
 * body: { code, name, headerName }
 */
async function updateDepartment(req, res) {
  try {
    const { id } = req.params
    const { code, name, headerName } = req.body

    if (!code || !name || !headerName) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    const { data: updatedDept, error } = await supabase
      .from('departments')
      .update({ code, name, headerName })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }
    if (!updatedDept) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    }

    return res.status(200).json(updatedDept)
  } catch (err) {
    console.error('UpdateDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * DELETE /api/departments/:id
 * admin only
 */
async function deleteDepartment(req, res) {
  try {
    const { id } = req.params

    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id)

    if (countError) {
      return res.status(400).json({ error: countError.message })
    }
    if (count > 0) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' }) // (ห้ามลบเนื่องจากยังมีบุคลากรสังกัดแผนกนี้อยู่)
    }

    const { data, error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }
    if (!data) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    }

    return res.status(200).json({ message: 'ลบแผนกสำเร็จ' })
  } catch (err) {
    console.error('DeleteDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment }