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
  <div class="page-container">
    <h1 class="project-title">Commercial Manager</h1>
    <div class="register-container">
      <h2 class="register-title">Register</h2>

      <form @submit="handleSubmit" class="register-form">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="name" class="form-label">Name</label>
          <input
            id="name"
            type="text"
            v-model="name"
            required
            autocomplete="name"
          >
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            autocomplete="email"
          >
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
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
          <label for="confirm-password" class="form-label">Confirm Password</label>
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
  </div>
</template>

<style scoped>
.page-container {
  max-width: 900px; /* Doubled from 450px */
  margin: 2rem auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.project-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #000; /* Black */
  font-weight: 600;
  width: 100%;
}

.register-container {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #000; /* Base text color black */
  width: 100%;
  max-width: 400px; /* Consistent with LoginView */
}

.register-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: #000; /* Black */
  font-weight: 600;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center; /* Center form elements */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%; /* Allow inputs to take up defined max-width */
  align-items: center; /* Center label and input within the group */
}

.form-label {
  font-weight: 600;
  color: #000; /* Black */
  font-size: 0.95rem;
  text-align: center;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #000; /* Black for input text */
  background-color: #fff;
  width: 100%;
  max-width: 300px; /* Consistent input width */
}

.form-group small {
  color: #555; /* Dark gray for helper text */
  font-size: 0.875rem;
  text-align: center;
  width: 100%;
  max-width: 300px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 300px; /* Match input width */
}

.form-actions button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.form-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-link {
  color: #555; /* Consistent with LoginView's secondary link */
  text-decoration: none;
  text-align: center;
  font-weight: 500;
}

.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  width: 100%;
  max-width: 300px; /* Align with other form elements */
}
</style>
