<template>
  <nav class="nav-buttons">
    <router-link to="/" class="btn">หลัก</router-link>
    <router-link to="/forgot-password" class="btn">Forgot Password</router-link>
    <router-link to="/admin/users" class="btn">Admin Users</router-link>
    <router-link to="/logs/new" class="btn">New Log</router-link>
    <router-link to="/logs/:id/edit" class="btn">Edit Log</router-link>
    <router-link to="/logs" class="btn">Logs</router-link>
    <router-link to="/logs/:id" class="btn">Log Detail</router-link>
  </nav>

  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.fullPath" />
  </router-view>
</template>

<style scoped>
.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #2563eb;
}
</style>