const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { login, register, logout, forgotPassword, getMe } = require('../controllers/authController')
// ⚠️ [ต้องเช็คเอง] path นี้ผมอิงจากโครงสร้างทั่วไป (routes/auth.js คู่กับ middleware/auth.js)
// ถ้าไฟล์ authMiddleware ของโปรเจกต์นี้อยู่คนละที่ ต้องแก้ path ตรงนี้ให้ตรงจริง
const { authMiddleware, adminOnly } = require('../middleware/auth')

// 🔒 [แก้ไข - SEC-003] เดิมไม่มีการจำกัดจำนวนครั้งที่ login ผิดเลย เสี่ยง brute force
// (พบจากการทดสอบ security test case SEC-003) ตอนนี้จำกัดไว้ที่ 5 ครั้ง ต่อ IP ทุก 15 นาที
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // สูงสุด 5 ครั้งต่อ IP ใน 15 นาที
  message: { error: 'พยายาม login มากเกินไป กรุณาลองใหม่ภายหลัง' },
  standardHeaders: true,
  legacyHeaders: false,
})

// POST /api/auth/login
router.post('/login', loginLimiter, login)

// POST /api/auth/register
// 🔒 [แก้ไข - SEC-010] เดิม route นี้ไม่มีการป้องกันสิทธิ์เลย ใครก็เรียกได้แม้ไม่ login
// (พบจากการทดสอบ security test case SEC-010) ตอนนี้บังคับต้อง login เป็น admin ก่อนเท่านั้น
router.post('/register', authMiddleware, adminOnly, register)

// POST /api/auth/logout
router.post('/logout', logout)

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword)

// 🔧 [เพิ่มใหม่] GET /api/auth/me — LogFormView.vue เรียกใช้อยู่แล้วแต่ route นี้ไม่เคยมีอยู่จริง
// (404 Not Found) ต้องผ่าน authMiddleware ก่อนเสมอ เพราะ getMe อ่าน req.user.id ที่
// authMiddleware เป็นคนฝังให้หลัง verify JWT สำเร็จ
router.get('/me', authMiddleware, getMe)

module.exports = router