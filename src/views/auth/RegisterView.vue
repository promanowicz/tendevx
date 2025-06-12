<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long'
    return
  }

  try {
    await authStore.register(email.value, password.value, name.value)
    router.push('/')
  } catch (error) {
    errorMessage.value = (error as Error).message
  }
}
</script>

<template>
  <div class="register-container">
    <h1>Register</h1>

    <form @submit="handleSubmit" class="register-form">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          type="text"
          v-model="name"
          required
          autocomplete="name"
        >
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          autocomplete="email"
        >
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          autocomplete="new-password"
        >
        <small>Password must be at least 8 characters long</small>
      </div>

      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          v-model="confirmPassword"
          required
          autocomplete="new-password"
        >
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Creating account...' : 'Register' }}
        </button>
        <router-link to="/login" class="login-link">
          Already have an account? Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group small {
  color: #666;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.form-actions button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-link {
  color: #666;
  text-decoration: none;
}

.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}
</style>
