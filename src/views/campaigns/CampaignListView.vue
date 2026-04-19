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
  if (!timestamp) return '—'
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
        <div class="card-top">
          <h3>{{ campaign.name }}</h3>
          <span :class="['status-badge', campaign.published ? 'published' : 'draft']">
            {{ campaign.published ? 'Published' : 'Draft' }}
          </span>
        </div>

        <p class="campaign-sponsor">{{ campaign.sponsor }}</p>
        <p class="campaign-description">{{ campaign.description }}</p>

        <div class="campaign-meta">
          <span>Start: {{ formatDate(campaign.startDate) }}</span>
          <span>End: {{ formatDate(campaign.endDate) }}</span>
        </div>

        <div class="campaign-analytics">
          <span title="Impressions">👁 {{ campaign.attentionCounter }}</span>
          <span title="Clicks">🖱 {{ campaign.consumptionCounter }}</span>
          <span title="Interested">❤️ {{ campaign.interestedUsers?.length ?? 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campaigns-container {
  width: 80%;
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

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.card-top h3 {
  margin: 0;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  white-space: nowrap;
}

.status-badge.published {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.draft {
  background-color: #f5f5f5;
  color: #757575;
}

.campaign-sponsor {
  font-weight: 500;
  color: #333;
  margin: 0.25rem 0 0.5rem;
}

.campaign-description {
  color: #666;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
}

.campaign-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #888;
  margin-bottom: 0.75rem;
}

.campaign-analytics {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #555;
  border-top: 1px solid #f0f0f0;
  padding-top: 0.75rem;
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
