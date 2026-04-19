<script setup lang="ts">
import type { AppTarget } from '@/db/database.types'
import { APPS } from '@/config/targeting.config'
import TrainingIdInput from '@/components/TrainingIdInput.vue'

const props = defineProps<{
  modelValue: AppTarget[]
}>()

const emit = defineEmits<{
  'update:modelValue': [AppTarget[]]
}>()

const isSelected = (appId: string) =>
  props.modelValue.some(t => t.appId === appId)

const getTarget = (appId: string): AppTarget | undefined =>
  props.modelValue.find(t => t.appId === appId)

const toggleApp = (appId: string) => {
  if (isSelected(appId)) {
    emit('update:modelValue', props.modelValue.filter(t => t.appId !== appId))
  } else {
    emit('update:modelValue', [
      ...props.modelValue,
      { appId, trainingId: 0, breakIndexes: [] },
    ])
  }
}

const onTrainingIdUpdate = (appId: string, trainingId: number) => {
  emit('update:modelValue', props.modelValue.map(t =>
    t.appId === appId ? { ...t, trainingId } : t,
  ))
}

const onBreakIndexesChange = (appId: string, event: Event) => {
  const raw = (event.target as HTMLInputElement).value
  const breakIndexes = raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))
  emit('update:modelValue', props.modelValue.map(t =>
    t.appId === appId ? { ...t, breakIndexes } : t,
  ))
}

const breakIndexesString = (appId: string): string => {
  const target = getTarget(appId)
  return target ? target.breakIndexes.join(', ') : ''
}
</script>

<template>
  <div class="targeting-editor">

    <div class="app-chips">
      <button
        v-for="app in APPS"
        :key="app.id"
        type="button"
        :class="['app-chip', { selected: isSelected(app.id) }]"
        @click="toggleApp(app.id)"
      >
        <span class="chip-check">{{ isSelected(app.id) ? '✓' : '+' }}</span>
        {{ app.displayName }}
      </button>
    </div>

    <div v-if="modelValue.length" class="targets-list">
      <div
        v-for="app in APPS.filter(a => isSelected(a.id))"
        :key="app.id"
        class="target-row"
      >
        <span class="target-app-name">{{ app.displayName }}</span>

        <div class="target-fields">
          <div class="field-group">
            <label>Training</label>
            <TrainingIdInput
              :model-value="getTarget(app.id)?.trainingId ?? 0"
              @update:model-value="onTrainingIdUpdate(app.id, $event)"
            />
          </div>

          <div class="field-group">
            <label>Break Indexes</label>
            <input
              type="text"
              :value="breakIndexesString(app.id)"
              placeholder="e.g. 1, 3, 5"
              @change="onBreakIndexesChange(app.id, $event)"
            >
            <span class="field-hint">Comma-separated</span>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="empty-hint">Select at least one app to configure targeting.</p>
  </div>
</template>

<style scoped>
.targeting-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1.5px solid #ccc;
  background: white;
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}

.app-chip.selected {
  border-color: #4CAF50;
  background-color: #f1f8f1;
  color: #2e7d32;
  font-weight: 500;
}

.chip-check {
  font-size: 0.8rem;
  font-weight: 700;
}

.targets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.target-row {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 1rem;
  background: #fafafa;
}

.target-app-name {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 0.75rem;
}

.target-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
}

.field-group input {
  padding: 0.55rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}

.field-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.field-hint {
  font-size: 0.78rem;
  color: #999;
}

.empty-hint {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}
</style>
