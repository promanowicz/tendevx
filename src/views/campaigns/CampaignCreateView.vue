<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { createCampaign, error: campaignError } = useCampaign()
const authStore = useAuthStore()

const title = ref('')
const description = ref('')
const groups = ref<string[]>([])
const newGroup = ref('')
const error = ref('')

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
    const campaign = await createCampaign({
      title: title.value.trim(),
      description: description.value.trim(),
      ownerId: authStore.userId!,
      groups: groups.value
    })

    router.push(`/campaigns/${campaign.uuid}`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="create-campaign-container">
    <h1>Create New Campaign</h1>

    <form @submit="handleSubmit" class="campaign-form">
      <div v-if="error || campaignError" class="error-message">
        {{ error || campaignError }}
      </div>

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
        <button type="button" @click="router.back()" class="cancel-button">
          Cancel
        </button>
        <button type="submit" class="submit-button">
          Create Campaign
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-campaign-container {
  width: 80%;
  margin: 0 auto;
}

.campaign-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
</style>
