<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaign } from '@/composables/useCampaign'
import { Timestamp } from 'firebase/firestore'

const router = useRouter()
const { createCampaign, error: campaignError } = useCampaign()

const error = ref('')

// Manager fields
const name = ref('')
const description = ref('')

// Commercial content fields
const sponsor = ref('')
const topLabel = ref('')
const bottomLabel = ref('')
const code = ref('')
const imageUrl = ref('')
const bannerUrl = ref('')
const productActionUrl = ref('')

// Targeting fields
const trainingId = ref<number | ''>('')
const breakIndexesInput = ref('') // comma-separated input

// Schedule fields
const startDateInput = ref('')
const endDateInput = ref('')

const parseBreakIndexes = (input: string): number[] => {
  return input
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))
}

const dateToTimestamp = (dateStr: string): Timestamp | null => {
  if (!dateStr) return null
  return Timestamp.fromDate(new Date(dateStr))
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''

  if (!name.value.trim()) {
    error.value = 'Campaign name is required'
    return
  }

  if (!sponsor.value.trim()) {
    error.value = 'Sponsor is required'
    return
  }

  try {
    const campaign = await createCampaign({
      name: name.value.trim(),
      description: description.value.trim(),
      sponsor: sponsor.value.trim(),
      topLabel: topLabel.value.trim(),
      bottomLabel: bottomLabel.value.trim(),
      code: code.value.trim(),
      imageUrl: imageUrl.value.trim(),
      bannerUrl: bannerUrl.value.trim(),
      productActionUrl: productActionUrl.value.trim(),
      trainingId: trainingId.value === '' ? 0 : Number(trainingId.value),
      breakIndexes: parseBreakIndexes(breakIndexesInput.value),
      startDate: dateToTimestamp(startDateInput.value),
      endDate: dateToTimestamp(endDateInput.value),
      published: false,
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

      <!-- Manager fields -->
      <section class="form-section">
        <h2>Campaign Info</h2>

        <div class="form-group">
          <label for="name">Name <span class="required">*</span></label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            placeholder="Internal campaign name"
          >
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="description"
            rows="3"
            placeholder="Internal notes about this campaign"
          ></textarea>
        </div>
      </section>

      <!-- Commercial content -->
      <section class="form-section">
        <h2>Commercial Content</h2>

        <div class="form-group">
          <label for="sponsor">Sponsor <span class="required">*</span></label>
          <input
            id="sponsor"
            v-model="sponsor"
            type="text"
            required
            placeholder="Sponsor name"
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="topLabel">Top Label</label>
            <input
              id="topLabel"
              v-model="topLabel"
              type="text"
              placeholder="Text shown at the top"
            >
          </div>

          <div class="form-group">
            <label for="bottomLabel">Bottom Label</label>
            <input
              id="bottomLabel"
              v-model="bottomLabel"
              type="text"
              placeholder="Text shown at the bottom"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="code">Promo Code</label>
          <input
            id="code"
            v-model="code"
            type="text"
            placeholder="Discount or promo code"
          >
        </div>

        <div class="form-group">
          <label for="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            v-model="imageUrl"
            type="url"
            placeholder="https://..."
          >
        </div>

        <div class="form-group">
          <label for="bannerUrl">Banner URL</label>
          <input
            id="bannerUrl"
            v-model="bannerUrl"
            type="url"
            placeholder="https://..."
          >
        </div>

        <div class="form-group">
          <label for="productActionUrl">Product Action URL</label>
          <input
            id="productActionUrl"
            v-model="productActionUrl"
            type="url"
            placeholder="https://..."
          >
        </div>
      </section>

      <!-- Targeting -->
      <section class="form-section">
        <h2>Targeting</h2>

        <div class="form-row">
          <div class="form-group">
            <label for="trainingId">Training ID</label>
            <input
              id="trainingId"
              v-model="trainingId"
              type="number"
              min="0"
              placeholder="0"
            >
          </div>

          <div class="form-group">
            <label for="breakIndexes">Break Indexes</label>
            <input
              id="breakIndexes"
              v-model="breakIndexesInput"
              type="text"
              placeholder="e.g. 1, 3, 5"
            >
            <span class="field-hint">Comma-separated list of break positions</span>
          </div>
        </div>
      </section>

      <!-- Schedule -->
      <section class="form-section">
        <h2>Schedule</h2>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input
              id="startDate"
              v-model="startDateInput"
              type="date"
            >
          </div>

          <div class="form-group">
            <label for="endDate">End Date</label>
            <input
              id="endDate"
              v-model="endDateInput"
              type="date"
            >
          </div>
        </div>
      </section>

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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin: 0 0 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
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

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
}
</style>
