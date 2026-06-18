const supabase = require('../db/supabase')

/**
 * GET /api/logs
 * - admin → เห็นทุก log (filter by ?dept=IT ได้)
 * - teacher → เห็นแค่ log ตัวเอง
 */
async function getAllLogs(req, res) {
  // TODO: 1. ดู role จาก req.user.role
  // TODO: 2. ถ้า teacher → filter where user_id = req.user.id
  // TODO: 3. ถ้า admin และมี query ?dept=XX → join users+departments แล้ว filter
  // TODO: 4. query teaching_logs พร้อม join users (full_name) และ departments (name)
  // TODO: 5. return array of logs
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
      departments ( name )
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

    // 2. สั่งลบไฟล์รูปภาพของจริงออกจากระบบ Supabase Storage Bucket
    const { error: storageError } = await supabase.storage
      .from('teaching-log-images')
      .remove([imgRecord.storage_path]);

    if (storageError) {
      return res.status(400).json({ error: 'ไม่สามารถลบไฟล์จากระบบจัดเก็บรูปภาพได้: ' + storageError.message });
    }

    // 3. ลบ Record ประวัติข้อมูลรูปภาพนี้ออกจากตาราง
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
