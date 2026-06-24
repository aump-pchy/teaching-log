const { createClient } = require('@supabase/supabase-js')

// ดักเช็กเผื่อลืมใส่ค่าใน .env จะได้รู้ทันทีตอนรันเซิร์ฟเวอร์
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Warning: ไม่พบตัวแปร SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ใน .env')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = supabase