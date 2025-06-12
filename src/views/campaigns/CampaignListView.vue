<script setup lang="ts">
import { onMounted } from 'vue'
import { useCampaign } from '@/composables/useCampaign'
import { useRouter } from 'vue-router'

const { campaigns, isLoading, error, fetchUserCampaigns } = useCampaign()
const router = useRouter()

onMounted(async () => {
  await fetchUserCampaigns()
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  return new Date(timestamp.seconds * 1000).toLocaleDateString()
}

const navigateToDetails = (uuid: string) => {
  router.push(`/campaigns/${uuid}`)
}
</script>

<template>
  <div class="campaigns-container">
    <div class="campaigns-header">
      <h1>My Campaigns</h1>
      <router-link to="/campaigns/new" class="new-campaign-button">
        Create New Campaign
      </router-link>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="isLoading" class="loading-message">
      Loading campaigns...
    </div>

    <div v-else-if="campaigns.length === 0" class="empty-state">
      No campaigns found. Create your first campaign!
    </div>

    <div v-else class="campaigns-grid">
      <div
        v-for="campaign in campaigns"
        :key="campaign.uuid"
        class="campaign-card"
        @click="navigateToDetails(campaign.uuid)"
      >
        <h3>{{ campaign.title }}</h3>
        <p class="campaign-description">{{ campaign.description }}</p>
        <div class="campaign-meta">
          <span>Created: {{ formatDate(campaign.createdAt) }}</span>
          <span>Updated: {{ formatDate(campaign.updatedAt) }}</span>
        </div>
        <div class="campaign-groups">
          <span v-for="group in campaign.groups" :key="group" class="group-tag">
            {{ group }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campaigns-container {
  max-width: 1200px;
  margin: 0 auto;
}

.campaigns-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.new-campaign-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.campaign-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.campaign-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.campaign-description {
  color: #666;
  margin: 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #888;
  margin: 1rem 0;
}

.campaign-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.group-tag {
  background-color: #e0f2f1;
  color: #00796b;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading-message,
.empty-state {
  text-align: center;
  color: #666;
  padding: 2rem;
}
</style>
