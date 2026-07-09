-- ============================================================
-- fix_thai_encoding.sql
-- แก้ข้อความไทยที่กลายเป็น ??? เนื่องจาก encoding เพี้ยนตอนโหลด
-- seed data ครั้งแรกผ่าน PowerShell (ไม่ใช่ UTF-8)
-- อ้างอิงค่าดั้งเดิมจาก schema.sql กลับเข้าไปทับของเดิมที่เพี้ยน
-- ============================================================

UPDATE departments SET name = 'เทคโนโลยีสารสนเทศ', "headerName" = 'แผนกเทคโนโลยีสารสนเทศ' WHERE code = 'IT';
UPDATE departments SET name = 'เทคโนโลยี AI', "headerName" = 'แผนกเทคโนโลยี AI' WHERE code = 'AI';
UPDATE departments SET name = 'ไฟฟ้า', "headerName" = 'แผนกไฟฟ้า' WHERE code = 'EE';
UPDATE departments SET name = 'ช่างกล', "headerName" = 'แผนกช่างกล' WHERE code = 'ME';

UPDATE users SET full_name = 'ผู้ดูแลระบบ' WHERE email = 'admin@loeitc.ac.th';
UPDATE users SET full_name = 'นายอัมพร พชรกุล' WHERE email = 'aump@loeitc.ac.th';
UPDATE users SET full_name = 'นายณัฐพงษ์' WHERE email = 'nattapong@loeitc.ac.th';
UPDATE users SET full_name = 'นายประสิทธิ์' WHERE email = 'prasit@loeitc.ac.th';
UPDATE users SET full_name = 'นายสมศักดิ์' WHERE email = 'somsak@loeitc.ac.th';
