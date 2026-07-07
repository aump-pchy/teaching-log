const Minio = require('minio')

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  region: 'us-east-1',
})

const minioPublicClient = new Minio.Client({
  endPoint: process.env.MINIO_PUBLIC_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PUBLIC_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  region: 'us-east-1',
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'teaching-logs'

async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      console.log(`📦 สร้าง MinIO bucket "${BUCKET_NAME}" สำเร็จ`)
    } else {
      console.log(`📦 MinIO bucket "${BUCKET_NAME}" พร้อมใช้งาน`)
    }
  } catch (err) {
    console.error('⚠️ เชื่อมต่อ MinIO ไม่สำเร็จ:', err.message)
  }
}

module.exports = { minioClient, minioPublicClient, BUCKET_NAME, ensureBucket }