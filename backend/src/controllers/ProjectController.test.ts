import { Request, Response } from 'express';
import { ProjectController } from './ProjectController';
import { ProjectService } from '../services/ProjectService';
import { Project } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
    createdAt: Date;
  };
}

// Mock ProjectService
const mockProjectService = {
  getUserProjects: jest.fn(),
  getOwnedProjects: jest.fn(),
  getPublicProjects: jest.fn(),
  getProjectById: jest.fn(),
  getProjectWithDetails: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  hasProjectAccess: jest.fn(),
} as unknown as ProjectService;

// Mock Response
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('ProjectController', () => {
  let projectController: ProjectController;
  let mockReq: any;
  let mockRes: Response;

  beforeEach(() => {
    projectController = new ProjectController(mockProjectService);
    mockReq = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
      },
      query: {},
      params: {},
      body: {},
    };
    mockRes = mockResponse;
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should get all user projects by default', async () => {
      const mockProjects: Project[] = [
        { id: 'project-1', name: 'Project 1' } as Project,
      ];

      (mockProjectService.getUserProjects as jest.Mock).mockResolvedValue(mockProjects);

      await projectController.getProjects(mockReq as any, mockRes);

      expect(mockProjectService.getUserProjects).toHaveBeenCalledWith('user-1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
        meta: {
          count: 1,
          type: 'all',
          timestamp: expect.any(String),
        },
      });
    });

    it('should get owned projects when type=owned', async () => {
      mockReq.query = { type: 'owned' };
      const mockProjects: Project[] = [
        { id: 'project-1', name: 'Project 1' } as Project,
      ];

      (mockProjectService.getOwnedProjects as jest.Mock).mockResolvedValue(mockProjects);

      await projectController.getProjects(mockReq as any, mockRes);

      expect(mockProjectService.getOwnedProjects).toHaveBeenCalledWith('user-1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
        meta: {
          count: 1,
          type: 'owned',
          timestamp: expect.any(String),
        },
      });
    });

    it('should get public projects when type=public', async () => {
      mockReq.query = { type: 'public' };
      const mockProjects: Project[] = [
        { id: 'project-1', name: 'Public Project' } as Project,
      ];

      (mockProjectService.getPublicProjects as jest.Mock).mockResolvedValue(mockProjects);

      await projectController.getProjects(mockReq as any, mockRes);

      expect(mockProjectService.getPublicProjects).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
        meta: {
          count: 1,
          type: 'public',
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 401 if user not authenticated', async () => {
      delete (mockReq as any).user;

      await projectController.getProjects(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access projects',
      });
    });

    it('should handle service errors', async () => {
      (mockProjectService.getUserProjects as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await projectController.getProjects(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Project retrieval failed',
        message: 'Database error',
      });
    });
  });

  describe('getProject', () => {
    it('should get project by ID', async () => {
      mockReq.params = { projectId: 'project-1' };
      const mockProject: Project = {
        id: 'project-1',
        name: 'Test Project',
      } as Project;

      (mockProjectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      await projectController.getProject(mockReq as any, mockRes);

      expect(mockProjectService.getProjectById).toHaveBeenCalledWith('project-1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    it('should get project with details when includeDetails=true', async () => {
      mockReq.params = { projectId: 'project-1' };
      mockReq.query = { includeDetails: 'true' };
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        stems: [],
        collaborators: [],
      };

      (mockProjectService.getProjectWithDetails as jest.Mock).mockResolvedValue(mockProject);

      await projectController.getProject(mockReq as any, mockRes);

      expect(mockProjectService.getProjectWithDetails).toHaveBeenCalledWith('project-1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 404 if project not found', async () => {
      mockReq.params = { projectId: 'nonexistent' };

      (mockProjectService.getProjectById as jest.Mock).mockResolvedValue(null);

      await projectController.getProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Project not found',
        message: 'The specified project does not exist',
      });
    });
  });

  describe('createProject', () => {
    it('should create project with valid data', async () => {
      mockReq.body = {
        name: 'New Project',
        description: 'A test project',
        tempo: 120,
        isPublic: false,
      };

      const mockProject: Project = {
        id: 'project-1',
        name: 'New Project',
        description: 'A test project',
        tempo: 120,
        isPublic: false,
        ownerId: 'user-1',
      } as Project;

      (mockProjectService.createProject as jest.Mock).mockResolvedValue(mockProject);

      await projectController.createProject(mockReq as any, mockRes);

      expect(mockProjectService.createProject).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'A test project',
        tempo: 120,
        timeSignatureNumerator: undefined,
        timeSignatureDenominator: undefined,
        isPublic: false,
        ownerId: 'user-1',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 400 if name is missing', async () => {
      mockReq.body = { description: 'A project without name' };

      await projectController.createProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Project name is required',
      });
    });

    it('should return 400 for validation errors', async () => {
      mockReq.body = { name: 'Valid Name' };

      (mockProjectService.createProject as jest.Mock).mockRejectedValue(
        new Error('Project name must be 100 characters or less')
      );

      await projectController.createProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Project name must be 100 characters or less',
      });
    });

    it('should return 401 if user not authenticated', async () => {
      delete (mockReq as any).user;
      mockReq.body = { name: 'New Project' };

      await projectController.createProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to create a project',
      });
    });
  });

  describe('updateProject', () => {
    it('should update project with valid data', async () => {
      mockReq.params = { projectId: 'project-1' };
      mockReq.body = {
        name: 'Updated Project',
        tempo: 140,
      };

      const mockProject: Project = {
        id: 'project-1',
        name: 'Updated Project',
        tempo: 140,
      } as Project;

      (mockProjectService.updateProject as jest.Mock).mockResolvedValue(mockProject);

      await projectController.updateProject(mockReq as any, mockRes);

      expect(mockProjectService.updateProject).toHaveBeenCalledWith('project-1', {
        name: 'Updated Project',
        tempo: 140,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle empty description as null', async () => {
      mockReq.params = { projectId: 'project-1' };
      mockReq.body = {
        name: 'Updated Project',
        description: '',
      };

      const mockProject: Project = {
        id: 'project-1',
        name: 'Updated Project',
      } as Project;

      (mockProjectService.updateProject as jest.Mock).mockResolvedValue(mockProject);

      await projectController.updateProject(mockReq as any, mockRes);

      expect(mockProjectService.updateProject).toHaveBeenCalledWith('project-1', {
        name: 'Updated Project',
        description: null,
      });
    });

    it('should return 400 for validation errors', async () => {
      mockReq.params = { projectId: 'project-1' };
      mockReq.body = { name: 'Valid Name' };

      (mockProjectService.updateProject as jest.Mock).mockRejectedValue(
        new Error('Project name cannot be empty')
      );

      await projectController.updateProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Project name cannot be empty',
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      mockReq.params = { projectId: 'project-1' };

      const mockProject: Project = {
        id: 'project-1',
        name: 'Deleted Project',
      } as Project;

      (mockProjectService.deleteProject as jest.Mock).mockResolvedValue(mockProject);

      await projectController.deleteProject(mockReq as any, mockRes);

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith('project-1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 'project-1',
          name: 'Deleted Project',
          deletedAt: expect.any(String),
        },
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 401 if user not authenticated', async () => {
      delete (mockReq as any).user;
      mockReq.params = { projectId: 'project-1' };

      await projectController.deleteProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to delete a project',
      });
    });

    it('should handle service errors', async () => {
      mockReq.params = { projectId: 'project-1' };

      (mockProjectService.deleteProject as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await projectController.deleteProject(mockReq as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Project deletion failed',
        message: 'Database error',
      });
    });
  });
});
