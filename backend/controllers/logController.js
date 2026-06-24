const supabase = require('../db/supabase')

/**
 * GET /api/logs
 * - admin → เห็นทุก log (filter by ?dept=IT ได้)
 * - teacher → เห็นแค่ log ตัวเอง
 */
async function getAllLogs(req, res) {
  try {
    // 1. พิมพ์ปลอมตัวตนเป็นแอดมินไว้ตรงนี้เลยค่ะ (หรือจะเปลี่ยนเป็น 'teacher' ก็ได้น้า)
    //const userId = 3; 
    //const userRole = 'admin'; // เปลี่ยนเป็น 'admin' เพื่อทดสอบสิทธิ์แอดมิน

    // 2. เปิดใช้งานตัวแปรแกะ Token จริงที่ผูกไว้กับ authMiddleware คืนมา:
    const { id: userId, role: userRole } = req.user;
    
    // ดึงค่า query ตัวกรองรหัสแผนก เช่น ?dept=IT, ?dept=EE
    const { dept } = req.query; 

   // 2. ดึงข้อมูลตาราง teaching_logs พร้อม Join ตาราง users และ departments
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

    // 3. เงื่อนไขสำหรับคุณครู (Teacher) -> เห็นเฉพาะงานตัวเอง
    if (userRole === 'teacher') {
      query = query.eq('user_id', userId);
    }

    // 4. ปลดล็อกระบบกรองของแอดมินให้ฉลาดและตรงกับดาต้าเบส
    if (userRole === 'admin' && dept) {
      // ตรวจสอบว่าถ้าหน้าบ้านส่งค่ามาเป็นตัวเลข (เช่น 1, 2, 3) ให้กรองผ่าน department_id ตรงๆ
      if (!isNaN(dept)) {
        query = query.eq('users.department_id', parseInt(dept));
      } else {
        query = query.filter('users.departments.code', 'eq', dept);
      }
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
  try {
    const {
      week,
      date_from,
      date_to,
      subject_name,
      subject_code,
      topic,
      attendance,
      methods,
      content_methods,
      media,
      apps,
      evaluation,
      outcome_cognitive,
      outcome_psychomotor,
      outcome_affective,
      outcome_application,
      problem,
      solution
    } = req.body

    if (!subject_name || !topic) {
      return res.status(400).json({ error: 'subject_name and topic are required' })
    }

    const payload = {
      user_id: req.user.id,
      week: Number(week) || 1,
      date_from: date_from || '',
      date_to: date_to || '',
      subject_name,
      subject_code: subject_code || '',
      topic,
      attendance: attendance || [],
      methods: methods || {},
      content_methods: content_methods || {},
      media: media || {},
      apps: apps || {},
      evaluation: evaluation || {},
      outcome_cognitive: outcome_cognitive || '',
      outcome_psychomotor: outcome_psychomotor || '',
      outcome_affective: outcome_affective || '',
      outcome_application: outcome_application || '',
      problem: problem || '',
      solution: solution || ''
    }

    const { data, error } = await supabase
      .from('teaching_logs')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data)
  } catch (err) {
    console.error('createLog error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
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
  try {
    const logId = Number(req.params.id)
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' })
    }

    const { caption, section } = req.body
    const logResult = await supabase
      .from('teaching_logs')
      .select('id, user_id')
      .eq('id', logId)
      .single()

    if (logResult.error || !logResult.data) {
      return res.status(404).json({ error: 'Log not found' })
    }

    const log = logResult.data
    if (req.user.role !== 'admin' && log.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const fileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = `logs/${logId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('teaching-log-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      })

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message })
    }

    const sortOrderResult = await supabase
      .from('teaching_log_images')
      .select('sort_order', { count: 'exact' })
      .eq('log_id', logId)

    let sortOrder = 0
    if (!sortOrderResult.error && Array.isArray(sortOrderResult.data)) {
      sortOrder = sortOrderResult.data.length
    }

    const { data, error: insertError } = await supabase
      .from('teaching_log_images')
      .insert({
        log_id: logId,
        storage_path: filePath,
        caption: caption || '',
        section: section || 'other',
        sort_order: sortOrder
      })
      .select('*')
      .single()

    if (insertError) {
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(201).json(data)
  } catch (err) {
    console.error('uploadImage error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
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
