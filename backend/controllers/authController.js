// ดึงตัวแปร supabase ที่เซ็ตค่าไว้มาใช้งาน
const supabase = require('../db/supabase')
// 🎯 เรียกใช้งาน bcrypt สำหรับแฮชรหัสผ่านลงตาราง users เดิม
const bcrypt = require('bcrypt')

/**
 * POST /api/auth/register
 * ระบบสมัครสมาชิกฉบับผูกเข้ากับ Supabase Auth และบันทึกลงตาราง users เดิม
 */
async function register(req, res) {
  try {
    const { email, password, full_name, department_id } = req.body

    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนครับอ้าย' })
    }

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
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          email: email.trim().toLowerCase(),
          password_hash: hashedPassword,
          full_name: full_name.trim(),
          department_id: Number(department_id),
          role: 'teacher',
          is_approved: false
        }
      ])

    if (dbError) {
      console.error('Database Insert User Error:', dbError.message)
      return res.status(500).json({ error: `สร้างสิทธิ์ Auth สำเร็จ แต่ตาราง DB ปฏิเสธ: ${dbError.message}` })
    }

    return res.status(201).json({ message: 'สมัครสมาชิกสำเร็จแล้วครับอ้าย! กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน' })

  } catch (err) {
    console.error('Register Server Error:', err)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์หลังบ้าน' })
  }
}

/**
 * POST /api/auth/login
 * ระบบล็อกอินฉบับปรับปรุง (เช็กสถานะการอนุมัติก่อนให้เข้าใช้งาน)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

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

/**
 * POST /api/auth/logout
 * ระบบล็อกเอาต์ออกจากเซสชันของ Supabase
 */
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

module.exports = {
  register,
  login,
  logout
}