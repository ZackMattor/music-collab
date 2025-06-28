<template>
  <div class="project-settings">
    <div class="settings-header">
      <div class="header-content">
        <router-link 
          :to="`/projects/${projectId}`" 
          class="back-button"
        >
          ← Back to Project
        </router-link>
        <h1>Project Settings</h1>
        <p v-if="project">Configure settings for "{{ project.name }}"</p>
      </div>
    </div>

    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>Loading project settings...</p>
    </div>

    <div class="error-state" v-else-if="error">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load project settings</h3>
      <p>{{ error }}</p>
      <button @click="loadProject" class="btn btn-outline">
        Try Again
      </button>
    </div>

    <div v-else-if="project" class="settings-content">
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <button 
            v-for="tab in settingsTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['nav-item', { active: activeTab === tab.id }]"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="settings-main">
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="settings-section">
          <h2>General Settings</h2>
          <form @submit.prevent="saveGeneralSettings" class="settings-form">
            <div class="form-group">
              <label for="projectName">Project Name</label>
              <input
                id="projectName"
                v-model="form.name"
                type="text"
                class="form-input"
                :class="{ error: errors.name }"
                required
              />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label for="projectDescription">Description</label>
              <textarea
                id="projectDescription"
                v-model="form.description"
                class="form-textarea"
                :class="{ error: errors.description }"
                rows="4"
                placeholder="Optional project description..."
              ></textarea>
              <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="form.isPublic"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="checkbox-text">
                  <strong>Public Project</strong>
                  <br>
                  <small>Allow anyone to discover and view this project</small>
                </span>
              </label>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                :disabled="saving"
                class="btn btn-primary"
              >
                <span v-if="saving">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
              <button 
                type="button"
                @click="resetForm"
                class="btn btn-outline"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <!-- Audio Settings -->
        <div v-if="activeTab === 'audio'" class="settings-section">
          <h2>Audio Settings</h2>
          <form @submit.prevent="saveAudioSettings" class="settings-form">
            <div class="form-group">
              <label for="tempo">Default Tempo (BPM)</label>
              <input
                id="tempo"
                v-model.number="form.tempo"
                type="number"
                min="60"
                max="200"
                class="form-input"
                :class="{ error: errors.tempo }"
              />
              <span v-if="errors.tempo" class="error-message">{{ errors.tempo }}</span>
              <small class="form-help">The default tempo for new tracks in this project</small>
            </div>

            <div class="form-group">
              <label for="timeSignature">Time Signature</label>
              <div class="time-signature-inputs">
                <input
                  v-model.number="form.timeSignatureNumerator"
                  type="number"
                  min="1"
                  max="16"
                  class="form-input time-sig-input"
                />
                <span class="time-sig-separator">/</span>
                <select
                  v-model.number="form.timeSignatureDenominator"
                  class="form-select time-sig-input"
                >
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="16">16</option>
                </select>
              </div>
              <small class="form-help">The time signature for this project</small>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                :disabled="saving"
                class="btn btn-primary"
              >
                <span v-if="saving">Saving...</span>
                <span v-else>Save Audio Settings</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Collaboration Settings -->
        <div v-if="activeTab === 'collaboration'" class="settings-section">
          <h2>Collaboration Settings</h2>
          
          <div class="collaborators-section">
            <div class="section-header">
              <h3>Current Collaborators</h3>
              <button @click="showInviteModal = true" class="btn btn-primary">
                <span>➕</span>
                Invite Collaborator
              </button>
            </div>

            <div v-if="project.collaborators && project.collaborators.length > 0" class="collaborators-list">
              <div 
                v-for="collaborator in project.collaborators" 
                :key="collaborator.id"
                class="collaborator-item"
              >
                <div class="collaborator-info">
                  <div class="collaborator-avatar">
                    <img 
                      v-if="collaborator.user.avatar" 
                      :src="collaborator.user.avatar" 
                      :alt="collaborator.user.displayName || collaborator.user.email"
                    />
                    <div v-else class="avatar-placeholder">
                      {{ getInitials(collaborator.user.displayName || collaborator.user.email) }}
                    </div>
                  </div>
                  <div class="collaborator-details">
                    <div class="collaborator-name">
                      {{ collaborator.user.displayName || collaborator.user.email }}
                    </div>
                    <div class="collaborator-email">{{ collaborator.user.email }}</div>
                    <div class="collaborator-meta">
                      Joined {{ formatDate(collaborator.joinedAt) }}
                    </div>
                  </div>
                </div>
                <div class="collaborator-actions">
                  <select 
                    v-model="collaborator.role"
                    @change="updateCollaboratorRole(collaborator)"
                    class="form-select"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="CONTRIBUTOR">Contributor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button 
                    @click="removeCollaborator(collaborator)"
                    class="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-collaborators">
              <div class="empty-icon">👥</div>
              <h4>No collaborators yet</h4>
              <p>Invite people to collaborate on this project</p>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div v-if="activeTab === 'advanced'" class="settings-section">
          <h2>Advanced Settings</h2>
          
          <div class="danger-zone">
            <h3>Danger Zone</h3>
            <div class="danger-actions">
              <div class="danger-action">
                <div class="action-info">
                  <h4>Delete Project</h4>
                  <p>Permanently delete this project and all its data. This action cannot be undone.</p>
                </div>
                <button @click="showDeleteModal = true" class="btn btn-danger">
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invite Collaborator Modal -->
    <div v-if="showInviteModal" class="modal-overlay" @click="showInviteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Invite Collaborator</h3>
          <button @click="showInviteModal = false" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="inviteCollaborator" class="modal-form">
          <div class="form-group">
            <label for="inviteEmail">Email Address</label>
            <input
              id="inviteEmail"
              v-model="inviteForm.email"
              type="email"
              class="form-input"
              required
              placeholder="Enter email address..."
            />
          </div>
          <div class="form-group">
            <label for="inviteRole">Role</label>
            <select
              id="inviteRole"
              v-model="inviteForm.role"
              class="form-select"
              required
            >
              <option value="VIEWER">Viewer - Can view and listen</option>
              <option value="CONTRIBUTOR">Contributor - Can edit and add content</option>
              <option value="ADMIN">Admin - Full project management access</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" :disabled="inviting" class="btn btn-primary">
              <span v-if="inviting">Sending Invite...</span>
              <span v-else>Send Invite</span>
            </button>
            <button type="button" @click="showInviteModal = false" class="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Delete Project</h3>
          <button @click="showDeleteModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Are you sure you want to delete this project?</strong></p>
          <p>This will permanently delete "{{ project?.name }}" and all its data, including:</p>
          <ul>
            <li>All audio stems and tracks</li>
            <li>All collaborator access</li>
            <li>All project history</li>
          </ul>
          <p><strong>This action cannot be undone.</strong></p>
          
          <div class="form-group">
            <label for="confirmDelete">
              Type "{{ project?.name }}" to confirm:
            </label>
            <input
              id="confirmDelete"
              v-model="deleteConfirmation"
              type="text"
              class="form-input"
              :placeholder="project?.name"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button 
            @click="deleteProject"
            :disabled="deleteConfirmation !== project?.name || deleting"
            class="btn btn-danger"
          >
            <span v-if="deleting">Deleting...</span>
            <span v-else>Delete Project</span>
          </button>
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProjectService, type Project, type ProjectCollaborator } from '@/services/projects'

const route = useRoute()
const router = useRouter()

// State
const project = ref<Project | null>(null)
const loading = ref(false)
const saving = ref(false)
const inviting = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('general')

// Modal states
const showInviteModal = ref(false)
const showDeleteModal = ref(false)

// Form states
const form = ref({
  name: '',
  description: '',
  isPublic: false,
  tempo: 120,
  timeSignatureNumerator: 4,
  timeSignatureDenominator: 4
})

const inviteForm = ref({
  email: '',
  role: 'CONTRIBUTOR' as 'VIEWER' | 'CONTRIBUTOR' | 'ADMIN'
})

const deleteConfirmation = ref('')
const errors = ref<Record<string, string>>({})

// Computed
const projectId = computed(() => route.params.id as string)

const settingsTabs = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'collaboration', label: 'Collaboration', icon: '👥' },
  { id: 'advanced', label: 'Advanced', icon: '🔧' }
]

// Methods
const loadProject = async () => {
  if (!projectId.value) return

  loading.value = true
  error.value = null

  try {
    project.value = await ProjectService.getProject(projectId.value, true)
    populateForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load project'
  } finally {
    loading.value = false
  }
}

const populateForm = () => {
  if (!project.value) return
  
  form.value = {
    name: project.value.name,
    description: project.value.description || '',
    isPublic: project.value.isPublic,
    tempo: 120, // These would come from project metadata
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4
  }
}

const resetForm = () => {
  populateForm()
  errors.value = {}
}

const validateGeneralForm = (): boolean => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Project name is required'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Project name must be at least 2 characters'
  } else if (form.value.name.trim().length > 100) {
    errors.value.name = 'Project name must be less than 100 characters'
  }

  if (form.value.description && form.value.description.length > 500) {
    errors.value.description = 'Description must be less than 500 characters'
  }

  return Object.keys(errors.value).length === 0
}

const saveGeneralSettings = async () => {
  if (!validateGeneralForm() || !project.value) return

  saving.value = true

  try {
    const updateData = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      isPublic: form.value.isPublic
    }

    const updatedProject = await ProjectService.updateProject(project.value.id, updateData)
    project.value = { ...project.value, ...updatedProject }
    
    // Show success message (you might want to add a toast notification)
    console.log('Project settings saved successfully')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save project settings'
  } finally {
    saving.value = false
  }
}

const saveAudioSettings = async () => {
  // Audio settings would be saved to project metadata
  // For now, just show success
  saving.value = true
  
  setTimeout(() => {
    saving.value = false
    console.log('Audio settings saved')
  }, 1000)
}

const inviteCollaborator = async () => {
  if (!project.value) return

  inviting.value = true

  try {
    // This would call the collaboration service
    // await CollaborationService.inviteCollaborator(project.value.id, inviteForm.value)
    
    showInviteModal.value = false
    inviteForm.value = { email: '', role: 'CONTRIBUTOR' }
    
    // Reload project to get updated collaborators
    await loadProject()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to invite collaborator'
  } finally {
    inviting.value = false
  }
}

const updateCollaboratorRole = async (collaborator: ProjectCollaborator) => {
  try {
    // await CollaborationService.updateCollaborator(project.value.id, collaborator.id, { role: collaborator.role })
    console.log('Updated collaborator role:', collaborator.role)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update collaborator role'
  }
}

const removeCollaborator = async (collaborator: ProjectCollaborator) => {
  if (!confirm(`Remove ${collaborator.user.displayName || collaborator.user.email} from this project?`)) {
    return
  }

  try {
    // await CollaborationService.removeCollaborator(project.value.id, collaborator.id)
    console.log('Removed collaborator:', collaborator.user.email)
    await loadProject()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove collaborator'
  }
}

const deleteProject = async () => {
  if (!project.value || deleteConfirmation.value !== project.value.name) return

  deleting.value = true

  try {
    await ProjectService.deleteProject(project.value.id)
    router.push('/projects')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete project'
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Watchers
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProject()
  }
})

// Lifecycle
onMounted(() => {
  loadProject()
})
</script>

<style scoped>
.project-settings {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.settings-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
}

.back-button:hover {
  text-decoration: underline;
}

.settings-header h1 {
  color: var(--text-primary);
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.settings-header p {
  color: var(--text-secondary);
  margin: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.settings-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 150px);
}

.settings-sidebar {
  width: 250px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  padding: 2rem 0;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-icon {
  font-size: 1.1rem;
}

.settings-main {
  flex: 1;
  padding: 2rem;
}

.settings-section h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
}

.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--error-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-help {
  display: block;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.error-message {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.checkbox-label {
  display: flex !important;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.form-checkbox {
  width: auto !important;
  margin-top: 0.25rem;
}

.checkbox-text {
  flex: 1;
}

.checkbox-text small {
  color: var(--text-secondary);
}

.time-signature-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 200px;
}

.time-sig-input {
  width: auto !important;
  flex: 1;
}

.time-sig-separator {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.collaborators-section {
  margin-top: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: var(--text-primary);
  margin: 0;
}


.collaborator-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.collaborator-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.collaborator-avatar img,
.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.avatar-placeholder {
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.collaborator-name {
  font-weight: 500;
  color: var(--text-primary);
}

.collaborator-email {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.collaborator-meta {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.collaborator-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.empty-collaborators {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.danger-zone {
  background: var(--bg-primary);
  border: 1px solid var(--error-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.danger-zone h3 {
  color: var(--error-color);
  margin: 0 0 1rem 0;
}

.danger-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-info h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.action-info p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.btn-danger {
  background: var(--error-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-color-dark);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-form,
.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .settings-content {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
    padding: 1rem 0;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 1rem;
  }
  
  .nav-item {
    white-space: nowrap;
  }
  
  .settings-main {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .collaborator-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .collaborator-actions {
    justify-content: flex-end;
  }
  
  .danger-action {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
