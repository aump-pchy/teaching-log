const supabase = require('../db/supabase')

/**
 * GET /api/logs
 * - admin → เห็นทุก log (filter by ?dept=IT ได้)
 * - teacher → เห็นแค่ log ตัวเอง
 */
async function getAllLogs(req, res) {
  try {
// 2. เปิดใช้งานตัวแปรแกะ Token จริงที่ผูกไว้กับ authMiddleware คืนมา:
    const { id: userId, role: userRole } = req.user;
    
    // ดึงค่า query ตัวกรองรหัสแผนก เช่น ?dept=IT, ?dept=EE
    const { dept } = req.query; 

    // 2. ดึงข้อมูลตาราง teaching_logs พร้อม Join ตาราง users และ departments
    // อิงตามฟิลด์ full_name, department_id และ code, name
    let query = supabase
      .from('teaching_logs')
      .select(`
        *,
        users!inner (
          id,
          full_name,
          department_id,
          departments!inner (
            id,
            code,
            name
          )
        )
      `);

    // 3. เงื่อนไขสำหรับคุณครู (Teacher) -> ดึงเฉพาะงานที่มี user_id ตรงกับตัวเอง
    if (userRole === 'teacher') {
      query = query.eq('user_id', userId);
    }

    // 4. เงื่อนไขสำหรับแอดมิน (Admin) -> ถ้ามีการแนบรหัสแผนกมา ให้กรองตามฟิลด์ code ในตาราง departments
if (userRole === 'admin' && dept) {
      query = query.eq('users.department_id', dept);
    }

    // 5. สั่งให้คำสั่งทำงานดึงข้อมูลจริงจาก Supabase
    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    // 6. แปลงร่างข้อมูล (Formatting) ให้อยู่ในโครงสร้างที่หน้าบ้าน Vue 3 พร้อมใช้งานได้ทันที
    const formattedLogs = logs.map(log => ({
      id: log.id,
      week: log.week,
      subject_code: log.subject_code,
      subject_name: log.subject_name,
      // ดึงฟิลด์ full_name จากตาราง users
      teacher_name: log.users ? log.users.full_name : 'ไม่ระบุชื่อครู',
      // ดึงฟิลด์ name จากตาราง departments
      department_name: (log.users && log.users.departments) ? log.users.departments.name : 'ไม่ระบุแผนกวิชา'
    }));

    // 7. ส่ง Array ข้อมูลกลับสำเร็จเป็น JSON
    return res.status(200).json(formattedLogs);

  } catch (error) {
    console.error('Error in getAllLogs:', error);
    // ส่ง Error Format ตามสัญญากลุ่ม
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการบันทึกการสอน' });
  }
}

/**
 * GET /api/logs/:id
 */
async function getLogById(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. query log นั้น พร้อม images
  // TODO: 3. ถ้าไม่เจอ → return 404
  // TODO: 4. ถ้า teacher และ log.user_id !== req.user.id → return 403
  // TODO: 5. return log พร้อม images array
}

/**
 * POST /api/logs
 * body: { week, date_from, date_to, subject_name, subject_code, topic,
 *         attendance, methods, content_methods, media, apps, evaluation,
 *         outcome_*, problem, solution }
 */
async function createLog(req, res) {
  // TODO: 1. รับ fields จาก req.body
  // TODO: 2. validate fields ที่จำเป็น
  // TODO: 3. set user_id = req.user.id
  // TODO: 4. insert ลง teaching_logs
  // TODO: 5. return log ที่สร้างใหม่
}

/**
 * PUT /api/logs/:id
 */
async function updateLog(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. หา log นั้น — ถ้าไม่เจอ → 404
  // TODO: 3. ถ้า teacher และ log.user_id !== req.user.id → 403
  // TODO: 4. update ใน supabase
  // TODO: 5. return log ที่อัปเดตแล้ว
}

/**
 * DELETE /api/logs/:id
 */
async function deleteLog(req, res) {
  // TODO: 1. รับ id จาก req.params.id
  // TODO: 2. หา log นั้น — ถ้าไม่เจอ → 404
  // TODO: 3. ถ้า teacher และ log.user_id !== req.user.id → 403
  // TODO: 4. delete log (images จะถูกลบ cascade อัตโนมัติ)
  // TODO: 5. return { message: 'Log deleted' }
}

/**
 * POST /api/logs/:id/images
 * multipart/form-data: file (image), caption, section
 * บังคับอย่างน้อย 1 รูปก่อน submit log
 */
async function uploadImage(req, res) {
  // TODO: 1. รับ file จาก req.file (multer)
  // TODO: 2. รับ caption, section จาก req.body
  // TODO: 3. upload file ไปยัง Supabase Storage bucket 'teaching-log-images'
  //          path: `logs/${log_id}/${Date.now()}_${filename}`
  // TODO: 4. insert record ลง teaching_log_images (log_id, storage_path, caption, section)
  // TODO: 5. return image record ที่สร้างใหม่
}

/**
 * GET /api/logs/:id/images
 */
async function getImages(req, res) {
  // TODO: 1. รับ log_id จาก req.params.id
  // TODO: 2. query teaching_log_images where log_id = id order by sort_order
  // TODO: 3. สร้าง signed URL จาก Supabase Storage สำหรับแต่ละรูป
  // TODO: 4. return images array พร้อม signed_url
}

/**
 * DELETE /api/logs/:id/images/:imgId
 */
async function deleteImage(req, res) {
  // TODO: 1. รับ log_id, imgId จาก req.params
  // TODO: 2. หา image record — ถ้าไม่เจอ → 404
  // TODO: 3. ลบไฟล์จาก Supabase Storage
  // TODO: 4. ลบ record จาก teaching_log_images
  // TODO: 5. return { message: 'Image deleted' }
}

module.exports = {
  getAllLogs, getLogById, createLog, updateLog, deleteLog,
  uploadImage, getImages, deleteImage
}
