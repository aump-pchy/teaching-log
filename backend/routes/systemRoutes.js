const express = require('express')
const router = express.Router()
const systemController = require('../controllers/systemController')
const { authMiddleware, adminOnly } = require('../middleware/auth')

// 🟢 [แก้ไข] เดิม route กลุ่มนี้ไม่มี authMiddleware เลยสักเส้นทาง (ใครก็เรียกได้แม้ไม่ login)
// ใส่ authMiddleware ไว้ทั้ง router (ต้อง login ก่อนถึงจะเรียกได้) แต่ระวังไม่ใส่ adminOnly
// ครอบทั้งหมด เพราะ /settings และ /settings/terms (GET) ถูกเรียกใช้โดย "ครู" ด้วย
// (เช่น LogListView ใช้ทำ dropdown เลือกภาคเรียน) ต้องแยกเฉพาะ action ที่แก้ไข/ลบข้อมูล
// ระดับระบบจริงๆ เท่านั้นที่ล็อกไว้เฉพาะแอดมิน
router.use(authMiddleware)

// เส้นทางจัดการผู้บริหาร (แอดมินเท่านั้น)
router.get('/settings/executives', adminOnly, systemController.getExecutives)
router.post('/settings/executives', adminOnly, systemController.updateExecutives)

// เส้นทางดูประวัติภาคเรียน — ครูก็ต้องดูได้ (ใช้ทำ dropdown เลือกภาคเรียนในหน้า LogList)
router.get('/settings/terms', systemController.getTerms)

// เส้นทางแก้ไขประวัติภาคเรียน (แอดมินเท่านั้น)
router.post('/settings/terms', adminOnly, systemController.addTerm)
router.post('/settings/terms/:id/set-current', adminOnly, systemController.setCurrentTerm)
router.delete('/settings/terms/:id', adminOnly, systemController.deleteTerm)

// ข้อมูลระบบกลางทั้งก้อน — ครูก็ต้องดูได้ (ใช้แปะหัวเอกสาร/ดึงภาคเรียนปัจจุบัน)
router.get('/settings', systemController.getSettings)

module.exports = router