const express = require('express')
const router = express.Router()
const { login, register, logout, forgotPassword, getMe } = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth')

router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.get('/me', authMiddleware, getMe)

module.exports = router