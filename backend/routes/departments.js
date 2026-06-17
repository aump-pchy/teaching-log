const express = require('express')
const router = express.Router()
const { authMiddleware, adminOnly } = require('../middleware/auth')
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController')

// GET /api/departments  (ทุกคนเข้าถึงได้ — ใช้ใน dropdown, ไม่ต้อง login)
router.get('/', getAllDepartments)

// POST /api/departments
router.post('/', authMiddleware, adminOnly, createDepartment)

// PUT /api/departments/:id
router.put('/:id', authMiddleware, adminOnly, updateDepartment)

// DELETE /api/departments/:id
router.delete('/:id', authMiddleware, adminOnly, deleteDepartment)

module.exports = router
