const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function sendPasswordResetEmail(to, newPassword) {
  await transporter.sendMail({
    from: `"Teaching Log - วิทยาลัยเทคนิคเลย" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'รีเซ็ตรหัสผ่าน - ระบบ Teaching Log',
    html: `
      <div style="font-family: 'Sarabun', sans-serif; padding: 24px; color:#1f2937;">
        <h2 style="color:#0F6E56;">รีเซ็ตรหัสผ่านสำเร็จ</h2>
        <p>รหัสผ่านใหม่ของคุณคือ:</p>
        <p style="font-size:22px; font-weight:bold; background:#f3f7f4; padding:14px 20px; border-radius:10px; display:inline-block; letter-spacing:1px;">
          ${newPassword}
        </p>
        <p>กรุณาเข้าสู่ระบบด้วยรหัสผ่านนี้ แล้วเปลี่ยนรหัสผ่านใหม่ทันทีเพื่อความปลอดภัย</p>
        <p style="color:#6b7280; font-size:13px; margin-top:24px;">
          หากคุณไม่ได้เป็นผู้ร้องขอรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบทันที
        </p>
      </div>
    `,
  })
}

module.exports = { sendPasswordResetEmail }