const express = require('express')
const router = express.Router()
const { login, register, logout, forgotPassword, getMe } = require('../controllers/authController')
// ⚠️ [ต้องเช็คเอง] path นี้ผมอิงจากโครงสร้างทั่วไป (routes/auth.js คู่กับ middleware/auth.js)
// ถ้าไฟล์ authMiddleware ของโปรเจกต์นี้อยู่คนละที่ ต้องแก้ path ตรงนี้ให้ตรงจริง
const { authMiddleware } = require('../middleware/auth')

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/register
router.post('/register', register)

// POST /api/auth/logout
router.post('/logout', logout)

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword)

// 🔧 [เพิ่มใหม่] GET /api/auth/me — LogFormView.vue เรียกใช้อยู่แล้วแต่ route นี้ไม่เคยมีอยู่จริง
// (404 Not Found) ต้องผ่าน authMiddleware ก่อนเสมอ เพราะ getMe อ่าน req.user.id ที่
// authMiddleware เป็นคนฝังให้หลัง verify JWT สำเร็จ
router.get('/me', authMiddleware, getMe)

module.exports = router