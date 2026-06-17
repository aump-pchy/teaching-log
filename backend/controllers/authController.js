const supabase = require('../db/supabase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/**
 * POST /api/auth/login
 * body: { email, password }
 */
async function login(req, res) {
  // TODO: 1. รับ email, password จาก req.body
  // TODO: 2. query หา user จาก supabase ด้วย email
  // TODO: 3. ถ้าไม่เจอ user → return 401
  // TODO: 4. เปรียบเทียบ password กับ password_hash ด้วย bcrypt.compare()
  // TODO: 5. ถ้าไม่ตรง → return 401
  // TODO: 6. สร้าง JWT token ด้วย jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '8h' })
  // TODO: 7. return { token, user: { id, email, full_name, role, department_id } }
}

/**
 * POST /api/auth/logout
 * (stateless JWT — แค่ return success, client ลบ token เอง)
 */
async function logout(req, res) {
  // TODO: return { message: 'Logged out successfully' }
}

module.exports = { login, logout }
