const { createClient } = require('@supabase/supabase-js')

// ครอบ String ให้ถูกต้องตามไวยากรณ์ JavaScript เรียบร้อยครับ
const supabase = createClient(
  'https://qkbogqdniddpxmsaubil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYm9ncWRuaWRkcHhtc2F1YmlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ5Mzk0NywiZXhwIjoyMDk3MDY5OTQ3fQ.DQ0ral-_CzLenskiJRNWewd7mft8ixHURAoT3hDHtog'
)

module.exports = supabase