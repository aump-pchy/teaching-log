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
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

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

    // 2. ถ้าไม่เจอ Log ให้ส่ง 404 กลับไป
    if (logError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนนี้' });
    }

    // 3. ตรวจสอบสิทธิ์ (Permission Check): ถ้าเป็น teacher ต้องเป็นเจ้าของ log เท่านั้น
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกการสอนของผู้อื่น' });
    }

    // 4. ดึงข้อมูลรูปภาพที่ผูกกับ Log นี้ (จากฟังก์ชัน getImages ด้านล่างมาประกอบ)
    // หมายเหตุ: เพื่อความง่ายและจบใน Endpoint เดียว สามารถดึงรูปแบบมี Signed URL ไปพร้อมกันได้เลย
    const { data: images, error: imgError } = await supabase
      .from('teaching_log_images')
      .select('*')
      .eq('log_id', id)
      .order('sort_order', { ascending: true });

    let imagesWithUrls = [];
    if (!imgError && images) {
      // สร้าง Signed URL ให้แต่ละรูปภาพ (อายุลิงก์ 1 ชั่วโมง)
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

    // 5. ส่งข้อมูล Log พร้อมกับ Array ของรูปภาพกลับไปให้ Frontend
    return res.status(200).json({
      ...log,
      images: imagesWithUrls
    });

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
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
    } = req.body

    if (!subject_name || !topic) {
      return res.status(400).json({ error: 'subject_name and topic are required' })
    }

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
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    const updateData = req.body; // รับฟิลด์ที่จะแก้ไขมาจาก Frontend

    // 1. หาข้อมูล Log เดิมเพื่อเช็กสิทธิ์ก่อน
    const { data: log, error: findError } = await supabase
      .from('teaching_logs')
      .select('user_id')
      .eq('id', id)  
      .single();

    if (findError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการแก้ไข' });
    }

    // 2. ตรวจสอบสิทธิ์: ถ้าเป็น teacher ต้องแก้เฉพาะ log ของตัวเองเท่านั้น
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขบันทึกการสอนของผู้อื่น' });
    }

    // 3. สั่งอัปเดตข้อมูลใน Supabase
    const { data: updatedLog, error: updateError } = await supabase
      .from('teaching_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้: ' + updateError.message });
    }

    // 4. ส่งข้อมูลชิ้นที่อัปเดตแล้วกลับไป
    return res.status(200).json(updatedLog);

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
/**
 * DELETE /api/logs/:id
 */
async function deleteLog(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // 1. หา Log เดิมเพื่อเช็กสิทธิ์ก่อนลบ
    const { data: log, error: findError } = await supabase
      .from('teaching_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (findError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการลบ' });
    }

    // 2. ตรวจสอบสิทธิ์: teacher ลบได้เฉพาะของตัวเอง ส่วน admin ลบได้ทุกคนตาม Matrix
    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบบันทึกการสอนของผู้อื่น' });
    }

    // **เพิ่มเติม** ดึงรายการรูปเพื่อลบไฟล์จริงใน Storage ก่อนลบ Record (ป้องกันไฟล์ขยะค้างในระบบ Cloud)
    const { data: images } = await supabase
      .from('teaching_log_images')
      .select('storage_path')
      .eq('log_id', id);

    if (images && images.length > 0) {
      const pathsToDelete = images.map(img => img.storage_path);
      await supabase.storage.from('teaching-log-images').remove(pathsToDelete);
    }

    // 3. สั่งลบข้อมูลออกจากตาราง (ตารางรูปภาพย่อยจะถูกลบอัตโนมัติด้วย On Delete Cascade บนฐานข้อมูล)
    const { error: deleteError } = await supabase
      .from('teaching_logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: 'ไม่สามารถลบข้อมูลได้: ' + deleteError.message });
    }

    // 4. ส่งข้อความยืนยันความสำเร็จ
    return res.status(200).json({ message: 'Log deleted' });

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
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
  } catch (err) {
    console.error('uploadImage error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * GET /api/logs/:id/images
 */
async function getImages(req, res) {
  try {
    const { id: log_id } = req.params;

    // 1. ดึงรายการรูปภาพจากตาราง เรียงลำดับตาม sort_order
    const { data: images, error: imgError } = await supabase
      .from('teaching_log_images')
      .select('*')
      .eq('log_id', log_id)
      .order('sort_order', { ascending: true });

    if (imgError) {
      return res.status(400).json({ error: imgError.message });
    }

    // 2. วนลูปเพื่อขอ Signed URL (ลิงก์ชั่วคราวในการเปิดเข้าดูรูปที่ถูกซ่อนเป็น Private)
    const imagesWithSignedUrls = await Promise.all(
      images.map(async (img) => {
        const { data: signData, error: signError } = await supabase.storage
          .from('teaching-log-images')
          .createSignedUrl(img.storage_path, 60 * 60); // ลิงก์เปิดรูปใช้งานได้ 1 ชม.

        return {
          ...img,
          signed_url: signData ? signData.signedUrl : null
        };
      })
    );

    // 3. ส่งข้อมูลชุดรูปภาพกลับไปให้ Frontend
    return res.status(200).json(imagesWithSignedUrls);

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

/**
 * DELETE /api/logs/:id/images/:imgId
 */
async function deleteImage(req, res) {
  try {
    const { id: log_id, imgId } = req.params;

    // 1. ค้นหา Record ของรูปภาพในตารางฐานข้อมูลก่อน
    const { data: imgRecord, error: findError } = await supabase
      .from('teaching_log_images')
      .select('*')
      .eq('id', imgId)
      .eq('log_id', log_id)
      .single();

    if (findError || !imgRecord) {
      return res.status(404).json({ error: 'ไม่พบรูปภาพหลักฐานที่ต้องการลบ' });
    }

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

    if (dbDeleteError) {
      return res.status(400).json({ error: 'ไม่สามารถลบข้อมูลรูปภาพออกจากระบบได้: ' + dbDeleteError.message });
    }

    return res.status(200).json({ message: 'Image deleted' });

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

module.exports = {
  getAllLogs, getLogById, createLog, updateLog, deleteLog,
  uploadImage, getImages, deleteImage
}