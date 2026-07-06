const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt') 
const supabase = require('../db/supabase') 
const { authMiddleware } = require('../middleware/auth')
// 🎯 1. เพิ่ม , register เข้ามาดึงฟังก์ชันสมัครสมาชิกจาก Controller มาใช้งาน
const { login, logout, register } = require('../controllers/authController')

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/logout
router.post('/logout', authMiddleware, logout)

// 🎯 2. เพิ่มเส้นทางนี้เข้าไปเพื่อให้หน้าบ้านยิงมาสมัครสมาชิกได้สำเร็จ!
// POST /api/auth/register
router.post('/register', register)

// POST /api/auth/forgot-password
// 🎯 [แก้ไขทั้งหมด] เดิมเขียนรหัสผ่านลงคอลัมน์ "password" ซึ่งไม่มีอยู่จริง (ของจริงคือ password_hash)
// และไม่เคยไปอัปเดตรหัสผ่านที่ฝั่ง Supabase Auth เลย ทำให้รีเซ็ตแล้ว login ด้วยรหัสใหม่ไม่ได้
// ตอนนี้แก้ให้: หา auth_id ของ user -> อัปเดตรหัสผ่านจริงที่ Supabase Auth -> แล้วค่อย sync ตาราง users
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมล' });
  }

  try {
    // 1. หาผู้ใช้จากตาราง users (ต้องดึง auth_id มาด้วย เพื่อเอาไปอัปเดต Supabase Auth)
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, auth_id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลฐานข้อมูล' });
    }

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบที่อยู่อีเมลนี้ในระบบข้อมูลบันทึกการสอนครับอ้าย' });
    }

    // 🎯 2. เช็กก่อนว่า user รายนี้มี auth_id ผูกไว้หรือยัง (user เก่าก่อนแก้ระบบจะยังไม่มี)
    if (!user.auth_id) {
      return res.status(400).json({
        error: 'บัญชีนี้ยังไม่ได้เชื่อมกับระบบยืนยันตัวตน กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่านให้ครับอ้าย'
      });
    }

    const defaultPassword = '123456';

    // 3. อัปเดตรหัสผ่านจริงที่ Supabase Auth ก่อน (จุดนี้คือสิ่งที่ขาดไปเดิม)
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      user.auth_id,
      { password: defaultPassword }
    );

    if (authUpdateError) {
      console.error('Supabase Auth update error:', authUpdateError);
      return res.status(500).json({ error: 'ไม่สามารถรีเซ็ตรหัสผ่านในระบบยืนยันตัวตนได้' });
    }

    // 4. sync รหัสผ่านที่แฮชแล้วลงตาราง users ด้วย (ใช้คอลัมน์ password_hash ที่ถูกต้อง)
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: defaultPasswordHash })
      .eq('email', email.trim().toLowerCase());

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'รีเซ็ตรหัสผ่านสำเร็จ แต่ซิงค์ข้อมูลตาราง DB ไม่สำเร็จ' });
    }

    return res.json({ message: `ระบบรีเซ็ตรหัสผ่านสำเร็จแล้ว รหัสผ่านใหม่ของอ้ายคือ "${defaultPassword}" กรุณาเปลี่ยนรหัสผ่านหลัง login เข้าใช้งานนะครับ` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'เซิร์ฟเวอร์หลังบ้านเกิดข้อผิดพลาดในการประมวลผล' });
  }
});

module.exports = router