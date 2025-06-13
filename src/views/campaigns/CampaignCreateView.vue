<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { useAuthStore } from '@/stores/auth'
import { OpenRouterService } from '@/services/openrouter-service'

const router = useRouter()
const { createCampaign, error: campaignError } = useCampaign()
const authStore = useAuthStore()

// Existing refs
const title = ref('')
const description = ref('')
const groups = ref<string[]>([])
const newGroup = ref('')
const error = ref('')

// New refs for AI suggestions
const showSuggestions = ref(false)
const aiSuggestions = ref('')
const isLoadingSuggestions = ref(false)
const suggestionType = ref<'title' | 'description'>('title')
const suggestionOriginalValue = ref('')

// Initialize OpenRouter service
const openRouter = new OpenRouterService({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || ''
})

const requestAiSuggestions = async (type: 'title' | 'description') => {
  suggestionType.value = type
  suggestionOriginalValue.value = type === 'title' ? title.value : description.value

  if (!suggestionOriginalValue.value.trim()) {
    error.value = `Please enter some ${type} text first`
    return
  }

  try {
    isLoadingSuggestions.value = true
    const campaign = {
      uuid: 'draft',
      title: type === 'title' ? title.value : '',
      description: type === 'description' ? description.value : '',
      ownerId: authStore.userId!,
      groups: groups.value,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const suggestions = await openRouter.provideSuggestion(campaign)
    // Extract the relevant part from AI response
    const improvedText = suggestions.split('\n').find(line =>
      line.toLowerCase().includes(type.toLowerCase() + ':')
    )?.split(':')[1]?.trim() || suggestions.trim()

    aiSuggestions.value = improvedText
    showSuggestions.value = true
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    isLoadingSuggestions.value = false
  }
}

const applySuggestions = () => {
  if (suggestionType.value === 'title') {
    title.value = aiSuggestions.value
  } else {
    description.value = aiSuggestions.value
  }
  showSuggestions.value = false
}

const rejectSuggestions = () => {
  showSuggestions.value = false
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
        <div class="input-with-magic">
          <input
            id="title"
            v-model="title"
            type="text"
            required
            placeholder="Enter campaign title"
          >
<!--          <button-->
<!--            type="button"-->
<!--            class="magic-button"-->
<!--            @click="requestAiSuggestions('title')"-->
<!--            :disabled="isLoadingSuggestions"-->
<!--          >-->
<!--            ✨-->
<!--          </button>-->
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <div class="input-with-magic">
          <textarea
            id="description"
            v-model="description"
            rows="4"
            placeholder="Enter campaign description"
          ></textarea>
          <button
            type="button"
            class="magic-button"
            @click="requestAiSuggestions('description')"
            :disabled="isLoadingSuggestions"
          >
            ✨
          </button>
        </div>
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

    <!-- AI Suggestions Dialog -->
    <div v-if="showSuggestions" class="suggestions-overlay">
      <div class="suggestions-dialog">
        <h3>AI Suggestions</h3>
        <div class="suggestions-content">
          <div class="original-text">
            <h4>Original {{ suggestionType }}</h4>
            <p>{{ suggestionOriginalValue }}</p>
          </div>
          <div class="suggested-text">
            <h4>Suggested {{ suggestionType }}</h4>
            <p>{{ aiSuggestions }}</p>
          </div>
        </div>
        <div class="suggestions-actions">
          <button @click="rejectSuggestions" class="reject-button">
            Reject
          </button>
          <button @click="applySuggestions" class="apply-button">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
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

.input-with-magic {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.input-with-magic input,
.input-with-magic textarea {
  flex: 1;
}

.magic-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: transform 0.2s;
  line-height: 1;
}

.magic-button:hover {
  transform: scale(1.1);
  background-color: #f0f0f0;
}

.magic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggestions-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.suggestions-dialog {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.suggestions-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 1.5rem 0;
}

.original-text,
.suggested-text {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}

.suggestions-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.reject-button,
.apply-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.reject-button {
  background: none;
  border: 1px solid #666;
  color: #666;
}

.apply-button {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.suggestions-dialog h3 {
  margin: 0 0 1rem;
  color: #333;
}

.suggestions-dialog h4 {
  margin: 0 0 0.5rem;
  color: #666;
}
</style>
