const supabase = require('../db/supabase') // 🎯 ดึงตัวแปร supabase ที่เซ็ตค่าไว้มาแกะรหัส

// 1. ดักตรวจเช็ก Token จากฝั่ง Supabase Auth
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
  
  try {
    const token = auth.split(' ')[1]

    // 🎯 ยิงเช็กตรงกับระบบ Supabase Auth เพื่อยืนยันตัวตนคนถือ Token
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
    }

    // 🎯 ไปดึงข้อมูลเพิ่มเติม (เช่น role, full_name) จากตารางฐานข้อมูล users มาพ่วงเก็บไว้
    const { data: dbUser } = await supabase
      .from('users')
      .select('role, full_name, email')
      .eq('email', user.email)
      .maybeSingle()

    // ฝังข้อมูลลงใน req.user เพื่อส่งไม้ต่อให้ฟังก์ชันถัดไปใช้งาน
    req.user = {
      id: user.id,
      email: user.email,
      role: dbUser?.role || 'teacher' // ถ้าหาบทบาทในตารางไม่เจอ ให้เป็นอาจารย์ธรรมดาไว้ก่อน
    }

    next() // ตรวจผ่านฉลุย! ไปทำงานสเต็ปต่อไปได้
  } catch (err) {
    console.error('Middleware Auth Error:', err)
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
}

// 2. ล็อกสิทธิ์เฉพาะแอดมิน (ใช้ต่อได้ทันทีหลังปรับ req.user ด้านบน)
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }