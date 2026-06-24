const supabase = require('../db/supabase')

/**
 * GET /api/departments
 * ทุกคนเข้าถึงได้ (ใช้ตอนกรอก form dropdown)
 */
async function getAllDepartments(req, res) {
  try {
    // 1. query departments ทั้งหมดจาก supabase สั่งเรียงลำดับตาม id เพื่อความสวยงามใน dropdown
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, code, name')
      .order('id', { ascending: true })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // 2. return array of { id, code, name }
    return res.status(200).json(departments)
  } catch (err) {
    console.error('GetAllDepartments Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * POST /api/departments
 * admin only
 * body: { code, name }
 */
async function createDepartment(req, res) {
  try {
    // 1. รับ code, name จาก req.body
    const { code, name } = req.body

    if (!code || !name) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    // 2. validate ว่าไม่ซ้ำกับที่มีอยู่ (เช็กทั้งโค้ดแผนก และชื่อแผนก)
    // 🟢 แก้ไข: ลบ .substring() ที่ไม่มีอยู่จริงออก เพื่อไม่ให้ระบบพังครืน
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

    // 3. insert ลง supabase
    const { data: newDept, error } = await supabase
      .from('departments')
      .insert([{ code, name }])
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // 4. return department ที่สร้างใหม่
    return res.status(201).json(newDept)
  } catch (err) {
    console.error('CreateDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * PUT /api/departments/:id
 * admin only
 */
async function updateDepartment(req, res) {
  try {
    // 1. รับ id จาก req.params.id
    const { id } = req.params
    
    // 2. รับ code, name จาก req.body
    const { code, name } = req.body

    if (!code || !name) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    // 3. update ใน supabase
    const { data: updatedDept, error } = await supabase
      .from('departments')
      .update({ code, name })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }
    if (!updatedDept) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    }

    // 4. return department ที่อัปเดตแล้ว
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
    // 1. รับ id จาก req.params.id
    const { id } = req.params

    // 2. เช็คว่ายังมี user อยู่ใน department นี้ไหม → ถ้ามี return 400 ข้อมูลไม่ถูกต้อง
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

    // 3. delete จาก supabase
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

    // 4. return ข้อความภาษาไทยสวยงาม
    return res.status(200).json({ message: 'ลบแผนกสำเร็จ' })
  } catch (err) {
    console.error('DeleteDepartment Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment }