const supabase = require('../db/supabase')
const bcrypt = require('bcryptjs') // 🟢 เปลี่ยนเป็น bcryptjs เรียบร้อยครับ
const jwt = require('jsonwebtoken')

/**
 * POST /api/auth/login
 * body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })
    }

    // query หา user จาก supabase ด้วย email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // ถ้าไม่เจอ user หรือเกิด error → ส่งกลับ 400
    if (error || !user) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    // เปรียบเทียบ password (จากหน้าบ้าน) กับ password_hash (ในฐานข้อมูล)
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    // สร้าง JWT token 
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    // ลบพาสเวิร์ดทิ้งเพื่อความปลอดภัย
    delete user.password_hash 

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department_id: user.department_id
      }
    })

  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  return res.status(200).json({ message: 'ออกจากระบบสำเร็จ' })
}

module.exports = { login, logout }