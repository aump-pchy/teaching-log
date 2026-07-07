-- seed.sql — เฉพาะ INSERT เท่านั้น ใช้ตอน re-seed หลัง TRUNCATE
-- (ไม่มี CREATE TABLE เพื่อไม่ชนกับ table ที่มีอยู่แล้ว)

INSERT INTO departments (code, name, "headerName") VALUES
  ('IT', 'เทคโนโลยีสารสนเทศ', 'แผนกเทคโนโลยีสารสนเทศ'),
  ('AI', 'เทคโนโลยี AI', 'แผนกเทคโนโลยี AI'),
  ('EE', 'ไฟฟ้า', 'แผนกไฟฟ้า'),
  ('ME', 'ช่างกล', 'แผนกช่างกล');

INSERT INTO system_settings (id, term, academic_year) VALUES (1, '1', '2569')
  ON CONFLICT (id) DO UPDATE SET term = EXCLUDED.term, academic_year = EXCLUDED.academic_year;

-- password ของทุกคนคือ "password123" (แฮชด้วย bcrypt ไว้ล่วงหน้าแล้ว)
INSERT INTO users (email, password_hash, full_name, role, department_id, is_approved) VALUES
  ('admin@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'ผู้ดูแลระบบ', 'admin', NULL, true),
  ('aump@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายอัมพร พชรกุล', 'teacher', 1, true),
  ('nattapong@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายณัฐพงษ์', 'teacher', 2, true),
  ('prasit@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายประสิทธิ์', 'teacher', 3, true),
  ('somsak@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายสมศักดิ์', 'teacher', 4, true);