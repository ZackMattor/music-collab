<template>
  <div class="projects-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Projects</h1>
        <button 
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <i class="icon-plus"></i>
          New Project
        </button>
      </div>
      
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.value"
          @click="activeFilter = tab.value"
          :class="['tab', { active: activeFilter === tab.value }]"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load projects</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="loadProjects" class="btn btn-outline">
          Try Again
        </button>
        <button 
          v-if="error.includes('session') || error.includes('Authentication') || error.includes('token')"
          @click="goToLogin" 
          class="btn btn-primary"
        >
          Go to Login
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!projects.length" class="empty-state">
      <div class="empty-icon">🎵</div>
      <h3>{{ emptyStateTitle }}</h3>
      <p>{{ emptyStateMessage }}</p>
      <button 
        v-if="activeFilter === 'owned'"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        Create Your First Project
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @edit="handleEditProject"
        @delete="handleDeleteProject"
        @settings="handleProjectSettings"
      />
    </div>

    <!-- Create Project Modal -->
    <CreateProjectModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleProjectCreated"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :project="projectToDelete"
      @close="showDeleteModal = false"
      @confirmed="handleDeleteConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ProjectService, type Project } from '@/services/projects'
import ProjectCard from '@/components/ProjectCard.vue'
import CreateProjectModal from '@/components/CreateProjectModal.vue'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'

const router = useRouter()

// Reactive state
const projects = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const projectToDelete = ref<Project | null>(null)
const activeFilter = ref<'all' | 'owned' | 'collaborating' | 'public'>('all')

// Computed properties
const filterTabs = computed(() => {
  const projectsArray = Array.isArray(projects.value) ? projects.value : []
  return [
    { 
      label: 'All Projects', 
      value: 'all' as const,
      count: projectsArray.length
    },
    { 
      label: 'My Projects', 
      value: 'owned' as const,
      count: projectsArray.filter(p => p.owner?.id === 'current-user-id').length // TODO: Get from auth store
    },
    { 
      label: 'Collaborating', 
      value: 'collaborating' as const,
      count: projectsArray.filter(p => p.collaborators?.some(c => c.userId === 'current-user-id')).length
    },
    { 
      label: 'Public', 
      value: 'public' as const,
      count: projectsArray.filter(p => p.isPublic).length
    }
  ]
})

const emptyStateTitle = computed(() => {
  switch (activeFilter.value) {
    case 'owned':
      return 'No projects yet'
    case 'collaborating':
      return 'No collaborations yet'
    case 'public':
      return 'No public projects'
    default:
      return 'No projects found'
  }
})

const emptyStateMessage = computed(() => {
  switch (activeFilter.value) {
    case 'owned':
      return 'Create your first music project to get started'
    case 'collaborating':
      return 'You haven\'t been invited to any projects yet'
    case 'public':
      return 'No public projects are available'
    default:
      return 'Try creating a new project or check back later'
  }
})

// Methods
const loadProjects = async () => {
  loading.value = true
  error.value = null
  
  try {
    const filterType = activeFilter.value === 'all' ? undefined : activeFilter.value
    projects.value = await ProjectService.getProjects(filterType)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred'
    error.value = errorMessage
    
    // Reset projects to empty array on error to prevent filter errors
    projects.value = []
    
    // Check if it's an authentication error
    if (errorMessage.includes('Authentication') || errorMessage.includes('401') || errorMessage.includes('token')) {
      console.error('Authentication error loading projects:', errorMessage)
      // The API client should have already handled token refresh, if we're still getting auth errors
      // it means the user needs to log in again
      error.value = 'Your session has expired. Please log in again.'
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/auth')
}

const handleEditProject = (project: Project) => {
  router.push(`/projects/${project.id}/edit`)
}

const handleDeleteProject = (project: Project) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const handleProjectSettings = (project: Project) => {
  router.push(`/projects/${project.id}/settings`)
}

const handleProjectCreated = (project: Project) => {
  // Ensure projects is an array before adding the new project
  if (!Array.isArray(projects.value)) {
    projects.value = []
  }
  projects.value.unshift(project)
  showCreateModal.value = false
  
  // Navigate to project page if ID exists
  if (project?.id) {
    router.push(`/projects/${project.id}`)
  }
}

const handleDeleteConfirmed = async () => {
  if (!projectToDelete.value) return
  
  try {
    await ProjectService.deleteProject(projectToDelete.value.id)
    // Defensive check to ensure projects.value is an array
    if (Array.isArray(projects.value)) {
      projects.value = projects.value.filter(p => p.id !== projectToDelete.value!.id)
    }
    showDeleteModal.value = false
    projectToDelete.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete project'
  }
}

// Watchers
watch(activeFilter, () => {
  loadProjects()
})

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.projects-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.tab {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab:hover {
  color: var(--text-primary);
  background-color: var(--hover-bg);
}

.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.count {
  background-color: var(--accent-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.loading-state,
.error-state,
.empty-state {
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

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.error-state p,
.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

.error-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Button Styles */
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

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-color-dark);
  transform: translateY(-1px);
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
}

.icon-plus::before {
  content: '+';
  font-size: 1.2rem;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .projects-page {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    text-align: center;
  }
  
  .filter-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
