const pool = require('../db/pool')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '90m'

async function register(req, res) {
  try {
    const { email, password, full_name, department_id } = req.body
    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนครับอ้าย' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้งานในระบบแล้วครับอ้าย' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, department_id, role, is_approved)
       VALUES ($1, $2, $3, $4, 'teacher', false)`,
      [normalizedEmail, hashedPassword, full_name.trim(), Number(department_id)]
    )

    return res.status(201).json({ message: 'สมัครสมาชิกสำเร็จแล้วครับอ้าย! กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน' })
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
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับอ้าย' })
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับอ้าย' })
    }

    if (!userData.is_approved) {
      return res.status(403).json({ error: 'บัญชีของอ้ายยังไม่ได้รับอนุมัติจากผู้ดูแลระบบครับ กรุณารอการตรวจสอบนะครับอ้าย' })
    }

    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return res.json({
      token: authData.session.access_token,
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
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return res.json({ message: 'ออกจากระบบสำเร็จแล้วครับอ้าย' })
  } catch (err) {
    console.error('Logout Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' })
  }
}

/**
 * GET /api/auth/me
 * ต้องผ่าน authMiddleware มาก่อน (req.user จะมีค่าพร้อมใช้)
 * ใช้ดึงข้อมูลผู้ใช้ปัจจุบัน เช่น เอาไปเติมชื่อ-สกุลอัตโนมัติในฟอร์มบันทึกการสอน
 */
async function getMe(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
    }

    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role
    })
  } catch (err) {
    console.error('GetMe Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }
}
const crypto = require('crypto')
const { sendPasswordResetEmail } = require('../utils/mailer')

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
      return res.status(404).json({ error: 'ไม่พบที่อยู่อีเมลนี้ในระบบข้อมูลบันทึกการสอนครับอ้าย' })
    }

    const newPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, normalizedEmail])

    await sendPasswordResetEmail(user.email, newPassword)

    return res.json({ message: 'ระบบส่งรหัสผ่านใหม่ไปยังอีเมลของเรียบร้อยแล้วครับ กรุณาตรวจสอบกล่องจดหมาย (รวมถึงถังขยะ/สแปม) ตัวอย่างรหัส clzzHvw' })
  } catch (error) {
    console.error('ForgotPassword Error:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง' })
  }
}

module.exports = { register, login, logout, forgotPassword }
