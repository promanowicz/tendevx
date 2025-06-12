<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  authStore.initialize()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <!-- Navigation bar -->
    <nav v-if="authStore.isAuthenticated" class="navbar">
      <div class="nav-brand">
        <router-link to="/">Commercial Manager</router-link>
      </div>

      <div class="nav-links">
        <router-link to="/campaigns">Campaigns</router-link>
        <router-link to="/campaigns/new">New Campaign</router-link>
        <router-link to="/profile">Profile</router-link>
        <button @click="handleLogout" class="logout-button">
          Logout
        </button>
      </div>
    </nav>

    <!-- Main content -->
    <main :class="{ 'with-nav': authStore.isAuthenticated }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 1000;
}

.nav-brand a {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #4CAF50;
}

.logout-button {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-button:hover {
  background-color: #dc3545;
  color: white;
}

main {
  padding: 2rem;
}

main.with-nav {
  padding-top: calc(60px + 2rem);
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
