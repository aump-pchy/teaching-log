const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
  try {
    const token = auth.split(' ')[1]
<<<<<<< HEAD

    // 🎯 ยิงเช็กตรงกับระบบ Supabase Auth เพื่อยืนยันตัวตนคนถือ Token
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
    }

<<<<<<< HEAD
    // 🎯 ไปดึงข้อมูลเพิ่มเติม (เช่น role, full_name, id ตัวเลขจริงในตาราง users) มาพ่วงเก็บไว้
    // 🟢 [แก้ไข] เดิม select ไม่มี 'id' เลย ทำให้ตอนสร้าง req.user ด้านล่างต้องใช้ user.id
    // ซึ่งเป็น UUID ของ Supabase Auth (auth.users.id) ไม่ใช่ users.id (integer) ที่ตารางอื่น
    // ทั้งระบบ (teaching_logs.user_id ฯลฯ) ใช้อ้างอิงกัน -> insert/query ชนกับ column type integer พังทุกครั้ง
    const { data: dbUser, error: dbUserError } = await supabase
=======
    // 🎯 ไปดึงข้อมูลเพิ่มเติม (เช่น id, role, full_name) จากตารางฐานข้อมูล users มาพ่วงเก็บไว้
    const { data: dbUser } = await supabase
>>>>>>> origin/feature/log-form
      .from('users')
      .select('id, role, full_name, email')
      .eq('email', user.email)
      .maybeSingle()

<<<<<<< HEAD
    if (dbUserError || !dbUser) {
      return res.status(401).json({ error: 'ไม่พบข้อมูลผู้ใช้งานในระบบ กรุณาติดต่อผู้ดูแลระบบ' })
    }

    // ฝังข้อมูลลงใน req.user เพื่อส่งไม้ต่อให้ฟังก์ชันถัดไปใช้งาน
    req.user = {
      id: dbUser.id,          // 🟢 ใช้ id ตัวเลขจากตาราง users แทน UUID ของ Supabase Auth
      auth_id: user.id,       // เก็บ UUID เดิมไว้เผื่อจุดอื่นต้องใช้ (เช่นอ้างอิง Supabase Auth โดยตรง)
      email: user.email,
=======
    // ฝังข้อมูลลงใน req.user เพื่อส่งไม้ต่อให้ฟังก์ชันถัดไปใช้งาน
    req.user = {
      id: dbUser?.id,          // 🎯 ใช้ id (integer) จากตาราง users แทน UUID ของ Supabase Auth
                                //    เพื่อให้ตรงกับ user_id (integer) ในตาราง teaching_logs
      authId: user.id,         // uuid ของ Supabase Auth เก็บไว้เผื่อจุดอื่นต้องใช้
      email: user.email,
      full_name: dbUser?.full_name || '',
>>>>>>> origin/feature/log-form
      role: dbUser?.role || 'teacher' // ถ้าหาบทบาทในตารางไม่เจอ ให้เป็นอาจารย์ธรรมดาไว้ก่อน
    }

    next() // ตรวจผ่านฉลุย! ไปทำงานสเต็ปต่อไปได้
=======
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role }
    next()
>>>>>>> origin/feature/auth-users
  } catch (err) {
    return res.status(401).json({ error: 'ยังไม่ได้ login หรือ token หมดอายุ' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }