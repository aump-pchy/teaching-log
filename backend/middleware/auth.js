const jwt = require('jsonwebtoken')

// ตรวจสอบ JWT token ทุก request
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    // 🟢 ปรับข้อความ error ให้ตรงตามเอกสารระบบกำหนดครับ
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
  try {
    const token = auth.split(' ')[1]
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    // 🟢 ปรับข้อความ error ให้ตรงตามเอกสารระบบกำหนดเช่นกันครับ
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
}

// เฉพาะ admin เท่านั้น
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    // 🟢 ปรับข้อความ error จาก 'Admin only' เป็น 'ไม่มีสิทธิ์เข้าถึง' (Status 403 ถูกต้องแล้วครับ)
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }