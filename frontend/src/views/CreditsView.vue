<template>
  <div class="credits-page">

    <!-- 🎨 พื้นหลังเบลอลอยตัว (ambient blobs) -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>
    <div class="bg-grid"></div>

    <!-- 🎈 อีโมจิลอยขึ้น -->
    <div class="emoji-layer" aria-hidden="true">
      <span
        v-for="p in floatingEmojis"
        :key="p.id"
        class="floating-emoji"
        :style="{
          left: p.left + '%',
          fontSize: p.size + 'px',
          animationDuration: p.duration + 's',
          animationDelay: p.delay + 's',
          '--drift': p.drift + 'px'
        }"
      >{{ p.emoji }}</span>
    </div>

    <div class="credits-container">

      <!-- Top bar -->
      <div class="top-bar" :class="{ show: mounted }">
        <router-link to="/" class="back-btn-green">
          <i class="ti ti-arrow-left"></i> กลับหน้าหลัก
        </router-link>
      </div>

      <!-- Hero -->
      <div class="hero" :class="{ show: mounted }">
        <span class="page-title-mode">Teaching Log · วิทยาลัยเทคนิคเลย</span>
        <h1 class="hero-title">
          ผู้<span class="accent">จัดทำ</span>ระบบ
        </h1>
        <p class="hero-sub">
          ทีมนักเรียน-นักศึกษาผู้ออกแบบและพัฒนาระบบบันทึกการจัดการเรียนการสอน
          สำหรับรายวิชาในสถานประกอบการ
        </p>
      </div>

      <!-- Team grid -->
      <div class="team-grid">
        <div
          v-for="(m, i) in members"
          :key="i"
          :ref="el => (cardRefs[i] = el)"
          class="member-card"
          :class="{ show: mounted }"
          :style="{ transitionDelay: mounted ? (0.1 + i * 0.13) + 's' : '0s' }"
          @mousemove="onTilt($event, i)"
          @mouseleave="resetTilt(i)"
          @click="openMember(i)"
        >
          <div class="card-shine"></div>

          <!-- Avatar (hover สลับรูปที่ 2 ถ้ามี) -->
          <div class="avatar-wrap" :class="{ 'has-second-photo': m.photo2 }">
            <div class="avatar-ring">
              <div class="avatar-inner">
                <span v-if="!m.photo && !m.photo2" class="avatar-fallback">{{ initials(m.name) }}</span>
                <img v-if="m.photo" :src="m.photo" class="avatar-img avatar-img-1" alt="" />
                <img v-if="m.photo2" :src="m.photo2" class="avatar-img avatar-img-2" alt="" />
              </div>
            </div>
            <div class="avatar-hint" v-if="m.photo2"><i class="ti ti-photo"></i></div>
          </div>

          <!-- Fields -->
          <div class="member-body">
            <h3 class="name-text">{{ m.name || 'ชื่อ - นามสกุล' }}</h3>

            <div class="tag-row">
              <div class="tag-chip">
                <i class="ti ti-building"></i>
                <span>{{ m.department || 'แผนกวิชา' }}</span>
              </div>
              <div class="tag-chip">
                <i class="ti ti-school"></i>
                <span>{{ m.classLevel || 'ชั้น' }}</span>
              </div>
            </div>

            <div class="quote-wrap">
              <i class="ti ti-quote quote-icon"></i>
              <p class="quote-text">{{ m.quote || 'คำคมประจำตัว...' }}</p>
            </div>

            <div class="social-row">
              <a v-if="m.ig" :href="igLink(m.ig)" target="_blank" rel="noopener" class="social-pill social-ig" title="Instagram" @click.stop>
                <i class="ti ti-brand-instagram"></i>
                <span>{{ igHandle(m.ig) }}</span>
              </a>
              <a v-if="m.fb" :href="fbLink(m.fb)" target="_blank" rel="noopener" class="social-pill social-fb" title="Facebook" @click.stop>
                <i class="ti ti-brand-facebook"></i>
                <span>{{ fbHandle(m.fb) }}</span>
              </a>
              <span v-if="!m.ig && !m.fb" class="no-social">ยังไม่ระบุช่องทางติดต่อ</span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-note" :class="{ show: mounted }">
        © 2569 วิทยาลัยเทคนิคเลย — พัฒนาโดยทีมงาน Teaching Log
      </div>
    </div>

    <!-- 🃏 Modal ขยายโปรไฟล์ — เปิดขึ้นตรงกลางแบบไพ่ถูกแจก -->
    <transition name="modal-fade">
      <div v-if="selectedMember" class="modal-backdrop" @click.self="closeMember">
        <div class="modal-card">
          <button class="modal-close" @click="closeMember" aria-label="ปิด">
            <i class="ti ti-x"></i>
          </button>

          <div class="modal-avatar-wrap" :class="{ 'has-second-photo': selectedMember.photo2 }">
            <div class="modal-avatar-ring">
              <div class="modal-avatar-inner">
                <span v-if="!selectedMember.photo && !selectedMember.photo2" class="avatar-fallback modal-fallback">
                  {{ initials(selectedMember.name) }}
                </span>
                <img v-if="selectedMember.photo" :src="selectedMember.photo" class="avatar-img avatar-img-1" alt="" />
                <img v-if="selectedMember.photo2" :src="selectedMember.photo2" class="avatar-img avatar-img-2" alt="" />
              </div>
            </div>
            <div class="avatar-hint" v-if="selectedMember.photo2"><i class="ti ti-photo"></i> เลื่อนเมาส์ดูอีกรูป</div>
          </div>

          <h2 class="modal-name">{{ selectedMember.name || 'ชื่อ - นามสกุล' }}</h2>

          <div class="tag-row">
            <div class="tag-chip">
              <i class="ti ti-building"></i>
              <span>{{ selectedMember.department || 'แผนกวิชา' }}</span>
            </div>
            <div class="tag-chip">
              <i class="ti ti-school"></i>
              <span>{{ selectedMember.classLevel || 'ชั้น' }}</span>
            </div>
          </div>

          <div class="quote-wrap modal-quote-wrap">
            <i class="ti ti-quote quote-icon"></i>
            <p class="quote-text modal-quote-text">{{ selectedMember.quote || 'คำคมประจำตัว...' }}</p>
          </div>

          <div class="social-row">
            <a v-if="selectedMember.ig" :href="igLink(selectedMember.ig)" target="_blank" rel="noopener" class="social-pill social-ig modal-social-pill" title="Instagram">
              <i class="ti ti-brand-instagram"></i>
              <span>{{ igHandle(selectedMember.ig) }}</span>
            </a>
            <a v-if="selectedMember.fb" :href="fbLink(selectedMember.fb)" target="_blank" rel="noopener" class="social-pill social-fb modal-social-pill" title="Facebook">
              <i class="ti ti-brand-facebook"></i>
              <span>{{ fbHandle(selectedMember.fb) }}</span>
            </a>
            <span v-if="!selectedMember.ig && !selectedMember.fb" class="no-social">ยังไม่ระบุช่องทางติดต่อ</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

// ══════════════════════════════════════════════════════════════
// 📝 แก้ไขข้อมูลทีมผู้จัดทำตรงนี้ในโค้ดได้เลย
//    photo / photo2: ใส่ path รูปได้ เช่น '/img/member1.jpg'
//                     เอาเมาส์ไปชี้ที่รูปในการ์ด จะสลับจาก photo → photo2 ให้อัตโนมัติ
//                     ถ้าไม่ใส่ photo2 ก็จะไม่มีการสลับรูป
//    ig / fb: ใส่ username เฉยๆ ก็ได้ เช่น ig: 'your.name'
// ══════════════════════════════════════════════════════════════
const members = reactive([
  {
    name: 'อัครชัย ครองตรี',
    department: 'เทคโนโลยีสารสนเทศ',
    classLevel: 'ปวช.3',
    ig: 'khun_idkkk',
    fb: 'Akkarachaı Krongtrı',
    quote: 'เป็นคนไม่เอาถ่านคับ ที่บ้านใช้เตาแก๊ส',
    photo: '/1.jpg',
    photo2: '/2.jpg'
  },
  {
    name: 'ณัฐรัตน์ เอี่ยมรัตน',
    department: 'เทคโนโลยีสารสนเทศ',
    classLevel: 'ปวช.3',
    ig: 'just1salapaoyahoo',
    fb: 'Nattharat Aiamrat',
    quote: '🧋',
    photo: '/3.jpg',
    photo2: '/4.jpg'
  },
  {
    name: 'อัษฎาวุธ พุทธรักษ์',
    department: 'เทคโนโลยีสารสนเทศ',
    classLevel: 'ปวช.3',
    ig: 'ling_abcd',
    fb: 'Adsadawut puttarak',
    quote: 'กำขี้ดีกว่า กำตด',
    photo: '/5.jpg',
    photo2: '/6.jpg'
  },
  {
    name: 'นายภคิน เชื้อบุญมี',
    department: 'เทคโนโลยีสารสนเทศ',
    classLevel: 'ปวช.3',
    ig: '_mcker',
    fb: 'Phakin Chueaboonmee',
    quote: 'อยากรู้จักก็ทักมา',
    photo: '/7.jpg',
    photo2: '/9.jpg'
  },
])

const mounted = ref(false)
const cardRefs = ref([])
const selectedIndex = ref(null)

const selectedMember = computed(() =>
  selectedIndex.value !== null ? members[selectedIndex.value] : null
)

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    mounted.value = true
  })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(e) {
  if (e.key === 'Escape') closeMember()
}

function openMember(i) {
  selectedIndex.value = i
}
function closeMember() {
  selectedIndex.value = null
}

function initials(name) {
  if (!name || !name.trim()) return '👤'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function igLink(v) {
  if (!v) return '#'
  return v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '').trim()}`
}
function fbLink(v) {
  if (!v) return '#'
  return v.startsWith('http') ? v : `https://facebook.com/${v.trim()}`
}

// ── ดึง "ชื่อ/username" มาโชว์ข้างไอคอน ไม่ว่าจะใส่มาเป็นลิงก์เต็มหรือ username เฉยๆ ──
function igHandle(v) {
  if (!v) return ''
  if (v.startsWith('http')) {
    const clean = v.replace(/\/+$/, '')
    const last = clean.substring(clean.lastIndexOf('/') + 1)
    return '@' + last
  }
  return '@' + v.replace('@', '').trim()
}
function fbHandle(v) {
  if (!v) return ''
  if (v.startsWith('http')) {
    const clean = v.replace(/\/+$/, '')
    const last = clean.substring(clean.lastIndexOf('/') + 1)
    return last
  }
  return v.trim()
}

// ── 3D tilt effect ตามตำแหน่งเมาส์ (เฉพาะการ์ดในกริด) ──
function onTilt(e, i) {
  const el = cardRefs.value[i]
  if (!el) return
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  const rotateY = (px - 0.5) * 14
  const rotateX = (py - 0.5) * -14
  el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`

  el.style.setProperty('--mx', `${px * 100}%`)
  el.style.setProperty('--my', `${py * 100}%`)
}
function resetTilt(i) {
  const el = cardRefs.value[i]
  if (!el) return
  el.style.transform = ''
}

// ── 🎈 สุ่มอีโมจิลอยขึ้นพื้นหลัง ──
const EMOJI_POOL = ['📘', '✏️', '🎓', '💻', '✅', '📎', '🌿', '⭐', '📝', '🖇️']

function makeEmojiParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)],
    left: Math.random() * 100,
    size: 16 + Math.random() * 20,
    duration: 10 + Math.random() * 10,
    delay: Math.random() * -20,
    drift: (Math.random() - 0.5) * 120
  }))
}

const floatingEmojis = reactive(makeEmojiParticles(18))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=Anuphan:wght@600;700;800&display=swap');

* { box-sizing: border-box; }

.credits-page {
  position: relative;
  min-height: 100vh;
  background: #f4f9f6;
  font-family: 'Sarabun', sans-serif;
  overflow: hidden;
  padding: 40px 20px 80px;
}

/* ── Ambient background ── */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15,110,86,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15,110,86,0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  pointer-events: none;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
  animation: float 16s ease-in-out infinite;
}
.blob-1 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, #34d399, transparent 70%);
  top: -140px; left: -120px;
  animation-delay: 0s;
}
.blob-2 {
  width: 480px; height: 480px;
  background: radial-gradient(circle, #a3e635, transparent 70%);
  bottom: -180px; right: -160px;
  animation-delay: -5s;
}
.blob-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #0f6e56, transparent 70%);
  top: 40%; right: 8%;
  animation-delay: -10s;
  opacity: 0.2;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30px, -40px) scale(1.08); }
  66%      { transform: translate(-25px, 25px) scale(0.95); }
}

/* ── 🎈 Floating emoji layer ── */
.emoji-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.floating-emoji {
  position: absolute;
  bottom: -60px;
  opacity: 0;
  animation-name: emoji-rise;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
}
@keyframes emoji-rise {
  0%   { transform: translate(0, 0) rotate(0deg);   opacity: 0; }
  10%  { opacity: 0.85; }
  50%  { transform: translate(calc(var(--drift) * 0.5), -55vh) rotate(12deg); }
  90%  { opacity: 0.6; }
  100% { transform: translate(var(--drift), -110vh) rotate(-10deg); opacity: 0; }
}

/* ── Layout ── */
.credits-container {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  z-index: 1;
}

.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 36px;
  opacity: 0;
  transform: translateY(-14px);
  transition: opacity .6s ease, transform .6s ease;
}
.top-bar.show { opacity: 1; transform: translateY(0); }

/* ── Hero ── */
.hero {
  text-align: center;
  margin-bottom: 56px;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity .7s ease .05s, transform .7s ease .05s;
}
.hero.show { opacity: 1; transform: translateY(0); }

.hero .page-title-mode { display: inline-flex; margin-bottom: 18px; }

.hero-title {
  font-family: 'Anuphan', 'Sarabun', sans-serif;
  font-weight: 800;
  font-size: 44px;
  color: #085041;
  letter-spacing: -0.5px;
  margin: 0 0 14px;
}
.hero-title .accent {
  background: linear-gradient(120deg, #0f6e56, #65a30d 60%, #d97706);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  max-width: 560px;
  margin: 0 auto;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.8;
}

/* ── Grid ── */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 26px;
}

/* ── Card ── */
.member-card {
  position: relative;
  background: #ffffff;
  border-radius: 22px;
  padding: 34px 24px 26px;
  border: 1px solid rgba(15,110,86,0.08);
  box-shadow: 0 8px 30px rgba(8,80,65,0.06);
  text-align: center;
  cursor: pointer;
  transform-style: preserve-3d;
  transition:
    transform .12s ease-out,
    box-shadow .35s ease,
    opacity .6s ease,
    translate .6s ease;
  will-change: transform;

  opacity: 0;
  translate: 0 32px;
}
.member-card.show {
  opacity: 1;
  translate: 0 0;
}
.member-card:hover {
  box-shadow: 0 22px 44px rgba(8,80,65,0.16);
}

.card-shine {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(15,110,86,0.10), transparent 60%);
  opacity: 0;
  transition: opacity .3s ease;
  pointer-events: none;
}
.member-card:hover .card-shine { opacity: 1; }

/* ── Avatar (การ์ดในกริด) ── */
.avatar-wrap {
  position: relative;
  width: 136px;
  height: 136px;
  margin: 0 auto 18px;
}

.avatar-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 4px;
  /* วงแหวนสีนิ่ง ไม่หมุนแล้ว */
  background: conic-gradient(from 0deg, #0f6e56, #a3e635, #d97706, #0f6e56);
}

.avatar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #eaf4ef;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #ffffff;
}

.avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity .4s ease;
}
.avatar-img-1 { opacity: 1; z-index: 2; }
.avatar-img-2 { opacity: 0; z-index: 3; }

/* สลับรูปเฉพาะตอนมีรูปที่ 2 */
.avatar-wrap.has-second-photo:hover .avatar-img-1,
.modal-avatar-wrap.has-second-photo:hover .avatar-img-1 { opacity: 0; }
.avatar-wrap.has-second-photo:hover .avatar-img-2,
.modal-avatar-wrap.has-second-photo:hover .avatar-img-2 { opacity: 1; }

.avatar-fallback { font-size: 32px; font-weight: 700; color: #0f6e56; z-index: 1; }

.avatar-hint {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  color: #9ca3af;
  justify-content: center;
  width: 100%;
}

/* ── Fields ── */
.member-body { display: flex; flex-direction: column; gap: 10px; }

.name-text {
  font-size: 17px;
  font-weight: 700;
  color: #085041;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px dashed #d1d5db;
}

.tag-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eaf4ef;
  border: 1px solid #d6eae0;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  color: #0f6e56;
  font-weight: 600;
}
.tag-chip i { font-size: 12px; }

.quote-wrap {
  position: relative;
  margin-top: 4px;
}
.quote-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 14px;
  color: #c8dfd3;
}
.quote-text {
  width: 100%;
  margin: 0;
  background: #f8faf8;
  border-radius: 10px;
  padding: 10px 12px 10px 28px;
  font-size: 13px;
  font-style: italic;
  color: #4b5563;
  text-align: center;
  line-height: 1.5;
}

/* ── Socials ── */
.social-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
  min-height: 36px;
  align-items: center;
}
.no-social { font-size: 11px; color: #9ca3af; }

.social-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px 7px 11px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  max-width: 150px;
  transition: transform .2s ease, box-shadow .2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}
.social-pill i { font-size: 15px; flex-shrink: 0; }
.social-pill span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.social-pill:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
.social-ig { background: radial-gradient(circle at 30% 30%, #fdf497, #fd5949 45%, #d6249f 70%, #285AEB); }
.social-fb { background: #1877f2; }

.modal-social-pill { font-size: 13.5px; max-width: 200px; padding: 9px 18px 9px 13px; }
.modal-social-pill i { font-size: 17px; }

/* ── Footer ── */
.footer-note {
  text-align: center;
  margin-top: 60px;
  font-size: 12.5px;
  color: #9ca3af;
  opacity: 0;
  transition: opacity .6s ease .3s;
}
.footer-note.show { opacity: 1; }

/* ══════════════════════════════════════ */
/* 🃏 Modal — เปิดตรงกลางแบบไพ่ถูกแจกออกมา */
/* ══════════════════════════════════════ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(8, 30, 24, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  perspective: 1400px;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 30px;
  padding: 52px 44px 44px;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0,0,0,0.35);
  animation: deal-card .45s cubic-bezier(.2,.8,.2,1);
}

@keyframes deal-card {
  0%   { opacity: 0; transform: scale(.5) rotateY(-45deg) translateY(50px); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: scale(1) rotateY(0deg) translateY(0); }
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: background .15s ease;
}
.modal-close:hover { background: #e5e7eb; }

.modal-avatar-wrap {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 20px;
}
.modal-avatar-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 6px;
  background: conic-gradient(from 0deg, #0f6e56, #a3e635, #d97706, #0f6e56);
}
.modal-avatar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #eaf4ef;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 5px solid #ffffff;
}
.modal-fallback { font-size: 56px; }

.modal-name {
  font-family: 'Anuphan', 'Sarabun', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #085041;
  margin: 0 0 14px;
}

.modal-quote-wrap { margin-top: 14px; }
.modal-quote-text { font-size: 15.5px; padding: 14px 16px 14px 32px; line-height: 1.7; }

.modal-card .tag-chip { font-size: 13.5px; padding: 6px 16px; }
.modal-card .avatar-hint { font-size: 12px; margin-top: 10px; }

/* Vue transition สำหรับ backdrop */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity .25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .bg-blob, .floating-emoji { animation: none; }
  .member-card, .top-bar, .hero, .footer-note, .modal-card {
    transition: none;
    animation: none;
    opacity: 1;
    transform: none;
    translate: 0 0;
  }
}

@media (max-width: 640px) {
  .hero-title { font-size: 32px; }
  .avatar-wrap { width: 116px; height: 116px; }
  .modal-card { padding: 40px 22px 30px; }
  .modal-avatar-wrap { width: 168px; height: 168px; }
  .modal-name { font-size: 22px; }
}
</style>