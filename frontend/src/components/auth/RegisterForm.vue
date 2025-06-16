<template>
  <div class="register-form">
    <div class="form-header">
      <h2>Create Account</h2>
      <p>Join our music collaboration platform today!</p>
    </div>

    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label for="displayName">Display Name</label>
        <input
          id="displayName"
          v-model="form.displayName"
          type="text"
          :disabled="isLoading"
          placeholder="Your display name (optional)"
          class="form-input"
          :class="{ 'error': errors.displayName }"
        />
        <span v-if="errors.displayName" class="error-message">{{ errors.displayName }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          :disabled="isLoading"
          placeholder="Enter your email"
          class="form-input"
          :class="{ 'error': errors.email }"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          :disabled="isLoading"
          placeholder="Create a password"
          class="form-input"
          :class="{ 'error': errors.password }"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        <small class="form-hint">At least 8 characters</small>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          required
          :disabled="isLoading"
          placeholder="Confirm your password"
          class="form-input"
          :class="{ 'error': errors.confirmPassword }"
        />
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <div v-if="generalError" class="error-message general-error">
        {{ generalError }}
      </div>

      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        class="submit-button"
      >
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <div class="form-footer">
      <p>Already have an account? <button @click="emit('switchToLogin')" class="link-button">Sign in</button></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { RegisterData } from '@/types'

// Emits
const emit = defineEmits<{
  switchToLogin: []
  registerSuccess: []
}>()

// Store
const authStore = useAuthStore()

// Form state
const form = ref<RegisterData & { confirmPassword: string }>({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})
const generalError = ref('')

// Computed
const isLoading = computed(() => authStore.isLoading)
const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    !Object.keys(errors.value).length
  )
})

// Methods
const validateForm = () => {
  errors.value = {}
  
  // Display name is optional, but if provided, validate max length only
  if (form.value.displayName && form.value.displayName.length > 50) {
    errors.value.displayName = 'Display name must be 50 characters or less'
  }
  
  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }
  
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  generalError.value = ''
  
  if (!validateForm()) {
    return
  }
  
  const registerData: RegisterData = {
    email: form.value.email,
    password: form.value.password,
    displayName: form.value.displayName || undefined
  }
  
  const result = await authStore.register(registerData)
  
  if (result.success) {
    // Emit success event for parent component
    emit('registerSuccess')
  } else {
    generalError.value = result.error || 'Registration failed'
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.form-header p {
  color: #6c757d;
  font-size: 0.95rem;
}

.auth-form {
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
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.form-hint {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
}

.general-error {
  text-align: center;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.submit-button {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-footer p {
  color: #6c757d;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
}

.link-button:hover {
  color: #2563eb;
}
</style>
