<<<<<<< HEAD
// ดึงตัวแปร supabase ที่เซ็ตค่าไว้มาใช้งาน
const supabase = require('../db/supabase')
// 🎯 เรียกใช้งาน bcrypt สำหรับแฮชรหัสผ่านลงตาราง users เดิม
const bcrypt = require('bcrypt')

/**
 * POST /api/auth/register
 * ระบบสมัครสมาชิกฉบับผูกเข้ากับ Supabase Auth และบันทึกลงตาราง users เดิม
 */
=======
const pool = require('../db/pool')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '90m'

>>>>>>> origin/feature/auth-users
async function register(req, res) {
  try {
    const { email, password, full_name, department_id } = req.body
    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนครับอ้าย' })
    }

<<<<<<< HEAD
    // สเต็ปที่ 1: ยิงส่งข้อมูลไปสร้างบัญชีในระบบ Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password
    })

    if (authError) {
      console.error('Supabase Auth Register Error:', authError.message)
      return res.status(400).json({ error: `สมัครสมาชิกไม่สำเร็จ: ${authError.message}` })
    }

    // 🎯 ทำการเข้ารหัสลับรหัสผ่านก่อนบันทึกลงฐานข้อมูลเดิม
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // สเต็ปที่ 2: บันทึกลงตาราง users
    // 🎯 [แก้ไข] เพิ่ม auth_id: authData.user.id เพื่อผูกบัญชี Supabase Auth กับตาราง users
    // จุดนี้สำคัญมาก ถ้าไม่บันทึกไว้ ฟีเจอร์รีเซ็ตรหัสผ่าน/เปลี่ยนรหัสผ่านฝั่ง Supabase Auth จะใช้งานไม่ได้
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          email: email.trim().toLowerCase(),
          password_hash: hashedPassword,
          full_name: full_name.trim(),
          department_id: Number(department_id),
          role: 'teacher',
          is_approved: false,
          auth_id: authData.user.id
        }
      ])

    if (dbError) {
      console.error('Database Insert User Error:', dbError.message)
      return res.status(500).json({ error: `สร้างสิทธิ์ Auth สำเร็จ แต่ตาราง DB ปฏิเสธ: ${dbError.message}` })
    }
=======
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
>>>>>>> origin/feature/auth-users

    return res.status(201).json({ message: 'สมัครสมาชิกสำเร็จแล้วครับอ้าย! กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน' })
  } catch (err) {
    console.error('Register Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }
}

<<<<<<< HEAD
/**
 * POST /api/auth/login
 * ระบบล็อกอินฉบับปรับปรุง (เช็กสถานะการอนุมัติก่อนให้เข้าใช้งาน)
 */
=======
>>>>>>> origin/feature/auth-users
async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

<<<<<<< HEAD
    // 1. ตรวจสอบสิทธิ์กับทาง Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    })

    if (authError) {
      console.error('Supabase Auth Login Error:', authError.message)
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับอ้าย' })
    }

    // 2. เช็กข้อมูลโปรไฟล์ในตาราง users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (userError || !userData) {
      console.error('Fetch User Profile Error:', userError)
      return res.status(404).json({ error: 'ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในตารางระบบบันทึกการสอน' })
    }

    // 🎯 เพิ่มส่วนนี้: ตรวจสอบสถานะการอนุมัติ (is_approved)
    if (!userData.is_approved) {
      // Logout ออกจาก Supabase ทันทีที่พบว่ายังไม่อนุมัติ
      await supabase.auth.signOut()
      return res.status(403).json({ 
        error: 'บัญชีของอ้ายยังไม่ได้รับอนุมัติจากผู้ดูแลระบบครับ กรุณารอการตรวจสอบนะครับอ้าย' 
      })
    }

    // 3. ส่งข้อมูลกลับหน้าบ้านเมื่อผ่านทุกเงื่อนไข
=======
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

>>>>>>> origin/feature/auth-users
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

<<<<<<< HEAD
/**
 * POST /api/auth/logout
 * ระบบล็อกเอาต์ออกจากเซสชันของ Supabase
 */
=======
>>>>>>> origin/feature/auth-users
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