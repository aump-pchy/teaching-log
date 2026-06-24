const jwt = require('jsonwebtoken')

// ตรวจสอบ JWT token ทุก request
function authMiddleware(req, res, next) {
<<<<<<< HEAD
  // const auth = req.headers.authorization
  // if (!auth || !auth.startsWith('Bearer ')) {
  //   return res.status(401).json({ error: 'Unauthorized' })
  // }
  // try {
  //   const token = auth.split(' ')[1]
  //   req.user = jwt.verify(token, process.env.JWT_SECRET)
  //   next()
  // } catch {
  //   return res.status(401).json({ error: 'Token invalid or expired' })
  // }
  req.user = { id: 3, email: 'aump@loeitc.ac.th', role: 'admin' } // mock user
  next()
=======
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
>>>>>>> feature/auth-users
}

// เฉพาะ admin เท่านั้น
function adminOnly(req, res, next) {
<<<<<<< HEAD
  //if (req.user?.role !== 'admin') {
  //  return res.status(403).json({ error: 'Admin only' })
 // }
=======
  if (req.user?.role !== 'admin') {
    // 🟢 ปรับข้อความ error จาก 'Admin only' เป็น 'ไม่มีสิทธิ์เข้าถึง' (Status 403 ถูกต้องแล้วครับ)
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
  }
>>>>>>> feature/auth-users
  next()
}

module.exports = { authMiddleware, adminOnly }