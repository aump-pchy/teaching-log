const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt') 
const supabase = require('../db/supabase') // ใช้เป็นแค่ DB client เท่านั้น ไม่ใช่ระบบ auth แล้ว
const { authMiddleware } = require('../middleware/auth')
const { login, logout, register } = require('../controllers/authController')

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/logout
router.post('/logout', authMiddleware, logout)

// POST /api/auth/register
router.post('/register', register)

// POST /api/auth/forgot-password
// 🎯 [แก้ไขทั้งหมด] เลิกพึ่ง Supabase Auth แล้ว รีเซ็ตรหัสผ่านด้วยการแฮชแล้วเขียนลง
// คอลัมน์ password_hash ตรงๆ คอลัมน์เดียวจบ เพราะระบบ login ใหม่เช็กจากคอลัมน์นี้โดยตรง
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase()

    // 1. หาผู้ใช้จากตาราง users ก่อน เช็กว่ามีอีเมลนี้จริงไหม
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลฐานข้อมูล' });
    }

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบที่อยู่อีเมลนี้ในระบบข้อมูลบันทึกการสอนครับอ้าย' });
    }

    // 2. แฮชรหัสผ่านตั้งต้นแล้วเขียนลง password_hash ตรงๆ
    const defaultPassword = '123456';
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: defaultPasswordHash })
      .eq('email', normalizedEmail);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'ไม่สามารถอัปเดตรหัสผ่านในฐานข้อมูลได้' });
    }

    return res.json({ message: `ระบบรีเซ็ตรหัสผ่านสำเร็จแล้ว รหัสผ่านใหม่ของอ้ายคือ "${defaultPassword}" กรุณาเปลี่ยนรหัสผ่านหลัง login เข้าใช้งานนะครับ` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'เซิร์ฟเวอร์หลังบ้านเกิดข้อผิดพลาดในการประมวลผล' });
  }
});

module.exports = router