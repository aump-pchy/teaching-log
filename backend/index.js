require('dotenv').config()
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')  
const express = require('express')
const cors = require('cors')
const { ensureBucket } = require('./db/minio')
const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

// Routes
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/users',   require('./routes/users'))
app.use('/api/logs',    require('./routes/logs'))
app.use('/api/departments', require('./routes/departments'))
app.use('/api/system', require('./routes/systemRoutes'))

app.get('/', (req, res) => res.json({ message: 'Teaching Log API 🟢' }))

const PORT = process.env.PORT || 3000

async function start() {
  await ensureBucket() // สร้าง MinIO bucket ถ้ายังไม่มี ก่อนเปิดรับ request
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start()