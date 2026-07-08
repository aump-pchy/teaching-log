const express = require('express')
const router = express.Router()
const supabase = require('../db/supabase') // 🟢 ดึงเข้ามาให้ก้อนด้านล่างเรียกใช้ได้ ไม่ระเบิดจ้า
const systemController = require('../controllers/systemController')

// เส้นทางจัดการผู้บริหาร (ของเพื่อน)
router.get('/settings/executives', systemController.getExecutives)
router.post('/settings/executives', systemController.updateExecutives)

// เส้นทางจัดการภาคเรียน (ของเพื่อน)
router.get('/settings/terms', systemController.getTerms)
router.post('/settings/terms', systemController.addTerm)

// 🟢 ตัวนี้ของหนู: ทางเชื่อมดักจับให้หน้าบ้านมาดึงข้อมูลเทอมและผู้บริหารได้ ไม่ติด 404
router.get('/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router