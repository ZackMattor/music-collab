<template>
  <div class="project-card" @click="openProject">
    <div class="card-header">
      <div class="project-info">
        <h3 class="project-title">{{ project.name }}</h3>
        <p v-if="project.description" class="project-description">
          {{ truncatedDescription }}
        </p>
        <div class="project-meta">
          <span class="meta-item">
            <i class="icon-user"></i>
            {{ project.owner?.displayName || project.owner?.email || 'Unknown' }}
          </span>
          <span class="meta-item">
            <i class="icon-clock"></i>
            {{ formatDate(project.updatedAt) }}
          </span>
          <span v-if="project.isPublic" class="meta-item public-badge">
            <i class="icon-globe"></i>
            Public
          </span>
        </div>
      </div>
      
      <div class="card-actions">
        <button 
          @click.stop="$emit('settings', project)"
          class="action-btn"
          title="Project Settings"
        >
          <i class="icon-settings"></i>
        </button>
        
        <div class="dropdown" ref="dropdownRef">
          <button 
            @click.stop="toggleDropdown"
            class="action-btn"
            title="More Options"
          >
            <i class="icon-more"></i>
          </button>
          
          <div v-if="showDropdown" class="dropdown-menu">
            <button @click.stop="$emit('edit', project)" class="dropdown-item">
              <i class="icon-edit"></i>
              Edit Project
            </button>
            <button 
              v-if="canDelete"
              @click.stop="$emit('delete', project)" 
              class="dropdown-item danger"
            >
              <i class="icon-trash"></i>
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-stats">
      <div class="stat">
        <span class="stat-value">{{ project._count?.stems || 0 }}</span>
        <span class="stat-label">Stems</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ project._count?.collaborators || 0 }}</span>
        <span class="stat-label">Collaborators</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ roleDisplay }}</span>
        <span class="stat-label">Role</span>
      </div>
    </div>
    
    <div v-if="project.collaborators?.length" class="collaborators">
      <div class="collaborator-avatars">
        <div 
          v-for="collaborator in visibleCollaborators" 
          :key="collaborator.id"
          class="avatar"
          :title="collaborator.user.displayName || collaborator.user.email"
        >
          <img 
            v-if="collaborator.user.avatar" 
            :src="collaborator.user.avatar" 
            :alt="collaborator.user.displayName || collaborator.user.email"
          />
          <span v-else class="avatar-initials">
            {{ getInitials(collaborator.user.displayName || collaborator.user.email) }}
          </span>
        </div>
        <div v-if="extraCollaboratorsCount > 0" class="avatar extra-count">
          +{{ extraCollaboratorsCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Project } from '@/services/projects'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [project: Project]
  delete: [project: Project]
  settings: [project: Project]
}>()

const router = useRouter()
const dropdownRef = ref<HTMLElement>()
const showDropdown = ref(false)

// Computed properties
const truncatedDescription = computed(() => {
  if (!props.project.description) return ''
  return props.project.description.length > 100 
    ? props.project.description.substring(0, 100) + '...'
    : props.project.description
})

const canDelete = computed(() => {
  // TODO: Check if current user is the owner
  // For now, assume they can delete if it's their project
  return true // props.project.ownerId === currentUser.id
})

const roleDisplay = computed(() => {
  // TODO: Determine user's role in this project
  // For now, show "Owner" if it's their project, otherwise show their role
  return 'Owner' // This should be determined based on current user
})

const visibleCollaborators = computed(() => {
  return props.project.collaborators?.slice(0, 3) || []
})

const extraCollaboratorsCount = computed(() => {
  const total = props.project.collaborators?.length || 0
  return Math.max(0, total - 3)
})

// Methods
const openProject = () => {
  router.push(`/projects/${props.project.id}`)
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
  return `${Math.ceil(diffDays / 365)} years ago`
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.project-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-description {
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  font-size: 0.9rem;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
}

.public-badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: var(--hover-bg);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--primary-color);
  color: white;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 150px;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--hover-bg);
}

.dropdown-item.danger {
  color: var(--danger-color);
}

.dropdown-item.danger:hover {
  background-color: var(--danger-color);
  color: white;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin: 1rem 0;
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.collaborators {
  margin-top: 1rem;
}

.collaborator-avatars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--card-bg);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
}

.extra-count {
  background-color: var(--text-secondary);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Icons */
.icon-user::before { content: '👤'; }
.icon-clock::before { content: '🕒'; }
.icon-globe::before { content: '🌐'; }
.icon-settings::before { content: '⚙️'; }
.icon-more::before { content: '⋯'; }
.icon-edit::before { content: '✏️'; }
.icon-trash::before { content: '🗑️'; }

/* Responsive */
@media (max-width: 480px) {
  .project-card {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .card-actions {
    align-self: flex-end;
    margin-left: 0;
  }
  
  .project-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .card-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-value {
    font-size: 1rem;
  }
}
</style>
