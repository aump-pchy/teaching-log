const jwt = require('jsonwebtoken')

// ตรวจสอบ JWT token ทุก request
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = auth.split(' ')[1]
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' })
  }
}

// เฉพาะ admin เท่านั้น
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }
