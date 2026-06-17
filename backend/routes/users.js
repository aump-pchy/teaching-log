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

// GET /api/users
router.get('/', authMiddleware, adminOnly, getAllUsers)

// GET /api/users/:id
router.get('/:id', authMiddleware, adminOnly, getUserById)

// POST /api/users
router.post('/', authMiddleware, adminOnly, createUser)

// PUT /api/users/:id
router.put('/:id', authMiddleware, adminOnly, updateUser)

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, adminOnly, deleteUser)

module.exports = router
