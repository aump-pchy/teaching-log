const pool = require('../db/pool')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendPasswordResetEmail } = require('../utils/mailer')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '90m'

async function register(req, res) {
  try {
    const { email, password, full_name, department_id } = req.body
    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนครับ' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้งานในระบบแล้วครับ' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, department_id, role, is_approved)
       VALUES ($1, $2, $3, $4, 'teacher', false)`,
      [normalizedEmail, hashedPassword, full_name.trim(), Number(department_id)]
    )

    return res.status(201).json({ message: 'สมัครสมาชิกสำเร็จแล้วครับ กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน' })
  } catch (err) {
    console.error('Register Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail])
    const userData = result.rows[0]

    if (!userData) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับ' })
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับ' })
    }

    if (!userData.is_approved) {
      return res.status(403).json({ error: 'บัญชีของคุณยังไม่ได้รับอนุมัติจากผู้ดูแลระบบครับ กรุณารอการตรวจสอบนะครับ' })
    }

    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // 🟢 [แก้ไข] เดิมใช้ authData.session.access_token ซึ่งเป็นโค้ดเก่าตกค้างจากสมัยที่ยัง
    // ใช้ Supabase Auth — ตัวแปร authData ไม่มีอยู่จริงในฟังก์ชันนี้แล้ว (ReferenceError ทันที
    // หลัง login สำเร็จ) ตอนนี้ JWT ถูกสร้างเองไว้ในตัวแปร token ด้านบนแล้ว ใช้ตัวนั้นแทน
    return res.json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        department_id: userData.department_id
      }
    })
  } catch (err) {
    console.error('Login Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }
}

async function logout(req, res) {
  
return res.json({ message: 'ออกจากระบบสำเร็จแล้วครับ' })
}

// 🔧 GET /api/auth/me — LogFormView.vue เรียกใช้อยู่แล้วแต่ route/ฟังก์ชันนี้ไม่เคยมีอยู่จริง
// ทำให้ 404 ทุกครั้งที่เปิดหน้าเพิ่ม/แก้บันทึกการสอน
// ⚠️ frontend อ่านค่าจาก data.full_name ตรงๆ (ไม่ได้ซ้อนใน data.user) จึงคืนค่าแบบแบนราบ (flat)
async function getMe(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, department_id FROM users WHERE id = $1',
      [req.user.id]
    )
    const userData = result.rows[0]

    if (!userData) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' })
    }

    return res.json({
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      department_id: userData.department_id
    })
  } catch (err) {
    console.error('GetMe Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }

  return res.json({ message: 'ออกจากระบบสำเร็จแล้วครับ' })

}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมล' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [normalizedEmail])
    const user = result.rows[0]

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบที่อยู่อีเมลนี้ในระบบข้อมูลบันทึกการสอนครับ' })
    }

    const newPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, normalizedEmail])

    await sendPasswordResetEmail(user.email, newPassword)

    return res.json({ message: 'ระบบส่งรหัสผ่านใหม่ไปยังอีเมลของเรียบร้อยแล้วครับ กรุณาตรวจสอบกล่องจดหมาย (รวมถึงถังขยะ/สแปม)' })
  } catch (error) {
    console.error('ForgotPassword Error:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง' })
  }
}

module.exports = { register, login, logout, forgotPassword, getMe }
