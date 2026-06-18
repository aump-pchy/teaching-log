const supabase = require('../db/supabase')
const bcrypt = require('bcryptjs')
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

    // 🟢 [ขุนโปรโหมด - ปิดตัวตรวจสอบชั่วคราว] 
    // จำลองข้อมูลผู้ใช้งานตามเงื่อนไขอีเมล โดยไม่ต้องเช็คฐานข้อมูลและรหัสผ่าน
    let mockUser = null;

    if (email.toLowerCase().includes('admin')) {
      // 1. ถ้าอีเมลมีคำว่า admin ให้จำลองเป็นแอดมินสูงสุดของระบบ
      mockUser = {
        id: 1,
        email: email.trim(),
        full_name: 'ผู้ดูแลระบบ (โหมดจำลอง)',
        role: 'admin',
        department_id: 2
      };
    } else {
      // 2. ถ้าเป็นอีเมลอื่น ๆ ให้จำลองเป็นอาจารย์ผู้ใช้งานทั่วไป
      mockUser = {
        id: 3,
        email: email.trim(),
        full_name: 'อาจารย์ผู้ใช้งาน (โหมดจำลอง)',
        role: 'teacher',
        department_id: 1
      };
    }

    // สร้าง JWT token จากข้อมูลจำลอง (ขุนโปรโหมด)
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || 'your-secret-key', // ใช้ fallback key เผื่อใน .env ยังไม่ได้ตั้ง
      { expiresIn: '8h' }
    )

    // ส่ง Token และ Object ข้อมูลผู้ใช้กลับไปให้หน้าบ้านพารีไดเรกต์เข้าระบบ
    return res.status(200).json({
      token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        role: mockUser.role,
        department_id: mockUser.department_id
      }
    })

    /* 🔴 โค้ดส่วนดั้งเดิมถูกปิดใช้งานชั่วคราวเพื่อทำ Bypass 
    // query หา user จาก supabase ด้วย email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim())
      .single()

    if (error || !user) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }
    */

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