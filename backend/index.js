require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

// Routes (TODO: แต่ละคนเพิ่ม route ของตัวเองที่นี่)
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/users',   require('./routes/users'))
app.use('/api/logs',    require('./routes/logs'))
app.use('/api/departments', require('./routes/departments'))
app.use('/api/system', require('./routes/systemRoutes')) // เพิ่ม route สำหรับระบบกลาง

app.get('/', (req, res) => res.json({ message: 'Teaching Log API 🟢' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
