const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt') 
const supabase = require('../db/supabase') // 🟢 ปรับมาใช้ตัวเชื่อมต่อ Supabase ของอ้ายโดยตรงแทน MySQL แล้วครับ!
const { authMiddleware } = require('../middleware/auth')
const { login, logout } = require('../controllers/authController')

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/logout
router.post('/logout', authMiddleware, logout)

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. ตรวจสอบว่ามีอีเมลนี้อยู่ในระบบ Supabase หรือไม่
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // ดึงข้อมูลแถวเดียวแบบปลอดภัย ถ้าไม่เจอจะได้ไม่ระเบิด

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลฐานข้อมูล' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบที่อยู่อีเมลนี้ในระบบข้อมูลบันทึกการสอนครับอ้าย' });
    }

    // 2. แฮชรหัสผ่านเริ่มต้น (123456)
    const defaultPasswordHash = await bcrypt.hash('123456', 10);
    
    // 3. อัปเดตรหัสผ่านใหม่กลับเข้าไปที่ตาราง users ใน Supabase ของอ้าย
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: defaultPasswordHash })
      .eq('email', email);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'ไม่สามารถอัปเดตรหัสผ่านในฐานข้อมูลได้' });
    }

    return res.json({ message: 'ระบบบันทึกคำขอรีเซ็ตรหัสผ่านเรียบร้อยแล้ว' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'เซิร์ฟเวอร์หลังบ้านเกิดข้อผิดพลาดในการประมวลผล' });
  }
});

module.exports = router