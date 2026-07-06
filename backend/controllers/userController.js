const supabase = require('../db/supabase');
const bcrypt = require('bcrypt'); // 👈 บรรทัดนี้สำคัญมากครับ!

// 1. ดึงข้อมูลผู้ใช้ทั้งหมด (เวอร์ชันปล่อยจอย ไม่กรองข้อมูลทิ้ง)
exports.getAllUsers = async (req, res) => {
  try {
    // 🎯 เติมคำสั่ง { foreignKey: ... } หรือปล่อยให้ดึงแบบเสรี
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

    // 🔥 ซ่อมแซมข้อมูลหน้าบ้าน: ถ้าแถวไหนได้ภาษาบิดเบี้ยวหรือ departments เป็น null 
    // จะได้ส่งค่าว่างไปแทน หน้าบ้านจะได้ไม่ขึ้น Error ตัวสีแดงครับ
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

// บรรทัดบนสุดของไฟล์ userController.js อย่าลืมเช็กว่ามีเรียกใช้ bcrypt หรือยังนะครับ
// const bcrypt = require('bcrypt'); 

// 2. อัปเดตข้อมูลผู้ใช้ / สลับสิทธิ์การอนุมัติ (is_approved) และรีเซ็ทรหัสผ่าน
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, department_id, role, is_approved, password } = req.body;

  try {
    // 1. หาค่า auth_id จากตาราง users ก่อน (เผื่อไว้ใช้กับ Supabase Auth)
    const { data: userRecord, error: fetchError } = await supabase
      .from('users')
      .select('auth_id') // 🎯 ตอนนี้คอลัมน์นี้มีอยู่จริงแล้ว และจะมีค่าสำหรับ user ที่สมัคร/ถูกสร้างหลังแก้ไขนี้
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. เตรียม Object ข้อมูลสำหรับอัปเดตลงตาราง users
    const updateData = {
      full_name,
      email,
      role,
      is_approved: is_approved !== undefined ? is_approved : true
    };

    if (department_id) {
      updateData.department_id = Number(department_id);
    }

    // 3. จัดการเรื่อง Password
    if (password && password.trim() !== "") {
      // อัปเดตในตาราง users ของอ้ายเอง
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password_hash = hashedPassword;

      // 🔥 อัปเดตใน Supabase Auth ด้วย (ใช้ Service Role)
      if (userRecord.auth_id) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userRecord.auth_id,
          { password: password } // ส่งรหัสผ่านตัวปกติเข้าไป Supabase จะจัดการแฮชเอง
        );
        if (authError) throw authError;
      } else {
        // 🎯 [แก้ไข] เตือนใน log ถ้า user รายนี้ยังไม่มี auth_id (เป็น user เก่าก่อนแก้ไขระบบ)
        // จะได้รู้ตัวว่ารหัสผ่านอัปเดตแค่ฝั่งตาราง users แต่ login จริงยังใช้รหัสเดิมอยู่
        console.warn(`⚠️ User id=${id} ไม่มี auth_id ผูกไว้ — อัปเดตรหัสผ่านได้เฉพาะตาราง users เท่านั้น ผู้ใช้จะยัง login ด้วยรหัสเดิมที่ Supabase Auth`)
      }
    }

    // 4. อัปเดตตาราง users
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    return res.status(200).json({ message: 'อัปเดตข้อมูลและรีเซ็ตรหัสผ่านในระบบ Auth สำเร็จแล้วครับอ้าย!', data });
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
// 🎯 [แก้ไข] ปรับให้สร้างบัญชีใน Supabase Auth จริงก่อน แล้วค่อยบันทึกลงตาราง users พร้อม auth_id
// เดิมฟังก์ชันนี้สร้างแค่แถวในตาราง users อย่างเดียว ทำให้ผู้ใช้ที่ admin เพิ่มเอง login ไม่ได้เลย
// เพราะระบบ login ใช้ supabase.auth.signInWithPassword ซึ่งต้องมีบัญชีจริงใน Supabase Auth เท่านั้น
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, department_id } = req.body;

    if (!email || !password || !full_name || !department_id) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // สเต็ปที่ 1: สร้างบัญชีจริงใน Supabase Auth ก่อน (ใช้ Service Role ผ่าน admin API)
    // autoConfirm: true เพื่อให้ login ได้ทันทีโดยไม่ต้องไปกดยืนยันอีเมล (admin เป็นคนสร้างให้เองอยู่แล้ว)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.error('Supabase Auth CreateUser Error:', authError.message);
      return res.status(400).json({ error: `สร้างบัญชี Auth ไม่สำเร็จ: ${authError.message}` });
    }

    // สเต็ปที่ 2: แฮชรหัสผ่านเก็บลงตาราง users (เก็บคู่ขนานไว้ตามรูปแบบเดิมของระบบ)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds); // แฮชก่อน

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
          email, 
          password_hash: hashedPassword, // ใช้ชื่อคอลัมน์ password_hash
          full_name, 
          role, 
          department_id: Number(department_id), 
          is_approved: true,
          auth_id: authData.user.id // 🎯 ผูกกับบัญชี Supabase Auth ที่เพิ่งสร้าง
      }])
      .select();

    if (error) {
      // 🎯 ถ้า insert ตาราง users ไม่สำเร็จ ควรลบบัญชี Auth ที่สร้างไปแล้วทิ้งด้วย ป้องกันข้อมูลค้างไม่ตรงกัน
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error('Database Insert User Error:', error.message);
      return res.status(500).json({ error: `สร้างบัญชี Auth สำเร็จ แต่บันทึกตาราง DB ไม่สำเร็จ: ${error.message}` });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Backend Error (createUser):', error.message);
    return res.status(500).json({ error: 'ไม่สามารถสร้างผู้ใช้งานได้' });
  }
};