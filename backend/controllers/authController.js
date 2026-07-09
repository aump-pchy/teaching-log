// ดึงตัวแปร supabase ที่เซ็ตค่าไว้มาใช้งาน (ตอนนี้ใช้แค่เป็น DB client เท่านั้น ไม่ใช่ระบบ auth แล้ว)
const supabase = require('../db/supabase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d' // อายุ token 7 วัน ปรับได้ตามต้องการ

/**
 * POST /api/auth/register
 * 🎯 [แก้ไขทั้งหมด] เลิกพึ่ง Supabase Auth แล้ว สมัครสมาชิกด้วยการ insert ลงตาราง users ตรงๆ
 * พร้อมแฮชรหัสผ่านด้วย bcrypt เก็บไว้ในคอลัมน์ password_hash
 */
async function register(req, res) {
  try {
    const { email, password, full_name, department_id } = req.body

    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนครับอ้าย' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. เช็กก่อนว่ามีอีเมลนี้ในระบบแล้วหรือยัง (กันสมัครซ้ำ)
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (checkError) {
      console.error('Check Existing User Error:', checkError.message)
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' })
    }

    if (existingUser) {
      return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้งานในระบบแล้วครับ' })
    }

    // 2. แฮชรหัสผ่านก่อนบันทึก
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 3. บันทึกลงตาราง users โดยตรง (ไม่ต้องผ่าน Supabase Auth อีกต่อไป)
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          email: normalizedEmail,
          password_hash: hashedPassword,
          full_name: full_name.trim(),
          department_id: Number(department_id),
          role: 'teacher',
          is_approved: false
        }
      ])

    if (dbError) {
      console.error('Database Insert User Error:', dbError.message)
      return res.status(500).json({ error: `สมัครสมาชิกไม่สำเร็จ: ${dbError.message}` })
    }

    return res.status(201).json({ message: 'สมัครสมาชิกสำเร็จแล้วครับ กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน' })

  } catch (err) {
    console.error('Register Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }
}

/**
 * POST /api/auth/login
 * 🎯 [แก้ไขทั้งหมด] เช็ก credential กับตาราง users เอง + bcrypt.compare + jwt.sign เอง
 * ไม่เรียก supabase.auth.signInWithPassword() อีกแล้ว
 */
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. ดึงข้อมูลผู้ใช้จากตาราง users (ต้องดึง password_hash มาด้วยเพื่อเทียบ)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (userError) {
      console.error('Fetch User Error:', userError.message)
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' })
    }

    if (!userData) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับ' })
    }

    // 2. เทียบรหัสผ่านที่กรอกกับ hash ที่เก็บไว้
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้องครับ' })
    }

    // 3. เช็กสถานะการอนุมัติ (is_approved)
    if (!userData.is_approved) {
      return res.status(403).json({
        error: 'บัญชีของอ้ายยังไม่ได้รับอนุมัติจากผู้ดูแลระบบครับ กรุณารอการตรวจสอบนะครับ'
      })
    }

    // 4. เซ็น JWT เอง (payload เก็บ id, email, role เท่าที่จำเป็น ไม่ใส่ข้อมูลอ่อนไหว)
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // 5. ส่งข้อมูลกลับหน้าบ้าน
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

/**
 * POST /api/auth/logout
 * 🎯 [แก้ไข] ระบบ JWT เป็นแบบ stateless ไม่มี session ฝั่ง server ให้ signOut
 * การ "logout" จริงๆ คือฝั่ง frontend ลบ token ทิ้งจาก localStorage เอง (ดู stores/auth.js)
 * endpoint นี้เก็บไว้เผื่ออนาคตอยากทำ token blacklist แต่ตอนนี้แค่ตอบกลับสำเร็จเฉยๆ
 */
async function logout(req, res) {
  return res.json({ message: 'ออกจากระบบสำเร็จแล้วครับอ้าย' })
}

module.exports = {
  register,
  login,
  logout
}