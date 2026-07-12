const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
  try {
    const token = auth.split(' ')[1]
    // 🟢 [แก้ไข] เดิมมีโค้ด Supabase Auth (supabase.auth.getUser, ดึง dbUser จากตาราง users
    // ผ่าน supabase client) ค้างอยู่ 2 เวอร์ชันซ้อนกันจากการ merge หลายรอบ แต่ทั้งระบบ
    // (authController.js, logController.js) เปลี่ยนไปใช้ JWT ที่ออกเอง + Postgres (pool) แล้ว
    // ไม่มี `supabase` client ให้เรียกใช้ในไฟล์นี้อีกต่อไป ต้องยึดฝั่ง JWT เป็นหลักเพียงฝั่งเดียว
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded.id คือ users.id (integer) ที่ authController.js ฝัง payload ไว้ตอน jwt.sign
    // ตรงกับ user_id (integer) ในตาราง teaching_logs พอดี ไม่มีปัญหา UUID อีกต่อไป
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }