<script setup lang="ts">
import { ref, computed } from 'vue'
import { TRAININGS, getTrainingName } from '@/config/targeting.config'

const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()

const inputText = ref('')
const isOpen = ref(false)

// What to show in the input when not actively editing
const displayValue = computed(() => {
  const name = getTrainingName(props.modelValue)
  return name || (props.modelValue ? String(props.modelValue) : '')
})

const suggestions = computed(() => {
  const q = inputText.value.trim().toLowerCase()
  if (!q) return TRAININGS
  return TRAININGS.filter(t =>
    t.displayName.toLowerCase().includes(q) || String(t.id).includes(q),
  )
})

const onFocus = () => {
  inputText.value = ''
  isOpen.value = true
}

const onInput = (e: Event) => {
  inputText.value = (e.target as HTMLInputElement).value
}

const onBlur = () => {
  const trimmed = inputText.value.trim()

  if (trimmed) {
    const byName = TRAININGS.find(
      t => t.displayName.toLowerCase() === trimmed.toLowerCase(),
    )
    const asNumber = parseInt(trimmed, 10)

    if (byName) {
      emit('update:modelValue', byName.id)
    } else if (!isNaN(asNumber)) {
      emit('update:modelValue', asNumber)
    }
  }
  // empty input on blur = no change, keep current modelValue

  isOpen.value = false
}

// mousedown.prevent keeps focus in the input so blur doesn't fire before click
const pickSuggestion = (id: number) => {
  emit('update:modelValue', id)
  isOpen.value = false
}
</script>

<template>
  <div class="training-input-wrapper">
    <div class="input-row">
      <input
        type="text"
        :value="isOpen ? inputText : displayValue"
        :placeholder="'ID or name'"
        @focus="onFocus"
        @input="onInput"
        @blur="onBlur"
      >
      <span v-if="!isOpen && getTrainingName(modelValue)" class="id-badge">
        #{{ modelValue }}
      </span>
    </div>

    <ul v-if="isOpen && suggestions.length" class="suggestions">
      <li
        v-for="t in suggestions"
        :key="t.id"
        @mousedown.prevent="pickSuggestion(t.id)"
      >
        <span class="suggestion-name">{{ t.displayName }}</span>
        <span class="suggestion-id">#{{ t.id }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.training-input-wrapper {
  position: relative;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-row input {
  flex: 1;
  padding: 0.55rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.input-row input:focus {
  outline: none;
  border-color: #4CAF50;
}

.id-badge {
  font-size: 0.78rem;
  color: #888;
  white-space: nowrap;
}

.suggestions {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.suggestions li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.suggestions li:hover {
  background-color: #f1f8f1;
}

.suggestion-name {
  color: #333;
}

.suggestion-id {
  font-size: 0.8rem;
  color: #aaa;
}
</style>
