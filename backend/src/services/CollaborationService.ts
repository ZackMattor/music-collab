import { ProjectCollaborator, Role } from '@prisma/client';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';

export type CollaboratorWithUser = {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
} & ProjectCollaborator;

export interface CollaboratorInviteData {
  email: string;
  role: Role;
  permissions?: {
    canEdit?: boolean;
    canAddStems?: boolean;
    canDeleteStems?: boolean;
    canInviteOthers?: boolean;
    canExport?: boolean;
  };
}

export interface CollaboratorUpdateData {
  role?: Role;
  permissions?: {
    canEdit?: boolean;
    canAddStems?: boolean;
    canDeleteStems?: boolean;
    canInviteOthers?: boolean;
    canExport?: boolean;
  };
}

export class CollaborationService {
  constructor(
    private collaborationRepository: CollaborationRepository,
    private userRepository: UserRepository,
    private projectRepository: ProjectRepository
  ) {}

  /**
   * Invite a user to collaborate on a project
   */
  async inviteCollaborator(
    projectId: string,
    inviterId: string,
    email: string,
    role: Role = Role.CONTRIBUTOR,
    permissions?: CollaboratorInviteData['permissions']
  ): Promise<CollaboratorWithUser> {
    // Check if project exists and inviter has permission to invite
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if inviter is the owner or has invite permissions
    const hasInvitePermission = await this.hasCollaboratorInvitePermission(projectId, inviterId);
    if (!hasInvitePermission) {
      throw new Error('Insufficient permissions to invite collaborators');
    }

    // Find user by email
    const invitedUser = await this.userRepository.findByEmail(email);
    if (!invitedUser) {
      throw new Error('User with this email does not exist');
    }

    // Check if user is already a collaborator
    const existingCollaborator = await this.collaborationRepository.findByProjectAndUser(
      projectId,
      invitedUser.id
    );
    if (existingCollaborator) {
      throw new Error('User is already a collaborator on this project');
    }

    // Check if user is the project owner
    if (project.ownerId === invitedUser.id) {
      throw new Error('Project owner is automatically a collaborator');
    }

    // Set default permissions based on role
    const defaultPermissions = this.getDefaultPermissionsForRole(role);
    const finalPermissions = { ...defaultPermissions, ...permissions };

    // Create collaborator
    const collaborator = await this.collaborationRepository.create({
      projectId,
      userId: invitedUser.id,
      role,
      ...finalPermissions
    });

    return collaborator;
  }

  /**
   * Get all collaborators for a project
   */
  async getProjectCollaborators(
    projectId: string,
    userId: string
  ): Promise<CollaboratorWithUser[]> {
    // Check if user has access to the project
    const hasAccess = await this.hasProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied: You do not have permission to view this project\'s collaborators');
    }

    return this.collaborationRepository.findByProject(projectId);
  }

  /**
   * Update a collaborator's role and permissions
   */
  async updateCollaborator(
    projectId: string,
    updaterId: string,
    collaboratorUserId: string,
    updateData: CollaboratorUpdateData
  ): Promise<CollaboratorWithUser> {
    // Check if project exists and updater has permission to update collaborators
    const hasUpdatePermission = await this.hasCollaboratorUpdatePermission(projectId, updaterId);
    if (!hasUpdatePermission) {
      throw new Error('Insufficient permissions to update collaborators');
    }

    // Check if collaborator exists
    const existingCollaborator = await this.collaborationRepository.findByProjectAndUser(
      projectId,
      collaboratorUserId
    );
    if (!existingCollaborator) {
      throw new Error('Collaborator not found on this project');
    }

    // Don't allow updating if the collaborator user is the project owner
    const project = await this.projectRepository.findById(projectId);
    if (project?.ownerId === collaboratorUserId) {
      throw new Error('Cannot update project owner as collaborator');
    }

    // If role is being updated, set default permissions for the new role
    const finalUpdateData = { ...updateData };
    if (updateData.role) {
      const defaultPermissions = this.getDefaultPermissionsForRole(updateData.role);
      finalUpdateData.permissions = { ...defaultPermissions, ...updateData.permissions };
    }

    return this.collaborationRepository.update(existingCollaborator.id, finalUpdateData);
  }

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(
    projectId: string,
    removerId: string,
    collaboratorUserId: string
  ): Promise<void> {
    // Check if project exists and remover has permission to remove collaborators
    const hasRemovePermission = await this.hasCollaboratorRemovePermission(projectId, removerId);
    if (!hasRemovePermission) {
      throw new Error('Insufficient permissions to remove collaborators');
    }

    // Don't allow removing the project owner
    const project = await this.projectRepository.findById(projectId);
    if (project?.ownerId === collaboratorUserId) {
      throw new Error('Cannot remove project owner as collaborator');
    }

    // Check if collaborator exists
    const existingCollaborator = await this.collaborationRepository.findByProjectAndUser(
      projectId,
      collaboratorUserId
    );
    if (!existingCollaborator) {
      throw new Error('Collaborator not found on this project');
    }

    await this.collaborationRepository.delete(existingCollaborator.id);
  }

  /**
   * Leave a project as a collaborator
   */
  async leaveProject(projectId: string, userId: string): Promise<void> {
    // Don't allow project owner to leave
    const project = await this.projectRepository.findById(projectId);
    if (project?.ownerId === userId) {
      throw new Error('Project owner cannot leave the project');
    }

    // Check if user is a collaborator
    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    if (!collaborator) {
      throw new Error('You are not a collaborator on this project');
    }

    await this.collaborationRepository.delete(collaborator.id);
  }

  /**
   * Get collaborator permissions
   */
  async getCollaboratorPermissions(
    projectId: string,
    requesterId: string,
    collaboratorUserId: string
  ): Promise<{
    role: string;
    permissions: {
      canEdit: boolean;
      canAddStems: boolean;
      canDeleteStems: boolean;
      canInviteOthers: boolean;
      canExport: boolean;
    };
  }> {
    // Check if requester has access to the project
    const hasAccess = await this.hasProjectAccess(projectId, requesterId);
    if (!hasAccess) {
      throw new Error('Access denied: You do not have permission to view permissions');
    }

    // Get collaborator
    const collaborator = await this.collaborationRepository.findByProjectAndUser(
      projectId,
      collaboratorUserId
    );
    if (!collaborator) {
      throw new Error('Collaborator not found on this project');
    }

    return {
      role: collaborator.role,
      permissions: {
        canEdit: collaborator.canEdit,
        canAddStems: collaborator.canAddStems,
        canDeleteStems: collaborator.canDeleteStems,
        canInviteOthers: collaborator.canInviteOthers,
        canExport: collaborator.canExport
      }
    };
  }

  /**
   * Check if user has project access (owner or collaborator)
   */
  private async hasProjectAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    // Owner has access
    if (project.ownerId === userId) {
      return true;
    }

    // Check if user is a collaborator
    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    return collaborator !== null;
  }

  /**
   * Check if user has permission to invite collaborators
   */
  private async hasCollaboratorInvitePermission(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    // Owner can always invite
    if (project.ownerId === userId) {
      return true;
    }

    // Check if user is a collaborator with invite permissions
    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    return collaborator?.canInviteOthers || false;
  }

  /**
   * Check if user has permission to update collaborators
   */
  private async hasCollaboratorUpdatePermission(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    // Only owner and admin collaborators can update
    if (project.ownerId === userId) {
      return true;
    }

    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    return collaborator?.role === Role.ADMIN;
  }

  /**
   * Check if user has permission to remove collaborators
   */
  private async hasCollaboratorRemovePermission(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    // Only owner and admin collaborators can remove
    if (project.ownerId === userId) {
      return true;
    }

    const collaborator = await this.collaborationRepository.findByProjectAndUser(projectId, userId);
    return collaborator?.role === Role.ADMIN;
  }

  /**
   * Get default permissions for a role
   */
  private getDefaultPermissionsForRole(role: Role): {
    canEdit: boolean;
    canAddStems: boolean;
    canDeleteStems: boolean;
    canInviteOthers: boolean;
    canExport: boolean;
  } {
    switch (role) {
      case Role.VIEWER:
        return {
          canEdit: false,
          canAddStems: false,
          canDeleteStems: false,
          canInviteOthers: false,
          canExport: true
        };
      case Role.CONTRIBUTOR:
        return {
          canEdit: true,
          canAddStems: true,
          canDeleteStems: false,
          canInviteOthers: false,
          canExport: true
        };
      case Role.ADMIN:
        return {
          canEdit: true,
          canAddStems: true,
          canDeleteStems: true,
          canInviteOthers: true,
          canExport: true
        };
      default:
        return {
          canEdit: false,
          canAddStems: false,
          canDeleteStems: false,
          canInviteOthers: false,
          canExport: false
        };
    }
  }
}
