<template>
  <div class="landing">

    <!-- NAVBAR -->
    <nav class="nav">
      <div class="nav-brand">
        <div class="brand-icon"><i class="ti ti-notebook"></i></div>
        <span>Teaching Log</span>
      </div>
      <div class="nav-links">
        <a href="#features" class="nav-link">ภาพรวม</a>
        <a href="#how" class="nav-link">วิธีใช้งาน</a>
        <a href="#roles" class="nav-link">สำหรับครู</a>
        <router-link to="/login" class="nav-btn">เข้าสู่ระบบ</router-link>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-badge">
        <i class="ti ti-school"></i>
        วิทยาลัยเทคนิคเลย ภาคเรียนที่ 1/2569
      </div>
      <h1>ระบบบันทึกการจัดการเรียนการสอน สถานประกอบการ</h1>
      <p>กรอกแบบบันทึก อัปโหลดหลักฐาน และพิมพ์รายงานได้ในที่เดียว ง่ายและรวดเร็ว</p>
      <div class="hero-actions">
        <router-link to="/login" class="btn-primary">
          <i class="ti ti-login"></i> เริ่มใช้งาน
        </router-link>
        <a href="#how" class="btn-outline">
          <i class="ti ti-player-play"></i> ดูวิธีใช้งาน
        </a>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-num">4</div><div class="stat-label">แผนกวิชา</div></div>
        <div class="stat"><div class="stat-num">∞</div><div class="stat-label">บันทึกการสอน</div></div>
        <div class="stat"><div class="stat-num">PDF</div><div class="stat-label">พร้อมพิมพ์</div></div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="section">
      <p class="section-title">ฟีเจอร์หลัก</p>
      <p class="section-sub">ครบทุกอย่างที่ครูต้องการในการจัดทำเอกสาร</p>
      <div class="features">
        <div class="feat-card" v-for="f in features" :key="f.icon">
          <div class="feat-icon"><i :class="'ti ' + f.icon"></i></div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ROLES -->
    <section id="roles" class="section section-alt">
      <p class="section-title">สิทธิ์การใช้งาน</p>
      <p class="section-sub">แต่ละบทบาทเห็นข้อมูลที่เหมาะสมกับตัวเอง</p>
      <div class="roles">
        <div class="role-card role-admin">
          <span class="role-tag tag-admin"><i class="ti ti-shield-check"></i> ผู้ดูแลระบบ</span>
          <h3>Admin</h3>
          <ul class="role-list">
            <li v-for="item in adminPerms" :key="item">
              <i class="ti ti-check"></i> {{ item }}
            </li>
          </ul>
        </div>
        <div class="role-card role-teacher">
          <span class="role-tag tag-teacher"><i class="ti ti-user"></i> ครูผู้สอน</span>
          <h3>ครู</h3>
          <ul class="role-list">
            <li v-for="item in teacherPerms" :key="item">
              <i class="ti ti-check"></i> {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- HOW TO -->
    <section id="how" class="section">
      <p class="section-title">วิธีใช้งาน</p>
      <p class="section-sub">เพียง 4 ขั้นตอนง่ายๆ</p>
      <div class="steps">
        <div class="step" v-for="(s, i) in steps" :key="i">
          <div class="step-num">{{ i + 1 }}</div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2>พร้อมเริ่มใช้งานแล้วหรือยัง?</h2>
      <p>ระบบพร้อมรองรับครูทุกแผนกวิชา ภาคเรียนที่ 1/2569</p>
      <router-link to="/login" class="btn-primary btn-lg">
        <i class="ti ti-login"></i> เข้าสู่ระบบเลย
      </router-link>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <p>© 2569 วิทยาลัยเทคนิคเลย — Teaching Log</p>
      <div class="footer-links">
        <a href="#">ติดต่อ</a>
        <a href="#">คู่มือการใช้งาน</a>
      </div>
    </footer>

  </div>
</template>

<script setup>
const features = [
  { icon: 'ti-forms',        title: 'กรอกข้อมูลออนไลน์',   desc: 'แบบฟอร์มครบถ้วนตามมาตรฐาน กรอกง่ายบนทุกอุปกรณ์' },
  { icon: 'ti-photo-up',     title: 'อัปโหลดหลักฐาน',      desc: 'แนบรูปภาพประกอบการสอนได้ทุกหมวดหมู่ บังคับอย่างน้อย 1 รูป' },
  { icon: 'ti-file-download',title: 'Export PDF',           desc: 'พิมพ์รายงานได้ทันที ตรงตามแบบฟอร์มราชการ' },
  { icon: 'ti-building',     title: 'แยกรายแผนก',          desc: 'Admin ดูภาพรวมทุกแผนก กรองข้อมูลได้ตามต้องการ' },
]

const adminPerms   = ['ดูบันทึกของครูทุกคน', 'กรองข้อมูลรายแผนก', 'จัดการบัญชีผู้ใช้', 'Export รายงานรวม']
const teacherPerms = ['กรอกบันทึกการสอนรายสัปดาห์', 'อัปโหลดรูปหลักฐาน', 'ดูและแก้ไขข้อมูลตัวเอง', 'พิมพ์รายงาน PDF']

const steps = [
  { title: 'เข้าสู่ระบบ',  desc: 'ใช้อีเมลและรหัสผ่านที่ได้รับจากผู้ดูแล' },
  { title: 'กรอกข้อมูล',  desc: 'บันทึกรายละเอียดการสอนประจำสัปดาห์' },
  { title: 'แนบรูปภาพ',   desc: 'อัปโหลดหลักฐานการสอนอย่างน้อย 1 รูป' },
  { title: 'Export PDF',   desc: 'พิมพ์รายงานส่งได้ทันที' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.landing { font-family: 'Sarabun', sans-serif; color: #111; }

/* NAV */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 64px; background: #0F6E56;
  position: sticky; top: 0; z-index: 100;
}
.nav-brand { display: flex; align-items: center; gap: 10px; color: #fff; font-size: 18px; font-weight: 500; }
.brand-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.brand-icon i { font-size: 20px; color: #fff; }
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-link { color: rgba(255,255,255,0.85); font-size: 14px; padding: 7px 14px; border-radius: 8px; text-decoration: none; transition: background .15s; }
.nav-link:hover { background: rgba(255,255,255,0.12); color: #fff; }
.nav-btn { background: #fff; color: #0F6E56; font-size: 14px; font-weight: 500; padding: 7px 18px; border-radius: 8px; text-decoration: none; margin-left: 8px; }
.nav-btn:hover { background: #EAF3DE; }

/* HERO */
.hero { background: #EAF3DE; padding: 72px 2rem 64px; text-align: center; }
.hero-badge { display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 0.5px solid #C0DD97; border-radius: 20px; padding: 5px 14px; font-size: 13px; color: #3B6D11; margin-bottom: 24px; }
.hero h1 { font-size: 34px; font-weight: 700; color: #085041; line-height: 1.35; max-width: 560px; margin: 0 auto 16px; }
.hero > p { font-size: 16px; color: #3B6D11; max-width: 460px; margin: 0 auto 32px; line-height: 1.7; }
.hero-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.btn-primary { background: #0F6E56; color: #fff; font-size: 15px; font-weight: 500; padding: 11px 28px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; font-family: 'Sarabun', sans-serif; }
.btn-primary:hover { background: #085041; }
.btn-outline { background: #fff; color: #0F6E56; font-size: 15px; font-weight: 500; padding: 11px 28px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid #0F6E56; }
.btn-outline:hover { background: #f0faf5; }
.btn-lg { font-size: 16px; padding: 13px 36px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #C0DD97; border: 0.5px solid #C0DD97; border-radius: 12px; overflow: hidden; max-width: 480px; margin: 40px auto 0; }
.stat { background: #fff; padding: 20px; text-align: center; }
.stat-num { font-size: 26px; font-weight: 700; color: #0F6E56; }
.stat-label { font-size: 13px; color: #3B6D11; margin-top: 2px; }

/* SECTION */
.section { padding: 56px 2rem; }
.section-alt { background: #f3f4f6; }
.section-title { font-size: 22px; font-weight: 700; color: #085041; text-align: center; margin-bottom: 8px; }
.section-sub { font-size: 15px; color: #6b7280; text-align: center; margin-bottom: 36px; }

/* FEATURES */
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; max-width: 780px; margin: 0 auto; }
.feat-card { background: #fff; border: 0.5px solid #e5e7eb; border-radius: 12px; padding: 20px; }
.feat-icon { width: 40px; height: 40px; border-radius: 10px; background: #EAF3DE; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.feat-icon i { font-size: 20px; color: #0F6E56; }
.feat-card h3 { font-size: 15px; font-weight: 500; color: #111; margin-bottom: 6px; }
.feat-card p { font-size: 13px; color: #6b7280; line-height: 1.6; }

/* ROLES */
.roles { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; max-width: 580px; margin: 0 auto; }
.role-card { background: #fff; border: 0.5px solid #e5e7eb; border-radius: 12px; padding: 24px; }
.role-admin { border-top: 3px solid #0F6E56; }
.role-teacher { border-top: 3px solid #639922; }
.role-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 6px; margin-bottom: 12px; }
.tag-admin { background: #EAF3DE; color: #085041; }
.tag-teacher { background: #EAF3DE; color: #3B6D11; }
.role-card h3 { font-size: 16px; font-weight: 500; color: #111; margin-bottom: 12px; }
.role-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.role-list li { font-size: 13px; color: #4b5563; display: flex; align-items: center; gap: 8px; }
.role-list li i { font-size: 15px; color: #639922; flex-shrink: 0; }

/* STEPS */
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; max-width: 720px; margin: 0 auto; }
.step { text-align: center; padding: 0 8px; }
.step-num { width: 48px; height: 48px; border-radius: 50%; background: #0F6E56; color: #fff; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.step h3 { font-size: 14px; font-weight: 500; color: #111; margin-bottom: 6px; }
.step p { font-size: 13px; color: #6b7280; line-height: 1.6; }

/* CTA */
.cta { background: #085041; padding: 64px 2rem; text-align: center; }
.cta h2 { font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.cta p { font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 28px; }

/* FOOTER */
.footer { background: #0F6E56; padding: 20px 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.footer p { font-size: 13px; color: rgba(255,255,255,0.65); }
.footer-links { display: flex; gap: 16px; }
.footer-links a { font-size: 13px; color: rgba(255,255,255,0.65); text-decoration: none; }
.footer-links a:hover { color: #fff; }

/* RESPONSIVE */
@media (max-width: 640px) {
  .nav-links .nav-link { display: none; }
  .hero h1 { font-size: 26px; }
  .steps { grid-template-columns: repeat(2, 1fr); }
}
</style>
