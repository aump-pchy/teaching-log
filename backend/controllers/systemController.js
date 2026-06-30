// backend/controllers/systemController.js
const supabase = require('../db/supabase') // ดึงตัวเชื่อม Supabase หลังบ้านของหนูมาใช้

// 🟢 ดึงข้อมูลจาก Supabase (GET)
exports.getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) throw error
    return res.json(data)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลระบบกลางไม่สำเร็จ' })
  }
}

//  อัปเดตข้อมูลเซฟลง Supabase (POST)
exports.updateSettings = async (req, res) => {
  const { term, academic_year, head_curriculum, deputy_academic, director } = req.body
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .update({ term, academic_year, head_curriculum, deputy_academic, director })
      .eq('id', 1)

    if (error) throw error
    return res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return res.status(500).json({ message: 'บันทึกข้อมูลล้มเหลว' })
  }
}