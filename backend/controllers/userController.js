const supabase = require('../db/supabase')
const bcrypt = require('bcrypt')

/**
 * GET /api/users
 * admin only — ดู user ทุกคน พร้อม department
 */
async function getAllUsers(req, res) {
  // TODO: 1. query users join departments จาก supabase
  // TODO: 2. return array of users (ไม่ต้องส่ง password_hash)
}

/**
 * GET /api/users/:id
 * admin only
 */
async function getUserById(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. query หา user คนนั้น
  // TODO: 3. ถ้าไม่เจอ → return 404
  // TODO: 4. return user (ไม่ส่ง password_hash)
}

/**
 * POST /api/users
 * admin only — สร้าง user ใหม่
 * body: { email, password, full_name, department_id, role }
 */
async function createUser(req, res) {
  // TODO: 1. รับ field จาก req.body
  // TODO: 2. validate field ที่จำเป็น
  // TODO: 3. hash password ด้วย bcrypt.hash(password, 10)
  // TODO: 4. insert user ลง supabase
  // TODO: 5. return user ที่สร้างใหม่ (ไม่ส่ง password_hash)
}

/**
 * PUT /api/users/:id
 * admin only — แก้ไข user
 * body: { full_name, department_id, role } (password optional)
 */
async function updateUser(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. รับ field ที่จะแก้จาก req.body
  // TODO: 3. ถ้ามี password ใหม่ → hash ก่อน
  // TODO: 4. update user ใน supabase
  // TODO: 5. return user ที่อัปเดตแล้ว
}

/**
 * DELETE /api/users/:id
 * admin only
 */
async function deleteUser(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. ห้ามลบตัวเอง (req.user.id === id → return 400)
  // TODO: 3. delete user จาก supabase
  // TODO: 4. return { message: 'User deleted' }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser }
