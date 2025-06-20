<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-icon danger">
          <i class="icon-warning"></i>
        </div>
        <h2>Delete Project</h2>
      </div>
      
      <div class="modal-body">
        <p class="warning-text">
          Are you sure you want to delete <strong>"{{ project?.name }}"</strong>?
        </p>
        
        <div class="consequences">
          <h4>This action will permanently:</h4>
          <ul>
            <li>Delete all project data and stems</li>
            <li>Remove all collaborators from the project</li>
            <li>Delete project history and comments</li>
            <li>Remove the project from all playlists</li>
          </ul>
        </div>
        
        <div class="confirmation-input">
          <label for="confirm-name" class="form-label">
            Type <strong>{{ project?.name }}</strong> to confirm:
          </label>
          <input
            id="confirm-name"
            v-model="confirmationText"
            type="text"
            class="form-input"
            :placeholder="project?.name"
            :class="{ error: showError }"
          />
          <span v-if="showError" class="error-message">
            Project name doesn't match
          </span>
        </div>
      </div>
      
      <div v-if="error" class="error-alert">
        <i class="icon-error"></i>
        {{ error }}
      </div>
      
      <div class="modal-actions">
        <button 
          type="button" 
          @click="$emit('close')"
          class="btn btn-secondary"
          :disabled="loading"
        >
          Cancel
        </button>
        <button 
          type="button" 
          @click="handleConfirm"
          class="btn btn-danger"
          :disabled="loading || !canConfirm"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Deleting...' : 'Delete Project' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/services/projects'

interface Props {
  project: Project | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirmed: []
}>()

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)
const confirmationText = ref('')
const showError = ref(false)

// Computed properties
const canConfirm = computed(() => {
  return confirmationText.value === props.project?.name
})

// Methods
const handleConfirm = async () => {
  if (!canConfirm.value) {
    showError.value = true
    return
  }
  
  showError.value = false
  loading.value = true
  error.value = null
  
  try {
    emit('confirmed')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete project'
    loading.value = false
  }
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
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
  padding: 1rem;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 1rem 1.5rem;
  text-align: center;
}

.header-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.header-icon.danger {
  background-color: var(--danger-bg);
  color: var(--danger-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-body {
  padding: 0 1.5rem 1rem 1.5rem;
}

.warning-text {
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.4;
}

.consequences {
  background-color: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.consequences h4 {
  margin: 0 0 0.75rem 0;
  color: var(--warning-color);
  font-size: 0.9rem;
  font-weight: 600;
}

.consequences ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--warning-color);
}

.consequences li {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.confirmation-input {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input.error {
  border-color: var(--danger-color);
}

.error-message {
  display: block;
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.error-alert {
  background-color: var(--danger-bg);
  color: var(--danger-color);
  padding: 0.75rem 1rem;
  margin: 0 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--hover-bg);
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--danger-color-dark);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Icons */
.icon-warning::before { content: '⚠️'; }
.icon-error::before { content: '❌'; }

/* Responsive */
@media (max-width: 480px) {
  .modal-content {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
