import { Project } from '@prisma/client';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CreateProjectData, UpdateProjectData } from '../repositories/interfaces';

export class ProjectService {
  constructor(private projectRepository: ProjectRepository) {}

  /**
   * Get all projects accessible by the user (owned + collaborated)
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    const ownedProjects = await this.projectRepository.findByOwner(userId);
    const collaboratedProjects = await this.projectRepository.findByCollaborator(userId);
    
    // Combine and deduplicate projects (in case user owns and collaborates on same project)
    const allProjects = [...ownedProjects, ...collaboratedProjects];
    const uniqueProjects = allProjects.filter((project, index, self) => 
      index === self.findIndex(p => p.id === project.id)
    );
    
    // Sort by most recently accessed
    return uniqueProjects.sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    );
  }

  /**
   * Get projects owned by the user
   */
  async getOwnedProjects(userId: string): Promise<Project[]> {
    return this.projectRepository.findByOwner(userId);
  }

  /**
   * Get public projects (for discovery)
   */
  async getPublicProjects(): Promise<Project[]> {
    return this.projectRepository.findPublicProjects();
  }

  /**
   * Get project by ID (with access check handled by middleware)
   */
  async getProjectById(id: string): Promise<Project | null> {
    const project = await this.projectRepository.findById(id);
    
    if (project) {
      // Update last accessed timestamp
      await this.projectRepository.updateLastAccessed(id);
    }
    
    return project;
  }

  /**
   * Get project with stems and collaborators
   */
  async getProjectWithDetails(id: string) {
    return this.projectRepository.findWithStems(id);
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    // Validate project name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Project name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Project name must be 100 characters or less');
    }

    // Validate description if provided
    if (data.description && data.description.length > 500) {
      throw new Error('Project description must be 500 characters or less');
    }

    // Validate tempo if provided
    if (data.tempo !== undefined && (data.tempo < 60 || data.tempo > 200)) {
      throw new Error('Tempo must be between 60 and 200 BPM');
    }

    // Validate time signature if provided
    if (data.timeSignatureNumerator !== undefined && (data.timeSignatureNumerator < 1 || data.timeSignatureNumerator > 32)) {
      throw new Error('Time signature numerator must be between 1 and 32');
    }

    if (data.timeSignatureDenominator !== undefined && ![1, 2, 4, 8, 16, 32].includes(data.timeSignatureDenominator)) {
      throw new Error('Time signature denominator must be 1, 2, 4, 8, 16, or 32');
    }

    return this.projectRepository.create(data);
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    // Validate project name if provided
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Project name cannot be empty');
      }
      if (data.name.length > 100) {
        throw new Error('Project name must be 100 characters or less');
      }
    }

    // Validate description if provided
    if (data.description !== undefined && data.description && data.description.length > 500) {
      throw new Error('Project description must be 500 characters or less');
    }

    // Validate tempo if provided
    if (data.tempo !== undefined && (data.tempo < 60 || data.tempo > 200)) {
      throw new Error('Tempo must be between 60 and 200 BPM');
    }

    // Validate time signature if provided
    if (data.timeSignatureNumerator !== undefined && (data.timeSignatureNumerator < 1 || data.timeSignatureNumerator > 32)) {
      throw new Error('Time signature numerator must be between 1 and 32');
    }

    if (data.timeSignatureDenominator !== undefined && ![1, 2, 4, 8, 16, 32].includes(data.timeSignatureDenominator)) {
      throw new Error('Time signature denominator must be 1, 2, 4, 8, 16, or 32');
    }

    return this.projectRepository.update(id, data);
  }

  /**
   * Delete a project (only owner can delete)
   */
  async deleteProject(id: string): Promise<Project> {
    return this.projectRepository.delete(id);
  }

  /**
   * Check if user has access to project (used for validation)
   */
  async hasProjectAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    
    if (!project) {
      return false;
    }

    // Owner has access
    if (project.ownerId === userId) {
      return true;
    }

    // Check if user is a collaborator
    const collaboratedProjects = await this.projectRepository.findByCollaborator(userId);
    return collaboratedProjects.some(p => p.id === projectId);
  }
}
