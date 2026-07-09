const express = require('express')
const router = express.Router()
const systemController = require('../controllers/systemController')

// เส้นทางจัดการผู้บริหาร
router.get('/settings/executives', systemController.getExecutives)
router.post('/settings/executives', systemController.updateExecutives)

// เส้นทางจัดการภาคเรียน
router.get('/settings/terms', systemController.getTerms)
router.post('/settings/terms', systemController.addTerm)

// 🟢 [แก้ไข] เดิม route นี้เขียน handler แยกไว้ในไฟล์นี้เองแบบ inline โดยเรียก supabase ตรงๆ
// (ทั้งที่ไฟล์นี้ไม่มี supabase ให้ใช้แล้ว เพราะย้ายไป pool.query หมดแล้ว) เปลี่ยนมาเรียกใช้
// systemController.getSettings แทน ซึ่งทำหน้าที่เดียวกันอยู่แล้ว ไม่ต้องเขียนซ้ำสองที่
router.get('/settings', systemController.getSettings)

module.exports = router