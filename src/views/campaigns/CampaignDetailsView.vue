<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { Timestamp } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const { getCampaign, updateCampaign, deleteCampaign, error: campaignError } = useCampaign()

const isEditing = ref(false)
const campaign = ref<any>(null)
const error = ref('')
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// Form fields — manager
const name = ref('')
const description = ref('')

// Form fields — commercial content
const sponsor = ref('')
const topLabel = ref('')
const bottomLabel = ref('')
const code = ref('')
const imageUrl = ref('')
const bannerUrl = ref('')
const productActionUrl = ref('')

// Form fields — targeting
const trainingId = ref<number>(0)
const breakIndexesInput = ref('')

// Form fields — schedule
const startDateInput = ref('')
const endDateInput = ref('')

const timestampToDateInput = (ts: any): string => {
  if (!ts) return ''
  return new Date(ts.seconds * 1000).toISOString().split('T')[0]
}

const dateToTimestamp = (dateStr: string): Timestamp | null => {
  if (!dateStr) return null
  return Timestamp.fromDate(new Date(dateStr))
}

const formatDate = (ts: any): string => {
  if (!ts) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString()
}

const populateForm = (c: any) => {
  name.value = c.name
  description.value = c.description
  sponsor.value = c.sponsor
  topLabel.value = c.topLabel
  bottomLabel.value = c.bottomLabel
  code.value = c.code
  imageUrl.value = c.imageUrl
  bannerUrl.value = c.bannerUrl
  productActionUrl.value = c.productActionUrl
  trainingId.value = c.trainingId
  breakIndexesInput.value = (c.breakIndexes ?? []).join(', ')
  startDateInput.value = timestampToDateInput(c.startDate)
  endDateInput.value = timestampToDateInput(c.endDate)
}

onMounted(async () => {
  const campaignId = route.params.id as string
  try {
    const result = await getCampaign(campaignId)
    if (!result) {
      router.push('/campaigns')
      return
    }
    campaign.value = result
    populateForm(result)
  } catch (e) {
    error.value = (e as Error).message
  }
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    populateForm(campaign.value)
  }
}

const parseBreakIndexes = (input: string): number[] => {
  return input
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''

  if (!name.value.trim()) {
    error.value = 'Campaign name is required'
    return
  }

  try {
    const updatedCampaign = await updateCampaign(campaign.value.uuid, {
      name: name.value.trim(),
      description: description.value.trim(),
      sponsor: sponsor.value.trim(),
      topLabel: topLabel.value.trim(),
      bottomLabel: bottomLabel.value.trim(),
      code: code.value.trim(),
      imageUrl: imageUrl.value.trim(),
      bannerUrl: bannerUrl.value.trim(),
      productActionUrl: productActionUrl.value.trim(),
      trainingId: Number(trainingId.value),
      breakIndexes: parseBreakIndexes(breakIndexesInput.value),
      startDate: dateToTimestamp(startDateInput.value),
      endDate: dateToTimestamp(endDateInput.value),
    })

    campaign.value = updatedCampaign
    isEditing.value = false
  } catch (e) {
    error.value = (e as Error).message
  }
}

const togglePublished = async () => {
  try {
    const updatedCampaign = await updateCampaign(campaign.value.uuid, {
      published: !campaign.value.published,
    })
    campaign.value = updatedCampaign
  } catch (e) {
    error.value = (e as Error).message
  }
}

const handleDelete = async () => {
  if (!campaign.value) return
  isDeleting.value = true
  error.value = ''
  try {
    await deleteCampaign(campaign.value.uuid)
    showDeleteConfirm.value = false
    router.push('/campaigns')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="campaign-details-container">
    <div v-if="error || campaignError" class="error-message">
      {{ error || campaignError }}
    </div>

    <div v-if="campaign" class="campaign-content">

      <!-- Header bar -->
      <div class="campaign-header">
        <div class="header-left">
          <router-link to="/campaigns" class="back-link">← Campaigns</router-link>
          <h1>{{ campaign.name }}</h1>
        </div>
        <div class="header-actions">
          <button
            @click="togglePublished"
            :class="['publish-button', campaign.published ? 'unpublish' : 'publish']"
          >
            {{ campaign.published ? 'Unpublish' : 'Publish' }}
          </button>
          <button v-if="!isEditing" @click="toggleEdit" class="edit-button">
            Edit
          </button>
        </div>
      </div>

      <!-- View mode -->
      <template v-if="!isEditing">
        <section class="info-section">
          <h2>Campaign Info</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Name</span>
              <span>{{ campaign.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Description</span>
              <span>{{ campaign.description || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Created</span>
              <span>{{ formatDate(campaign.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Updated</span>
              <span>{{ formatDate(campaign.updatedAt) }}</span>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h2>Commercial Content</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Sponsor</span>
              <span>{{ campaign.sponsor || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Top Label</span>
              <span>{{ campaign.topLabel || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Bottom Label</span>
              <span>{{ campaign.bottomLabel || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Promo Code</span>
              <span>{{ campaign.code || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Image URL</span>
              <a v-if="campaign.imageUrl" :href="campaign.imageUrl" target="_blank" class="url-link">{{ campaign.imageUrl }}</a>
              <span v-else>—</span>
            </div>
            <div class="info-item">
              <span class="info-label">Banner URL</span>
              <a v-if="campaign.bannerUrl" :href="campaign.bannerUrl" target="_blank" class="url-link">{{ campaign.bannerUrl }}</a>
              <span v-else>—</span>
            </div>
            <div class="info-item">
              <span class="info-label">Product Action URL</span>
              <a v-if="campaign.productActionUrl" :href="campaign.productActionUrl" target="_blank" class="url-link">{{ campaign.productActionUrl }}</a>
              <span v-else>—</span>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h2>Targeting</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Training ID</span>
              <span>{{ campaign.trainingId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Break Indexes</span>
              <span>{{ campaign.breakIndexes?.join(', ') || '—' }}</span>
            </div>
          </div>
        </section>

        <section class="info-section">
          <h2>Schedule</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Start Date</span>
              <span>{{ formatDate(campaign.startDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">End Date</span>
              <span>{{ formatDate(campaign.endDate) }}</span>
            </div>
          </div>
        </section>

        <section class="info-section analytics-section">
          <h2>Analytics</h2>
          <div class="analytics-grid">
            <div class="analytics-card">
              <span class="analytics-value">{{ campaign.attentionCounter }}</span>
              <span class="analytics-label">Impressions</span>
            </div>
            <div class="analytics-card">
              <span class="analytics-value">{{ campaign.consumptionCounter }}</span>
              <span class="analytics-label">Clicks</span>
            </div>
            <div class="analytics-card">
              <span class="analytics-value">{{ campaign.interestedUsers?.length ?? 0 }}</span>
              <span class="analytics-label">Interested Users</span>
            </div>
          </div>
        </section>

        <!-- Delete -->
        <div class="danger-zone">
          <button @click="showDeleteConfirm = true" class="delete-button">
            Delete Campaign
          </button>
          <div v-if="showDeleteConfirm" class="delete-confirmation">
            <p>Are you sure you want to delete this campaign?</p>
            <div class="confirm-actions">
              <button @click="showDeleteConfirm = false" class="cancel-delete-button">Cancel</button>
              <button @click="handleDelete" class="confirm-delete-button" :disabled="isDeleting">
                <span v-if="isDeleting" class="loader"></span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Edit mode -->
      <form v-else @submit="handleSubmit" class="edit-form">
        <section class="form-section">
          <h2>Campaign Info</h2>
          <div class="form-group">
            <label for="name">Name <span class="required">*</span></label>
            <input id="name" v-model="name" type="text" required>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" v-model="description" rows="3"></textarea>
          </div>
        </section>

        <section class="form-section">
          <h2>Commercial Content</h2>
          <div class="form-group">
            <label for="sponsor">Sponsor</label>
            <input id="sponsor" v-model="sponsor" type="text">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="topLabel">Top Label</label>
              <input id="topLabel" v-model="topLabel" type="text">
            </div>
            <div class="form-group">
              <label for="bottomLabel">Bottom Label</label>
              <input id="bottomLabel" v-model="bottomLabel" type="text">
            </div>
          </div>
          <div class="form-group">
            <label for="code">Promo Code</label>
            <input id="code" v-model="code" type="text">
          </div>
          <div class="form-group">
            <label for="imageUrl">Image URL</label>
            <input id="imageUrl" v-model="imageUrl" type="url">
          </div>
          <div class="form-group">
            <label for="bannerUrl">Banner URL</label>
            <input id="bannerUrl" v-model="bannerUrl" type="url">
          </div>
          <div class="form-group">
            <label for="productActionUrl">Product Action URL</label>
            <input id="productActionUrl" v-model="productActionUrl" type="url">
          </div>
        </section>

        <section class="form-section">
          <h2>Targeting</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="trainingId">Training ID</label>
              <input id="trainingId" v-model="trainingId" type="number" min="0">
            </div>
            <div class="form-group">
              <label for="breakIndexes">Break Indexes</label>
              <input id="breakIndexes" v-model="breakIndexesInput" type="text" placeholder="e.g. 1, 3, 5">
              <span class="field-hint">Comma-separated list</span>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2>Schedule</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input id="startDate" v-model="startDateInput" type="date">
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input id="endDate" v-model="endDateInput" type="date">
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button type="button" @click="toggleEdit" class="cancel-button">Cancel</button>
          <button type="submit" class="submit-button">Save Changes</button>
        </div>
      </form>
    </div>

    <div v-else-if="!error" class="loading">
      Loading campaign details...
    </div>
  </div>
</template>

<style scoped>
.campaign-details-container {
  width: 80%;
  margin: 0 auto;
}

.campaign-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.campaign-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-left h1 {
  margin: 0;
}

.back-link {
  font-size: 0.875rem;
  color: #666;
  text-decoration: none;
}

.back-link:hover {
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.edit-button {
  padding: 0.6rem 1.25rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.publish-button {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.publish-button.publish {
  background-color: #1976D2;
  color: white;
}

.publish-button.unpublish {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ccc;
}

/* Sections */
.info-section,
.form-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-section h2,
.form-section h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin: 0 0 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.url-link {
  color: #1976D2;
  text-decoration: none;
  word-break: break-all;
  font-size: 0.9rem;
}

.url-link:hover {
  text-decoration: underline;
}

/* Analytics */
.analytics-grid {
  display: flex;
  gap: 2rem;
}

.analytics-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9f9f9;
  padding: 1rem 2rem;
  border-radius: 8px;
  min-width: 120px;
}

.analytics-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.analytics-label {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
}

/* Edit form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.required {
  color: #e53935;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
}

.cancel-button {
  background: none;
  border: 1px solid #666;
  color: #666;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  border: none;
}

/* Danger zone */
.danger-zone {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-button {
  background-color: #e53935;
  color: white;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.delete-confirmation {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff3f3;
  border: 1px solid #e53935;
  border-radius: 4px;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}

.confirm-delete-button,
.cancel-delete-button {
  padding: 0.6rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.confirm-delete-button {
  background-color: #e53935;
  color: white;
  border: none;
}

.cancel-delete-button {
  background: none;
  border: 1px solid #666;
  color: #666;
}

.loader {
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}
</style>
