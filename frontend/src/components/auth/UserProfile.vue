<template>
  <div class="user-profile">
    <div class="profile-header">
      <div class="avatar-section">
        <img 
          v-if="user?.avatar" 
          :src="user.avatar" 
          :alt="user.displayName"
          class="avatar"
        />
        <div v-else class="avatar-placeholder">
          {{ avatarInitials }}
        </div>
        <button @click="showAvatarUpload = true" class="avatar-edit-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
            <path d="m18.5 2.5-8 8v3h3l8-8a2.12 2.12 0 0 0 0-3 2.12 2.12 0 0 0-3 0z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <div class="profile-info">
        <h2>{{ user?.displayName || 'Anonymous User' }}</h2>
        <p class="email">{{ user?.email }}</p>
      </div>
    </div>

    <div class="profile-sections">
      <!-- Basic Information -->
      <section class="profile-section">
        <h3>Basic Information</h3>
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label for="displayName">Display Name</label>
            <input
              id="displayName"
              v-model="profileForm.displayName"
              type="text"
              :disabled="isUpdating"
              class="form-input"
              :class="{ 'error': errors.displayName }"
            />
            <span v-if="errors.displayName" class="error-message">{{ errors.displayName }}</span>
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              v-model="profileForm.bio"
              :disabled="isUpdating"
              placeholder="Tell us about yourself..."
              class="form-textarea"
              rows="3"
            />
          </div>

          <div v-if="updateError" class="error-message general-error">
            {{ updateError }}
          </div>

          <div v-if="updateSuccess" class="success-message">
            Profile updated successfully!
          </div>

          <button
            type="submit"
            :disabled="isUpdating || !hasChanges"
            class="update-button"
          >
            <span v-if="isUpdating" class="loading-spinner"></span>
            {{ isUpdating ? 'Updating...' : 'Update Profile' }}
          </button>
        </form>
      </section>

      <!-- Musical Preferences -->
      <section class="profile-section">
        <h3>Musical Preferences</h3>
        <div class="preferences-form">
          <div class="form-group">
            <label>Skill Level</label>
            <select v-model="profileForm.skillLevel" class="form-select">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div class="form-group">
            <label>Favorite Genres</label>
            <div class="tag-input">
              <div class="tags">
                <span 
                  v-for="genre in profileForm.genres" 
                  :key="genre" 
                  class="tag"
                >
                  {{ genre }}
                  <button @click="removeGenre(genre)" class="tag-remove">×</button>
                </span>
              </div>
              <input
                v-model="newGenre"
                @keydown.enter.prevent="addGenre"
                @keydown="handleGenreKeydown"
                placeholder="Add genres..."
                class="tag-input-field"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Instruments</label>
            <div class="tag-input">
              <div class="tags">
                <span 
                  v-for="instrument in profileForm.instruments" 
                  :key="instrument" 
                  class="tag"
                >
                  {{ instrument }}
                  <button @click="removeInstrument(instrument)" class="tag-remove">×</button>
                </span>
              </div>
              <input
                v-model="newInstrument"
                @keydown.enter.prevent="addInstrument"
                @keydown="handleInstrumentKeydown"
                placeholder="Add instruments..."
                class="tag-input-field"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Account Actions -->
      <section class="profile-section danger-section">
        <h3>Account Actions</h3>
        <div class="action-buttons">
          <button @click="handleLogout" class="logout-button">
            Sign Out
          </button>
        </div>
      </section>
    </div>

    <!-- Avatar Upload Modal (placeholder for future implementation) -->
    <div v-if="showAvatarUpload" class="modal-overlay" @click="showAvatarUpload = false">
      <div class="modal" @click.stop>
        <h3>Update Avatar</h3>
        <p>Avatar upload functionality coming soon!</p>
        <button @click="showAvatarUpload = false" class="modal-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Store
const authStore = useAuthStore()

// State
const profileForm = ref({
  displayName: '',
  bio: '',
  skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'professional',
  genres: [] as string[],
  instruments: [] as string[]
})

const newGenre = ref('')
const newInstrument = ref('')
const errors = ref<Record<string, string>>({})
const updateError = ref('')
const updateSuccess = ref('')
const isUpdating = ref(false)
const showAvatarUpload = ref(false)

// Computed
const user = computed(() => authStore.currentUser)

const avatarInitials = computed(() => {
  if (!user.value?.displayName) return '?'
  return user.value.displayName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

const hasChanges = computed(() => {
  if (!user.value) return false
  
  return (
    profileForm.value.displayName !== user.value.displayName ||
    profileForm.value.bio !== (user.value.bio || '') ||
    profileForm.value.skillLevel !== user.value.musicalPreferences.skillLevel ||
    JSON.stringify(profileForm.value.genres) !== JSON.stringify(user.value.musicalPreferences.genres) ||
    JSON.stringify(profileForm.value.instruments) !== JSON.stringify(user.value.musicalPreferences.instruments)
  )
})

// Methods
const initializeForm = () => {
  if (user.value) {
    profileForm.value = {
      displayName: user.value.displayName || '',
      bio: user.value.bio || '',
      skillLevel: user.value.musicalPreferences.skillLevel,
      genres: [...user.value.musicalPreferences.genres],
      instruments: [...user.value.musicalPreferences.instruments]
    }
  }
}

const validateForm = () => {
  errors.value = {}
  
  // Display name is optional, but if provided, validate max length only
  if (profileForm.value.displayName && profileForm.value.displayName.length > 50) {
    errors.value.displayName = 'Display name must be 50 characters or less'
  }
  
  return Object.keys(errors.value).length === 0
}

const updateProfile = async () => {
  updateError.value = ''
  updateSuccess.value = ''
  
  if (!validateForm()) {
    return
  }
  
  isUpdating.value = true
  
  try {
    // TODO: Implement actual profile update API call
    console.log('Profile update:', profileForm.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    updateSuccess.value = 'Profile updated successfully!'
    setTimeout(() => {
      updateSuccess.value = ''
    }, 3000)
  } catch (error) {
    console.error('Profile update failed:', error)
    updateError.value = 'Failed to update profile. Please try again.'
  } finally {
    isUpdating.value = false
  }
}

const addGenre = () => {
  const genre = newGenre.value.trim()
  if (genre && !profileForm.value.genres.includes(genre)) {
    profileForm.value.genres.push(genre)
    newGenre.value = ''
  }
}

const handleGenreKeydown = (event: KeyboardEvent) => {
  if (event.key === ',') {
    event.preventDefault()
    addGenre()
  }
}

const removeGenre = (genre: string) => {
  profileForm.value.genres = profileForm.value.genres.filter(g => g !== genre)
}

const addInstrument = () => {
  const instrument = newInstrument.value.trim()
  if (instrument && !profileForm.value.instruments.includes(instrument)) {
    profileForm.value.instruments.push(instrument)
    newInstrument.value = ''
  }
}

const handleInstrumentKeydown = (event: KeyboardEvent) => {
  if (event.key === ',') {
    event.preventDefault()
    addInstrument()
  }
}

const removeInstrument = (instrument: string) => {
  profileForm.value.instruments = profileForm.value.instruments.filter(i => i !== instrument)
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to sign out?')) {
    await authStore.logout()
  }
}

// Watchers
watch(user, initializeForm, { immediate: true })

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-section {
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid #e5e7eb;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.email {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.profile-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.profile-form,
.preferences-form {
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

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-input.error {
  border-color: #ef4444;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.tag-input {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem;
  min-height: 50px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-weight: bold;
  padding: 0;
  font-size: 1.1rem;
}

.tag-input-field {
  border: none;
  outline: none;
  flex: 1;
  min-width: 150px;
  padding: 0.25rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
}

.general-error {
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  text-align: center;
}

.success-message {
  color: #059669;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.75rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  text-align: center;
}

.update-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.update-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.update-button:disabled {
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

.danger-section {
  border-color: #fecaca;
  background-color: #fef2f2;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.logout-button {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: #dc2626;
}

.modal-overlay {
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

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.modal h3 {
  margin-bottom: 1rem;
}

.modal-close {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .user-profile {
    padding: 1rem;
  }
}
</style>
