<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { getCampaign, updateCampaign, error: campaignError } = useCampaign()

const isEditing = ref(false)
const campaign = ref<any>(null)
const error = ref('')

// Form fields
const title = ref('')
const description = ref('')
const groups = ref<string[]>([])
const newGroup = ref('')

onMounted(async () => {
  const campaignId = route.params.id as string
  try {
    const result = await getCampaign(campaignId)
    if (!result) {
      router.push('/campaigns')
      return
    }
    campaign.value = result
    // Initialize form fields
    title.value = result.title
    description.value = result.description
    groups.value = [...result.groups]
  } catch (e) {
    error.value = (e as Error).message
  }
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  return new Date(timestamp.seconds * 1000).toLocaleDateString()
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    // Reset form when canceling edit
    title.value = campaign.value.title
    description.value = campaign.value.description
    groups.value = [...campaign.value.groups]
  }
}

const addGroup = () => {
  if (!newGroup.value.trim()) return
  if (!groups.value.includes(newGroup.value.trim())) {
    groups.value.push(newGroup.value.trim())
  }
  newGroup.value = ''
}

const removeGroup = (group: string) => {
  groups.value = groups.value.filter(g => g !== group)
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''

  if (!title.value.trim()) {
    error.value = 'Title is required'
    return
  }

  try {
    const updatedCampaign = await updateCampaign(campaign.value.uuid, {
      title: title.value.trim(),
      description: description.value.trim(),
      groups: groups.value
    })

    campaign.value = updatedCampaign
    isEditing.value = false
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="campaign-details-container">
    <div v-if="error || campaignError" class="error-message">
      {{ error || campaignError }}
    </div>

    <div v-if="campaign" class="campaign-content">
      <div class="campaign-header">
        <div v-if="!isEditing" class="view-mode">
          <h1>{{ campaign.title }}</h1>
          <button @click="toggleEdit" class="edit-button">
            Edit Campaign
          </button>
        </div>

        <form v-else @submit="handleSubmit" class="edit-form">
          <div class="form-group">
            <label for="title">Campaign Title</label>
            <input
              id="title"
              v-model="title"
              type="text"
              required
              placeholder="Enter campaign title"
            >
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="description"
              rows="4"
              placeholder="Enter campaign description"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Groups</label>
            <div class="groups-container">
              <div class="groups-input">
                <input
                  v-model="newGroup"
                  type="text"
                  placeholder="Add a group"
                  @keyup.enter.prevent="addGroup"
                >
                <button type="button" @click="addGroup" class="add-group-button">
                  Add
                </button>
              </div>

              <div v-if="groups.length > 0" class="groups-list">
                <span
                  v-for="group in groups"
                  :key="group"
                  class="group-tag"
                >
                  {{ group }}
                  <button
                    type="button"
                    @click="removeGroup(group)"
                    class="remove-group"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="toggleEdit" class="cancel-button">
              Cancel
            </button>
            <button type="submit" class="submit-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div v-if="!isEditing" class="campaign-info">
        <p class="campaign-description">{{ campaign.description }}</p>

        <div class="campaign-meta">
          <div class="meta-item">
            <span class="meta-label">Created:</span>
            <span>{{ formatDate(campaign.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Updated:</span>
            <span>{{ formatDate(campaign.updatedAt) }}</span>
          </div>
        </div>

        <div class="campaign-groups">
          <h3>Groups</h3>
          <div class="groups-list">
            <span
              v-for="group in campaign.groups"
              :key="group"
              class="group-tag"
            >
              {{ group }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!error" class="loading">
      Loading campaign details...
    </div>
  </div>
</template>

<style scoped>
.campaign-details-container {
  max-width: 800px;
  margin: 0 auto;
}

.campaign-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.campaign-header {
  margin-bottom: 2rem;
}

.view-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.campaign-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.campaign-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.meta-label {
  font-weight: 500;
  color: #666;
}

.campaign-groups h3 {
  margin-bottom: 1rem;
}

/* Form styles */
.edit-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.groups-container {
  margin-top: 0.5rem;
}

.groups-input {
  display: flex;
  gap: 0.5rem;
}

.add-group-button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.groups-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.group-tag {
  background-color: #e0f2f1;
  color: #00796b;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-group {
  background: none;
  border: none;
  color: #00796b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
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

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}
</style>
