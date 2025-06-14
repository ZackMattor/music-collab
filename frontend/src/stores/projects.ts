import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Project {
  id: string
  title: string
  description?: string
  genre?: string
  tempo?: number
  keySignature?: string
  timeSignature?: string
  ownerId: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)

  // Getters
  const userProjects = computed(() => projects.value)
  const activeProjects = computed(() => projects.value.filter(p => p.status === 'active'))
  const draftProjects = computed(() => projects.value.filter(p => p.status === 'draft'))

  // Actions
  const fetchProjects = async () => {
    isLoading.value = true
    try {
      // TODO: Implement actual API call when backend is ready
      console.log('Fetching projects...')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock projects data
      projects.value = [
        {
          id: '1',
          title: 'My First Song',
          description: 'A test project for the music collaboration platform',
          genre: 'Electronic',
          tempo: 120,
          keySignature: 'C Major',
          timeSignature: '4/4',
          ownerId: '1',
          status: 'active',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      return { success: true }
    } catch (error) {
      console.error('Error fetching projects:', error)
      return { success: false, error: 'Failed to fetch projects' }
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    isLoading.value = true
    try {
      // TODO: Implement actual API call when backend is ready
      console.log('Creating project:', projectData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock project creation
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        title: projectData.title || 'Untitled Project',
        description: projectData.description,
        genre: projectData.genre,
        tempo: projectData.tempo || 120,
        keySignature: projectData.keySignature || 'C Major',
        timeSignature: projectData.timeSignature || '4/4',
        ownerId: '1', // TODO: Get from auth store
        status: 'draft',
        isPublic: projectData.isPublic || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      projects.value.push(newProject)
      currentProject.value = newProject
      
      return { success: true, project: newProject }
    } catch (error) {
      console.error('Error creating project:', error)
      return { success: false, error: 'Failed to create project' }
    } finally {
      isLoading.value = false
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    isLoading.value = true
    try {
      // TODO: Implement actual API call when backend is ready
      console.log('Updating project:', projectId, updates)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock project update
      const projectIndex = projects.value.findIndex(p => p.id === projectId)
      if (projectIndex !== -1) {
        projects.value[projectIndex] = {
          ...projects.value[projectIndex],
          ...updates,
          updatedAt: new Date()
        }
        
        if (currentProject.value?.id === projectId) {
          currentProject.value = projects.value[projectIndex]
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error updating project:', error)
      return { success: false, error: 'Failed to update project' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteProject = async (projectId: string) => {
    isLoading.value = true
    try {
      // TODO: Implement actual API call when backend is ready
      console.log('Deleting project:', projectId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock project deletion
      projects.value = projects.value.filter(p => p.id !== projectId)
      
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting project:', error)
      return { success: false, error: 'Failed to delete project' }
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentProject = (project: Project | null) => {
    currentProject.value = project
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    
    // Getters
    userProjects,
    activeProjects,
    draftProjects,
    
    // Actions
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject
  }
})
