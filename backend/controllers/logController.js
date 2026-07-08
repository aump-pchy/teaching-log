const supabase = require('../db/supabase')

/**
 * GET /api/logs
 * - admin → เห็นทุก log (filter by ?dept=IT ได้)
 * - teacher → เห็นแค่ log ตัวเอง
 */
async function getAllLogs(req, res) {
  try {
    const { id: userId, role: userRole } = req.user;
    const { dept } = req.query; 

    // 🟢 [แก้ไข] ดึง teaching_logs แบบเปล่าๆ ก่อน ไม่ทำ nested embed (users!inner -> departments!inner)
    // เพราะ Supabase/PostgREST จะโยน error "more than one relationship was found" หรือ join พังได้
    // ถ้า schema มีความสัมพันธ์ซ้อนกันหลายทาง ทำให้ endpoint นี้ 500 แบบสุ่ม
    let query = supabase.from('teaching_logs').select('*');

    if (userRole === 'teacher') {
      query = query.eq('user_id', userId);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

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

  } catch (error) {
    console.error('Error in getAllLogs:', error);
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
    }

    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงบันทึกการสอนของผู้อื่น' });
    }

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

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

/**
 * POST /api/logs
 * สร้างบันทึกใหม่ ดึงรายชื่อผู้บริหารชุดปัจจุบัน (Snapshot) มาฝังล็อกค้างไว้ใน Record ทันที
 */

async function createLog(req, res) {
  try {
    const {
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
    } = req.body

    if (!subject_name || !topic) {
      return res.status(400).json({ error: 'จำเป็นต้องระบุชื่อวิชาและหัวข้อเรื่องที่สอน' })
    }

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
    const updateData = req.body; 

    const { data: log, error: findError } = await supabase
      .from('teaching_logs')
      .select('user_id')
      .eq('id', id)  
      .single();

    if (findError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการแก้ไข' });
    }

    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขบันทึกการสอนของผู้อื่น' });
    }

    const { data: updatedLog, error: updateError } = await supabase
      .from('teaching_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้: ' + updateError.message });
    }

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

    const { data: log, error: findError } = await supabase
      .from('teaching_logs')
      .select('user_id')
      .eq('id', id)
      .single();

    if (findError || !log) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการสอนที่ต้องการลบ' });
    }

    if (role === 'teacher' && log.user_id !== userId) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบบันทึกการสอนของผู้อื่น' });
    }

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

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

/**
 * POST /api/logs/:id/images
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
  try {
    const { id: log_id } = req.params;

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

        return {
          ...img,
          signed_url: signData ? signData.signedUrl : null
        };
      })
    );

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