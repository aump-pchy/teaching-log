const express = require('express')
const router = express.Router()
const multer = require('multer')
const { authMiddleware } = require('../middleware/auth')
const {
  getAllLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  uploadImage,
  getImages,
  deleteImage
} = require('../controllers/logController')

// multer — เก็บไฟล์ใน memory ก่อน แล้วค่อย upload ไป Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์ภาพ JPG, PNG, WEBP เท่านั้น'))
    }
  }
})

router.post('/:id/images', authMiddleware, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'ไฟล์รูปใหญ่เกินไป (จำกัดไม่เกิน 10MB)' })
      }
      return res.status(400).json({ error: err.message || 'อัปโหลดไฟล์ไม่สำเร็จ' })
    }
    next()
  })
}, uploadImage)

// GET  /api/logs          (admin=ทุกคน, teacher=ตัวเอง, ?dept=IT)
router.get('/', authMiddleware, getAllLogs)

// GET  /api/logs/:id
router.get('/:id', authMiddleware, getLogById)

// POST /api/logs
router.post('/', authMiddleware, createLog)

// PUT  /api/logs/:id
router.put('/:id', authMiddleware, updateLog)

// DELETE /api/logs/:id
router.delete('/:id', authMiddleware, deleteLog)

// POST /api/logs/:id/images
router.post('/:id/images', authMiddleware, upload.single('file'), uploadImage)

// GET  /api/logs/:id/images
router.get('/:id/images', authMiddleware, getImages)

// DELETE /api/logs/:id/images/:imgId
router.delete('/:id/images/:imgId', authMiddleware, deleteImage)

module.exports = router
