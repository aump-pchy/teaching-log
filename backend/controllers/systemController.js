const pool = require('../db/pool')

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings WHERE id = 1')
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลระบบกลาง' })
    }
    return res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ message: 'ดึงข้อมูลระบบกลางไม่สำเร็จ' })
  }
}

exports.updateSettings = async (req, res) => {
  const { term, academic_year, head_curriculum, deputy_academic, director } = req.body
  try {
    await pool.query(
      `UPDATE system_settings SET term=$1, academic_year=$2, head_curriculum=$3, deputy_academic=$4, director=$5 WHERE id = 1`,
      [term, academic_year, head_curriculum, deputy_academic, director]
    )
    return res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return res.status(500).json({ message: 'บันทึกข้อมูลล้มเหลว' })
  }
}