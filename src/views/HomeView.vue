<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { campaigns, isLoading, error, fetchUserCampaigns } = useCampaign()

onMounted(async () => {
  await fetchUserCampaigns()
})

const navigateToCampaigns = () => {
  router.push('/campaigns')
}

const navigateToNewCampaign = () => {
  router.push('/campaigns/new')
}
</script>

<template>
  <div class="home-container">
    <header class="welcome-header">
      <h1>Welcome, {{ authStore.userProfile?.name || 'User' }}!</h1>
      <p class="subtitle">Manage your marketing campaigns efficiently</p>
    </header>

    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h2>Your Campaigns</h2>
        <div v-if="isLoading" class="loading-message">
          Loading campaigns...
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-else>
          <p class="stat-number">{{ campaigns.length }}</p>
          <p class="stat-label">Total Campaigns</p>
          <button @click="navigateToCampaigns" class="action-button">
            View All Campaigns
          </button>
        </div>
      </div>

      <div class="dashboard-card quick-actions">
        <h2>Quick Actions</h2>
        <button @click="navigateToNewCampaign" class="create-button">
          Create New Campaign
        </button>
        <router-link to="/profile" class="profile-link">
          Update Profile
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 80%;
  margin: 0 auto;
}

.welcome-header {
  text-align: center;
  margin-bottom: 3rem;
}

.subtitle {
  color: #666;
  margin-top: 0.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-card h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  margin-bottom: 1.5rem;
}

.action-button,
.create-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.action-button {
  background-color: #4CAF50;
  color: white;
}

.create-button {
  background-color: #2196F3;
  color: white;
  margin-bottom: 1rem;
}

.profile-link {
  display: block;
  text-align: center;
  color: #666;
  text-decoration: none;
}

.profile-link:hover {
  text-decoration: underline;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.error-message {
  color: #c62828;
}
</style>
