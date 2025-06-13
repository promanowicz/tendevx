<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  errorMessage.value = ''

  try {
    await authStore.login(email.value, password.value)
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (error) {
    errorMessage.value = (error as Error).message
  }
}
</script>

<template>
  <div class="login-container" data-testid="login-container">
    <h1>Login</h1>

    <form @submit="handleSubmit" class="login-form" data-testid="login-form">
      <div v-if="errorMessage" class="error-message" data-testid="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          autocomplete="email"
          data-testid="email-input"
        >
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          autocomplete="current-password"
          data-testid="password-input"
        >
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="authStore.isLoading" data-testid="submit-button">
          {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>
        <router-link to="/register" class="register-link" data-testid="register-link">
          Don't have an account? Register
        </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 80%;
  margin: 2rem auto;
  padding: 2rem;
  color: #333; /* Added default dark color for text */
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #333; /* Explicit dark color for labels */
  font-weight: 500;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333; /* Explicit dark color for input text */
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

.register-link {
  color: #555; /* Slightly lighter dark color for the link */
  text-decoration: none;
}

.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828; /* Error messages remain red */
  border-radius: 4px;
  text-align: center;
}

.page-container {
  max-width: 50%; /* Doubled from 450px */
  margin: 2rem auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
