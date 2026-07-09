const pool = require('../db/pool')
const path = require('path')
const { minioClient, minioPublicClient, BUCKET_NAME } = require('../db/minio')

/**
 * GET /api/logs
 */
async function getAllLogs(req, res) {
  try {
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

    if (userRole === 'teacher') {
      params.push(userId)
      sql += ` AND tl.user_id = $${params.length}`
    }

    if (userRole === 'admin' && dept) {
      if (!isNaN(dept)) {
        params.push(parseInt(dept))
        sql += ` AND u.department_id = $${params.length}`
      } else {
        params.push(dept)
        sql += ` AND d.code = $${params.length}`
      }
    }

    sql += ' ORDER BY tl.id DESC'

    const result = await pool.query(sql, params)

    const formattedLogs = result.rows.map(log => ({
      id: log.id,
      week: log.week,
      subject_code: log.subject_code,
      subject_name: log.subject_name,
      teacher_name: log.teacher_name || 'ไม่ระบุชื่อครู',
      department_name: log.department_name || 'ไม่ระบุแผนกวิชา'
    }))

    return res.status(200).json(formattedLogs)
  } catch (error) {
    console.error('Error in getAllLogs:', error)
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการบันทึกการสอน' })
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
=======
    const logResult = await pool.query(`
      SELECT tl.*, u.full_name AS teacher_name, d.name AS department_name
      FROM teaching_logs tl
      JOIN users u ON u.id = tl.user_id
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE tl.id = $1
    `, [id])
>>>>>>> origin/feature/auth-users

    const log = logResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' })
    }

    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกการสอนของผู้อื่น' })
    }

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

    return res.status(200).json({ ...log, images: imagesWithUrls })
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message })
  }
}

/**
 * POST /api/logs
 */
async function createLog(req, res) {
  try {
    const {
<<<<<<< HEAD
      semester, 
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
      return res.status(400).json({ error: 'subject_name and topic are required' })
    }

<<<<<<< HEAD
    const payload = {
      user_id: req.user.id,
      semester: semester || '1/2567',
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
>>>>>>> origin/feature/auth-users

    return res.status(201).json(result.rows[0])
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
    const { id } = req.params
    const { id: userId, role } = req.user
    const updateData = req.body

    const findResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = findResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการแก้ไข' })
    }
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขบันทึกการสอนของผู้อื่น' })
    }

    const allowedFields = [
      'week', 'date_from', 'date_to', 'subject_name', 'subject_code', 'topic',
      'attendance', 'methods', 'content_methods', 'media', 'apps', 'evaluation',
      'outcome_cognitive', 'outcome_psychomotor', 'outcome_affective', 'outcome_application',
      'problem', 'solution'
    ]
    const jsonFields = ['attendance', 'methods', 'content_methods', 'media', 'apps', 'evaluation']

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

    values.push(id)
    const result = await pool.query(
      `UPDATE teaching_logs SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )

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

    const findResult = await pool.query('SELECT user_id FROM teaching_logs WHERE id = $1', [id])
    const log = findResult.rows[0]
    if (!log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการลบ' })
    }
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบบันทึกการสอนของผู้อื่น' })
    }

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

    return res.status(200).json({ message: 'Log deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message })
  }
}

/**
 * POST /api/logs/:id/images
 * multer memoryStorage ส่งไฟล์มาเป็น req.file.buffer แล้วอัปโหลดขึ้น MinIO ต่อ
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

    return res.status(200).json(imagesWithUrls)
  } catch (err) {
    console.error('getImages error', err)
    return res.status(500).json({ error: 'ไม่สามารถดึงรูปภาพได้' })
  }
}

/**
 * DELETE /api/logs/:id/images/:imgId
 */
async function deleteImage(req, res) {
  try {
    const { id, imgId } = req.params
    const { id: userId, role } = req.user

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