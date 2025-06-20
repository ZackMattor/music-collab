import apiClient from './api'

export interface Project {
  id: string
  name: string
  description: string | null
  ownerId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  lastAccessedAt: string
  owner?: {
    id: string
    email: string
    displayName: string | null
  }
  collaborators?: ProjectCollaborator[]
  _count?: {
    stems: number
    collaborators: number
  }
}

export interface ProjectCollaborator {
  id: string
  projectId: string
  userId: string
  role: 'VIEWER' | 'CONTRIBUTOR' | 'ADMIN'
  canEdit: boolean
  canAddStems: boolean
  canDeleteStems: boolean
  canInviteOthers: boolean
  canExport: boolean
  isOnline: boolean
  activity: 'EDITING' | 'LISTENING' | 'IDLE'
  lastActiveAt: string
  joinedAt: string
  user: {
    id: string
    email: string
    displayName: string | null
    avatar: string | null
  }
}

export interface CreateProjectData {
  name: string
  description?: string
  isPublic?: boolean
}

export interface UpdateProjectData {
  name?: string
  description?: string
  isPublic?: boolean
}

export interface InviteCollaboratorData {
  email: string
  role: 'VIEWER' | 'CONTRIBUTOR' | 'ADMIN'
  permissions?: {
    canEdit?: boolean
    canAddStems?: boolean
    canDeleteStems?: boolean
    canInviteOthers?: boolean
    canExport?: boolean
  }
}

export interface UpdateCollaboratorData {
  role?: 'VIEWER' | 'CONTRIBUTOR' | 'ADMIN'
  permissions?: {
    canEdit?: boolean
    canAddStems?: boolean
    canDeleteStems?: boolean
    canInviteOthers?: boolean
    canExport?: boolean
  }
}

export class ProjectService {
  /**
   * Get all projects for the current user
   */
  static async getProjects(type?: 'owned' | 'collaborating' | 'public'): Promise<Project[]> {
    const endpoint = type ? `/projects?type=${type}` : '/projects'
    const response = await apiClient.get<Project[]>(endpoint)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch projects')
    }
    return response.data!
  }

  /**
   * Get a specific project by ID
   */
  static async getProject(id: string, includeDetails = false): Promise<Project> {
    const endpoint = includeDetails ? `/projects/${id}?details=true` : `/projects/${id}`
    const response = await apiClient.get<Project>(endpoint)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch project')
    }
    return response.data!
  }

  /**
   * Create a new project
   */
  static async createProject(data: CreateProjectData): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', data)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create project')
    }
    return response.data!
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${id}`, data)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update project')
    }
    return response.data!
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/projects/${id}`)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete project')
    }
  }

  /**
   * Get collaborators for a project
   */
  static async getCollaborators(projectId: string): Promise<ProjectCollaborator[]> {
    const response = await apiClient.get<ProjectCollaborator[]>(`/projects/${projectId}/collaborators`)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch collaborators')
    }
    return response.data!
  }

  /**
   * Invite a collaborator to a project
   */
  static async inviteCollaborator(
    projectId: string,
    data: InviteCollaboratorData
  ): Promise<ProjectCollaborator> {
    const response = await apiClient.post<ProjectCollaborator>(`/projects/${projectId}/collaborators`, data)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to invite collaborator')
    }
    return response.data!
  }

  /**
   * Update a collaborator's role or permissions
   */
  static async updateCollaborator(
    projectId: string,
    collaboratorId: string,
    data: UpdateCollaboratorData
  ): Promise<ProjectCollaborator> {
    const response = await apiClient.put<ProjectCollaborator>(`/projects/${projectId}/collaborators/${collaboratorId}`, data)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update collaborator')
    }
    return response.data!
  }

  /**
   * Remove a collaborator from a project
   */
  static async removeCollaborator(projectId: string, collaboratorId: string): Promise<void> {
    const response = await apiClient.delete<void>(`/projects/${projectId}/collaborators/${collaboratorId}`)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove collaborator')
    }
  }

  /**
   * Leave a project as a collaborator
   */
  static async leaveProject(projectId: string): Promise<void> {
    const response = await apiClient.post<void>(`/projects/${projectId}/leave`)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to leave project')
    }
  }

  /**
   * Get permissions for a specific collaborator
   */
  static async getCollaboratorPermissions(
    projectId: string,
    collaboratorId: string
  ): Promise<{
    role: string
    permissions: {
      canEdit: boolean
      canAddStems: boolean
      canDeleteStems: boolean
      canInviteOthers: boolean
      canExport: boolean
    }
  }> {
    const response = await apiClient.get<{
      role: string
      permissions: {
        canEdit: boolean
        canAddStems: boolean
        canDeleteStems: boolean
        canInviteOthers: boolean
        canExport: boolean
      }
    }>(`/projects/${projectId}/collaborators/${collaboratorId}/permissions`)
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch collaborator permissions')
    }
    return response.data!
  }
}
