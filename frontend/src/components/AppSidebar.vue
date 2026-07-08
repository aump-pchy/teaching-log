<template>
  <div class="sidebar-wrap">

    <!-- Overlay (mobile) -->
    <div v-if="isOpen" class="overlay" @click="close"></div>

    <!-- Sidebar -->
    <aside :class="['sidebar', { open: isOpen, collapsed: isCollapsed }]">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <i class="ti ti-notebook"></i>
        </div>
        <span v-if="!isCollapsed" class="brand-name">Teaching Log</span>
        <button v-if="!isCollapsed" class="collapse-btn desktop-only" @click="toggleCollapse" aria-label="ย่อเมนู">
          <i class="ti ti-layout-sidebar-left-collapse"></i>
        </button>
      </div>

      <!-- User info -->
      <div v-if="!isCollapsed" class="user-info">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-detail">
          <p class="user-name">{{ authStore.user?.full_name || 'ผู้ใช้งาน' }}</p>
          <p class="user-role">{{ authStore.user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครูผู้สอน' }}</p>
        </div>
      </div>
      <div v-else class="user-avatar-sm">{{ userInitial }}</div>

      <!-- Nav -->
      <nav class="nav">
        <p v-if="!isCollapsed" class="nav-label">เมนูหลัก</p>

        <router-link v-for="item in menuItems" :key="item.to"
          :to="item.to" class="nav-item" :title="isCollapsed ? item.label : ''"
          @click="closeMobile">
          <i :class="'ti ' + item.icon"></i>
          <span v-if="!isCollapsed">{{ item.label }}</span>
          <span v-if="!isCollapsed && item.badge" class="badge">{{ item.badge }}</span>
        </router-link>

        <template v-if="authStore.user?.role === 'admin'">
          <div v-if="!isCollapsed" class="nav-divider"></div>
          <p v-if="!isCollapsed" class="nav-label">จัดการระบบ</p>
          <router-link v-for="item in adminMenuItems" :key="item.to"
            :to="item.to" class="nav-item" :title="isCollapsed ? item.label : ''"
            @click="closeMobile">
            <i :class="'ti ' + item.icon"></i>
            <span v-if="!isCollapsed">{{ item.label }}</span>
          </router-link>
        </template>
      </nav>

      <!-- Bottom -->
      <div class="sidebar-bottom">
        <button v-if="isCollapsed" class="collapse-btn desktop-only" @click="toggleCollapse" aria-label="ขยายเมนู">
          <i class="ti ti-layout-sidebar-left-expand"></i>
        </button>
        <button class="nav-item logout-btn" @click="handleLogout">
          <i class="ti ti-logout"></i>
          <span v-if="!isCollapsed">ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Toggle button (mobile) -->
    <button class="mobile-toggle" @click="open" aria-label="เปิดเมนู">
      <i class="ti ti-menu-2"></i>
    </button>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isOpen = ref(false)        // mobile drawer
const isCollapsed = ref(false)   // desktop collapse

const menuItems = computed(() => {
  const items = [
    { to: '/logs',     icon: 'ti-list', label: 'บันทึกการสอน' },
    { to: '/logs/new', icon: 'ti-plus', label: 'เพิ่มบันทึกใหม่' },
  ]
  // teacher เห็นเมนูดูข้อมูลตัวเอง
  if (authStore.user?.role !== 'admin') {
    items.push({ to: '/admin/users', icon: 'ti-user', label: 'ข้อมูลของฉัน' })
  }
  return items
})

const adminMenuItems = [
  { to: '/admin/users',   icon: 'ti-users',    label: 'จัดการผู้ใช้' },
  { to: '/departments',   icon: 'ti-building', label: 'จัดการแผนกวิชา' },
  { to: '/admin/config',  icon: 'ti-settings', label: 'จัดการข้อมูลพื้นฐาน' },
]

const userInitial = computed(() => {
  const name = authStore.user?.full_name || 'U'
  return name.charAt(0)
})

function open()         { isOpen.value = true }
function close()        { isOpen.value = false }
function closeMobile()  { isOpen.value = false }
function toggleCollapse() { isCollapsed.value = !isCollapsed.value }

async function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// ปิด mobile drawer เมื่อ route เปลี่ยน
watch(route, () => { isOpen.value = false })
</script>

<style scoped>
.sidebar-wrap { position: relative; }

/* ===== SIDEBAR ===== */
.sidebar {
  width: 240px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  transition: width .2s ease, transform .25s ease;
  overflow: hidden;
}

.sidebar.collapsed { width: 64px; }

/* ===== BRAND ===== */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px;
  border-bottom: 1px solid #f3f4f6;
  min-height: 60px;
}
.brand-icon {
  width: 32px;
  height: 32px;
  background: #0F6E56;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-icon i { font-size: 18px; color: #fff; }
.brand-name { font-size: 15px; font-weight: 700; color: #085041; flex: 1; white-space: nowrap; }
.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 6px;
  font-size: 18px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.collapse-btn:hover { background: #f3f4f6; color: #374151; }

/* ===== USER INFO ===== */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
}
.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #EAF3DE;
  color: #085041;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-avatar-sm {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #EAF3DE;
  color: #085041;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px auto;
}
.user-detail { overflow: hidden; }
.user-name { font-size: 13px; font-weight: 500; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 12px; color: #6b7280; }

/* ===== NAV ===== */
.nav { flex: 1; padding: 10px 8px; overflow-y: auto; }
.nav-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 6px 8px 4px;
}
.nav-divider { height: 1px; background: #f3f4f6; margin: 6px 0; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  color: #4b5563;
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  font-family: 'Sarabun', sans-serif;
}
.nav-item i { font-size: 18px; flex-shrink: 0; }
.nav-item:hover { background: #f3f4f6; color: #111; }
.nav-item.router-link-active { background: #EAF3DE; color: #085041; font-weight: 500; }
.nav-item.router-link-active i { color: #0F6E56; }
.badge {
  margin-left: auto;
  background: #0F6E56;
  color: #fff;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 20px;
}

/* ===== BOTTOM ===== */
.sidebar-bottom {
  padding: 8px;
  border-top: 1px solid #f3f4f6;
}
.logout-btn { color: #ef4444; }
.logout-btn:hover { background: #fef2f2; color: #b91c1c; }

/* ===== MOBILE ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 49;
}
.mobile-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 48;
  background: #0F6E56;
  color: #fff;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); width: 240px !important; }
  .sidebar.open { transform: translateX(0); }
  .mobile-toggle { display: flex; }
  .desktop-only { display: none; }
}
</style>