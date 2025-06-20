import { PrismaClient, ProjectCollaborator, Role } from '@prisma/client';

export interface CollaboratorWithUser extends ProjectCollaborator {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface CreateCollaboratorData {
  projectId: string;
  userId: string;
  role: Role;
  canEdit: boolean;
  canAddStems: boolean;
  canDeleteStems: boolean;
  canInviteOthers: boolean;
  canExport: boolean;
}

export interface UpdateCollaboratorData {
  role?: Role;
  permissions?: {
    canEdit?: boolean;
    canAddStems?: boolean;
    canDeleteStems?: boolean;
    canInviteOthers?: boolean;
    canExport?: boolean;
  };
}

export class CollaborationRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new project collaborator
   */
  async create(data: CreateCollaboratorData): Promise<CollaboratorWithUser> {
    return this.prisma.projectCollaborator.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        role: data.role,
        canEdit: data.canEdit,
        canAddStems: data.canAddStems,
        canDeleteStems: data.canDeleteStems,
        canInviteOthers: data.canInviteOthers,
        canExport: data.canExport,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isOnline: false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  /**
   * Find all collaborators for a project
   */
  async findByProject(projectId: string): Promise<CollaboratorWithUser[]> {
    return this.prisma.projectCollaborator.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // ADMIN first, then CONTRIBUTOR, then VIEWER
        { joinedAt: 'asc' }
      ]
    });
  }

  /**
   * Find a specific collaborator by project and user
   */
  async findByProjectAndUser(projectId: string, userId: string): Promise<CollaboratorWithUser | null> {
    return this.prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  /**
   * Find a collaborator by ID
   */
  async findById(id: string): Promise<CollaboratorWithUser | null> {
    return this.prisma.projectCollaborator.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  /**
   * Update a collaborator
   */
  async update(id: string, data: UpdateCollaboratorData): Promise<CollaboratorWithUser> {
    const updateData: {
      lastActiveAt: Date;
      role?: Role;
      canEdit?: boolean;
      canAddStems?: boolean;
      canDeleteStems?: boolean;
      canInviteOthers?: boolean;
      canExport?: boolean;
    } = {
      lastActiveAt: new Date()
    };

    if (data.role) {
      updateData.role = data.role;
    }

    if (data.permissions) {
      if (data.permissions.canEdit !== undefined) {
        updateData.canEdit = data.permissions.canEdit;
      }
      if (data.permissions.canAddStems !== undefined) {
        updateData.canAddStems = data.permissions.canAddStems;
      }
      if (data.permissions.canDeleteStems !== undefined) {
        updateData.canDeleteStems = data.permissions.canDeleteStems;
      }
      if (data.permissions.canInviteOthers !== undefined) {
        updateData.canInviteOthers = data.permissions.canInviteOthers;
      }
      if (data.permissions.canExport !== undefined) {
        updateData.canExport = data.permissions.canExport;
      }
    }

    return this.prisma.projectCollaborator.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  /**
   * Delete a collaborator
   */
  async delete(id: string): Promise<ProjectCollaborator> {
    return this.prisma.projectCollaborator.delete({
      where: { id }
    });
  }

  /**
   * Update collaborator's online status
   */
  async updateOnlineStatus(id: string, isOnline: boolean): Promise<CollaboratorWithUser> {
    return this.prisma.projectCollaborator.update({
      where: { id },
      data: {
        isOnline,
        lastActiveAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  /**
   * Update collaborator's current activity
   */
  async updateActivity(id: string, activity: 'EDITING' | 'LISTENING' | 'IDLE'): Promise<CollaboratorWithUser> {
    return this.prisma.projectCollaborator.update({
      where: { id },
      data: {
        currentActivity: activity,
        lastActiveAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  /**
   * Get collaborator count for a project
   */
  async getCollaboratorCount(projectId: string): Promise<number> {
    return this.prisma.projectCollaborator.count({
      where: { projectId }
    });
  }

  /**
   * Get collaborators by role for a project
   */
  async findByProjectAndRole(projectId: string, role: Role): Promise<CollaboratorWithUser[]> {
    return this.prisma.projectCollaborator.findMany({
      where: {
        projectId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
  }

  /**
   * Check if user has specific permission on a project
   */
  async hasPermission(
    projectId: string, 
    userId: string, 
    permission: 'canEdit' | 'canAddStems' | 'canDeleteStems' | 'canInviteOthers' | 'canExport'
  ): Promise<boolean> {
    const collaborator = await this.prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      },
      select: {
        [permission]: true
      }
    });

    return collaborator?.[permission] || false;
  }
}
