const pool = require('../db/pool')
const path = require('path')
const { minioClient, minioPublicClient, BUCKET_NAME } = require('../db/minio')

/**
 * GET /api/logs
 */
async function getAllLogs(req, res) {
  try {
<<<<<<< HEAD
    const { id: userId, role: userRole } = req.user;
    const { dept } = req.query; 

    // 🟢 [แก้ไข] ดึง teaching_logs แบบเปล่าๆ ก่อน ไม่ทำ nested embed (users!inner -> departments!inner)
    // เพราะ Supabase/PostgREST จะโยน error "more than one relationship was found" หรือ join พังได้
    // ถ้า schema มีความสัมพันธ์ซ้อนกันหลายทาง ทำให้ endpoint นี้ 500 แบบสุ่ม
    let query = supabase.from('teaching_logs').select('*');

=======
    const { id: userId, role: userRole } = req.user
    const { dept } = req.query

    let sql = `
      SELECT tl.*, u.full_name AS teacher_name, d.name AS department_name, d.id AS dept_id
      FROM teaching_logs tl
      JOIN users u ON u.id = tl.user_id
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE 1=1
    `
    const params = []

>>>>>>> origin/feature/auth-users
    if (userRole === 'teacher') {
      params.push(userId)
      sql += ` AND tl.user_id = $${params.length}`
    }

<<<<<<< HEAD
    const { data: logs, error } = await query;
=======
    if (userRole === 'admin' && dept) {
      if (!isNaN(dept)) {
        params.push(parseInt(dept))
        sql += ` AND u.department_id = $${params.length}`
      } else {
        params.push(dept)
        sql += ` AND d.code = $${params.length}`
      }
    }
>>>>>>> origin/feature/auth-users

    sql += ' ORDER BY tl.id DESC'

<<<<<<< HEAD
    // 🟢 ดึงข้อมูลครู + แผนกวิชา แยกอีกก้อนหนึ่ง แล้วค่อยเอามาต่อกันฝั่ง JS (ปลอดภัยกว่า embed)
    const userIds = [...new Set((logs || []).map(l => l.user_id).filter(Boolean))];
    let usersMap = {};

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, department_id, departments ( id, code, name )')
        .in('id', userIds);

      if (usersError) {
        throw usersError;
      }

      usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));
    }

    let formattedLogs = (logs || []).map(log => {
      const user = usersMap[log.user_id];
      const department = user ? user.departments : null;

      return {
        id: log.id,
        week: log.week,
        subject_code: log.subject_code,
        subject_name: log.subject_name,
        // 🟢 [แก้ไข] เดิม endpoint นี้ไม่ส่ง semester/term กลับไปเลย
        // ทำให้หน้าบ้าน (LogListView) หาค่า log.semester ไม่เจอ -> ตัวเลือกภาคเรียนว่างเปล่าตลอด
        semester: log.semester,
        term: log.term,
        teacher_name: user ? user.full_name : 'ไม่ระบุชื่อครู',
        department_name: department ? department.name : 'ไม่ระบุแผนกวิชา',
        department_code: department ? department.code : null,
        department_id: user ? user.department_id : null
      };
    });

    if (userRole === 'admin' && dept) {
      if (!isNaN(dept)) {
        formattedLogs = formattedLogs.filter(l => String(l.department_id) === String(dept));
      } else {
        formattedLogs = formattedLogs.filter(l => l.department_code === dept);
      }
    }

    return res.status(200).json(formattedLogs);
=======
    const result = await pool.query(sql, params)

    const formattedLogs = result.rows.map(log => ({
      id: log.id,
      week: log.week,
      subject_code: log.subject_code,
      subject_name: log.subject_name,
      teacher_name: log.teacher_name || 'ไม่ระบุชื่อครู',
      department_name: log.department_name || 'ไม่ระบุแผนกวิชา'
    }))
>>>>>>> origin/feature/auth-users

    return res.status(200).json(formattedLogs)
  } catch (error) {
<<<<<<< HEAD
    console.error('Error in getAllLogs:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการบันทึกการสอน' });
=======
    console.error('Error in getAllLogs:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการบันทึกการสอน' })
>>>>>>> origin/feature/auth-users
  }
}

/**
 * GET /api/logs/:id
 */
async function getLogById(req, res) {
  try {
    const { id } = req.params
    const { id: userId, role } = req.user

<<<<<<< HEAD
<<<<<<< HEAD
    const { data: log, error: logError } = await supabase
      .from('teaching_logs')
      .select(`
        *,
        users (
          full_name,
          department_id,
          departments ( name, headerName )
        )
      `)
      .eq('id', id)
      .single()

    if (logError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' });
=======
    // 1. ดึงข้อมูล teaching_log พร้อมดึงชื่อผู้สอน (users) และชื่อแผนก (departments)
    const { data: log, error: logError } = await supabase
  .from('teaching_logs')
  .select(`
    *,
    users (
      full_name,
      department_id,
      departments ( name, headerName )
    )
  `)
  .eq('id', id)
  .single()
>>>>>>> origin/feature/log-form
=======
    const logResult = await pool.query(`
      SELECT tl.*, u.full_name AS teacher_name, d.name AS department_name
      FROM teaching_logs tl
      JOIN users u ON u.id = tl.user_id
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE tl.id = $1
    `, [id])
<<<<<<< HEAD
=======
>>>>>>> origin/feature/auth-users
>>>>>>> origin/feature/log-form

    const log = logResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' })
>>>>>>> origin/feature/auth-users
    }

    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกการสอนของผู้อื่น' })
    }

<<<<<<< HEAD
    const { data: images, error: imgError } = await supabase
      .from('teaching_log_images')
      .select('*')
      .eq('log_id', id)
      .order('sort_order', { ascending: true });

    let imagesWithUrls = [];
    if (!imgError && images) {
      imagesWithUrls = await Promise.all(
        images.map(async (img) => {
          const { data: signData } = await supabase.storage
            .from('teaching-log-images')
            .createSignedUrl(img.storage_path, 60 * 60);
          
          return {
            ...img,
            signed_url: signData ? signData.signedUrl : null
          };
        })
      );
    }

    return res.status(200).json({
      ...log,
      images: imagesWithUrls
    });
=======
    const imagesResult = await pool.query(
      'SELECT * FROM teaching_log_images WHERE log_id = $1 ORDER BY sort_order ASC',
      [id]
    )

    // สร้าง signed URL ชั่วคราวจาก MinIO (อายุ 1 ชั่วโมง) แทนของ Supabase Storage เดิม
    const imagesWithUrls = await Promise.all(
      imagesResult.rows.map(async (img) => {
        let signed_url = null
        try {
          signed_url = await minioPublicClient.presignedGetObject(BUCKET_NAME, img.storage_path, 60 * 60)
        } catch (err) {
          console.error(`ไม่สามารถสร้าง signed URL สำหรับ ${img.storage_path}:`, err.message)
        }
        return { ...img, signed_url }
      })
    )
>>>>>>> origin/feature/auth-users

    return res.status(200).json({ ...log, images: imagesWithUrls })
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message })
  }
}

/**
 * POST /api/logs
<<<<<<< HEAD
 * สร้างบันทึกใหม่ ดึงรายชื่อผู้บริหารชุดปัจจุบัน (Snapshot) มาฝังล็อกค้างไว้ใน Record ทันที
=======
>>>>>>> origin/feature/auth-users
 */

async function createLog(req, res) {
  try {
    const {
<<<<<<< HEAD
      semester, 
      term, // 🟢 รองรับกรณีหน้าบ้านส่งชื่อตัวแปรนี้มาจ้า
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
=======
      week, date_from, date_to, subject_name, subject_code, topic,
      attendance, methods, content_methods, media, apps, evaluation,
      outcome_cognitive, outcome_psychomotor, outcome_affective, outcome_application,
      problem, solution
>>>>>>> origin/feature/auth-users
    } = req.body

    if (!subject_name || !topic) {
      return res.status(400).json({ error: 'จำเป็นต้องระบุชื่อวิชาและหัวข้อเรื่องที่สอน' })
    }

<<<<<<< HEAD
<<<<<<< HEAD
    // 🟢 ดึงข้อมูลผู้บริหารและภาคเรียนปัจจุบันจากตารางระบบกลาง (id = 1)
    const { data: adminConfig, error: configError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (configError) {
      console.error('ไม่สามารถดึงข้อมูลจากระบบกลางได้:', configError);
    }

    // 🟢 คำนวณหาค่าภาคเรียนที่ถูกต้องที่สุด ถ้าหน้าบ้านส่งมาว่าง ให้ดึงจากระบบกลาง ถ้าไม่มีจริงๆ ให้ใช้ 1/2569 ตามใจลูกสาวเลยจ้า!
    let finalSemester = semester || term;
    if (!finalSemester && adminConfig) {
      finalSemester = `${adminConfig.term}/${adminConfig.academic_year}`;
    }
    if (!finalSemester) {
      finalSemester = '1/2569'; // 🟢 ล็อกเป็นปี 2569 เรียบร้อยแล้วค๊าาา
    }

    // ประกอบก้อนข้อมูลนำส่ง Supabase
=======
>>>>>>> origin/feature/log-form
    const payload = {
      user_id: req.user.id,
      semester: finalSemester, // 🟢 ใช้ภาคเรียนที่เป็นปี 2569 มุ่งตรงสู่ฐานข้อมูล
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
      solution: solution || '',
      
      // 🟢 แปลงค่าเป็น String ป้องกันฐานข้อมูลเออเร่อ
      head_curriculum: (adminConfig && adminConfig.head_curriculum) ? String(adminConfig.head_curriculum) : null,
      deputy_academic: (adminConfig && adminConfig.deputy_academic) ? String(adminConfig.deputy_academic) : null,
      director: (adminConfig && adminConfig.director) ? String(adminConfig.director) : null
    }
<<<<<<< HEAD

    // 🟢 สั่งบันทึกลงตารางหลัก
    const { data, error: insertError } = await supabase
      .from('teaching_logs')
      .insert(payload)
      .select('*')
      .single()

    if (insertError) {
      console.error("❌ Supabase ปฏิเสธการบันทึกเนื่องจาก:", insertError.message, insertError.details);
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(201).json(data)
=======
>>>>>>> origin/feature/log-form
=======
    const result = await pool.query(`
      INSERT INTO teaching_logs (
        user_id, week, date_from, date_to, subject_name, subject_code, topic,
        attendance, methods, content_methods, media, apps, evaluation,
        outcome_cognitive, outcome_psychomotor, outcome_affective, outcome_application,
        problem, solution
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *
    `, [
      req.user.id, Number(week) || 1, date_from || '', date_to || '', subject_name,
      subject_code || '', topic, JSON.stringify(attendance || []), JSON.stringify(methods || {}),
      JSON.stringify(content_methods || {}), JSON.stringify(media || {}), JSON.stringify(apps || {}),
      JSON.stringify(evaluation || {}), outcome_cognitive || '', outcome_psychomotor || '',
      outcome_affective || '', outcome_application || '', problem || '', solution || ''
    ])
<<<<<<< HEAD
=======
>>>>>>> origin/feature/auth-users
>>>>>>> origin/feature/log-form

    return res.status(201).json(result.rows[0])
>>>>>>> origin/feature/auth-users
  } catch (err) {
    console.error('createLog error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * PUT /api/logs/:id
 */
async function updateLog(req, res) {
  try {
<<<<<<< HEAD
    const { id } = req.params;
    const { id: userId, role } = req.user;
    const updateData = req.body; 

    const { data: log, error: findError } = await supabase
      .from('teaching_logs')
      .select('user_id')
      .eq('id', id)  
      .single();

    if (findError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการแก้ไข' });
    }

=======
    const { id } = req.params
    const { id: userId, role } = req.user
    const updateData = req.body

    const findResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = findResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการแก้ไข' })
    }
>>>>>>> origin/feature/auth-users
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขบันทึกการสอนของผู้อื่น' })
    }

<<<<<<< HEAD
    const { data: updatedLog, error: updateError } = await supabase
      .from('teaching_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
=======
    const allowedFields = [
      'week', 'date_from', 'date_to', 'subject_name', 'subject_code', 'topic',
      'attendance', 'methods', 'content_methods', 'media', 'apps', 'evaluation',
      'outcome_cognitive', 'outcome_psychomotor', 'outcome_affective', 'outcome_application',
      'problem', 'solution'
    ]
    const jsonFields = ['attendance', 'methods', 'content_methods', 'media', 'apps', 'evaluation']
>>>>>>> origin/feature/auth-users

    const fields = []
    const values = []
    let i = 1
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${i++}`)
        values.push(jsonFields.includes(key) ? JSON.stringify(updateData[key]) : updateData[key])
      }
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลให้แก้ไข' })
    }

<<<<<<< HEAD
    return res.status(200).json(updatedLog);
=======
    values.push(id)
    const result = await pool.query(
      `UPDATE teaching_logs SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
>>>>>>> origin/feature/auth-users

    return res.status(200).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message })
  }
}

/**
 * DELETE /api/logs/:id
 */
async function deleteLog(req, res) {
  try {
    const { id } = req.params
    const { id: userId, role } = req.user

<<<<<<< HEAD
    const { data: log, error: findError } = await supabase
      .from('teaching_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (findError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการลบ' });
    }

=======
    const findResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = findResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการลบ' })
    }
>>>>>>> origin/feature/auth-users
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบบันทึกการสอนของผู้อื่น' })
    }

<<<<<<< HEAD
    const { data: images } = await supabase
      .from('teaching_log_images')
      .select('storage_path')
      .eq('log_id', id);

    if (images && images.length > 0) {
      const pathsToDelete = images.map(img => img.storage_path);
      await supabase.storage.from('teaching-log-images').remove(pathsToDelete);
    }

    const { error: deleteError } = await supabase
      .from('teaching_logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: 'ไม่สามารถลบข้อมูลได้: ' + deleteError.message });
    }

    return res.status(200).json({ message: 'Log deleted' });
=======
    // ลบไฟล์รูปจริงใน MinIO ก่อนลบ record (ป้องกันไฟล์ค้างใน bucket)
    const imagesResult = await pool.query('SELECT storage_path FROM teaching_log_images WHERE log_id = $1', [id])
    await Promise.all(
      imagesResult.rows.map((img) =>
        minioClient.removeObject(BUCKET_NAME, img.storage_path).catch((err) =>
          console.error(`ลบไฟล์ ${img.storage_path} ใน MinIO ไม่สำเร็จ:`, err.message)
        )
      )
    )

    await pool.query('DELETE FROM teaching_logs WHERE id = $1', [id])
>>>>>>> origin/feature/auth-users

    return res.status(200).json({ message: 'Log deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message })
  }
}

/**
 * POST /api/logs/:id/images
<<<<<<< HEAD
=======
 * multer memoryStorage ส่งไฟล์มาเป็น req.file.buffer แล้วอัปโหลดขึ้น MinIO ต่อ
>>>>>>> origin/feature/auth-users
 */
async function uploadImage(req, res) {
  try {
<<<<<<< HEAD
    const logId = Number(req.params.id)
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' })
    }

    const { caption, section, sections } = req.body
    // 🎯 รองรับทั้งแบบเก่า (section เดี่ยว) และแบบใหม่ (sections หลายค่า ส่งมาเป็น JSON array string)
    let sectionList = []
    if (sections) {
      try {
        sectionList = JSON.parse(sections)
      } catch {
        sectionList = [sections]
      }
    } else if (section) {
      sectionList = [section]
    }
    if (!Array.isArray(sectionList) || sectionList.length === 0) {
      sectionList = ['other']
    }
    console.log('🔍 uploadImage received sectionList:', JSON.stringify(sectionList))
    const logResult = await supabase
      .from('teaching_logs')
      .select('id, user_id')
      .eq('id', logId)
      .single()
=======
    const { id } = req.params
    const { id: userId, role } = req.user
    const { caption, section } = req.body
    const file = req.file
>>>>>>> origin/feature/auth-users

    if (!file) {
      return res.status(400).json({ error: 'กรุณาแนบไฟล์ภาพ' })
    }

    const logResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = logResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' })
    }
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกการสอนของผู้อื่น' })
    }

    const ext = path.extname(file.originalname) || ''
    const objectName = `logs/${id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`

    await minioClient.putObject(BUCKET_NAME, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    })

    const result = await pool.query(
      `INSERT INTO teaching_log_images (log_id, storage_path, caption, section, sort_order)
       VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM teaching_log_images WHERE log_id = $1))
       RETURNING *`,
      [id, objectName, caption || '', section || 'other']
    )

    const signed_url = await minioPublicClient.presignedGetObject(BUCKET_NAME, objectName, 60 * 60)

<<<<<<< HEAD
    let sortOrder = 0
    if (!sortOrderResult.error && Array.isArray(sortOrderResult.data)) {
      sortOrder = sortOrderResult.data.length
    }

<<<<<<< HEAD
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
     
=======
    // 🎯 insert 1 แถวต่อ 1 หมวดที่เลือก (ใช้ไฟล์/storage_path เดียวกันทุกแถว)
    const rowsToInsert = sectionList.map((sec, idx) => ({
      log_id: logId,
      storage_path: filePath,
      caption: caption || '',
      section: sec || 'other',
      sort_order: sortOrder + idx
    }))

    const { data, error: insertError } = await supabase
      .from('teaching_log_images')
      .insert(rowsToInsert)
      .select('*')

>>>>>>> origin/feature/log-form
    if (insertError) {
      return res.status(500).json({ error: insertError.message })
    }

    return res.status(201).json(data)
=======
    return res.status(201).json({ ...result.rows[0], signed_url })
>>>>>>> origin/feature/auth-users
  } catch (err) {
    console.error('uploadImage error', err)
    return res.status(500).json({ error: 'อัปโหลดภาพไม่สำเร็จ' })
  }
}

/**
 * GET /api/logs/:id/images
 */
async function getImages(req, res) {
  try {
    const { id } = req.params
    const { id: userId, role } = req.user

<<<<<<< HEAD
    const { data: images, error: imgError } = await supabase
      .from('teaching_log_images')
      .select('*')
      .eq('log_id', log_id)
      .order('sort_order', { ascending: true });

    if (imgError) {
      return res.status(400).json({ error: imgError.message });
    }

    const imagesWithSignedUrls = await Promise.all(
      images.map(async (img) => {
        const { data: signData, error: signError } = await supabase.storage
          .from('teaching-log-images')
          .createSignedUrl(img.storage_path, 60 * 60);
=======
    const logResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = logResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' })
    }
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกการสอนของผู้อื่น' })
    }

    const result = await pool.query(
      'SELECT * FROM teaching_log_images WHERE log_id = $1 ORDER BY sort_order ASC',
      [id]
    )
>>>>>>> origin/feature/auth-users

    const imagesWithUrls = await Promise.all(
      result.rows.map(async (img) => {
        let signed_url = null
        try {
          signed_url = await minioPublicClient.presignedGetObject(BUCKET_NAME, img.storage_path, 60 * 60)
        } catch (err) {
          console.error(`ไม่สามารถสร้าง signed URL สำหรับ ${img.storage_path}:`, err.message)
        }
        return { ...img, signed_url }
      })
    )

<<<<<<< HEAD
    return res.status(200).json(imagesWithSignedUrls);

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
=======
    return res.status(200).json(imagesWithUrls)
  } catch (err) {
    console.error('getImages error', err)
    return res.status(500).json({ error: 'ไม่สามารถดึงรูปภาพได้' })
>>>>>>> origin/feature/auth-users
  }
}

/**
 * DELETE /api/logs/:id/images/:imgId
 */
async function deleteImage(req, res) {
  try {
    const { id, imgId } = req.params
    const { id: userId, role } = req.user

<<<<<<< HEAD
    const { data: imgRecord, error: findError } = await supabase
      .from('teaching_log_images')
      .select('*')
      .eq('id', imgId)
      .eq('log_id', log_id)
      .single();

    if (findError || !imgRecord) {
      return res.status(404).json({ error: 'ไม่พบรูปภาพหลักฐานที่ต้องการลบ' });
    }

    const { error: storageError } = await supabase.storage
      .from('teaching-log-images')
      .remove([imgRecord.storage_path]);

    if (storageError) {
      return res.status(400).json({ error: 'ไม่สามารถลบไฟล์จากระบบจัดเก็บรูปภาพได้: ' + storageError.message });
    }

    const { error: dbDeleteError } = await supabase
      .from('teaching_log_images')
      .delete()
      .eq('id', imgId);
=======
    const logResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = logResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' })
    }
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบรูปของผู้อื่น' })
    }

<<<<<<< HEAD
    // 2. เช็คก่อนว่ามีแถวอื่นในตารางที่อ้างอิง storage_path เดียวกันอยู่ไหม
    //    (เพราะรูปเดียวกันอาจถูกแท็กหลายหมวด เลยมีหลายแถวชี้ไปไฟล์เดียวกัน)
    const { data: siblingRows, error: siblingError } = await supabase
      .from('teaching_log_images')
      .select('id')
      .eq('storage_path', imgRecord.storage_path)
      .neq('id', imgId);

    if (siblingError) {
      return res.status(400).json({ error: 'ตรวจสอบข้อมูลรูปภาพซ้ำไม่สำเร็จ: ' + siblingError.message });
    }

    // 3. ลบไฟล์จริงออกจาก Storage เฉพาะกรณีที่ไม่มีแถวอื่นใช้ไฟล์นี้ร่วมอยู่แล้วเท่านั้น
    if (!siblingRows || siblingRows.length === 0) {
      const { error: storageError } = await supabase.storage
        .from('teaching-log-images')
        .remove([imgRecord.storage_path]);

      if (storageError) {
        return res.status(400).json({ error: 'ไม่สามารถลบไฟล์จากระบบจัดเก็บรูปภาพได้: ' + storageError.message });
      }
    }

    // 4. ลบ Record ประวัติข้อมูลรูปภาพนี้ออกจากตาราง
    const { error: dbDeleteError } = await supabase
      .from('teaching_log_images')
      .delete()
      .eq('id', imgId);
=======
    const imgResult = await pool.query(
      'SELECT * FROM teaching_log_images WHERE id = $1 AND log_id = $2',
      [imgId, id]
    )
    const img = imgResult.rows[0]
    if (!img) {
      return res.status(404).json({ error: 'ไม่พบรูปภาพนี้' })
    }

    await minioClient.removeObject(BUCKET_NAME, img.storage_path)
    await pool.query('DELETE FROM teaching_log_images WHERE id = $1', [imgId])
>>>>>>> origin/feature/auth-users

    return res.status(200).json({ message: 'ลบรูปภาพสำเร็จ' })
  } catch (err) {
    console.error('deleteImage error', err)
    return res.status(500).json({ error: 'ไม่สามารถลบรูปภาพได้' })
  }
}

module.exports = {
  getAllLogs, getLogById, createLog, updateLog, deleteLog,
  uploadImage, getImages, deleteImage
}