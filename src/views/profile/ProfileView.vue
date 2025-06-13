<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const error = ref('')
const success = ref('')

const name = ref(authStore.userProfile?.name || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const updateName = async () => {
  error.value = ''
  success.value = ''

  if (!name.value.trim()) {
    error.value = 'Name cannot be empty'
    return
  }

  try {
    await authStore.updateProfile({ name: name.value.trim() })
    success.value = 'Profile updated successfully'
  } catch (e) {
    error.value = (e as Error).message
  }
}

const handlePasswordChange = async () => {
  error.value = ''
  success.value = ''

  if (newPassword.value.length < 8) {
    error.value = 'New password must be at least 8 characters long'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    // TODO: Implement password change functionality in auth store
    await authStore.resetPassword(authStore.userEmail || '')
    success.value = 'Password reset email sent'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="profile-container">
    <h1>Profile Settings</h1>

    <div class="profile-content">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <section class="profile-section">
        <h2>Personal Information</h2>
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Your name"
          >
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            :value="authStore.userEmail"
            disabled
          >
          <small>Email cannot be changed</small>
        </div>
        <button @click="updateName" class="update-button">
          Update Profile
        </button>
      </section>

      <section class="profile-section">
        <h2>Password Reset</h2>
        <p class="section-description">
          Need to change your password? We'll send you a password reset email.
        </p>
        <button @click="handlePasswordChange" class="password-reset-button">
          Send Password Reset Email
        </button>
      </section>

      <section class="profile-section">
        <h2>Account Information</h2>
        <div class="account-info">
          <div class="info-item">
            <span class="info-label">Account Status:</span>
            <span class="info-value">Active</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  width: 80%;
  margin: 0 auto;
}

.profile-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.profile-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.profile-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.section-description {
  color: #666;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.update-button,
.password-reset-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.password-reset-button {
  background-color: #2196F3;
}

.error-message,
.success-message {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.account-info {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  color: #333;
}
</style>
