-- ============================================================
-- migration.sql
-- เพิ่มคอลัมน์ที่ขาดหายไปจาก backup ให้ตรงกับข้อมูลจริง
-- รันครั้งเดียวบน DB ที่สร้างจาก schema.sql เดิม
-- ============================================================

-- departments: เพิ่ม created_at
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- users: เพิ่ม auth_id
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_id VARCHAR(255);

-- system_settings: เพิ่ม updated_at
ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- teaching_log_images: เพิ่ม uploaded_at
ALTER TABLE teaching_log_images
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();
