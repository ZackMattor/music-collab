import { CollaborationController } from './CollaborationController';
import { CollaborationService } from '../services/CollaborationService';
import { AuthenticatedRequest, TypedResponse } from '../types/express';
import { Role } from '@prisma/client';

// Mock the CollaborationService
const mockInviteCollaborator = jest.fn();
const mockGetProjectCollaborators = jest.fn();
const mockUpdateCollaborator = jest.fn();
const mockRemoveCollaborator = jest.fn();
const mockLeaveProject = jest.fn();
const mockGetCollaboratorPermissions = jest.fn();

const mockCollaborationService = {
  inviteCollaborator: mockInviteCollaborator,
  getProjectCollaborators: mockGetProjectCollaborators,
  updateCollaborator: mockUpdateCollaborator,
  removeCollaborator: mockRemoveCollaborator,
  leaveProject: mockLeaveProject,
  getCollaboratorPermissions: mockGetCollaboratorPermissions,
} as unknown as CollaborationService;

describe('CollaborationController', () => {
  let collaborationController: CollaborationController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<TypedResponse>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    collaborationController = new CollaborationController(mockCollaborationService);

    // Setup mock request with authenticated user
    mockRequest = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      params: {
        projectId: 'project-1',
        userId: 'user-2'
      },
      body: {}
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('inviteCollaborator', () => {
    it('should successfully invite a collaborator', async () => {
      const mockCollaborator = {
        id: 'collab-1',
        projectId: 'project-1',
        userId: 'user-2',
        role: Role.CONTRIBUTOR,
        canEdit: true,
        canAddStems: true,
        canDeleteStems: false,
        canInviteOthers: false,
        canExport: true,
        user: {
          id: 'user-2',
          email: 'collaborator@example.com',
          displayName: 'Collaborator',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockRequest.body = {
        email: 'collaborator@example.com',
        role: Role.CONTRIBUTOR
      };

      mockInviteCollaborator.mockResolvedValue(mockCollaborator);

      await collaborationController.inviteCollaborator(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockInviteCollaborator).toHaveBeenCalledWith(
        'project-1',
        'user-1',
        'collaborator@example.com',
        Role.CONTRIBUTOR,
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCollaborator,
        message: 'Collaborator invitation sent successfully'
      });
    });

    it('should return 400 for missing email', async () => {
      mockRequest.body = { role: Role.CONTRIBUTOR };

      await collaborationController.inviteCollaborator(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Email is required to invite a collaborator'
      });
    });

    it('should return 400 for invalid role', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        role: 'INVALID_ROLE'
      };

      await collaborationController.inviteCollaborator(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Invalid role. Must be VIEWER, CONTRIBUTOR, or ADMIN'
      });
    });

    it('should handle service errors appropriately', async () => {
      mockRequest.body = {
        email: 'collaborator@example.com',
        role: Role.CONTRIBUTOR
      };

      mockInviteCollaborator.mockRejectedValue(new Error('User with this email does not exist'));

      await collaborationController.inviteCollaborator(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not found',
        message: 'User with this email does not exist'
      });
    });
  });

  describe('getCollaborators', () => {
    it('should successfully get project collaborators', async () => {
      const mockCollaborators = [
        {
          id: 'collab-1',
          projectId: 'project-1',
          userId: 'user-2',
          role: Role.CONTRIBUTOR,
          user: {
            id: 'user-2',
            email: 'collaborator@example.com',
            displayName: 'Collaborator',
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ];

      mockGetProjectCollaborators.mockResolvedValue(mockCollaborators);

      await collaborationController.getCollaborators(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockGetProjectCollaborators).toHaveBeenCalledWith('project-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCollaborators,
        meta: {
          count: 1,
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('updateCollaborator', () => {
    it('should successfully update a collaborator', async () => {
      const mockUpdatedCollaborator = {
        id: 'collab-1',
        projectId: 'project-1',
        userId: 'user-2',
        role: Role.ADMIN,
        canInviteOthers: true,
        user: {
          id: 'user-2',
          email: 'collaborator@example.com',
          displayName: 'Collaborator',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockRequest.body = { role: Role.ADMIN };

      mockUpdateCollaborator.mockResolvedValue(mockUpdatedCollaborator);

      await collaborationController.updateCollaborator(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockUpdateCollaborator).toHaveBeenCalledWith(
        'project-1',
        'user-1',
        'user-2',
        { role: Role.ADMIN, permissions: undefined }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCollaborator,
        message: 'Collaborator updated successfully'
      });
    });
  });

  describe('removeCollaborator', () => {
    it('should successfully remove a collaborator', async () => {
      mockRemoveCollaborator.mockResolvedValue(undefined);

      await collaborationController.removeCollaborator(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockRemoveCollaborator).toHaveBeenCalledWith('project-1', 'user-1', 'user-2');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Collaborator removed successfully'
      });
    });
  });

  describe('leaveProject', () => {
    it('should successfully leave a project', async () => {
      mockLeaveProject.mockResolvedValue(undefined);

      await collaborationController.leaveProject(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockLeaveProject).toHaveBeenCalledWith('project-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully left the project'
      });
    });
  });

  describe('getCollaboratorPermissions', () => {
    it('should successfully get collaborator permissions', async () => {
      const mockPermissions = {
        role: Role.CONTRIBUTOR,
        permissions: {
          canEdit: true,
          canAddStems: true,
          canDeleteStems: false,
          canInviteOthers: false,
          canExport: true
        }
      };

      mockGetCollaboratorPermissions.mockResolvedValue(mockPermissions);

      await collaborationController.getCollaboratorPermissions(
        mockRequest as AuthenticatedRequest,
        mockResponse as TypedResponse
      );

      expect(mockGetCollaboratorPermissions).toHaveBeenCalledWith('project-1', 'user-1', 'user-2');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPermissions,
        timestamp: expect.any(String)
      });
    });
  });

  describe('authentication middleware', () => {
    it('should return 401 if no user is authenticated', async () => {
      const mockRequestNoAuth = {
        ...mockRequest,
        user: undefined
      } as unknown as AuthenticatedRequest;

      await collaborationController.inviteCollaborator(
        mockRequestNoAuth,
        mockResponse as TypedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to invite collaborators'
      });
    });
  });
});
