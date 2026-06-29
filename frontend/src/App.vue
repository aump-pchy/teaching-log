<template>
  <div class="app-layout">

    <!-- Sidebar — แสดงเฉพาะหน้าที่ต้อง login -->
    <AppSidebar v-if="showSidebar" />

    <!-- Main content -->
    <main :class="['main-content', { 'with-sidebar': showSidebar }]">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()

// แสดง sidebar เฉพาะหน้าที่ meta.requiresAuth = true
const showSidebar = computed(() => !!route.meta.requiresAuth)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Sarabun', sans-serif; background: #f7f9f7; }

.app-layout { display: flex; min-height: 100vh; }

.main-content { flex: 1; min-width: 0; }

/* เลื่อน content ให้พ้น sidebar */
.main-content.with-sidebar { margin-left: 240px; transition: margin-left .2s ease; }

@media (max-width: 768px) {
  .main-content.with-sidebar { margin-left: 0; padding-top: 60px; }
}
</style>