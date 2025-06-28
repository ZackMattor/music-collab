import { Stem } from '@prisma/client';
import { StemRepository } from '../repositories/StemRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { CreateStemData, UpdateStemData, StemWithSegments } from '../repositories/interfaces';

export interface StemPermissions {
  canAddStems: boolean;
  canDeleteStems: boolean;
  canEdit: boolean;
}

export class StemService {
  constructor(
    private stemRepository: StemRepository,
    private projectRepository: ProjectRepository,
    private collaborationRepository: CollaborationRepository
  ) {}

  /**
   * Get all stems for a project
   */
  async getProjectStems(projectId: string, userId: string): Promise<Stem[]> {
    // Verify user has access to the project
    await this.verifyProjectAccess(projectId, userId);
    
    return this.stemRepository.findByProject(projectId);
  }

  /**
   * Get a specific stem by ID
   */
  async getStemById(stemId: string, userId: string): Promise<Stem | null> {
    const stem = await this.stemRepository.findById(stemId);
    if (!stem) {
      return null;
    }

    // Verify user has access to the project containing this stem
    await this.verifyProjectAccess(stem.projectId, userId);
    
    return stem;
  }

  /**
   * Get a stem with its segments
   */
  async getStemWithSegments(stemId: string, userId: string): Promise<StemWithSegments | null> {
    const stem = await this.stemRepository.findWithSegments(stemId);
    if (!stem) {
      return null;
    }

    // Verify user has access to the project containing this stem
    await this.verifyProjectAccess(stem.projectId, userId);
    
    return stem;
  }

  /**
   * Create a new stem
   */
  async createStem(data: CreateStemData, userId: string): Promise<Stem> {
    // Verify user has permission to add stems to this project
    await this.verifyStemPermission(data.projectId, userId, 'canAddStems');

    // Set the user as the last modifier
    const stemData = {
      ...data,
      lastModifiedBy: userId
    };

    return this.stemRepository.create(stemData);
  }

  /**
   * Update an existing stem
   */
  async updateStem(stemId: string, data: UpdateStemData, userId: string): Promise<Stem> {
    const existingStem = await this.stemRepository.findById(stemId);
    if (!existingStem) {
      throw new Error('Stem not found');
    }

    // Verify user has permission to edit stems in this project
    await this.verifyStemPermission(existingStem.projectId, userId, 'canEdit');

    // Set the user as the last modifier
    const updateData = {
      ...data,
      lastModifiedBy: userId
    };

    return this.stemRepository.update(stemId, updateData);
  }

  /**
   * Delete a stem
   */
  async deleteStem(stemId: string, userId: string): Promise<Stem> {
    const existingStem = await this.stemRepository.findById(stemId);
    if (!existingStem) {
      throw new Error('Stem not found');
    }

    // Verify user has permission to delete stems in this project
    await this.verifyStemPermission(existingStem.projectId, userId, 'canDeleteStems');

    return this.stemRepository.delete(stemId);
  }

  /**
   * Reorder stems within a project
   */
  async reorderStems(projectId: string, stemOrders: { id: string; order: number }[], userId: string): Promise<void> {
    // Verify user has permission to edit stems in this project
    await this.verifyStemPermission(projectId, userId, 'canEdit');

    // Verify all stems belong to the project
    for (const { id } of stemOrders) {
      const stem = await this.stemRepository.findById(id);
      if (!stem || stem.projectId !== projectId) {
        throw new Error(`Stem ${id} does not belong to project ${projectId}`);
      }
    }

    await this.stemRepository.reorderStems(projectId, stemOrders);
  }

  /**
   * Get stems by instrument type
   */
  async getStemsByInstrumentType(projectId: string, instrumentType: string, userId: string): Promise<Stem[]> {
    // Verify user has access to the project
    await this.verifyProjectAccess(projectId, userId);
    
    return this.stemRepository.findByInstrumentType(projectId, instrumentType);
  }

  /**
   * Get user's stem permissions for a project
   */
  async getStemPermissions(projectId: string, userId: string): Promise<StemPermissions> {
    const project = await this.projectRepository.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Project owner has all permissions
    if (project.ownerId === userId) {
      return {
        canAddStems: true,
        canDeleteStems: true,
        canEdit: true
      };
    }

    // Check collaborator permissions
    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    
    if (!collaborator) {
      throw new Error('Access denied: You are not a collaborator on this project');
    }

    return {
      canAddStems: collaborator.canAddStems,
      canDeleteStems: collaborator.canDeleteStems,
      canEdit: collaborator.canEdit
    };
  }

  /**
   * Private helper to verify project access
   */
  private async verifyProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is the owner
    if (project.ownerId === userId) {
      return;
    }

    // Check if user is a collaborator
    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    
    if (!collaborator) {
      throw new Error('Access denied: You do not have access to this project');
    }
  }

  /**
   * Private helper to verify stem-specific permissions
   */
  private async verifyStemPermission(projectId: string, userId: string, permission: keyof StemPermissions): Promise<void> {
    const permissions = await this.getStemPermissions(projectId, userId);
    
    if (!permissions[permission]) {
      throw new Error(`Access denied: You do not have permission to ${permission.replace('can', '').toLowerCase()}`);
    }
  }
}
