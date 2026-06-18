const supabase = require('../db/supabase')
const bcrypt = require('bcryptjs') // 🟢 เปลี่ยนเป็น bcryptjs เรียบร้อยครับ

async function getAllUsers(req, res) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, email, full_name, role, department_id, is_approved,
        departments ( id, code, name )
      `) // 🟢 เพิ่ม is_approved ในส่วน select
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json(users)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, full_name, role, department_id, is_approved,
        departments ( id, code, name )
      `) // 🟢 เพิ่ม is_approved ในส่วน select
      .eq('id', id)
      .single()

    if (error || !user) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}

async function createUser(req, res) {
  try {
    // 🟢 เพิ่มการดึง is_approved จาก req.body
    const { email, password, full_name, department_id, role, is_approved } = req.body

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    // แฮชด้วย bcryptjs ตัวใหม่
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // 🟢 เอาค่า is_approved ไปผูกในการ insert เข้า database ด้วย
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password_hash, 
        full_name, 
        department_id: department_id || null, 
        role,
        is_approved: is_approved !== undefined ? is_approved : false 
      }])
      .select('id, email, full_name, role, department_id, is_approved') // 🟢 เพิ่ม is_approved ในส่วน return ผลลัพธ์
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.status(201).json(newUser)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params
    // 🟢 เพิ่มการรับค่า is_approved จาก req.body เพื่อรองรับเวลาหน้าบ้านกดปุ่มอนุมัติ
    const { email, password, full_name, department_id, role, is_approved } = req.body

    const updateData = { email, full_name, department_id: department_id || null, role }

    // 🟢 ตรวจสอบสถานะการอนุมัติว่าถูกส่งเข้ามาอัปเดตด้วยหรือไม่
    if (is_approved !== undefined) {
      updateData.is_approved = is_approved
    }

    if (password) {
      const saltRounds = 10
      updateData.password_hash = await bcrypt.hash(password, saltRounds)
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, department_id, is_approved') // 🟢 เพิ่ม is_approved ในส่วน return ผลลัพธ์
      .single()

    if (error) return res.status(400).json({ error: error.message })
    if (!updatedUser) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    return res.status(200).json(updatedUser)
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params

    if (String(req.user.id) === String(id)) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    return res.status(200).json({ message: 'ลบผู้ใช้งานสำเร็จ' })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser }