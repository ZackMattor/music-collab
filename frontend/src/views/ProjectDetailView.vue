<template>
  <div class="project-detail">
    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>Loading project...</p>
    </div>

    <div class="error-state" v-else-if="error">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load project</h3>
      <p>{{ error }}</p>
      <button @click="loadProject" class="btn btn-outline">
        Try Again
      </button>
    </div>

    <div v-else-if="project" class="project-content">
      <div class="project-header">
        <div class="project-info">
          <h1>{{ project.name }}</h1>
          <p v-if="project.description" class="project-description">
            {{ project.description }}
          </p>
          <div class="project-meta">
            <span class="meta-item">
              <strong>Owner:</strong> {{ project.owner?.displayName || 'Unknown' }}
            </span>
            <span class="meta-item">
              <strong>Created:</strong> {{ formatDate(project.createdAt) }}
            </span>
            <span class="meta-item">
              <strong>Last Modified:</strong> {{ formatDate(project.updatedAt) }}
            </span>
          </div>
        </div>
        <div class="project-actions">
          <router-link 
            :to="`/projects/${project.id}/settings`" 
            class="btn btn-outline"
          >
            <span class="button-icon">⚙️</span>
            Settings
          </router-link>
        </div>
      </div>

      <div class="project-body">
        <div class="project-stats">
          <div class="stat-card">
            <div class="stat-icon">🎵</div>
            <div class="stat-content">
              <h3>{{ project._count?.stems || 0 }}</h3>
              <p>Stems</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ project._count?.collaborators || 0 }}</h3>
              <p>Collaborators</p>
            </div>
          </div>
        </div>

        <div class="project-placeholder">
          <div class="placeholder-content">
            <h3>🎛️ DAW Interface Coming Soon</h3>
            <p>The project workspace and audio editing interface will be available in Phase 5.</p>
            <p>For now, you can manage project settings and collaborators.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ProjectService, type Project } from '@/services/projects'

const route = useRoute()

// State
const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Methods
const loadProject = async () => {
  const projectId = route.params.id as string
  if (!projectId) return

  loading.value = true
  error.value = null

  try {
    project.value = await ProjectService.getProject(projectId, true)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load project'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadProject()
})
</script>

<style scoped>
.project-detail {
  min-height: 100vh;
  background: var(--bg-secondary);
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

.project-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.project-info h1 {
  color: var(--text-primary);
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.project-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
}

.project-meta {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.meta-item {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.project-actions {
  display: flex;
  gap: 1rem;
}

.project-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-color);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  color: var(--text-primary);
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
}

.stat-content p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.project-placeholder {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  border: 2px dashed var(--border-color);
}

.placeholder-content h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
}

.placeholder-content p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
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
  text-decoration: none;
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

.button-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .project-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .project-actions {
    justify-content: flex-start;
  }

  .project-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .project-stats {
    flex-direction: column;
  }
}
</style>
