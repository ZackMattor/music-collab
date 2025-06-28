<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Create New Project</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="icon-close"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="project-name" class="form-label">
            Project Name *
          </label>
          <input
            id="project-name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Enter project name..."
            :class="{ error: errors.name }"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        
        <div class="form-group">
          <label for="project-description" class="form-label">
            Description
          </label>
          <textarea
            id="project-description"
            v-model="form.description"
            class="form-textarea"
            placeholder="Describe your project..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input
              id="project-public"
              v-model="form.isPublic"
              type="checkbox"
              class="form-checkbox"
            />
            <label for="project-public" class="checkbox-label">
              Make this project public
              <small class="checkbox-description">
                Public projects can be discovered and viewed by anyone
              </small>
            </label>
          </div>
        </div>
        
        <div v-if="error" class="error-alert">
          <i class="icon-warning"></i>
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
            type="submit" 
            class="btn btn-primary"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating...' : 'Create Project' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ProjectService, type CreateProjectData } from '@/services/projects'

const emit = defineEmits<{
  close: []
  created: [project: any]
}>()

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref<CreateProjectData>({
  name: '',
  description: '',
  isPublic: false
})

const errors = ref<{
  name?: string
}>({})

// Computed properties
const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 && !errors.value.name
})

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Project name is required'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Project name must be at least 2 characters'
  } else if (form.value.name.trim().length > 100) {
    errors.value.name = 'Project name must be less than 100 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  error.value = null
  
  try {
    const projectData: CreateProjectData = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      isPublic: form.value.isPublic
    }
    
    const project = await ProjectService.createProject(projectData)
    emit('created', project)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create project'
  } finally {
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
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  margin-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: var(--hover-bg);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--danger-color);
  color: white;
}

.modal-form {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
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

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--danger-color);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.form-checkbox {
  margin-top: 0.25rem;
}

.checkbox-label {
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1.4;
}

.checkbox-description {
  display: block;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
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
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
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

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--hover-bg);
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
.icon-close::before { content: '✕'; }
.icon-warning::before { content: '⚠️'; }

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
