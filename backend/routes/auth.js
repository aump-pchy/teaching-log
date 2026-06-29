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
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle(); 

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลฐานข้อมูล' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบที่อยู่อีเมลนี้ในระบบข้อมูลบันทึกการสอนครับอ้าย' });
    }

    const defaultPasswordHash = await bcrypt.hash('123456', 10);
    
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