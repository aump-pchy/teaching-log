const supabase = require('../db/supabase'); // ใช้เป็นแค่ DB client เท่านั้น ไม่ใช่ระบบ auth แล้ว
const bcrypt = require('bcrypt');

// 1. ดึงข้อมูลผู้ใช้ทั้งหมด (เวอร์ชันปล่อยจอย ไม่กรองข้อมูลทิ้ง)
exports.getAllUsers = async (req, res) => {
  try {
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

    const cleanData = data.map(user => ({
      ...user,
      departments: user.departments || { id: null, name: 'ยังไม่ระบุแผนก' }
    }));

    return res.status(200).json(cleanData);
  } catch (error) {
    console.error('Backend Error (getAllUsers):', error.message);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้งานจากระบบได้' });
  }
};

// 2. อัปเดตข้อมูลผู้ใช้ / สลับสิทธิ์การอนุมัติ (is_approved) และรีเซ็ทรหัสผ่าน
// 🎯 [แก้ไข] ตัดการเรียก supabase.auth.admin.updateUserById() ออกทั้งหมด
// เพราะตอนนี้รหัสผ่านที่ใช้ login จริงคือ password_hash ในตาราง users เท่านั้น
// ไม่ต้องไปหา auth_id หรือ sync กับ Supabase Auth อีกต่อไป — แก้คอลัมน์เดียวจบ
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, department_id, role, is_approved, password } = req.body;

  try {
    const updateData = {
      full_name,
      email,
      role,
      is_approved: is_approved !== undefined ? is_approved : true
    };

    if (department_id) {
      updateData.department_id = Number(department_id);
    }

    // จัดการเรื่อง Password — แฮชแล้วเก็บลง password_hash ตรงๆ คอลัมน์เดียวจบ
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password_hash = hashedPassword;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จแล้วครับอ้าย!', data });
  } catch (error) {
    console.error('Backend Error (updateUser):', error.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', details: error.message });
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

// 4. ดึงข้อมูลผู้ใช้รายบุคคล
// 🎯 [แก้ไข] ระบุ field ชัดเจนแทน select('*') กัน password_hash หลุดไปกับ response
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, department_id, is_approved, created_at, departments(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
  }
};

// 5. สร้างผู้ใช้งานใหม่
// 🎯 [แก้ไข] ตัดการเรียก supabase.auth.admin.createUser() ออกทั้งหมด
// สร้างแค่แถวในตาราง users พร้อมแฮชรหัสผ่าน ก็ login ได้แล้วเพราะระบบ auth ใหม่เช็กจาก password_hash โดยตรง
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, department_id } = req.body;

    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
          email, 
          password_hash: hashedPassword,
          full_name, 
          role, 
          department_id: Number(department_id), 
          is_approved: true 
      }])
      .select();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    console.error('Backend Error (createUser):', error.message);
    return res.status(500).json({ error: 'ไม่สามารถสร้างผู้ใช้งานได้' });
  }
};