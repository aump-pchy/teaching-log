const { createClient } = require('@supabase/supabase-js');
// เรียกใช้ตัวแปร環境 (Environment Variables) จากไฟล์ .env ของหลังบ้าน
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // แนะนำใช้ Service Role สำหรับจัดการข้อมูลผู้ใช้
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. ดึงข้อมูลผู้ใช้ทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    // ดึงข้อมูลผู้ใช้พร้อมจอย (Join) แผนกวิชามาแสดงคู่กันด้วย
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        full_name, 
        role, 
        department_id, 
        is_approved,
        departments (id, name)
      `)
      .order('id', { ascending: true });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error('Backend Error (getAllUsers):', error.message);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้งานจากระบบได้' });
  }
};

// 2. อัปเดตข้อมูลผู้ใช้ / สลับสิทธิ์การอนุมัติ (is_approved)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, department_id, role, is_approved, password } = req.body;

  try {
    // เตรียม Object ข้อมูลที่จะอัปเดตลงตาราง users
    const updateData = {
      full_name,
      email,
      department_id: Number(department_id),
      role,
      is_approved: is_approved !== undefined ? is_approved : true
    };

    // ถ้าระบบส่ง Password มา (กรณีแอดมินกดรีเซ็ตรหัสผ่าน) ค่อยทำการบันทึก
    if (password) {
      updateData.password = password; // หรือจะทำการ Hash ก่อนเข้า Database ตามระบบความปลอดภัยของอ้ายได้เลย
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จ', data });
  } catch (error) {
    console.error('Backend Error (updateUser):', error.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน' });
  }
};

// 3. ลบผู้ใช้งานออกจากระบบ
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ message: 'ลบข้อมูลผู้ใช้งานออกจากระบบเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Backend Error (deleteUser):', error.message);
    return res.status(500).json({ error: 'ไม่สามารถลบข้อมูลผู้ใช้งานรายนี้ได้' });
  }
};
// 4. ดึงข้อมูลผู้ใช้รายบุคคล (เพิ่มเข้าไป)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*, departments(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
  }
};

// 5. สร้างผู้ใช้งานใหม่ (เพิ่มเข้าไป)
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, department_id } = req.body;
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password, full_name, role, department_id: Number(department_id), is_approved: true }])
      .select();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'ไม่สามารถสร้างผู้ใช้งานได้' });
  }
};