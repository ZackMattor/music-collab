import { Role } from '@prisma/client';
import { CollaborationService, CollaboratorUpdateData } from './CollaborationService';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';

// Create typed mock functions for CollaborationRepository
const mockCollabCreate = jest.fn();
const mockCollabFindByProject = jest.fn();
const mockCollabFindByProjectAndUser = jest.fn();
const mockCollabFindById = jest.fn();
const mockCollabUpdate = jest.fn();
const mockCollabDelete = jest.fn();
const mockCollabUpdateOnlineStatus = jest.fn();
const mockCollabUpdateActivity = jest.fn();
const mockCollabGetCollaboratorCount = jest.fn();
const mockCollabFindByProjectAndRole = jest.fn();
const mockCollabHasPermission = jest.fn();

// Create typed mock functions for UserRepository
const mockUserFindById = jest.fn();
const mockUserFindByEmail = jest.fn();
const mockUserFindMany = jest.fn();
const mockUserCreate = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserDelete = jest.fn();
const mockUserFindWithProjects = jest.fn();
const mockUserFindCollaboratingUsers = jest.fn();

// Create typed mock functions for ProjectRepository
const mockProjectFindById = jest.fn();
const mockProjectFindMany = jest.fn();
const mockProjectCreate = jest.fn();
const mockProjectUpdate = jest.fn();
const mockProjectDelete = jest.fn();
const mockProjectFindByOwner = jest.fn();
const mockProjectFindByCollaborator = jest.fn();
const mockProjectFindWithStems = jest.fn();
const mockProjectFindPublicProjects = jest.fn();
const mockProjectUpdateLastAccessed = jest.fn();

// Mock repositories
const mockCollaborationRepository = {
  create: mockCollabCreate,
  findByProject: mockCollabFindByProject,
  findByProjectAndUser: mockCollabFindByProjectAndUser,
  findById: mockCollabFindById,
  update: mockCollabUpdate,
  delete: mockCollabDelete,
  updateOnlineStatus: mockCollabUpdateOnlineStatus,
  updateActivity: mockCollabUpdateActivity,
  getCollaboratorCount: mockCollabGetCollaboratorCount,
  findByProjectAndRole: mockCollabFindByProjectAndRole,
  hasPermission: mockCollabHasPermission,
} as unknown as CollaborationRepository;

const mockUserRepository = {
  findById: mockUserFindById,
  findByEmail: mockUserFindByEmail,
  findMany: mockUserFindMany,
  create: mockUserCreate,
  update: mockUserUpdate,
  delete: mockUserDelete,
  findWithProjects: mockUserFindWithProjects,
  findCollaboratingUsers: mockUserFindCollaboratingUsers,
} as unknown as UserRepository;

const mockProjectRepository = {
  findById: mockProjectFindById,
  findMany: mockProjectFindMany,
  create: mockProjectCreate,
  update: mockProjectUpdate,
  delete: mockProjectDelete,
  findByOwner: mockProjectFindByOwner,
  findByCollaborator: mockProjectFindByCollaborator,
  findWithStems: mockProjectFindWithStems,
  findPublicProjects: mockProjectFindPublicProjects,
  updateLastAccessed: mockProjectUpdateLastAccessed,
} as unknown as ProjectRepository;

describe('CollaborationService', () => {
  let collaborationService: CollaborationService;

  // Sample data for tests
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    ownerId: 'owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
    isPublic: false,
    lastAccessedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCollaborator = {
    id: 'collab-1',
    projectId: 'project-1',
    userId: 'user-1',
    role: Role.CONTRIBUTOR,
    canEdit: true,
    canAddStems: true,
    canDeleteStems: false,
    canInviteOthers: false,
    canExport: true,
    isOnline: false,
    activity: 'IDLE' as const,
    lastActiveAt: new Date(),
    joinedAt: new Date(),
    user: mockUser,
  };

  beforeEach(() => {
    // Clear all mock functions
    jest.clearAllMocks();
    
    collaborationService = new CollaborationService(
      mockCollaborationRepository,
      mockUserRepository,
      mockProjectRepository
    );
  });

  describe('inviteCollaborator', () => {
    const inviterId = 'inviter-1';
    const projectId = 'project-1';
    const email = 'newuser@example.com';

    beforeEach(() => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockUserFindByEmail.mockResolvedValue(mockUser);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);
    });

    it('should successfully invite a collaborator when inviter is project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: inviterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabCreate.mockResolvedValue(mockCollaborator);

      const result = await collaborationService.inviteCollaborator(
        projectId,
        inviterId,
        email,
        Role.CONTRIBUTOR
      );

      expect(mockProjectFindById).toHaveBeenCalledWith(projectId);
      expect(mockUserFindByEmail).toHaveBeenCalledWith(email);
      expect(mockCollabFindByProjectAndUser).toHaveBeenCalledWith(projectId, mockUser.id);
      expect(mockCollabCreate).toHaveBeenCalledWith({
        projectId,
        userId: mockUser.id,
        role: Role.CONTRIBUTOR,
        canEdit: true,
        canAddStems: true,
        canDeleteStems: false,
        canInviteOthers: false,
        canExport: true,
      });
      expect(result).toBe(mockCollaborator);
    });

    it('should successfully invite a collaborator when inviter has invite permissions', async () => {
      const inviterCollaborator = {
        ...mockCollaborator,
        userId: inviterId,
        canInviteOthers: true,
      };
      mockCollabFindByProjectAndUser
        .mockResolvedValueOnce(inviterCollaborator) // For permission check
        .mockResolvedValueOnce(null); // For existing collaborator check
      mockCollabCreate.mockResolvedValue(mockCollaborator);

      const result = await collaborationService.inviteCollaborator(
        projectId,
        inviterId,
        email,
        Role.VIEWER
      );

      expect(result).toBe(mockCollaborator);
      expect(mockCollabCreate).toHaveBeenCalledWith({
        projectId,
        userId: mockUser.id,
        role: Role.VIEWER,
        canEdit: false,
        canAddStems: false,
        canDeleteStems: false,
        canInviteOthers: false,
        canExport: true,
      });
    });

    it('should throw error when project not found', async () => {
      mockProjectFindById.mockResolvedValue(null);

      await expect(
        collaborationService.inviteCollaborator(projectId, inviterId, email)
      ).rejects.toThrow('Project not found');
    });

    it('should throw error when inviter has insufficient permissions', async () => {
      const inviterCollaborator = {
        ...mockCollaborator,
        userId: inviterId,
        canInviteOthers: false,
      };
      mockCollabFindByProjectAndUser.mockResolvedValue(inviterCollaborator);

      await expect(
        collaborationService.inviteCollaborator(projectId, inviterId, email)
      ).rejects.toThrow('Insufficient permissions to invite collaborators');
    });

    it('should throw error when invited user does not exist', async () => {
      const ownerProject = { ...mockProject, ownerId: inviterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockUserFindByEmail.mockResolvedValue(null);

      await expect(
        collaborationService.inviteCollaborator(projectId, inviterId, email)
      ).rejects.toThrow('User with this email does not exist');
    });

    it('should throw error when user is already a collaborator', async () => {
      const ownerProject = { ...mockProject, ownerId: inviterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);

      await expect(
        collaborationService.inviteCollaborator(projectId, inviterId, email)
      ).rejects.toThrow('User is already a collaborator on this project');
    });

    it('should throw error when trying to invite project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: inviterId };
      const ownerUser = { ...mockUser, id: ownerProject.ownerId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockUserFindByEmail.mockResolvedValue(ownerUser);
      mockCollabFindByProjectAndUser.mockResolvedValue(null); // No existing collaborator

      await expect(
        collaborationService.inviteCollaborator(projectId, inviterId, email)
      ).rejects.toThrow('Project owner is automatically a collaborator');
    });

    it('should apply custom permissions when provided', async () => {
      const ownerProject = { ...mockProject, ownerId: inviterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabCreate.mockResolvedValue(mockCollaborator);

      const customPermissions = {
        canEdit: false,
        canAddStems: false,
        canDeleteStems: true,
      };

      await collaborationService.inviteCollaborator(
        projectId,
        inviterId,
        email,
        Role.CONTRIBUTOR,
        customPermissions
      );

      expect(mockCollabCreate).toHaveBeenCalledWith({
        projectId,
        userId: mockUser.id,
        role: Role.CONTRIBUTOR,
        canEdit: false,
        canAddStems: false,
        canDeleteStems: true,
        canInviteOthers: false,
        canExport: true,
      });
    });
  });

  describe('getProjectCollaborators', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    it('should return collaborators when user is project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: userId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabFindByProject.mockResolvedValue([mockCollaborator]);

      const result = await collaborationService.getProjectCollaborators(projectId, userId);

      expect(mockCollabFindByProject).toHaveBeenCalledWith(projectId);
      expect(result).toEqual([mockCollaborator]);
    });

    it('should return collaborators when user is a collaborator', async () => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);
      mockCollabFindByProject.mockResolvedValue([mockCollaborator]);

      const result = await collaborationService.getProjectCollaborators(projectId, userId);

      expect(result).toEqual([mockCollaborator]);
    });

    it('should throw error when user has no access', async () => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);

      await expect(
        collaborationService.getProjectCollaborators(projectId, userId)
      ).rejects.toThrow('Access denied: You do not have permission to view this project\'s collaborators');
    });
  });

  describe('updateCollaborator', () => {
    const projectId = 'project-1';
    const updaterId = 'updater-1';
    const collaboratorUserId = 'collab-user-1';
    const updateData: CollaboratorUpdateData = {
      role: Role.ADMIN,
      permissions: { canEdit: false }
    };

    beforeEach(() => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);
    });

    it('should successfully update collaborator when updater is project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: updaterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabUpdate.mockResolvedValue({ ...mockCollaborator, role: Role.ADMIN });

      const result = await collaborationService.updateCollaborator(
        projectId,
        updaterId,
        collaboratorUserId,
        updateData
      );

      expect(mockCollabUpdate).toHaveBeenCalledWith(mockCollaborator.id, {
        role: Role.ADMIN,
        permissions: {
          canEdit: false,
          canAddStems: true,
          canDeleteStems: true,
          canInviteOthers: true,
          canExport: true,
        }
      });
      expect(result.role).toBe(Role.ADMIN);
    });

    it('should successfully update collaborator when updater is admin', async () => {
      const adminCollaborator = { ...mockCollaborator, userId: updaterId, role: Role.ADMIN };
      mockCollabFindByProjectAndUser
        .mockResolvedValueOnce(adminCollaborator) // For permission check
        .mockResolvedValueOnce(mockCollaborator); // For existing collaborator check
      mockCollabUpdate.mockResolvedValue({ ...mockCollaborator, role: Role.ADMIN });

      const result = await collaborationService.updateCollaborator(
        projectId,
        updaterId,
        collaboratorUserId,
        updateData
      );

      expect(result.role).toBe(Role.ADMIN);
    });

    it('should throw error when updater has insufficient permissions', async () => {
      const contributorUpdater = { ...mockCollaborator, userId: updaterId, role: Role.CONTRIBUTOR };
      mockCollabFindByProjectAndUser.mockResolvedValue(contributorUpdater);

      await expect(
        collaborationService.updateCollaborator(projectId, updaterId, collaboratorUserId, updateData)
      ).rejects.toThrow('Insufficient permissions to update collaborators');
    });

    it('should throw error when collaborator not found', async () => {
      const ownerProject = { ...mockProject, ownerId: updaterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);

      await expect(
        collaborationService.updateCollaborator(projectId, updaterId, collaboratorUserId, updateData)
      ).rejects.toThrow('Collaborator not found on this project');
    });

    it('should throw error when trying to update project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: updaterId };
      const ownerCollaborator = { ...mockCollaborator, userId: ownerProject.ownerId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      // Set up the collaborator to exist (to pass the existence check) but then check owner logic
      mockCollabFindByProjectAndUser.mockResolvedValue(ownerCollaborator);

      await expect(
        collaborationService.updateCollaborator(projectId, updaterId, ownerProject.ownerId, updateData)
      ).rejects.toThrow('Cannot update project owner as collaborator');
    });
  });

  describe('removeCollaborator', () => {
    const projectId = 'project-1';
    const removerId = 'remover-1';
    const collaboratorUserId = 'collab-user-1';

    beforeEach(() => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);
    });

    it('should successfully remove collaborator when remover is project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: removerId };
      mockProjectFindById.mockResolvedValue(ownerProject);

      await collaborationService.removeCollaborator(projectId, removerId, collaboratorUserId);

      expect(mockCollabDelete).toHaveBeenCalledWith(mockCollaborator.id);
    });

    it('should successfully remove collaborator when remover is admin', async () => {
      const adminCollaborator = { ...mockCollaborator, userId: removerId, role: Role.ADMIN };
      mockCollabFindByProjectAndUser
        .mockResolvedValueOnce(adminCollaborator) // For permission check
        .mockResolvedValueOnce(mockCollaborator); // For existing collaborator check

      await collaborationService.removeCollaborator(projectId, removerId, collaboratorUserId);

      expect(mockCollabDelete).toHaveBeenCalledWith(mockCollaborator.id);
    });

    it('should throw error when remover has insufficient permissions', async () => {
      const contributorRemover = { ...mockCollaborator, userId: removerId, role: Role.CONTRIBUTOR };
      mockCollabFindByProjectAndUser.mockResolvedValue(contributorRemover);

      await expect(
        collaborationService.removeCollaborator(projectId, removerId, collaboratorUserId)
      ).rejects.toThrow('Insufficient permissions to remove collaborators');
    });

    it('should throw error when trying to remove project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: removerId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      // Mock empty collaborator check for permission check, then mock non-empty for existence check
      mockCollabFindByProjectAndUser
        .mockResolvedValueOnce(null) // For permission check - owner doesn't need collaborator record
        .mockResolvedValueOnce(mockCollaborator); // For collaborator existence check

      await expect(
        collaborationService.removeCollaborator(projectId, removerId, ownerProject.ownerId)
      ).rejects.toThrow('Cannot remove project owner as collaborator');
    });

    it('should throw error when collaborator not found', async () => {
      const ownerProject = { ...mockProject, ownerId: removerId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);

      await expect(
        collaborationService.removeCollaborator(projectId, removerId, collaboratorUserId)
      ).rejects.toThrow('Collaborator not found on this project');
    });
  });

  describe('leaveProject', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    it('should successfully leave project when user is a collaborator', async () => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);

      await collaborationService.leaveProject(projectId, userId);

      expect(mockCollabDelete).toHaveBeenCalledWith(mockCollaborator.id);
    });

    it('should throw error when user is project owner', async () => {
      const ownerProject = { ...mockProject, ownerId: userId };
      mockProjectFindById.mockResolvedValue(ownerProject);

      await expect(
        collaborationService.leaveProject(projectId, userId)
      ).rejects.toThrow('Project owner cannot leave the project');
    });

    it('should throw error when user is not a collaborator', async () => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);

      await expect(
        collaborationService.leaveProject(projectId, userId)
      ).rejects.toThrow('You are not a collaborator on this project');
    });
  });

  describe('getCollaboratorPermissions', () => {
    const projectId = 'project-1';
    const requesterId = 'requester-1';
    const collaboratorUserId = 'collab-user-1';

    it('should return permissions when requester has access', async () => {
      const ownerProject = { ...mockProject, ownerId: requesterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);

      const result = await collaborationService.getCollaboratorPermissions(
        projectId,
        requesterId,
        collaboratorUserId
      );

      expect(result).toEqual({
        role: mockCollaborator.role,
        permissions: {
          canEdit: mockCollaborator.canEdit,
          canAddStems: mockCollaborator.canAddStems,
          canDeleteStems: mockCollaborator.canDeleteStems,
          canInviteOthers: mockCollaborator.canInviteOthers,
          canExport: mockCollaborator.canExport,
        }
      });
    });

    it('should throw error when requester has no access', async () => {
      mockProjectFindById.mockResolvedValue(mockProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);

      await expect(
        collaborationService.getCollaboratorPermissions(projectId, requesterId, collaboratorUserId)
      ).rejects.toThrow('Access denied: You do not have permission to view permissions');
    });

    it('should throw error when collaborator not found', async () => {
      const ownerProject = { ...mockProject, ownerId: requesterId };
      mockProjectFindById.mockResolvedValue(ownerProject);
      mockCollabFindByProjectAndUser.mockResolvedValue(null);

      await expect(
        collaborationService.getCollaboratorPermissions(projectId, requesterId, collaboratorUserId)
      ).rejects.toThrow('Collaborator not found on this project');
    });
  });

  describe('getDefaultPermissionsForRole', () => {
    it('should return correct permissions for VIEWER role', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = collaborationService as any;
      const permissions = service.getDefaultPermissionsForRole(Role.VIEWER);

      expect(permissions).toEqual({
        canEdit: false,
        canAddStems: false,
        canDeleteStems: false,
        canInviteOthers: false,
        canExport: true,
      });
    });

    it('should return correct permissions for CONTRIBUTOR role', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = collaborationService as any;
      const permissions = service.getDefaultPermissionsForRole(Role.CONTRIBUTOR);

      expect(permissions).toEqual({
        canEdit: true,
        canAddStems: true,
        canDeleteStems: false,
        canInviteOthers: false,
        canExport: true,
      });
    });

    it('should return correct permissions for ADMIN role', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = collaborationService as any;
      const permissions = service.getDefaultPermissionsForRole(Role.ADMIN);

      expect(permissions).toEqual({
        canEdit: true,
        canAddStems: true,
        canDeleteStems: true,
        canInviteOthers: true,
        canExport: true,
      });
    });
  });

  describe('private methods', () => {
    const projectId = 'project-1';
    const userId = 'user-1';

    describe('hasProjectAccess', () => {
      it('should return true when user is project owner', async () => {
        const ownerProject = { ...mockProject, ownerId: userId };
        mockProjectFindById.mockResolvedValue(ownerProject);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasProjectAccess(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return true when user is a collaborator', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        mockCollabFindByProjectAndUser.mockResolvedValue(mockCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasProjectAccess(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return false when project not found', async () => {
        mockProjectFindById.mockResolvedValue(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasProjectAccess(projectId, userId);

        expect(result).toBe(false);
      });

      it('should return false when user has no access', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        mockCollabFindByProjectAndUser.mockResolvedValue(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasProjectAccess(projectId, userId);

        expect(result).toBe(false);
      });
    });

    describe('hasCollaboratorInvitePermission', () => {
      it('should return true when user is project owner', async () => {
        const ownerProject = { ...mockProject, ownerId: userId };
        mockProjectFindById.mockResolvedValue(ownerProject);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorInvitePermission(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return true when collaborator has invite permissions', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        const inviteCollaborator = { ...mockCollaborator, canInviteOthers: true };
        mockCollabFindByProjectAndUser.mockResolvedValue(inviteCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorInvitePermission(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return false when collaborator has no invite permissions', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        const noInviteCollaborator = { ...mockCollaborator, canInviteOthers: false };
        mockCollabFindByProjectAndUser.mockResolvedValue(noInviteCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorInvitePermission(projectId, userId);

        expect(result).toBe(false);
      });
    });

    describe('hasCollaboratorUpdatePermission', () => {
      it('should return true when user is project owner', async () => {
        const ownerProject = { ...mockProject, ownerId: userId };
        mockProjectFindById.mockResolvedValue(ownerProject);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorUpdatePermission(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return true when collaborator is admin', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        const adminCollaborator = { ...mockCollaborator, role: Role.ADMIN };
        mockCollabFindByProjectAndUser.mockResolvedValue(adminCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorUpdatePermission(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return false when collaborator is not admin', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        const contributorCollaborator = { ...mockCollaborator, role: Role.CONTRIBUTOR };
        mockCollabFindByProjectAndUser.mockResolvedValue(contributorCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorUpdatePermission(projectId, userId);

        expect(result).toBe(false);
      });
    });

    describe('hasCollaboratorRemovePermission', () => {
      it('should return true when user is project owner', async () => {
        const ownerProject = { ...mockProject, ownerId: userId };
        mockProjectFindById.mockResolvedValue(ownerProject);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorRemovePermission(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return true when collaborator is admin', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        const adminCollaborator = { ...mockCollaborator, role: Role.ADMIN };
        mockCollabFindByProjectAndUser.mockResolvedValue(adminCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorRemovePermission(projectId, userId);

        expect(result).toBe(true);
      });

      it('should return false when collaborator is not admin', async () => {
        mockProjectFindById.mockResolvedValue(mockProject);
        const contributorCollaborator = { ...mockCollaborator, role: Role.CONTRIBUTOR };
        mockCollabFindByProjectAndUser.mockResolvedValue(contributorCollaborator);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = collaborationService as any;
        const result = await service.hasCollaboratorRemovePermission(projectId, userId);

        expect(result).toBe(false);
      });
    });
  });
});
