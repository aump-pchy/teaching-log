const express = require('express')
const router = express.Router()
const { login, register, logout, forgotPassword } = require('../controllers/authController')

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/register
router.post('/register', register)

// POST /api/auth/logout
router.post('/logout', logout)

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword)

module.exports = router