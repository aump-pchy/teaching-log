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
