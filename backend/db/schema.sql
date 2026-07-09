-- ================= DEPARTMENTS =================
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  "headerName" VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= USERS =================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'teacher',
  department_id INTEGER REFERENCES departments(id),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  auth_id VARCHAR(255)
);

-- ================= SYSTEM SETTINGS =================
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  term VARCHAR(20),
  academic_year VARCHAR(20),
  head_curriculum VARCHAR(255),
  deputy_academic VARCHAR(255),
  director VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= ACADEMIC TERMS (ประวัติภาคเรียน/ปีการศึกษาที่เคยเปิดทั้งหมด) =================
-- 🔧 [เพิ่มใหม่] ตารางนี้หายไปจาก schema เดิม แต่ systemController.js (getTerms/addTerm)
-- และหน้า AdminConfigView.vue เรียกใช้งานอยู่จริง ทำให้เจอ error 42P01
-- "relation academic_terms does not exist" ตอนกด /admin/config
CREATE TABLE academic_terms (
  id SERIAL PRIMARY KEY,
  term VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= TEACHING LOGS (ชื่อตารางตรงกับที่ logController.js เรียก) =================
CREATE TABLE teaching_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  semester VARCHAR(20),
  week INTEGER,
  date_from VARCHAR(50),
  date_to VARCHAR(50),
  subject_name VARCHAR(255),
  subject_code VARCHAR(50),
  topic TEXT,
  attendance JSONB,
  methods JSONB,
  content_methods JSONB,
  media JSONB,
  apps JSONB,
  evaluation JSONB,
  outcome_cognitive TEXT,
  outcome_psychomotor TEXT,
  outcome_affective TEXT,
  outcome_application TEXT,
  problem TEXT,
  solution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  head_curriculum VARCHAR(255),
  deputy_academic VARCHAR(255),
  director VARCHAR(255)
);

CREATE TABLE teaching_log_images (
  id SERIAL PRIMARY KEY,
  log_id INTEGER REFERENCES teaching_logs(id) ON DELETE CASCADE,
  storage_path VARCHAR(500),
  caption TEXT,
  section VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================= SEED DATA =================
INSERT INTO departments (code, name, "headerName") VALUES
  ('IT', 'เทคโนโลยีสารสนเทศ', 'แผนกเทคโนโลยีสารสนเทศ'),
  ('AI', 'เทคโนโลยี AI', 'แผนกเทคโนโลยี AI'),
  ('EE', 'ไฟฟ้า', 'แผนกไฟฟ้า'),
  ('ME', 'ช่างกล', 'แผนกช่างกล');

INSERT INTO system_settings (id, term, academic_year) VALUES (1, '1', '2569');

-- ให้ตรงกับภาคเรียนเริ่มต้นที่ตั้งไว้ใน system_settings ด้านบน
INSERT INTO academic_terms (term, academic_year) VALUES ('1', '2569');

-- password ของทุกคนคือ "password123" (แฮชด้วย bcrypt ไว้ล่วงหน้าแล้ว)
INSERT INTO users (email, password_hash, full_name, role, department_id, is_approved) VALUES
  ('admin@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'ผู้ดูแลระบบ', 'admin', NULL, true),
  ('aump@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายอัมพร พชรกุล', 'teacher', 1, true),
  ('nattapong@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายณัฐพงษ์', 'teacher', 2, true),
  ('prasit@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายประสิทธิ์', 'teacher', 3, true),
  ('somsak@loeitc.ac.th', '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW', 'นายสมศักดิ์', 'teacher', 4, true);