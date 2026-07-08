const express = require('express')
const router = express.Router()
const { authMiddleware, adminOnly } = require('../middleware/auth')
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController')

// GET /api/users  (admin เท่านั้น)
router.get('/', authMiddleware, adminOnly, getAllUsers)

// GET /api/users/:id  (admin ดูใครก็ได้, teacher ดูได้แค่ของตัวเอง — เช็คใน controller)
router.get('/:id', authMiddleware, getUserById)

// POST /api/users  (admin เท่านั้น)
router.post('/', authMiddleware, adminOnly, createUser)

// PUT /api/users/:id  (admin แก้ใครก็ได้, teacher แก้ได้แค่ของตัวเอง — เช็คใน controller)
router.put('/:id', authMiddleware, updateUser)

// DELETE /api/users/:id  (admin เท่านั้น)
router.delete('/:id', authMiddleware, adminOnly, deleteUser)

module.exports = router
