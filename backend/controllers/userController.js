const supabase = require('../db/supabase')
const bcrypt = require('bcryptjs') // 🟢 เปลี่ยนเป็น bcryptjs เรียบร้อยครับ

async function getAllUsers(req, res) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, email, full_name, role, department_id,
        departments ( id, code, name )
      `)
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
        id, email, full_name, role, department_id,
        departments ( id, code, name )
      `)
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
    const { email, password, full_name, department_id, role } = req.body

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    // แฮชด้วย bcryptjs ตัวใหม่
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ email, password_hash, full_name, department_id: department_id || null, role }])
      .select('id, email, full_name, role, department_id')
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
    const { email, password, full_name, department_id, role } = req.body

    const updateData = { email, full_name, department_id: department_id || null, role }

    if (password) {
      const saltRounds = 10
      updateData.password_hash = await bcrypt.hash(password, saltRounds)
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, department_id')
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