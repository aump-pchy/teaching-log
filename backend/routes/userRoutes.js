// 🎯 เพิ่มโค้ดเส้นทางนี้เข้าไปในไฟล์ Route ผู้ใช้งานหลังบ้าน (เช่น userRoutes.js)
const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth') // เช็ก token
const { resetPassword } = require('../controllers/userController') // ฟังก์ชันรีเซ็ต

// PUT /api/users/:id/reset-password
// ล็อกความปลอดภัยหลังบ้าน: ต้องผ่าน authMiddleware และเช็กต่อใน controller ว่าเป็น admin ไหม
router.put('/:id/reset-password', authMiddleware, resetPassword)

module.exports = router