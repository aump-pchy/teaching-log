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

-- 🔧 [เพิ่มใหม่] academic_terms: ตารางนี้หายไปจาก schema.sql เดิมทั้งก้อน
-- ทำให้ DB ที่สร้างไปแล้วก่อนหน้านี้พังตอนเรียก GET/POST /api/system/settings/terms
-- (error 42P01 "relation academic_terms does not exist")
CREATE TABLE IF NOT EXISTS academic_terms (
  id SERIAL PRIMARY KEY,
  term VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ใส่แถวเริ่มต้นให้ตรงกับภาคเรียนปัจจุบันใน system_settings (เฉพาะตอนที่ academic_terms ยังว่างเปล่า)
INSERT INTO academic_terms (term, academic_year)
  SELECT term, academic_year FROM system_settings WHERE id = 1
  AND NOT EXISTS (SELECT 1 FROM academic_terms);