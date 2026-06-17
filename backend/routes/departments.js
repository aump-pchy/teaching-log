const express = require('express')
const router = express.Router()
const { authMiddleware, adminOnly } = require('../middleware/auth')
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController')

// GET /api/departments  (ทุกคนที่ login แล้วเข้าถึงได้ — ใช้ใน dropdown)
router.get('/', authMiddleware, getAllDepartments)

// POST /api/departments
router.post('/', authMiddleware, adminOnly, createDepartment)

// PUT /api/departments/:id
router.put('/:id', authMiddleware, adminOnly, updateDepartment)

// DELETE /api/departments/:id
router.delete('/:id', authMiddleware, adminOnly, deleteDepartment)

module.exports = router
